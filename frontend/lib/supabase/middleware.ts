import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Create a Supabase client for use in Next.js middleware.
 *
 * Handles cookie read/write through the request/response objects.
 * Returns both the supabase client and the modified response.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
    // Create an unmodified response to start
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Set cookies on the request (for downstream middleware/server)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Recreate the response with updated request
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    // Set cookies on the response (for the browser)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
            db: {
                schema: 'public'
            }
        }
    );

    return { supabase, response: supabaseResponse };
}
