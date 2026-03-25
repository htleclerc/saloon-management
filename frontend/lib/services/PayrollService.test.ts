import { describe, it, expect, vi, beforeEach } from 'vitest';
import { payrollService } from './PayrollService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('PayrollService', () => {
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            createSalaryPayment: vi.fn(),
            createPaymentStatusHistory: vi.fn(),
            getSalaryPaymentsByMonth: vi.fn(),
            getSalaryPayments: vi.fn(),
            getSalaryPayment: vi.fn(),
            getSalaryPaymentsByWorker: vi.fn(),
            updateSalaryPaymentStatus: vi.fn(),
            updateSalaryPayment: vi.fn(),
            deleteSalaryPayment: vi.fn(),
            getPaymentStatusHistory: vi.fn(),
            getPaymentStatusHistoryBulk: vi.fn(),
            getSalaryPaymentsByStatus: vi.fn(),
            getWorker: vi.fn(),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
    });

    describe('recordPayment', () => {
        it('should create payment via provider and log history', async () => {
            const paymentData = {
                workerId: 1,
                salonId: 1,
                paymentMonth: '2026-02-01',
                baseSalary: 1000,
                commission: 200,
                tips: 50,
                totalAmount: 1250,
                paidAmount: 1250,
                paidDate: '2026-02-15',
                paidBy: 1,
                status: 'approved' as const
            };

            mockProvider.createSalaryPayment.mockResolvedValue({ id: 123, ...paymentData });
            mockProvider.createPaymentStatusHistory.mockResolvedValue({});

            const result = await payrollService.recordPayment(paymentData);

            expect(mockProvider.createSalaryPayment).toHaveBeenCalled();
            expect(mockProvider.createPaymentStatusHistory).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentId: 123,
                    newStatus: 'approved'
                })
            );
            expect(result.id).toBe(123);
        });
    });

    describe('getWorkerPaymentHistory', () => {
        it('should fetch payments then bulk history via provider', async () => {
            const workerId = 1;
            const month = new Date('2026-02-01');
            const mockPayments = [
                { id: 101, paymentMonth: '2026-02-01' },
                { id: 102, paymentMonth: '2026-02-01' }
            ];
            const mockHistory = [
                { id: 1, paymentId: 101, newStatus: 'approved', changedAt: new Date().toISOString() }
            ];

            mockProvider.getSalaryPaymentsByWorker.mockResolvedValue(mockPayments);
            mockProvider.getPaymentStatusHistoryBulk.mockResolvedValue(mockHistory);

            const history = await payrollService.getWorkerPaymentHistory(workerId, month);

            expect(mockProvider.getSalaryPaymentsByWorker).toHaveBeenCalledWith(workerId);
            expect(mockProvider.getPaymentStatusHistoryBulk).toHaveBeenCalledWith([101, 102]);
            expect(history).toHaveLength(1);
            expect(history[0].newStatus).toBe('approved');
        });

        it('should return empty array when no payments found', async () => {
            mockProvider.getSalaryPaymentsByWorker.mockResolvedValue([]);

            const history = await payrollService.getWorkerPaymentHistory(1, new Date('2026-02-01'));

            expect(history).toHaveLength(0);
            expect(mockProvider.getPaymentStatusHistoryBulk).not.toHaveBeenCalled();
        });
    });

    describe('updatePaymentStatus', () => {
        it('should delegate to provider', async () => {
            const paymentId = 101;
            const newStatus = 'approved';
            const userId = 1;

            mockProvider.updateSalaryPaymentStatus.mockResolvedValue(undefined);

            await payrollService.updatePaymentStatus(paymentId, newStatus, userId);

            expect(mockProvider.updateSalaryPaymentStatus).toHaveBeenCalledWith(paymentId, newStatus, userId, undefined);
        });

        it('should pass reason when provided', async () => {
            mockProvider.updateSalaryPaymentStatus.mockResolvedValue(undefined);

            await payrollService.updatePaymentStatus(101, 'rejected', 1, 'Incorrect amount');

            expect(mockProvider.updateSalaryPaymentStatus).toHaveBeenCalledWith(101, 'rejected', 1, 'Incorrect amount');
        });
    });

    describe('approvePayment', () => {
        it('should verify ownership and approve pending payment', async () => {
            mockProvider.getSalaryPayment.mockResolvedValue({ id: 1, workerId: 10, status: 'pending' });
            mockProvider.updateSalaryPaymentStatus.mockResolvedValue(undefined);

            await payrollService.approvePayment(1, 10, 10);

            expect(mockProvider.updateSalaryPaymentStatus).toHaveBeenCalledWith(1, 'approved', 10, undefined);
        });

        it('should reject if payment does not belong to worker', async () => {
            mockProvider.getSalaryPayment.mockResolvedValue({ id: 1, workerId: 99, status: 'pending' });

            await expect(payrollService.approvePayment(1, 10, 10))
                .rejects.toThrow('Unauthorized');
        });

        it('should reject if payment is not pending', async () => {
            mockProvider.getSalaryPayment.mockResolvedValue({ id: 1, workerId: 10, status: 'approved' });

            await expect(payrollService.approvePayment(1, 10, 10))
                .rejects.toThrow('Cannot approve payment');
        });
    });

    describe('getPaymentHistory', () => {
        it('should fetch recent payments with worker names', async () => {
            mockProvider.getSalaryPayments.mockResolvedValue([
                { id: 1, workerId: 10, paidDate: '2026-02-01', paidAmount: 500, status: 'approved' }
            ]);
            mockProvider.getWorker.mockResolvedValue({ id: 10, name: 'Alice' });

            const history = await payrollService.getPaymentHistory(1, 5);

            expect(history).toHaveLength(1);
            expect(history[0].workerName).toBe('Alice');
            expect(history[0].amount).toBe(500);
        });
    });

    describe('isWithin30Days', () => {
        it('should return true for recent dates', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(payrollService.isWithin30Days(today)).toBe(true);
        });

        it('should return false for old dates', () => {
            expect(payrollService.isWithin30Days('2020-01-01')).toBe(false);
        });
    });
});
