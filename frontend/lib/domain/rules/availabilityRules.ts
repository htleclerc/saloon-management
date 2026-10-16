/**
 * Availability Rules
 *
 * Pure functions that compute bookable time slots for a salon day from its
 * opening hours, slot interval, existing bookings and stylists.
 * Used by the public booking API (server side) and testable without any IO.
 */

import type { OpeningHours } from '@/types';

export interface AvailabilityBooking {
    id?: number;
    time: string;        // HH:mm
    duration: number;    // minutes
    workerIds: number[]; // empty = "any stylist" (consumes one unit of capacity)
    status: string;
}

export interface AvailabilityInput {
    /** Day to compute, YYYY-MM-DD */
    date: string;
    openingHours: OpeningHours[];
    /** Minutes between two proposed start times (5, 10, 15, 30...) */
    slotInterval: number;
    /** Duration of the service(s) + extras requested, in minutes */
    duration: number;
    bookings: AvailabilityBooking[];
    /** Active stylists of the salon */
    workerIds: number[];
    /** Stylist chosen by the client, undefined = any stylist */
    requestedWorkerId?: number;
    /** Current time, to hide slots in the past (optional) */
    now?: Date;
    /** Minimum notice before a slot can be booked, in minutes (default 60) */
    minLeadMinutes?: number;
    /** Latest start time allowed (HH:mm), e.g. "17:30" (optional) */
    lastStartTime?: string;
}

export interface AvailabilitySlot {
    time: string;
    available: boolean;
    /** Stylists free for the whole duration (empty when none, or when the salon has no stylist) */
    freeWorkerIds: number[];
}

const INACTIVE_STATUSES = ['Cancelled', 'Closed'];

export const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};

export const toTimeString = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/** Weekday name (monday...sunday) of a YYYY-MM-DD date, computed in UTC to avoid timezone drift */
export const weekdayOf = (date: string): OpeningHours['day'] => {
    const [y, m, d] = date.split('-').map(Number);
    const names: OpeningHours['day'][] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return names[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean =>
    aStart < bEnd && aEnd > bStart;

/**
 * Compute the proposed start times of a day and whether each one can be booked.
 */
export const computeAvailability = (input: AvailabilityInput): AvailabilitySlot[] => {
    const interval = Math.max(5, Math.round(input.slotInterval || 30));
    const duration = Math.max(interval, Math.round(input.duration || interval));
    const day = input.openingHours.find(oh => oh.day === weekdayOf(input.date));
    if (!day || !day.isOpen) return [];

    const open = toMinutes(day.openTime);
    const close = toMinutes(day.closeTime);
    if (close <= open) return [];

    const lastStart = input.lastStartTime ? Math.min(close, toMinutes(input.lastStartTime)) : close;
    const activeBookings = input.bookings.filter(b => !INACTIVE_STATUSES.includes(b.status));
    const capacity = Math.max(1, input.workerIds.length);

    // Slots in the past (today) are hidden
    let minStart = -1;
    if (input.now) {
        const todayStr = `${input.now.getFullYear()}-${(input.now.getMonth() + 1).toString().padStart(2, '0')}-${input.now.getDate().toString().padStart(2, '0')}`;
        if (todayStr === input.date) {
            minStart = input.now.getHours() * 60 + input.now.getMinutes() + (input.minLeadMinutes ?? 60);
        } else if (todayStr > input.date) {
            return [];
        }
    }

    const slots: AvailabilitySlot[] = [];
    for (let start = open; start + duration <= close && start <= lastStart; start += interval) {
        if (start < minStart) continue;
        const end = start + duration;

        const busyWorkers = new Set<number>();
        let poolBookings = 0;
        for (const b of activeBookings) {
            const bStart = toMinutes(b.time);
            const bEnd = bStart + Math.max(0, b.duration);
            if (!overlaps(start, end, bStart, bEnd)) continue;
            if (b.workerIds.length === 0) poolBookings += 1;
            b.workerIds.forEach(id => busyWorkers.add(id));
        }

        const freeWorkerIds = input.workerIds.filter(id => !busyWorkers.has(id));
        const used = busyWorkers.size + poolBookings;
        let available: boolean;
        if (input.requestedWorkerId !== undefined) {
            available = !busyWorkers.has(input.requestedWorkerId) && used < capacity;
        } else if (input.workerIds.length === 0) {
            available = poolBookings === 0;
        } else {
            available = freeWorkerIds.length > 0 && used < capacity;
        }

        slots.push({ time: toTimeString(start), available, freeWorkerIds });
    }
    return slots;
};

/**
 * Pick the stylist with the fewest minutes already booked that day among the free ones
 * ("any stylist" assignment, fair across the team).
 */
export const pickLeastBusyWorker = (
    freeWorkerIds: number[],
    bookings: AvailabilityBooking[]
): number | undefined => {
    if (freeWorkerIds.length === 0) return undefined;
    const load = new Map<number, number>();
    freeWorkerIds.forEach(id => load.set(id, 0));
    for (const b of bookings) {
        if (INACTIVE_STATUSES.includes(b.status)) continue;
        for (const id of b.workerIds) {
            if (load.has(id)) load.set(id, (load.get(id) || 0) + b.duration);
        }
    }
    return [...load.entries()].sort((a, b) => a[1] - b[1] || a[0] - b[0])[0][0];
};
