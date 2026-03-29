import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const changeRoleSchema = z.object({
    workerId: z.number(),
    salonId: z.number(),
    newRole: z.enum(['Manager', 'Worker']),
});

/**
 * POST /api/team/change-role
 *
 * Changes a team member's role (Manager ↔ Worker).
 * Synchronizes both `workers.employee_role` AND `user_salons.role_in_salon`.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = changeRoleSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
        }

        const { workerId, salonId, newRole } = parsed.data;

        // Verify the caller has permission (must be owner or manager of the salon)
        const { data: callerUser } = await supabase
            .from('users')
            .select('id, role')
            .eq('auth_id', authUser.id)
            .single();

        if (!callerUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only owners and super_admins can change roles
        if (!['owner', 'super_admin'].includes(callerUser.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Get the worker to find their user_id
        const { data: worker } = await supabase
            .from('workers')
            .select('id, user_id, employee_role, name')
            .eq('id', workerId)
            .single();

        if (!worker) {
            return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
        }

        // 1. Update workers.employee_role
        const { error: workerError } = await supabase
            .from('workers')
            .update({ employee_role: newRole, updated_at: new Date().toISOString() })
            .eq('id', workerId);

        if (workerError) {
            console.error('Failed to update worker role:', workerError);
            return NextResponse.json({ error: 'Failed to update worker role' }, { status: 500 });
        }

        // 2. Update user_salons.role_in_salon (if user_id exists)
        if (worker.user_id) {
            const { error: userSalonError } = await supabase
                .from('user_salons')
                .update({ role_in_salon: newRole })
                .eq('user_id', worker.user_id)
                .eq('salon_id', salonId);

            if (userSalonError) {
                console.warn('Failed to update user_salons role (may not have entry):', userSalonError);
            }
        }

        // 3. Also update users.role if they have one
        if (worker.user_id) {
            const roleMap: Record<string, string> = { 'Manager': 'manager', 'Worker': 'worker' };
            await supabase
                .from('users')
                .update({ role: roleMap[newRole] || 'worker' })
                .eq('id', worker.user_id);
        }

        return NextResponse.json({
            success: true,
            worker: { id: workerId, name: worker.name, newRole },
        });
    } catch (error) {
        console.error('Change role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
