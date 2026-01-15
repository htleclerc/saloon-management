"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Download, TrendingUp, TrendingDown, Calendar, Edit, ChevronDown, Lightbulb } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Annual Financial Overview Data
const annualOverview = {
    totalRevenue: 586000,
    totalExpenses: 21440,
    netProfit: 6500,
    taxPayments: 2270,
    savings: 9095,
};

// Monthly Financial Breakdown Data
const monthlyBreakdown = [
    { id: 1, date: "2025-01-15", worker: "Ophélia Mackenzy", avatar: "👩🏾", revenue: 12500, expense: 2100, profit: 10400, tax: 520, savings: 1040 },
    { id: 2, date: "2025-02-15", worker: "Sarah Johnson", avatar: "👩🏼", revenue: 15200, expense: 2800, profit: 12400, tax: 620, savings: 1240 },
    { id: 3, date: "2025-03-15", worker: "Maria Garcia", avatar: "👩🏽", revenue: 11800, expense: 1950, profit: 9850, tax: 493, savings: 985 },
    { id: 4, date: "2025-04-15", worker: "Lisa Chen", avatar: "👩🏻", revenue: 18500, expense: 3200, profit: 15300, tax: 765, savings: 1530 },
    { id: 5, date: "2025-05-15", worker: "Amanda Brown", avatar: "👩🏿", revenue: 14200, expense: 2400, profit: 11800, tax: 590, savings: 1180 },
    { id: 6, date: "2025-06-15", worker: "Jennifer Lee", avatar: "👩🏾", revenue: 16800, expense: 2900, profit: 13900, tax: 695, savings: 1390 },
    { id: 7, date: "2025-07-15", worker: "Emily Davis", avatar: "👩🏼", revenue: 13500, expense: 2300, profit: 11200, tax: 560, savings: 1120 },
    { id: 8, date: "2025-08-15", worker: "Nicole Wilson", avatar: "👩🏽", revenue: 17200, expense: 3100, profit: 14100, tax: 705, savings: 1410 },
];

// Quarterly Revenue vs Expenses Data
const quarterlyData = [
    { quarter: "Q1", revenue: 45000, expenses: 8500 },
    { quarter: "Q2", revenue: 52000, expenses: 9200 },
    { quarter: "Q3", revenue: 48000, expenses: 8800 },
    { quarter: "Q4", revenue: 55000, expenses: 9800 },
];

// Monthly Sales Analysis (Line chart declining)
const monthlySalesData = [
    { month: "Jan", sales: 4200 },
    { month: "Feb", sales: 4000 },
    { month: "Mar", sales: 3900 },
    { month: "Apr", sales: 4100 },
    { month: "May", sales: 3800 },
    { month: "Jun", sales: 3600 },
    { month: "Jul", sales: 3400 },
    { month: "Aug", sales: 3200 },
    { month: "Sep", sales: 3000 },
    { month: "Oct", sales: 2800 },
    { month: "Nov", sales: 2500 },
];

// Expense Categories for Pie Chart
const expenseCategories = [
    { name: "Administrative", value: 32, color: "#3B82F6", amount: 2000 },
    { name: "Marketing", value: 25, color: "#EC4899", amount: 999 },
    { name: "Insurance", value: 18, color: "#8B5CF6", amount: 350 },
    { name: "Software", value: 12, color: "#10B981", amount: 599 },
    { name: "Meals", value: 8, color: "#F59E0B", amount: 220 },
    { name: "Utilities", value: 5, color: "#EF4444", amount: 120 },
];

// Quarterly Performance Data
const quarterlyPerformance = [
    { quarter: "Q1", value: 5580, color: "#8B5CF6" },
    { quarter: "Q2", value: 5795, color: "#10B981" },
    { quarter: "Q3", value: 5058, color: "#F59E0B" },
    { quarter: "Q4", value: 5399, color: "#EF4444" },
];

// Tax Summary Data
const taxSummary = {
    incomeTax: 20950,
    estimatedTax: 40120,
    taxThisMonth: 186.17,
};

const taxPaymentDetails = [
    { date: "2025-01-15", description: "Federal Income Tax", amount: 4200, status: "Paid" },
    { date: "2025-02-15", description: "State Tax", amount: 1850, status: "Paid" },
    { date: "2025-03-15", description: "Quarterly Tax", amount: 3200, status: "Pending" },
];

// Tax Rate Comparison Data
const taxRateData = [
    { name: "Federal", rate: 22 },
    { name: "State", rate: 8 },
    { name: "Local", rate: 3 },
];

// Purchase Trends Data
const purchaseTrends = [
    { month: "Jan", purchases: 2800 },
    { month: "Feb", purchases: 3200 },
    { month: "Mar", purchases: 2900 },
    { month: "Apr", purchases: 3500 },
    { month: "May", purchases: 3100 },
    { month: "Jun", purchases: 3600 },
    { month: "Jul", purchases: 3400 },
    { month: "Aug", purchases: 3800 },
];

// Fee Breakdown Data
const feeBreakdown = [
    { category: "Processing Fees", percentage: 2.5, amount: 450 },
    { category: "Service Fees", percentage: 1.8, amount: 324 },
    { category: "Platform Fees", percentage: 3.2, amount: 576 },
    { category: "Transaction Fees", percentage: 1.5, amount: 270 },
];

// Monthly vs Weekly Analysis
const monthlyWeeklyAnalysis = {
    weekly: 2000,
    monthly: 8500,
    difference: 500,
};

// Financial Recommendations
const recommendations = [
    { icon: "💡", title: "Increase Savings", description: "Consider increasing your savings rate by 5% this quarter." },
    { icon: "📊", title: "Review Expenses", description: "Marketing expenses can be optimized for better ROI." },
    { icon: "📈", title: "Tax Planning", description: "Schedule quarterly tax review to avoid year-end surprises." },
];

export default function ReportsPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Site One Report</h1>
                        <p className="text-gray-500 mt-1">Comprehensive financial analysis and insights</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Period Filters */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">Daily</button>
                            <button className="px-3 py-1.5 text-sm font-medium bg-white shadow-sm text-purple-600 rounded-md">Weekly</button>
                            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">Monthly</button>
                            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">Yearly</button>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Dec 1 - Dec 31, 2025
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button variant="primary" size="md">
                            <Download className="w-5 h-5" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Annual Financial Overview */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Annual Financial Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Card gradient="bg-gradient-to-br from-purple-600 to-purple-700" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">💰</span>
                                <p className="text-xs opacity-90">Total Revenue</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{annualOverview.totalRevenue.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">+12.5% vs last year</span>
                            </div>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-orange-500 to-orange-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">📊</span>
                                <p className="text-xs opacity-90">Total Expenses</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{annualOverview.totalExpenses.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingDown className="w-3 h-3" />
                                <span className="text-xs">-3.2% vs last year</span>
                            </div>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-green-500 to-green-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">📈</span>
                                <p className="text-xs opacity-90">Net Profit</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{annualOverview.netProfit.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">+8.4% vs last year</span>
                            </div>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-red-500 to-red-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🧾</span>
                                <p className="text-xs opacity-90">Tax Payments</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{annualOverview.taxPayments.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">+2.1% vs last year</span>
                            </div>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-blue-500 to-blue-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">💎</span>
                                <p className="text-xs opacity-90">Savings</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{annualOverview.savings.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">+15.3% vs last year</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Monthly Financial Breakdown Table */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Monthly Financial Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Expense</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Profit</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Savings</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {monthlyBreakdown.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4 text-sm text-gray-900">{row.date}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{row.avatar}</span>
                                                <span className="text-sm font-medium text-gray-900">{row.worker}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-green-600">€{row.revenue.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-red-600">€{row.expense.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-green-600">€{row.profit.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-orange-600">€{row.tax.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-blue-600">€{row.savings.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button className="text-purple-600 hover:text-purple-800 transition">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold">
                                <tr>
                                    <td className="px-4 py-3 text-sm" colSpan={2}>Total</td>
                                    <td className="px-4 py-3 text-right text-green-600">€{monthlyBreakdown.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-red-600">€{monthlyBreakdown.reduce((sum, r) => sum + r.expense, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-green-600">€{monthlyBreakdown.reduce((sum, r) => sum + r.profit, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-orange-600">€{monthlyBreakdown.reduce((sum, r) => sum + r.tax, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-blue-600">€{monthlyBreakdown.reduce((sum, r) => sum + r.savings, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>

                {/* Charts Row - Quarterly & Monthly */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quarterly Revenue vs Expenses */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Quarterly Revenue vs Expenses</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={quarterlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="quarter" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Monthly Sales Analysis */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Monthly Sales Analysis</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlySalesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B", strokeWidth: 2 }} name="Sales" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Annual Expense Categories - Pie Chart */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Annual Expense Categories</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                            {expenseCategories.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-gray-900">€{cat.amount.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500 ml-2">{cat.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Quarterly Performance Comparison */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Quarterly Performance Comparison</h3>
                    <p className="text-sm text-gray-500 mb-4">Quarterly performance numbers</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {quarterlyPerformance.map((q, idx) => (
                            <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: `${q.color}15` }}>
                                <p className="text-sm font-medium text-gray-600">{q.quarter}</p>
                                <h4 className="text-2xl font-bold mt-1" style={{ color: q.color }}>€{q.value.toLocaleString()}</h4>
                                <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: `${q.color}30` }}>
                                    <div className="h-full rounded-full" style={{ width: `${(q.value / 6000) * 100}%`, backgroundColor: q.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={quarterlyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="quarter" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {quarterlyPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Tax Summary & Payment Schedule */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Tax Summary & Payment Schedule</h3>
                        <Button variant="outline" size="sm">View All</Button>
                    </div>

                    {/* Tax Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card gradient="bg-gradient-to-br from-blue-500 to-blue-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">📋</span>
                                <p className="text-xs opacity-90">Income Tax</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{taxSummary.incomeTax.toLocaleString()}</h3>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-pink-500 to-pink-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">📊</span>
                                <p className="text-xs opacity-90">Estimated Tax</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{taxSummary.estimatedTax.toLocaleString()}</h3>
                        </Card>
                        <Card gradient="bg-gradient-to-br from-green-500 to-green-600" className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">💵</span>
                                <p className="text-xs opacity-90">Tax this Month</p>
                            </div>
                            <h3 className="text-2xl font-bold">€{taxSummary.taxThisMonth.toLocaleString()}</h3>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Tax Payment Details */}
                        <Card>
                            <h4 className="text-md font-semibold mb-4">Monthly Tax Payment Details</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {taxPaymentDetails.map((tax, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700">{tax.date}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{tax.description}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">€{tax.amount.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tax.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Tax Rate Comparison */}
                        <Card>
                            <h4 className="text-md font-semibold mb-4">Tax Rate Comparison</h4>
                            <div className="space-y-4">
                                {taxRateData.map((tax, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{tax.name}</span>
                                            <span className="text-sm font-semibold text-gray-900">{tax.rate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="h-3 rounded-full bg-purple-600" style={{ width: `${(tax.rate / 25) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Purchase Trends & Fee Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Purchase Trends */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Purchase Trends</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={purchaseTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="purchases" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6", strokeWidth: 2 }} name="Purchases" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Fee Breakdown */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Percentage</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {feeBreakdown.map((fee, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{fee.category}</td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-600">{fee.percentage}%</td>
                                            <td className="px-4 py-3 text-right font-semibold text-red-600">-€{fee.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-semibold">
                                    <tr>
                                        <td className="px-4 py-2 text-sm">Total Fees</td>
                                        <td className="px-4 py-2 text-right text-sm">{feeBreakdown.reduce((sum, f) => sum + f.percentage, 0).toFixed(1)}%</td>
                                        <td className="px-4 py-2 text-right text-red-600">-€{feeBreakdown.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Monthly vs Weekly Analysis */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Monthly vs Weekly Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-sm font-medium text-blue-600 mb-1">Weekly Average</p>
                            <h4 className="text-2xl font-bold text-gray-900">€{monthlyWeeklyAnalysis.weekly.toLocaleString()}</h4>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-sm font-medium text-purple-600 mb-1">Monthly Total</p>
                            <h4 className="text-2xl font-bold text-gray-900">€{monthlyWeeklyAnalysis.monthly.toLocaleString()}</h4>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-sm font-medium text-green-600 mb-1">Month vs Previous</p>
                            <h4 className="text-2xl font-bold text-green-600">+€{monthlyWeeklyAnalysis.difference.toLocaleString()}</h4>
                        </div>
                    </div>
                </Card>

                {/* Financial Recommendations */}
                <Card gradient="bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Financial Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{rec.icon}</span>
                                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
