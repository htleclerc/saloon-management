"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, CreditCard, FileText, Download, Calendar, Plus, History, Check, XCircle, Edit, Lock, Trash2 } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { revenueStatsService } from "@/lib/services/RevenueStatsService";
import { payrollService } from "@/lib/services/PayrollService";
import { workerService } from "@/lib/services/WorkerService";
import { useNotifications } from "@/context/NotificationProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { useEffect, useState, useRef } from "react";
import { format as formatDate, endOfMonth, addDays, startOfMonth } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import PaymentStatusBadge from "@/components/ui/PaymentStatusBadge";
import PaymentHistoryModal from "@/components/ui/PaymentHistoryModal";
import WorkerPaymentsModal from "@/components/ui/WorkerPaymentsModal";
import type { PaymentStatusHistory, SalaryPayment } from "@/lib/services/PayrollService";

interface PayrollEntry {
    id: number;
    name: string;
    baseSalary: number;
    commission: number;
    tips: number;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'paid' | 'partial' | 'pending' | 'auto-paid';
    paymentStatus?: 'approved' | 'disputed' | 'rejected' | 'pending' | 'auto_approved'; // Real payment status from DB
    paymentId?: number; // Latest payment ID
    lastPaymentDate?: string;
    userId?: number;
}

// Helper function to calculate payment status
const calculatePaymentStatus = (
    month: Date,
    paidAmount: number,
    totalDue: number
): 'paid' | 'partial' | 'pending' | 'auto-paid' => {
    const monthEnd = endOfMonth(month);
    const autoPayThreshold = addDays(monthEnd, 10);
    const today = new Date();

    // Auto-paid if more than 10 days past month end
    if (today > autoPayThreshold) {
        return 'auto-paid';
    }

    // Paid if full amount is paid
    if (paidAmount >= totalDue && totalDue > 0) {
        return 'paid';
    }

    // Partial if some amount is paid
    if (paidAmount > 0) {
        return 'partial';
    }

    // Otherwise pending
    return 'pending';
};

export default function TeamPayrollPage() {
    const { getCardStyle } = useKpiCardStyle();
    const { format } = useCurrency();
    const { t, language } = useTranslation();
    const monthInputRef = useRef<HTMLInputElement>(null);
    const { activeSalonId, user } = useAuth();
    const { showToast } = useToast();
    const { addNotification } = useNotifications();
    const { confirm } = useConfirm();
    const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<PayrollEntry | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPaymentHistory, setSelectedPaymentHistory] = useState<PaymentStatusHistory[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [showWorkerPaymentsModal, setShowWorkerPaymentsModal] = useState(false);
    const [selectedWorkerPayments, setSelectedWorkerPayments] = useState<SalaryPayment[]>([]);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedPaymentNotes, setSelectedPaymentNotes] = useState<string>('');

    const loadPayrollData = async () => {
        if (!activeSalonId) return;
        try {
            const salonId = parseInt(activeSalonId);

            // Get base payroll data
            const data = await revenueStatsService.getPayrollStats(salonId);

            // Try to get payment data, fallback to empty if table doesn't exist
            let hist: any[] = [];
            let payments: any[] = [];

            try {
                // Determine limits for history based on screen size or just default 20
                const [historyData, monthPayments] = await Promise.all([
                    payrollService.getPaymentHistory(salonId, 20),
                    payrollService.getPaymentsByMonth(salonId, selectedMonth)
                ]);
                hist = historyData;
                payments = monthPayments;
            } catch (paymentError) {
                console.warn("Payment data not available (run migration first):", paymentError);
            }

            // Create a map of worker payments
            const paymentMap = new Map<number, number>();
            payments.forEach(payment => {
                const current = paymentMap.get(payment.workerId) || 0;
                paymentMap.set(payment.workerId, current + payment.paidAmount);
            });

            // Enhance data with payment tracking
            const enhancedData = data.map((worker: any) => {
                const paidAmount = paymentMap.get(worker.id) || 0;

                // Use total from worker stats as per original logic
                const remainingAmount = worker.total - paidAmount;

                // Get the latest payment status for this worker
                const workerPayments = payments.filter(p => p.workerId === worker.id);
                const latestPayment = workerPayments.length > 0
                    ? workerPayments.sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime())[0]
                    : null;

                return {
                    ...worker,
                    paidAmount,
                    remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
                    status: calculatePaymentStatus(
                        selectedMonth,
                        paidAmount,
                        worker.total
                    ),
                    paymentStatus: latestPayment?.status || undefined,
                    paymentId: latestPayment?.id,
                    lastPaymentDate: latestPayment?.paidDate
                };
            });

            setPayrollData(enhancedData);
            setHistory(hist);
        } catch (error) {
            console.error("Failed to load payroll stats:", error);
            showToast(t("common.error"), t("errors.failedToLoadData"), "error");
        }
    };

    useEffect(() => {
        loadPayrollData();
    }, [activeSalonId, selectedMonth]);

    // Handle status updates
    const handleUpdateStatus = async (paymentId: number, status: 'approved' | 'cancelled', reason?: string, workerId?: number) => {
        if (!user?.id) {
            showToast(t("common.error"), "User not authenticated", "error");
            return;
        }

        try {
            // Parse user.id to number (Supabase auth ID is string, but our DB user_id is number)
            const userId = parseInt(user.id);
            await payrollService.updatePaymentStatus(paymentId, status as any, userId, reason);
            showToast(t("common.success"), t("team.paymentUpdated") || "Payment updated", "success");

            // Notify Worker
            try {
                // Try to find worker ID from payrollData, history, or provided param
                let targetWorkerId = workerId;

                if (!targetWorkerId) {
                    const worker = payrollData.find(w => w.paymentId === paymentId);
                    if (worker) {
                        targetWorkerId = worker.id;
                    } else {
                        // Look in history
                        const historyItem = history.find(h => h.id === paymentId);
                        if (historyItem) targetWorkerId = historyItem.workerId;
                    }
                }

                if (targetWorkerId) {
                    const userCode = await workerService.getUserCode(targetWorkerId);
                    if (userCode) {
                        // Find amount for notification message
                        let amount = 0;
                        const workerInStats = payrollData.find(w => w.id === targetWorkerId);
                        if (workerInStats && workerInStats.paymentId === paymentId) {
                            amount = workerInStats.paidAmount;
                        } else {
                            const historyItem = history.find(h => h.id === paymentId);
                            if (historyItem) amount = historyItem.amount;
                        }

                        addNotification({
                            type: status === 'approved' ? 'success' : 'warning',
                            title: status === 'approved' ? t("team.paymentApprovedNotif") || "Payment Approved" : t("team.paymentCancelledNotif") || "Payment Cancelled",
                            message: status === 'approved'
                                ? t("team.paymentApprovedMsg", { amount: format(amount) }) || `Your payment for ${format(amount)} has been approved.`
                                : t("team.paymentCancelledMsg") || `A payment has been cancelled.`,
                            targetUserCode: userCode
                        });
                    }
                }
            } catch (notifError) {
                console.warn("Failed to send notification:", notifError);
            }

            // Refresh data
            loadPayrollData();
        } catch (error: any) {
            console.error('Failed to update payment status:', error);
            showToast(t("common.error"), `Failed to update status: ${error.message || 'Unknown error'}`, "error");
        }
    };

    const totalPayroll = payrollData.reduce((sum, w) => sum + w.total, 0);
    const totalCommissions = payrollData.reduce((sum, w) => sum + w.commission, 0);
    const totalPaid = payrollData.reduce((sum, w) => sum + w.paidAmount, 0);
    const totalRemaining = payrollData.reduce((sum, w) => sum + w.remainingAmount, 0);
    const pendingPayments = payrollData.filter((w) => w.status === "pending" || w.status === "partial").length;

    // Payment form state
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [originalPaymentAmount, setOriginalPaymentAmount] = useState(0);

    // Reset form when worker is selected, but only if not in edit mode
    useEffect(() => {
        if (selectedWorker && !isEditMode) {
            setPaymentAmount(selectedWorker.remainingAmount);
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentNotes('');
        }
    }, [selectedWorker, isEditMode]);

    // Handle viewing worker's monthly payments
    const handleViewWorkerPayments = async (workerId: number, workerName: string) => {
        try {
            const payments = await payrollService.getWorkerPaymentsByMonth(workerId, selectedMonth);
            setSelectedWorkerPayments(payments);
            setSelectedWorker({ id: workerId, name: workerName } as PayrollEntry);
            setShowWorkerPaymentsModal(true);
        } catch (error: any) {
            console.error('Failed to load worker payments:', error);
            showToast(t("common.error"), `Failed to load payment details: ${error.message || 'Unknown error'}`, "error");
        }
    };

    // Handle viewing status history for a specific payment
    const handleViewStatusHistory = async (paymentId: number, workerName: string) => {
        try {
            const history = await payrollService.getPaymentStatusHistory(paymentId);
            setSelectedPaymentHistory(history);
            setSelectedPaymentId(paymentId);
            setSelectedWorker({ name: workerName } as PayrollEntry);
            setShowHistoryModal(true);
        } catch (error: any) {
            console.error('Failed to load payment history:', error);
            showToast(t("common.error"), `Failed to load payment history: ${error.message || 'Unknown error'}`, "error");
        }
    };

    // Handle opening edit modal
    const handleEditPayment = (payment: any, worker: any) => {
        const fullWorker = payrollData.find(w => w.name === worker.name) || worker;
        setSelectedWorker(fullWorker);
        setPaymentAmount(payment.amount);
        setOriginalPaymentAmount(payment.amount);
        setPaymentDate(new Date(payment.date).toISOString().split('T')[0]);
        setPaymentNotes(payment.notes || '');
        setSelectedPaymentId(payment.id);
        setIsEditMode(true);
        setShowPaymentModal(true);
    };

    // Handle closing/locking payment
    const handleClosePayment = async (paymentId: number, workerId?: number) => {
        const confirmed = await confirm({
            title: t("team.closePayment") || "Close Payment",
            message: t("team.confirmClosePayment") || "Are you sure you want to close this payment? It cannot be disputed anymore.",
            type: 'info'
        });

        if (confirmed) {
            // Using 'approved' as the closed status per instructions to "validate"
            handleUpdateStatus(paymentId, 'approved', undefined, workerId);
        }
    };

    // Handle deleting payment
    const handleDeletePayment = async (paymentId: number, workerId?: number) => {
        const confirmed = await confirm({
            title: t("common.delete") || "Delete",
            message: t("team.confirmDeletePayment") || "Are you sure you want to delete this payment?",
            type: 'warning'
        });

        if (confirmed) {
            handleUpdateStatus(paymentId, 'cancelled', undefined, workerId);
        }
    };

    // Handle recording or updating a payment
    const handleRecordPayment = async () => {
        if (!selectedWorker || !activeSalonId || !user?.id) {
            showToast(t("common.error"), "Missing required information", "error");
            return;
        }

        // Validation
        const maxAllowed = isEditMode
            ? selectedWorker.total // If editing, just ensure we don't exceed total (or could be strict about remaining + original)
            : selectedWorker.remainingAmount;

        // If editing, we allow the amount to be up to the TOTAL due for the month,
        // to avoid issues where remaining is 0 but we want to correct a mistake.
        if (paymentAmount <= 0) {
            showToast(t("common.error"), t("team.invalidAmount"), "error");
            return;
        }

        // Check against total due
        if (paymentAmount > selectedWorker.total) {
            showToast(t("common.error"), t("team.amountExceedsTotal") || "Amount exceeds total due", "error");
            return;
        }

        setIsProcessing(true);
        try {
            const salonId = parseInt(activeSalonId);
            const monthStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-01`;

            if (isEditMode && selectedPaymentId) {
                // Update existing payment
                await payrollService.updatePayment(selectedPaymentId, {
                    paidAmount: paymentAmount,
                    paidDate: paymentDate,
                    notes: paymentNotes,
                    status: 'approved',
                    lastStatusChangedBy: parseInt(user.id)
                });
                showToast(t("common.success"), t("team.paymentUpdated"), "success");

                // Notify Worker
                try {
                    const userCode = await workerService.getUserCode(selectedWorker.id);
                    if (userCode) {
                        addNotification({
                            type: 'info',
                            title: t("team.paymentUpdatedNotif") || "Payment Updated",
                            message: t("team.paymentUpdatedMsg", { amount: format(paymentAmount) }) || `Your payment has been updated to ${format(paymentAmount)}.`,
                            targetUserCode: userCode
                        });
                    }
                } catch (notifError) {
                    console.warn("Failed to send notification:", notifError);
                }
            } else {
                // Create new payment
                if (paymentAmount > selectedWorker.remainingAmount) {
                    showToast(t("common.error"), t("team.invalidAmount"), "error");
                    setIsProcessing(false);
                    return;
                }

                await payrollService.recordPayment({
                    workerId: selectedWorker.id,
                    salonId,
                    paymentMonth: monthStr,
                    baseSalary: selectedWorker.baseSalary,
                    commission: selectedWorker.commission,
                    tips: selectedWorker.tips,
                    totalAmount: selectedWorker.total,
                    paidAmount: paymentAmount,
                    paidDate: paymentDate,
                    notes: paymentNotes,
                });
                showToast(t("common.success"), t("team.paymentRecorded"), "success");

                // Notify Worker
                try {
                    const userCode = await workerService.getUserCode(selectedWorker.id);
                    if (userCode) {
                        addNotification({
                            type: 'info',
                            title: t("team.newPayment") || "New Payment Recorded",
                            message: t("team.newPaymentMsg", { amount: format(paymentAmount) }) || `A new payment of ${format(paymentAmount)} has been recorded for you.`,
                            targetUserCode: userCode
                        });
                    }
                } catch (notifError) {
                    console.warn("Failed to send notification:", notifError);
                }
            }

            // Close modal
            setShowPaymentModal(false);
            setSelectedWorker(null);
            setPaymentAmount(0);
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentNotes('');
            setIsEditMode(false);
            setSelectedPaymentId(null);

            // Refresh data
            loadPayrollData();

        } catch (error: any) {
            console.error("Failed to save payment:", error);

            // Extract meaningful error message
            let errorMessage = "Unknown error";
            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error_description) {
                errorMessage = error.error_description;
            } else if (error?.hint) {
                errorMessage = error.hint;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            showToast(
                t("common.error"),
                `${errorMessage}`,
                "error",
                5000
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle exporting payroll data to CSV
    const handleExport = () => {
        if (payrollData.length === 0) {
            showToast(t("common.error"), t("common.noData"), "error");
            return;
        }

        const headers = [
            t("team.team"),
            t("team.baseSalary"),
            t("team.commissions"),
            t("team.tips"),
            t("common.total"),
            t("team.paid"),
            t("team.remaining"),
            t("common.status")
        ];

        const csvRows = [
            headers.join(','),
            ...payrollData.map(worker => [
                `"${worker.name}"`,
                worker.baseSalary,
                worker.commission,
                worker.tips,
                worker.total,
                worker.paidAmount,
                worker.remainingAmount,
                worker.status
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `payroll_${formatDate(selectedMonth, 'yyyy_MM')}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(t("common.success"), t("team.exportSuccess") || "Payroll exported successfully", "success");
    };

    // Helper for locale
    const getLocale = () => {
        switch (language) {
            case 'fr': return fr;
            case 'es': return es;
            default: return enUS;
        }
    };

    const currentMonthLabel = formatDate(new Date(), 'MMMM yyyy', { locale: getLocale() });

    return (
        <TeamLayout
            title={t("team.payroll")}
            description={t("team.payrollDesc")}
        >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t("team.totalDue")}
                    value={format(totalPayroll)}
                    subtitle={t("team.thisMonth")}
                    icon={DollarSign}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title={t("team.totalPaid")}
                    value={format(totalPaid)}
                    subtitle={formatDate(selectedMonth, 'MMMM yyyy', { locale: getLocale() })}
                    icon={Download}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title={t("team.remaining")}
                    value={format(totalRemaining)}
                    subtitle={t("team.toBePaid")}
                    icon={CreditCard}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title={t("team.pendingPayments")}
                    value={pendingPayments}
                    subtitle={t("team.team")}
                    icon={FileText}
                    gradient=""
                    style={getCardStyle(3)}
                />
            </div>

            {/* Payroll Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("team.salaryDetails")}</h3>
                            <p className="text-xs text-gray-500 capitalize">{currentMonthLabel}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                ref={monthInputRef}
                                type="month"
                                className="absolute inset-0 opacity-0 w-0 h-0"
                                value={formatDate(selectedMonth, 'yyyy-MM')}
                                onChange={(e) => {
                                    const date = new Date(e.target.value + '-01');
                                    if (!isNaN(date.getTime())) {
                                        setSelectedMonth(date);
                                    }
                                }}
                                title={t("team.selectMonth") || "Select Month"}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => monthInputRef.current?.showPicker?.() || monthInputRef.current?.click()}
                            >
                                <Calendar className="w-4 h-4" />
                                {t("team.period")}
                            </Button>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4" />
                            {t("common.export")}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.team")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.baseSalary")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.commissions")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.tips")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.total")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.paid")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.remaining")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payrollData.map((worker) => (
                                <tr key={worker.name} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">{worker.name}</td>
                                    <td className="px-4 py-4 text-right text-gray-600">{format(worker.baseSalary)}</td>
                                    <td className="px-4 py-4 text-right text-[var(--color-success)] font-medium">+{format(worker.commission)}</td>
                                    <td className="px-4 py-4 text-right text-[var(--color-primary)]">+{format(worker.tips)}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-900">{format(worker.total)}</td>
                                    <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">{format(worker.paidAmount)}</td>
                                    <td className="px-4 py-4 text-right font-semibold text-[var(--color-warning)]">{format(worker.remainingAmount)}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "paid"
                                            ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                            : worker.status === "auto-paid"
                                                ? "bg-blue-100 text-blue-600"
                                                : worker.status === "partial"
                                                    ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                                                    : "bg-red-100 text-red-600"
                                            }`}>
                                            {worker.status === "paid"
                                                ? t("team.paid")
                                                : worker.status === "auto-paid"
                                                    ? t("team.autoPaid")
                                                    : worker.status === "partial"
                                                        ? t("team.partial")
                                                        : t("team.pending")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(worker.paymentId || worker.paidAmount > 0) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewWorkerPayments(worker.id, worker.name)}
                                                    title={t("team.viewHistory") || "View History"}
                                                >
                                                    <History className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {(worker.status === "pending" || worker.status === "partial") && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedWorker(worker);
                                                        setShowPaymentModal(true);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {t("team.pay")}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[var(--color-primary-light)]">
                            <tr>
                                <td className="px-4 py-4 font-bold text-[var(--color-primary)]">{t("common.total")}</td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.baseSalary, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.commission, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.tips, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.total, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.paidAmount, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.remainingAmount, 0))}
                                </td>
                                <td className="px-4 py-4"></td>
                                <td className="px-4 py-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* Payment History - Detailed Table */}
            <Card className="mt-8">
                <h3 className="font-semibold mb-4 text-gray-900">{t("team.paymentHistory")}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t("common.date")}</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t("team.teamMember") || "Team Member"}</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">{t("common.amount")}</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">{t("common.status")}</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t("team.notes") || "Notes"}</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        {t("common.noData")}
                                    </td>
                                </tr>
                            ) : (
                                history.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {formatDate(new Date(payment.date), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {payment.workerName}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                                            {format(payment.amount)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <PaymentStatusBadge status={payment.status || 'manual'} />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500 italic max-w-xs">
                                            {payment.notes ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-[200px]">
                                                        {payment.notes.length > 50
                                                            ? payment.notes.substring(0, 50) + '...'
                                                            : payment.notes
                                                        }
                                                    </span>
                                                    {payment.notes.length > 50 && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPaymentNotes(payment.notes);
                                                                setShowNotesModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                                                        >
                                                            {t("team.viewMore") || "View more"}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit Action - Only if not finalized/cancelled */}
                                                {payment.status !== 'approved' && payment.status !== 'cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditPayment(payment, { name: payment.workerName })}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-10 w-10 border-blue-200"
                                                        title={t("common.edit") || "Edit"}
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Button>
                                                )}

                                                {/* Close/Lock Action - To finalize payment */}
                                                {payment.status !== 'approved' && payment.status !== 'cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleClosePayment(payment.id, payment.workerId)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 h-10 w-10 border-green-200"
                                                        title={t("team.closePayment") || "Close/Validate Payment"}
                                                    >
                                                        <Lock className="w-5 h-5" />
                                                    </Button>
                                                )}

                                                {/* Delete/Cancel Action */}
                                                {payment.status !== 'cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeletePayment(payment.id, payment.workerId)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-10 w-10 border-red-200"
                                                        title={t("common.delete") || "Delete"}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewStatusHistory(payment.id, payment.workerName)}
                                                    className="text-gray-400 hover:text-blue-600 p-2 h-10 w-10 border-transparent hover:border-blue-100 hover:bg-blue-50"
                                                    title={t("team.viewHistory") || "View History"}
                                                >
                                                    <History className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Record Payment Modal */}
            {
                showPaymentModal && selectedWorker && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {isEditMode ? (t("team.editPayment") || "Edit Payment") : (t("team.recordPayment") || "Record Payment")}
                                        </h3>
                                        <p className="text-xs text-gray-500">{selectedWorker.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedWorker(null);
                                        setIsEditMode(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t("team.totalDue")}:</span>
                                    <span className="font-semibold text-gray-900">{format(selectedWorker.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t("team.alreadyPaid")}:</span>
                                    <span className="font-semibold text-[var(--color-success)]">{format(selectedWorker.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                    <span className="font-medium text-gray-900">{t("team.remaining")}:</span>
                                    <span className="font-bold text-[var(--color-warning)]">{format(selectedWorker.remainingAmount)}</span>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.paymentAmount")}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={selectedWorker.remainingAmount}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.paymentDate")}</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.paymentNotes")}</label>
                                    <textarea
                                        rows={3}
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                        placeholder={t("team.paymentNotesPlaceholder")}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedWorker(null);
                                    }}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleRecordPayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Processing..." : t("team.recordPayment")}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Worker Payments Details Modal */}
            <WorkerPaymentsModal
                isOpen={showWorkerPaymentsModal}
                onClose={() => {
                    setShowWorkerPaymentsModal(false);
                    setSelectedWorkerPayments([]);
                }}
                payments={selectedWorkerPayments}
                workerName={selectedWorker?.name}
            />

            {/* Payment Status History Modal */}
            <PaymentHistoryModal
                isOpen={showHistoryModal}
                onClose={() => {
                    setShowHistoryModal(false);
                    setSelectedPaymentHistory([]);
                    setSelectedPaymentId(null);
                }}
                history={selectedPaymentHistory}
                paymentId={selectedPaymentId || 0}
                workerName={selectedWorker?.name}
            />

            {/* Notes Modal */}
            {
                showNotesModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-lg w-full">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <h3 className="font-semibold text-gray-900">{t("team.paymentNotes") || "Payment Notes"}</h3>
                                <button
                                    onClick={() => {
                                        setShowNotesModal(false);
                                        setSelectedPaymentNotes('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                {selectedPaymentNotes}
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowNotesModal(false);
                                        setSelectedPaymentNotes('');
                                    }}
                                >
                                    {t("common.close") || "Close"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )
            }
        </TeamLayout >
    );
}
