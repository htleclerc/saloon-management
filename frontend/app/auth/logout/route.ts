import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Server-side logout route.
 *
 * Clears the Supabase session cookies on the server (HTTP-only cookies
 * that the browser client cannot reliably delete) and redirects to /login.
 */
export async function POST(request: NextRequest) {
    const { origin } = new URL(request.url);

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    // Build a response that redirects to /login
    const response = NextResponse.redirect(`${origin}/login`, { status: 302 });

    // Aggressively clear all Supabase auth cookies
    const cookieNames = request.cookies.getAll().map(c => c.name);
    for (const name of cookieNames) {
        if (name.startsWith('sb-') || name.includes('supabase')) {
            response.cookies.set(name, '', { maxAge: 0, path: '/' });
        }
    }

    // Also clear the demo cookie
    response.cookies.set('workshop-demo-active', '', { maxAge: 0, path: '/' });

    return response;
}
