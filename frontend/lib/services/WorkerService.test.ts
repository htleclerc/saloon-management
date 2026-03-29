import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkerService } from './WorkerService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('WorkerService', () => {
    let service: WorkerService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getWorkers: vi.fn(),
            getWorker: vi.fn(),
            createWorker: vi.fn(),
            updateWorker: vi.fn(),
            deleteWorker: vi.fn(),
            getWorkerStats: vi.fn(),
            createInteractionHistory: vi.fn(),
            getUser: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new WorkerService();
    });

    it('should throw error if sharing key is not between 0 and 100', async () => {
        const invalidWorker = {
            salonId: 1,
            name: 'John Doe',
            color: '#000000',
            sharingKey: 150
        };

        await expect(service.create(invalidWorker as any)).rejects.toThrow('Must be at most 100');
    });

    it('should validate email format during creation', async () => {
        const invalidWorker = {
            salonId: 1,
            name: 'John Doe',
            color: '#000000',
            sharingKey: 50,
            email: 'invalid-email'
        };

        await expect(service.create(invalidWorker as any)).rejects.toThrow('Invalid email format');
    });

    it('should validate phone format during creation', async () => {
        const invalidWorker = {
            salonId: 1,
            name: 'John Doe',
            color: '#000000',
            sharingKey: 50,
            phone: '123' // Too short
        };

        await expect(service.create(invalidWorker as any)).rejects.toThrow('Phone number must contain at least 10 digits');
    });

    it('should call provider.createWorker with correct data', async () => {
        const validWorkerData = {
            salonId: 1,
            name: 'Jane Doe',
            color: '#FF0000',
            sharingKey: 40,
            email: 'jane@example.com'
        };

        mockProvider.createWorker.mockResolvedValue({ id: 1, ...validWorkerData });

        const result = await service.create(validWorkerData as any);

        expect(mockProvider.createWorker).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Jane Doe',
            sharingKey: 40
        }));
        expect(result.id).toBe(1);
    });

    it('should log interaction after creation', async () => {
        const validWorkerData = {
            salonId: 1,
            name: 'Jane Doe',
            color: '#FF0000',
            sharingKey: 40
        };

        mockProvider.createWorker.mockResolvedValue({ id: 1, ...validWorkerData });

        await service.create(validWorkerData as any);

        expect(mockProvider.createInteractionHistory).toHaveBeenCalledWith(expect.objectContaining({
            entityType: 'worker',
            action: 'created'
        }));
    });

    describe('getStatsBySalon', () => {
        it('should aggregate stats for all workers in a salon', async () => {
            const salonId = 1;
            mockProvider.getWorkers.mockResolvedValue([
                { id: 101, name: 'W1' },
                { id: 102, name: 'W2' }
            ]);
            mockProvider.getWorkerStats.mockImplementation((id: number) => {
                return Promise.resolve({ workerId: id, totalRevenue: id * 10 });
            });

            const results = await service.getStatsBySalon(salonId);

            expect(results).toHaveLength(2);
            expect(results[0].totalRevenue).toBe(1010);
            expect(results[1].totalRevenue).toBe(1020);
        });
    });

    describe('getUserCode', () => {
        it('should return userCode for a worker with userId', async () => {
            mockProvider.getWorker.mockResolvedValue({ id: 1, userId: 'u-123' });
            mockProvider.getUser.mockResolvedValue({ userCode: 'WRK-001' });

            const code = await service.getUserCode(1);

            expect(code).toBe('WRK-001');
            expect(mockProvider.getUser).toHaveBeenCalledWith('u-123');
        });

        it('should return null if worker has no userId', async () => {
            mockProvider.getWorker.mockResolvedValue({ id: 1, userId: null });

            const code = await service.getUserCode(1);

            expect(code).toBeNull();
            expect(mockProvider.getUser).not.toHaveBeenCalled();
        });

        it('should return null if worker not found', async () => {
            mockProvider.getWorker.mockResolvedValue(null);

            const code = await service.getUserCode(999);

            expect(code).toBeNull();
        });
    });
});
