import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncomeService } from './IncomeService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('IncomeService', () => {
    let service: IncomeService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getIncomes: vi.fn(),
            getIncome: vi.fn(),
            createIncome: vi.fn(),
            updateIncome: vi.fn(),
            deleteIncome: vi.fn(),
            addWorkerToIncome: vi.fn(),
            addServiceToIncome: vi.fn(),
            addProductToIncome: vi.fn(),
            getIncomeWorkerShares: vi.fn(),
            createInteractionHistory: vi.fn(),
            getIncomesByWorker: vi.fn(),
            clearIncomeJunctions: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new IncomeService();
    });

    it('should throw error if amount is negative', async () => {
        const data = {
            salonId: 1,
            amount: -100,
            date: '2026-02-01',
            serviceIds: [1],
            workerShares: [{ workerId: 1, percentage: 100 }]
        };

        await expect(service.create(data as any)).rejects.toThrow('Must be zero or positive');
    });

    it('should throw error if shares do not sum to 100%', async () => {
        const data = {
            salonId: 1,
            amount: 100,
            date: '2026-02-01',
            serviceIds: [1],
            workerShares: [
                { workerId: 1, percentage: 50 },
                { workerId: 2, percentage: 40 }
            ]
        };

        await expect(service.create(data as any)).rejects.toThrow(/Worker share percentages must sum to 100%/);
    });

    it('should call provider methods in correct order during creation', async () => {
        const data = {
            salonId: 1,
            amount: 100,
            discountAmount: 10,
            date: '2026-02-01',
            workerShares: [{ workerId: 1, percentage: 100 }],
            serviceIds: [101]
        };

        mockProvider.createIncome.mockResolvedValue({ id: 50, ...data, finalAmount: 90 });

        const result = await service.create(data as any);

        expect(mockProvider.createIncome).toHaveBeenCalled();
        // finalAmount = 100 - 10 = 90. Share is 100% of 90 = 90.
        expect(mockProvider.addWorkerToIncome).toHaveBeenCalledWith(50, 1, 90, 100, 0);
        expect(mockProvider.addServiceToIncome).toHaveBeenCalledWith(50, 101);
        expect(result.id).toBe(50);
    });

    it('should calculate worker total revenue correctly', async () => {
        const workerId = 1;
        const mockIncomes = [
            { id: 10, status: 'Validated', date: '2026-01-01' },
            { id: 11, status: 'Draft', date: '2026-01-02' } // Should be ignored
        ];

        mockProvider.getIncomesByWorker.mockResolvedValue(mockIncomes);
        mockProvider.getIncomeWorkerShares.mockResolvedValue([
            { workerId: 1, amount: 45 },
            { workerId: 2, amount: 45 }
        ]);

        const total = await service.getWorkerTotalRevenue(workerId);

        expect(total).toBe(45);
        expect(mockProvider.getIncomesByWorker).toHaveBeenCalledWith(workerId);
    });

    it('should physically delete income if status is Draft', async () => {
        const incomeId = 1;
        mockProvider.getIncome.mockResolvedValue({ id: incomeId, status: 'Draft' });

        await service.delete(incomeId);

        expect(mockProvider.deleteIncome).toHaveBeenCalledWith(incomeId);
        expect(mockProvider.updateIncome).not.toHaveBeenCalled();
    });

    it('should logically suppress (archive) income if status is Validated', async () => {
        const incomeId = 1;
        mockProvider.getIncome.mockResolvedValue({ id: incomeId, status: 'Validated' });

        await service.delete(incomeId);

        expect(mockProvider.deleteIncome).not.toHaveBeenCalled();
        expect(mockProvider.updateIncome).toHaveBeenCalledWith(incomeId, { isActive: false });
    });

    it('should use explicit worker amount if provided (product attribution fix)', async () => {
        const data = {
            salonId: 1,
            amount: 145, // 100 service + 45 product
            date: '2026-02-01',
            serviceIds: [1],
            workerShares: [{ workerId: 1, percentage: 100, amount: 50 }], // Explicitly 50€ commission on 100€ service
            products: [{ productId: 1, quantity: 1 }]
        };

        mockProvider.createIncome.mockResolvedValue({ id: 51, ...data, finalAmount: 145 });

        await service.create(data as any);

        // Should use explicitly provided 50€, NOT 100% of 145€
        expect(mockProvider.addWorkerToIncome).toHaveBeenCalledWith(51, 1, 50, 100, 0);
    });

    it('should block updates on Validated income unless changing status', async () => {
        const incomeId = 1;
        mockProvider.getIncome.mockResolvedValue({ id: incomeId, status: 'Validated', amount: 100 });

        // Try to update amount without changing status
        await expect(service.update(incomeId, { amount: 200 } as any))
            .rejects.toThrow('Validated income cannot be modified');
    });

    it('should allow contesting a Validated income', async () => {
        const incomeId = 1;
        mockProvider.getIncome.mockResolvedValue({ id: incomeId, status: 'Validated' });
        mockProvider.updateIncome.mockResolvedValue({ id: incomeId, status: 'Refused' });

        await service.contest(incomeId);

        expect(mockProvider.updateIncome).toHaveBeenCalledWith(incomeId, expect.objectContaining({ status: 'Refused' }));
        expect(mockProvider.createInteractionHistory).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'status_changed_to_Refused' })
        );
    });

    it('should allow validating a Pending income', async () => {
        const incomeId = 2;
        mockProvider.updateIncome.mockResolvedValue({ id: incomeId, status: 'Validated' });

        await service.validate(incomeId);

        expect(mockProvider.updateIncome).toHaveBeenCalledWith(incomeId, expect.objectContaining({ status: 'Validated' }));
    });

    it('should recalculate finalAmount and junctions on update', async () => {
        const incomeId = 3;
        mockProvider.getIncome.mockResolvedValue({ id: incomeId, status: 'Draft', amount: 100, discountAmount: 0 });
        mockProvider.updateIncome.mockResolvedValue({ id: incomeId, finalAmount: 180 });

        const updateData = {
            amount: 200,
            discountAmount: 20,
            workerShares: [{ workerId: 1, percentage: 100 }]
        };

        await service.update(incomeId, updateData as any);

        // finalAmount calculation: 200 - 20 = 180
        // Expect junctions to be cleared and re-added
        expect(mockProvider.clearIncomeJunctions).toHaveBeenCalledWith(incomeId);
        expect(mockProvider.addWorkerToIncome).toHaveBeenCalledWith(incomeId, 1, 180, 100, 0);
    });
});
