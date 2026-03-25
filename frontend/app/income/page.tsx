"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Filter, Download, Calendar, BarChart2, MessageSquare, History, Check, X, Printer, FileText, Eye, Pencil, Trash2, CheckCircle2, Clock, LayoutGrid, TrendingUp, ChevronLeft, ChevronRight, Search, Archive, Send } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { incomeService, serviceService, workerService, revenueStatsService } from "@/lib/services";
import { useConfirm } from "@/context/ConfirmProvider";
import { useToast } from "@/context/ToastProvider";
import React, { useState, useMemo, useEffect } from "react";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import { canPerformIncomeAction, useActionPermissions } from "@/lib/permissions";
import { UserRole } from "@/context/AuthProvider";
import { format } from "date-fns";
import { SERVICES } from "@/lib/data";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { useNotifications } from "@/context/NotificationProvider";
import { Income, IncomeStatus, Service, SalonWorker, BookingComment } from "@/types";

type NormalizedIncome = Income & {
    serviceDisplay: string;
    workerDisplay: string;
};

export default function IncomePage() {
    const { getCardStyle } = useKpiCardStyle();
    const auth = useAuth();
    const { user, isWorker, isManager, activeSalonId } = auth;
    const { addNotification } = useNotifications();
    const { t } = useTranslation();
    const { format: formatCurrency, symbol } = useCurrency();
    const { showToast } = useToast();
    const router = useRouter();
    // Real Data State
    const [incomes, setIncomes] = useState<Income[]>([]);
    const { bookings } = useBooking();
    const [services, setServices] = useState<Service[]>([]);
    const [workers, setWorkers] = useState<SalonWorker[]>([]);
    const { confirm } = useConfirm();
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [commentText, setCommentText] = useState<Record<number, string>>({});
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "dashboard">("list");

    // Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [workerFilter, setWorkerFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    const [revenueGrowth, setRevenueGrowth] = useState(0);

    const loadIncomes = async () => {
        if (!activeSalonId || isNaN(Number(activeSalonId))) {
            console.warn("loadIncomes called with invalid activeSalonId:", activeSalonId);
            return;
        }
        try {
            const salonId = Number(activeSalonId);
            const [incomesData, servicesData, workersData, revTrend] = await Promise.all([
                incomeService.getAll(salonId),
                serviceService.getAll(salonId),
                workerService.getAll(salonId),
                revenueStatsService.getRevenueTrend(salonId)
            ]);
            setServices(servicesData);
            setWorkers(workersData);
            setIncomes(incomesData);

            // Calculate Growth
            const currentMonthIdx = revTrend.length - 1;
            const prevMonthIdx = revTrend.length - 2;
            const currentRev = revTrend[currentMonthIdx]?.revenue || 0;
            const prevRev = revTrend[prevMonthIdx]?.revenue || 0;
            const growth = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0;
            setRevenueGrowth(growth);

        } catch (error) {
            console.error("Failed to load incomes", error);
        }
    };

    useEffect(() => {
        loadIncomes();
    }, [activeSalonId]);

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

    // Normalize incomes with service and worker names
    const normalizedIncomes = useMemo(() => {
        if (!incomes) return [];

        return incomes.map(income => {
            // Get service names
            const serviceNames = (income.serviceIds || [])
                .map((id: number) => services.find(s => s.id === id)?.name || `Service #${id}`)
                .join(", ");

            // Get worker names
            const workerNames = (income.workerIds || [])
                .map((id: number) => workers.find(w => w.id === id)?.name || `Worker #${id}`)
                .join(", ");

            return {
                ...income,
                // Ensure array properties exist for filtering
                workerIds: income.workerIds || [],
                serviceIds: income.serviceIds || [],
                serviceDisplay: serviceNames || "No service",
                workerDisplay: workerNames || "Unassigned",
            };
        });
    }, [incomes, services, workers]);

    const filteredIncomes = useMemo(() => {
        const result = normalizedIncomes.filter(income => {
            // Role Access Filter
            // Only restrict view for standard workers. Managers and Owners see all.
            if (user?.role === 'worker') {
                const currentWorkerId = auth.getWorkerId ? Number(auth.getWorkerId()) : 0;
                const isAssigned = (income.workerIds || []).includes(currentWorkerId);
                const isAuthor = income.createdBy === user?.name;
                if (!isAssigned && !isAuthor) return false;
            }

            // Search Filter
            if (searchQuery &&
                !(income.clientName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) &&
                !income.id.toString().includes(searchQuery)) {
                return false;
            }

            // Date Filters
            if (dateFrom && income.date < dateFrom) return false;
            if (dateTo && income.date > dateTo) return false;

            // Status Filter
            if (statusFilter !== "all" && income.status !== statusFilter) return false;

            // Worker Filter
            if (workerFilter !== "all") {
                const workerId = Number(workerFilter);
                if (!(income.workerIds || []).includes(workerId)) return false;
            }

            return true;
        });
        return result;
    }, [normalizedIncomes, user, searchQuery, dateFrom, dateTo, statusFilter, workerFilter]);


    const totalIncome = filteredIncomes.filter(r => r.status && r.status !== "Closed" && r.status !== "Cancelled").reduce((sum, r) => sum + r.amount, 0);
    const validatedIncome = filteredIncomes.filter(r => r.status === "Validated").reduce((sum, r) => sum + r.amount, 0);
    const pendingIncome = filteredIncomes.filter(r => r.status === "Pending" || r.status === "Draft").reduce((sum, r) => sum + r.amount, 0);


    // Pagination Logic
    const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
    const paginatedIncomes = filteredIncomes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const notifyAdmins = async (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' | 'validation' = 'info') => {
        try {
            // 1. Always notify the hardcoded Owner/SuperAdmin (Demo fallback)
            const targets = new Set<string>(['ADM-000']);

            // 2. Find all Managers in the current salon
            if (activeSalonId) {
                const workers = await workerService.getAll(Number(activeSalonId));
                const managers = workers.filter(w => w.employeeRole === 'Manager' && w.isActive);

                // Resolve UserCodes for managers
                for (const mgr of managers) {
                    const code = await workerService.getUserCode(mgr.id);
                    if (code) targets.add(code);
                }
            }

            // 3. Send notifications
            for (const target of Array.from(targets)) {
                await addNotification({
                    targetUserCode: target,
                    type,
                    title,
                    message
                });
            }

        } catch (e) {
            console.error("Failed to notify admins", e);
        }
    };

    const notifyWorker = async (workerId: number, title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' | 'validation' = 'info') => {
        try {
            const userCode = await workerService.getUserCode(workerId);
            if (userCode) {
                await addNotification({
                    targetUserCode: userCode,
                    type,
                    title,
                    message
                });
            } else {
                console.warn(`Could not find UserCode for worker ${workerId}`);
            }
        } catch (e) {
            console.error(`Failed to notify worker ${workerId}`, e);
        }
    };

    const handleValidate = async (id: number) => {
        const isConfirmed = await confirm({
            title: t("dialogs.validateIncomeTitle") || "Validate Income?",
            message: t("dialogs.validateIncomeMsg") || "Are you sure you want to validate this income?",
            type: "success",
            confirmText: t("common.validate") || "Validate",
            cancelText: t("common.cancel") || "Cancel"
        });
        if (isConfirmed) {
            try {
                await incomeService.validate(id);
                // Sender (Manager) does NOT need a notification.
                // Target: The worker who created it? 
                // We'll just rely on Toast for the sender.
                // And notify Admins/Others via DB.
                // addNotification({ type: 'validation', ... }); // Removed self-notification

                // Notify Owner/Admins that a validation occurred
                await notifyAdmins(
                    t("notifications.incomeValidatedTitle") || "Income Validated",
                    t("notifications.incomeValidatedMsg", { id }) || `Income #${id} has been validated successfully.`,
                    'validation'
                );

                // Notify the Worker(s) associated with this income
                const income = incomes.find(i => i.id === id);
                if (income && income.workerIds && income.workerIds.length > 0) {
                    for (const workerId of income.workerIds) {
                        // Don't notify self if manager validated their own income (unlikely but possible)
                        // But we don't have easy check for that userCode mapping here without async call.
                        // Let's just send it, filtering self is handled by UI toast usually.
                        await notifyWorker(
                            workerId,
                            t("notifications.incomeValidatedTitle") || "Income Validated",
                            t("notifications.incomeValidatedMsg", { id }) || `Your income #${id} has been validated.`,
                            'validation'
                        );
                    }
                }

                loadIncomes();
            } catch (error) {
                console.error("Failed to validate income", error);
            }
        }
    };

    const handleSubmit = async (id: number) => {
        const isConfirmed = await confirm({
            title: t("dialogs.submitIncomeTitle") || "Submit Income?",
            message: t("dialogs.submitIncomeMsg") || "Are you sure you want to submit this income for approval?",
            type: "info",
            confirmText: t("common.submit") || "Submit",
            cancelText: t("common.cancel") || "Cancel"
        });
        if (isConfirmed) {
            try {
                await incomeService.update(id, { status: 'Pending' });
                // Worker submits -> Notify Admins
                await notifyAdmins(
                    t("notifications.incomeSubmittedTitle") || "Income Submitted",
                    t("notifications.incomeSubmittedMsg", { id }) || `Income #${id} submitted for approval by ${user?.name}.`,
                    'success'
                );

                showToast(t("common.success"), t("income.submitSuccess") || "Income submitted successfully", "success");
                loadIncomes();
            } catch (error) {
                console.error("Failed to submit income", error);
                showToast(t("common.error"), t("income.submitError") || "Failed to submit income", "error");
            }
        }
    };

    const handleDelete = async (id: number, currentStatus: string) => {
        const isArchive = currentStatus === 'Validated';
        const isConfirmed = await confirm({
            title: isArchive ? (t("income.archiveConfirmTitle") || "Archive Record?") : (t("income.deleteConfirmTitle") || "Delete Income?"),
            message: isArchive ? (t("income.archiveConfirmMessage") || "This will archive the income.") : (t("income.deleteConfirmMessage") || "This will set the status to Cancelled."),
            type: "warning",
            confirmText: isArchive ? (t("common.archive") || "Archive") : (t("common.delete") || "Delete"),
            cancelText: t("common.cancel") || "Cancel"
        });
        if (isConfirmed) {
            try {
                if (isArchive) {
                    // For Validated: set status to 'Archived' (soft delete)
                    await incomeService.update(id, { status: 'Archived' as IncomeStatus });
                    await notifyAdmins(
                        t("notifications.incomeArchivedTitle") || "Income Archived",
                        t("notifications.incomeArchivedMsg", { id }) || `Income #${id} has been archived.`,
                        'warning'
                    );
                } else {
                    // For Draft/Pending: set status to 'Cancelled'
                    await incomeService.update(id, { status: 'Cancelled' as IncomeStatus });
                    await notifyAdmins(
                        t("notifications.incomeCancelledTitle") || "Income Cancelled",
                        t("notifications.incomeCancelledMsg", { id }) || `Income #${id} has been cancelled.`,
                        'warning'
                    );
                }
                showToast(t("common.success"), isArchive ? (t("income.archiveSuccess") || "Archived") : (t("income.deleteSuccess") || "Deleted"), "success");
                loadIncomes();
            } catch (error) {
                console.error("Failed to delete/archive income", error);
                showToast(t("common.error"), isArchive ? (t("income.archiveError") || "Failed to archive") : (t("income.deleteError") || "Failed to delete"), "error");
            }
        }
    };

    const handleContest = async (id: number) => {
        const isConfirmed = await confirm({
            title: t("income.contestConfirmTitle") || "Contest Income?",
            message: t("income.contestConfirmMessage") || "Are you sure you want to contest this validated income? This will allow you to correct it.",
            type: "warning",
            confirmText: t("income.contest") || "Contest",
            cancelText: t("common.cancel") || "Cancel"
        });
        if (isConfirmed) {
            try {
                await incomeService.contest(id);
                await notifyAdmins(
                    t("notifications.incomeContestedTitle") || "Income Contested",
                    t("notifications.incomeContestedMsg", { id }) || `Income #${id} has been contested.`,
                    'warning'
                );
                showToast(t("common.success"), t("income.contestSuccess"), "success");
                loadIncomes();
            } catch (error) {
                console.error("Failed to contest income", error);
                showToast(t("common.error"), t("income.contestError"), "error");
            }
        }
    };

    const handlePrint = (income: NormalizedIncome) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${t("income.details")} - #${income.id}</title>
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
                        <div><h1>BraidHub</h1><p>${t("income.report")}</p></div>
                        <div style="text-align: right;"><h2>#${income.id}</h2><p>${income.date}</p></div>
                    </div>
                    <div class="details">
                        <p><strong>${t("common.client")}:</strong> ${income.clientName}</p>
                        <p><strong>${t("common.status")}:</strong> ${income.status}</p>
                        <table class="table">
                            <thead><tr><th>${t("common.service")}</th><th>${t("common.amount")}</th></tr></thead>
                            <tbody><tr><td>${income.serviceDisplay}</td><td>${symbol()}${income.amount}</td></tr></tbody>
                        </table>
                    </div>
                    <div class="footer">${t("income.thankYou")}</div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadInvoice = (income: NormalizedIncome) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(t("income.invoice").toUpperCase(), 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`${t("income.invoice")} #: INV-${income.id}`, 20, 40);
        doc.text(`${t("common.date")}: ${income.date}`, 20, 47);
        doc.text(t("income.billedTo").toUpperCase(), 20, 65);
        doc.text(income.clientName ?? '-', 20, 72);
        doc.line(20, 85, 190, 85);
        doc.text(t("common.description").toUpperCase(), 20, 95);
        doc.text("TOTAL", 170, 95);
        doc.text(income.serviceDisplay || t("income.salonServices"), 20, 105);
        doc.text(`${symbol()}${income.amount}`, 170, 105);
        doc.line(20, 115, 190, 115);
        doc.setFontSize(14);
        doc.text(`${t("income.totalDue")}: ${symbol()}${income.amount}`, 170, 125, { align: "right" });
        doc.save(`${t("income.invoice")}_${income.id}.pdf`);
    };

    const handleViewHistory = async (income: NormalizedIncome) => {
        try {
            const history = await incomeService.getHistory(income.id);
            const events = history.map(h => ({
                date: h.timestamp,
                action: t(`history.actions.${h.action}`, { defaultValue: h.action }),
                user: t(`history.users.${h.userCode}`, { defaultValue: h.userCode }),
                comment: h.comment
            }));

            setSelectedHistory({
                title: t('history.title', { id: income.id }),
                subtitle: `${t('common.client')} ${income.clientName} | ${t('common.service')} ${income.serviceDisplay}`,
                events
            });
            setHistoryModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch history", error);
            showToast(t('common.error'), t('common.historyFetchError', { defaultValue: "Failed to fetch interaction history" }), "error");
        }
    };

    const handleAddComment = async (id: number) => {
        const text = commentText[id];
        if (!text?.trim()) return;

        try {
            const userName = user?.name || "User";
            const userCode = user?.userCode || "ADM-000"; // Fallback to avoid error if missing

            // Call service to add comment
            await incomeService.addComment(id, text, userCode);

            // Update local state to show comment immediately
            setIncomes(prev => prev.map(inc => {
                if (inc.id === id) {
                    return {
                        ...inc,
                        comments: [...(inc.comments || []), {
                            id: Date.now(),
                            user: userName, // Keep displaying name locally
                            text: text,
                            timestamp: new Date()
                        }]
                    };
                }
                return inc;
            }));

            setCommentText(prev => ({ ...prev, [id]: "" }));
            // Notify Admins of new comment from User
            await notifyAdmins(
                t("notifications.commentAddedTitle") || "New Comment",
                t("notifications.commentAddedMsg", { id }) || `New comment on income #${id} by ${userName}.`,
                'info'
            );

            showToast(t('common.success'), t('common.commentAdded', { defaultValue: "Comment added successfully" }), "success");
        } catch (error) {
            console.error("Failed to add comment", error);
            showToast(t('common.error'), t('common.commentAddError', { defaultValue: "Failed to add comment" }), "error");
        }
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Income List - ${format(new Date(), 'yyyy-MM-dd')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #7c3aed; margin-bottom: 10px; }
                    .info { margin-bottom: 20px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #7c3aed; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; }
                    @media print {
                        button { display: none; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1>${t('income.management')}</h1>
                <div class="info">
                    <p><strong>${t('common.date')}:</strong> ${format(new Date(), 'PPP')}</p>
                    ${statusFilter !== 'all' ? `<p><strong>${t('common.status')}:</strong> ${statusFilter}</p>` : ''}
                    <p><strong>${t('common.total')}:</strong> ${filteredIncomes.length} records</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>${t('common.date')}</th>
                            <th>${t('common.client')}</th>
                            <th>${t('services.title')}</th>
                            <th>${t('common.amount')}</th>
                            <th>${t('common.status')}</th>
                            <th>${t('team.title')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredIncomes.map(income => `
                            <tr>
                                <td>#${income.id}</td>
                                <td>${format(new Date(income.date), 'PP')}</td>
                                <td>${income.clientName || '-'}</td>
                                <td>${income.serviceDisplay || '-'}</td>
                                <td>${symbol()}${income.amount}</td>
                                <td>${income.status}</td>
                                <td>${income.workerDisplay || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">${t('common.print')}</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">${t('common.close')}</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const handleExportList = () => {
        const headers = [
            'ID',
            t('common.date'),
            t('common.client'),
            t('services.title'),
            t('common.amount'),
            t('common.payment'),
            t('common.status'),
            t('team.title')
        ];

        const rows = filteredIncomes.map(income => [
            income.id,
            format(new Date(income.date), 'yyyy-MM-dd'),
            income.clientName || '',
            income.serviceDisplay || '',
            income.amount,
            income.paymentMethod || '',
            income.status,
            income.workerDisplay || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell =>
                typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');

        const BOM = '\uFEFF';

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/download';
        form.style.display = 'none';

        const filenameInput = document.createElement('input');
        filenameInput.type = 'hidden';
        filenameInput.name = 'filename';
        filenameInput.value = `incomes_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;

        const contentInput = document.createElement('input');
        contentInput.type = 'hidden';
        contentInput.name = 'content';
        contentInput.value = BOM + csvContent;

        form.appendChild(filenameInput);
        form.appendChild(contentInput);
        document.body.appendChild(form);

        form.submit();

        setTimeout(() => {
            document.body.removeChild(form);
        }, 100);

        showToast(t('common.success'), t('income.exportSuccess') || 'Exported successfully', 'success');
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <div className="flex flex-col gap-4 md:gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("income.management")}</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">{t("income.subtitle")}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Empty div to spacing if needed, or remove justify-between if we want right alignment only. 
                            Dashboard uses justify-between but puts title on left and controls on right. 
                            Here distinct divs for title and controls.
                         */}
                        <div></div>

                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            {/* View Toggle */}
                            {permissions.canViewFinancialDashboard && (
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-white text-[var(--color-primary)] rounded-lg shadow-sm border border-gray-100 uppercase tracking-widest"
                                    >
                                        <LayoutGrid size={16} />
                                        <span>{t("common.list") || "Liste"}</span>
                                    </button>
                                    <Link href="/income/dashboard">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                                        >
                                            <BarChart2 size={16} />
                                            <span>{t("common.analytics") || "Analytique"}</span>
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {/* Add Button */}
                            <ReadOnlyGuard>
                                <Link href="/income/add">
                                    <Button variant="primary" size="md" className="rounded-xl h-12 flex items-center gap-2 font-black shadow-lg shadow-[color:var(--color-primary)]/20 active:scale-95 transition-all">
                                        <Plus className="w-5 h-5" />
                                        <span>{t("income.addIncome")}</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
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
                                <span className={`text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full ${revenueGrowth >= 0 ? '' : 'text-red-100'}`}>
                                    {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">{t("income.totalIncome")}</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalIncome)}</h3>
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
                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">{t("income.secure")}</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">{t("income.validated")}</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(validatedIncome)}</h3>
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
                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">{t("common.pending")}</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">{t("income.pendingDraft")}</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(pendingIncome)}</h3>
                        </div>
                    </div>
                </div>

                {/* Table Actions Toolbar */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{t("income.list")}</h3>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`rounded-lg h-9 flex items-center justify-center gap-2 font-bold transition-all border-gray-200 ${showFilters ? 'bg-primary-light text-color-primary border-color-primary/30' : 'text-gray-600'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" />
                            <span>{t("common.filters")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex rounded-lg h-9 items-center justify-center gap-2 font-bold text-gray-600 border-gray-200"
                            onClick={handlePrintList}
                        >
                            <Printer className="w-4 h-4" />
                            <span>{t("common.print")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex rounded-lg h-9 items-center justify-center gap-2 font-bold text-gray-600 border-gray-200"
                            onClick={handleExportList}
                        >
                            <Download className="w-4 h-4" />
                            <span>{t("common.export")}</span>
                        </Button>
                    </div>
                </div>

                {/* Advanced Filter Panel - Moved below KPIs */}
                {showFilters && (
                    <div className="bg-white p-5 rounded-2xl shadow-lg border border-color-primary/30 animate-in fade-in slide-in-from-top-2 duration-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("common.client")} / {t("common.id")}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder={t("income.searchPlaceholder")}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("common.dateRange")}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("common.status")}</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                                >
                                    <option value="all">{t("common.allStatuses")}</option>
                                    <option value="Validated">Validated</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Refused">Refused</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("common.worker")}</label>
                                <select
                                    value={workerFilter}
                                    onChange={(e) => setWorkerFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                                >
                                    <option value="all">{t("common.allWorkers")}</option>
                                    {workers.map((w: SalonWorker) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("common.id")}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("common.date")}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("common.client")}</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("common.service")}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.amount")}</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.status")}</th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t("common.actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedIncomes.map((income) => (
                                    <React.Fragment key={income.id}>
                                        <tr
                                            className={`hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${expandedRows.includes(income.id) ? 'bg-primary-light border-color-primary shadow-md transform scale-[1.005]' : 'border-transparent'}`}
                                            onClick={() => router.push(`/income/${income.id}`)}
                                        >
                                            <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">#{income.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.date}</td>
                                            <td className="px-4 py-4 font-medium">{income.clientName}</td>
                                            <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-600 truncate max-w-[150px]">{income.serviceDisplay}</td>
                                            <td className="px-4 py-4 text-right font-bold text-gray-900">{formatCurrency(income.amount)}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${income.status === 'Validated' ? 'bg-green-100 text-green-700' :
                                                        income.status === 'Draft' ? 'bg-blue-100 text-blue-700' :
                                                            income.status === 'Refused' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {income.status === 'Refused' ? t("common.refused") || "Refused" : income.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-4 text-center">
                                                <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                                                    {/* Desktop Actions - 6 Actions */}
                                                    <button
                                                        onClick={() => toggleRow(income.id)}
                                                        className="p-2 hover:bg-white rounded-lg hover:text-color-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
                                                        title={t("common.comments")}
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>

                                                    {permissions.income(income, "edit") && (
                                                        <Link href={`/income/add?edit=${income.id}`}>
                                                            <ReadOnlyGuard>
                                                                <button className="p-2 hover:bg-white rounded-lg hover:text-color-primary transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.edit")}><Pencil size={16} /></button>
                                                            </ReadOnlyGuard>
                                                        </Link>
                                                    )}

                                                    {permissions.income(income, "validate") && (
                                                        <ReadOnlyGuard>
                                                            <button onClick={() => handleValidate(income.id)} className="p-2 hover:bg-white rounded-lg text-green-600 hover:text-green-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.validate")}><Check size={16} /></button>
                                                        </ReadOnlyGuard>
                                                    )}

                                                    {/* Worker Submit Action for Drafts */}
                                                    {income.status === 'Draft' && user?.role === 'worker' && isWorker && !isManager && (
                                                        <ReadOnlyGuard>
                                                            <button onClick={() => handleSubmit(income.id)} className="p-2 hover:bg-white rounded-lg text-blue-600 hover:text-blue-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.submit")}><Send size={16} /></button>
                                                        </ReadOnlyGuard>
                                                    )}

                                                    {permissions.income(income, "contest",
                                                        income.createdBy === user?.name || (income.workerIds || []).some((id: number) => String(id) === String(auth.getWorkerId()))
                                                    ) && (
                                                            <ReadOnlyGuard>
                                                                <button onClick={() => handleContest(income.id)} className="p-2 hover:bg-white rounded-lg text-orange-600 hover:text-orange-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("income.contest")}><X size={16} /></button>
                                                            </ReadOnlyGuard>
                                                        )}

                                                    {permissions.income(income, "view_invoice") && (
                                                        <button
                                                            onClick={() => handleDownloadInvoice(income)}
                                                            className="p-2 hover:bg-white rounded-lg text-blue-600 hover:text-blue-800 transition-all shadow-sm border border-transparent hover:border-gray-100"
                                                            title={t("income.invoice")}
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleViewHistory(income)} className="p-2 hover:bg-white rounded-lg text-color-primary hover:text-color-primary transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.history")}><History size={16} /></button>

                                                    {/* Status-based delete/archive */}
                                                    {(income.status === 'Draft' || income.status === 'Pending') && permissions.income(income, "delete") && (
                                                        <ReadOnlyGuard>
                                                            <button onClick={() => handleDelete(income.id, income.status)} className="p-2 hover:bg-white rounded-lg text-red-600 hover:text-red-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.delete")}><Trash2 size={16} /></button>
                                                        </ReadOnlyGuard>
                                                    )}
                                                    {income.status === 'Validated' && permissions.income(income, "delete") && (
                                                        <ReadOnlyGuard>
                                                            <button onClick={() => handleDelete(income.id, income.status)} className="p-2 hover:bg-white rounded-lg text-orange-600 hover:text-orange-800 transition-all shadow-sm border border-transparent hover:border-gray-100" title={t("common.archive")}><Archive size={16} /></button>
                                                        </ReadOnlyGuard>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows.includes(income.id) && (
                                            <tr className="bg-gray-50/80">
                                                <td colSpan={7} className="px-4 md:px-12 py-6">
                                                    <div className="flex flex-col gap-6">
                                                        {/* Actions Bar for Mobile/Expanded - 6 Actions */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden gap-2">
                                                            {permissions.income(income, "edit") && (
                                                                <Link href={`/income/add?edit=${income.id}`} className="w-full">
                                                                    <ReadOnlyGuard>
                                                                        <Button variant="outline" size="sm" className="w-full justify-center gap-2 h-11 rounded-xl bg-white shadow-sm">
                                                                            <Pencil size={18} /> {t("common.edit")}
                                                                        </Button>
                                                                    </ReadOnlyGuard>
                                                                </Link>
                                                            )}
                                                            {permissions.income(income, "validate") && (
                                                                <ReadOnlyGuard>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-green-600 border-green-100"
                                                                        onClick={() => handleValidate(income.id)}
                                                                    >
                                                                        <Check size={18} /> {t("income.validated")}
                                                                    </Button>
                                                                </ReadOnlyGuard>
                                                            )}
                                                            {/* Worker Submit Action for Drafts (Mobile) */}
                                                            {income.status === 'Draft' && user?.role === 'worker' && isWorker && !isManager && (
                                                                <ReadOnlyGuard>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-blue-600 border-blue-100"
                                                                        onClick={() => handleSubmit(income.id)}
                                                                    >
                                                                        <Send size={18} /> {t("common.submit")}
                                                                    </Button>
                                                                </ReadOnlyGuard>
                                                            )}
                                                            {permissions.income(income, "contest",
                                                                income.createdBy === user?.name || (income.workerIds || []).some((id: number) => String(id) === String(auth.getWorkerId()))
                                                            ) && (
                                                                    <ReadOnlyGuard>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-orange-600 border-orange-100"
                                                                            onClick={() => handleContest(income.id)}
                                                                        >
                                                                            <X size={18} /> {t("income.contest")}
                                                                        </Button>
                                                                    </ReadOnlyGuard>
                                                                )}
                                                            {permissions.income(income, "view_invoice") && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-blue-600 border-blue-100"
                                                                    onClick={() => handleDownloadInvoice(income)}
                                                                >
                                                                    <FileText size={18} /> {t("income.invoice")}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-color-primary border-color-primary/30"
                                                                onClick={() => handleViewHistory(income)}
                                                            >
                                                                <History size={18} /> {t("common.history")}
                                                            </Button>
                                                            {/* Status-based delete/archive */}
                                                            {(income.status === 'Draft' || income.status === 'Pending') && permissions.income(income, "delete") && (
                                                                <ReadOnlyGuard>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-red-600 border-red-100"
                                                                        onClick={() => handleDelete(income.id, income.status)}
                                                                    >
                                                                        <Trash2 size={18} /> {t("common.delete")}
                                                                    </Button>
                                                                </ReadOnlyGuard>
                                                            )}
                                                            {income.status === 'Validated' && permissions.income(income, "delete") && (
                                                                <ReadOnlyGuard>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="justify-center gap-2 h-11 rounded-xl bg-white shadow-sm text-orange-600 border-orange-100"
                                                                        onClick={() => handleDelete(income.id, income.status)}
                                                                    >
                                                                        <Archive size={18} /> {t("common.archive")}
                                                                    </Button>
                                                                </ReadOnlyGuard>
                                                            )}
                                                        </div>

                                                        {/* Comments Section */}
                                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                                                            <div className="bg-gradient-to-r from-primary to-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                                    <MessageSquare size={16} className="text-[var(--color-primary)]" /> {t("common.comments")}
                                                                </h4>
                                                                <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-1 rounded-full uppercase tracking-wider">
                                                                    {income.comments?.length || 0} notes
                                                                </span>
                                                            </div>

                                                            <div className="p-6">
                                                                <div className="space-y-4 mb-6">
                                                                    {(income.notes || (income.comments && income.comments.length > 0)) ? (
                                                                        <div className="space-y-4">
                                                                            {income.notes && (
                                                                                <div className="p-4 bg-primary-light rounded-2xl border border-color-primary/30 text-color-primary text-sm whitespace-pre-wrap font-medium">
                                                                                    <div className="flex items-center gap-2 mb-2 text-color-primary font-bold uppercase text-[10px] tracking-wider">
                                                                                        <MessageSquare size={12} /> {t("common.notes")}
                                                                                    </div>
                                                                                    {income.notes}
                                                                                </div>
                                                                            )}

                                                                            {income.comments && income.comments.length > 0 && income.comments.map((c: BookingComment, i: number) => (
                                                                                <div key={i} className="flex gap-4">
                                                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm shrink-0 shadow-sm border border-color-primary/30">
                                                                                        {c.user.charAt(0)}
                                                                                    </div>
                                                                                    <div className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm border border-gray-100 hover:border-[var(--color-primary-light)] transition-colors group">
                                                                                        <div className="flex justify-between items-center mb-2">
                                                                                            <span className="font-bold text-gray-900">{c.user}</span>
                                                                                            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                                                                                <Clock size={10} /> {c.timestamp instanceof Date ? c.timestamp.toLocaleString() : String(c.timestamp)}
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className="text-gray-600 italic leading-relaxed">"{c.text}"</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-8 text-gray-400 italic text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                                            {t("common.noComments")}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col md:flex-row gap-3 bg-[var(--color-primary-light)]/30 p-4 rounded-2xl border border-dashed border-[var(--color-primary-light)]">
                                                                    <input
                                                                        type="text"
                                                                        className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-4 py-3 h-12 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all shadow-sm"
                                                                        placeholder={t("common.addNotePlaceholder")}
                                                                        value={commentText[income.id] || ""}
                                                                        onChange={e => setCommentText(prev => ({ ...prev, [income.id]: e.target.value }))}
                                                                        onKeyDown={e => e.key === 'Enter' && handleAddComment(income.id)}
                                                                    />
                                                                    <Button
                                                                        size="md"
                                                                        className="h-12 px-8 rounded-xl font-bold bg-[var(--color-primary)] hover:opacity-90 transition-all shadow-lg shadow-[color:var(--color-primary)]/20 active:scale-95"
                                                                        onClick={() => handleAddComment(income.id)}
                                                                    >
                                                                        {t("common.post")}
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
                            <span className="text-sm font-semibold text-gray-700">{t("common.pageOf", { current: currentPage, total: totalPages })}</span>
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
                    title={t("history.title", { id: "" }).replace(" #", "")}
                    itemTitle={selectedHistory.title}
                    itemSubtitle={selectedHistory.subtitle}
                    events={selectedHistory.events}
                />
            </div >
        </MainLayout >
    );
}
