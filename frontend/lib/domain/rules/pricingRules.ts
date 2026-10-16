/**
 * Pricing Rules
 *
 * Pure functions to compute the price and duration of a booking
 * from its services and selected add-ons. Used by BookingService
 * (server side of the UI) and by the booking page for live totals.
 */

import type { BookingAddon, BookingQuoteLine, BookingTotals, DepositType, Service, ServiceAddon } from '@/types';

export type PriceableService = Pick<Service, 'id' | 'name' | 'price' | 'duration'>;
export type PriceableAddon = Pick<ServiceAddon, 'id' | 'name' | 'extraPrice' | 'extraDuration'>;

const toNumber = (value: unknown, fallback = 0): number => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Compute totals for a set of services and add-ons.
 * Services with a non-numeric duration count for 0 minutes (the caller decides a fallback).
 */
export const calculateBookingTotals = (
    services: PriceableService[],
    addons: PriceableAddon[] = []
): BookingTotals => {
    const serviceLines: BookingQuoteLine[] = services.map(s => ({
        kind: 'service',
        id: s.id,
        name: s.name,
        price: toNumber(s.price),
        duration: Math.max(0, Math.round(toNumber(s.duration)))
    }));

    const addonLines: BookingQuoteLine[] = addons.map(a => ({
        kind: 'addon',
        id: a.id,
        name: a.name,
        price: toNumber(a.extraPrice),
        duration: Math.max(0, Math.round(toNumber(a.extraDuration)))
    }));

    const basePrice = round2(serviceLines.reduce((sum, l) => sum + l.price, 0));
    const addonPrice = round2(addonLines.reduce((sum, l) => sum + l.price, 0));
    const baseDuration = serviceLines.reduce((sum, l) => sum + l.duration, 0);
    const addonDuration = addonLines.reduce((sum, l) => sum + l.duration, 0);

    return {
        lines: [...serviceLines, ...addonLines],
        basePrice,
        addonPrice,
        totalPrice: round2(basePrice + addonPrice),
        baseDuration,
        addonDuration,
        totalDuration: baseDuration + addonDuration
    };
};

/**
 * Same computation from add-on snapshots stored on a booking
 * (price and duration frozen at booking time).
 */
export const calculateTotalsFromSnapshots = (
    services: PriceableService[],
    snapshots: BookingAddon[] = []
): BookingTotals => {
    return calculateBookingTotals(
        services,
        snapshots.map(s => ({
            id: s.addonId,
            name: s.name,
            extraPrice: s.priceSnapshot,
            extraDuration: s.durationSnapshot
        }))
    );
};

/**
 * Build the snapshots to persist on a booking from the catalog add-ons.
 */
export const buildAddonSnapshots = (bookingId: number, addons: PriceableAddon[]): BookingAddon[] => {
    return addons.map(a => ({
        bookingId,
        addonId: a.id,
        name: a.name,
        priceSnapshot: toNumber(a.extraPrice),
        durationSnapshot: Math.max(0, Math.round(toNumber(a.extraDuration)))
    }));
};

/**
 * Deposit required for a booking according to the salon rule.
 * - 'fixed'   : the configured amount, capped at the total
 * - 'percent' : percentage of the total (0-100)
 * - 'none'    : 0
 */
export const calculateDeposit = (
    totalPrice: number,
    rule: { depositType?: DepositType | null; depositValue?: number | null } | null | undefined
): number => {
    const total = Math.max(0, toNumber(totalPrice));
    if (!rule || !rule.depositType || rule.depositType === 'none' || total === 0) return 0;
    const value = Math.max(0, toNumber(rule.depositValue));
    if (rule.depositType === 'fixed') return round2(Math.min(value, total));
    const pct = Math.min(100, value);
    return round2((total * pct) / 100);
};

/**
 * Format minutes as "2h 30min" style labels (locale agnostic helper for UI).
 */
export const formatDurationMinutes = (minutes: number): string => {
    const total = Math.max(0, Math.round(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m.toString().padStart(2, '0')}`;
};
