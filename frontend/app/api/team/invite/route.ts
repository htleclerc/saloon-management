import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/team/invite
 *
 * Invites a team member to a salon. This:
 * 1. Creates a `users` record (if not already existing)
 * 2. Creates a `user_salons` entry linking the user to the salon
 * 3. Sends a Supabase Auth invitation email so they can set their password
 *
 * Required body:
 * - email: string
 * - firstName: string
 * - lastName: string
 * - salonId: number
 * - role: 'Manager' | 'Worker'
 *
 * Optional body:
 * - phone: string
 */
export async function POST(request: NextRequest) {
    try {
        // Verify the caller is authenticated
        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { email, firstName, lastName, salonId, role, phone } = body;

        if (!email || !firstName || !salonId || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: email, firstName, salonId, role' },
                { status: 400 }
            );
        }

        if (!['Manager', 'Worker'].includes(role)) {
            return NextResponse.json(
                { error: 'Role must be Manager or Worker' },
                { status: 400 }
            );
        }

        // Verify caller has permission (must be owner/manager of this salon)
        // First try by auth_id, then fallback by email (demo mode)
        let callerUser: { id: number; role: string } | null = null;

        const { data: callerByAuth } = await supabase
            .from('users')
            .select('id, role')
            .eq('auth_id', authUser.id)
            .single();

        if (callerByAuth) {
            callerUser = callerByAuth;
        } else if (authUser.email) {
            // Fallback: match by email (useful in demo mode where auth_id may not be linked)
            const { data: callerByEmail } = await supabase
                .from('users')
                .select('id, role')
                .eq('email', authUser.email)
                .single();
            callerUser = callerByEmail;
        }

        if (!callerUser) {
            return NextResponse.json(
                { error: 'Caller user not found' },
                { status: 403 }
            );
        }

        // Check caller has access to this salon
        const { data: callerSalon } = await supabase
            .from('user_salons')
            .select('role_in_salon')
            .eq('user_id', callerUser.id)
            .eq('salon_id', salonId)
            .eq('is_active', true)
            .single();

        const isOwnerOrAdmin = callerUser.role === 'owner' || callerUser.role === 'super_admin';
        const isManagerInSalon = callerSalon?.role_in_salon === 'Manager';

        if (!isOwnerOrAdmin && !isManagerInSalon) {
            return NextResponse.json(
                { error: 'You do not have permission to invite members to this salon' },
                { status: 403 }
            );
        }

        // Generate user code
        const userCode = generateUserCode();

        // Step 1: Check if user already exists by email
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        let userId: number;

        if (existingUser) {
            userId = existingUser.id;
        } else {
            // Create the users table record
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    email,
                    first_name: firstName,
                    last_name: lastName || '',
                    phone: phone || null,
                    user_code: userCode,
                    role: role === 'Manager' ? 'manager' : 'worker',
                    is_active: true,
                })
                .select('id')
                .single();

            if (createError || !newUser) {
                console.error('Error creating user record:', createError?.message);
                return NextResponse.json(
                    { error: 'Failed to create user record' },
                    { status: 500 }
                );
            }

            userId = newUser.id;
        }

        // Step 2: Check if user_salons entry already exists
        const { data: existingUserSalon } = await supabase
            .from('user_salons')
            .select('id')
            .eq('user_id', userId)
            .eq('salon_id', salonId)
            .single();

        if (!existingUserSalon) {
            // Create user_salons entry
            const { error: linkError } = await supabase
                .from('user_salons')
                .insert({
                    user_id: userId,
                    salon_id: salonId,
                    role_in_salon: role,
                    is_active: true,
                });

            if (linkError) {
                console.error('Error linking user to salon:', linkError.message);
                return NextResponse.json(
                    { error: 'Failed to link user to salon' },
                    { status: 500 }
                );
            }
        }

        // Step 2b: Create a worker record so they appear in team lists
        const { data: existingWorker } = await supabase
            .from('workers')
            .select('id')
            .eq('user_id', userId)
            .eq('salon_id', salonId)
            .single();

        if (!existingWorker) {
            const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const { error: workerError } = await supabase
                .from('workers')
                .insert({
                    salon_id: salonId,
                    user_id: userId,
                    name: `${firstName} ${lastName || ''}`.trim(),
                    email,
                    phone: phone || null,
                    color: randomColor,
                    sharing_key: 50,
                    status: 'Active',
                    is_active: true,
                    employee_role: role,
                    created_by: callerUser.id.toString(),
                    updated_by: callerUser.id.toString(),
                });

            if (workerError) {
                console.error('Error creating worker record:', workerError.message);
                // Non-fatal: user + salon link already created
            }
        }

        // Step 3: Send Supabase Auth invitation email
        // This creates an auth user and sends a magic link to set their password
        let inviteSent = false;
        try {
            const adminClient = createSupabaseAdmin();

            // Check if auth user already exists
            const { data: authUsers } = await adminClient.auth.admin.listUsers();
            const existingAuthUser = authUsers?.users?.find(
                (u: { email?: string }) => u.email === email
            );

            if (!existingAuthUser) {
                const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
                    data: {
                        full_name: `${firstName} ${lastName || ''}`.trim(),
                        invited_to_salon: salonId,
                    },
                    redirectTo: `${request.nextUrl.origin}/auth/callback`,
                });

                if (inviteError) {
                    console.warn('Could not send invite email:', inviteError.message);
                } else {
                    inviteSent = true;

                    // Link the auth_id to our users table
                    if (inviteData?.user?.id) {
                        await supabase
                            .from('users')
                            .update({ auth_id: inviteData.user.id })
                            .eq('id', userId);
                    }
                }
            } else {
                // Auth user already exists — just link if needed
                if (!existingUser) {
                    await supabase
                        .from('users')
                        .update({ auth_id: existingAuthUser.id })
                        .eq('id', userId);
                }
                inviteSent = false; // They can already sign in
            }
        } catch (adminError) {
            // Service role key might not be configured — invitation email won't be sent
            // but the user record + salon link are created, so manual signup will work
            console.warn('Admin invite failed (service_role key may be missing):', adminError);
        }

        // Step 4: Send custom welcome email via Brevo (non-blocking)
        let brevoSent = false;
        try {
            const { getEmailService } = await import('@/lib/email/service');
            const { isEmailConfigured } = await import('@/lib/email/config');

            if (isEmailConfigured()) {
                // Fetch salon name for the email template
                const { data: salonData } = await supabase
                    .from('salons')
                    .select('name')
                    .eq('id', salonId)
                    .single();

                const emailService = getEmailService();
                const result = await emailService.send({
                    to: [{ email, name: `${firstName} ${lastName || ''}`.trim() }],
                    templateId: 'team-invitation',
                    locale: (body.locale as 'en' | 'fr' | 'es') || 'en',
                    params: {
                        firstName,
                        salonName: salonData?.name || 'Your Salon',
                        role,
                        inviteUrl: `${request.nextUrl.origin}/auth/callback`,
                    },
                });
                brevoSent = result.success;
            }
        } catch (emailError) {
            console.warn('[invite] Brevo email failed (non-fatal):', emailError);
        }

        return NextResponse.json({
            success: true,
            userId,
            inviteSent,
            brevoSent,
            message: inviteSent || brevoSent
                ? 'Invitation email sent. The team member can set their password via the link.'
                : 'Team member added. They can sign up with their email to access the salon.',
        });

    } catch (error) {
        console.error('Invite API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateUserCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'USR';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    code += chars.charAt(sum % 36);
    return code;
}
