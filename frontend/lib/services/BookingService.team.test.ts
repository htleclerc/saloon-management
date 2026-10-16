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

const nadine = { id: 1, name: 'Nadine' };
const kevine = { id: 2, name: 'Kevine' };
const falone = { id: 3, name: 'Falone' };

describe('BookingService team (shared bookings)', () => {
    let service: BookingService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    const booking = { id: 42, salonId: 1, date: '2026-10-20', time: '09:00', duration: 600, status: 'Confirmed', workerIds: [1], primaryWorkerId: 1 };
    // Kevine is busy 12:00-14:00 the same day; Falone is free
    const otherBooking = { id: 43, salonId: 1, date: '2026-10-20', time: '12:00', duration: 120, status: 'Confirmed', workerIds: [2] };

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getBooking: vi.fn().mockResolvedValue(booking),
            getBookingsByDate: vi.fn().mockResolvedValue([booking, otherBooking]),
            getBookingWorkers: vi.fn().mockImplementation(async (id: number) => (id === 42 ? [nadine] : [kevine])),
            setBookingWorkers: vi.fn(),
            addWorkerToBooking: vi.fn(),
            addServiceToBooking: vi.fn(),
            removeServiceFromBooking: vi.fn(),
            getBookingServices: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
            createBooking: vi.fn().mockImplementation(async (data) => ({ id: 42, ...data })),
            updateBooking: vi.fn().mockImplementation(async (id, data) => ({ id, ...data })),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new BookingService();
    });

    describe('setWorkers', () => {
        it('adds a free assistant and keeps the first stylist as primary', async () => {
            const updated = await service.setWorkers(42, [1, 3]);
            expect(mockProvider.setBookingWorkers).toHaveBeenCalledWith(42, [1, 3], 1);
            expect(updated.workerIds).toEqual([1, 3]);
            expect(updated.primaryWorkerId).toBe(1);
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
        });

        it('refuses a stylist already booked on an overlapping slot', async () => {
            await expect(service.setWorkers(42, [1, 2])).rejects.toThrow('Already booked at this time: Kevine');
            expect(mockProvider.setBookingWorkers).not.toHaveBeenCalled();
        });

        it('does not re-check availability of stylists already on the booking', async () => {
            await service.setWorkers(42, [1]);
            expect(mockProvider.getBookingsByDate).not.toHaveBeenCalled();
            expect(mockProvider.setBookingWorkers).toHaveBeenCalledWith(42, [1], 1);
        });

        it('lets the manager choose another primary among the team', async () => {
            const updated = await service.setWorkers(42, [1, 3], 3);
            expect(mockProvider.setBookingWorkers).toHaveBeenCalledWith(42, [1, 3], 3);
            expect(updated.primaryWorkerId).toBe(3);
        });

        it('falls back to the first worker when the primary is removed', async () => {
            const updated = await service.setWorkers(42, [3]);
            expect(updated.primaryWorkerId).toBe(3);
        });

        it('ignores overlaps with cancelled bookings', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([booking, { ...otherBooking, status: 'Cancelled' }]);
            await expect(service.setWorkers(42, [1, 2])).resolves.toBeDefined();
        });
    });

    describe('create', () => {
        it('flags the first worker as primary', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([]);
            const created = await service.create({
                salonId: 1, clientId: 5, date: '2026-10-21', time: '10:00', duration: 120, workerIds: [2, 3], serviceIds: [1],
            });
            expect(mockProvider.addWorkerToBooking).toHaveBeenNthCalledWith(1, 42, 2, true);
            expect(mockProvider.addWorkerToBooking).toHaveBeenNthCalledWith(2, 42, 3, false);
            expect(created.primaryWorkerId).toBe(2);
        });
    });

    describe('update', () => {
        it('syncs workers and services through the junctions instead of the booking row', async () => {
            await service.update(42, { notes: 'x', workerIds: [1, 3], serviceIds: [2, 5] });

            const payload = mockProvider.updateBooking.mock.calls[0][1];
            expect(payload).not.toHaveProperty('workerIds');
            expect(payload).not.toHaveProperty('serviceIds');
            expect(mockProvider.setBookingWorkers).toHaveBeenCalledWith(42, [1, 3], undefined);
            expect(mockProvider.removeServiceFromBooking).toHaveBeenCalledWith(42, 1);
            expect(mockProvider.addServiceToBooking).toHaveBeenCalledWith(42, 5);
        });
    });
});
