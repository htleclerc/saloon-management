"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format as formatDate, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth, RequirePermission } from "@/context/AuthProvider";
import { useActionPermissions } from "@/lib/permissions";
import { expenseService } from "@/lib/services/ExpenseService";
import { incomeService } from "@/lib/services/IncomeService";
import { revenueStatsService } from "@/lib/services/RevenueStatsService";
import { useCurrency } from "@/hooks/useCurrency";
import { workerService } from "@/lib/services/WorkerService";
import { serviceService } from "@/lib/services/ServiceService";
import { salonService } from "@/lib/services/SalonService";
import { useTranslation } from "@/i18n";
import {
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    Download,
    Printer,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Plus,
    Search,
    Filter,
    LayoutGrid,
    BarChart2,
    ChevronDown,
    ChevronUp,
    Briefcase,
    Star,
    Wallet,
    TrendingDown,
    History,
    AlertTriangle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

export default function IncomeDashboardPage() {
    const { t } = useTranslation();
    const { getCardStyle } = useKpiCardStyle();
    const { format } = useCurrency();
    const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
    const [expandedMobileRows, setExpandedMobileRows] = useState<number[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentDateDisplay, setCurrentDateDisplay] = useState(formatDate(new Date(), "MMMM dd, yyyy"));
    const { user, activeSalonId } = useAuth();
    const permissions = useActionPermissions({ user, canModify: true } as any);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [dailyBreakdown, setDailyBreakdown] = useState<any[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<any[]>([]);
    const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
    const [incomeProjection, setIncomeProjection] = useState<any[]>([]);
    const [workerPerformance, setWorkerPerformance] = useState<any[]>([]);
    const [derivedStats, setDerivedStats] = useState({
        revenueGrowth: 0,
        payrollAmount: 0,
        payrollGrowth: 0,
        netProfit: 0,
        margin: 0,
        averagePerStaff: 0,
        activeTeamCount: 0
    });

    // Helper for date navigation
    const adjustDate = (offset: number) => {
        const newDate = new Date(selectedDate);
        if (selectedPeriod === 'Daily') {
            newDate.setDate(newDate.getDate() + offset);
        } else if (selectedPeriod === 'Weekly') {
            newDate.setDate(newDate.getDate() + (offset * 7));
        } else if (selectedPeriod === 'Monthly') {
            newDate.setMonth(newDate.getMonth() + offset);
        } else if (selectedPeriod === 'Annual') {
            newDate.setFullYear(newDate.getFullYear() + offset);
        }
        setSelectedDate(newDate);
    };

    // Update display date when selectedDate or period changes
    useEffect(() => {
        if (selectedPeriod === 'Daily') {
            setCurrentDateDisplay(formatDate(selectedDate, "MMMM dd, yyyy"));
        } else if (selectedPeriod === 'Weekly') {
            const startStr = formatDate(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM dd");
            const endStr = formatDate(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM dd, yyyy");
            setCurrentDateDisplay(`${startStr} - ${endStr}`);
        } else if (selectedPeriod === 'Monthly') {
            setCurrentDateDisplay(formatDate(selectedDate, "MMMM yyyy"));
        } else if (selectedPeriod === 'Annual') {
            setCurrentDateDisplay(formatDate(selectedDate, "yyyy"));
        }
    }, [selectedDate, selectedPeriod]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

    // Helper function to get chart date range based on period
    const getChartDateRange = (period: string, selectedDate: Date) => {
        let endDate = new Date(selectedDate);
        let startDate = new Date(selectedDate);

        switch (period) {
            case 'Daily':
                startDate.setDate(startDate.getDate() - 6); // Last 7 days
                // End date is today (or selected date)
                break;
            case 'Weekly':
                // End at the end of the selected week
                endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
                // Start 5 weeks before the start of this week to show 6 weeks total
                startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
                startDate.setDate(startDate.getDate() - 35);
                break;
            case 'Monthly':
                // End at the end of the selected month
                endDate = endOfMonth(selectedDate);
                // Start 5 months before the start of this month to show 6 months total
                startDate = startOfMonth(selectedDate);
                startDate.setMonth(startDate.getMonth() - 5);
                break;
            case 'Annual':
                // End at the end of the selected year
                endDate = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
                // Start 2 years before the start of this year to show 3 years total
                startDate = new Date(selectedDate.getFullYear() - 2, 0, 1);
                break;
        }

        return { startDate, endDate };
    };

    // Helper function to format chart labels based on period
    const formatChartLabel = (key: string, period: string) => {
        switch (period) {
            case 'Daily':
                return formatDate(new Date(key), 'EEE'); // Mon, Tue, Wed
            case 'Weekly':
                return formatDate(new Date(key), 'MMM dd');
            case 'Monthly':
                return formatDate(new Date(key + '-01'), 'MMM');
            case 'Annual':
                return key; // 2024, 2025
            default:
                return key;
        }
    };

    // Helper function to get aggregation key based on period
    const getAggregationKey = (dateString: string, period: string) => {
        const date = new Date(dateString);
        switch (period) {
            case 'Daily':
                return formatDate(date, 'yyyy-MM-dd'); // YYYY-MM-DD
            case 'Weekly':
                return formatDate(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'); // Week start date
            case 'Monthly':
                return dateString.substring(0, 7); // YYYY-MM
            case 'Annual':
                return dateString.substring(0, 4); // YYYY
            default:
                return dateString;
        }
    };

    useEffect(() => {
        if (!activeSalonId) return;

        async function loadData() {
            if (!activeSalonId || isNaN(Number(activeSalonId))) {
                console.warn("loadData called with invalid activeSalonId:", activeSalonId);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const salonId = Number(activeSalonId);

                // Fetch stats based on current date
                const salonStats = await salonService.getStats(salonId);
                setStats(salonStats);

                // Determine start and end date based on selectedPeriod
                let startDate: Date;
                let endDate: Date;

                if (selectedPeriod === 'Daily') {
                    startDate = new Date(selectedDate);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(selectedDate);
                    endDate.setHours(23, 59, 59, 999);
                } else if (selectedPeriod === 'Weekly') {
                    startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
                    endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
                } else if (selectedPeriod === 'Monthly') {
                    startDate = startOfMonth(selectedDate);
                    endDate = endOfMonth(selectedDate);
                } else { // Annual
                    startDate = new Date(selectedDate.getFullYear(), 0, 1);
                    endDate = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
                }

                // Fetch Incomes within the selected range
                const [incomes, services, workers, revTrend, expTrend] = await Promise.all([
                    incomeService.getAll(salonId, {
                        startDate: formatDate(startDate, 'yyyy-MM-dd'),
                        endDate: formatDate(endDate, 'yyyy-MM-dd')
                    }),
                    serviceService.getAll(salonId),
                    workerService.getAll(salonId),
                    revenueStatsService.getRevenueTrend(salonId),
                    revenueStatsService.getExpenseTrend(salonId)
                ]);

                // Normalize incomes with names
                const normalizedIncomes = incomes.map((inc: any) => {
                    const sNames = (inc.serviceIds || [])
                        .map((id: number) => services.find((s: any) => s.id === id)?.name || `Service #${id}`)
                        .join(", ");

                    const wNames = (inc.workerIds || [])
                        .map((id: number) => workers.find((w: any) => w.id === id)?.name || `Worker #${id}`)
                        .join(", ");

                    return {
                        ...inc,
                        workerName: wNames || t("income.table.member"),
                        serviceName: sNames || t("income.table.salonService")
                    };
                });

                setDailyBreakdown(normalizedIncomes.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10));

                // Calculate derived stats for the selected period
                const periodRevenue = incomes.reduce((sum: number, inc: any) => sum + inc.amount, 0);

                // Compare with previous period for growth
                let prevStartDate = new Date(startDate);
                let prevEndDate = new Date(endDate);
                if (selectedPeriod === 'Daily') {
                    prevStartDate.setDate(prevStartDate.getDate() - 1);
                    prevEndDate.setDate(prevEndDate.getDate() - 1);
                } else if (selectedPeriod === 'Weekly') {
                    prevStartDate.setDate(prevStartDate.getDate() - 7);
                    prevEndDate.setDate(prevEndDate.getDate() - 7);
                } else if (selectedPeriod === 'Monthly') {
                    prevStartDate.setMonth(prevStartDate.getMonth() - 1);
                    prevEndDate.setMonth(prevEndDate.getMonth() - 1);
                } else {
                    prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
                    prevEndDate.setFullYear(prevEndDate.getFullYear() - 1);
                }

                const prevIncomes = await incomeService.getAll(salonId, {
                    startDate: formatDate(prevStartDate, 'yyyy-MM-dd'),
                    endDate: formatDate(prevEndDate, 'yyyy-MM-dd')
                });
                // Calculate realized vs potential for previous period
                const prevActualRevenue = prevIncomes
                    .filter(i => i.status === 'Validated' || i.status === 'Closed')
                    .reduce((sum: number, inc: any) => sum + inc.amount, 0);
                const periodActualRevenue = incomes
                    .filter(i => i.status === 'Validated' || i.status === 'Closed')
                    .reduce((sum: number, inc: any) => sum + inc.amount, 0);
                const periodPotentialRevenue = incomes
                    .filter(i => i.status === 'Pending')
                    .reduce((sum: number, inc: any) => sum + inc.amount, 0);

                const revGrowth = prevActualRevenue > 0 ? ((periodActualRevenue - prevActualRevenue) / prevActualRevenue) * 100 : 0;

                // Financials and Expenses for the year
                const financials = await revenueStatsService.getFinancialReport(salonId, selectedDate.getFullYear());
                const distribution = await revenueStatsService.getExpenseDistribution(salonId, selectedDate.getFullYear());
                const salaryExpense = distribution.find(d => d.name === 'Salary' || d.name === 'Salaire')?.amount || 0;

                const activeWorkers = workers.filter(w => w.isActive);
                const activeTeamCount = activeWorkers.length;
                const avgPerStaff = activeTeamCount > 0 ? periodRevenue / activeTeamCount : 0;

                setDerivedStats({
                    revenueGrowth: revGrowth,
                    payrollAmount: salaryExpense,
                    payrollGrowth: 0,
                    netProfit: financials.netProfit,
                    margin: financials.totalRevenue > 0 ? (financials.netProfit / financials.totalRevenue) * 100 : 0,
                    averagePerStaff: avgPerStaff,
                    activeTeamCount: activeTeamCount,
                    potentialRevenue: periodPotentialRevenue,
                    actualRevenue: periodActualRevenue
                } as any);

                // Build dynamic chart data based on selected period
                const chartRange = getChartDateRange(selectedPeriod, selectedDate);

                // Fetch incomes and expenses for the chart range
                const [chartIncomes, chartExpenses] = await Promise.all([
                    incomeService.getAll(salonId, {
                        startDate: formatDate(chartRange.startDate, 'yyyy-MM-dd'),
                        endDate: formatDate(chartRange.endDate, 'yyyy-MM-dd')
                    }),
                    expenseService.getAll(salonId, {
                        startDate: formatDate(chartRange.startDate, 'yyyy-MM-dd'),
                        endDate: formatDate(chartRange.endDate, 'yyyy-MM-dd')
                    })
                ]);

                // Pre-fill all periods with 0 values
                const dataMap: Record<string, { income: number; potentialIncome: number; salary: number; expense: number }> = {};

                // Generate all expected periods
                const currentDate = new Date(chartRange.startDate);
                const chartEndDate = new Date(chartRange.endDate);

                while (currentDate <= chartEndDate) {
                    const key = getAggregationKey(formatDate(currentDate, 'yyyy-MM-dd'), selectedPeriod);
                    if (!dataMap[key]) {
                        dataMap[key] = { income: 0, potentialIncome: 0, salary: 0, expense: 0 };
                    }

                    // Increment based on period
                    switch (selectedPeriod) {
                        case 'Daily':
                            currentDate.setDate(currentDate.getDate() + 1);
                            break;
                        case 'Weekly':
                            currentDate.setDate(currentDate.getDate() + 7);
                            break;
                        case 'Monthly':
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            break;
                        case 'Annual':
                            currentDate.setFullYear(currentDate.getFullYear() + 1);
                            break;
                    }
                }

                // Now fill with actual data
                chartIncomes.forEach((inc: any) => {
                    const key = getAggregationKey(inc.date, selectedPeriod);
                    const isActual = inc.status === 'Validated' || inc.status === 'Closed';

                    if (dataMap[key]) {
                        // Aggregate revenue
                        if (isActual) {
                            dataMap[key].income += inc.amount;
                        } else {
                            dataMap[key].potentialIncome += inc.amount;
                        }

                        // Aggregate worker salaries
                        let totalWorkerSalary = 0;
                        inc.workerIds?.forEach((wId: number) => {
                            const share = inc.workerShares?.find((s: any) => s.workerId === wId);
                            const workerSalary = share ? share.amount : (inc.amount / (inc.workerIds.length || 1));
                            totalWorkerSalary += workerSalary;
                        });
                        dataMap[key].salary += totalWorkerSalary;
                    }
                });

                // Aggregate expenses
                chartExpenses.forEach((exp: any) => {
                    const key = getAggregationKey(exp.date, selectedPeriod);
                    if (dataMap[key]) {
                        dataMap[key].expense += exp.amount || 0;
                    }
                });

                // Convert to array and sort by key
                const sortedData = Object.entries(dataMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, data]) => {
                        const actualIncome = Math.round(data.income);
                        const potentialIncome = Math.round(data.potentialIncome);
                        const actualSalary = Math.round(data.salary);
                        const actualExpense = Math.round(data.expense);
                        const actualProfit = actualIncome - actualSalary - actualExpense;

                        return {
                            name: formatChartLabel(key, selectedPeriod),
                            // Display minimum value of 5 for visual representation when 0 (small but visible)
                            income: actualIncome === 0 && potentialIncome === 0 ? 5 : actualIncome,
                            potentialIncome: potentialIncome,
                            salary: actualSalary === 0 ? 5 : actualSalary,
                            expense: actualExpense === 0 ? 5 : actualExpense,
                            profit: actualProfit === 0 ? 5 : actualProfit,
                            // Keep actual values for tooltip
                            actualIncome,
                            actualPotentialIncome: potentialIncome,
                            actualSalary,
                            actualExpense,
                            actualProfit
                        };
                    });

                setMonthlySummary(sortedData);

                // Projection / Breakdown by service/product
                const breakdown: Record<string, number> = {};
                const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

                incomes.forEach((inc: any) => {
                    const services = inc.serviceNames || [];
                    if (services.length > 0) {
                        const amountPerService = inc.amount / services.length;
                        services.forEach((name: string) => {
                            breakdown[name] = (breakdown[name] || 0) + amountPerService;
                        });
                    } else {
                        // Fallback to singular serviceName or service object or default
                        const serviceName = inc.serviceName || inc.service?.name || 'Services';
                        breakdown[serviceName] = (breakdown[serviceName] || 0) + inc.amount;
                    }
                });

                const totalAmount = incomes.reduce((acc: number, i: any) => acc + i.amount, 0);

                // If no data, create a single "Services" entry at 0%
                if (Object.keys(breakdown).length === 0 || totalAmount === 0) {
                    setIncomeProjection([{
                        name: 'Services',
                        value: 1, // Symbolic minimum for display
                        actualValue: 0,
                        color: colors[0]
                    }]);
                } else {
                    setIncomeProjection(Object.entries(breakdown).map(([name, value], idx) => {
                        const actualValue = Math.round((value / totalAmount) * 100);
                        return {
                            name,
                            // Display minimum 1% for visual representation when 0
                            value: actualValue === 0 ? 1 : actualValue,
                            // Keep actual value for display
                            actualValue,
                            color: colors[idx % colors.length]
                        };
                    }));
                }

                // Worker performance (already filtered by period!)
                const workersPerformanceMap: Record<number, any> = {};

                // Initialize with all active workers to ENSURE they show up even with 0 revenue
                workers.filter((w: any) => w.isActive).forEach((w: any) => {
                    workersPerformanceMap[w.id] = {
                        workerId: w.id,
                        name: w.name,
                        monthRevenue: 0,
                        monthPotentialRevenue: 0,
                        monthCommission: 0,
                        monthTips: 0,
                        services: 0,
                        color: w.color || colors[Object.keys(workersPerformanceMap).length % colors.length]
                    };
                });

                incomes.forEach((inc: any) => {
                    inc.workerIds?.forEach((wId: number) => {
                        if (!workersPerformanceMap[wId]) {
                            const w = workers.find((worker: any) => worker.id === wId);
                            workersPerformanceMap[wId] = {
                                workerId: wId,
                                name: w?.name || `Worker #${wId}`,
                                monthRevenue: 0,
                                monthCommission: 0,
                                monthTips: 0,
                                services: 0,
                                color: w?.color || colors[Object.keys(workersPerformanceMap).length % colors.length]
                            };
                        }
                        const share = inc.workerShares?.find((s: any) => s.workerId === wId);
                        const workerSalary = share ? share.amount : (inc.amount / (inc.workerIds.length || 1));
                        const workerTips = share ? share.tips : 0;

                        // Calculate gross revenue by reverse-calculating from salary
                        // workerSalary = grossRevenue * sharingKey
                        // Therefore: grossRevenue = workerSalary / sharingKey
                        const w = workers.find((worker: any) => worker.id === wId);
                        const sharingKey = (w?.sharingKey || 50) / 100;
                        const grossRevenue = sharingKey > 0 ? workerSalary / sharingKey : workerSalary;

                        workersPerformanceMap[wId].monthRevenue += grossRevenue;
                        workersPerformanceMap[wId].monthCommission += workerSalary;
                        workersPerformanceMap[wId].services += 1;

                        // Use explicit tips from share
                        workersPerformanceMap[wId].monthTips += workerTips;
                    });
                });
                setWorkerPerformance(Object.values(workersPerformanceMap).sort((a, b) => b.monthRevenue - a.monthRevenue));

            } catch (error) {
                console.error("Error loading income dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [activeSalonId, selectedDate, selectedPeriod]);

    const toggleMobileRow = (idx: number) => {
        setExpandedMobileRows(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="animate-pulse space-y-8">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>)}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <RequirePermission role={['manager']} fallback={
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <Card className="text-center p-8 max-w-md">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("income.restrictedAccess")}</h2>
                        <p className="text-gray-600 font-medium">{t("income.restrictedMessage")}</p>
                        <Link href="/">
                            <Button variant="primary" size="md" className="mt-6 rounded-xl">
                                {t("income.backHome")}
                            </Button>
                        </Link>
                    </Card>
                </div>
            </MainLayout>
        }>
            <MainLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Standardized Header */}
                    <div className="flex flex-col gap-4 md:gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("income.management")}</h1>
                            <p className="text-gray-500 mt-1 text-sm md:text-base">{t("income.subtitle")}</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div></div>
                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                    <Link href="/income">
                                        <button className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest">
                                            <LayoutGrid size={16} />
                                            <span>{t("common.list")}</span>
                                        </button>
                                    </Link>
                                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-white text-[var(--color-primary)] rounded-lg shadow-sm border border-gray-100 uppercase tracking-widest">
                                        <BarChart2 size={16} />
                                        <span>{t("common.analytics")}</span>
                                    </button>
                                </div>
                                <Link href="/income/add">
                                    <Button variant="primary" size="md" className="rounded-xl h-12 flex items-center gap-2 font-black shadow-lg shadow-[color:var(--color-primary)]/20 active:scale-95 transition-all">
                                        <Plus className="w-5 h-5" />
                                        <span>{t("income.addIncome")}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>


                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                                    <span className={`text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full ${derivedStats.revenueGrowth >= 0 ? '' : 'text-red-100'}`}>
                                        {derivedStats.revenueGrowth > 0 ? '+' : ''}{derivedStats.revenueGrowth.toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t("income.totalRevenue")}</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">{format((derivedStats as any).actualRevenue || stats?.totalRevenue || 0)}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Wallet className="w-6 h-6" /></div>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t("common.potential")}</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">{format((derivedStats as any).potentialRevenue || 0)}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Users className="w-6 h-6" /></div>
                                    {/* Payroll growth omitted for now or we can use generic exp growth */}
                                    {/* <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+8%</span> */}
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t("income.payroll")}</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">{format(derivedStats.payrollAmount)}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">{t("income.record")}</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t("income.averagePerStaff")}</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">{format(Math.round(derivedStats.averagePerStaff))}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">{derivedStats.margin.toFixed(1)}% {t("income.margin")}</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t("income.netProfit")}</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">{format(derivedStats.netProfit)}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-xl group hover:border-[var(--color-primary-light)] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] transition-all"><Users className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">{t("income.staff")}</span>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t("income.activeTeam")}</p>
                            <h3 className="text-2xl font-black mt-1 text-gray-900 tabular-nums">{derivedStats.activeTeamCount}</h3>
                        </div>
                    </div >

                    {/* Time Period Filter */}
                    < div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100" >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t("income.period")}</span>
                                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                    {["Daily", "Weekly", "Monthly", "Annual"].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedPeriod === period
                                                ? "bg-white text-[var(--color-primary)] shadow-sm border border-gray-100"
                                                : "text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => adjustDate(-1)}
                                    className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 active:scale-90"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                                </button>

                                <div className="flex items-center gap-2">
                                    {selectedPeriod === 'Monthly' ? (
                                        <select
                                            value={selectedDate.getMonth()}
                                            onChange={(e) => {
                                                const newDate = new Date(selectedDate);
                                                newDate.setMonth(parseInt(e.target.value));
                                                setSelectedDate(newDate);
                                            }}
                                            className="bg-transparent text-sm font-black text-gray-900 border-none focus:ring-0 cursor-pointer italic"
                                        >
                                            {months.map((m, idx) => (
                                                <option key={m} value={idx}>{m}</option>
                                            ))}
                                        </select>
                                    ) : selectedPeriod === 'Annual' ? (
                                        <select
                                            value={selectedDate.getFullYear()}
                                            onChange={(e) => {
                                                const newDate = new Date(selectedDate);
                                                newDate.setFullYear(parseInt(e.target.value));
                                                setSelectedDate(newDate);
                                            }}
                                            className="bg-transparent text-sm font-black text-gray-900 border-none focus:ring-0 cursor-pointer italic"
                                        >
                                            {availableYears.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm font-black text-gray-900 px-4 tabular-nums italic whitespace-nowrap">{currentDateDisplay}</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => adjustDate(1)}
                                    className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 active:scale-90"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div >

                    {/* Charts Section */}
                    < div className="grid grid-cols-1 lg:grid-cols-2 gap-8" >
                        {/* Weekly/Monthly Summary Table */}
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors italic">{t("income.financialComparison")}</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">{t("income.revenueVsSalary")}</p>
                                </div>
                                <History className="w-6 h-6 text-gray-300 group-hover:text-[var(--color-primary)] transition-all" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlySummary}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                                            domain={[(dataMin: number) => Math.min(0, dataMin), (dataMax: number) => Math.max(200, dataMax)]}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                            cursor={{ fill: 'var(--color-primary-light)', opacity: 0.2 }}
                                            formatter={(value: any, name: any, props: any) => {
                                                const labels: Record<string, string> = {
                                                    income: t("income.totalRevenue"),
                                                    potentialIncome: t("common.potential"),
                                                    salary: t("income.payroll"),
                                                    profit: t("team.profit")
                                                };
                                                const actuals: Record<string, number> = {
                                                    income: props.payload.actualIncome,
                                                    potentialIncome: props.payload.actualPotentialIncome,
                                                    salary: props.payload.actualSalary,
                                                    profit: props.payload.actualProfit
                                                };
                                                const key = props.dataKey;
                                                const val = actuals[key] ?? value;
                                                return [format(val), labels[key] || name];
                                            }}
                                        />
                                        <Bar dataKey="income" name={t("income.totalRevenue")} stackId="income" fill="var(--color-primary)" radius={[0, 0, 0, 0]} barSize={20} />
                                        <Bar dataKey="potentialIncome" name={t("common.potential")} stackId="income" fill="var(--color-primary-light)" radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar dataKey="salary" name={t("income.payroll")} stackId="costs" fill="var(--color-secondary)" radius={[0, 0, 0, 0]} barSize={10} />
                                        <Bar dataKey="profit" name={t("team.profit")} stackId="costs" radius={[6, 6, 0, 0]} barSize={10}>
                                            {monthlySummary.map((entry: any) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={entry.actualProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-8">
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                    <div className="w-4 h-4 rounded-lg bg-[var(--color-primary)]"></div> {t("income.revenue")}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                    <div className="w-4 h-4 rounded-lg bg-[var(--color-secondary)]"></div> {t("income.salary")}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                    <div className="w-4 h-4 rounded-lg bg-[var(--color-success)]"></div> {t("team.profit")}
                                </div>
                            </div>
                        </Card>

                        {/* Annual Projection / Category Breakdown */}
                        < Card className="p-8 border-none shadow-md bg-white rounded-3xl group" >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-warning)] transition-colors italic">{t("income.incomeProjection")}</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">{t("income.incomeSources")}</p>
                                </div>
                                <TrendingUp className="w-6 h-6 text-gray-300 group-hover:text-[var(--color-warning)] transition-all" />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative h-64 flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeProjection}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {incomeProjection.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                                                                <p className="text-xs font-bold text-gray-500 mb-1">{data.name}</p>
                                                                <p className="text-sm font-bold" style={{ color: data.color }}>
                                                                    {data.actualValue || 0}%
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <p className={`text-3xl font-black tabular-nums ${incomeProjection.length > 0 && incomeProjection.some(i => i.actualValue > 0) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {incomeProjection.length > 0 && incomeProjection.some(i => i.actualValue > 0) ? '100%' : '0%'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t("income.global")}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {incomeProjection.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                                            </div>
                                            <span className="font-black text-gray-900 tabular-nums">{item.actualValue || 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card >
                    </div >

                    {/* Daily Salary Breakdown Table */}
                    < Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden group" >
                        <div className="p-8 border-b-2 border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight italic">{t("income.incomeJournal")}</h3>
                                <p className="text-sm text-gray-400 font-medium italic">{t("income.detailsAndEarnings")}</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 border-gray-100 group-hover:border-[var(--color-primary)] transition-all">{t("income.seeAll")}</Button>
                        </div>

                        <div className="overflow-x-auto px-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-50 italic">
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("income.table.date")}</th>
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("income.table.team")}</th>
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("income.table.service")}</th>
                                        <th className="px-4 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("income.table.revenue")}</th>
                                        <th className="px-4 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("income.table.status")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {dailyBreakdown.map((row) => (
                                        <tr key={row.id} className="hover:bg-primary-light/30 transition-colors group/row">
                                            <td className="px-4 py-8 text-sm font-black text-gray-900 tabular-nums italic">{formatDate(new Date(row.date), "dd/MM")}</td>
                                            <td className="px-4 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-[var(--color-primary)] font-black text-sm shadow-inner group-hover/row:scale-110 transition-transform">
                                                        {row.workerName?.charAt(0) || "W"}
                                                    </div>
                                                    <span className="font-black text-gray-700 text-sm tracking-tight">{row.workerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-8 text-sm font-bold text-gray-500 italic">{row.serviceName}</td>
                                            <td className="px-4 py-8 text-right font-black text-gray-900 tabular-nums text-lg">{format(row.amount)}</td>
                                            <td className="px-4 py-8 text-center">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${row.status === "Closed" || row.status === "Validated"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-orange-50 text-orange-700 border-orange-100"
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card >

                    {/* Worker Performance Comparison */}
                    < div >
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic">{t("income.teamPerformance")}</h3>
                            <button onClick={() => router.push("/team")} className="text-xs font-black text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-5 py-2.5 rounded-xl transition-all border border-transparent hover:border-[var(--color-primary-light)] uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {t("income.staffDetails")}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {workerPerformance.map((worker, idx) => (
                                <Card key={worker.workerId}
                                    className="p-8 border-none shadow-md bg-white rounded-3xl group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                    onClick={() => router.push(`/team/detail/${worker.workerId}`)}>
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-offset-2 ring-transparent group-hover:ring-[var(--color-primary-light)] transition-all" style={{ backgroundColor: worker.color }}>
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors italic tracking-tight">{worker.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{worker.services} {t("income.services")}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all group-hover:bg-white group-hover:shadow-inner">
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-black">{t("income.ca")}</span>
                                            <span className="font-black text-gray-900 tabular-nums">{format(worker.monthRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all group-hover:bg-white group-hover:shadow-inner">
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-black">{t("income.salary")}</span>
                                            <span className="font-black text-gray-900 tabular-nums">{format(worker.monthCommission)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl transition-all group-hover:bg-white">
                                            <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest font-black">{t("income.tips")}</span>
                                            <span className="font-black text-emerald-600 tabular-nums">{format(worker.monthTips)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex text-yellow-400 scale-90 -translate-x-1">
                                            {"★".repeat(5)}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic pt-1">{t("income.rank")} #{idx + 1}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div >
                </div >
            </MainLayout >
        </RequirePermission >
    );
}
