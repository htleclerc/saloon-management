"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    ArrowLeft,
    History,
    Clock,
    User,
    DollarSign,
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    FileText,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const services = [
    { id: 1, name: "Box Braids" },
    { id: 2, name: "Cornrows" },
    { id: 3, name: "Senegalese Twists" },
    { id: 4, name: "Locs" },
    { id: 5, name: "Goddess Braids" },
    { id: 6, name: "Twists" },
];

const serviceUsageHistory = [
    { id: 1, date: "2026-01-19 14:30", action: "Income Validated", user: "Admin", comment: "Commission paid to Orphelia", type: "income", incomeId: 1 },
    { id: 2, date: "2026-01-19 11:00", action: "Booking Finished", user: "Orphelia", comment: "Client: Marie Dubois", type: "booking", bookingId: 101 },
    { id: 3, date: "2026-01-18 16:45", action: "Invoice Generated", user: "System", comment: "Auto-drafted from booking #452", type: "invoice", invoiceId: 1 },
    { id: 4, date: "2026-01-18 10:20", action: "Booking Started", user: "Orphelia", comment: "Client: Sarah Jones", type: "booking", bookingId: 102 },
    { id: 5, date: "2026-01-17 09:00", action: "Appointment Set", user: "System", comment: "Online booking by Yasmine M", type: "booking", bookingId: 103 },
    { id: 6, date: "2026-01-15 14:00", action: "Income Validated", user: "Admin", comment: "Paid cash", type: "income", incomeId: 2 },
    { id: 7, date: "2026-01-15 12:30", action: "Booking Finished", user: "Orphelia", comment: "Client: John Doe", type: "booking", bookingId: 104 },
    { id: 8, date: "2026-01-14 11:00", action: "Booking Started", user: "Orphelia", comment: "Client: John Doe", type: "booking", bookingId: 105 },
];

export default function ServiceHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = parseInt(params.id as string);
    const { isAdmin } = useAuth();

    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const service = services.find(s => s.id === serviceId) || services[0];

    const filteredHistory = serviceUsageHistory.filter(event => {
        const matchesFilter = filter === "all" || event.type === filter;
        const matchesSearch = event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.user.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredHistory.length / pageSize);
    const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <CheckCircle2 className="w-4 h-4" />;
            case 'booking': return <Clock className="w-4 h-4" />;
            case 'invoice': return <FileText className="w-4 h-4" />;
            default: return <History className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'income': return 'bg-green-500 text-white';
            case 'booking': return 'bg-blue-500 text-white';
            case 'invoice': return 'bg-purple-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <ProtectedRoute requiredRole={["admin", "owner"]}>
            <MainLayout>
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{service.name} History</h1>
                                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">Full Audit Trail & Activity Logs</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <Card className="p-4 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex p-1 bg-gray-100 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'income', label: 'Income' },
                                    { id: 'booking', label: 'Bookings' },
                                    { id: 'invoice', label: 'Invoices' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilter(tab.id)}
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab.id
                                            ? 'bg-white text-[var(--color-primary)] shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search in history..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-0 border-none shadow-2xl shadow-gray-200/50 bg-white rounded-[2rem] overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[var(--color-primary)] text-white rounded-2xl shadow-lg shadow-purple-500/20">
                                    <History className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Historical Records</h3>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <Filter className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Showing {filteredHistory.length} events
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-gray-100"></div>

                                <div className="space-y-12 relative">
                                    {paginatedHistory.length > 0 ? paginatedHistory.map((event) => (
                                        <div key={event.id} className="flex gap-6 group">
                                            <div className="relative z-10">
                                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 border-4 border-white ${getColor(event.type)}`}>
                                                    {getIcon(event.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                                    <h4 className="font-black text-gray-900 text-lg leading-tight">{event.action}</h4>
                                                    <div className="flex items-center gap-2 text-gray-400 mt-1 md:mt-0">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">
                                                            {event.date}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] font-black uppercase tracking-widest mb-3">
                                                    <User className="w-3.5 h-3.5" />
                                                    Processed by {event.user}
                                                </div>
                                                {event.comment && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 italic border border-gray-100 leading-relaxed shadow-inner mb-4">
                                                        "{event.comment}"
                                                    </div>
                                                )}

                                                <div className="flex gap-3">
                                                    {(event as any).incomeId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl font-bold bg-white text-[10px] sm:text-xs"
                                                            onClick={() => router.push(`/income/edit/${(event as any).incomeId}?fromHistory=true`)}
                                                        >
                                                            View Income
                                                        </Button>
                                                    )}
                                                    {(event as any).bookingId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl font-bold bg-white text-[10px] sm:text-xs"
                                                            onClick={() => router.push(`/appointments/${(event as any).bookingId}?fromHistory=true`)}
                                                        >
                                                            View Booking
                                                        </Button>
                                                    )}
                                                    {event.invoiceId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl font-bold bg-white text-[10px] sm:text-xs"
                                                            onClick={() => router.push(`/income/invoices?search=${event.invoiceId}`)}
                                                        >
                                                            View Invoice
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 text-center">
                                            <Search className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-sm text-gray-300">No events found matching your criteria</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">
                                Page {currentPage} <span className="mx-2 text-gray-200">|</span> Total {totalPages}
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-2xl p-3 h-12 w-12 flex items-center justify-center bg-white shadow-sm border-gray-100 hover:border-[var(--color-primary)] transition-all disabled:opacity-30"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-2xl p-3 h-12 w-12 flex items-center justify-center bg-white shadow-sm border-gray-100 hover:border-[var(--color-primary)] transition-all disabled:opacity-30"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-[var(--color-primary)] font-black uppercase tracking-widest text-sm hover:translate-x-[-4px] transition-transform"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Service Details
                        </button>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
