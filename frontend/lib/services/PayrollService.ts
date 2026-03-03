import { supabase } from '@/lib/supabase/client';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'disputed' | 'auto_approved' | 'cancelled' | 'refunded';

export interface SalaryPayment {
    id?: number;
    workerId: number;
    salonId: number;
    paymentMonth: string; // ISO format date string (first day of month)
    baseSalary: number;
    commission: number;
    tips: number;
    totalAmount: number;
    paidAmount: number;
    paidDate: string; // ISO format date string
    paidBy?: number;
    notes?: string;
    status?: PaymentStatus;
    workerApprovedAt?: string;
    workerRejectedAt?: string;
    rejectionReason?: string;
    lastStatusChangeAt?: string;
    lastStatusChangedBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentStatusHistory {
    id: number;
    paymentId: number;
    previousStatus?: PaymentStatus;
    newStatus: PaymentStatus;
    changedBy?: number;
    changedByName?: string;
    changedByRole?: string;
    changedAt: string;
    reason?: string;
    metadata?: Record<string, any>;
}

export interface PaymentWithHistory extends SalaryPayment {
    history: PaymentStatusHistory[];
}

export interface PayrollSummary {
    workerId: number;
    workerName: string;
    baseSalary: number;
    commission: number;
    tips: number;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'paid' | 'partial' | 'pending' | 'auto-paid';
    lastPaymentDate?: string;
}

class PayrollService {
    /**
     * Record a salary payment for a worker
     */
    async recordPayment(payment: Omit<SalaryPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryPayment> {
        const { data, error } = await supabase
            .from('salary_payments')
            .insert({
                worker_id: payment.workerId,
                salon_id: payment.salonId,
                payment_month: payment.paymentMonth,
                base_salary: payment.baseSalary,
                commission: payment.commission,
                tips: payment.tips,
                total_amount: payment.totalAmount,
                paid_amount: payment.paidAmount,
                paid_date: payment.paidDate,
                paid_by: payment.paidBy,
                notes: payment.notes,
                // Set status to 'approved' by default for manager-created payments
                status: payment.status || 'approved',
                last_status_changed_by: payment.paidBy,
                last_status_change_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Log the creation event in history
        if (data.id) {
            await supabase.from('payment_status_history').insert({
                payment_id: data.id,
                new_status: data.status,
                changed_by: payment.paidBy,
                changed_at: new Date().toISOString(),
                reason: payment.notes || 'Payment recorded',
                metadata: { action: 'created', amount: data.paid_amount }
            });
        }

        return {
            id: data.id,
            workerId: data.worker_id,
            salonId: data.salon_id,
            paymentMonth: data.payment_month,
            baseSalary: data.base_salary || 0,
            commission: data.commission || 0,
            tips: data.tips || 0,
            totalAmount: data.total_amount,
            paidAmount: data.paid_amount,
            paidDate: data.paid_date,
            paidBy: data.paid_by,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Get all payments for a specific month and salon
     */
    async getPaymentsByMonth(salonId: number, month: Date): Promise<SalaryPayment[]> {
        // Format month as first day: YYYY-MM-01
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;

        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('salon_id', salonId)
            .eq('payment_month', monthStr)
            .order('paid_date', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: any) => ({
            id: item.id,
            workerId: item.worker_id,
            salonId: item.salon_id,
            paymentMonth: item.payment_month,
            baseSalary: item.base_salary || 0,
            commission: item.commission || 0,
            tips: item.tips || 0,
            totalAmount: item.total_amount,
            paidAmount: item.paid_amount,
            paidDate: item.paid_date,
            paidBy: item.paid_by,
            notes: item.notes,
            status: item.status,
            workerApprovedAt: item.worker_approved_at,
            workerRejectedAt: item.worker_rejected_at,
            rejectionReason: item.rejection_reason,
            lastStatusChangeAt: item.last_status_change_at,
            lastStatusChangedBy: item.last_status_changed_by,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(paymentId: number, status: PaymentStatus, userId: number, reason?: string): Promise<void> {
        const { error } = await supabase.rpc('update_payment_status', {
            p_payment_id: paymentId,
            p_new_status: status,
            p_reason: reason,
            p_changed_by: userId
        });

        // Fallback if RPC fails or doesn't exist
        if (error) {
            // Fetch current notes first to allow appending in fallback
            const { data: currentPayment } = await supabase
                .from('salary_payments')
                .select('notes')
                .eq('id', paymentId)
                .single();

            const existingNotes = currentPayment?.notes || "";
            const dateStr = new Date().toLocaleDateString();

            // Try direct update if RPC fails
            const updates: any = {
                status: status,
                last_status_changed_by: userId,
                last_status_change_at: new Date().toISOString()
            };

            // If a reason is provided, append it
            if (reason) {
                updates.notes = existingNotes
                    ? `${existingNotes}\n[${dateStr}] ${reason}`
                    : reason;
            }

            const { error: updateError } = await supabase
                .from('salary_payments')
                .update(updates)
                .eq('id', paymentId);

            if (updateError) throw updateError;
        } else if (reason) {
            // Even if RPC succeeded, if we have a reason, let's append it to the notes column
            // Fetch current notes first
            const { data: currentPayment } = await supabase
                .from('salary_payments')
                .select('notes')
                .eq('id', paymentId)
                .single();

            const existingNotes = currentPayment?.notes || "";
            const dateStr = new Date().toLocaleDateString();
            const newNotes = existingNotes
                ? `${existingNotes}\n[${dateStr}] ${reason}`
                : reason;

            await supabase
                .from('salary_payments')
                .update({ notes: newNotes })
                .eq('id', paymentId);
        }
    }

    /**
     * Update payment details (amount, notes, date)
     */
    async updatePayment(paymentId: number, updates: Partial<SalaryPayment>): Promise<void> {
        const dbUpdates: any = {
            paid_amount: updates.paidAmount,
            notes: updates.notes,
            paid_date: updates.paidDate,
            updated_at: new Date().toISOString()
        };

        if (updates.status) {
            dbUpdates.status = updates.status;
        }

        if (updates.lastStatusChangedBy) {
            dbUpdates.last_status_changed_by = updates.lastStatusChangedBy;
            dbUpdates.last_status_change_at = new Date().toISOString();
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('salary_payments')
            .update(dbUpdates)
            .select('status, last_status_changed_by')
            .eq('id', paymentId)
            .single();

        if (updateError) throw updateError;

        // Log the modification event in history
        if (updatedData) {
            await supabase.from('payment_status_history').insert({
                payment_id: paymentId,
                new_status: updatedData.status,
                changed_by: updatedData.last_status_changed_by,
                changed_at: new Date().toISOString(),
                reason: updates.notes || 'Payment details modified',
                metadata: { action: 'modified', ...updates }
            });
        }
    }

    /**
     * Get payment summary for a worker in a specific month
     */
    async getWorkerPaymentSummary(workerId: number, month: Date): Promise<{ totalPaid: number; lastPaymentDate?: string }> {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;

        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('worker_id', workerId)
            .eq('payment_month', monthStr)
            .order('paid_date', { ascending: false });

        if (error) throw error;

        const totalPaid = (data || []).reduce((sum: number, payment: any) => sum + (payment.paid_amount || 0), 0);
        const lastPaymentDate = (data && data.length > 0) ? data[0].paid_date : undefined;

        return { totalPaid, lastPaymentDate };
    }

    /**
     * Get payment history for a salon (all months)
     */
    /**
     * Get recent payment history
     */
    async getPaymentHistory(salonId: number, limit: number = 10): Promise<any[]> {
        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('salon_id', salonId)
            .order('paid_date', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Get worker details for these payments
        const workerIds = [...new Set((data || []).map((p: any) => p.worker_id))];
        const { data: workers, error: workersError } = await supabase
            .from('workers')
            .select('id, name') // Assuming name is in workers table, or use join if normalized
            .in('id', workerIds);

        if (workersError) {
            console.error("Error fetching workers for history:", workersError);
        }

        const workerMap = new Map();
        (workers || []).forEach((w: any) => workerMap.set(w.id, w.name));

        return (data || []).map((payment: any) => ({
            id: payment.id,
            date: payment.paid_date,
            workerId: payment.worker_id,
            workerName: workerMap.get(payment.worker_id) || 'Unknown Worker',
            amount: payment.paid_amount || 0,
            status: payment.status,
            paymentMethod: 'Cash', // Default for now, ideally from DB if column exists
            notes: payment.notes
        }));
    }

    /**
     * Get status change history for a specific payment
     */
    async getPaymentStatusHistory(paymentId: number): Promise<PaymentStatusHistory[]> {
        // Use RPC function to bypass permission issues
        const { data, error } = await supabase
            .rpc('get_payment_history_secure', { p_payment_id: paymentId });

        if (error) {
            console.error('RPC Error fetching history:', error);
            throw error;
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            paymentId: item.payment_id,
            previousStatus: item.previous_status,
            newStatus: item.new_status,
            changedBy: item.changed_by,
            changedByName: item.changed_by_name,
            changedByRole: item.changed_by_role,
            changedAt: item.changed_at,
            reason: item.reason,
            metadata: item.metadata,
        }));
    }

    /**
     * Get consolidated history for all payments of a worker in a specific month
     */
    async getWorkerPaymentHistory(workerId: number, month: Date): Promise<PaymentStatusHistory[]> {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;

        // 1. Get all payment IDs for this worker and month
        const { data: payments, error: paymentsError } = await supabase
            .from('salary_payments')
            .select('id')
            .eq('worker_id', workerId)
            .eq('payment_month', monthStr);

        if (paymentsError) throw paymentsError;
        if (!payments || payments.length === 0) return [];

        const paymentIds = payments.map((p: any) => p.id);

        // 2. Get history for all those payments
        const { data: history, error: historyError } = await supabase
            .rpc('get_payment_history_secure_bulk', { p_payment_ids: paymentIds });

        // Fallback if bulk secure RPC doesn't exist yet
        if (historyError) {
            console.warn('get_payment_history_secure_bulk failed, falling back to basic query:', historyError);
            const { data: basicHistory, error: basicError } = await supabase
                .from('payment_status_history')
                .select('*')
                .in('payment_id', paymentIds)
                .order('changed_at', { ascending: false });

            if (basicError) throw basicError;
            return basicHistory.map((h: any) => ({
                id: h.id,
                paymentId: h.payment_id,
                previousStatus: h.previous_status,
                newStatus: h.new_status,
                changedBy: h.changed_by,
                changedAt: h.changed_at,
                reason: h.reason,
                metadata: h.metadata,
            }));
        }

        return (history || []).map((item: any) => ({
            id: item.id,
            paymentId: item.payment_id,
            previousStatus: item.previous_status,
            newStatus: item.new_status,
            changedBy: item.changed_by,
            changedByName: item.changed_by_name,
            changedByRole: item.changed_by_role,
            changedAt: item.changed_at,
            reason: item.reason,
            metadata: item.metadata,
        }));
    }

    /**
     * Get all payments for a specific worker
     */
    async getWorkerPayments(workerId: number, limit: number = 20): Promise<SalaryPayment[]> {
        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('worker_id', workerId)
            .order('paid_date', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map((payment: any) => ({
            id: payment.id,
            workerId: payment.worker_id,
            salonId: payment.salon_id,
            paymentMonth: payment.payment_month,
            baseSalary: payment.base_salary,
            commission: payment.commission,
            tips: payment.tips,
            totalAmount: payment.total_amount,
            paidAmount: payment.paid_amount,
            paidDate: payment.paid_date,
            paidBy: payment.paid_by,
            notes: payment.notes,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
        }));
    }

    /**
     * Get worker payments for a specific month
     */
    async getWorkerPaymentsByMonth(workerId: number, month: Date): Promise<SalaryPayment[]> {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;

        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('worker_id', workerId)
            .eq('payment_month', monthStr)
            .order('paid_date', { ascending: false });

        if (error) throw error;

        return (data || []).map((payment: any) => ({
            id: payment.id,
            workerId: payment.worker_id,
            salonId: payment.salon_id,
            paymentMonth: payment.payment_month,
            baseSalary: payment.base_salary,
            commission: payment.commission,
            tips: payment.tips,
            totalAmount: payment.total_amount,
            paidAmount: payment.paid_amount,
            paidDate: payment.paid_date,
            paidBy: payment.paid_by,
            notes: payment.notes,
            status: payment.status,
            workerApprovedAt: payment.worker_approved_at,
            workerRejectedAt: payment.worker_rejected_at,
            rejectionReason: payment.rejection_reason,
            lastStatusChangeAt: payment.last_status_change_at,
            lastStatusChangedBy: payment.last_status_changed_by,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
        }));
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
        const { error } = await supabase
            .from('salary_payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;
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
        const { data: payment, error: fetchError } = await supabase
            .from('salary_payments')
            .select('worker_id, status')
            .eq('id', paymentId)
            .single();

        if (fetchError) throw fetchError;
        if (!payment) throw new Error('Payment not found');
        if (payment.worker_id !== workerId) {
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
        if (!reason || reason.trim().length === 0) {
            throw new Error('Rejection reason is required');
        }

        // Verify the payment belongs to this worker
        const { data: payment, error: fetchError } = await supabase
            .from('salary_payments')
            .select('worker_id, status')
            .eq('id', paymentId)
            .single();

        if (fetchError) throw fetchError;
        if (!payment) throw new Error('Payment not found');
        if (payment.worker_id !== workerId) {
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
        if (!disputeNote || disputeNote.trim().length === 0) {
            throw new Error('Dispute note is required');
        }

        // Verify the payment belongs to this worker
        const { data: payment, error: fetchError } = await supabase
            .from('salary_payments')
            .select('worker_id, status')
            .eq('id', paymentId)
            .single();

        if (fetchError) throw fetchError;
        if (!payment) throw new Error('Payment not found');
        if (payment.worker_id !== workerId) {
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
        // Fetch payment
        const { data: paymentData, error: paymentError } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (paymentError) throw paymentError;
        if (!paymentData) throw new Error('Payment not found');

        // Fetch history
        const { data: historyData, error: historyError } = await supabase
            .from('payment_status_history')
            .select('*')
            .eq('payment_id', paymentId)
            .order('changed_at', { ascending: false });

        if (historyError) throw historyError;

        const payment: SalaryPayment = {
            id: paymentData.id,
            workerId: paymentData.worker_id,
            salonId: paymentData.salon_id,
            paymentMonth: paymentData.payment_month,
            baseSalary: paymentData.base_salary,
            commission: paymentData.commission,
            tips: paymentData.tips,
            totalAmount: paymentData.total_amount,
            paidAmount: paymentData.paid_amount,
            paidDate: paymentData.paid_date,
            paidBy: paymentData.paid_by,
            notes: paymentData.notes,
            status: paymentData.status,
            workerApprovedAt: paymentData.worker_approved_at,
            workerRejectedAt: paymentData.worker_rejected_at,
            rejectionReason: paymentData.rejection_reason,
            lastStatusChangeAt: paymentData.last_status_change_at,
            lastStatusChangedBy: paymentData.last_status_changed_by,
            createdAt: paymentData.created_at,
            updatedAt: paymentData.updated_at,
        };

        const history: PaymentStatusHistory[] = (historyData || []).map((h: any) => ({
            id: h.id,
            paymentId: h.payment_id,
            previousStatus: h.previous_status,
            newStatus: h.new_status,
            changedBy: h.changed_by,
            changedAt: h.changed_at,
            reason: h.reason,
            metadata: h.metadata,
        }));

        return { ...payment, history };
    }

    /**
     * Get payments filtered by status
     */
    async getPaymentsByStatus(
        salonId: number,
        status: PaymentStatus
    ): Promise<SalaryPayment[]> {
        const { data, error } = await supabase
            .from('salary_payments')
            .select('*')
            .eq('salon_id', salonId)
            .eq('status', status)
            .order('paid_date', { ascending: false });

        if (error) throw error;

        return (data || []).map((payment: any) => ({
            id: payment.id,
            workerId: payment.worker_id,
            salonId: payment.salon_id,
            paymentMonth: payment.payment_month,
            baseSalary: payment.base_salary,
            commission: payment.commission,
            tips: payment.tips,
            totalAmount: payment.total_amount,
            paidAmount: payment.paid_amount,
            paidDate: payment.paid_date,
            paidBy: payment.paid_by,
            notes: payment.notes,
            status: payment.status,
            workerApprovedAt: payment.worker_approved_at,
            workerRejectedAt: payment.worker_rejected_at,
            rejectionReason: payment.rejection_reason,
            lastStatusChangeAt: payment.last_status_change_at,
            lastStatusChangedBy: payment.last_status_changed_by,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
        }));
    }
}

export const payrollService = new PayrollService();
