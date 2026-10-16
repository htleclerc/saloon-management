import { describe, it, expect } from 'vitest';
import { calculateBookingTotals, calculateTotalsFromSnapshots, buildAddonSnapshots, formatDurationMinutes, calculateDeposit } from './pricingRules';

describe('pricingRules', () => {
    const knotlessMedium = { id: 1, name: 'Knotless - Medium', price: 240, duration: 330 };
    const washBlowDry = { id: 2, name: 'Wash + blow dry', price: 25, duration: 30 };
    const lowerBack = { id: 10, name: 'Lower back', extraPrice: 30, extraDuration: 60 };
    const waist = { id: 11, name: 'Waist length', extraPrice: 60, extraDuration: 150 };

    describe('calculateBookingTotals', () => {
        it('sums services only when no add-on is selected', () => {
            const totals = calculateBookingTotals([knotlessMedium, washBlowDry]);
            expect(totals.basePrice).toBe(265);
            expect(totals.addonPrice).toBe(0);
            expect(totals.totalPrice).toBe(265);
            expect(totals.baseDuration).toBe(360);
            expect(totals.totalDuration).toBe(360);
            expect(totals.lines).toHaveLength(2);
        });

        it('adds add-on price and duration to the base service', () => {
            const totals = calculateBookingTotals([knotlessMedium], [lowerBack, waist]);
            expect(totals.basePrice).toBe(240);
            expect(totals.addonPrice).toBe(90);
            expect(totals.totalPrice).toBe(330);
            expect(totals.baseDuration).toBe(330);
            expect(totals.addonDuration).toBe(210);
            expect(totals.totalDuration).toBe(540);
            expect(totals.lines.map(l => l.kind)).toEqual(['service', 'addon', 'addon']);
        });

        it('tolerates string prices and missing durations coming from legacy data', () => {
            const totals = calculateBookingTotals(
                [{ id: 3, name: 'Legacy', price: '120' as unknown as number, duration: undefined as unknown as number }],
                [{ id: 12, name: 'Extra', extraPrice: '10.5' as unknown as number, extraDuration: 15 }]
            );
            expect(totals.totalPrice).toBe(130.5);
            expect(totals.totalDuration).toBe(15);
        });

        it('rounds money to two decimals', () => {
            const totals = calculateBookingTotals(
                [{ id: 4, name: 'A', price: 10.005, duration: 10 }],
                [{ id: 13, name: 'B', extraPrice: 0.1, extraDuration: 0 }, { id: 14, name: 'C', extraPrice: 0.2, extraDuration: 0 }]
            );
            expect(totals.addonPrice).toBe(0.3);
            expect(totals.totalPrice).toBe(10.31);
        });
    });

    describe('buildAddonSnapshots / calculateTotalsFromSnapshots', () => {
        it('freezes catalog values on the booking and recomputes the same totals', () => {
            const snapshots = buildAddonSnapshots(42, [lowerBack, waist]);
            expect(snapshots).toEqual([
                { bookingId: 42, addonId: 10, name: 'Lower back', priceSnapshot: 30, durationSnapshot: 60 },
                { bookingId: 42, addonId: 11, name: 'Waist length', priceSnapshot: 60, durationSnapshot: 150 },
            ]);

            const totals = calculateTotalsFromSnapshots([knotlessMedium], snapshots);
            expect(totals.totalPrice).toBe(330);
            expect(totals.totalDuration).toBe(540);
        });
    });

    describe('calculateDeposit', () => {
        it('returns 0 when no rule or rule none', () => {
            expect(calculateDeposit(300, null)).toBe(0);
            expect(calculateDeposit(300, { depositType: 'none', depositValue: 50 })).toBe(0);
            expect(calculateDeposit(0, { depositType: 'fixed', depositValue: 50 })).toBe(0);
        });

        it('applies a fixed amount capped at the total', () => {
            expect(calculateDeposit(300, { depositType: 'fixed', depositValue: 50 })).toBe(50);
            expect(calculateDeposit(30, { depositType: 'fixed', depositValue: 50 })).toBe(30);
        });

        it('applies a percentage of the total, capped at 100 %', () => {
            expect(calculateDeposit(330, { depositType: 'percent', depositValue: 25 })).toBe(82.5);
            expect(calculateDeposit(330, { depositType: 'percent', depositValue: 150 })).toBe(330);
            expect(calculateDeposit(99.99, { depositType: 'percent', depositValue: 33 })).toBe(33);
        });
    });

    describe('formatDurationMinutes', () => {
        it('formats minutes, whole hours and mixed durations', () => {
            expect(formatDurationMinutes(45)).toBe('45 min');
            expect(formatDurationMinutes(120)).toBe('2 h');
            expect(formatDurationMinutes(330)).toBe('5 h 30');
            expect(formatDurationMinutes(-5)).toBe('0 min');
        });
    });
});
