"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import {
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    Download,
    Printer,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Plus,
    Search,
    Filter,
} from "lucide-react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

// Mock data for daily salary breakdown
const dailySalaryData = [
    { date: "01-01", day: "Mon", worker: "Amanda Drake", avatar: "A", service: "Haircut + Color", income: "€120", commission: "50%", salary: "€60", tips: "€12", total: "€72", status: "Paid" },
    { date: "01-01", day: "Mon", worker: "Sophie Martin", avatar: "S", service: "Manicure", income: "€45", commission: "40%", salary: "€18", tips: "€5", total: "€23", status: "Paid" },
    { date: "01-02", day: "Tue", worker: "Emma Wilson", avatar: "E", service: "Haircut", income: "€55", commission: "45%", salary: "€24.75", tips: "€5", total: "€29.75", status: "Paid" },
    { date: "01-02", day: "Tue", worker: "Amanda Drake", avatar: "A", service: "Full Service", income: "€200", commission: "50%", salary: "€100", tips: "€20", total: "€120", status: "Pending" },
    { date: "01-03", day: "Wed", worker: "James Brown", avatar: "J", service: "Beard Trim", income: "€30", commission: "35%", salary: "€10.50", tips: "€3", total: "€13.50", status: "Paid" },
    { date: "01-03", day: "Wed", worker: "Sophie Martin", avatar: "S", service: "Pedicure", income: "€50", commission: "40%", salary: "€20", tips: "€6", total: "€26", status: "Pending" },
    { date: "01-04", day: "Thu", worker: "Emma Wilson", avatar: "E", service: "Haircut", income: "€55", commission: "45%", salary: "€24.75", tips: "€5", total: "€29.75", status: "Paid" },
];

// Weekly summary data
const weeklySummaryData = [
    { name: "Mon", income: 25420, salary: 12389 },
    { name: "Tue", income: 18350, salary: 8543 },
    { name: "Wed", income: 32100, salary: 15234 },
    { name: "Thu", income: 28450, salary: 13421 },
    { name: "Fri", income: 35280, salary: 16832 },
    { name: "Sat", income: 41200, salary: 19876 },
    { name: "Sun", income: 15800, salary: 7234 },
];

// Monthly summary data
const monthlySummaryData = [
    { name: "Jan", income: 45420, salary: 22145 },
    { name: "Feb", income: 52350, salary: 25687 },
    { name: "Mar", income: 48100, salary: 23456 },
    { name: "Apr", income: 55450, salary: 27123 },
    { name: "May", income: 61280, salary: 29845 },
    { name: "Jun", income: 58200, salary: 28432 },
];

// Annual projection donut chart
const annualProjectionData = [
    { name: "Services", value: 45, color: "#8B5CF6" },
    { name: "Products", value: 25, color: "#EC4899" },
    { name: "Tips", value: 15, color: "#F59E0B" },
    { name: "Packages", value: 10, color: "#10B981" },
    { name: "Other", value: 5, color: "#3B82F6" },
];

// Worker performance data
const workerPerformanceData = [
    { name: "Amanda", income: 15420, salary: 7543, tips: 1234, services: 45, color: "#8B5CF6" },
    { name: "Sophie", income: 12350, salary: 5687, tips: 987, services: 38, color: "#EC4899" },
    { name: "Emma", income: 14100, salary: 6456, tips: 1123, services: 42, color: "#F59E0B" },
    { name: "James", income: 9450, salary: 4123, tips: 756, services: 28, color: "#10B981" },
];

// Payment status data
const paymentStatusData = [
    { name: "Paid", value: 75, color: "#10B981" },
    { name: "Pending", value: 25, color: "#F59E0B" },
];

// Pending payments list
const pendingPayments = [
    { worker: "Amanda Drake", amount: "€120", date: "01-02", service: "Full Service" },
    { worker: "Sophie Martin", amount: "€26", date: "01-03", service: "Pedicure" },
    { worker: "Emma Wilson", amount: "€85", date: "01-05", service: "Color Treatment" },
];

export default function IncomeDashboardPage() {
    const [view, setView] = useState<'simple' | 'advanced'>('simple');
    const [selectedPeriod, setSelectedPeriod] = useState('Daily');
    const { getCardStyle } = useKpiCardStyle();
    const [currentDate, setCurrentDate] = useState("January 14, 2026");

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Income Overview</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Track income, salaries, and worker performance</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <Printer className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Print</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <Download className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Export</span>
                        </Button>
                        <Link href="/income/add">
                            <Button variant="primary" size="sm" className="bg-[#A855F7] hover:bg-[#9333EA] flex-1 md:flex-none">
                                <Plus className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Add Income</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Total</span>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Income</p>
                            <h3 className="text-3xl font-bold">€45,892</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+12.5% vs last week</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="text-white" style={getCardStyle(1)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Salary</span>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Salary</p>
                            <h3 className="text-3xl font-bold">€22,145</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+8.3% from average</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="text-white" style={getCardStyle(2)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Average</span>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Avg per Worker</p>
                            <h3 className="text-3xl font-bold">€3,247</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>Consistent growth</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="text-white" style={getCardStyle(3)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Net</span>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Net Profit</p>
                            <h3 className="text-3xl font-bold">€23,747</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+15.2% margin</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="text-white" style={getCardStyle(4)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Active</span>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Workers</p>
                            <h3 className="text-3xl font-bold">24</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>2 new this month</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Time Period Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Time Period:</span>
                            <div className="flex gap-2">
                                {["Daily", "Weekly", "Monthly", "Annual"].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === period
                                            ? "bg-[#A855F7] text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-gray-900 px-4">{currentDate}</span>
                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Daily Salary Breakdown Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">Daily Salary Breakdown</h3>
                        <p className="text-xs md:text-sm text-gray-500">Detailed view of worker earnings</p>
                    </div>
                    {/* Mobile Card View */}
                    <div className="block md:hidden divide-y divide-gray-100">
                        {dailySalaryData.map((row, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-[#A855F7] font-bold text-sm border border-purple-200">
                                            {row.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{row.worker}</p>
                                            <p className="text-xs text-gray-500">{row.date} • {row.day}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                        }`}>
                                        {row.status}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-700">{row.service}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Income</p>
                                        <p className="font-semibold text-gray-900">{row.income}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Salary</p>
                                        <p className="font-semibold text-gray-900">{row.salary}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tips</p>
                                        <p className="font-semibold text-green-600">{row.tips}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="font-bold text-gray-900">{row.total}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Worker</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comm %</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tips</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dailySalaryData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700">{row.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.day}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-[#A855F7] font-bold text-xs border border-purple-200">
                                                    {row.avatar}
                                                </div>
                                                <span className="font-medium text-gray-900">{row.worker}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{row.service}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.income}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.commission}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.salary}</td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-medium">{row.tips}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${row.status === "Paid"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-orange-100 text-orange-700"
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
                                <p className="text-sm text-gray-500">Income vs Salary comparison</p>
                            </div>
                            <button className="text-[#A855F7] text-sm font-medium hover:underline">View Details</button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklySummaryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="income" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="salary" fill="#EC4899" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#8B5CF6] rounded"></div>
                                <span className="text-sm text-gray-600">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#EC4899] rounded"></div>
                                <span className="text-sm text-gray-600">Salary</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
                                <p className="text-sm text-gray-500">6-month performance trend</p>
                            </div>
                            <button className="text-[#A855F7] text-sm font-medium hover:underline">View Details</button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlySummaryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="income" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="salary" fill="#10B981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#8B5CF6] rounded"></div>
                                <span className="text-sm text-gray-600">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#10B981] rounded"></div>
                                <span className="text-sm text-gray-600">Salary</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Annual Projection & Worker Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Annual Projection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Annual Projection</h3>
                            <p className="text-sm text-gray-500">Income breakdown by category</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={annualProjectionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {annualProjectionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                                {annualProjectionData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">€545K</p>
                                    <p className="text-xs text-gray-500 mt-1">Projected Total</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">+23%</p>
                                    <p className="text-xs text-gray-500 mt-1">Growth Rate</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">€245K</p>
                                    <p className="text-xs text-gray-500 mt-1">Total Salaries</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                            <p className="text-sm text-gray-500">Current payment distribution</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={paymentStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {paymentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex gap-6 mt-4">
                                {paymentStatusData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4">Pending Payments</h4>
                            <div className="space-y-3">
                                {pendingPayments.map((payment, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-xs">
                                                {payment.worker.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{payment.worker}</p>
                                                <p className="text-xs text-gray-500">{payment.service} • {payment.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{payment.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Worker Performance Comparison */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Worker Performance Comparison</h3>
                        <p className="text-sm text-gray-500">Top performers this period</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {workerPerformanceData.map((worker, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border-2 hover:shadow-lg transition-all cursor-pointer"
                                style={{ borderColor: worker.color }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: worker.color }}
                                    >
                                        {worker.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                                        <p className="text-xs text-gray-500">{worker.services} services</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Income</span>
                                        <span className="font-semibold text-gray-900">€{worker.income.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Salary</span>
                                        <span className="font-semibold text-gray-900">€{worker.salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Tips</span>
                                        <span className="font-semibold text-green-600">€{worker.tips.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown by Worker */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Breakdown by Worker</h3>
                        <p className="text-sm text-gray-500">Expand to view individual worker details</p>
                    </div>
                    <div className="space-y-3">
                        {workerPerformanceData.map((worker, idx) => (
                            <details key={idx} className="group">
                                <summary
                                    className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: worker.color }}
                                        >
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                                            <p className="text-xs text-gray-500">{worker.services} completed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">€{worker.income.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Total Income</p>
                                    </div>
                                </summary>
                                <div className="mt-3 p-4 bg-white border border-gray-100 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Total Income</p>
                                            <p className="text-xl font-bold text-gray-900">€{worker.income.toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-pink-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Total Salary</p>
                                            <p className="text-xl font-bold text-gray-900">€{worker.salary.toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Total Tips</p>
                                            <p className="text-xl font-bold text-green-600">€{worker.tips.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
