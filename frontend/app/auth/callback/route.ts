import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const callbackParamsSchema = z.object({
    code: z.string().min(1).optional(),
    type: z.enum(['recovery', 'signup', 'magiclink', 'invite']).optional(),
    next: z.string().optional(),
});

/**
 * Auth Callback Route Handler
 *
 * Handles OAuth redirects and email confirmation links from Supabase Auth.
 * After exchanging the code for a session, links the Supabase Auth user
 * to the application's users table.
 *
 * Flow:
 * - New user (no app record) → create user → redirect to /onboarding/setup
 * - Existing user by email (invited member) → link auth_id → redirect to /
 * - Existing user by auth_id → update last_login → check if has salon → redirect accordingly
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    const parsed = callbackParamsSchema.safeParse({
        code: searchParams.get('code') ?? undefined,
        type: searchParams.get('type') ?? undefined,
        next: searchParams.get('next') ?? undefined,
    });

    if (!parsed.success) {
        console.error('Invalid callback params:', parsed.error.flatten());
        return NextResponse.redirect(`${origin}/login?error=invalid_callback`);
    }

    const { code, type } = parsed.data;

    if (code) {
        const supabase = await createSupabaseServerClient();

        // Exchange the auth code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Auth callback error:', exchangeError.message);
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
        }

        // If this is a password recovery, redirect to reset password page
        if (type === 'recovery') {
            return NextResponse.redirect(`${origin}/auth/reset-password`);
        }

        // Get the authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
            // Check if application user exists with this auth_id
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', authUser.id)
                .single();

            if (existingUser) {
                // Existing user → update last login and check if they have a salon
                await supabase
                    .from('users')
                    .update({ last_login_at: new Date().toISOString() })
                    .eq('auth_id', authUser.id);

                return await redirectBasedOnSalons(supabase, existingUser.id, origin, authUser);
            }

            // Check if user exists by email (could be a pre-created/invited user without auth_id)
            const { data: userByEmail } = await supabase
                .from('users')
                .select('id')
                .eq('email', authUser.email)
                .single();

            if (userByEmail) {
                // Invited member → link auth_id and redirect to their salon
                await supabase
                    .from('users')
                    .update({
                        auth_id: authUser.id,
                        last_login_at: new Date().toISOString(),
                        email_verified_at: new Date().toISOString(),
                    })
                    .eq('id', userByEmail.id);

                return await redirectBasedOnSalons(supabase, userByEmail.id, origin, authUser);
            }

            // Brand new user → create application user record
            const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';
            const salonName = authUser.user_metadata?.salon_name || '';

            const userCode = generateUserCode();

            const { error: createError } = await supabase
                .from('users')
                .insert({
                    auth_id: authUser.id,
                    email: authUser.email,
                    first_name: firstName,
                    last_name: lastName,
                    user_code: userCode,
                    role: 'owner',
                    is_active: true,
                    email_verified_at: authUser.email_confirmed_at ? new Date().toISOString() : null,
                    last_login_at: new Date().toISOString(),
                });

            if (createError) {
                console.error('Error creating user record:', createError.message);
                return NextResponse.redirect(`${origin}/login?error=account_creation_failed`);
            }

            // Store salon name in localStorage via a query param for onboarding to pick up
            const onboardingUrl = new URL('/onboarding/setup', origin);
            if (salonName) {
                onboardingUrl.searchParams.set('salonName', salonName);
            }
            return NextResponse.redirect(onboardingUrl.toString());
        }
    }

    // No code provided — invalid callback
    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`);
}

/**
 * Redirect user based on whether they have any salons.
 * - Has salons → redirect to /
 * - No salons → redirect to /onboarding/setup
 */
async function redirectBasedOnSalons(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    userId: number,
    origin: string,
    authUser: { user_metadata?: Record<string, string> }
): Promise<NextResponse> {
    const { data: userSalons } = await supabase
        .from('user_salons')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

    if (userSalons && userSalons.length > 0) {
        // User has salons → go to dashboard
        return NextResponse.redirect(`${origin}/`);
    }

    // No salons → onboarding
    const salonName = authUser.user_metadata?.salon_name || '';
    const onboardingUrl = new URL('/onboarding/setup', origin);
    if (salonName) {
        onboardingUrl.searchParams.set('salonName', salonName);
    }
    return NextResponse.redirect(onboardingUrl.toString());
}

/**
 * Generate a 12-character user code with a check digit.
 */
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
