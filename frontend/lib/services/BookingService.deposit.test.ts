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

const knotless = { id: 1, salonId: 1, name: 'Knotless - Medium', price: 240, duration: 330, isActive: true };
const lowerBack = { id: 10, salonId: 1, name: 'Lower back', extraPrice: 30, extraDuration: 60, displayOrder: 1, isActive: true };

describe('BookingService deposit', () => {
    let service: BookingService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getBookingsByDate: vi.fn().mockResolvedValue([]),
            createBooking: vi.fn().mockImplementation(async (data) => ({ id: 7, ...data })),
            updateBooking: vi.fn().mockImplementation(async (id, data) => ({ id, ...data })),
            getBooking: vi.fn(),
            addWorkerToBooking: vi.fn(),
            addServiceToBooking: vi.fn(),
            getBookingWorkers: vi.fn().mockResolvedValue([]),
            getService: vi.fn().mockImplementation(async (id: number) => (id === 1 ? knotless : null)),
            getServiceAddon: vi.fn().mockImplementation(async (id: number) => (id === 10 ? lowerBack : null)),
            setBookingAddons: vi.fn(),
            getSalonSettings: vi.fn().mockResolvedValue({ depositType: 'percent', depositValue: 25 }),
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
        duration: 390,
        workerIds: [],
        serviceIds: [1],
        addonIds: [10],
    };

    it('computes the total and the deposit from the salon rule for an online booking', async () => {
        const booking = await service.create({ ...baseData, collectDeposit: true });

        const payload = mockProvider.createBooking.mock.calls[0][0];
        expect(payload.totalPrice).toBe(270);
        expect(payload.depositAmount).toBe(67.5);
        expect(payload.depositStatus).toBe('pending');
        expect(booking.depositStatus).toBe('pending');
    });

    it('uses the total provided by the caller when present', async () => {
        await service.create({ ...baseData, collectDeposit: true, totalPrice: 300 });
        const payload = mockProvider.createBooking.mock.calls[0][0];
        expect(payload.totalPrice).toBe(300);
        expect(payload.depositAmount).toBe(75);
        expect(mockProvider.getService).not.toHaveBeenCalled();
    });

    it('does not require a deposit when the salon rule is none', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ depositType: 'none', depositValue: 0 });
        await service.create({ ...baseData, collectDeposit: true });
        const payload = mockProvider.createBooking.mock.calls[0][0];
        expect(payload.depositAmount).toBe(0);
        expect(payload.depositStatus).toBe('none');
    });

    it('skips the deposit rule for bookings created by the salon staff', async () => {
        await service.create({ ...baseData, totalPrice: 270 });
        const payload = mockProvider.createBooking.mock.calls[0][0];
        expect(payload.depositAmount).toBe(0);
        expect(payload.depositStatus).toBe('none');
        expect(mockProvider.getSalonSettings).not.toHaveBeenCalled();
    });

    describe('markDeposit', () => {
        it('confirms a pending booking when the deposit is paid', async () => {
            mockProvider.getBooking.mockResolvedValue({ id: 7, status: 'Pending', depositStatus: 'pending' });
            const booking = await service.markDeposit(7, 'paid', 'cs_test_123');
            const updates = mockProvider.updateBooking.mock.calls[0][1];
            expect(updates.depositStatus).toBe('paid');
            expect(updates.depositReference).toBe('cs_test_123');
            expect(updates.status).toBe('Confirmed');
            expect(booking.status).toBe('Confirmed');
        });

        it('does not change the status of a started booking', async () => {
            mockProvider.getBooking.mockResolvedValue({ id: 7, status: 'Started', depositStatus: 'pending' });
            await service.markDeposit(7, 'paid');
            const updates = mockProvider.updateBooking.mock.calls[0][1];
            expect(updates.status).toBeUndefined();
        });

        it('records a failed deposit without confirming', async () => {
            mockProvider.getBooking.mockResolvedValue({ id: 7, status: 'Pending', depositStatus: 'pending' });
            await service.markDeposit(7, 'failed');
            const updates = mockProvider.updateBooking.mock.calls[0][1];
            expect(updates.depositStatus).toBe('failed');
            expect(updates.status).toBeUndefined();
        });
    });
});
