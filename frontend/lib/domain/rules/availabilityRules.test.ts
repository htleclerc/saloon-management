import { describe, it, expect } from 'vitest';
import { computeAvailability, pickLeastBusyWorker, weekdayOf } from './availabilityRules';
import type { OpeningHours } from '@/types';

const hours: OpeningHours[] = [
    { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' },
];

// 2026-10-19 is a Monday, 2026-10-18 a Sunday
const MONDAY = '2026-10-19';

describe('availabilityRules', () => {
    it('knows the weekday of an ISO date', () => {
        expect(weekdayOf('2026-10-19')).toBe('monday');
        expect(weekdayOf('2026-10-18')).toBe('sunday');
    });

    it('returns no slot on a closed day or an unknown day', () => {
        expect(computeAvailability({ date: '2026-10-18', openingHours: hours, slotInterval: 30, duration: 60, bookings: [], workerIds: [1] })).toEqual([]);
        expect(computeAvailability({ date: '2026-10-21', openingHours: hours, slotInterval: 30, duration: 60, bookings: [], workerIds: [1] })).toEqual([]);
    });

    it('proposes starts every interval that fit before closing time', () => {
        const slots = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 120, bookings: [], workerIds: [1] });
        expect(slots.map(s => s.time)).toEqual(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']);
        expect(slots.every(s => s.available)).toBe(true);
    });

    it('respects a last start time (e.g. no appointment starting after 17:30)', () => {
        const slots = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 30, duration: 30, bookings: [], workerIds: [1], lastStartTime: '10:00' });
        expect(slots.map(s => s.time)).toEqual(['09:00', '09:30', '10:00']);
    });

    it('blocks a specific stylist on her overlapping booking but leaves the other free', () => {
        const bookings = [{ time: '10:00', duration: 120, workerIds: [1], status: 'Confirmed' }];
        const forNadine = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1, 2], requestedWorkerId: 1 });
        expect(forNadine.find(s => s.time === '09:00')?.available).toBe(true);
        expect(forNadine.find(s => s.time === '10:00')?.available).toBe(false);
        expect(forNadine.find(s => s.time === '11:00')?.available).toBe(false);
        expect(forNadine.find(s => s.time === '12:00')?.available).toBe(true);

        const forKevine = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1, 2], requestedWorkerId: 2 });
        expect(forKevine.find(s => s.time === '10:00')?.available).toBe(true);
    });

    it('with "any stylist", a slot is available while at least one stylist is free', () => {
        const bookings = [
            { time: '10:00', duration: 60, workerIds: [1], status: 'Confirmed' },
            { time: '10:00', duration: 60, workerIds: [2], status: 'Pending' },
        ];
        const slots = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1, 2] });
        expect(slots.find(s => s.time === '10:00')?.available).toBe(false);
        expect(slots.find(s => s.time === '09:00')?.freeWorkerIds).toEqual([1, 2]);
        expect(slots.find(s => s.time === '11:00')?.available).toBe(true);
    });

    it('counts "any stylist" bookings against the team capacity', () => {
        const bookings = [{ time: '10:00', duration: 60, workerIds: [], status: 'Confirmed' }];
        const twoStylists = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1, 2] });
        expect(twoStylists.find(s => s.time === '10:00')?.available).toBe(true);
        const oneStylist = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1] });
        expect(oneStylist.find(s => s.time === '10:00')?.available).toBe(false);
    });

    it('ignores cancelled bookings and a long service blocks every start that overlaps it', () => {
        const bookings = [
            { time: '09:00', duration: 600, workerIds: [1], status: 'Cancelled' },
            { time: '13:00', duration: 300, workerIds: [1], status: 'Started' },
        ];
        const slots = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 60, duration: 60, bookings, workerIds: [1] });
        expect(slots.filter(s => s.available).map(s => s.time)).toEqual(['09:00', '10:00', '11:00', '12:00']);
    });

    it('hides slots in the past on the current day, honouring the minimum notice', () => {
        const now = new Date(2026, 9, 19, 10, 15); // Monday 19 Oct 2026 10:15 local
        const slots = computeAvailability({ date: MONDAY, openingHours: hours, slotInterval: 30, duration: 30, bookings: [], workerIds: [1], now, minLeadMinutes: 60 });
        expect(slots[0].time).toBe('11:30');
        const past = computeAvailability({ date: '2026-10-12', openingHours: hours, slotInterval: 30, duration: 30, bookings: [], workerIds: [1], now });
        expect(past).toEqual([]);
    });

    it('assigns "any stylist" to the least loaded free stylist', () => {
        const bookings = [
            { time: '09:00', duration: 240, workerIds: [1], status: 'Confirmed' },
            { time: '09:00', duration: 60, workerIds: [2], status: 'Confirmed' },
        ];
        expect(pickLeastBusyWorker([1, 2, 3], bookings)).toBe(3);
        expect(pickLeastBusyWorker([1, 2], bookings)).toBe(2);
        expect(pickLeastBusyWorker([], bookings)).toBeUndefined();
    });
});
