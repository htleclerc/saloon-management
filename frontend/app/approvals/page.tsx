"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { Check, X, Clock, DollarSign, Receipt, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { incomeService } from "@/lib/services/IncomeService";
import { expenseService } from "@/lib/services/ExpenseService";
import { Income, Expense } from "@/types";
import { useTranslation } from "@/i18n";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

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
    const { getCardStyle } = useKpiCardStyle();
    const { canModify, user } = useAuth();
    const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses" | "history">("incomes");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [pendingIncomes, setPendingIncomes] = useState<Income[]>([]);
    const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
    const [historyItems, setHistoryItems] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const salonId = 1; // context?

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch Pending Incomes
            const incomes = await incomeService.getAll(salonId, { status: 'Pending' });
            setPendingIncomes(incomes);

            // Fetch Pending Expenses
            const expenses = await expenseService.getAll(salonId, { status: 'Pending' });
            setPendingExpenses(expenses);

            // Fetch History (All non-pending)
            // Ideally we should have better filtering/pagination for history
            const allIncomes = await incomeService.getAll(salonId);
            const allExpenses = await expenseService.getAll(salonId);

            const processedHistory: ApprovalItem[] = [
                ...allIncomes
                    .filter(i => i.status !== 'Pending')
                    .map(i => ({
                        id: i.id,
                        type: 'income' as const,
                        date: i.date,
                        description: `${i.clientName || 'Client'} - ${t('approvals.table.income')}`,
                        amount: i.finalAmount,
                        submittedBy: i.createdBy,
                        status: i.status || 'Unknown',
                        data: i
                    })),
                ...allExpenses
                    .filter(e => e.status !== 'Pending')
                    .map(e => ({
                        id: e.id,
                        type: 'expense' as const,
                        date: e.date,
                        description: e.description || `Category ${e.categoryId}`,
                        amount: e.amount,
                        submittedBy: e.createdBy,
                        status: e.status,
                        data: e
                    }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistoryItems(processedHistory);
        } catch (error) {
            console.error("Failed to load approval data", error);
        } finally {
            setIsLoading(false);
        }
    }, [salonId, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (id: number, type: "income" | "expense") => {
        try {
            if (type === 'income') {
                await incomeService.validate(id);
            } else {
                await expenseService.approve(id);
            }
            loadData();
        } catch (error) {
            console.error(`Failed to approve ${type} #${id}`, error);
        }
    };

    const handleReject = async (id: number, type: "income" | "expense") => {
        // Simple reject without reason for now
        try {
            if (type === 'income') {
                await incomeService.refuse(id, "Rejected by admin");
            } else {
                await expenseService.reject(id);
            }
            loadData();
        } catch (error) {
            console.error(`Failed to reject ${type} #${id}`, error);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedTab === 'history') return;

        const type = selectedTab === 'incomes' ? 'income' : 'expense';
        for (const id of selectedItems) {
            await handleApprove(id, type);
        }
        setSelectedItems([]);
    };

    const handleBulkReject = async () => {
        if (selectedTab === 'history') return;

        const type = selectedTab === 'incomes' ? 'income' : 'expense';
        for (const id of selectedItems) {
            await handleReject(id, type);
        }
        setSelectedItems([]);
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'dd MMM yyyy', { locale: language === 'fr' ? fr : enUS });
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
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
                                    Total: €{pendingIncomes.reduce((sum, r) => sum + r.finalAmount, 0)}
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
                                    Total: €{pendingExpenses.reduce((sum, e) => sum + e.amount, 0)}
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
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.pendingIncomes')} ({pendingIncomes.length})
                    </button>
                    <button
                        onClick={() => { setSelectedTab("expenses"); setSelectedItems([]); }}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "expenses"
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.pendingExpenses')} ({pendingExpenses.length})
                    </button>
                    <button
                        onClick={() => { setSelectedTab("history"); setSelectedItems([]); }}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "history"
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t('approvals.history')}
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && selectedTab !== "history" && (
                    <Card gradient="bg-gradient-to-r from-purple-50 to-pink-50">
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

                {/* Pending Incomes Table */}
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
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {/* In a real app, resolve worker name via ID */}
                                                    {income.updatedBy || 'Worker'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.clientName || 'Unknown'}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">Service</td>
                                            <td className="px-4 py-4 text-right font-semibold text-purple-600">€{income.finalAmount}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.createdBy}</td>
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
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                {t('common.noData', { defaultValue: 'No pending incomes' })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Pending Expenses Table */}
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
                                                    if (e.target.checked) setSelectedItems(pendingExpenses.map(e => e.id));
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
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                    {expense.categoryId} {/* TODO: Map to category name */}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.description}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-pink-600">€{expense.amount}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Salon {expense.salonId}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.createdBy}</td>
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
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                {t('common.noData', { defaultValue: 'No pending expenses' })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* History Table */}
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "income" ? "bg-purple-100 text-purple-800" : "bg-pink-100 text-pink-800"
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{formatDate(item.date)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">€{item.amount}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.data.updatedBy || 'System'}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Validated' || item.status === 'Approved'
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                {t('common.noData', { defaultValue: 'No history' })}
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
