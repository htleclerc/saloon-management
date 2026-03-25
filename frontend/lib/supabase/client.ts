import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing. Mode demo-supabase will not work.');
}

/**
 * Supabase Browser Client (with auth session via cookies)
 *
 * Uses @supabase/ssr for proper cookie-based session management.
 * Used in client components for authenticated requests.
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
        db: {
            schema: 'public'
        }
    })
    : (() => {
        console.error('❌ Supabase credentials missing. Please check .env.local');
        return new Proxy({}, {
            get: () => { throw new Error('Supabase client not initialized. Missing env vars.'); }
        }) as ReturnType<typeof createClient>;
    })();

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}
