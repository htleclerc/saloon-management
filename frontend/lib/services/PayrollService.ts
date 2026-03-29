/**
 * Payroll Service
 *
 * Business logic for salary payments and payroll management.
 * Uses the IDataProvider abstraction instead of direct Supabase access.
 */

import { BaseService } from './BaseService';
import { PaymentRecordSchema, PaymentRejectionSchema, PaymentDisputeSchema } from '@/lib/validators';
import type {
    SalaryPayment,
    PaymentStatus,
    PaymentStatusHistory,
    PaymentWithHistory,
    SalonWorker,
} from '@/types';

/** Re-export types for backward compatibility */
export type { SalaryPayment, PaymentStatus, PaymentStatusHistory, PaymentWithHistory } from '@/types';

/** @deprecated Use PayrollSummary from '@/types' instead */
export type { PayrollSummary } from '@/types';

interface PaymentHistoryEntry {
    id: number;
    date: string;
    workerId: number;
    workerName: string;
    amount: number;
    status: PaymentStatus | undefined;
    paymentMethod: string;
    notes: string | undefined;
}

export class PayrollService extends BaseService {
    /**
     * Format a Date to YYYY-MM-01 month string
     */
    private formatMonth(month: Date): string {
        return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;
    }

    /**
     * Record a salary payment for a worker
     */
    async recordPayment(payment: Omit<SalaryPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryPayment> {
        PaymentRecordSchema.parse(payment);

        const created = await this.provider.createSalaryPayment({
            ...payment,
            status: payment.status || 'approved',
            lastStatusChangedBy: payment.paidBy,
            lastStatusChangeAt: new Date().toISOString(),
        });

        // Log the creation event in history
        if (created.id) {
            await this.provider.createPaymentStatusHistory({
                paymentId: created.id,
                newStatus: (created.status || 'approved') as PaymentStatus,
                changedBy: payment.paidBy,
                changedAt: new Date().toISOString(),
                reason: payment.notes || 'Payment recorded',
                metadata: { action: 'created', amount: created.paidAmount },
            });
        }

        return created;
    }

    /**
     * Get all payments for a specific month and salon
     */
    async getPaymentsByMonth(salonId: number, month: Date): Promise<SalaryPayment[]> {
        const monthStr = this.formatMonth(month);
        return this.provider.getSalaryPaymentsByMonth(salonId, monthStr);
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(paymentId: number, status: PaymentStatus, userId: number, reason?: string): Promise<void> {
        await this.provider.updateSalaryPaymentStatus(paymentId, status, userId, reason);
    }

    /**
     * Update payment details (amount, notes, date)
     */
    async updatePayment(paymentId: number, updates: Partial<SalaryPayment>): Promise<void> {
        const updated = await this.provider.updateSalaryPayment(paymentId, updates);

        // Log the modification event in history
        if (updated) {
            await this.provider.createPaymentStatusHistory({
                paymentId,
                newStatus: (updated.status || 'approved') as PaymentStatus,
                changedBy: updated.lastStatusChangedBy,
                changedAt: new Date().toISOString(),
                reason: updates.notes || 'Payment details modified',
                metadata: { action: 'modified' },
            });
        }
    }

    /**
     * Get payment summary for a worker in a specific month
     */
    async getWorkerPaymentSummary(workerId: number, month: Date): Promise<{ totalPaid: number; lastPaymentDate?: string }> {
        const monthStr = this.formatMonth(month);

        // Get all payments for this worker+month via provider
        const payments = await this.provider.getSalaryPaymentsByWorker(workerId);
        const monthPayments = payments.filter(p => p.paymentMonth === monthStr);

        const totalPaid = monthPayments.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
        const sorted = monthPayments.sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''));
        const lastPaymentDate = sorted.length > 0 ? sorted[0].paidDate : undefined;

        return { totalPaid, lastPaymentDate };
    }

    /**
     * Get recent payment history with worker names
     */
    async getPaymentHistory(salonId: number, limit: number = 10): Promise<PaymentHistoryEntry[]> {
        const payments = await this.provider.getSalaryPayments(salonId);
        const recentPayments = payments.slice(0, limit);

        // Get unique worker IDs and fetch names
        const workerIds = [...new Set(recentPayments.map(p => p.workerId))];
        const workerMap = new Map<number, string>();

        for (const wId of workerIds) {
            const worker = await this.provider.getWorker(wId);
            if (worker) {
                workerMap.set(wId, worker.name);
            }
        }

        return recentPayments.map(payment => ({
            id: payment.id || 0,
            date: payment.paidDate,
            workerId: payment.workerId,
            workerName: workerMap.get(payment.workerId) || 'Unknown Worker',
            amount: payment.paidAmount || 0,
            status: payment.status,
            paymentMethod: 'Cash',
            notes: payment.notes,
        }));
    }

    /**
     * Get status change history for a specific payment
     */
    async getPaymentStatusHistory(paymentId: number): Promise<PaymentStatusHistory[]> {
        return this.provider.getPaymentStatusHistory(paymentId);
    }

    /**
     * Get consolidated history for all payments of a worker in a specific month
     */
    async getWorkerPaymentHistory(workerId: number, month: Date): Promise<PaymentStatusHistory[]> {
        const monthStr = this.formatMonth(month);

        // Get all payments for this worker and month
        const allPayments = await this.provider.getSalaryPaymentsByWorker(workerId);
        const monthPayments = allPayments.filter(p => p.paymentMonth === monthStr);
        if (monthPayments.length === 0) return [];

        const paymentIds = monthPayments.map(p => p.id).filter((id): id is number => id !== undefined);

        return this.provider.getPaymentStatusHistoryBulk(paymentIds);
    }

    /**
     * Get all payments for a specific worker
     */
    async getWorkerPayments(workerId: number, limit: number = 20): Promise<SalaryPayment[]> {
        return this.provider.getSalaryPaymentsByWorker(workerId, limit);
    }

    /**
     * Get worker payments for a specific month
     */
    async getWorkerPaymentsByMonth(workerId: number, month: Date): Promise<SalaryPayment[]> {
        const allPayments = await this.provider.getSalaryPaymentsByWorker(workerId);
        const monthStr = this.formatMonth(month);
        return allPayments.filter(p => p.paymentMonth === monthStr);
    }

    /**
     * Validate if a date is within the last 30 days
     */
    isWithin30Days(date: string): boolean {
        const paymentDate = new Date(date);
        const today = new Date();
        const diffTime = today.getTime() - paymentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    }

    /**
     * Delete a payment record
     */
    async deletePayment(paymentId: number): Promise<void> {
        await this.provider.deleteSalaryPayment(paymentId);
    }

    /**
     * Worker approves a payment
     */
    async approvePayment(
        paymentId: number,
        workerId: number,
        userId: number
    ): Promise<void> {
        // Verify the payment belongs to this worker
        const payment = await this.provider.getSalaryPayment(paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.workerId !== workerId) {
            throw new Error('Unauthorized: Payment does not belong to this worker');
        }
        if (payment.status !== 'pending') {
            throw new Error(`Cannot approve payment with status: ${payment.status}`);
        }

        await this.updatePaymentStatus(paymentId, 'approved', userId);
    }

    /**
     * Worker rejects a payment
     */
    async rejectPayment(
        paymentId: number,
        workerId: number,
        reason: string
    ): Promise<void> {
        PaymentRejectionSchema.parse({ paymentId, workerId, reason });

        const payment = await this.provider.getSalaryPayment(paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.workerId !== workerId) {
            throw new Error('Unauthorized: Payment does not belong to this worker');
        }
        if (payment.status !== 'approved') {
            throw new Error(`Can only reject approved payments. Current status: ${payment.status}`);
        }

        await this.updatePaymentStatus(paymentId, 'rejected', workerId, reason);
    }

    /**
     * Worker disputes a payment
     */
    async disputePayment(
        paymentId: number,
        workerId: number,
        disputeNote: string
    ): Promise<void> {
        PaymentDisputeSchema.parse({ paymentId, workerId, disputeNote });

        const payment = await this.provider.getSalaryPayment(paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.workerId !== workerId) {
            throw new Error('Unauthorized: Payment does not belong to this worker');
        }
        if (payment.status !== 'approved') {
            throw new Error(`Can only dispute approved payments. Current status: ${payment.status}`);
        }

        await this.updatePaymentStatus(paymentId, 'disputed', workerId, disputeNote);
    }

    /**
     * Get payment with full history
     */
    async getPaymentWithHistory(paymentId: number): Promise<PaymentWithHistory> {
        const payment = await this.provider.getSalaryPayment(paymentId);
        if (!payment) throw new Error('Payment not found');

        const history = await this.provider.getPaymentStatusHistory(paymentId);

        return { ...payment, history };
    }

    /**
     * Get payments filtered by status
     */
    async getPaymentsByStatus(
        salonId: number,
        status: PaymentStatus
    ): Promise<SalaryPayment[]> {
        return this.provider.getSalaryPaymentsByStatus(salonId, status);
    }
}

export const payrollService = new PayrollService();
