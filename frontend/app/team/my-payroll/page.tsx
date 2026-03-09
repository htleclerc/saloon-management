"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/ui/StatCard";
import PaymentStatusBadge from "@/components/ui/PaymentStatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useNotifications } from "@/context/NotificationProvider";
import { payrollService, SalaryPayment } from "@/lib/services/PayrollService";
import { DollarSign, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";

interface WorkerPayrollSummary {
    totalEarned: number;
    totalPaid: number;
    remaining: number;
    lastPaymentDate?: string;
}

export default function MyPayrollPage() {
    const { format } = useCurrency();
    const { t } = useTranslation();
    const { user, activeSalonId } = useAuth();
    const { showToast } = useToast();
    const { addNotification } = useNotifications();

    const [summary, setSummary] = useState<WorkerPayrollSummary>({
        totalEarned: 0,
        totalPaid: 0,
        remaining: 0,
    });
    const [payments, setPayments] = useState<SalaryPayment[]>([]);
    const [selectedMonth] = useState<Date>(new Date());
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [disputeNote, setDisputeNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Get current worker ID from user
    const workerId = user?.workerId ? Number(user.workerId) : (user?.id ? Number(user.id) : undefined);

    useEffect(() => {
        if (!workerId || !activeSalonId) return;

        const loadPayrollData = async () => {
            try {
                const monthPayments = await payrollService.getWorkerPaymentsByMonth(Number(workerId), selectedMonth);

                // Calculate summary
                const totalPaid = monthPayments.reduce((sum, p) => sum + p.paidAmount, 0);
                const totalEarned = monthPayments.length > 0 ? monthPayments[0].totalAmount : 0;
                const lastPayment = monthPayments.length > 0 ? monthPayments[0].paidDate : undefined;

                setSummary({
                    totalEarned,
                    totalPaid,
                    remaining: totalEarned - totalPaid,
                    lastPaymentDate: lastPayment,
                });

                setPayments(monthPayments);
            } catch (error) {
                console.error("Failed to load payroll data:", error);
            }
        };

        loadPayrollData();
    }, [workerId, activeSalonId, selectedMonth]);

    const handleDisputePayment = async () => {
        if (!workerId || !selectedPaymentId || !disputeNote.trim()) {
            showToast(t("common.error"), t("team.disputeNoteRequired"), "error");
            return;
        }

        setIsProcessing(true);
        try {
            await payrollService.disputePayment(selectedPaymentId, Number(workerId), disputeNote);

            // Close modal and reload data
            setShowDisputeModal(false);
            setSelectedPaymentId(null);
            setDisputeNote('');

            const monthPayments = await payrollService.getWorkerPaymentsByMonth(Number(workerId), selectedMonth);
            setPayments(monthPayments);

            showToast(t("common.success"), t("team.paymentDisputed"), "success");

            // Notify Admin
            try {
                const disputedPayment = payments.find(p => p.id === selectedPaymentId);
                addNotification({
                    type: 'warning',
                    title: t("team.paymentDisputedNotif") || "Payment Disputed",
                    message: t("team.paymentDisputedMsg", { name: user?.name || 'A worker', amount: format(disputedPayment?.paidAmount || 0) }) || `${user?.name || 'A worker'} has disputed a payment.`,
                    targetUserCode: "ADM-000" // Default admin code
                });
            } catch (notifError) {
                console.warn("Failed to send notification:", notifError);
            }
        } catch (error: any) {
            console.error("Failed to dispute payment:", error);
            showToast(t("common.error"), error?.message || "Failed to dispute payment", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const openDisputeModal = (paymentId: number) => {
        setSelectedPaymentId(paymentId);
        setDisputeNote('');
        setShowDisputeModal(true);
    };

    return (
        <MainLayout>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("team.myPayroll")}</h1>
                <p className="text-gray-500 text-sm md:text-base mt-1">{t("team.myPayrollDesc")}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t("team.totalEarned")}
                    value={format(summary.totalEarned)}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title={t("team.totalPaid")}
                    value={format(summary.totalPaid)}
                    icon={CheckCircle2}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                    title={t("team.remaining")}
                    value={format(summary.remaining)}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                />
                <StatCard
                    title={t("team.lastPayment")}
                    value={summary.lastPaymentDate || t("common.none")}
                    icon={Calendar}
                    gradient="bg-gradient-to-br from-primary to-[var(--color-primary)]"
                />
            </div>

            {/* Payment History */}
            <Card className="mt-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t("team.myPayments")}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t("team.myPaymentsDesc")}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t("common.date")}</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t("team.amount")}</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t("team.notes")}</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {new Date(payment.paidDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-semibold text-[var(--color-success)]">
                                        {format(payment.paidAmount)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {payment.notes || "-"}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <PaymentStatusBadge status={payment.status || 'approved'} />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {payment.status === 'approved' && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openDisputeModal(payment.id!)}
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                                    {t("team.dispute")}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        {t("common.noData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Dispute Payment Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("team.disputePayment")}</h3>
                        <p className="text-sm text-gray-600 mb-4">{t("team.disputePaymentDesc")}</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.disputeNote")} *
                            </label>
                            <textarea
                                value={disputeNote}
                                onChange={(e) => setDisputeNote(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                rows={4}
                                placeholder={t("team.disputeNotePlaceholder")}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDisputeModal(false);
                                    setSelectedPaymentId(null);
                                    setDisputeNote('');
                                }}
                                disabled={isProcessing}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDisputePayment}
                                disabled={isProcessing || !disputeNote.trim()}
                            >
                                {isProcessing ? t("common.processing") : t("team.confirmDispute")}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </MainLayout>
    );
}
