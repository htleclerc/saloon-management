"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, CreditCard, FileText, Download, Calendar } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { statsService } from "@/lib/services/StatsService";
import { useEffect, useState } from "react";
import { format as formatDate } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

interface PayrollEntry {
    id: number;
    name: string;
    baseSalary: number;
    commission: number;
    tips: number;
    total: number;
    status: string;
}

export default function TeamPayrollPage() {
    const { getCardStyle } = useKpiCardStyle();
    const { format } = useCurrency();
    const { t, language } = useTranslation();
    const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            const [data, hist] = await Promise.all([
                statsService.getPayrollStats(1),
                statsService.getPayrollHistory(1)
            ]);
            setPayrollData(data);
            setHistory(hist);
        };
        loadStats();
    }, []);

    const totalPayroll = payrollData.reduce((sum, w) => sum + w.total, 0);
    const totalCommissions = payrollData.reduce((sum, w) => sum + w.commission, 0);
    const pendingPayments = payrollData.filter((w) => w.status === "pending").length;

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
                    title={t("team.totalPayroll")}
                    value={format(totalPayroll)}
                    subtitle={t("team.thisMonth")}
                    icon={DollarSign}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title={t("team.commissions")}
                    value={format(totalCommissions)}
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title={t("team.pendingPayments")}
                    value={pendingPayments}
                    subtitle={t("team.team")}
                    icon={CreditCard}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title={t("team.payslips")}
                    value={payrollData.length}
                    subtitle={t("team.generated")}
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
                        <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4" />
                            {t("team.period")}
                        </Button>
                        <Button variant="primary" size="sm">
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
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "paid" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                                            }`}>
                                            {worker.status === "paid" ? t("team.paid") : t("team.pending")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            {worker.status === "pending" && (
                                                <Button variant="primary" size="sm">{t("team.pay")}</Button>
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
                                    {format(totalCommissions)}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(payrollData.reduce((sum, w) => sum + w.tips, 0))}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    {format(totalPayroll)}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* Payment History */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">{t("team.paymentHistory")}</h3>
                <div className="space-y-3">
                    {history.map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">
                                    {formatDate(new Date(payment.date), 'dd/MM/yyyy')}
                                </p>
                                <p className="text-xs text-gray-500">{t("team.teamCount", { count: payment.workers })}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{format(payment.amount)}</p>
                                <span className="text-xs text-[var(--color-success)] font-medium">{t("team.completed")}</span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No history
                        </div>
                    )}
                </div>
            </Card>
        </TeamLayout>
    );
}
