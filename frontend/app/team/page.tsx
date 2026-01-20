"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DateRangeFilter, { DateFilterValue } from "@/components/ui/DateRangeFilter";
import { Users, DollarSign, TrendingUp, Star, Plus, Eye, Edit, Filter, Download, FileText, LayoutGrid, Table, ChevronDown, ChevronLeft, ChevronRight, Award, Calendar, Clock, Percent, Search } from "lucide-react";
import { RequirePermission } from "@/context/AuthProvider";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
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

const workers = [
    { id: 1, name: "Orphelia", avatar: "O", status: "Active", sharingKey: 70, totalRevenue: "€45,830", totalSalary: "€32,081", monthRevenue: "€4,990", monthSalary: "€3,423", yearRevenue: "€52,450", yearSalary: "€36,715", clients: 187, rating: 4.9, services: 203, color: "from-[var(--color-primary)] to-[var(--color-primary-dark)]" },
    { id: 2, name: "Team Member 2", avatar: "W2", status: "Active", sharingKey: 55, totalRevenue: "€38,650", totalSalary: "€21,258", monthRevenue: "€3,050", monthSalary: "€2,000", yearRevenue: "€41,230", yearSalary: "€22,577", clients: 156, rating: 4.8, services: 178, color: "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]" },
    { id: 3, name: "Team Member 3", avatar: "W3", status: "Active", sharingKey: 60, totalRevenue: "€42,200", totalSalary: "€25,320", monthRevenue: "€3,430", monthSalary: "€2,552", yearRevenue: "€38,450", yearSalary: "€33,330", clients: 165, rating: 4.7, services: 189, color: "from-[var(--color-warning)] to-[var(--color-warning-dark)]" },
    { id: 4, name: "Team Member 4", avatar: "W4", status: "Active", sharingKey: 50, totalRevenue: "€35,420", totalSalary: "€17,710", monthRevenue: "€2,980", monthSalary: "€1,690", yearRevenue: "€34,380", yearSalary: "€17,180", clients: 142, rating: 4.6, services: 165, color: "from-[var(--color-success)] to-[var(--color-success-dark)]" },
    { id: 5, name: "Team Member 5", avatar: "W5", status: "Inactive", sharingKey: 55, totalRevenue: "€28,340", totalSalary: "€15,587", monthRevenue: "€2,750", monthSalary: "€1,815", yearRevenue: "€31,200", yearSalary: "€17,160", clients: 118, rating: 4.5, services: 134, color: "from-[var(--color-info,bg-blue-500)] to-[var(--color-info-dark,bg-blue-700)]" },
    { id: 6, name: "Team Member 6", avatar: "W6", status: "Active", sharingKey: 65, totalRevenue: "€39,850", totalSalary: "€25,903", monthRevenue: "€2,340", monthSalary: "€1,270", yearRevenue: "€28,980", yearSalary: "€16,685", clients: 171, rating: 4.8, services: 192, color: "from-[var(--color-primary)] to-[var(--color-primary-dark)]" },
    { id: 7, name: "Team Member 7", avatar: "W7", status: "Active", sharingKey: 55, totalRevenue: "€32,450", totalSalary: "€17,848", monthRevenue: "€2,320", monthSalary: "€1,276", yearRevenue: "€28,490", yearSalary: "€14,540", clients: 124, rating: 4.6, services: 145, color: "from-[var(--color-secondary)] opacity-80 to-[var(--color-secondary-dark)]" },
    { id: 8, name: "Team Member 8", avatar: "W8", status: "Active", sharingKey: 60, totalRevenue: "€29,870", totalSalary: "€17,922", monthRevenue: "€1,960", monthSalary: "€676", yearRevenue: "€22,340", yearSalary: "€9,170", clients: 112, rating: 4.4, services: 128, color: "from-[var(--color-warning)] opacity-80 to-[var(--color-warning-dark)]" },
    { id: 9, name: "Team Member 9", avatar: "W9", status: "Inactive", sharingKey: 50, totalRevenue: "€24,680", totalSalary: "€12,340", monthRevenue: "€1,850", monthSalary: "€1,000", yearRevenue: "€24,600", yearSalary: "€13,240", clients: 98, rating: 4.3, services: 108, color: "from-[var(--color-info-light,bg-cyan-500)] to-[var(--color-info,bg-cyan-700)]" },
    { id: 10, name: "Team Member 10", avatar: "W10", status: "Active", sharingKey: 58, totalRevenue: "€27,340", totalSalary: "€15,857", monthRevenue: "€1,820", monthSalary: "€690", yearRevenue: "€22,340", yearSalary: "€11,170", clients: 108, rating: 4.2, services: 118, color: "from-[var(--color-success)] opacity-80 to-[var(--color-success-dark)]" },
    { id: 11, name: "Team Member 11", avatar: "W11", status: "Active", sharingKey: 52, totalRevenue: "€21,560", totalSalary: "€11,211", monthRevenue: "€1,690", monthSalary: "€820", yearRevenue: "€18,720", yearSalary: "€9,360", clients: 87, rating: 4.0, services: 95, color: "from-[var(--color-primary)] opacity-70 to-[var(--color-primary-dark)]" },
    { id: 12, name: "Team Member 12", avatar: "W12", status: "Inactive", sharingKey: 50, totalRevenue: "€18,230", totalSalary: "€9,115", monthRevenue: "€1,600", monthSalary: "€740", yearRevenue: "€16,890", yearSalary: "€8,445", clients: 72, rating: 3.9, services: 82, color: "from-[var(--color-secondary)] opacity-70 to-[var(--color-secondary-dark)]" },
];

// Chart Data
const weeklyRevenueData = [
    { name: "Mon", value: 65 }, { name: "Tue", value: 80 }, { name: "Wed", value: 55 },
    { name: "Thu", value: 90 }, { name: "Fri", value: 70 }, { name: "Sat", value: 85 },
    { name: "Sun", value: 60 }, { name: "Mon", value: 75 }, { name: "Tue", value: 65 },
    { name: "Wed", value: 80 }, { name: "Thu", value: 70 }, { name: "Fri", value: 85 },
];

const clientVolumeTrend = [
    { month: "Jan", value: 40 }, { month: "Feb", value: 55 }, { month: "Mar", value: 45 },
    { month: "Apr", value: 60 }, { month: "May", value: 50 }, { month: "Jun", value: 65 },
];

const earningsBreakdownData = [
    { month: "Jan", braids: 35, twists: 28, cornrows: 22, locs: 18 },
    { month: "Feb", braids: 40, twists: 32, cornrows: 25, locs: 20 },
    { month: "Mar", braids: 38, twists: 30, cornrows: 23, locs: 19 },
    { month: "Apr", braids: 45, twists: 35, cornrows: 28, locs: 22 },
    { month: "May", braids: 42, twists: 33, cornrows: 26, locs: 21 },
    { month: "Jun", braids: 48, twists: 38, cornrows: 30, locs: 24 },
];

const weeklyPerformanceDetails = [
    { date: "January 2024", clients: 42, services: 45, revenue: 4500, expenses: 1200, profit: 3300 },
    { date: "February 2024", clients: 38, services: 42, revenue: 4200, expenses: 1100, profit: 3100 },
    { date: "March 2024", clients: 45, services: 48, revenue: 4800, expenses: 1300, profit: 3500 },
    { date: "April 2024", clients: 50, services: 55, revenue: 5500, expenses: 1500, profit: 4000 },
    { date: "May 2024", clients: 48, services: 52, revenue: 5200, expenses: 1400, profit: 3800 },
    { date: "June 2024", clients: 52, services: 58, revenue: 5800, expenses: 1600, profit: 4200 },
];

const salaryPerformanceData = [
    { month: "Jan", value1: 50, value2: 40, value3: 60, value4: 55 },
    { month: "Feb", value1: 55, value2: 45, value3: 65, value4: 58 },
    { month: "Mar", value1: 52, value2: 42, value3: 62, value4: 56 },
    { month: "Apr", value1: 58, value2: 48, value3: 68, value4: 60 },
    { month: "May", value1: 60, value2: 50, value3: 70, value4: 62 },
    { month: "Jun", value1: 65, value2: 55, value3: 75, value4: 68 },
];

const dailyActivities = [
    { time: "9:00 AM", client: "Marie Dubois", service: "Box Braids", status: "Completed", amount: "€120" },
    { time: "11:30 AM", client: "Sophie Laurent", service: "Twists", status: "Completed", amount: "€95" },
    { time: "2:00 PM", client: "Anna Martin", service: "Cornrows", status: "In Progress", amount: "€85" },
    { time: "4:30 PM", client: "Claire Petit", service: "Locs", status: "Pending", amount: "€150" },
];

const clientSatisfactionData = [
    { name: "Marie Dubois", rating: 4.9, service: "Box Braids", date: "2 days ago", avatar: "M", color: "bg-[var(--color-primary-light)] text-[var(--color-primary)]" },
    { name: "Sophie Laurent", rating: 4.8, service: "Twists", date: "1 week ago", avatar: "S", color: "bg-[var(--color-secondary-light)] text-[var(--color-secondary)]" },
    { name: "Anna Martin", rating: 5.0, service: "Cornrows", date: "2 weeks ago", avatar: "A", color: "bg-[var(--color-warning-light)] text-[var(--color-warning)]" },
];

const serviceTimeDistribution = [
    { name: "Box Braids", value: 35, color: "var(--color-primary)" },
    { name: "Twists", value: 25, color: "var(--color-secondary)" },
    { name: "Cornrows", value: 20, color: "var(--color-warning)" },
    { name: "Locs", value: 12, color: "var(--color-success)" },
    { name: "Other", value: 8, color: "var(--color-info, #3B82F6)" },
];

const topAppointmentServices = [
    { name: "Senegalese Twists", count: 156, revenue: "€18,720", percentage: 35, color: "bg-[var(--color-primary-light)]" },
    { name: "Box Braids", count: 98, revenue: "€12,740", percentage: 25, color: "bg-[var(--color-secondary-light)]" },
    { name: "Locs Maintenance", count: 87, revenue: "€7,395", percentage: 20, color: "bg-[var(--color-warning-light)]" },
    { name: "Cornrows", count: 65, revenue: "€9,750", percentage: 12, color: "bg-[var(--color-warning-light)]" },
];

const overallPerformanceData = [
    { month: "Jan", value1: 55, value2: 45, value3: 65, value4: 50 },
    { month: "Feb", value1: 60, value2: 50, value3: 70, value4: 55 },
    { month: "Mar", value1: 58, value2: 48, value3: 68, value4: 52 },
    { month: "Apr", value1: 65, value2: 55, value3: 75, value4: 58 },
    { month: "May", value1: 70, value2: 60, value3: 80, value4: 62 },
    { month: "Jun", value1: 75, value2: 65, value3: 85, value4: 68 },
];

// Calculate annual summary data
const annualSummaryData = workers.map(worker => {
    const totalRevenue = parseFloat(worker.yearRevenue.replace(/[€,]/g, ""));
    const totalSalary = parseFloat(worker.yearSalary.replace(/[€,]/g, ""));
    const salonShare = totalRevenue - totalSalary;
    const tax = totalSalary * 0.20;
    const netAfterTax = totalSalary - tax;
    return { id: worker.id, name: worker.name, avatar: worker.avatar, color: worker.color, totalRevenue, totalSalary, salonShare, totalClients: worker.clients, avgRating: worker.rating, tax, netAfterTax };
});

const annualTotals = {
    totalRevenue: annualSummaryData.reduce((sum, w) => sum + w.totalRevenue, 0),
    totalSalary: annualSummaryData.reduce((sum, w) => sum + w.totalSalary, 0),
    salonShare: annualSummaryData.reduce((sum, w) => sum + w.salonShare, 0),
    totalClients: annualSummaryData.reduce((sum, w) => sum + w.totalClients, 0),
    avgRating: (annualSummaryData.reduce((sum, w) => sum + w.avgRating, 0) / annualSummaryData.length).toFixed(1),
    tax: annualSummaryData.reduce((sum, w) => sum + w.tax, 0),
    netAfterTax: annualSummaryData.reduce((sum, w) => sum + w.netAfterTax, 0),
};

function TeamPageContent() {
    const searchParams = useSearchParams();
    const initialView = searchParams.get("view") === "advanced" ? "advanced" : "simple";
    const [viewMode, setViewMode] = useState<"simple" | "advanced">(initialView);
    const [timeFilter, setTimeFilter] = useState("Current Month");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [sortBy, setSortBy] = useState("Highest Income");

    const { getCardStyle } = useKpiCardStyle();

    const totalRevenue = workers.reduce((sum, w) => sum + parseFloat(w.totalRevenue.replace(/[€,]/g, "")), 0);
    const totalSalary = workers.reduce((sum, w) => sum + parseFloat(w.totalSalary.replace(/[€,]/g, "")), 0);
    const totalClients = workers.reduce((sum, w) => sum + w.clients, 0);
    const activeTeam = workers.filter(w => w.status === "Active").length;

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
                    title="Total Team Members"
                    value={workers.length}
                    icon={Users}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title="Total Income"
                    value={`€${totalRevenue.toLocaleString()} `}
                    subtitle="All workers"
                    icon={DollarSign}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title="Total Salaries"
                    value={`€${totalSalary.toLocaleString()} `}
                    subtitle="All workers"
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title="Total Clients"
                    value={totalClients}
                    subtitle="All workers"
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
                            Team ({simpleFilteredTeam.length})
                        </h3>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangeFilter onChange={handleSimpleDateChange} showWeekFilter={false} />

                        <div className="relative w-full md:w-64 md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workers..."
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
                        paginatedSimpleCards.map((worker) => (
                            <div key={worker.id} className="p-3 md:p-5 border border-[var(--color-primary-light)] rounded-lg md:rounded-xl hover:shadow-md transition-all bg-white/80 hover:shadow-lg">
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm`}>
                                        {worker.avatar}
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
                                    <span className="text-gray-500">Share: <span className="font-semibold text-[var(--color-primary)]">{worker.sharingKey}%</span></span>
                                    <span className="text-gray-500">Rev: <span className="font-semibold text-gray-900">{worker.totalRevenue}</span></span>
                                </div>
                                <div className="hidden md:block space-y-2 mb-4 px-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Share:</span>
                                        <span className="font-semibold text-[var(--color-primary)]">{worker.sharingKey}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Revenue:</span>
                                        <span className="font-semibold text-gray-900">{worker.totalRevenue}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Clients:</span>
                                        <span className="font-semibold text-gray-900">{worker.clients}</span>
                                    </div>
                                </div>

                                <div className="flex gap-1 md:gap-2">
                                    <Link href={`/team/detail/${worker.id}`} className="flex-1">
                                        <button className="w-full py-1 md:py-2 text-[10px] md:text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded md:rounded-lg hover:opacity-80 transition flex items-center justify-center gap-0.5 md:gap-1">
                                            <Eye className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> View
                                        </button>
                                    </Link>
                                    <RequirePermission role={['manager', 'admin']}>
                                        <Link href={`/team/edit/${worker.id}`} className="flex-1">
                                            <button className="w-full py-1 md:py-2 text-[10px] md:text-xs font-medium text-[var(--color-secondary)] bg-[var(--color-secondary-light)] rounded md:rounded-lg hover:opacity-80 transition flex items-center justify-center gap-0.5 md:gap-1">
                                                <Edit className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Edit
                                            </button>
                                        </Link>
                                    </RequirePermission>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No workers found matching your search
                        </div>
                    )}
                </div>

                {/* Cards Pagination */}
                {totalSimpleCardsPages > 1 && (
                    <div className="flex items-center justify-between px-2 pt-4 mt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {((simpleCardsPage - 1) * simpleCardsPerPage) + 1} to {Math.min(simpleCardsPage * simpleCardsPerPage, simpleFilteredTeam.length)} of {simpleFilteredTeam.length}
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
                        <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export</Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangeFilter onChange={handleSimpleDateChange} showWeekFilter={false} />

                        <div className="relative w-full md:w-64 md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workers..."
                                value={simpleSearch}
                                onChange={(e) => { setSimpleSearch(e.target.value); setSimpleCardsPage(1); setSimpleTablePage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6 pb-2 scrollbar-thin scrollbar-thumb-purple-100 scrollbar-track-transparent">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 bg-white z-10 italic">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Team Member</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Share %</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Clients</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedSimpleTable.length > 0 ? (
                                paginatedSimpleTable.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                                    {worker.avatar}
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
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{worker.totalRevenue}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">{worker.totalSalary}</td>
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
                                                <RequirePermission role={['manager', 'admin']}>
                                                    <Link href={`/team/edit/${worker.id}`}>
                                                        <button className="p-2 hover:bg-[var(--color-secondary-light)] rounded-lg transition text-[var(--color-secondary)]">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                </RequirePermission>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        No workers found matching your search
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
                            Showing {((simpleTablePage - 1) * simpleTablePerPage) + 1} to {Math.min(simpleTablePage * simpleTablePerPage, simpleFilteredTeam.length)} of {simpleFilteredTeam.length}
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
                        <span className="text-sm opacity-80">Active Workers</span>
                    </div>
                    <p className="text-3xl font-bold">{activeTeam}</p>
                    <p className="text-xs opacity-70 mt-1">{activeTeam} active this month</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">Total Income</span>
                    </div>
                    <p className="text-3xl font-bold">€{(totalRevenue).toLocaleString()}</p>
                    <p className="text-xs opacity-70 mt-1">+18.5% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">Total Salaries</span>
                    </div>
                    <p className="text-3xl font-bold">€{(totalSalary).toLocaleString()}</p>
                    <p className="text-xs opacity-70 mt-1">75% of revenue</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Star className="w-5 h-5" /></div>
                        <span className="text-sm opacity-80">Total Clients</span>
                    </div>
                    <p className="text-3xl font-bold">{totalClients}</p>
                    <p className="text-xs opacity-70 mt-1">+42 from last month</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Time Period</span>
                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>Current Month</option><option>Last Month</option><option>Last 3 Months</option><option>This Year</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>All Status</option><option>Active</option><option>Inactive</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort By</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>Highest Income</option><option>Lowest Income</option><option>Highest Rating</option><option>Most Clients</option>
                    </select>
                </div>
                <div className="flex-1"></div>
                <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" />Apply Filters</Button>
                <Button variant="outline" size="sm">Reset</Button>
            </div>

            {/* Team Members List Table */}
            <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-gray-100 gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Team Members List</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export</Button>
                        <Button variant="outline" size="sm" className="gap-2"><FileText className="w-4 h-4" />Print</Button>
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
                            placeholder="Search by name..."
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Share %</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Month Income</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Month Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Year Income</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Year Salary</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Clients</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTeam.length > 0 ? (
                                paginatedTeam.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>{worker.avatar}</div>
                                                <div><p className="font-semibold text-gray-900">{worker.name}</p><p className="text-xs text-gray-500">ID: TEAM-00{worker.id}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${worker.sharingKey >= 65 ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : worker.sharingKey >= 55 ? "bg-[var(--color-secondary-light)] text-[var(--color-secondary)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"}`}>{worker.sharingKey}%</span></td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{worker.monthRevenue}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-secondary)]">{worker.monthSalary}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{worker.yearRevenue}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-[var(--color-success)]">{worker.yearSalary}</td>
                                        <td className="px-4 py-4 text-center"><span className="text-gray-900 font-medium">{worker.clients}</span><br /><span className="text-xs text-gray-500">clients</span></td>
                                        <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" /><span className="font-semibold text-gray-900">{worker.rating}</span></div></td>
                                        <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "Active" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-error-light)] text-[var(--color-error)]"}`}>{worker.status}</span></td>
                                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><Link href={`/team/detail/${worker.id}`}><button className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition text-[var(--color-primary)]"><Eye className="w-4 h-4" /></button></Link><RequirePermission role={['manager', 'admin']}><Link href={`/team/edit/${worker.id}`}><button className="p-2 hover:bg-[var(--color-secondary-light)] rounded-lg transition text-[var(--color-secondary)]"><Edit className="w-4 h-4" /></button></Link></RequirePermission></div></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        No workers found matching your search criteria
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
                            Showing {((teamPage - 1) * teamPerPage) + 1} to {Math.min(teamPage * teamPerPage, filteredTeam.length)} of {filteredTeam.length} workers
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
                        <div><h3 className="font-bold text-gray-900">Weekly Income Breakdown</h3><p className="text-xs text-gray-500">Last 12 weeks</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyRevenueData}>
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
                        <div><h3 className="font-bold text-gray-900">Client Volume Trend</h3><p className="text-xs text-gray-500">6 months overview</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={clientVolumeTrend}>
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
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Earnings Breakdown Analysis</h3><p className="text-xs text-gray-500">By service type - Last 6 months</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={earningsBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="braids" fill="var(--color-primary)" />
                        <Bar dataKey="twists" fill="var(--color-secondary)" />
                        <Bar dataKey="cornrows" fill="var(--color-warning)" />
                        <Bar dataKey="locs" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-primary)]"></div><span className="text-gray-600">Braids</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-secondary)]"></div><span className="text-gray-600">Twists</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-warning)]"></div><span className="text-gray-600">Cornrows</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-success)]"></div><span className="text-gray-600">Locs</span></div>
                </div>
            </Card >

            {/* Weekly Performance Details Table */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Weekly Performance Details</h3>
                    <Button variant="outline" size="sm" className="text-xs"><ChevronDown className="w-3 h-3 mr-1" />Show All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Period</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Clients</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Services</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Income</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Expenses</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Profit</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {weeklyPerformanceDetails.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-success)] font-medium">€{row.revenue.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-error)] font-medium">€{row.expenses.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-primary)] font-bold">€{row.profit.toLocaleString()}</td>
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
                    <BarChart data={salaryPerformanceData}>
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
                        {dailyActivities.map((activity, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${activity.status === "Completed" ? "bg-[var(--color-success-light)] border-[var(--color-success-light)]" : activity.status === "In Progress" ? "bg-[var(--color-info-light,bg-blue-50)] border-[var(--color-info-light,border-blue-100)]" : "bg-[var(--color-warning-light)] border-[var(--color-warning-light)]"}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border">{activity.client.charAt(0)}</div>
                                        <div><p className="font-medium text-gray-900 text-sm">{activity.client}</p><p className="text-xs text-gray-500">{activity.service} • {activity.time}</p></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-sm">{activity.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${activity.status === "Completed" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : activity.status === "In Progress" ? "bg-[var(--color-info-light,bg-blue-100)] text-[var(--color-info,text-blue-700)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"}`}>{activity.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Client Satisfaction Ratings</h3>
                    <div className="space-y-3">
                        {clientSatisfactionData.map((client, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center font-bold`}>{client.avatar}</div>
                                    <div><p className="font-medium text-gray-900 text-sm">{client.name}</p><p className="text-xs text-gray-500">{client.service} • {client.date}</p></div>
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
                                    <Pie data={serviceTimeDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                        {serviceTimeDistribution.map((entry, index) => (<Cell key={`cell - ${index} `} fill={entry.color} />))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-2">
                            {serviceTimeDistribution.map((item, idx) => (
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
                        {topAppointmentServices.map((service, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${service.color}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                                    <span className="text-sm font-bold text-[var(--color-primary)]">{service.revenue}</span>
                                </div>
                                <div className="w-full bg-white/50 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full" style={{ width: `${service.percentage}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{service.count} bookings</p>
                            </div>
                        ))}
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
                    <BarChart data={overallPerformanceData}>
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
            < Card className="overflow-hidden" >
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-secondary-light)]">
                    <div><h3 className="text-lg font-bold text-gray-900">Annual Summary (2024)</h3><p className="text-xs text-gray-500">Complete performance overview</p></div>
                    <Button variant="primary" size="sm" className="gap-2 bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-warning-dark)]"><FileText className="w-4 h-4" />Export Annual Report</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Income</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salon Share</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Clients</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Avg. Rating</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax (20%)</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net After Tax</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {annualSummaryData.map((worker) => (
                                <tr key={worker.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm`}>{worker.avatar}</div>
                                            <span className="font-medium text-gray-900">{worker.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">€{worker.totalRevenue.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-[var(--color-secondary)]">€{worker.totalSalary.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-[var(--color-primary)]">€{worker.salonShare.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-gray-900">{worker.totalClients}</td>
                                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-[var(--color-warning)] fill-[var(--color-warning)]" /><span className="text-gray-900">{worker.avgRating}</span></div></td>
                                    <td className="px-4 py-3 text-right text-[var(--color-error)] font-medium">€{worker.tax.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold text-[var(--color-success)]">€{worker.netAfterTax.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-secondary-light)]">
                            <tr className="font-bold">
                                <td className="px-4 py-4 text-gray-900">TOTAL</td>
                                <td className="px-4 py-4 text-right text-gray-900">€{annualTotals.totalRevenue.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right text-[var(--color-secondary)]">€{annualTotals.totalSalary.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right text-[var(--color-primary)]">€{annualTotals.salonShare.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center text-gray-900">{annualTotals.totalClients.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span>{annualTotals.avgRating}</span></div></td>
                                <td className="px-4 py-4 text-right text-red-500">€{annualTotals.tax.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right text-[var(--color-success)]">€{annualTotals.netAfterTax.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card >
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
                        <RequirePermission role={['manager', 'admin']}>
                            <Link href="/team/add">
                                <Button variant="outline" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-sm active:scale-95 transition-all">
                                    <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                    <span className="hidden md:inline ml-2 text-sm font-bold whitespace-nowrap">Quick Add</span>
                                </Button>
                            </Link>
                            <Link href="/team/add-advanced">
                                <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                    <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                    <span className="hidden md:inline ml-2 text-sm font-bold whitespace-nowrap">Complete Form</span>
                                </Button>
                            </Link>
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
        <ProtectedRoute requiredRole={['manager', 'admin']}>
            <Suspense fallback={<div>Loading Team...</div>}>
                <TeamPageContent />
            </Suspense>
        </ProtectedRoute>
    );
}
