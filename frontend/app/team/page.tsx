"use client";


import { useState, useCallback, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DateRangeFilter, { DateFilterValue } from "@/components/ui/DateRangeFilter";
import { Users, DollarSign, TrendingUp, Star, Plus, Eye, Edit, Filter, Download, FileText, LayoutGrid, Table, ChevronDown, ChevronLeft, ChevronRight, Award, Calendar, Clock, Percent, Search } from "lucide-react";
import { RequirePermission, useAuth } from "@/context/AuthProvider";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useCurrency } from "@/hooks/useCurrency";
import { workerService, statsService } from "@/lib/services";
import {
    LineChart,
    Line,
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
} from "recharts";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";


const salonId = 1; // Default salon

function TeamPageContent() {
    const searchParams = useSearchParams();
    const { user, hasPermission } = useAuth(); // Assume generic permission check
    const { format } = useCurrency();
    const { t } = useTranslation();
    const initialView = searchParams.get("view") === "advanced" ? "advanced" : "simple";
    const [viewMode, setViewMode] = useState<"simple" | "advanced">(initialView);
    const [timeFilter, setTimeFilter] = useState("Current Month");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [sortBy, setSortBy] = useState("Highest Income");

    // Real Data State
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        activeWorkers: 0,
        totalRevenue: 0,
        totalSalary: 0,
        totalClients: 0
    });

    // Chart states
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [clientVolume, setClientVolume] = useState<any[]>([]);
    const [earningsBreakdown, setEarningsBreakdown] = useState<any[]>([]);
    const [weeklyPerformance, setWeeklyPerformance] = useState<any[]>([]);

    const [salaryPerformance, setSalaryPerformance] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [serviceTimeDist, setServiceTimeDist] = useState<any[]>([]);
    const [topServices, setTopServices] = useState<any[]>([]);
    const [overallPerformance, setOverallPerformance] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch workers and stats
                const [workersList, workersStats, trend, clientVol, earnings, weeklyPerf, salaryPerf, activity, reviews, serviceTime, topSvc, overallPerf] = await Promise.all([
                    workerService.getAll(salonId),
                    statsService.getAllWorkersStats(salonId),
                    statsService.getRevenueTrend(salonId, 6),
                    statsService.getClientVolumeTrend(salonId, 0),
                    statsService.getEarningsBreakdown(salonId, 0),
                    statsService.getWeeklyPerformanceDetails(salonId, 0),
                    statsService.getSalaryPerformance(salonId, 0),
                    statsService.getRecentWorkerActivity(salonId, 0, 5),
                    statsService.getAllReviews(salonId, 5),
                    statsService.getServiceTimeDistribution(salonId, 0),
                    statsService.getServicesByRevenue(salonId, undefined, 5),
                    statsService.getOverallPerformance(salonId, 0)
                ]);

                // Merge data
                const enrichedWorkers = workersList.map(w => {
                    const stat = workersStats.find(s => s.workerId === w.id) || {
                        totalRevenue: 0,
                        monthRevenue: 0,
                        yearRevenue: 0,
                        totalClients: 0,
                        avgRating: 0,
                        completedBookings: 0,
                        workerId: w.id,
                        salonId: salonId,
                        name: w.name,
                        totalBookings: 0,
                        totalReviews: 0
                    };

                    const totalSalary = (stat.totalRevenue * w.sharingKey) / 100;
                    const monthSalary = (stat.monthRevenue * w.sharingKey) / 100;
                    const yearSalary = (stat.yearRevenue * w.sharingKey) / 100;

                    return {
                        ...w,
                        totalRevenue: stat.totalRevenue,
                        monthRevenue: stat.monthRevenue,
                        yearRevenue: stat.yearRevenue,
                        totalSalary: totalSalary,
                        monthSalary: monthSalary,
                        yearSalary: yearSalary,
                        clients: stat.totalClients,
                        rating: stat.avgRating || 0, // Default if no rating
                        services: stat.completedBookings || 0
                    };
                });

                setWorkers(enrichedWorkers);

                // Calculate aggregations
                const activeWorkers = enrichedWorkers.filter(w => w.status === 'Active').length;
                const totalRev = enrichedWorkers.reduce((sum, w) => sum + (w.totalRevenue || 0), 0);
                const totalSal = enrichedWorkers.reduce((sum, w) => sum + (w.totalSalary || 0), 0);
                const totalCli = enrichedWorkers.reduce((sum, w) => sum + w.clients, 0);

                setStats({
                    activeWorkers,
                    totalRevenue: totalRev,
                    totalSalary: totalSal,
                    totalClients: totalCli
                });

                // Map trend for chart
                setRevenueTrend(trend.map(t => ({ name: t.month, value: t.revenue })));
                setClientVolume(clientVol.map(c => ({ month: c.month, value: c.clients })));
                setEarningsBreakdown(earnings);
                setWeeklyPerformance(weeklyPerf);
                setSalaryPerformance(salaryPerf);
                setRecentActivity(activity);
                setRecentReviews(reviews);
                setServiceTimeDist(serviceTime);
                setTopServices(topSvc);
                setOverallPerformance(overallPerf);

            } catch (error) {
                console.error("Failed to fetch team data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const { getCardStyle } = useKpiCardStyle();

    // Derived values for Simple View
    const totalRevenue = stats.totalRevenue;
    const totalSalary = stats.totalSalary;
    const totalClients = stats.totalClients;
    const activeTeam = stats.activeWorkers;

    // Simple View filtering state
    const [simpleSearch, setSimpleSearch] = useState("");
    const [simpleDateFilter, setSimpleDateFilter] = useState<DateFilterValue>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, week: null });
    const [simpleCardsPage, setSimpleCardsPage] = useState(1);
    const [simpleTablePage, setSimpleTablePage] = useState(1);
    const simpleCardsPerPage = 8;
    const simpleTablePerPage = 5;

    const handleSimpleDateChange = useCallback((value: DateFilterValue) => {
        setSimpleDateFilter(value);
        setSimpleCardsPage(1);
        setSimpleTablePage(1);
    }, []);

    // Filter workers for Simple View based on search
    const simpleFilteredTeam = workers.filter((worker) => {
        if (simpleSearch && !worker.name.toLowerCase().includes(simpleSearch.toLowerCase())) {
            return false;
        }
        return true;
    });

    // Pagination for Simple View cards
    const totalSimpleCardsPages = Math.ceil(simpleFilteredTeam.length / simpleCardsPerPage);
    const paginatedSimpleCards = simpleFilteredTeam.slice((simpleCardsPage - 1) * simpleCardsPerPage, simpleCardsPage * simpleCardsPerPage);

    // Pagination for Simple View table
    const totalSimpleTablePages = Math.ceil(simpleFilteredTeam.length / simpleTablePerPage);
    const paginatedSimpleTable = simpleFilteredTeam.slice((simpleTablePage - 1) * simpleTablePerPage, simpleTablePage * simpleTablePerPage);

    // Team Members list filtering state (Advanced View)
    const [teamDateFilter, setTeamDateFilter] = useState<DateFilterValue>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, week: null });
    const [teamSearch, setTeamSearch] = useState("");
    const [teamPage, setTeamPage] = useState(1);
    const teamPerPage = 5;

    const handleTeamDateChange = useCallback((value: DateFilterValue) => {
        setTeamDateFilter(value);
        setTeamPage(1); // Reset to first page when filter changes
    }, []);

    // Filter workers based on search (name match)
    const filteredTeam = workers.filter((worker) => {
        if (teamSearch && !worker.name.toLowerCase().includes(teamSearch.toLowerCase())) {
            return false;
        }
        // Apply status filter
        if (statusFilter !== "All Status" && worker.status !== statusFilter) {
            return false;
        }
        return true;
    });

    // Pagination for Team list
    const totalTeamPages = Math.ceil(filteredTeam.length / teamPerPage);
    const paginatedTeam = filteredTeam.slice((teamPage - 1) * teamPerPage, teamPage * teamPerPage);

    // Simple View JSX (using variable instead of component to prevent remounting)
    const simpleView = (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title={t("team.totalMembers")}
                    value={workers.length}
                    icon={Users}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title={t("team.totalIncome")}
                    value={format(totalRevenue)}
                    subtitle={t("team.allWorkers")}
                    icon={DollarSign}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title={t("team.totalSalaries")}
                    value={format(totalSalary)}
                    subtitle={t("team.allWorkers")}
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title={t("team.totalClients")}
                    value={totalClients}
                    subtitle={t("team.allWorkers")}
                    icon={Star}
                    gradient=""
                    style={getCardStyle(3)}
                />
            </div>

            {/* Team Members Cards Section with Filters */}
            <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[var(--color-primary)]" />
                            {t("team.title")} ({simpleFilteredTeam.length})
                        </h3>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangeFilter onChange={handleSimpleDateChange} showWeekFilter={false} />

                        <div className="relative w-full md:w-64 md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("team.searchPlaceholder")}
                                value={simpleSearch}
                                onChange={(e) => { setSimpleSearch(e.target.value); setSimpleCardsPage(1); setSimpleTablePage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {paginatedSimpleCards.length > 0 ? (
                        paginatedSimpleCards.map((worker, index) => (
                            <div key={worker.id} className="p-3 md:p-5 border border-[var(--color-primary-light)] rounded-lg md:rounded-xl hover:shadow-md transition-all bg-white/80 hover:shadow-lg">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br ${index % 2 === 0 ? "from-[var(--color-primary)] to-[var(--color-primary-dark)]" : "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]"} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm`}>
                                        {worker.avatarUrl}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">{worker.name}</h4>
                                        <div className="flex items-center gap-2 md:mt-1">
                                            <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${worker.status === "Active" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-gray-100 text-gray-700"}`}>
                                                {worker.status}
                                            </span>
                                            <div className="flex items-center gap-0.5 md:gap-1">
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                                                <span className="text-[10px] md:text-xs font-semibold">{worker.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile: inline stats / Desktop: vertical stats */}
                                <div className="flex md:hidden items-center justify-between text-xs mb-2 px-1">
                                    <span className="text-gray-500">{t("team.share")}: <span className="font-semibold text-[var(--color-primary)]">{worker.sharingKey}%</span></span>
                                    <span className="text-gray-500">{t("team.totalIncome")}: <span className="font-semibold text-gray-900">{format(worker.totalRevenue)}</span></span>
                                </div>
                                <div className="hidden md:block space-y-2 mb-4 px-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t("team.share")}:</span>
                                        <span className="font-semibold text-[var(--color-primary)]">{worker.sharingKey}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t("team.totalIncome")}:</span>
                                        <span className="font-semibold text-gray-900">{format(worker.totalRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t("team.totalClients")}:</span>
                                        <span className="font-semibold text-gray-900">{worker.clients}</span>
                                    </div>
                                </div>

                                <div className="flex gap-1 md:gap-2">
                                    <Link href={`/team/detail/${worker.id}`} className="flex-1">
                                        <button className="w-full py-1 md:py-2 text-[10px] md:text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded md:rounded-lg hover:opacity-80 transition flex items-center justify-center gap-0.5 md:gap-1">
                                            <Eye className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> {t("common.detail")}
                                        </button>
                                    </Link>
                                    <RequirePermission role={['manager']}>
                                        <ReadOnlyGuard>
                                            <Link href={`/team/edit/${worker.id}`} className="flex-1">
                                                <button className="w-full py-1 md:py-2 text-[10px] md:text-xs font-medium text-[var(--color-secondary)] bg-[var(--color-secondary-light)] rounded md:rounded-lg hover:opacity-80 transition flex items-center justify-center gap-0.5 md:gap-1">
                                                    <Edit className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> {t("common.edit")}
                                                </button>
                                            </Link>
                                        </ReadOnlyGuard>
                                    </RequirePermission>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {t("team.noWorkersFound")}
                        </div>
                    )}
                </div>

                {/* Cards Pagination */}
                {totalSimpleCardsPages > 1 && (
                    <div className="flex items-center justify-between px-2 pt-4 mt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {t("common.pagination", { start: ((simpleCardsPage - 1) * simpleCardsPerPage) + 1, end: Math.min(simpleCardsPage * simpleCardsPerPage, simpleFilteredTeam.length), total: simpleFilteredTeam.length })}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSimpleCardsPage(p => Math.max(1, p - 1))}
                                disabled={simpleCardsPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalSimpleCardsPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setSimpleCardsPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${simpleCardsPage === page ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-100 text-gray-600"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSimpleCardsPage(p => Math.min(totalSimpleCardsPages, p + 1))}
                                disabled={simpleCardsPage === totalSimpleCardsPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Performance Table with Filters */}
            <Card>
                <div className="flex flex-col gap-4 p-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t("team.performanceOverview")}</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />{t("common.export")}</Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangeFilter onChange={handleSimpleDateChange} showWeekFilter={false} />

                        <div className="relative w-full md:w-64 md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("team.searchPlaceholder")}
                                value={simpleSearch}
                                onChange={(e) => { setSimpleSearch(e.target.value); setSimpleCardsPage(1); setSimpleTablePage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6 pb-2 scrollbar-thin scrollbar-thumb-[var(--color-primary-light)] scrollbar-track-transparent">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 bg-white z-10 italic">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{t("team.member")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.share")} %</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.totalIncome")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.totalSalaries")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.totalClients")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.detail")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedSimpleTable.length > 0 ? (
                                paginatedSimpleTable.map((worker, index) => (
                                    <tr key={worker.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 bg-gradient-to-br ${index % 2 === 0 ? "from-[var(--color-primary)] to-[var(--color-primary-dark)]" : "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]"} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                                    {worker.avatarUrl}
                                                </div>
                                                <span className="font-medium text-gray-900">{worker.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${worker.status === "Active" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-gray-100 text-gray-700"}`}>
                                                {worker.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-[var(--color-primary)] font-semibold">{worker.sharingKey}%</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{format(worker.totalRevenue)}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">{format(worker.totalSalary)}</td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">{worker.clients}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                                                <span className="font-semibold">{worker.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/team/detail/${worker.id}`}>
                                                    <button className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition text-[var(--color-primary)]">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <RequirePermission role={['manager']}>
                                                    <ReadOnlyGuard>
                                                        <Link href={`/team/edit/${worker.id}`}>
                                                            <button className="p-2 hover:bg-[var(--color-secondary-light)] rounded-lg transition text-[var(--color-secondary)]">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                    </ReadOnlyGuard>
                                                </RequirePermission>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        {t("team.noWorkersFound")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {totalSimpleTablePages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {t("common.pagination", { start: ((simpleTablePage - 1) * simpleTablePerPage) + 1, end: Math.min(simpleTablePage * simpleTablePerPage, simpleFilteredTeam.length), total: simpleFilteredTeam.length })}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSimpleTablePage(p => Math.max(1, p - 1))}
                                disabled={simpleTablePage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalSimpleTablePages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setSimpleTablePage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${simpleTablePage === page ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-100 text-gray-600"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSimpleTablePage(p => Math.min(totalSimpleTablePages, p + 1))}
                                disabled={simpleTablePage === totalSimpleTablePages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );


    // Advanced View JSX (using variable instead of component to prevent remounting)
    const advancedView = (
        <div className="space-y-4">
            {/* Summary Stats - Colored Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">{t("team.activeWorkers")}</span>
                    </div>
                    <p className="text-3xl font-bold">{activeTeam}</p>
                    <p className="text-xs opacity-70 mt-1">{t("team.activeWorkersCount", { count: activeTeam })}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">{t("team.totalIncome")}</span>
                    </div>
                    <p className="text-3xl font-bold">{format(totalRevenue)}</p>
                    <p className="text-xs opacity-70 mt-1">{t("team.fromLastMonth", { value: "+18.5%" })}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">{t("team.totalSalaries")}</span>
                    </div>
                    <p className="text-3xl font-bold">{format(totalSalary)}</p>
                    <p className="text-xs opacity-70 mt-1">{t("team.revenueShare", { value: "75%" })}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Star className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">{t("team.totalClients")}</span>
                    </div>
                    <p className="text-3xl font-bold">{totalClients}</p>
                    <p className="text-xs opacity-70 mt-1">{t("team.fromLastMonth", { value: "+42" })}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t("team.timePeriod")}</span>
                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>{t("team.currentMonth")}</option><option>{t("team.lastMonth")}</option><option>{t("team.last3Months")}</option><option>{t("team.thisYear")}</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t("common.status")}</span>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>{t("common.allStatuses")}</option><option>{t("common.active")}</option><option>{t("common.inactive")}</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t("team.sortBy")}</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>{t("team.highestIncome")}</option><option>{t("team.lowestIncome")}</option><option>{t("team.highestRating")}</option><option>{t("team.mostClients")}</option>
                    </select>
                </div>
                <div className="flex-1"></div>
                <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" />{t("team.applyFilters")}</Button>
                <Button variant="outline" size="sm">{t("team.reset")}</Button>
            </div>

            {/* Team Members List Table */}
            <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-gray-100 gap-4">
                    <h3 className="text-lg font-bold text-gray-900">{t("team.membersList")}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />{t("common.export")}</Button>
                        <Button variant="outline" size="sm" className="gap-2"><FileText className="w-4 h-4" />{t("common.print")}</Button>
                    </div>
                </div>

                {/* Filters Row: DateRangeFilter + Search */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 border-b border-gray-100">
                    <DateRangeFilter onChange={handleTeamDateChange} showWeekFilter={true} />

                    {/* Search */}
                    <div className="relative w-full md:w-64 md:ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("team.searchByName")}
                            value={teamSearch}
                            onChange={(e) => { setTeamSearch(e.target.value); setTeamPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.member")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("team.share")} %</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.monthIncome")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.monthSalary")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.yearIncome")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.yearSalary")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("team.totalClients")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.rating")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTeam.length > 0 ? (
                                paginatedTeam.map((worker, index) => (
                                    <tr key={worker.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${index % 2 === 0 ? "from-[var(--color-primary)] to-[var(--color-primary-dark)]" : "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]"} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>{worker.avatarUrl}</div>
                                                <div><p className="font-semibold text-gray-900">{worker.name}</p><p className="text-xs text-gray-500">ID: TEAM-00{worker.id}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${worker.sharingKey >= 65 ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : worker.sharingKey >= 55 ? "bg-[var(--color-secondary-light)] text-[var(--color-secondary)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"}`}>{worker.sharingKey}%</span></td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{format(worker.monthRevenue)}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-secondary)]">{format(worker.monthSalary)}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{format(worker.yearRevenue)}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">{format(worker.yearSalary)}</td>
                                        <td className="px-4 py-4 text-center"><span className="text-gray-900 font-medium">{worker.clients}</span><br /><span className="text-xs text-gray-500">clients</span></td>
                                        <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" /><span className="font-semibold text-gray-900">{worker.rating}</span></div></td>
                                        <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "Active" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-error-light)] text-[var(--color-error)]"}`}>{worker.status}</span></td>
                                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><Link href={`/team/detail/${worker.id}`}><button className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition text-[var(--color-primary)]"><Eye className="w-4 h-4" /></button></Link><RequirePermission role={['manager']}><ReadOnlyGuard><Link href={`/team/edit/${worker.id}`}><button className="p-2 hover:bg-[var(--color-secondary-light)] rounded-lg transition text-[var(--color-secondary)]"><Edit className="w-4 h-4" /></button></Link></ReadOnlyGuard></RequirePermission></div></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        {t("team.noWorkersFound")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalTeamPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {t("common.pagination", { start: ((teamPage - 1) * teamPerPage) + 1, end: Math.min(teamPage * teamPerPage, filteredTeam.length), total: filteredTeam.length })}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTeamPage(p => Math.max(1, p - 1))}
                                disabled={teamPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalTeamPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setTeamPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${teamPage === page ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-100 text-gray-600"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setTeamPage(p => Math.min(totalTeamPages, p + 1))}
                                disabled={teamPage === totalTeamPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card >

            {/* Weekly Revenue Breakdown & Client Volume Trend */}
            < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="font-bold text-gray-900">{t("team.weeklyIncomeBreakdown")}</h3><p className="text-xs text-gray-500">{t("team.last12Weeks")}</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="font-bold text-gray-900">{t("team.clientVolumeTrend")}</h3><p className="text-xs text-gray-500">{t("team.last6Months")}</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={clientVolume}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-secondary)" strokeWidth={3} dot={{ fill: "var(--color-secondary)", r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div >

            {/* Earnings Breakdown Analysis */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">{t("team.earningsBreakdown")}</h3><p className="text-xs text-gray-500">{t("team.byServiceType")}</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={earningsBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                            {earningsBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4 flex-wrap">
                    {earningsBreakdown.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-gray-600">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Weekly Performance Details Table */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{t("team.weeklyPerformance")}</h3>
                    <Button variant="outline" size="sm" className="text-xs"><ChevronDown className="w-3 h-3 mr-1" />{t("team.showAll")}</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{t("team.period")}</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">{t("team.totalClients")}</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">{t("common.service")}</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">{t("team.totalIncome")}</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">{t("common.expenses")}</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">{t("team.profit")}</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">{t("team.trend")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {weeklyPerformance.map((row: any, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-success)] font-medium">{format(row.revenue)}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-error)] font-medium">{format(row.expenses)}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-primary)] font-bold">{format(row.profit)}</td>
                                    <td className="px-3 py-3 text-center"><TrendingUp className="w-4 h-4 text-[var(--color-success)] mx-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card >

            {/* Salary / Performance Details Chart */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Salary / Performance Details</h3><p className="text-xs text-gray-500">Monthly breakdown</p></div>
                    <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full font-medium">Daily</button>
                        <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Weekly</button>
                        <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Monthly</button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salaryPerformance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="value1" fill="var(--color-primary)" />
                        <Bar dataKey="value2" fill="var(--color-secondary)" />
                        <Bar dataKey="value3" fill="var(--color-warning)" />
                        <Bar dataKey="value4" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card >

            {/* Daily Activities Log & Client Satisfaction */}
            < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Daily Activities Log</h3>
                    <div className="space-y-3">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${activity.type === "payment" ? "bg-[var(--color-success-light)] border-[var(--color-success-light)]" : "bg-[var(--color-info-light,bg-blue-50)] border-[var(--color-info-light,border-blue-100)]"}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border">A</div>
                                        <div><p className="font-medium text-gray-900 text-sm">{activity.action}</p><p className="text-xs text-gray-500">{new Date(activity.time).toLocaleTimeString()}</p></div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${activity.type === "payment" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-info-light,bg-blue-100)] text-[var(--color-info,text-blue-700)]"}`}>{activity.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Client Satisfaction Ratings</h3>
                    <div className="space-y-3">
                        {recentReviews.map((client, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center font-bold`}>{client.avatar}</div>
                                    <div><p className="font-medium text-gray-900 text-sm">{client.client}</p><p className="text-xs text-gray-500">{client.service} • {client.date}</p></div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${client.rating >= 4 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : client.rating >= 3 ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-error-light)] text-[var(--color-error)]'}`}>
                                        {client.rating}
                                    </span>
                                    <Star className="w-4 h-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div >

            {/* Service Time Distribution & Top Appointment Services */}
            < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Service Time Distribution</h3>
                    <div className="flex items-center justify-between">
                        <div className="w-1/2">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={serviceTimeDist} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                        {serviceTimeDist.map((entry, index) => (<Cell key={`cell - ${index} `} fill={entry.color} />))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-2">
                            {serviceTimeDist.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-gray-600">{item.name}</span></div>
                                    <span className="font-medium text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Top Appointment Services</h3>
                    <div className="space-y-3">
                        <div className="space-y-3">
                            {topServices.map((service, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${service.color || 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                                        <span className="text-sm font-bold text-[var(--color-primary)]">{format(service.income)}</span>
                                    </div>
                                    <div className="w-full bg-white/50 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full" style={{ width: `${service.percentage}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{service.count} bookings</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div >

            {/* Overall Performance Summary Chart */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Overall Performance Summary</h3>
                    <Button variant="outline" size="sm" className="text-xs">Download Report</Button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallPerformance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="value1" fill="#8B5CF6" />
                        <Bar dataKey="value2" fill="#EC4899" />
                        <Bar dataKey="value3" fill="#F59E0B" />
                        <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card >

            {/* Annual Summary Table */}
            <Card className="overflow-hidden">
                <div className="p-8 text-center text-gray-400">
                    <p className="font-medium">Annual Performance Summary</p>
                    <p className="text-sm mt-1">Detailed annual breakdown coming soon</p>
                </div>
            </Card>
        </div >
    );

    return (
        <TeamLayout title="Team Overview" description="Manage your team and track their performance">
            <div className="space-y-6">
                {/* View Toggle + Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
                        <button
                            onClick={() => setViewMode("simple")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "simple"
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>Simple List</span>
                        </button>
                        <button
                            onClick={() => setViewMode("advanced")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "advanced"
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <Table className="w-4 h-4" />
                            <span>Advanced View</span>
                        </button>
                    </div>
                    <div className="flex w-full md:w-auto items-center justify-end gap-3">
                        <RequirePermission role={['manager']}>
                            <ReadOnlyGuard>
                                <Link href="/team/add">
                                    <Button variant="outline" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-sm active:scale-95 transition-all">
                                        <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                        <span className="hidden md:inline ml-2 text-sm font-bold whitespace-nowrap">Quick Add</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <Link href="/team/add-advanced">
                                    <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                        <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                        <span className="hidden md:inline ml-2 text-sm font-bold whitespace-nowrap">Complete Form</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                        </RequirePermission>
                    </div>
                </div>
                {viewMode === "simple" ? simpleView : advancedView}
            </div>
        </TeamLayout>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <TeamLayout title="Team" description="Loading...">
            <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        </TeamLayout>
    );
}

export default function TeamPage() {
    return (
        <ProtectedRoute requiredRole={['manager']}>
            <Suspense fallback={<div>Loading Team...</div>}>
                <TeamPageContent />
            </Suspense>
        </ProtectedRoute>
    );
}
