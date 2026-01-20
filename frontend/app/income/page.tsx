"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Filter, Download, Calendar, BarChart2, MessageSquare, History, Check, X, Printer, FileText, Eye, Pencil, Trash2, CheckCircle2, Clock, LayoutGrid, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import { useIncome } from "@/context/IncomeProvider";
import { useBooking } from "@/context/BookingProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import { canPerformIncomeAction, useActionPermissions } from "@/lib/permissions";
import { UserRole } from "@/context/AuthProvider";
import { SERVICES } from "@/lib/data";

// The static mock data uses slightly different naming than our new Income interface
// English Mock Data
const mockIncomes = [
    {
        id: 1,
        date: "2026-01-12",
        client: "Marie Dubois",
        service: "Box Braids",
        workers: ["Orphelia"],
        author: "Admin",
        amount: 120,
        status: "Validated",
        history: [
            { date: "2026-01-12 09:00", action: "Created", user: "Admin", comment: "" },
            { date: "2026-01-12 10:30", action: "Validated", user: "Admin", comment: "Auto-validated by admin" }
        ],
        comments: []
    },
    {
        id: 2,
        date: "2026-01-12",
        client: "Jean Martin",
        service: "Cornrows",
        workers: ["Worker 2", "Orphelia"],
        author: "Worker 2",
        amount: 85,
        status: "Pending",
        history: [
            { date: "2026-01-12 11:15", action: "Created", user: "Worker 2", comment: "" }
        ],
        comments: [
            { date: "2026-01-12 11:20", user: "Worker 2", text: "Difficult client, but everything went well." }
        ]
    }
];

export default function IncomePage() {
    const { getCardStyle } = useKpiCardStyle();
    const auth = useAuth();
    const { user, isWorker } = auth;
    const { incomes: dynamicIncomes, validateIncome, addComment } = useIncome();
    const { bookings } = useBooking();
    const { confirm } = useConfirm();
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [commentText, setCommentText] = useState<Record<number, string>>({});
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "dashboard">("list");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedHistory, setSelectedHistory] = useState<{ title: string, subtitle: string, events: HistoryEvent[] }>({
        title: "",
        subtitle: "",
        events: []
    });
    const permissions = useActionPermissions(auth);

    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    // Unified interface helper to bridge mock data and dynamic state data
    const normalizedIncomes = [...mockIncomes, ...dynamicIncomes].map(item => {
        const isDynamic = 'createdBy' in item;

        // Helper to find service name if it's dynamic
        let serviceDisplay = "";
        if (isDynamic) {
            const booking = bookings.find(b => (item as any).bookingIds.includes(b.id));
            if (booking) {
                serviceDisplay = booking.customServiceDetails || `Service #${(item as any).serviceIds[0]}`;
            } else {
                serviceDisplay = (item as any).serviceIds.map((id: any) => SERVICES.find(s => s.id === id)?.name || `Service #${id}`).join(", ");
            }
        } else {
            // Check if it's a mock item with "service" string or "serviceIds"
            serviceDisplay = (item as any).service || "Unknown Service";
        }

        return {
            ...item,
            clientName: isDynamic ? (item as any).clientName : (item as any).client,
            workerNames: isDynamic ? (item as any).workerIds : (item as any).workers,
            serviceDisplay: serviceDisplay,
            authorName: isDynamic ? (item as any).createdBy : (item as any).author,
            id: item.id,
            status: item.status as any
        };
    });

    const filteredIncomes = isWorker
        ? normalizedIncomes.filter(r => (r.workerNames || []).includes(user?.name || "") || r.authorName === user?.name)
        : normalizedIncomes;

    const totalIncome = filteredIncomes.filter(r => r.status !== "Closed" && r.status !== "Cancelled").reduce((sum, r) => sum + r.amount, 0);
    const validatedIncome = filteredIncomes.filter(r => r.status === "Validated").reduce((sum, r) => sum + r.amount, 0);
    const pendingIncome = filteredIncomes.filter(r => r.status === "Pending" || r.status === "Draft").reduce((sum, r) => sum + r.amount, 0);

    // Pagination Logic
    const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
    const paginatedIncomes = filteredIncomes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleValidate = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Validate Income?",
            message: "Are you sure you want to validate this income?",
            type: "success",
            confirmText: "Validate",
            cancelText: "Cancel"
        });
        if (isConfirmed) {
            validateIncome(id, "Validated via Management UI");
        }
    };

    const handleArchive = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Archive Record?",
            message: "Are you sure you want to archive this income record?",
            type: "warning",
            confirmText: "Archive",
            cancelText: "Cancel"
        });
        if (isConfirmed) {
            // Implementation would go here, for now we just show toast/confirmation
            console.log("Archiving income", id);
        }
    };

    const handlePrint = (income: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Income Details - #${income.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .details { margin-top: 30px; }
                        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .table th, .table td { border: 1px solid #eee; padding: 12px; text-align: left; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div><h1>Workshop Management</h1><p>Income Report</p></div>
                        <div style="text-align: right;"><h2>#${income.id}</h2><p>${income.date}</p></div>
                    </div>
                    <div class="details">
                        <p><strong>Client:</strong> ${income.clientName}</p>
                        <p><strong>Status:</strong> ${income.status}</p>
                        <table class="table">
                            <thead><tr><th>Service</th><th>Amount</th></tr></thead>
                            <tbody><tr><td>${income.serviceDisplay}</td><td>€${income.amount}</td></tr></tbody>
                        </table>
                    </div>
                    <div class="footer">Thank you for your business.</div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadInvoice = (income: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Invoice #: INV-${income.id}`, 20, 40);
        doc.text(`Date: ${income.date}`, 20, 47);
        doc.text("BILLED TO:", 20, 65);
        doc.text(income.clientName, 20, 72);
        doc.line(20, 85, 190, 85);
        doc.text("DESCRIPTION", 20, 95);
        doc.text("TOTAL", 170, 95);
        doc.text(income.serviceDisplay || "Salon Services", 20, 105);
        doc.text(`€${income.amount}`, 170, 105);
        doc.line(20, 115, 190, 115);
        doc.setFontSize(14);
        doc.text(`TOTAL DUE: €${income.amount}`, 170, 125, { align: "right" });
        doc.save(`Invoice_${income.id}.pdf`);
    };

    const handleViewHistory = (income: any) => {
        setSelectedHistory({
            title: `Income #${income.id}`,
            subtitle: `Client: ${income.clientName} | Service: ${income.serviceDisplay}`,
            events: income.history || []
        });
        setHistoryModalOpen(true);
    };

    const handleAddComment = (id: number) => {
        if (!commentText[id]) return;
        addComment(id, commentText[id]);
        setCommentText(prev => ({ ...prev, [id]: "" }));
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <div className="flex flex-col gap-4 md:gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Income Management</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Track and manage all income streams</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* View Toggle - Left in Desktop */}
                        {permissions.canViewFinancialDashboard && (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                                <button
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                >
                                    <LayoutGrid size={18} />
                                    <span>Simple List</span>
                                </button>
                                <Link href="/income/dashboard" className="flex-1 md:flex-none">
                                    <button
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-all"
                                    >
                                        <BarChart2 size={18} />
                                        <span>Advanced View</span>
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Action Buttons - Right in Desktop */}
                        <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
                            <Button variant="outline" size="md" className="flex-1 md:flex-none rounded-xl h-11 flex items-center justify-center gap-2 font-bold text-gray-600 border-gray-200">
                                <Printer className="w-4 h-4" />
                                <span>Print</span>
                            </Button>
                            <Button variant="outline" size="md" className="flex-1 md:flex-none rounded-xl h-11 flex items-center justify-center gap-2 font-bold text-gray-600 border-gray-200">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </Button>
                            <Link href="/income/add" className="col-span-2 md:col-span-1">
                                <Button variant="primary" size="md" className="w-full rounded-xl h-11 flex items-center justify-center gap-2 font-bold shadow-lg shadow-purple-500/20 bg-[#A855F7] hover:bg-[#9333EA]">
                                    <Plus className="w-5 h-5" />
                                    <span>Add Income</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+12.5%</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">Total Income</p>
                            <h3 className="text-3xl font-bold mt-1">€{totalIncome.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div
                        className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">Secure</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">Validated</p>
                            <h3 className="text-3xl font-bold mt-1">€{validatedIncome.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div
                        className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">Pending</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">Pending/Draft</p>
                            <h3 className="text-3xl font-bold mt-1">€{pendingIncome.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedIncomes.map((income) => (
                                    <React.Fragment key={income.id}>
                                        <tr className={`hover:bg-gray-50 cursor-pointer ${expandedRows.includes(income.id) ? 'bg-purple-50/30' : ''}`} onClick={() => toggleRow(income.id)}>
                                            <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">#{income.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.date}</td>
                                            <td className="px-4 py-4 font-medium">{income.clientName}</td>
                                            <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-600 truncate max-w-[150px]">{income.serviceDisplay}</td>
                                            <td className="px-4 py-4 text-right font-bold text-gray-900">€{income.amount}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${income.status === 'Validated' ? 'bg-green-100 text-green-700' :
                                                        income.status === 'Draft' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {income.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-4 text-center">
                                                <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                                                    {/* Desktop Actions - 6 Actions */}
                                                    <button className="p-2 hover:bg-white rounded-lg hover:text-purple-600 transition-all shadow-sm border border-transparent hover:border-gray-100" title="View Detail"><Eye size={16} /></button>

                                                    <Link href={`/income/add?edit=${income.id}`}>
                                                        <button className="p-2 hover:bg-white rounded-lg hover:text-purple-600 transition-all shadow-sm border border-transparent hover:border-gray-100" title="Edit"><Pencil size={16} /></button>
                                                    </Link>

                                                    {canPerformIncomeAction(income as any, "validate", user?.role as UserRole) && (
                                                        <button onClick={() => handleValidate(income.id)} className="p-2 hover:bg-white rounded-lg text-green-600 hover:text-green-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title="Validate"><Check size={16} /></button>
                                                    )}

                                                    {canPerformIncomeAction(income as any, "view_invoice", user?.role as UserRole) && (
                                                        <button
                                                            onClick={() => handleDownloadInvoice(income)}
                                                            className="p-2 hover:bg-white rounded-lg text-blue-600 hover:text-blue-800 transition-all shadow-sm border border-transparent hover:border-gray-100"
                                                            title="Invoice"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleViewHistory(income)} className="p-2 hover:bg-white rounded-lg text-purple-600 hover:text-purple-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title="History"><History size={16} /></button>

                                                    <button onClick={() => handleArchive(income.id)} className="p-2 hover:bg-white rounded-lg text-red-600 hover:text-red-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title="Archive"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows.includes(income.id) && (
                                            <tr className="bg-gray-50/80">
                                                <td colSpan={7} className="px-4 md:px-12 py-6">
                                                    <div className="flex flex-col gap-6">
                                                        {/* Actions Bar for Mobile/Expanded - 6 Actions */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm"
                                                                onClick={() => { }}
                                                            >
                                                                <Eye size={18} /> Detail
                                                            </Button>
                                                            <Link href={`/income/add?edit=${income.id}`} className="w-full">
                                                                <Button variant="outline" size="sm" className="w-full justify-center gap-2 h-11 rounded-xl bg-white shadow-sm">
                                                                    <Pencil size={18} /> Edit
                                                                </Button>
                                                            </Link>
                                                            {canPerformIncomeAction(income as any, "validate", user?.role as UserRole) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-green-600 border-green-100"
                                                                    onClick={() => handleValidate(income.id)}
                                                                >
                                                                    <Check size={18} /> Validate
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-blue-600 border-blue-100"
                                                                onClick={() => handleDownloadInvoice(income)}
                                                            >
                                                                <FileText size={18} /> Invoice
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-purple-600 border-purple-100"
                                                                onClick={() => handleViewHistory(income)}
                                                            >
                                                                <History size={18} /> History
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-red-600 border-red-100"
                                                                onClick={() => handleArchive(income.id)}
                                                            >
                                                                <Trash2 size={18} /> Archive
                                                            </Button>
                                                        </div>

                                                        {/* Comments Section */}
                                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                                                            <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                                    <MessageSquare size={16} className="text-[var(--color-primary)]" /> Comments & Notes
                                                                </h4>
                                                                <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-1 rounded-full uppercase tracking-wider">
                                                                    {income.comments?.length || 0} notes
                                                                </span>
                                                            </div>

                                                            <div className="p-6">
                                                                <div className="space-y-4 mb-6">
                                                                    {income.comments && income.comments.length > 0 ? (
                                                                        income.comments.map((c, i) => (
                                                                            <div key={i} className="flex gap-4">
                                                                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary-light)] to-purple-50 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm shrink-0 shadow-sm border border-purple-100">
                                                                                    {c.user.charAt(0)}
                                                                                </div>
                                                                                <div className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm border border-gray-100 hover:border-[var(--color-primary-light)] transition-colors group">
                                                                                    <div className="flex justify-between items-center mb-2">
                                                                                        <span className="font-bold text-gray-900">{c.user}</span>
                                                                                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                                                                            <Clock size={10} /> {c.date}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-gray-600 italic leading-relaxed">"{c.text}"</p>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-center py-8 text-gray-400 italic text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                                            No comments yet for this transaction.
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col md:flex-row gap-3 bg-[var(--color-primary-light)]/30 p-4 rounded-2xl border border-dashed border-[var(--color-primary-light)]">
                                                                    <input
                                                                        type="text"
                                                                        className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-4 py-3 h-12 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all shadow-sm"
                                                                        placeholder="Add a quick note..."
                                                                        value={commentText[income.id] || ""}
                                                                        onChange={e => setCommentText(prev => ({ ...prev, [income.id]: e.target.value }))}
                                                                        onKeyDown={e => e.key === 'Enter' && handleAddComment(income.id)}
                                                                    />
                                                                    <Button
                                                                        size="md"
                                                                        className="h-12 px-8 rounded-xl font-bold bg-[var(--color-primary)] hover:opacity-90 transition-all shadow-lg shadow-purple-200 active:scale-95"
                                                                        onClick={() => handleAddComment(income.id)}
                                                                    >
                                                                        Post
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredIncomes.length)}</span> of <span className="font-bold">{filteredIncomes.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span className="text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </Card>

                <HistoryModal
                    isOpen={historyModalOpen}
                    onClose={() => setHistoryModalOpen(false)}
                    title="Transaction History"
                    itemTitle={selectedHistory.title}
                    itemSubtitle={selectedHistory.subtitle}
                    events={selectedHistory.events}
                />
            </div>
        </MainLayout>
    );
}
