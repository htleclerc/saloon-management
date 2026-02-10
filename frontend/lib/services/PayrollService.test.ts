import { describe, it, expect, vi, beforeEach } from 'vitest';
import { payrollService } from './PayrollService';

// Define mocks
const mocks = vi.hoisted(() => {
    return {
        single: vi.fn(),
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        eq: vi.fn(),
        in: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        from: vi.fn(),
        rpc: vi.fn(),
    };
});

// Chain setup
mocks.insert.mockReturnValue({ select: mocks.select });
mocks.select.mockReturnValue({ single: mocks.single, eq: mocks.eq, in: mocks.in });
mocks.update.mockReturnValue({ select: mocks.select, eq: mocks.eq });
mocks.eq.mockReturnValue({ order: mocks.order, eq: mocks.eq, single: mocks.single });
mocks.in.mockReturnValue({ order: mocks.order });
mocks.order.mockReturnValue({ select: mocks.select });
mocks.from.mockReturnValue({
    insert: mocks.insert,
    select: mocks.select,
    update: mocks.update,
});

vi.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: mocks.from,
        rpc: mocks.rpc
    }
}));

describe('PayrollService', () => {
    beforeEach(() => {
        vi.resetAllMocks(); // Use reset instead of clear

        // Re-setup the chains after reset
        mocks.insert.mockReturnValue({ select: mocks.select });
        mocks.select.mockReturnValue({ single: mocks.single, eq: mocks.eq, in: mocks.in, then: vi.fn() });
        mocks.update.mockReturnValue({ select: mocks.select, eq: mocks.eq });
        mocks.eq.mockReturnValue({ order: mocks.order, eq: mocks.eq, single: mocks.single });
        mocks.in.mockReturnValue({ order: mocks.order });
        mocks.order.mockReturnValue({ select: mocks.select });
        mocks.from.mockReturnValue({
            insert: mocks.insert,
            select: mocks.select,
            update: mocks.update,
        });
    });

    describe('recordPayment', () => {
        it('should insert payment and history entry', async () => {
            const paymentData = {
                workerId: 1,
                salonId: 1,
                paymentMonth: '2026-02-01',
                baseSalary: 1000,
                commission: 200,
                tips: 50,
                totalAmount: 1250,
                paidAmount: 1250,
                paidDate: new Date().toISOString(),
                paidBy: 1,
                status: 'approved' as const
            };

            mocks.single.mockResolvedValue({
                data: { id: 123, ...paymentData },
                error: null
            });

            const result = await payrollService.recordPayment(paymentData);

            expect(mocks.from).toHaveBeenCalledWith('salary_payments');
            expect(mocks.insert).toHaveBeenCalled();
            expect(result.id).toBe(123);
        });
    });

    describe('getWorkerPaymentHistory', () => {
        it('should use bulk RPC to fetch consolidated history', async () => {
            const workerId = 1;
            const month = new Date('2026-02-01');
            const mockPayments = [{ id: 101 }, { id: 102 }];
            const mockHistory = [
                { id: 1, payment_id: 101, new_status: 'approved', changed_at: new Date().toISOString() }
            ];

            // 1. Mock payment lookup
            mocks.select.mockReturnValue({
                eq: vi.fn().mockReturnThis(),
                then: (cb: any) => Promise.resolve(cb({ data: mockPayments, error: null }))
            });

            // 2. Mock RPC call
            mocks.rpc.mockResolvedValue({ data: mockHistory, error: null });

            const history = await payrollService.getWorkerPaymentHistory(workerId, month);

            expect(mocks.rpc).toHaveBeenCalledWith('get_payment_history_secure_bulk', expect.anything());
            expect(history).toHaveLength(1);
            expect(history[0].newStatus).toBe('approved');
        });

        it('should fallback to direct query if RPC fails', async () => {
            const workerId = 1;
            const month = new Date('2026-02-01');

            // 1. Mock payment lookup
            mocks.select.mockReturnValue({
                eq: vi.fn().mockReturnThis(),
                then: (cb: any) => Promise.resolve(cb({ data: [{ id: 101 }], error: null }))
            });

            // 2. Mock RPC failure
            mocks.rpc.mockResolvedValue({ data: null, error: { message: 'Method not found' } });

            // 3. Mock fallback query
            mocks.from.mockImplementation((table) => {
                if (table === 'payment_status_history') {
                    return {
                        select: () => ({
                            in: () => ({
                                order: () => Promise.resolve({ data: [{ id: 1, payment_id: 101, new_status: 'pending' }], error: null })
                            })
                        })
                    };
                }
                // default for salary_payments lookup
                return {
                    select: () => ({
                        eq: () => ({
                            eq: () => Promise.resolve({ data: [{ id: 101 }], error: null })
                        })
                    })
                };
            });

            const history = await payrollService.getWorkerPaymentHistory(workerId, month);

            expect(history).toHaveLength(1);
            expect(history[0].newStatus).toBe('pending');
        });
    });

    describe('updatePaymentStatus', () => {
        it('should try RPC first', async () => {
            const paymentId = 101;
            const newStatus = 'approved';
            const userId = 1;

            mocks.rpc.mockResolvedValue({ data: null, error: null });

            await payrollService.updatePaymentStatus(paymentId, newStatus, userId);

            expect(mocks.rpc).toHaveBeenCalledWith('update_payment_status', expect.anything());
            expect(mocks.from).not.toHaveBeenCalled();
        });

        it('should fallback to direct update if RPC fails', async () => {
            const paymentId = 101;
            const newStatus = 'approved';
            const userId = 1;

            mocks.rpc.mockResolvedValue({ data: null, error: { message: 'RPC Failed' } });
            mocks.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            });

            await payrollService.updatePaymentStatus(paymentId, newStatus, userId);

            expect(mocks.from).toHaveBeenCalledWith('salary_payments');
            expect(mocks.update).toHaveBeenCalled();
        });
    });
});
