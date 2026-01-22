"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { Check, X, Eye, Clock, DollarSign, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const pendingIncomes = [
    { id: 1, date: "2026-01-13", worker: "Orphelia", client: "Marie Dubois", service: "Box Braids", amount: 120, submittedBy: "Orphelia", status: "Pending" },
    { id: 2, date: "2026-01-12", worker: "Worker 2", client: "Jean Martin", service: "Cornrows", amount: 85, submittedBy: "Worker 2", status: "Pending" },
    { id: 3, date: "2026-01-12", worker: "Orphelia", client: "Sophie Laurent", service: "Twists", amount: 95, submittedBy: "Orphelia", status: "Pending" },
];

const pendingExpenses = [
    { id: 1, date: "2026-01-13", category: "Beauty Supply", description: "Hair extensions and products", amount: 350, submittedBy: "Orphelia", salon: "Salon 1", status: "Pending" },
    { id: 2, date: "2026-01-12", category: "Office Cleaning", description: "Weekly cleaning service", amount: 75, submittedBy: "Worker 2", salon: "Salon 1", status: "Pending" },
    { id: 3, date: "2026-01-11", category: "Internet", description: "Monthly internet bill", amount: 150, submittedBy: "Admin", salon: "Salon 1 & 2", status: "Pending" },
];

const approvedItems = [
    { id: 1, type: "Income", date: "2026-01-10", description: "Box Braids - Thomas Petit", amount: 120, approvedBy: "Admin", approvedDate: "2026-01-11" },
    { id: 2, type: "Expense", date: "2026-01-09", description: "Electricity - Monthly bill", amount: 420, approvedBy: "Admin", approvedDate: "2026-01-10" },
    { id: 3, type: "Income", date: "2026-01-09", description: "Goddess Braids - Isabelle Moreau", amount: 130, approvedBy: "Admin", approvedDate: "2026-01-10" },
];

export default function ApprovalsPage() {
    const { getCardStyle } = useKpiCardStyle();
    const { canModify } = useAuth();
    const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses" | "history">("incomes");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleApprove = (id: number, type: "income" | "expense") => {
        console.log(`Approving ${type} #${id}`);
        // TODO: API call to approve item
    };

    const handleReject = (id: number, type: "income" | "expense") => {
        console.log(`Rejecting ${type} #${id}`);
        // TODO: API call to reject  item
    };

    const handleBulkApprove = () => {
        console.log("Bulk approving:", selectedItems);
        // TODO: API call to bulk approve
    };

    const handleBulkReject = () => {
        console.log("Bulk rejecting:", selectedItems);
        // TODO: API call to bulk reject
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Approvals Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review and approve pending incomes and expenses</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Pending Incomes</p>
                                <h3 className="text-4xl font-bold">{pendingIncomes.length}</h3>
                                <p className="text-sm opacity-80 mt-1">
                                    Total: €{pendingIncomes.reduce((sum, r) => sum + r.amount, 0)}
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
                                <p className="text-sm opacity-90 mb-1">Pending Expenses</p>
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
                                <p className="text-sm opacity-90 mb-1">Awaiting Action</p>
                                <h3 className="text-4xl font-bold">{pendingIncomes.length + pendingExpenses.length}</h3>
                                <p className="text-sm opacity-80 mt-1">Total items</p>
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
                        onClick={() => setSelectedTab("incomes")}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "incomes"
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Pending Incomes ({pendingIncomes.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab("expenses")}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "expenses"
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Pending Expenses ({pendingExpenses.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab("history")}
                        className={`px-4 py-2 font-medium transition-colors ${selectedTab === "history"
                            ? "border-b-2 border-purple-600 text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        History
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && selectedTab !== "history" && (
                    <Card gradient="bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                            </p>
                            <div className="flex gap-3">
                                <ReadOnlyGuard>
                                    <Button variant="primary" size="md" onClick={handleBulkApprove}>
                                        <Check className="w-5 h-5" />
                                        Approve Selected
                                    </Button>
                                </ReadOnlyGuard>
                                <ReadOnlyGuard>
                                    <Button variant="danger" size="md" onClick={handleBulkReject}>
                                        <X className="w-5 h-5" />
                                        Reject Selected
                                    </Button>
                                </ReadOnlyGuard>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Pending Incomes Table */}
                {selectedTab === "incomes" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Pending Incomes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitted By</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.date}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {income.worker}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.client}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.service}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-purple-600">€{income.amount}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.submittedBy}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <ReadOnlyGuard>
                                                        <Button variant="primary" size="sm" onClick={() => handleApprove(income.id, "income")}>
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                    <ReadOnlyGuard>
                                                        <Button variant="danger" size="sm" onClick={() => handleReject(income.id, "income")}>
                                                            <X className="w-4 h-4" />
                                                            Reject
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Pending Expenses Table */}
                {selectedTab === "expenses" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Pending Expenses</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Salon</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitted By</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.date}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.description}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-pink-600">€{expense.amount}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {expense.salon}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.submittedBy}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <ReadOnlyGuard>
                                                        <Button variant="primary" size="sm" onClick={() => handleApprove(expense.id, "expense")}>
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                    <ReadOnlyGuard>
                                                        <Button variant="danger" size="sm" onClick={() => handleReject(expense.id, "expense")}>
                                                            <X className="w-4 h-4" />
                                                            Reject
                                                        </Button>
                                                    </ReadOnlyGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* History Table */}
                {selectedTab === "history" && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Approval History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Approved By</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Approved Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {approvedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "Income" ? "bg-purple-100 text-purple-800" : "bg-pink-100 text-pink-800"
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.date}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">€{item.amount}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.approvedBy}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{item.approvedDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
