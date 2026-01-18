"use client";

import { useState, useCallback, Suspense } from "react";
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
    ArrowLeft,
} from "lucide-react";

// Mock Team Members for filter
const teamMembers = [
    { id: 1, name: "Orphelia" },
    { id: 2, name: "Aminata" },
    { id: 3, name: "Fatou" },
    { id: 4, name: "Aïcha" },
];

// Mock Income Data
const allIncomeData = [
    { id: 1, date: "2026-01-14", memberId: 1, member: "Orphelia", client: "Marie Dubois", service: "Box Braids", amount: 120, status: "Completed" },
    { id: 2, date: "2026-01-14", memberId: 1, member: "Orphelia", client: "Sophie Laurent", service: "Senegalese Twists", amount: 95, status: "Completed" },
    { id: 3, date: "2026-01-13", memberId: 2, member: "Aminata", client: "Anna Martin", service: "Cornrows", amount: 85, status: "Completed" },
    { id: 4, date: "2026-01-13", memberId: 1, member: "Orphelia", client: "Claire Petit", service: "Locs Maintenance", amount: 150, status: "Completed" },
    { id: 5, date: "2026-01-12", memberId: 3, member: "Fatou", client: "Julie Bernard", service: "Box Braids", amount: 130, status: "Completed" },
    { id: 6, date: "2026-01-12", memberId: 1, member: "Orphelia", client: "Nadia Koné", service: "Twists", amount: 110, status: "Completed" },
    { id: 7, date: "2026-01-11", memberId: 2, member: "Aminata", client: "Camille Roche", service: "Cornrows", amount: 75, status: "Completed" },
    { id: 8, date: "2026-01-11", memberId: 4, member: "Aïcha", client: "Lucie Moreau", service: "Knotless Braids", amount: 180, status: "Completed" },
    { id: 9, date: "2026-01-10", memberId: 1, member: "Orphelia", client: "Emma Leroy", service: "Box Braids", amount: 125, status: "Completed" },
    { id: 10, date: "2026-01-10", memberId: 3, member: "Fatou", client: "Léa Dupont", service: "Twists", amount: 100, status: "Completed" },
    { id: 11, date: "2026-01-09", memberId: 1, member: "Orphelia", client: "Chloé Martin", service: "Senegalese Twists", amount: 95, status: "Completed" },
    { id: 12, date: "2026-01-09", memberId: 2, member: "Aminata", client: "Manon Petit", service: "Locs Maintenance", amount: 160, status: "Completed" },
    { id: 13, date: "2026-01-08", memberId: 4, member: "Aïcha", client: "Jade Bernard", service: "Box Braids", amount: 140, status: "Completed" },
    { id: 14, date: "2026-01-08", memberId: 1, member: "Orphelia", client: "Louise Moreau", service: "Cornrows", amount: 80, status: "Completed" },
    { id: 15, date: "2026-01-07", memberId: 3, member: "Fatou", client: "Inès Roux", service: "Knotless Braids", amount: 175, status: "Completed" },
    { id: 16, date: "2026-01-07", memberId: 1, member: "Orphelia", client: "Zoé Lefevre", service: "Twists", amount: 105, status: "Pending" },
    { id: 17, date: "2026-01-06", memberId: 2, member: "Aminata", client: "Lina Garcia", service: "Box Braids", amount: 135, status: "Completed" },
    { id: 18, date: "2026-01-06", memberId: 4, member: "Aïcha", client: "Mia Thomas", service: "Senegalese Twists", amount: 98, status: "Completed" },
    { id: 19, date: "2026-01-05", memberId: 1, member: "Orphelia", client: "Eva Robert", service: "Locs Maintenance", amount: 155, status: "Completed" },
    { id: 20, date: "2026-01-05", memberId: 3, member: "Fatou", client: "Léonie Durand", service: "Cornrows", amount: 78, status: "Completed" },
];

// Helper to check if a date matches the filter
const matchesDateFilter = (dateStr: string, filter: DateFilterValue): boolean => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    if (year !== filter.year) return false;
    if (filter.month !== null && month !== filter.month) return false;
    return true;
};

function TeamIncomePageContent() {
    const searchParams = useSearchParams();
    const memberIdParam = searchParams.get("memberId");
    const router = useRouter();

    const [selectedMember, setSelectedMember] = useState<number | null>(memberIdParam ? parseInt(memberIdParam) : null);
    const [dateFilter, setDateFilter] = useState<DateFilterValue>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, week: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Memoized callback for date filter changes
    const handleDateFilterChange = useCallback((value: DateFilterValue) => {
        setDateFilter(value);
        setCurrentPage(1);
    }, []);

    // Filter data
    const filteredData = allIncomeData.filter((item) => {
        // Member filter
        if (selectedMember && item.memberId !== selectedMember) return false;
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
    const completedCount = filteredData.filter(item => item.status === "Completed").length;
    const pendingCount = filteredData.filter(item => item.status === "Pending").length;

    const handleMemberChange = (memberId: number | null) => {
        setSelectedMember(memberId);
        setCurrentPage(1);
    };

    return (
        <TeamLayout
            title="Income History"
            description="View and filter team member income"
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Income</p>
                                <p className="text-xl font-bold text-green-700">€{totalIncome.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Completed</p>
                                <p className="text-xl font-bold text-purple-700">{completedCount}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
                                <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
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
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Team Member</label>
                                <select
                                    value={selectedMember ?? ""}
                                    onChange={(e) => handleMemberChange(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="">All Team Members</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="flex-1 w-full lg:w-auto">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Client or service..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Income Table */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Income Records</h3>
                        <p className="text-sm text-gray-500">{filteredData.length} records found</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Member</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                        {item.member.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{item.member}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.client}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.service}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">€{item.amount}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No income records found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredData.length > 0 && (
                                <tfoot className="bg-purple-50 font-semibold">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-sm text-purple-900">Total</td>
                                        <td className="px-4 py-3 text-sm text-right text-green-700">€{totalIncome.toLocaleString()}</td>
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
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${currentPage === i + 1
                                            ? "bg-purple-600 text-white"
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
                                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
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
    return (
        <TeamLayout
            title="Income History"
            description="View and filter team member income"
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
