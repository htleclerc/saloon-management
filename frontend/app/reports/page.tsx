"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
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

const monthlyData = [
    { month: "Jan", revenue: 12000, expenses: 4500, profit: 7500 },
    { month: "Feb", revenue: 15000, expenses: 5200, profit: 9800 },
    { month: "Mar", revenue: 13500, expenses: 4800, profit: 8700 },
    { month: "Apr", revenue: 18000, expenses: 6200, profit: 11800 },
    { month: "May", revenue: 22000, expenses: 7100, profit: 14900 },
    { month: "Jun", revenue: 25430, expenses: 8240, profit: 17190 },
];

const workerPerformance = [
    { name: "Orphelia", value: 32, color: "#8B5CF6" },
    { name: "Worker 2", value: 25, color: "#EC4899" },
    { name: "Worker 3", value: 20, color: "#F59E0B" },
    { name: "Others", value: 23, color: "#10B981" },
];

export default function ReportsPage() {
    const currentRevenue = 25430;
    const previousRevenue = 22000;
    const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

    const currentProfit = 17190;
    const previousProfit = 14900;
    const profitChange = ((currentProfit - previousProfit) / previousProfit * 100).toFixed(1);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                        <p className="text-gray-500 mt-1">Comprehensive financial analysis and insights</p>
                    </div>
                    <Button variant="primary" size="md">
                        <Download className="w-5 h-5" />
                        Export Report
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card gradient="bg-gradient-to-br from-purple-600 to-purple-700" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold">€{currentRevenue.toLocaleString()}</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">+{revenueChange}%</span>
                            <span className="text-sm opacity-75">vs last month</span>
                        </div>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-pink-500 to-pink-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                        <h3 className="text-3xl font-bold">€8,240</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">+15.8%</span>
                            <span className="text-sm opacity-75">vs last month</span>
                        </div>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-orange-500 to-orange-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Net Profit</p>
                        <h3 className="text-3xl font-bold">€{currentProfit.toLocaleString()}</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">+{profitChange}%</span>
                            <span className="text-sm opacity-75">vs last month</span>
                        </div>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-teal-500 to-teal-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Profit Margin</p>
                        <h3 className="text-3xl font-bold">67.6%</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">+2.1%</span>
                            <span className="text-sm opacity-75">vs last month</span>
                        </div>
                    </Card>
                </div>

                {/* Revenue Trend */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">6-Month Financial Trend</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} name="Revenue" />
                            <Line type="monotone" dataKey="expenses" stroke="#EC4899" strokeWidth={3} name="Expenses" />
                            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="Profit" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue vs Expenses */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Monthly Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Revenue" />
                                <Bar dataKey="expenses" fill="#EC4899" radius={[8, 8, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Worker Performance */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Revenue by Worker (%)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={workerPerformance}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {workerPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Financial Summary Table */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Monthly Financial Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Expenses</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Profit</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Margin %</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {monthlyData.map((row, idx) => {
                                    const margin = ((row.profit / row.revenue) * 100).toFixed(1);
                                    const prevProfit = idx > 0 ? monthlyData[idx - 1].profit : row.profit;
                                    const change = idx > 0 ? (((row.profit - prevProfit) / prevProfit) * 100).toFixed(1) : 0;
                                    const isPositive = Number(change) >= 0;

                                    return (
                                        <tr key={row.month} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 font-medium text-gray-900">{row.month}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-purple-600">€{row.revenue.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-pink-600">€{row.expenses.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-green-600">€{row.profit.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{margin}%</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className={`flex items-center justify-end gap-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    <span>{isPositive ? '+' : ''}{change}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
