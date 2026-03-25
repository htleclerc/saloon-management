/**
 * BOOKING STATUS CONSTANTS
 *
 * Use these codes for all comparisons, DB storage, and API calls.
 * Never compare status with raw strings like === 'Confirmed'.
 * Display the label via `getBookingStatusLabel(status, t)`.
 */

// ─── Enum-like object ────────────────────────────────────────────────────────

export const BOOKING_STATUS = {
    CREATED: 'Created',
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    STARTED: 'Started',
    FINISHED: 'Finished',
    CANCELLED: 'Cancelled',
    PENDING_APPROVAL: 'PendingApproval',
    RESCHEDULED: 'Rescheduled',
    CLOSED: 'Closed',
    COMPLETED: 'Completed', // UI alias used in filters (maps to Finished)
} as const;

/** Union type derived from enum */
export type BookingStatusCode = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// ─── Status configuration ────────────────────────────────────────────────────

export interface BookingStatusConfig {
    code: string;
    /** i18n key inside "appointments" namespace */
    labelKey: string;
    /** Tailwind/CSS classes for badge */
    colorClasses: string;
}

export const BOOKING_STATUS_CONFIG: Record<string, BookingStatusConfig> = {
    [BOOKING_STATUS.CREATED]: {
        code: BOOKING_STATUS.CREATED,
        labelKey: 'appointments.statusCreated',
        colorClasses: 'bg-gray-100 text-gray-700',
    },
    [BOOKING_STATUS.PENDING]: {
        code: BOOKING_STATUS.PENDING,
        labelKey: 'appointments.statusPending',
        colorClasses: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    },
    [BOOKING_STATUS.CONFIRMED]: {
        code: BOOKING_STATUS.CONFIRMED,
        labelKey: 'appointments.statusConfirmed',
        colorClasses: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    },
    [BOOKING_STATUS.STARTED]: {
        code: BOOKING_STATUS.STARTED,
        labelKey: 'appointments.statusStarted',
        colorClasses: 'bg-blue-100 text-blue-700',
    },
    [BOOKING_STATUS.FINISHED]: {
        code: BOOKING_STATUS.FINISHED,
        labelKey: 'appointments.statusFinished',
        colorClasses: 'bg-blue-100 text-blue-700',
    },
    [BOOKING_STATUS.COMPLETED]: {
        code: BOOKING_STATUS.COMPLETED,
        labelKey: 'appointments.statusCompleted',
        colorClasses: 'bg-blue-100 text-blue-700',
    },
    [BOOKING_STATUS.CANCELLED]: {
        code: BOOKING_STATUS.CANCELLED,
        labelKey: 'appointments.statusCancelled',
        colorClasses: 'bg-[var(--color-error-light)] text-[var(--color-error)]',
    },
    [BOOKING_STATUS.PENDING_APPROVAL]: {
        code: BOOKING_STATUS.PENDING_APPROVAL,
        labelKey: 'appointments.statusPendingApproval',
        colorClasses: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] font-bold animate-pulse',
    },
    [BOOKING_STATUS.RESCHEDULED]: {
        code: BOOKING_STATUS.RESCHEDULED,
        labelKey: 'appointments.statusRescheduled',
        colorClasses: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    },
    [BOOKING_STATUS.CLOSED]: {
        code: BOOKING_STATUS.CLOSED,
        labelKey: 'appointments.statusClosed',
        colorClasses: 'bg-gray-200 text-gray-600',
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the CSS classes for a booking status badge */
export function getBookingStatusColor(status: string): string {
    return BOOKING_STATUS_CONFIG[status]?.colorClasses ?? 'bg-gray-100 text-gray-700';
}

/**
 * Returns the translated label for a booking status.
 * @param status - Booking status code
 * @param t - i18n translation function
 */
export function getBookingStatusLabel(status: string, t: (key: string) => string): string {
    const config = BOOKING_STATUS_CONFIG[status];
    if (!config) return status;
    return t(config.labelKey);
}

/**
 * Statuses available as filter options in the appointments list.
 * Extend/reorder as needed.
 */
export const BOOKING_STATUS_FILTER_OPTIONS: BookingStatusConfig[] = [
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.CONFIRMED],
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.PENDING],
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.PENDING_APPROVAL],
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.RESCHEDULED],
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.COMPLETED],
    BOOKING_STATUS_CONFIG[BOOKING_STATUS.CANCELLED],
];
