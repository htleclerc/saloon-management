/**
 * Supabase Error Handler
 *
 * Centralized error handling for the Supabase data provider.
 * Logs errors consistently and provides configurable behavior
 * (throw vs. return fallback) depending on the operation context.
 */

export type ErrorSeverity = 'critical' | 'warning' | 'info';

interface SupabaseErrorContext {
    operation: string;
    table?: string;
    params?: Record<string, unknown>;
}

/**
 * Log a Supabase error with structured context.
 * In development mode, logs full details. In production, could send to monitoring.
 */
export function logSupabaseError(
    error: { message: string; code?: string; details?: string; hint?: string },
    context: SupabaseErrorContext,
    severity: ErrorSeverity = 'warning'
): void {
    const timestamp = new Date().toISOString();
    const prefix = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';

    console.error(
        `${prefix} [Supabase ${severity.toUpperCase()}] ${context.operation}`,
        {
            timestamp,
            table: context.table,
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            params: context.params
        }
    );
}

/**
 * Handle a Supabase query error.
 * For read operations: logs and returns fallback value.
 * For write operations: logs and throws.
 */
export function handleQueryError<T>(
    error: { message: string; code?: string; details?: string; hint?: string },
    context: SupabaseErrorContext,
    options: { fallback: T; throwOnError?: boolean }
): T {
    const severity: ErrorSeverity = options.throwOnError ? 'critical' : 'warning';
    logSupabaseError(error, context, severity);

    if (options.throwOnError) {
        throw new Error(`[${context.operation}] ${error.message}`);
    }

    return options.fallback;
}

/**
 * Validate a numeric ID parameter, logging a warning and returning false if invalid.
 */
export function validateId(id: number, context: string): boolean {
    if (isNaN(id) || id <= 0) {
        console.warn(`${context}: invalid ID ${id}`);
        return false;
    }
    return true;
}

/**
 * Validate a salonId parameter with consistent logging.
 */
export function validateSalonId(salonId: number, context: string): boolean {
    if (isNaN(salonId) || salonId <= 0) {
        console.warn(`${context}: invalid salonId ${salonId}`);
        return false;
    }
    return true;
}
