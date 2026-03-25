import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Public routes that don't require authentication.
 */
const PUBLIC_ROUTES = [
    '/login',
    '/auth/callback',
    '/auth/logout',
    '/auth/reset-password',
    '/onboarding',
    '/downloads/invoice',
    '/salons/discover',
];

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes (they handle their own auth)
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Create Supabase middleware client inline (avoids path alias issues with Edge runtime)
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Always call getUser() to refresh the session cookies.
    const { data: { user } } = await supabase.auth.getUser();

    // Check for demo mode cookie (set by demo login flow)
    const isDemoMode = request.cookies.has('workshop-demo-active');

    const isAuthenticated = !!user || isDemoMode;

    // If authenticated user tries to access /login, redirect to home
    if (isAuthenticated && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // If not authenticated and accessing a protected route, redirect to /login
    if (!isAuthenticated && !isPublicRoute(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
