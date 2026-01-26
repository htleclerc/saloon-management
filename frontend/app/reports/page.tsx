"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { Download, TrendingUp, TrendingDown, Calendar, Edit, ChevronDown, Lightbulb, Loader2 } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { statsService } from "@/lib/services";
import { useTranslation } from "@/i18n";

export default function ReportsPage() {
    const { t } = useTranslation();
    const { getCardStyle } = useKpiCardStyle();
    const { user, activeSalonId } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // State for reports
    const [financialReport, setFinancialReport] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        taxPayments: 0,
        savings: 0
    });

    const [expenseDistribution, setExpenseDistribution] = useState<any[]>([]);
    const [monthlyFinancials, setMonthlyFinancials] = useState<any[]>([]);
    const [quarterlyFinancials, setQuarterlyFinancials] = useState<any[]>([]);
    const [taxSummary, setTaxSummary] = useState({
        incomeTax: 0,
        estimatedTax: 0,
        taxThisMonth: 0,
        details: [] as any[],
        rates: [] as any[]
    });

    // New dynamic states
    const [purchaseTrends, setPurchaseTrends] = useState<any[]>([]);
    const [feeBreakdown, setFeeBreakdown] = useState<any[]>([]);
    const [monthlyWeeklyAnalysis, setMonthlyWeeklyAnalysis] = useState({
        weekly: 0,
        monthly: 0,
        difference: 0,
    });
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        if (activeSalonId) {
            setIsLoading(true);
            const year = new Date().getFullYear();

            Promise.all([
                statsService.getFinancialReport(Number(activeSalonId), year),
                statsService.getExpenseDistribution(Number(activeSalonId), year),
                statsService.getMonthlyFinancials(Number(activeSalonId), year),
                statsService.getQuarterlyFinancials(Number(activeSalonId), year),
                statsService.getTaxSummary(Number(activeSalonId), year),
                statsService.getPurchaseTrends(Number(activeSalonId), year),
                statsService.getFeeBreakdown(Number(activeSalonId), year),
                statsService.getMonthlyWeeklyAnalysis(Number(activeSalonId), year),
                statsService.getRecommendations(Number(activeSalonId))
            ]).then(([report, distribution, monthly, quarterly, tax, purchases, fees, analysis, recs]) => {
                setFinancialReport(report);
                setExpenseDistribution(distribution);
                setMonthlyFinancials(monthly);
                setQuarterlyFinancials(quarterly);
                setTaxSummary(tax);
                setPurchaseTrends(purchases);
                setFeeBreakdown(fees);
                setMonthlyWeeklyAnalysis(analysis);
                setRecommendations(recs);
            }).catch(error => {
                console.error("Failed to load reports:", error);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [activeSalonId]);

    const isWorker = user?.role === 'worker';

    if (isLoading) {
        return (
            <ProtectedRoute requiredRole={['manager', 'super_admin']}>
                <MainLayout>
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole={['manager', 'super_admin']}>
            <MainLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
                            <p className="text-gray-500 mt-1">{t('reports.subtitle')}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Period Filters */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">{t('reports.periodFilters.daily')}</button>
                                <button className="px-3 py-1.5 text-sm font-medium bg-white shadow-sm text-[var(--color-primary)] rounded-md">{t('reports.periodFilters.weekly')}</button>
                                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">{t('reports.periodFilters.monthly')}</button>
                                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">{t('reports.periodFilters.yearly')}</button>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Calendar className="w-4 h-4" />
                                Dec 1 - Dec 31, 2025
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                            <ReadOnlyGuard>
                                <Button variant="primary" size="md">
                                    <Download className="w-5 h-5" />
                                    {t('reports.export')}
                                </Button>
                            </ReadOnlyGuard>
                        </div>
                    </div>

                    {/* Annual Financial Overview */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('reports.annualOverview')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <Card gradient="" style={getCardStyle(0)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">💰</span>
                                    <p className="text-xs opacity-90">{t('reports.totalRevenue')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{financialReport.totalRevenue.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">+--% {t('reports.lastYear')}</span>
                                </div>
                            </Card>
                            <Card gradient="" style={getCardStyle(1)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">📊</span>
                                    <p className="text-xs opacity-90">{t('reports.totalExpenses')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{financialReport.totalExpenses.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingDown className="w-3 h-3" />
                                    <span className="text-xs">--% {t('reports.lastYear')}</span>
                                </div>
                            </Card>
                            <Card gradient="" style={getCardStyle(2)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">📈</span>
                                    <p className="text-xs opacity-90">{t('reports.netProfit')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{financialReport.netProfit.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">+--% {t('reports.lastYear')}</span>
                                </div>
                            </Card>
                            <Card gradient="" style={getCardStyle(3)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">🧾</span>
                                    <p className="text-xs opacity-90">{t('reports.taxPayments')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{financialReport.taxPayments.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">{t('reports.est')} 20%</span>
                                </div>
                            </Card>
                            <Card gradient="" style={getCardStyle(4)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">💎</span>
                                    <p className="text-xs opacity-90">{t('reports.savings')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{financialReport.savings.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">{t('reports.est')} 15%</span>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Monthly Financial Breakdown Table */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('reports.monthlyBreakdown.title')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.date')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.worker')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.revenue')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.expense')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.profit')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.tax')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.savings')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t('reports.monthlyBreakdown.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlyFinancials.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 text-sm text-gray-900">{row.date}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{row.avatar}</span>
                                                    <span className="text-sm font-medium text-gray-900">{row.worker}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">€{row.revenue.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[var(--color-error)]">€{row.expense.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">€{row.profit.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[var(--color-warning)]">€{row.tax.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[var(--color-primary)]">€{row.savings.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center">
                                                <ReadOnlyGuard>
                                                    <button className="text-[var(--color-primary)] hover:opacity-80 transition">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </ReadOnlyGuard>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Charts Row - Quarterly & Monthly */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quarterly Revenue vs Expenses */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t('reports.quarterlyChart')}</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={quarterlyFinancials}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="quarter" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="var(--color-success)" radius={[4, 4, 0, 0]} name={t('reports.totalRevenue')} />
                                    <Bar dataKey="expenses" fill="var(--color-error)" radius={[4, 4, 0, 0]} name={t('reports.totalExpenses')} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Monthly Sales Analysis */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t('reports.monthlyChart')}</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={monthlyFinancials}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: "var(--color-primary)", strokeWidth: 2 }} name="Sales" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    {/* Annual Expense Categories - Pie Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('reports.expenseCategories')}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {expenseDistribution.map((cat: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-900">€{cat.amount.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500 ml-2">{cat.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Quarterly Performance Comparison */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('reports.quarterlyComparison.title')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('reports.quarterlyComparison.subtitle')}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {quarterlyFinancials.map((q, idx) => (
                                <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: `${q.color}15` }}>
                                    <p className="text-sm font-medium text-gray-600">{q.quarter}</p>
                                    <h4 className="text-2xl font-bold mt-1" style={{ color: q.color }}>€{q.value.toLocaleString()}</h4>
                                    <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: `${q.color}30` }}>
                                        <div className="h-full rounded-full" style={{ width: `${(q.value / 6000) * 100}%`, backgroundColor: q.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={quarterlyFinancials}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="quarter" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {quarterlyFinancials.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Tax Summary & Payment Schedule */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{t('reports.taxSummary.title')}</h3>
                            <Button variant="outline" size="sm">{t('reports.taxSummary.viewAll')}</Button>
                        </div>

                        {/* Tax Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card gradient="" style={getCardStyle(0)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">📋</span>
                                    <p className="text-xs opacity-90">{t('reports.taxSummary.incomeTax')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{taxSummary.incomeTax.toLocaleString()}</h3>
                            </Card>
                            <Card gradient="" style={getCardStyle(1)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">📊</span>
                                    <p className="text-xs opacity-90">{t('reports.taxSummary.estimatedTax')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{taxSummary.estimatedTax.toLocaleString()}</h3>
                            </Card>
                            <Card gradient="" style={getCardStyle(2)} className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">💵</span>
                                    <p className="text-xs opacity-90">{t('reports.taxSummary.taxThisMonth')}</p>
                                </div>
                                <h3 className="text-2xl font-bold">€{taxSummary.taxThisMonth.toLocaleString()}</h3>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Tax Payment Details */}
                            <Card>
                                <h4 className="text-md font-semibold mb-4">{t('reports.taxSummary.monthlyDetails')}</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('reports.taxSummary.date')}</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('reports.taxSummary.description')}</th>
                                                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">{t('reports.taxSummary.amount')}</th>
                                                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">{t('reports.taxSummary.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {taxSummary.details.map((tax: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">{tax.date}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{tax.description}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">€{tax.amount.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tax.status === 'Paid' ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'}`}>
                                                            {tax.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Fallback if no details */}
                                        {taxSummary.details.length === 0 && (
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">{t('reports.taxSummary.noDetails')}</td>
                                                </tr>
                                            </tbody>
                                        )}
                                    </table>
                                </div>
                            </Card>

                            {/* Tax Rate Comparison */}
                            <Card>
                                <h4 className="text-md font-semibold mb-4">{t('reports.taxSummary.rateComparison')}</h4>
                                <div className="space-y-4">
                                    {taxSummary.rates.map((tax: any, idx: number) => (
                                        <div key={idx}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">{tax.name}</span>
                                                <span className="text-sm font-semibold text-gray-900">{tax.rate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="h-3 rounded-full bg-[var(--color-primary)]" style={{ width: `${(tax.rate / 25) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {taxSummary.rates.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center">{t('reports.taxSummary.noRates')}</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Purchase Trends & Fee Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Purchase Trends */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t('reports.purchaseTrends')}</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={purchaseTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="purchases" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: "var(--color-primary)", strokeWidth: 2 }} name="Purchases" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Fee Breakdown */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t('reports.feeBreakdown.title')}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('reports.feeBreakdown.category')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">{t('reports.feeBreakdown.percentage')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">{t('reports.feeBreakdown.amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {feeBreakdown.map((fee, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t(`reports.feeBreakdown.categories.${fee.category}`)}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">{fee.percentage}%</td>
                                                <td className="px-4 py-3 text-right font-semibold text-[var(--color-error)]">-€{fee.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-semibold">
                                        <tr>
                                            <td className="px-4 py-2 text-sm">{t('reports.feeBreakdown.totalFees')}</td>
                                            <td className="px-4 py-2 text-right text-sm">{feeBreakdown.reduce((sum, f) => sum + f.percentage, 0).toFixed(1)}%</td>
                                            <td className="px-4 py-2 text-right text-[var(--color-error)]">-€{feeBreakdown.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Monthly vs Weekly Analysis */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('reports.analysis.title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-[var(--color-secondary-light)] rounded-xl border border-[var(--color-secondary-light)]">
                                <p className="text-sm font-medium text-[var(--color-secondary)] mb-1">{t('reports.analysis.weeklyAverage')}</p>
                                <h4 className="text-2xl font-bold text-gray-900">€{monthlyWeeklyAnalysis.weekly.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary-light)]">
                                <p className="text-sm font-medium text-[var(--color-primary)] mb-1">{t('reports.analysis.monthlyTotal')}</p>
                                <h4 className="text-2xl font-bold text-gray-900">€{monthlyWeeklyAnalysis.monthly.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-[var(--color-success-light)] rounded-xl border border-[var(--color-success-light)]">
                                <p className="text-sm font-medium text-[var(--color-success)] mb-1">{t('reports.analysis.monthVsPrevious')}</p>
                                <h4 className="text-2xl font-bold text-[var(--color-success)]">+€{monthlyWeeklyAnalysis.difference.toLocaleString()}</h4>
                            </div>
                        </div>
                    </Card>

                    {/* Financial Recommendations */}
                    <Card gradient="" style={getCardStyle(0)}>
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">{t('reports.recommendations.title')}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{rec.icon}</span>
                                        <h4 className="font-semibold text-gray-900">{t(`reports.recommendations.${rec.id || 'savings'}`)}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">{t(`reports.recommendations.${rec.id || 'savings'}Desc`)}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
