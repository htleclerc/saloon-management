/**
 * Booking Domain Rules
 * 
 * Centralized business logic for bookings
 */

import { Booking, BookingStatus } from '@/types';

/**
 * Validates if a booking can transition to a new status
 */
export const canTransitionBookingStatus = (currentStatus: BookingStatus, newStatus: BookingStatus): boolean => {
    const transitions: Record<BookingStatus, BookingStatus[]> = {
        'Created': ['Pending', 'Cancelled', 'Confirmed'],
        'Pending': ['Confirmed', 'Cancelled', 'PendingApproval'],
        'PendingApproval': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Started', 'Cancelled', 'Rescheduled'],
        'Started': ['Finished', 'Cancelled'],
        'Finished': ['Closed'],
        'Rescheduled': ['Confirmed', 'Cancelled'],
        'Cancelled': [],
        'Closed': []
    };

    return transitions[currentStatus]?.includes(newStatus) ?? false;
};

/**
 * Checks if a booking can be cancelled (e.g., at least 24h before)
 */
export const canCancelBooking = (bookingDate: string, bookingTime: string): { can: boolean; reason?: string } => {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();
    const diffInHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
        return {
            can: false,
            reason: 'Cancellations must be made at least 24 hours in advance'
        };
    }

    if (diffInHours <= 0) {
        return { can: false, reason: 'Cannot cancel an appointment in the past' };
    }

    return { can: true };
};
