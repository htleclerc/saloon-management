/**
 * Public booking - server side
 *
 * Reads a salon's public catalog and creates bookings for clients without an account.
 * Runs only in API routes with the Supabase admin client: inputs are validated with Zod,
 * prices and deposits are recomputed here (never trusted from the browser), and only
 * public fields are returned.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DepositType, OpeningHours } from '@/types';
import { calculateBookingTotals, calculateDeposit, buildAddonSnapshots } from '@/lib/domain/rules/pricingRules';
import { computeAvailability, pickLeastBusyWorker, toMinutes, toTimeString, type AvailabilityBooking, type AvailabilitySlot } from '@/lib/domain/rules/availabilityRules';
import type { PublicBookingRequest } from '@/lib/validators/publicBooking.schemas';

// ============================================================
// Public payloads
// ============================================================

export interface PublicSalon {
    id: number;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    phone?: string;
    logoUrl?: string;
    currency: string;
    timezone: string;
}

export interface PublicSalonSettings {
    allowOnlineBooking: boolean;
    bookingSlotDuration: number;
    bookingAdvanceDays: number;
    depositType: DepositType;
    depositValue: number;
    bookingTerms: string[];
    openingHours: OpeningHours[];
}

export interface PublicService {
    id: number;
    categoryId?: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    addonIds: number[];
}

export interface PublicCategory { id: number; name: string; displayOrder: number }
export interface PublicAddon { id: number; name: string; description?: string; extraPrice: number; extraDuration: number }
export interface PublicWorker { id: number; name: string; avatarUrl?: string; specialties: string[] }

export interface PublicSalonPayload {
    salon: PublicSalon;
    settings: PublicSalonSettings;
    categories: PublicCategory[];
    services: PublicService[];
    addons: PublicAddon[];
    workers: PublicWorker[];
}

export interface PublicBookingResult {
    bookingId: number;
    clientId: number;
    status: string;
    totalPrice: number;
    depositAmount: number;
    workerId?: number;
    time: string;
    endTime: string;
}

export class PublicBookingError extends Error {
    constructor(message: string, public readonly status: number = 400) {
        super(message);
        this.name = 'PublicBookingError';
    }
}

type Admin = SupabaseClient;

// ============================================================
// Helpers (pure)
// ============================================================

/** Digits only, used to match an existing client by phone */
export const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

/** "Nadine" / "Falone" -> "Nadine Falone" */
export const fullName = (firstName: string, lastName: string): string => `${firstName.trim()} ${lastName.trim()}`.trim();

const num = (v: unknown, fallback = 0): number => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
};

// ============================================================
// Catalog
// ============================================================

export async function getPublicSalon(admin: Admin, slug: string): Promise<PublicSalonPayload | null> {
    const { data: salon } = await admin
        .from('salons')
        .select('id, name, slug, address, city, phone, logo_url, currency, timezone, is_active')
        .eq('slug', slug)
        .single();

    if (!salon || salon.is_active === false) return null;

    const [{ data: settings }, { data: categories }, { data: services }, { data: addons }, { data: links }, { data: workers }] = await Promise.all([
        admin.from('salon_settings').select('*').eq('salon_id', salon.id).maybeSingle(),
        admin.from('service_categories').select('id, name, display_order').eq('salon_id', salon.id).eq('is_active', true).order('display_order'),
        admin.from('services').select('id, category_id, name, description, price, duration').eq('salon_id', salon.id).eq('is_active', true).order('name'),
        admin.from('service_addons').select('id, name, description, extra_price, extra_duration, display_order').eq('salon_id', salon.id).eq('is_active', true).order('display_order'),
        admin.from('service_addon_links').select('service_id, addon_id'),
        admin.from('workers').select('id, name, avatar_url, specialties').eq('salon_id', salon.id).eq('status', 'Active').eq('is_active', true).order('name'),
    ]);

    const activeAddonIds = new Set((addons || []).map((a: { id: number }) => a.id));
    const serviceIds = new Set((services || []).map((s: { id: number }) => s.id));
    const linksByService = new Map<number, number[]>();
    for (const link of (links || []) as { service_id: number; addon_id: number }[]) {
        if (!serviceIds.has(link.service_id) || !activeAddonIds.has(link.addon_id)) continue;
        linksByService.set(link.service_id, [...(linksByService.get(link.service_id) || []), link.addon_id]);
    }

    return {
        salon: {
            id: salon.id,
            name: salon.name,
            slug: salon.slug,
            address: salon.address || undefined,
            city: salon.city || undefined,
            phone: salon.phone || undefined,
            logoUrl: salon.logo_url || undefined,
            currency: salon.currency || 'USD',
            timezone: salon.timezone || 'UTC',
        },
        settings: {
            allowOnlineBooking: settings?.allow_online_booking !== false,
            bookingSlotDuration: num(settings?.booking_slot_duration, 30) || 30,
            bookingAdvanceDays: num(settings?.booking_advance_days, 30) || 30,
            depositType: (settings?.deposit_type as DepositType) || 'none',
            depositValue: num(settings?.deposit_value),
            bookingTerms: Array.isArray(settings?.booking_terms) ? settings.booking_terms : [],
            openingHours: Array.isArray(settings?.opening_hours) ? settings.opening_hours : [],
        },
        categories: (categories || []).map((c: { id: number; name: string; display_order: number | null }) => ({ id: c.id, name: c.name, displayOrder: c.display_order ?? 0 })),
        services: (services || []).map((s: { id: number; category_id: number | null; name: string; description: string | null; price: unknown; duration: unknown }) => ({
            id: s.id,
            categoryId: s.category_id ?? undefined,
            name: s.name,
            description: s.description || undefined,
            price: num(s.price),
            duration: num(s.duration),
            addonIds: linksByService.get(s.id) || [],
        })),
        addons: (addons || []).map((a: { id: number; name: string; description: string | null; extra_price: unknown; extra_duration: unknown }) => ({
            id: a.id, name: a.name, description: a.description || undefined, extraPrice: num(a.extra_price), extraDuration: num(a.extra_duration),
        })),
        workers: (workers || []).map((w: { id: number; name: string; avatar_url: string | null; specialties: string[] | null }) => ({
            id: w.id, name: w.name, avatarUrl: w.avatar_url || undefined, specialties: w.specialties || [],
        })),
    };
}

// ============================================================
// Availability
// ============================================================

async function loadDayBookings(admin: Admin, salonId: number, date: string): Promise<AvailabilityBooking[]> {
    const { data } = await admin
        .from('bookings')
        .select('id, time, duration, status, booking_workers(worker_id)')
        .eq('salon_id', salonId)
        .eq('date', date)
        .or('is_active.eq.true,is_active.is.null');

    return (data || []).map((b: { id: number; time: string; duration: number; status: string; booking_workers?: { worker_id: number }[] }) => ({
        id: b.id,
        time: String(b.time).slice(0, 5),
        duration: num(b.duration),
        status: b.status,
        workerIds: (b.booking_workers || []).map(bw => bw.worker_id),
    }));
}

export async function getPublicAvailability(
    admin: Admin,
    payload: PublicSalonPayload,
    query: { date: string; duration: number; workerId?: number; now?: Date }
): Promise<AvailabilitySlot[]> {
    const bookings = await loadDayBookings(admin, payload.salon.id, query.date);
    return computeAvailability({
        date: query.date,
        openingHours: payload.settings.openingHours,
        slotInterval: payload.settings.bookingSlotDuration,
        duration: query.duration,
        bookings,
        workerIds: payload.workers.map(w => w.id),
        requestedWorkerId: query.workerId,
        now: query.now ?? new Date(),
    });
}

// ============================================================
// Booking creation
// ============================================================

async function findOrCreateClient(admin: Admin, salonId: number, client: PublicBookingRequest['client']): Promise<number> {
    const email = client.email ? client.email.trim().toLowerCase() : '';
    const phoneDigits = normalizePhone(client.phone);
    const name = fullName(client.firstName, client.lastName);

    const { data: candidates } = await admin
        .from('clients')
        .select('id, email, phone')
        .eq('salon_id', salonId)
        .limit(500);

    const match = (candidates || []).find((c: { id: number; email: string | null; phone: string | null }) =>
        (email && c.email && c.email.toLowerCase() === email) ||
        (phoneDigits && c.phone && normalizePhone(c.phone) === phoneDigits)
    );
    if (match) return match.id;

    const { data: created, error } = await admin
        .from('clients')
        .insert([{ salon_id: salonId, name, email: email || null, phone: client.phone.trim(), is_active: true, created_by: 'PUBLIC', updated_by: 'PUBLIC' }])
        .select('id')
        .single();

    if (error || !created) throw new PublicBookingError(`Could not create client: ${error?.message || 'unknown error'}`, 500);
    return created.id;
}

export async function createPublicBooking(
    admin: Admin,
    payload: PublicSalonPayload,
    input: PublicBookingRequest,
    now: Date = new Date()
): Promise<PublicBookingResult> {
    const { salon, settings } = payload;
    if (!settings.allowOnlineBooking) throw new PublicBookingError('Online booking is disabled for this salon', 403);
    if (settings.bookingTerms.length > 0 && !input.termsAccepted) throw new PublicBookingError('You must accept the salon booking terms', 400);

    // Catalog checks: every service and add-on must exist and the add-ons must be offered on the selected services
    const services = input.serviceIds.map(id => payload.services.find(s => s.id === id));
    if (services.some(s => !s)) throw new PublicBookingError('Unknown service', 400);
    const validServices = services as PublicService[];
    const offeredAddonIds = new Set(validServices.flatMap(s => s.addonIds));
    const addons = input.addonIds.map(id => payload.addons.find(a => a.id === id));
    if (addons.some(a => !a) || input.addonIds.some(id => !offeredAddonIds.has(id))) {
        throw new PublicBookingError('An extra is not available for the selected services', 400);
    }
    const validAddons = addons as PublicAddon[];
    if (input.workerId !== undefined && !payload.workers.some(w => w.id === input.workerId)) {
        throw new PublicBookingError('Unknown stylist', 400);
    }

    // Booking window
    const [y, m, d] = input.date.split('-').map(Number);
    const bookingDay = new Date(y, m - 1, d);
    const maxDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + settings.bookingAdvanceDays);
    if (bookingDay > maxDay) throw new PublicBookingError(`Bookings are open up to ${settings.bookingAdvanceDays} days ahead`, 400);

    // Totals and deposit recomputed server side
    const totals = calculateBookingTotals(validServices, validAddons);
    const duration = totals.totalDuration > 0 ? totals.totalDuration : settings.bookingSlotDuration;
    const depositAmount = calculateDeposit(totals.totalPrice, settings);

    // Slot must still be free
    const dayBookings = await loadDayBookings(admin, salon.id, input.date);
    const slots = computeAvailability({
        date: input.date,
        openingHours: settings.openingHours,
        slotInterval: settings.bookingSlotDuration,
        duration,
        bookings: dayBookings,
        workerIds: payload.workers.map(w => w.id),
        requestedWorkerId: input.workerId,
        now,
    });
    const slot = slots.find(s => s.time === input.time);
    if (!slot || !slot.available) throw new PublicBookingError('This time slot is no longer available', 409);

    // Stylist: the requested one, or the least loaded free stylist
    const workerId = input.workerId ?? pickLeastBusyWorker(slot.freeWorkerIds, dayBookings);

    const clientId = await findOrCreateClient(admin, salon.id, input.client);

    const endTime = toTimeString(toMinutes(input.time) + duration);
    const status = 'Pending';
    const { data: booking, error } = await admin
        .from('bookings')
        .insert([{
            salon_id: salon.id,
            client_id: clientId,
            date: input.date,
            time: input.time,
            end_time: endTime,
            duration,
            status,
            notes: input.notes || null,
            is_sensitive: false,
            total_price: totals.totalPrice,
            deposit_amount: depositAmount,
            deposit_status: depositAmount > 0 ? 'pending' : 'none',
            terms_accepted_at: input.termsAccepted ? now.toISOString() : null,
            created_by: 'PUBLIC',
            updated_by: 'PUBLIC',
        }])
        .select('id')
        .single();

    if (error || !booking) throw new PublicBookingError(`Could not create booking: ${error?.message || 'unknown error'}`, 500);

    const junctions: PromiseLike<unknown>[] = [
        admin.from('booking_services').insert(validServices.map(s => ({ booking_id: booking.id, service_id: s.id }))),
    ];
    if (workerId !== undefined) {
        junctions.push(admin.from('booking_workers').insert([{ booking_id: booking.id, worker_id: workerId, is_primary: true }]));
    }
    if (validAddons.length > 0) {
        junctions.push(admin.from('booking_addons').insert(
            buildAddonSnapshots(booking.id, validAddons).map(a => ({
                booking_id: a.bookingId, addon_id: a.addonId, name: a.name, price_snapshot: a.priceSnapshot, duration_snapshot: a.durationSnapshot,
            }))
        ));
    }
    junctions.push(admin.from('interaction_history').insert([{
        salon_id: salon.id, entity_type: 'booking', entity_id: booking.id, user_code: 'PUBLIC',
        action: 'created', comment: `Online booking by ${fullName(input.client.firstName, input.client.lastName)}`,
    }]));
    await Promise.all(junctions);

    return {
        bookingId: booking.id,
        clientId,
        status,
        totalPrice: totals.totalPrice,
        depositAmount,
        workerId,
        time: input.time,
        endTime,
    };
}
