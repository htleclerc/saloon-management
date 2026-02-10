"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DateRangeFilter, { DateFilterValue } from "@/components/ui/DateRangeFilter";
import {
    DollarSign,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Search,
    TrendingUp,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import { workerService } from "@/lib/services/WorkerService";
import { incomeService } from "@/lib/services/IncomeService";
import { SalonWorker, Income } from "@/types";

// Helper to check if a date matches the filter
const matchesDateFilter = (dateStr: string, filter: DateFilterValue): boolean => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    if (year !== filter.year) return false;
    if (filter.month !== null && month !== filter.month) return false;
    return true;
};

// Interface for normalized income item for the table
interface NormalizedIncomeItem {
    id: number;
    date: string;
    memberId: number | null; // Primary member ID if available
    member: string;
    client: string;
    service: string; // Could be multiple services or generic "Service"
    amount: number;
    status: Income['status'];
    _workerIds: number[];
}

function TeamIncomePageContent() {
    const searchParams = useSearchParams();
    const memberIdParam = searchParams.get("memberId");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();
    const { format } = useCurrency();
    const { t } = useTranslation();
    const { activeSalonId } = useAuth();

    const [teamMembers, setTeamMembers] = useState<SalonWorker[]>([]);
    const [allIncomeData, setAllIncomeData] = useState<NormalizedIncomeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedMember, setSelectedMember] = useState<number | null>(memberIdParam ? parseInt(memberIdParam) : null);
    const [dateFilter, setDateFilter] = useState<DateFilterValue>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, week: null, day: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            if (!activeSalonId) return;

            setIsLoading(true);
            try {
                // Fetch workers
                const workers = await workerService.getAll(Number(activeSalonId));
                setTeamMembers(workers);

                // Fetch incomes
                const incomes = await incomeService.getAll(Number(activeSalonId));

                // Normalize incomes for display
                const items: NormalizedIncomeItem[] = incomes.map(income => {
                    // Resolve worker names using workerIds
                    const incomeWorkerIds = income.workerIds || [];
                    const incomeWorkerNames = incomeWorkerIds.map(id => {
                        const worker = workers.find(w => w.id === id);
                        return worker ? `${worker.firstName} ${worker.lastName}` : t("common.unknown");
                    });

                    const mainWorkerId = incomeWorkerIds.length > 0 ? incomeWorkerIds[0] : null;

                    return {
                        id: income.id,
                        date: income.date,
                        memberId: mainWorkerId,
                        member: incomeWorkerNames.join(", ") || t("common.noWorker"),
                        client: income.clientName || t("common.unknownClient"),
                        service: t("common.service"),
                        amount: income.finalAmount,
                        status: income.status,
                        _workerIds: incomeWorkerIds
                    };
                });

                setAllIncomeData(items);

            } catch (error) {
                console.error("Failed to load team income data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [activeSalonId, t]);


    // Memoized callback for date filter changes
    const handleDateFilterChange = useCallback((value: DateFilterValue) => {
        setDateFilter(value);
        setCurrentPage(1);
    }, []);

    // Filter data
    const filteredData = allIncomeData.filter((item) => {
        // Member filter
        if (selectedMember) {
            // Check if this member is involved in the income
            if (!item._workerIds || !item._workerIds.includes(selectedMember)) return false;
        }

        // Date filter
        if (!matchesDateFilter(item.date, dateFilter)) return false;
        // Search filter
        if (searchQuery && !item.client.toLowerCase().includes(searchQuery.toLowerCase()) && !item.service.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Stats
    const totalIncome = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const completedCount = filteredData.filter(item => item.status === "Validated").length; // Changed 'Completed' to 'Validated' per business rules
    const pendingCount = filteredData.filter(item => item.status === "Pending" || item.status === "Draft").length;

    const handleMemberChange = (memberId: number | null) => {
        setSelectedMember(memberId);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <TeamLayout
                title={t("team.incomeHistory")}
                description={t("team.incomeHistoryDesc")}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            </TeamLayout>
        )
    }

    return (
        <TeamLayout
            title={t("team.incomeHistory")}
            description={t("team.incomeHistoryDesc")}
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        {t("common.export")}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-[var(--color-success-light)] to-[var(--color-success-light)] border-[var(--color-success-light)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{t("team.totalIncome")}</p>
                                <p className="text-xl font-bold text-[var(--color-success)]">{format(totalIncome)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-light)] border-[var(--color-primary-light)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{t("team.completed")}</p>
                                <p className="text-xl font-bold text-[var(--color-primary)]">{completedCount}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-[var(--color-warning-light)] to-[var(--color-warning-light)] border-[var(--color-warning-light)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-dark)] rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{t("team.pending")}</p>
                                <p className="text-xl font-bold text-[var(--color-warning)]">{pendingCount}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col gap-4">
                        {/* Date Range Filter */}
                        <DateRangeFilter onChange={handleDateFilterChange} showWeekFilter={true} />

                        {/* Member & Search Filters */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            {/* Member Filter */}
                            <div className="w-full lg:w-48">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("team.title")}</label>
                                <select
                                    value={selectedMember ?? ""}
                                    onChange={(e) => handleMemberChange(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="">{t("team.allTeamMembers")}</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="flex-1 w-full lg:w-auto">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("common.search")}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t("team.searchPlaceholder")}
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Income Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{t("team.incomeRecords")}</h3>
                        <p className="text-sm text-gray-500">{t("team.recordsFound", { count: filteredData.length })}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("common.date")}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("team.title")}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("common.client")}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("common.service")}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("common.amount")}</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{t("common.status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                        {item.member.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{item.member}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.client}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.service}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-success)]">{format(item.amount)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === "Validated"
                                                    ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                                    : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            {t("team.noIncomeRecords")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredData.length > 0 && (
                                <tfoot className="bg-[var(--color-primary-light)] font-semibold">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-sm text-[var(--color-primary)]">{t("common.total")}</td>
                                        <td className="px-4 py-3 text-sm text-right text-[var(--color-success)]">{format(totalIncome)}</td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {t("common.pagination", { start: (currentPage - 1) * itemsPerPage + 1, end: Math.min(currentPage * itemsPerPage, filteredData.length), total: filteredData.length })}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${currentPage === i + 1
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80"
                                        }`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </TeamLayout>
    );
}

// Loading fallback
function LoadingFallback() {
    const { t } = useTranslation();
    return (
        <TeamLayout
            title={t("team.incomeHistory")}
            description={t("team.incomeHistoryDesc")}
        >
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        </TeamLayout>
    );
}

export default function TeamIncomePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <TeamIncomePageContent />
        </Suspense>
    );
}
