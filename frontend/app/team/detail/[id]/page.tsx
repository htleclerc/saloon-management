"use client";

import { use, useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DateRangeFilter, { DateFilterValue } from "@/components/ui/DateRangeFilter";
import {
    DollarSign,
    TrendingUp,
    Star,
    Calendar,
    Clock,
    Mail,
    Phone,
    Edit,
    MapPin,
    Award,
    Users,
    BarChart3,
    Percent,
    Eye,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Table,
    MessageSquare,
    History,
    Scissors,
    ThumbsUp,
    AlertCircle,
    Search,
    ArrowLeft,
    Trash2
} from "lucide-react";
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

import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useActionPermissions } from "@/lib/permissions";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { workerService, incomeService, statsService } from "@/lib/services";
import { SalonWorker } from "@/types";

const initialWorkerState = {
    id: 0,
    name: "",
    email: "",
    phone: "",
    status: "Active",
    role: "worker",
    location: "",
    joinDate: "",
    sharingKey: 0,
};


// Income Row Type
interface IncomeRow {
    id: number;
    period: string;
    services: number;
    clients: number;
    income: number;
    salary: number;
    status: string;
}

// Income Data by Period and Year
const incomeDataByYear: Record<string, { week: IncomeRow[]; month: IncomeRow[]; year: IncomeRow[] }> = {
    "2024": {
        week: [
            { id: 1, period: "Mon 13 Jan", services: 3, clients: 3, income: 300, salary: 210, status: "Completed" },
            { id: 2, period: "Tue 14 Jan", services: 4, clients: 4, income: 420, salary: 294, status: "Completed" },
            { id: 3, period: "Wed 15 Jan", services: 2, clients: 2, income: 180, salary: 126, status: "Completed" },
            { id: 4, period: "Thu 16 Jan", services: 5, clients: 4, income: 550, salary: 385, status: "Completed" },
            { id: 5, period: "Fri 17 Jan", services: 6, clients: 5, income: 680, salary: 476, status: "Completed" },
            { id: 6, period: "Sat 18 Jan", services: 8, clients: 7, income: 920, salary: 644, status: "Completed" },
            { id: 7, period: "Sun 19 Jan", services: 3, clients: 3, income: 280, salary: 196, status: "Pending" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 28, clients: 22, income: 2800, salary: 1960, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 32, clients: 26, income: 3200, salary: 2240, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 30, clients: 24, income: 3100, salary: 2170, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 35, clients: 28, income: 3600, salary: 2520, status: "In Progress" },
        ],
        year: [
            { id: 1, period: "January", services: 125, clients: 98, income: 12500, salary: 8750, status: "Completed" },
            { id: 2, period: "February", services: 118, clients: 92, income: 11800, salary: 8260, status: "Completed" },
            { id: 3, period: "March", services: 132, clients: 105, income: 13200, salary: 9240, status: "Completed" },
            { id: 4, period: "April", services: 140, clients: 112, income: 14000, salary: 9800, status: "Completed" },
            { id: 5, period: "May", services: 145, clients: 118, income: 14500, salary: 10150, status: "Completed" },
            { id: 6, period: "June", services: 150, clients: 122, income: 15000, salary: 10500, status: "Completed" },
            { id: 7, period: "July", services: 155, clients: 128, income: 15500, salary: 10850, status: "Completed" },
            { id: 8, period: "August", services: 160, clients: 132, income: 16000, salary: 11200, status: "Completed" },
            { id: 9, period: "September", services: 148, clients: 120, income: 14800, salary: 10360, status: "Completed" },
            { id: 10, period: "October", services: 152, clients: 124, income: 15200, salary: 10640, status: "Completed" },
            { id: 11, period: "November", services: 158, clients: 130, income: 15800, salary: 11060, status: "Completed" },
            { id: 12, period: "December", services: 165, clients: 135, income: 16500, salary: 11550, status: "In Progress" },
        ],
    },
    "2023": {
        week: [
            { id: 1, period: "Mon 15 Jan", services: 2, clients: 2, income: 220, salary: 154, status: "Completed" },
            { id: 2, period: "Tue 16 Jan", services: 3, clients: 3, income: 350, salary: 245, status: "Completed" },
            { id: 3, period: "Wed 17 Jan", services: 2, clients: 2, income: 200, salary: 140, status: "Completed" },
            { id: 4, period: "Thu 18 Jan", services: 4, clients: 3, income: 420, salary: 294, status: "Completed" },
            { id: 5, period: "Fri 19 Jan", services: 5, clients: 4, income: 550, salary: 385, status: "Completed" },
            { id: 6, period: "Sat 20 Jan", services: 6, clients: 5, income: 680, salary: 476, status: "Completed" },
            { id: 7, period: "Sun 21 Jan", services: 2, clients: 2, income: 200, salary: 140, status: "Completed" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 22, clients: 18, income: 2200, salary: 1540, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 26, clients: 20, income: 2600, salary: 1820, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 24, clients: 19, income: 2400, salary: 1680, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 28, clients: 22, income: 2800, salary: 1960, status: "Completed" },
        ],
        year: [
            { id: 1, period: "January", services: 100, clients: 78, income: 10000, salary: 7000, status: "Completed" },
            { id: 2, period: "February", services: 95, clients: 74, income: 9500, salary: 6650, status: "Completed" },
            { id: 3, period: "March", services: 108, clients: 85, income: 10800, salary: 7560, status: "Completed" },
            { id: 4, period: "April", services: 115, clients: 90, income: 11500, salary: 8050, status: "Completed" },
            { id: 5, period: "May", services: 120, clients: 95, income: 12000, salary: 8400, status: "Completed" },
            { id: 6, period: "June", services: 125, clients: 100, income: 12500, salary: 8750, status: "Completed" },
            { id: 7, period: "July", services: 130, clients: 105, income: 13000, salary: 9100, status: "Completed" },
            { id: 8, period: "August", services: 135, clients: 108, income: 13500, salary: 9450, status: "Completed" },
            { id: 9, period: "September", services: 125, clients: 100, income: 12500, salary: 8750, status: "Completed" },
            { id: 10, period: "October", services: 128, clients: 102, income: 12800, salary: 8960, status: "Completed" },
            { id: 11, period: "November", services: 132, clients: 106, income: 13200, salary: 9240, status: "Completed" },
            { id: 12, period: "December", services: 140, clients: 112, income: 14000, salary: 9800, status: "Completed" },
        ],
    },
    "2022": {
        week: [
            { id: 1, period: "Mon 17 Jan", services: 2, clients: 2, income: 180, salary: 126, status: "Completed" },
            { id: 2, period: "Tue 18 Jan", services: 2, clients: 2, income: 200, salary: 140, status: "Completed" },
            { id: 3, period: "Wed 19 Jan", services: 1, clients: 1, income: 120, salary: 84, status: "Completed" },
            { id: 4, period: "Thu 20 Jan", services: 3, clients: 2, income: 300, salary: 210, status: "Completed" },
            { id: 5, period: "Fri 21 Jan", services: 4, clients: 3, income: 400, salary: 280, status: "Completed" },
            { id: 6, period: "Sat 22 Jan", services: 5, clients: 4, income: 500, salary: 350, status: "Completed" },
            { id: 7, period: "Sun 23 Jan", services: 1, clients: 1, income: 100, salary: 70, status: "Completed" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 18, clients: 14, income: 1800, salary: 1260, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 20, clients: 16, income: 2000, salary: 1400, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 18, clients: 15, income: 1800, salary: 1260, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 22, clients: 18, income: 2200, salary: 1540, status: "Completed" },
        ],
        year: [
            { id: 1, period: "January", services: 78, clients: 62, income: 7800, salary: 5460, status: "Completed" },
            { id: 2, period: "February", services: 72, clients: 58, income: 7200, salary: 5040, status: "Completed" },
            { id: 3, period: "March", services: 85, clients: 68, income: 8500, salary: 5950, status: "Completed" },
            { id: 4, period: "April", services: 90, clients: 72, income: 9000, salary: 6300, status: "Completed" },
            { id: 5, period: "May", services: 95, clients: 76, income: 9500, salary: 6650, status: "Completed" },
            { id: 6, period: "June", services: 100, clients: 80, income: 10000, salary: 7000, status: "Completed" },
            { id: 7, period: "July", services: 105, clients: 84, income: 10500, salary: 7350, status: "Completed" },
            { id: 8, period: "August", services: 108, clients: 86, income: 10800, salary: 7560, status: "Completed" },
            { id: 9, period: "September", services: 100, clients: 80, income: 10000, salary: 7000, status: "Completed" },
            { id: 10, period: "October", services: 102, clients: 82, income: 10200, salary: 7140, status: "Completed" },
            { id: 11, period: "November", services: 106, clients: 85, income: 10600, salary: 7420, status: "Completed" },
            { id: 12, period: "December", services: 112, clients: 90, income: 11200, salary: 7840, status: "Completed" },
        ],
    },
};

const availableYears = ["2024", "2023", "2022"];

// Income Transactions Data (for SimpleView table)
const incomeTransactions = [
    { id: 1, date: "2026-01-14", client: "Marie Dubois", service: "Box Braids", amount: 120, status: "Completed" },
    { id: 2, date: "2026-01-14", client: "Sophie Laurent", service: "Senegalese Twists", amount: 95, status: "Completed" },
    { id: 3, date: "2026-01-13", client: "Anna Martin", service: "Cornrows", amount: 85, status: "Completed" },
    { id: 4, date: "2026-01-13", client: "Claire Petit", service: "Locs Maintenance", amount: 150, status: "Completed" },
    { id: 5, date: "2026-01-12", client: "Julie Bernard", service: "Box Braids", amount: 130, status: "Completed" },
    { id: 6, date: "2026-01-12", client: "Nadia Koné", service: "Twists", amount: 110, status: "Completed" },
    { id: 7, date: "2026-01-11", client: "Camille Roche", service: "Cornrows", amount: 75, status: "Completed" },
    { id: 8, date: "2026-01-11", client: "Lucie Moreau", service: "Knotless Braids", amount: 180, status: "Completed" },
    { id: 9, date: "2026-01-10", client: "Emma Leroy", service: "Box Braids", amount: 125, status: "Completed" },
    { id: 10, date: "2026-01-10", client: "Léa Dupont", service: "Twists", amount: 100, status: "Completed" },
    { id: 11, date: "2026-01-09", client: "Chloé Martin", service: "Senegalese Twists", amount: 95, status: "Completed" },
    { id: 12, date: "2026-01-09", client: "Manon Petit", service: "Locs Maintenance", amount: 160, status: "Completed" },
    { id: 13, date: "2026-01-08", client: "Jade Bernard", service: "Box Braids", amount: 140, status: "Completed" },
    { id: 14, date: "2026-01-08", client: "Louise Moreau", service: "Cornrows", amount: 80, status: "Completed" },
    { id: 15, date: "2026-01-07", client: "Inès Roux", service: "Knotless Braids", amount: 175, status: "Completed" },
    { id: 16, date: "2026-01-07", client: "Zoé Lefevre", service: "Twists", amount: 105, status: "Pending" },
    { id: 17, date: "2026-01-06", client: "Lina Garcia", service: "Box Braids", amount: 135, status: "Completed" },
    { id: 18, date: "2026-01-06", client: "Mia Thomas", service: "Senegalese Twists", amount: 98, status: "Completed" },
    { id: 19, date: "2026-01-05", client: "Eva Robert", service: "Locs Maintenance", amount: 155, status: "Completed" },
    { id: 20, date: "2026-01-05", client: "Léonie Durand", service: "Cornrows", amount: 78, status: "Completed" },
];

// Recent Income History - Replaced by dynamic transactions

// Recent Services - Replaced by dynamic servicesList

// Activity History - Replaced by dynamic activities

// Client Comments/Reviews - Replaced by dynamic

// Weekly Income Breakdown - Replaced by dynamic state

// Client Volume Trend - Replaced by dynamic state

// Earnings Breakdown - Replaced by dynamic state

// Weekly Performance Details - Replaced by dynamic state

// Salary Performance Data - Replaced by dynamic state

// Client Satisfaction Data - Replaced by dynamic state

// Service Time Distribution - Replaced by dynamic state

// Top Appointment Services - Replaced by dynamic

// Overall Performance - Replaced by dynamic state

// Top Repeat Clients - Replaced by dynamic

// Daily Activities - Replaced by dynamic state

function TeamMemberDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialView = searchParams.get("view") === "advanced" ? "advanced" : "simple";
    const [viewMode, setViewMode] = useState<"simple" | "advanced">(initialView);
    const [incomePeriod, setIncomePeriod] = useState<"week" | "month" | "year">("month");
    const [selectedYear, setSelectedYear] = useState("2024");
    const [incomePage, setIncomePage] = useState(1);
    const itemsPerPage = 5;

    // State for dynamic data
    const [worker, setWorker] = useState<any>(initialWorkerState);
    const [incomeStats, setIncomeStats] = useState<any>(incomeDataByYear);
    const [transactions, setTransactions] = useState<any[]>(incomeTransactions);

    // Dynamic Charts Data
    const [weeklyIncomeData, setWeeklyIncomeData] = useState<any[]>([]);
    const [clientVolumeTrend, setClientVolumeTrend] = useState<any[]>([]);
    const [earningsBreakdownData, setEarningsBreakdownData] = useState<any[]>([]);
    const [weeklyPerformanceDetails, setWeeklyPerformanceDetails] = useState<any[]>([]);
    const [salaryPerformanceData, setSalaryPerformanceData] = useState<any[]>([]);
    const [clientSatisfactionData, setClientSatisfactionData] = useState<any[]>([]);
    const [serviceTimeDistribution, setServiceTimeDistribution] = useState<any[]>([]);
    const [overallPerformanceData, setOverallPerformanceData] = useState<any[]>([]);

    // New dynamic state
    const [servicesList, setServicesList] = useState<any[]>([]);
    const [topClients, setTopClients] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const auth = useAuth();
    const { format } = useCurrency();
    const { t } = useTranslation();
    const permissions = useActionPermissions(auth as any);
    const isOwnProfile = auth.user?.name === worker.name;
    const canSeeFinancials = permissions.isManager;

    const performanceCards = useMemo(() => {
        // Calculate totals from available data or use fetched stats
        // Using current year income data for now as proxy for total or fetching specific stats
        const currentData = incomeStats[selectedYear]?.[incomePeriod] || [];
        const totalSales = currentData.reduce((acc: number, curr: any) => acc + (curr.income || 0), 0);
        const totalExpenses = currentData.reduce((acc: number, curr: any) => acc + (curr.salary || 0), 0); // Simplified expense logic (salary as expense)
        const totalServices = currentData.reduce((acc: number, curr: any) => acc + (curr.services || 0), 0);
        const netProfit = totalSales - totalExpenses;

        return [
            { label: format(totalSales), sublabel: t("team.totalSales"), color: "text-[var(--color-primary)]" },
            { label: format(totalExpenses), sublabel: t("team.totalExpensesEst"), color: "text-[var(--color-error)]" },
            { label: totalServices.toString(), sublabel: t("team.totalServices"), color: "text-[var(--color-warning)]" },
            { label: "4.8", sublabel: t("common.rating"), color: "text-[var(--color-success)]" }, // Placeholder rating
            { label: format(netProfit), sublabel: t("team.netProfitEst"), color: "text-[var(--color-success)]" }
        ];
    }, [incomeStats, selectedYear, incomePeriod, format]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const workerId = parseInt(id);
                const salonId = 1; // Explicit salon ID, ideally from auth or worker data

                const [
                    workerData, stats, trans,
                    services, clients, recentActivity, workerReviews,
                    weeklyIncome, clientTrend, earnings, performance, salary, serviceDist, overall
                ] = await Promise.all([
                    workerService.getById(workerId),
                    incomeService.getWorkerPerformanceStats(workerId, parseInt(selectedYear)),
                    incomeService.getWorkerTransactions(workerId, 1, 100, { year: parseInt(selectedYear) }),
                    statsService.getServicesByRevenue(salonId, workerId),
                    statsService.getWorkerTopClients(salonId, workerId),
                    statsService.getRecentWorkerActivity(salonId, workerId),
                    statsService.getWorkerReviews(salonId, workerId),
                    statsService.getWeeklyIncomeBreakdown(salonId, workerId),
                    statsService.getClientVolumeTrend(salonId, workerId),
                    statsService.getEarningsBreakdown(salonId, workerId),
                    statsService.getWeeklyPerformanceDetails(salonId, workerId),
                    statsService.getSalaryPerformance(salonId, workerId),
                    statsService.getServiceTimeDistribution(salonId, workerId),
                    statsService.getOverallPerformance(salonId, workerId)
                ]);

                if (workerData) {
                    setWorker({
                        ...workerData,
                        role: 'worker',
                        location: 'Paris, France', // Placeholder or fetch from salon
                        joinDate: new Date(workerData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    });
                }

                if (stats) {
                    setIncomeStats({ [selectedYear]: stats }); // Update for current year, keep others if needed or just use current
                }

                if (services) setServicesList(services);
                if (clients) setTopClients(clients);
                if (recentActivity) setActivities(recentActivity);
                if (workerReviews) {
                    setReviews(workerReviews);
                    // Reuse reviews for satisfaction data mapping if needed, or map separate endpoint
                    // For now, mapping reviews to clientSatisfactionData format
                    setClientSatisfactionData(workerReviews.map((r: any) => ({
                        name: r.client,
                        rating: r.rating,
                        service: "Unknown", // Review object might need service name
                        date: r.date,
                        avatar: r.avatar,
                        color: r.color
                    })));
                }

                if (weeklyIncome) setWeeklyIncomeData(weeklyIncome);
                if (clientTrend) setClientVolumeTrend(clientTrend);
                if (earnings) setEarningsBreakdownData(earnings);
                if (performance) setWeeklyPerformanceDetails(performance);
                if (salary) setSalaryPerformanceData(salary);
                if (serviceDist) setServiceTimeDistribution(serviceDist);
                if (overall) setOverallPerformanceData(overall);

                if (trans && trans.data) {
                    // Map transaction data if needed to match UI shape
                    setTransactions(trans.data.map((t: any) => ({
                        id: t.id,
                        date: t.date,
                        client: t.client,
                        service: t.service,
                        amount: t.amount,
                        status: t.status || 'Completed'
                    })));
                }

            } catch (error) {
                console.error("Failed to fetch worker data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, selectedYear]);

    // SimpleView transactions table state
    const [transactionDateFilter, setTransactionDateFilter] = useState<DateFilterValue>({ year: parseInt(selectedYear), month: null, week: null }); // Default to year view
    const [transactionSearch, setTransactionSearch] = useState("");
    const [transactionPage, setTransactionPage] = useState(1);
    const transactionsPerPage = 10;

    // Date filter change handler
    const handleTransactionDateChange = useCallback((value: DateFilterValue) => {
        setTransactionDateFilter(value);
        setTransactionPage(1);
    }, []);

    // Filter transactions based on date filter and search
    const filteredTransactions = transactions.filter((item) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (year !== transactionDateFilter.year) return false;
        if (transactionDateFilter.month !== null && month !== transactionDateFilter.month) return false;
        if (transactionSearch && !item.client.toLowerCase().includes(transactionSearch.toLowerCase()) && !item.service.toLowerCase().includes(transactionSearch.toLowerCase())) return false;
        return true;
    });

    // Pagination for transactions
    const totalTransactionPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredTransactions.slice((transactionPage - 1) * transactionsPerPage, transactionPage * transactionsPerPage);

    // Get paginated income data based on year and period
    const currentIncomeData = incomeStats[selectedYear]?.[incomePeriod] || [];
    const totalPages = Math.ceil(currentIncomeData.length / itemsPerPage);
    const paginatedIncomeData = currentIncomeData.slice((incomePage - 1) * itemsPerPage, incomePage * itemsPerPage);

    // Reset page when period or year changes
    const handlePeriodChange = (period: "week" | "month" | "year") => {
        setIncomePeriod(period);
        setIncomePage(1);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setIncomePage(1);
    };

    // Simple View JSX (using variable instead of component to prevent remounting)
    const simpleView = (
        <div className="space-y-6">
            {/* Performance Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-primary-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-primary-light)]">
                    <h3 className="text-xl font-bold text-[var(--color-primary)]">{performanceCards[0].label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{performanceCards[0].sublabel}</p>
                </Card>

                {canSeeFinancials && (
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-error-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-error-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-error)]">{performanceCards[1].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[1].sublabel}</p>
                    </Card>
                )}

                <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-warning-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-warning-light)]">
                    <h3 className="text-xl font-bold text-[var(--color-warning)]">{performanceCards[2].label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{performanceCards[2].sublabel}</p>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-success-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-success-light)]">
                    <h3 className="text-xl font-bold text-[var(--color-success)]">{performanceCards[3].label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{performanceCards[3].sublabel}</p>
                </Card>

                {canSeeFinancials && (
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-success-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-success-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-success)]">{performanceCards[4].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[4].sublabel}</p>
                    </Card>
                )}
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-[var(--color-primary-light)] to-white hover:shadow-md transition-shadow border-[var(--color-primary-light)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-primary-light)]"><Percent className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">{t("team.sharingKey")}</p><p className="text-xl font-bold text-[var(--color-primary)]">{worker.sharingKey}%</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-[var(--color-warning-light)] to-white hover:shadow-md transition-shadow border-[var(--color-warning-light)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-warning)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-warning-light)]"><Calendar className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">{t("team.joined")}</p><p className="text-xl font-bold text-[var(--color-warning)]">{worker.joinDate}</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-[var(--color-success-light)] to-white hover:shadow-md transition-shadow border-[var(--color-success-light)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-success)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-success-light)]"><MapPin className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">{t("team.location")}</p><p className="text-xl font-bold text-[var(--color-success)]">{worker.location}</p></div>
                    </div>
                </Card>
            </div>

            {/* Revenue Transactions Table */}
            <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-[var(--color-success)]" />
                            {t("team.incomeTransactions")}
                        </h3>
                        <Link href={`/team/income?workerId=${id}`}>
                            <Button variant="outline" size="sm" className="text-xs">{t("team.viewFullHistory")}</Button>
                        </Link>
                    </div>

                    {/* Filters Row: DateRangeFilter + Search on same line for desktop */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangeFilter onChange={handleTransactionDateChange} showWeekFilter={false} />

                        {/* Search */}
                        <div className="relative w-full md:w-64 md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("team.searchClientOrService")}
                                value={transactionSearch}
                                onChange={(e) => { setTransactionSearch(e.target.value); setTransactionPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("common.date")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("team.totalClients")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">{t("common.service")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t("common.amount")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">{t("common.status")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center text-white font-bold text-xs">{item.client.charAt(0)}</div>
                                                <span className="text-sm font-medium text-gray-900">{item.client}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{item.service}</td>
                                        <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-success)]">{format(Number(item.amount))}</td>
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === "Completed" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t("team.noTransactionsFound")}</td>
                                </tr>
                            )}
                        </tbody>
                        {filteredTransactions.length > 0 && (
                            <tfoot className="bg-[var(--color-primary-light)] font-semibold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-sm text-[var(--color-primary)]">{t("team.totalTransactions", { count: filteredTransactions.length })}</td>
                                    <td className="px-4 py-3 text-sm text-right text-[var(--color-success)]">{format(filteredTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0))}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                {
                    totalTransactionPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                {t("common.pagination", { start: (transactionPage - 1) * transactionsPerPage + 1, end: Math.min(transactionPage * transactionsPerPage, filteredTransactions.length), total: filteredTransactions.length })}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                                    disabled={transactionPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${transactionPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalTransactionPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTransactionPage(i + 1)}
                                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${transactionPage === i + 1 ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setTransactionPage(p => Math.min(totalTransactionPages, p + 1))}
                                    disabled={transactionPage === totalTransactionPages}
                                    className={`p-2 rounded-lg transition-colors ${transactionPage === totalTransactionPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Activity History */}
            </Card >
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-[var(--color-primary)]" />{t("team.activityHistory")}</h3>
                    <Button variant="outline" size="sm" className="text-xs">{t("team.viewAll")}</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activities.map((item) => {
                        // Map dynamic types to icons if needed, or rely on service providing correct type string
                        // StartService returns: type: 'booking' | 'payment' | 'booking' (mapped from original)
                        // Verify icons mapping:
                        let IconComponent = Scissors; // Default
                        if (item.type === 'payment') IconComponent = DollarSign;
                        if (item.type === 'review') IconComponent = Star;
                        if (item.type === 'booking') IconComponent = Calendar;
                        if (item.type === 'client') IconComponent = Users;

                        return (
                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${item.type === "service" ? "bg-[var(--color-primary-light)]" :
                                item.type === "review" ? "bg-[var(--color-warning-light)]" :
                                    item.type === "booking" ? "bg-[var(--color-info-light)]" :
                                        item.type === "payment" ? "bg-[var(--color-success-light)]" :
                                            "bg-gray-50"
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === "service" ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" :
                                    item.type === "review" ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]" :
                                        item.type === "booking" ? "bg-[var(--color-info-light)] text-[var(--color-info)]" :
                                            item.type === "payment" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" :
                                                "bg-gray-100 text-gray-600"
                                    }`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.time).toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card >

            {/* Client Comments Preview */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />{t("team.recentComments")}</h3>
                    <Button variant="outline" size="sm" className="text-xs">{t("team.viewAll")}</Button>
                </div>
                <div className="space-y-4">
                    {reviews.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full ${comment.color} flex items-center justify-center font-bold`}>{comment.avatar}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900">{comment.client}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">{comment.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card >
        </div >
    );

    // Advanced View JSX (using variable instead of component to prevent remounting)
    const advancedView = (
        <div className="space-y-6">
            {/* Performance Overview Stats + Action Buttons */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-primary-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-primary-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-primary)]">{performanceCards[0].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[0].sublabel}</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-error-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-error-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-error)]">{performanceCards[1].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[1].sublabel}</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-warning-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-warning-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-warning)]">{performanceCards[2].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[2].sublabel}</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-success-light)] to-white hover:shadow-lg transition-shadow border-[var(--color-success-light)]">
                        <h3 className="text-xl font-bold text-[var(--color-success)]">{performanceCards[3].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[3].sublabel}</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-[var(--color-info-light,bg-blue-50)] to-white hover:shadow-lg transition-shadow border-[var(--color-info-light,border-blue-100)]">
                        <h3 className="text-xl font-bold text-[var(--color-info,text-blue-600)]">{performanceCards[4].label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{performanceCards[4].sublabel}</p>
                    </Card>
                </div>

                {/* Action Buttons - Moved to top right area */}
                <div className="flex justify-end gap-3">
                    {canSeeFinancials && (
                        <>
                            <Button variant="primary" size="sm" className="bg-gradient-to-r from-[var(--color-primary)] to-gray-900 border-none"><Eye className="w-4 h-4 mr-2" />{t("team.viewReports")}</Button>
                            <Button variant="primary" size="sm" className="bg-gradient-to-r from-[var(--color-secondary)] to-gray-900 border-none"><BarChart3 className="w-4 h-4 mr-2" />{t("team.analytics")}</Button>
                        </>
                    )}
                    <Button variant="primary" size="sm" className="bg-gradient-to-r from-[var(--color-warning)] to-gray-900 border-none"><Calendar className="w-4 h-4 mr-2" />{t("team.schedule")}</Button>
                </div>
            </div>

            {/* Revenue Table with Filter */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
                        {t("team.incomeOverview")}
                    </h3>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border-0 cursor-pointer focus:ring-2 focus:ring-[var(--color-primary-light)]"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button onClick={() => handlePeriodChange("week")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${incomePeriod === "week" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{t("team.week")}</button>
                            <button onClick={() => handlePeriodChange("month")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${incomePeriod === "month" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{t("team.month")}</button>
                            <button onClick={() => handlePeriodChange("year")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${incomePeriod === "year" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{t("team.year")}</button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.period")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("team.totalServices")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("team.totalClients")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.totalIncome")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.totalSalaries")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedIncomeData.map((row: IncomeRow) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.period}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.services}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.clients}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-success)]">{format(row.income)}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-primary)]">{format(row.salary)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs px-2 py-1 rounded-full ${row.status === "Completed" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : row.status === "In Progress" ? "bg-[var(--color-info-light,bg-blue-100)] text-[var(--color-info,text-blue-700)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"}`}>{row.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[var(--color-primary-light)] font-semibold">
                            <tr>
                                <td className="px-4 py-3 text-sm text-[var(--color-primary)]">Total</td>
                                <td className="px-4 py-3 text-sm text-center text-[var(--color-primary)]">{currentIncomeData.reduce((sum: number, r: IncomeRow) => sum + r.services, 0)}</td>
                                <td className="px-4 py-3 text-sm text-center text-[var(--color-primary)]">{currentIncomeData.reduce((sum: number, r: IncomeRow) => sum + r.clients, 0)}</td>
                                <td className="px-4 py-3 text-sm text-right text-[var(--color-success)]">{format(currentIncomeData.reduce((sum: number, r: IncomeRow) => sum + r.income, 0))}</td>
                                <td className="px-4 py-3 text-sm text-right text-[var(--color-primary)]">{format(currentIncomeData.reduce((sum: number, r: IncomeRow) => sum + r.salary, 0))}</td>
                                <td className="px-4 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">{t("common.pagination", { start: (incomePage - 1) * itemsPerPage + 1, end: Math.min(incomePage * itemsPerPage, currentIncomeData.length), total: currentIncomeData.length })}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIncomePage(p => Math.max(1, p - 1))} disabled={incomePage === 1} className={`px-3 py-1.5 text-xs font-medium rounded-md ${incomePage === 1 ? "bg-gray-100 text-gray-400" : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"}`}>Previous</button>
                            {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setIncomePage(i + 1)} className={`w-8 h-8 text-xs font-medium rounded-md ${incomePage === i + 1 ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{i + 1}</button>))}
                            <button onClick={() => setIncomePage(p => Math.min(totalPages, p + 1))} disabled={incomePage === totalPages} className={`px-3 py-1.5 text-xs font-medium rounded-md ${incomePage === totalPages ? "bg-gray-100 text-gray-400" : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"}`}>Next</button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Recent Revenue & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />{t("team.recentIncome")}</h3>
                        <Link href={`/team/income?workerId=${id}`}><Button variant="outline" size="sm" className="text-xs">{t("team.viewAll")}</Button></Link>
                    </div>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] rounded-full flex items-center justify-center text-white font-bold text-sm">{item.client.charAt(0)}</div>
                                    <div><p className="font-medium text-gray-900 text-sm">{item.client}</p><p className="text-xs text-gray-500">{item.service} • {item.date}</p></div>
                                </div>
                                <div className="text-right"><p className="font-bold text-[var(--color-success)]">{format(Number(item.amount.replace(/[^0-9.-]+/g, "") || 0))}</p><span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success-light)] text-[var(--color-success)]">{item.status}</span></div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Scissors className="w-5 h-5 text-[var(--color-primary)]" />Services Summary</h3>
                        <Button variant="outline" size="sm" className="text-xs">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {servicesList.slice(0, 5).map((item) => (
                            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div><p className="font-medium text-gray-900 text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.count} performed • Last: {item.lastPerformed ? new Date(item.lastPerformed).toLocaleDateString() : 'N/A'}</p></div>
                                <p className="font-bold text-[var(--color-primary)]">{format(item.income)}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Weekly Revenue & Client Volume */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="font-bold text-gray-900">Weekly Income Breakdown</h3><p className="text-xs text-gray-500">Last 12 weeks</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyIncomeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.4 }} />
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
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="var(--color-secondary)" strokeWidth={3} dot={{ fill: "var(--color-secondary)", r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Earnings Breakdown Analysis */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Earnings Breakdown Analysis</h3><p className="text-xs text-gray-500">By service type</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={earningsBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.2 }} />
                        <Bar dataKey="braids" fill="var(--color-primary)" />
                        <Bar dataKey="twists" fill="var(--color-secondary)" />
                        <Bar dataKey="cornrows" fill="var(--color-warning)" />
                        <Bar dataKey="locs" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-primary)]"></div><span>Braids</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-secondary)]"></div><span>Twists</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-warning)]"></div><span>Cornrows</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-[var(--color-success)]"></div><span>Locs</span></div>
                </div>
            </Card>

            {/* Weekly Performance Details Table */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Weekly Performance Details</h3>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {weeklyPerformanceDetails.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-success)] font-medium">{format(row.income)}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-error)] font-medium">{format(row.expenses)}</td>
                                    <td className="px-3 py-3 text-right text-[var(--color-primary)] font-bold">{format(row.profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Salary Performance Details */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Salary / Performance Details</h3><p className="text-xs text-gray-500">Monthly breakdown</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salaryPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.2 }} />
                        <Bar dataKey="value1" fill="var(--color-primary)" />
                        <Bar dataKey="value2" fill="var(--color-secondary)" />
                        <Bar dataKey="value3" fill="var(--color-warning)" />
                        <Bar dataKey="value4" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Daily Activities & Client Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Daily Activities Log</h3>
                    <div className="space-y-3">
                        {activities.slice(0, 5).map((activity, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${activity.type === "payment" ? "bg-[var(--color-success-light)] border-[var(--color-success-light)]" : "bg-[var(--color-info-light,bg-blue-50)] border-[var(--color-info-light,border-blue-100)]"}`}>
                                <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                                <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString()}</p>
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
                                <div className="flex items-center gap-1"><span className="text-lg font-bold text-gray-900">{client.rating}</span><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Service Distribution & Top Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Service Time Distribution</h3>
                    <div className="flex items-center justify-between">
                        <div className="w-1/2">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={serviceTimeDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                        {serviceTimeDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
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
                        {servicesList.map((service, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[var(--color-primary-light)]">
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
                </Card>
            </div>

            {/* Overall Performance */}
            <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Weekly Performance Summary Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.2 }} />
                        <Bar dataKey="value1" fill="var(--color-primary)" />
                        <Bar dataKey="value2" fill="var(--color-secondary)" />
                        <Bar dataKey="value3" fill="var(--color-warning)" />
                        <Bar dataKey="value4" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Repeat Clients Card */}
            <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top 5 Repeat Clients</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {topClients.map((client, idx) => (
                        <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className={`w-12 h-12 rounded-full ${client.color} flex items-center justify-center font-bold mx-auto mb-2`}>{client.avatar}</div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.visits} visits</p>
                            <p className="text-sm font-bold text-[var(--color-primary)] mt-1">{format(client.spent)}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Client Comments Section - NEW */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />Client Comments & Reviews</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Average Rating:</span>
                        <div className="flex items-center gap-1 bg-[var(--color-warning-light)] px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900">4.7</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-full ${comment.color} flex items-center justify-center font-bold text-lg`}>{comment.avatar}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">{comment.client}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{comment.comment}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-400">{comment.date}</span>
                                        <button className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"><ThumbsUp className="w-3 h-3" />Helpful</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    return (
        <TeamLayout
            title={`${worker.name || 'Worker'}'s Performance`}
            description="Detailed analytics and performance metrics"
        >
            <div className="space-y-6 pb-8">
                {/* Back Button */}
                <div className="flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                </div>

                {/* Header Section - Primary Gradient steering away from default */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-warning-light)] flex items-center justify-center border-4 border-white/30 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
                                    alt="Orphelia"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl font-bold text-[var(--color-primary)]">O</span>`;
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{worker.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 opacity-90 text-sm mt-1">
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{worker.email}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{worker.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">{worker.role}</span>
                                    <span className="px-2 py-0.5 bg-green-400/30 rounded text-xs font-medium flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>{worker.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(permissions.isManager || isOwnProfile) && (
                                <ReadOnlyGuard>
                                    <Link href={`/team/edit-advanced/${id}`}>
                                        <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs">
                                            <Edit className="w-3 h-3 mr-1" />Edit Profile
                                        </Button>
                                    </Link>
                                </ReadOnlyGuard>
                            )}
                            {canSeeFinancials && (
                                <ReadOnlyGuard>
                                    <Button variant="primary" size="sm" className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-xs border-none">Download Report</Button>
                                </ReadOnlyGuard>
                            )}
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setViewMode("simple")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "simple"
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Simple Overview</span>
                    </button>
                    <button
                        onClick={() => setViewMode("advanced")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "advanced"
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <Table className="w-4 h-4" />
                        <span>Advanced Data</span>
                    </button>
                </div>

                {/* Conditional View Render */}
                {viewMode === "simple" ? simpleView : advancedView}
            </div>
        </TeamLayout>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <TeamLayout
            title="Loading..."
            description="Please wait while we load the performance metrics"
        >
            <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
                </div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        </TeamLayout>
    );
}

export default function TeamMemberDetailPage(props: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <TeamMemberDetailPageContent {...props} />
        </Suspense>
    );
}
