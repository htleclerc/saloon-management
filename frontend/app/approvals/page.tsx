"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { Check, X, Clock, DollarSign, Receipt, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { incomeService, expenseService, workerService, serviceService } from "@/lib/services";
import { Income, Expense, SalonWorker, Service, ExpenseCategory } from "@/types";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { format } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

interface ApprovalItem {
    id: number;
    type: 'income' | 'expense';
    date: string;
    description: string;
    amount: number;
    submittedBy: string;
    status: string;
    data: Income | Expense;
}

export default function ApprovalsPage() {
    const { t, language } = useTranslation();
    const { format: formatCurrency } = useCurrency();
    const { getCardStyle } = useKpiCardStyle();
    const auth = useAuth();
    const { activeSalonId, user } = auth;
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses" | "history">("incomes");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [pendingIncomes, setPendingIncomes] = useState<Income[]>([]);
    const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
    const [historyItems, setHistoryItems] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Reference data for name resolution
    const [workers, setWorkers] = useState<SalonWorker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);

    const salonId = Number(activeSalonId);

    const loadData = useCallback(async () => {
        if (!activeSalonId || isNaN(salonId)) {
            console.warn("ApprovalsPage: invalid activeSalonId:", activeSalonId);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch all data in parallel (with individual error handling)
            const [
                incomesData,
                expensesData,
                workersData,
                servicesData,
                categoriesData,
                allIncomes,
                archivedExpenses
            ] = await Promise.all([
                incomeService.getAll(salonId, { status: 'Pending' }).catch(() => [] as Income[]),
                expenseService.getAll(salonId, { status: 'Pending' }).catch(() => [] as Expense[]),
                workerService.getAll(salonId).catch(() => [] as SalonWorker[]),
                serviceService.getAll(salonId).catch(() => [] as Service[]),
                expenseService.getCategories(salonId).catch(() => [] as ExpenseCategory[]),
                incomeService.getAll(salonId).catch(() => [] as Income[]),
                expenseService.getArchived(salonId).catch(() => [] as Expense[]),
            ]);

            setPendingIncomes(incomesData);
            setPendingExpenses(expensesData);
            setWorkers(workersData);
            setServices(servicesData);
            setCategories(categoriesData);

            // Build history from processed incomes + archived expenses
            const processedHistory: ApprovalItem[] = [
                ...allIncomes
                    .filter(i => i.status !== 'Pending' && i.status !== 'Draft')
                    .map(i => ({
                        id: i.id,
                        type: 'income' as const,
                        date: i.date,
                        description: `${i.clientName || t('common.client')} — ${(i.serviceIds || []).map((sid: number) => servicesData.find(s => s.id === sid)?.name).filter(Boolean).join(', ') || t('common.service')}`,
                        amount: i.finalAmount,
                        submittedBy: i.createdBy,
                        status: i.status || 'Unknown',
                        data: i
                    })),
                ...archivedExpenses
                    .map(e => ({
                        id: e.id,
                        type: 'expense' as const,
                        date: e.date,
                        description: `${categoriesData.find(c => c.id === e.categoryId)?.name || t('common.category')} — ${e.description || ''}`,
                        amount: e.amount,
                        submittedBy: e.updatedBy || e.createdBy,
                        status: 'Approved' as const,
                        data: e
                    }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistoryItems(processedHistory);
        } catch (error) {
            console.error("Failed to load approval data", error);
            showToast(t("common.error"), t("common.loadError") || "Failed to load data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [salonId, activeSalonId, t, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Action Handlers ────────────────────────────────────

    const handleApprove = async (id: number, type: "income" | "expense") => {
        const isConfirmed = await confirm({
            title: t('approvals.confirmApproveTitle') || "Approve?",
            message: type === 'income'
                ? (t('approvals.confirmApproveIncome') || "Are you sure you want to validate this income?")
                : (t('approvals.confirmApproveExpense') || "Are you sure you want to approve this expense?"),
            type: "success",
            confirmText: t('approvals.approve') || "Approve",
            cancelText: t('common.cancel') || "Cancel"
        });

        if (!isConfirmed) return;

        try {
            if (type === 'income') {
                await incomeService.validate(id);
            } else {
                await expenseService.approve(id);
            }
            showToast(
                t("common.success"),
                type === 'income'
                    ? (t('approvals.incomeApproved') || "Income validated successfully")
                    : (t('approvals.expenseApproved') || "Expense approved successfully"),
                "success"
            );
            loadData();
        } catch (error) {
            console.error(`Failed to approve ${type} #${id}`, error);
            showToast(t("common.error"), t("common.actionError") || "Action failed", "error");
        }
    };

    const handleReject = async (id: number, type: "income" | "expense") => {
        const isConfirmed = await confirm({
            title: t('approvals.confirmRejectTitle') || "Reject?",
            message: type === 'income'
                ? (t('approvals.confirmRejectIncome') || "Are you sure you want to refuse this income?")
                : (t('approvals.confirmRejectExpense') || "Are you sure you want to reject this expense?"),
            type: "error",
            confirmText: t('approvals.reject') || "Reject",
            cancelText: t('common.cancel') || "Cancel"
        });

        if (!isConfirmed) return;

        try {
            if (type === 'income') {
                await incomeService.refuse(id, "Rejected by admin");
            } else {
                await expenseService.reject(id);
            }
            showToast(
                t("common.success"),
                type === 'income'
                    ? (t('approvals.incomeRejected') || "Income refused successfully")
                    : (t('approvals.expenseRejected') || "Expense rejected successfully"),
                "success"
            );
            loadData();
        } catch (error) {
            console.error(`Failed to reject ${type} #${id}`, error);
            showToast(t("common.error"), t("common.actionError") || "Action failed", "error");
        }
    };

    const handleBulkApprove = async () => {
        if (selectedTab === 'history') return;

        const isConfirmed = await confirm({
            title: t('approvals.confirmBulkApproveTitle') || "Bulk Approve?",
            message: t('approvals.confirmBulkApprove', { count: selectedItems.length }) || `Approve ${selectedItems.length} item(s)?`,
            type: "success",
            confirmText: t('approvals.approveSelected') || "Approve Selected",
            cancelText: t('common.cancel') || "Cancel"
        });

        if (!isConfirmed) return;

        const type = selectedTab === 'incomes' ? 'income' : 'expense';
        let successCount = 0;

        for (const id of selectedItems) {
            try {
                if (type === 'income') {
                    await incomeService.validate(id);
                } else {
                    await expenseService.approve(id);
                }
                successCount++;
            } catch (error) {
                console.error(`Failed to approve ${type} #${id}`, error);
            }
        }

        showToast(
            t("common.success"),
            t('approvals.bulkApproveSuccess', { count: successCount }) || `${successCount} item(s) approved`,
            "success"
        );
        setSelectedItems([]);
        loadData();
    };

    const handleBulkReject = async () => {
        if (selectedTab === 'history') return;

        const isConfirmed = await confirm({
            title: t('approvals.confirmBulkRejectTitle') || "Bulk Reject?",
            message: t('approvals.confirmBulkReject', { count: selectedItems.length }) || `Reject ${selectedItems.length} item(s)?`,
            type: "error",
            confirmText: t('approvals.rejectSelected') || "Reject Selected",
            cancelText: t('common.cancel') || "Cancel"
        });

        if (!isConfirmed) return;

        const type = selectedTab === 'incomes' ? 'income' : 'expense';
        let successCount = 0;

        for (const id of selectedItems) {
            try {
                if (type === 'income') {
                    await incomeService.refuse(id, "Bulk rejected by admin");
                } else {
                    await expenseService.reject(id);
                }
                successCount++;
            } catch (error) {
                console.error(`Failed to reject ${type} #${id}`, error);
            }
        }

        showToast(
            t("common.success"),
            t('approvals.bulkRejectSuccess', { count: successCount }) || `${successCount} item(s) rejected`,
            "success"
        );
        setSelectedItems([]);
        loadData();
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // ─── Helpers ─────────────────────────────────────────────

    const getDateLocale = () => {
        if (language === 'fr') return fr;
        if (language === 'es') return es;
        return enUS;
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'dd MMM yyyy', { locale: getDateLocale() });
        } catch {
            return dateStr;
        }
    };

    const resolveWorkerNames = (income: Income): string => {
        const names = (income.workerIds || [])
            .map((id: number) => workers.find(w => w.id === id)?.name)
            .filter(Boolean);
        return names.length > 0 ? names.join(', ') : (income.updatedBy || t('common.unassigned') || 'Unassigned');
    };

    const resolveServiceNames = (income: Income): string => {
        const names = (income.serviceIds || [])
            .map((id: number) => services.find(s => s.id === id)?.name)
            .filter(Boolean);
        return names.length > 0 ? names.join(', ') : '-';
    };

    const resolveCategoryName = (categoryId: number): string => {
        return categories.find(c => c.id === categoryId)?.name || `#${categoryId}`;
    };

    const currentSalonName = user?.tenants?.find(t => t.id === String(salonId))?.name
        || user?.tenants?.[0]?.name
        || 'Salon';

    // ─── Loading State ──────────────────────────────────────

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <RefreshCw className="w-8 h-8 animate-spin text-color-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('approvals.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('approvals.subtitle')}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">{t('approvals.pendingIncomes')}</p>
                                <h3 className="text-4xl font-bold">{pendingIncomes.length}</h3>
                                <p className="text-sm opacity-80 mt-1">
                                    Total: {formatCurrency(pendingIncomes.reduce((sum, r) => sum + (r.finalAmount || r.amount || 0), 0))}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">{t('approvals.pendingExpenses')}</p>
                                <h3 className="text-4xl font-bold">{pendingExpenses.length}</h3>
                                <p className="text-sm opacity-80 mt-1">
                                    Total: {formatCurrency(pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                <Receipt className="w-8 h-8" />
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">{t('approvals.awaitingAction')}</p>
                                <h3 className="text-4xl font-bold">{pendingIncomes.length + pendingExpenses.length}</h3>
                                <p className="text-sm opacity-80 mt-1">{t('approvals.totalItems')}</p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-8 h-8" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => { setSelectedTab("incomes"); setSelectedItems([]); }}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "incomes"
                            ? "border-b-2 border-color-primary text-color-primary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.pendingIncomes')} ({pendingIncomes.length})
                    </button>
                    <button
                        onClick={() => { setSelectedTab("expenses"); setSelectedItems([]); }}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "expenses"
                            ? "border-b-2 border-color-primary text-color-primary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.pendingExpenses')} ({pendingExpenses.length})
                    </button>
                    <button
                        onClick={() => { setSelectedTab("history"); setSelectedItems([]); }}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "history"
                            ? "border-b-2 border-color-primary text-color-primary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.history')}
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && selectedTab !== "history" && (
                    <Card gradient="bg-gradient-primary">
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                                {t('approvals.selected', { count: selectedItems.length })}
                            </p>
                            <div className="flex gap-3">
                                <ReadOnlyGuard>
                                    <Button variant="primary" size="md" onClick={handleBulkApprove}>
                                        <Check className="w-5 h-5" />
                                        {t('approvals.approveSelected')}
                                    </Button>
                                </ReadOnlyGuard>
                                <ReadOnlyGuard>
                                    <Button variant="danger" size="md" onClick={handleBulkReject}>
                                        <X className="w-5 h-5" />
                                        {t('approvals.rejectSelected')}
                                    </Button>
                                </ReadOnlyGuard>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ─── Pending Incomes Table ─── */}
                {selectedTab === "incomes" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('approvals.pendingIncomes')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input type="checkbox" className="rounded"
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedItems(pendingIncomes.map(i => i.id));
                                                    else setSelectedItems([]);
                                                }}
                                                checked={selectedItems.length === pendingIncomes.length && pendingIncomes.length > 0}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.date')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.worker')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.client')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.service')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.amount')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.submittedBy')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingIncomes.map((income) => (
                                        <tr key={income.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedItems.includes(income.id)}
                                                    onChange={() => toggleItemSelection(income.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{formatDate(income.date)}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-color-primary">
                                                    {resolveWorkerNames(income)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.clientName || t('common.unknown') || 'Unknown'}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{resolveServiceNames(income)}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-color-primary">{formatCurrency(income.finalAmount || income.amount || 0)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.createdBy || '-'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <ReadOnlyGuard>
                                                        <Button variant="primary" size="sm" onClick={() => handleApprove(income.id, "income")}>
                                                            <Check className="w-4 h-4" />
                                                            {t('approvals.approve')}
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                    <ReadOnlyGuard>
                                                        <Button variant="danger" size="sm" onClick={() => handleReject(income.id, "income")}>
                                                            <X className="w-4 h-4" />
                                                            {t('approvals.reject')}
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingIncomes.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Check className="w-10 h-10" />
                                                    <p className="text-sm font-medium">{t('approvals.noIncomes') || 'No pending incomes'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* ─── Pending Expenses Table ─── */}
                {selectedTab === "expenses" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('approvals.pendingExpenses')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input type="checkbox" className="rounded"
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedItems(pendingExpenses.map(exp => exp.id));
                                                    else setSelectedItems([]);
                                                }}
                                                checked={selectedItems.length === pendingExpenses.length && pendingExpenses.length > 0}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.date')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.category')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.description')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.amount')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.salon')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.submittedBy')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedItems.includes(expense.id)}
                                                    onChange={() => toggleItemSelection(expense.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{formatDate(expense.date)}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-light text-color-secondary">
                                                    {resolveCategoryName(expense.categoryId)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.description || '-'}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-color-secondary">{formatCurrency(expense.amount || 0)}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {currentSalonName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.createdBy || '-'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <ReadOnlyGuard>
                                                        <Button variant="primary" size="sm" onClick={() => handleApprove(expense.id, "expense")}>
                                                            <Check className="w-4 h-4" />
                                                            {t('approvals.approve')}
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                    <ReadOnlyGuard>
                                                        <Button variant="danger" size="sm" onClick={() => handleReject(expense.id, "expense")}>
                                                            <X className="w-4 h-4" />
                                                            {t('approvals.reject')}
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Check className="w-10 h-10" />
                                                    <p className="text-sm font-medium">{t('approvals.noExpenses') || 'No pending expenses'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* ─── History Table ─── */}
                {selectedTab === "history" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">{t('approvals.history')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.type')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.date')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.description')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.amount')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.approvedBy')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('approvals.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {historyItems.map((item) => (
                                        <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "income" ? "bg-primary-light text-color-primary" : "bg-secondary-light text-color-secondary"
                                                    }`}>
                                                    {item.type === 'income' ? t('approvals.table.income') || 'Income' : t('approvals.table.expense') || 'Expense'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{formatDate(item.date)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.amount || 0)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.data.updatedBy || 'System'}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Validated' || item.status === 'Approved'
                                                    ? "bg-green-100 text-green-800"
                                                    : item.status === 'Refused' || item.status === 'Rejected'
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Clock className="w-10 h-10" />
                                                    <p className="text-sm font-medium">{t('approvals.noHistory') || 'No history yet'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
