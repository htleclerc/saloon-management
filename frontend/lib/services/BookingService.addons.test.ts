import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from './BookingService';
import { DataProviderFactory } from '../providers/types';

vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

vi.mock('@/lib/validators', () => ({
    BookingCreateSchema: {
        parse: vi.fn()
    }
}));

const lowerBack = { id: 10, salonId: 1, name: 'Lower back', extraPrice: 30, extraDuration: 60, displayOrder: 1, isActive: true };
const waist = { id: 11, salonId: 1, name: 'Waist length', extraPrice: 60, extraDuration: 150, displayOrder: 2, isActive: true };
const retired = { id: 12, salonId: 1, name: 'Old option', extraPrice: 5, extraDuration: 0, displayOrder: 3, isActive: false };
const knotless = { id: 1, salonId: 1, name: 'Knotless - Medium', price: 240, duration: 330, isActive: true };

describe('BookingService add-ons', () => {
    let service: BookingService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getBookingsByDate: vi.fn().mockResolvedValue([]),
            createBooking: vi.fn().mockImplementation(async (data) => ({ id: 42, ...data })),
            updateBooking: vi.fn().mockImplementation(async (id, data) => ({ id, ...data })),
            addWorkerToBooking: vi.fn(),
            addServiceToBooking: vi.fn(),
            getBookingWorkers: vi.fn().mockResolvedValue([]),
            getService: vi.fn().mockImplementation(async (id: number) => (id === 1 ? knotless : null)),
            getServiceAddon: vi.fn().mockImplementation(async (id: number) => [lowerBack, waist, retired].find(a => a.id === id) || null),
            setBookingAddons: vi.fn(),
            getBookingAddons: vi.fn(),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new BookingService();
    });

    const baseData = {
        salonId: 1,
        clientId: 5,
        date: '2026-10-20',
        time: '10:00',
        duration: 540,
        workerIds: [3],
        serviceIds: [1],
    };

    describe('create', () => {
        it('stores add-on snapshots (name, price, duration) with the booking', async () => {
            const booking = await service.create({ ...baseData, addonIds: [10, 11] });

            expect(mockProvider.setBookingAddons).toHaveBeenCalledWith(42, [
                { bookingId: 42, addonId: 10, name: 'Lower back', priceSnapshot: 30, durationSnapshot: 60 },
                { bookingId: 42, addonId: 11, name: 'Waist length', priceSnapshot: 60, durationSnapshot: 150 },
            ]);
            expect(booking.addonIds).toEqual([10, 11]);
            expect(booking.addons).toHaveLength(2);
        });

        it('does not touch add-ons when none is selected', async () => {
            await service.create(baseData);
            expect(mockProvider.setBookingAddons).not.toHaveBeenCalled();
        });

        it('rejects an unknown add-on', async () => {
            await expect(service.create({ ...baseData, addonIds: [999] })).rejects.toThrow('Add-on 999 not found');
        });

        it('rejects an inactive add-on', async () => {
            await expect(service.create({ ...baseData, addonIds: [12] })).rejects.toThrow('no longer available');
        });

        it('deduplicates repeated add-on ids', async () => {
            await service.create({ ...baseData, addonIds: [10, 10] });
            const snapshots = mockProvider.setBookingAddons.mock.calls[0][1];
            expect(snapshots).toHaveLength(1);
        });
    });

    describe('update', () => {
        it('rebuilds snapshots when addonIds is provided and strips them from the booking payload', async () => {
            const booking = await service.update(42, { notes: 'late', addonIds: [11] });

            const payload = mockProvider.updateBooking.mock.calls[0][1];
            expect(payload.notes).toBe('late');
            expect(payload).not.toHaveProperty('addonIds');
            expect(payload).not.toHaveProperty('addons');
            expect(mockProvider.setBookingAddons).toHaveBeenCalledWith(42, [
                { bookingId: 42, addonId: 11, name: 'Waist length', priceSnapshot: 60, durationSnapshot: 150 },
            ]);
            expect(booking.addonIds).toEqual([11]);
        });

        it('clears add-ons when an empty list is provided', async () => {
            await service.update(42, { addonIds: [] });
            expect(mockProvider.setBookingAddons).toHaveBeenCalledWith(42, []);
        });

        it('leaves add-ons untouched when addonIds is omitted', async () => {
            await service.update(42, { notes: 'x' });
            expect(mockProvider.setBookingAddons).not.toHaveBeenCalled();
        });
    });

    describe('computeTotals', () => {
        it('returns base, add-on and total price and duration', async () => {
            const totals = await service.computeTotals([1], [10, 11]);
            expect(totals.basePrice).toBe(240);
            expect(totals.addonPrice).toBe(90);
            expect(totals.totalPrice).toBe(330);
            expect(totals.totalDuration).toBe(540);
            expect(totals.lines).toHaveLength(3);
        });

        it('ignores unknown services', async () => {
            const totals = await service.computeTotals([1, 999]);
            expect(totals.lines).toHaveLength(1);
            expect(totals.totalPrice).toBe(240);
        });
    });
});
