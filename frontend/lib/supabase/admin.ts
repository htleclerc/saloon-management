import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client (Server-side only)
 *
 * Uses the service_role key for admin operations like:
 * - Inviting users via email (auth.admin.inviteUserByEmail)
 * - Managing auth users
 * - Bypassing RLS for admin queries
 *
 * NEVER expose this on the client side.
 */
export function createSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for admin operations.'
        );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        db: {
            schema: 'public',
        },
    });
}
