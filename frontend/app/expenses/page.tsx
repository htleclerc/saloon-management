"use client";

import { useState, useMemo, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import Link from "next/link";
import { Plus, Download, FileText, Trash2, Edit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { exportToCSV, exportToPDF, ExportColumn } from "@/lib/export";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth, UserRole } from "@/context/AuthProvider";
import { canPerformExpenseAction } from "@/lib/permissions";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { expenseService } from "@/lib/services";

// Export columns configuration
const expenseExportColumns: ExportColumn[] = [
    { key: "id", header: "ID" },
    { key: "date", header: "Date" },
    { key: "categoryName", header: "Category" },
    { key: "description", header: "Description" },
    { key: "salonId", header: "Salon" },
    { key: "amount", header: "Amount", formatter: (v) => `€${v}` },
];

export default function ExpensesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const { getCardStyle } = useKpiCardStyle();
    const { user } = useAuth();

    const canAdd = canPerformExpenseAction("add", user?.role as UserRole);
    const canEdit = canPerformExpenseAction("edit", user?.role as UserRole);
    const canDelete = canPerformExpenseAction("delete", user?.role as UserRole);
    // Real Data State
    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [fetchedExpenses, fetchedCategories] = await Promise.all([
                expenseService.getAll(1), // Default salonId
                expenseService.getCategories(1)
            ]);
            setExpenses(fetchedExpenses);
            // Ensure derived category data works - service returns categories, we calculate totals below
            setCategories(fetchedCategories);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Compute category data with totals
    const categoriesWithTotals = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            amount: expenses
                .filter(e => e.categoryId === cat.id)
                .reduce((sum, e) => sum + e.amount, 0)
        }));
    }, [categories, expenses]);

    // Get recent expenses (latest 10)
    const recentExpenses = useMemo(() =>
        [...expenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10),
        [expenses]
    );


    const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

    // Find highest category
    const highestCategory = useMemo(() => {
        if (categoriesWithTotals.length === 0) return { name: "N/A", amount: 0 };
        return categoriesWithTotals.reduce((max, cat) =>
            cat.amount > max.amount ? cat : max
        );
    }, [categoriesWithTotals]);

    // Chart data
    const chartData = useMemo(() =>
        categoriesWithTotals.map(cat => ({
            name: cat.name.length > 15 ? cat.name.substring(0, 12) + "..." : cat.name,
            amount: cat.amount,
        })),
        [categoriesWithTotals]
    );

    const handleExportCSV = () => {
        exportToCSV(recentExpenses, expenseExportColumns, "expenses");
    };

    const handleExportPDF = () => {
        exportToPDF(recentExpenses, expenseExportColumns, "Expenses Report", "expenses");
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                await expenseService.delete(id);
                // Refresh data
                fetchData();
            } catch (error) {
                console.error("Failed to delete expense", error);
                alert("Failed to delete expense");
            }
        }
    };

    return (
        <ProtectedRoute requiredRole={['manager', 'super_admin']}>
            <MainLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
                            <p className="text-gray-500 mt-1">Track and manage all business expenses</p>
                        </div>
                        <div className="flex w-full md:w-auto items-center justify-end gap-3">
                            <Button variant="outline" size="md" onClick={handleExportCSV} className="hidden sm:flex">
                                <Download className="w-5 h-5 mr-1" />
                                CSV
                            </Button>
                            <Button variant="outline" size="md" onClick={handleExportPDF} className="hidden sm:flex">
                                <FileText className="w-5 h-5 mr-1" />
                                PDF
                            </Button>
                            {canAdd && (
                                <ReadOnlyGuard>
                                    <Link href="/expenses/add">
                                        <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                            <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                            <span className="hidden md:inline ml-2 text-sm font-bold">Add Expense</span>
                                        </Button>
                                    </Link>
                                </ReadOnlyGuard>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="text-white" style={getCardStyle(0)}>
                            <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                            <h3 className="text-3xl font-bold">€{totalExpenses.toLocaleString()}</h3>
                            <p className="text-sm opacity-80 mt-1">This month</p>
                        </Card>
                        <Card className="text-white" style={getCardStyle(1)}>
                            <p className="text-sm opacity-90 mb-1">Categories</p>
                            <h3 className="text-3xl font-bold">{categories.length}</h3>
                            <p className="text-sm opacity-80 mt-1">Active categories</p>
                        </Card>
                        <Card className="text-white" style={getCardStyle(2)}>
                            <p className="text-sm opacity-90 mb-1">Highest Category</p>
                            <h3 className="text-2xl font-bold">{highestCategory.name}</h3>
                            <p className="text-sm opacity-80 mt-1">€{highestCategory.amount.toLocaleString()}</p>
                        </Card>
                        <Card className="text-white" style={getCardStyle(3)}>
                            <p className="text-sm opacity-90 mb-1">Average/Month</p>
                            <h3 className="text-3xl font-bold">€{Math.round(totalExpenses / 6).toLocaleString()}</h3>
                            <p className="text-sm opacity-80 mt-1">Last 6 months</p>
                        </Card>
                    </div>

                    {/* Categories Grid */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Expense Categories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoriesWithTotals.map((category) => (
                                <Card key={category.id} className="hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-2xl`}>
                                                {category.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                                <p className="text-xs text-gray-500">This month</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">€{category.amount}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip />
                                <Bar dataKey="amount" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Recent Expenses Table */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Recent Expenses</h3>
                            <Button variant="outline" size="sm">View All</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Salon</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 text-sm text-gray-500">#{expense.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.date}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                                    {expense.categoryName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{expense.description}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-info-light,bg-blue-100)] text-[var(--color-info,text-blue-800)]">
                                                    {expense.salonId || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">€{expense.amount}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canEdit && (
                                                        <ReadOnlyGuard>
                                                            <Link href={`/expenses/edit/${expense.id}`}>
                                                                <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors shadow-sm" title="Edit">
                                                                    <Edit size={16} />
                                                                </button>
                                                            </Link>
                                                        </ReadOnlyGuard>
                                                    )}
                                                    {canDelete && (
                                                        <ReadOnlyGuard>
                                                            <button
                                                                onClick={() => handleDelete(expense.id)}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </ReadOnlyGuard>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
