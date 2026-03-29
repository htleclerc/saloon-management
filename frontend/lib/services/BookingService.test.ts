import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from './BookingService';
import { DataProviderFactory } from '../providers/types';

vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

// Mock the validators module to avoid Zod import issues in tests
vi.mock('@/lib/validators', () => ({
    BookingCreateSchema: {
        parse: vi.fn()
    }
}));

describe('BookingService', () => {
    let service: BookingService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getBookings: vi.fn(),
            getBooking: vi.fn(),
            getBookingWithRelations: vi.fn(),
            getBookingsByDate: vi.fn(),
            getBookingsByClient: vi.fn(),
            getBookingsByWorker: vi.fn(),
            createBooking: vi.fn(),
            updateBooking: vi.fn(),
            deleteBooking: vi.fn(),
            addWorkerToBooking: vi.fn(),
            removeWorkerFromBooking: vi.fn(),
            addServiceToBooking: vi.fn(),
            getBookingWorkers: vi.fn(),
            getBookingServices: vi.fn(),
            getInteractionHistory: vi.fn(),
            getComments: vi.fn(),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new BookingService();
    });

    describe('getAll', () => {
        it('should fetch paginated bookings for a salon', async () => {
            const mockResult = { data: [{ id: 1 }, { id: 2 }], total: 2 };
            mockProvider.getBookings.mockResolvedValue(mockResult);

            const result = await service.getAll(1);

            expect(mockProvider.getBookings).toHaveBeenCalledWith(1, undefined);
            expect(result).toEqual(mockResult);
        });

        it('should pass filters to provider', async () => {
            const filters = { status: 'Pending' as const, page: 1, limit: 10 };
            mockProvider.getBookings.mockResolvedValue({ data: [], total: 0 });

            await service.getAll(1, filters);

            expect(mockProvider.getBookings).toHaveBeenCalledWith(1, filters);
        });
    });

    describe('getById', () => {
        it('should return a booking by ID', async () => {
            const mockBooking = { id: 5, clientId: 10, date: '2026-03-01' };
            mockProvider.getBooking.mockResolvedValue(mockBooking);

            const result = await service.getById(5);

            expect(mockProvider.getBooking).toHaveBeenCalledWith(5);
            expect(result).toEqual(mockBooking);
        });

        it('should return null for non-existent booking', async () => {
            mockProvider.getBooking.mockResolvedValue(null);

            const result = await service.getById(999);

            expect(result).toBeNull();
        });
    });

    describe('getByDate', () => {
        it('should fetch bookings for a specific date', async () => {
            const mockBookings = [{ id: 1, date: '2026-03-01' }];
            mockProvider.getBookingsByDate.mockResolvedValue(mockBookings);

            const result = await service.getByDate(1, '2026-03-01');

            expect(mockProvider.getBookingsByDate).toHaveBeenCalledWith(1, '2026-03-01');
            expect(result).toEqual(mockBookings);
        });
    });

    describe('getByClient', () => {
        it('should fetch bookings for a client', async () => {
            const mockBookings = [{ id: 1, clientId: 10 }];
            mockProvider.getBookingsByClient.mockResolvedValue(mockBookings);

            const result = await service.getByClient(10);

            expect(mockProvider.getBookingsByClient).toHaveBeenCalledWith(10);
            expect(result).toEqual(mockBookings);
        });
    });

    describe('create', () => {
        const validBookingData = {
            salonId: 1,
            clientId: 10,
            date: '2026-03-15',
            time: '14:00',
            duration: 60,
            workerIds: [1],
            serviceIds: [1, 2],
        };

        it('should create a booking successfully', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([]); // No duplicates, no conflicts
            mockProvider.getBookingWorkers.mockResolvedValue([]);
            mockProvider.createBooking.mockResolvedValue({ id: 100, ...validBookingData, status: 'Pending' });
            mockProvider.addWorkerToBooking.mockResolvedValue(undefined);
            mockProvider.addServiceToBooking.mockResolvedValue(undefined);

            const result = await service.create(validBookingData);

            expect(mockProvider.createBooking).toHaveBeenCalled();
            expect(result.id).toBe(100);
            expect(mockProvider.addWorkerToBooking).toHaveBeenCalledWith(100, 1);
            expect(mockProvider.addServiceToBooking).toHaveBeenCalledTimes(2);
        });

        it('should throw error for duplicate booking (same client, same time)', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([
                { id: 50, clientId: 10, time: '14:00', status: 'Pending' }
            ]);

            await expect(service.create(validBookingData)).rejects.toThrow(
                /already exists/
            );
        });

        it('should allow booking if existing one is cancelled', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([
                { id: 50, clientId: 10, time: '14:00', status: 'Cancelled' }
            ]);
            mockProvider.getBookingWorkers.mockResolvedValue([]);
            mockProvider.createBooking.mockResolvedValue({ id: 101, ...validBookingData, status: 'Pending' });
            mockProvider.addWorkerToBooking.mockResolvedValue(undefined);
            mockProvider.addServiceToBooking.mockResolvedValue(undefined);

            const result = await service.create(validBookingData);

            expect(result.id).toBe(101);
        });

        it('should detect worker conflict and mark booking as sensitive', async () => {
            // No duplicate client but worker overlap in time
            mockProvider.getBookingsByDate.mockResolvedValue([
                { id: 50, clientId: 99, time: '14:00', duration: 60, status: 'Pending' }
            ]);
            // First call for duplicate check returns the existing bookings
            // Second call for conflict check also returns the existing bookings
            mockProvider.getBookingWorkers.mockResolvedValue([{ id: 1, name: 'Worker 1' }]);
            mockProvider.createBooking.mockResolvedValue({ id: 102, ...validBookingData, status: 'Pending', isSensitive: true });
            mockProvider.addWorkerToBooking.mockResolvedValue(undefined);
            mockProvider.addServiceToBooking.mockResolvedValue(undefined);

            const result = await service.create(validBookingData);

            expect(mockProvider.createBooking).toHaveBeenCalledWith(
                expect.objectContaining({ isSensitive: true })
            );
            expect(result.isSensitive).toBe(true);
        });

        it('should set default status to Pending', async () => {
            mockProvider.getBookingsByDate.mockResolvedValue([]);
            mockProvider.getBookingWorkers.mockResolvedValue([]);
            mockProvider.createBooking.mockResolvedValue({ id: 103, status: 'Pending' });
            mockProvider.addWorkerToBooking.mockResolvedValue(undefined);
            mockProvider.addServiceToBooking.mockResolvedValue(undefined);

            await service.create(validBookingData);

            expect(mockProvider.createBooking).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'Pending' })
            );
        });
    });

    describe('update', () => {
        it('should update booking and log interaction', async () => {
            const updatedBooking = { id: 1, status: 'Confirmed' };
            mockProvider.updateBooking.mockResolvedValue(updatedBooking);

            const result = await service.update(1, { status: 'Confirmed' });

            expect(mockProvider.updateBooking).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'Confirmed' }));
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
            expect(result).toEqual(updatedBooking);
        });
    });

    describe('delete', () => {
        it('should delete booking and log interaction', async () => {
            mockProvider.deleteBooking.mockResolvedValue(undefined);

            await service.delete(1);

            expect(mockProvider.deleteBooking).toHaveBeenCalledWith(1);
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
        });
    });

    describe('updateStatus', () => {
        it('should update booking status and log', async () => {
            const updatedBooking = { id: 1, status: 'Confirmed' };
            mockProvider.updateBooking.mockResolvedValue(updatedBooking);

            const result = await service.updateStatus(1, 'Confirmed');

            expect(mockProvider.updateBooking).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'Confirmed' }));
            expect(result.status).toBe('Confirmed');
        });
    });

    describe('addWorker / removeWorker', () => {
        it('should add a worker to a booking', async () => {
            mockProvider.addWorkerToBooking.mockResolvedValue(undefined);

            await service.addWorker(1, 5);

            expect(mockProvider.addWorkerToBooking).toHaveBeenCalledWith(1, 5);
        });

        it('should remove a worker from a booking', async () => {
            mockProvider.removeWorkerFromBooking.mockResolvedValue(undefined);

            await service.removeWorker(1, 5);

            expect(mockProvider.removeWorkerFromBooking).toHaveBeenCalledWith(1, 5);
        });
    });

    describe('getWorkers / getServices', () => {
        it('should return workers for a booking', async () => {
            const workers = [{ id: 1, name: 'Marie' }];
            mockProvider.getBookingWorkers.mockResolvedValue(workers);

            const result = await service.getWorkers(1);

            expect(result).toEqual(workers);
        });

        it('should return services for a booking', async () => {
            const services = [{ id: 1, name: 'Haircut' }];
            mockProvider.getBookingServices.mockResolvedValue(services);

            const result = await service.getServices(1);

            expect(result).toEqual(services);
        });
    });

    describe('getHistory / getComments', () => {
        it('should return booking history', async () => {
            const history = [{ action: 'created', timestamp: '2026-03-01' }];
            mockProvider.getInteractionHistory.mockResolvedValue(history);

            const result = await service.getHistory(1);

            expect(mockProvider.getInteractionHistory).toHaveBeenCalledWith('booking', 1);
            expect(result).toEqual(history);
        });

        it('should return booking comments', async () => {
            const comments = [{ text: 'Ready', user: 'admin' }];
            mockProvider.getComments.mockResolvedValue(comments);

            const result = await service.getComments(1);

            expect(mockProvider.getComments).toHaveBeenCalledWith('booking', 1);
            expect(result).toEqual(comments);
        });
    });
});
