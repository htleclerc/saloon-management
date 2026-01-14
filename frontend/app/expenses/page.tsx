"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const expenseCategories = [
    { name: "Office Rental", color: "bg-purple-500", amount: 2500, icon: "🏢" },
    { name: "Rental Relative Expenses", color: "bg-pink-500", amount: 850, icon: "📋" },
    { name: "Electricity", color: "bg-orange-500", amount: 420, icon: "⚡" },
    { name: "IG & Facebook & Google", color: "bg-green-500", amount: 650, icon: "📱" },
    { name: "Office Cleaning", color: "bg-blue-500", amount: 300, icon: "🧹" },
    { name: "Internet", color: "bg-indigo-500", amount: 150, icon: "🌐" },
    { name: "TV", color: "bg-red-500", amount: 80, icon: "📺" },
    { name: "Other Expenses", color: "bg-yellow-500", amount: 420, icon: "💰" },
    { name: "Beauty Supply", color: "bg-teal-500", amount: 1200, icon: "💄" },
];

const recentExpenses = [
    { id: 1, date: "2026-01-12", category: "Beauty Supply", description: "Hair extensions and products", amount: 350, salon: "Salon 1" },
    { id: 2, date: "2026-01-10", category: "Office Rental", description: "Monthly rent", amount: 2500, salon: "Salon 1 & 2" },
    { id: 3, date: "2026-01-08", category: "Electricity", description: "Monthly bill", amount: 420, salon: "Salon 1" },
    { id: 4, date: "2026-01-05", category: "IG & Facebook & Google", description: "Social media ads", amount: 250, salon: "Salon 1" },
    { id: 5, date: "2026-01-03", category: "Office Cleaning", description: "Weekly cleaning service", amount: 75, salon: "Salon 1" },
];

const chartData = expenseCategories.map(cat => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 12) + "..." : cat.name,
    amount: cat.amount,
}));

export default function ExpensesPage() {
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage all business expenses</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="md">
                            <Download className="w-5 h-5" />
                            Export
                        </Button>
                        <Link href="/expenses/add">
                            <Button variant="primary" size="md">
                                <Plus className="w-5 h-5" />
                                Add Expense
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card gradient="bg-gradient-to-br from-purple-600 to-purple-700" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                        <h3 className="text-3xl font-bold">€{totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">This month</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-pink-500 to-pink-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Categories</p>
                        <h3 className="text-3xl font-bold">{expenseCategories.length}</h3>
                        <p className="text-sm opacity-80 mt-1">Active categories</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-orange-500 to-orange-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Highest Category</p>
                        <h3 className="text-2xl font-bold">Office Rental</h3>
                        <p className="text-sm opacity-80 mt-1">€2,500</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-teal-500 to-teal-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Average/Month</p>
                        <h3 className="text-3xl font-bold">€{Math.round(totalExpenses / 6).toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">Last 6 months</p>
                    </Card>
                </div>

                {/* Categories Grid */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Expense Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expenseCategories.map((category, index) => (
                            <Card key={index} className="hover:shadow-xl transition-shadow">
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
                            <Bar dataKey="amount" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{expense.description}</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {expense.salon}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">€{expense.amount}</td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/expenses/edit/${expense.id}`}>
                                                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">Edit</button>
                                                </Link>
                                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
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
    );
}
