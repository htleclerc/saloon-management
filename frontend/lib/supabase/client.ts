import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing. Mode demo-supabase will not work.');
}

/**
 * Supabase Client
 * 
 * Configured for public demo mode with anon key
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // Demo mode - no auth session needed
            autoRefreshToken: false,
        },
        db: {
            schema: 'public'
        }
    })
    : (() => {
        console.error('❌ Supabase credentials missing. Please check .env.local');
        // Return a proxy that throws on any access to prevent silent failures later
        return new Proxy({}, {
            get: () => { throw new Error('Supabase client not initialized. Missing env vars.'); }
        }) as any;
    })();

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}
