"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { RequirePermission } from "@/context/AuthProvider";
import {
    DollarSign,
    TrendingDown,
    TrendingUp,
    Users,
    Plus,
    Bell,
    CheckCircle,
    AlertTriangle,
    Clock,
    Briefcase,
    Calendar,
    Wallet,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Mock data
const monthlyRevenueData = [
    { name: "Jan", value: 45 }, { name: "Feb", value: 52 }, { name: "Mar", value: 49 },
    { name: "Apr", value: 63 }, { name: "May", value: 58 }, { name: "Jun", value: 72 },
    { name: "Jul", value: 68 }, { name: "Aug", value: 75 }, { name: "Sep", value: 82 },
    { name: "Oct", value: 88 }, { name: "Nov", value: 79 }, { name: "Dec", value: 85 }
];

const monthlyExpensesData = [
    { name: "Jan", value: 28 }, { name: "Feb", value: 32 }, { name: "Mar", value: 35 },
    { name: "Apr", value: 38 }, { name: "May", value: 42 }, { name: "Jun", value: 45 },
    { name: "Jul", value: 40 }, { name: "Aug", value: 48 }, { name: "Sep", value: 52 },
    { name: "Oct", value: 55 }, { name: "Nov", value: 50 }, { name: "Dec", value: 58 }
];

const profitData = [
    { name: "Jan", revenue: 40, expenses: 25, profit: 15 },
    { name: "Feb", revenue: 45, expenses: 30, profit: 15 },
    { name: "Mar", revenue: 42, expenses: 28, profit: 14 },
    { name: "Apr", revenue: 55, expenses: 35, profit: 20 },
    { name: "May", revenue: 50, expenses: 38, profit: 12 },
    { name: "Jun", revenue: 65, expenses: 42, profit: 23 },
    { name: "Jul", revenue: 60, expenses: 38, profit: 22 },
    { name: "Aug", revenue: 68, expenses: 45, profit: 23 },
    { name: "Sep", revenue: 75, expenses: 50, profit: 25 },
    { name: "Oct", revenue: 80, expenses: 52, profit: 28 },
    { name: "Nov", revenue: 72, expenses: 48, profit: 24 },
    { name: "Dec", revenue: 78, expenses: 55, profit: 23 },
];

const expenseCategories = [
    { name: "Staff Salary", value: 12450, color: "#8B5CF6" },
    { name: "Office Rental", value: 5200, color: "#EC4899" },
    { name: "Beauty Supply", value: 3850, color: "#F59E0B" },
    { name: "Utilities (Electric, Internet)", value: 1800, color: "#10B981" },
];

const topPerformers = [
    { name: "Isabelle", role: "Hair Stylist", revenue: 4250, clients: 42, rating: 4.9, avatar: "I", bg: "bg-purple-100", text: "text-purple-600" },
    { name: "Fatima S", role: "Nail Artist", revenue: 3890, clients: 38, rating: 4.8, avatar: "F", bg: "bg-pink-100", text: "text-pink-600" },
    { name: "Nadine B", role: "Colorist", revenue: 3560, clients: 35, rating: 4.8, avatar: "N", bg: "bg-orange-100", text: "text-orange-600" },
    { name: "Yasmine M", role: "Stylist", revenue: 3120, clients: 31, rating: 4.7, avatar: "Y", bg: "bg-teal-100", text: "text-teal-600" },
];

const todaysSessions = [
    { time: "09:00 AM", client: "Marie Anderson", type: "Box Braids", worker: "Orphelia", price: "€120", status: "Completed", statusColor: "bg-green-100 text-green-700" },
    { time: "10:30 AM", client: "Lina Davis", type: "Cornrows", worker: "Fatima", price: "€85", status: "In Progress", statusColor: "bg-blue-100 text-blue-700" },
    { time: "12:00 PM", client: "Sophie Martin", type: "Twists", worker: "Amara", price: "€95", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700" },
    { time: "02:00 PM", client: "Anna Brown", type: "Locs", worker: "Orphelia", price: "€150", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700" },
    { time: "03:30 PM", client: "Lisa Wilson", type: "Braids", worker: "Naomie", price: "€110", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700" },
];

export default function AdvancedDashboardPage() {
    const { t } = useTranslation();

    return (
        <RequirePermission role="admin" fallback={
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <Card className="text-center p-8">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                        <p className="text-gray-600">This dashboard is only available for administrators.</p>
                        <Link href="/">
                            <Button variant="primary" size="md" className="mt-4">
                                Go to Basic Dashboard
                            </Button>
                        </Link>
                    </Card>
                </div>
            </MainLayout>
        }>
            <MainLayout>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Adorable Braids</h1>
                            <p className="text-gray-500 text-sm">Welcome back to your dashboard!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Add date range picker here if needed */}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Income */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium mb-1">Total Income</p>
                                    <h3 className="text-3xl font-bold">€45,890</h3>
                                    <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+12%</span> vs last year
                                    </p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-pink-100 text-sm font-medium mb-1">Total Expenses</p>
                                    <h3 className="text-3xl font-bold">€28,450</h3>
                                    <p className="text-xs text-pink-100 mt-2 flex items-center gap-1">
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+2.5%</span> vs last year
                                    </p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-orange-50 text-sm font-medium mb-1">Net Profit</p>
                                    <h3 className="text-3xl font-bold">€17,440</h3>
                                    <p className="text-xs text-orange-50 mt-2 flex items-center gap-1">
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+5.4%</span> vs last year
                                    </p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Total Workers */}
                        <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-teal-100 text-sm font-medium mb-1">Total Workers</p>
                                    <h3 className="text-3xl font-bold">12</h3>
                                    <p className="text-xs text-teal-100 mt-2 flex items-center gap-1">
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">Anytime</span>
                                    </p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                                <Plus className="w-5 h-5" /> Add Service
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                                <Wallet className="w-5 h-5" /> Add Expense
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                                <Users className="w-5 h-5" /> Add Worker
                            </button>
                        </div>
                    </div>

                    {/* Charts Row 1: Monthly Revenue & Expenses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
                                    <p className="text-xs text-gray-500">Year 2026</p>
                                </div>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded"> Yearly </span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyRevenueData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <Tooltip cursor={{ fill: '#F3E8FF', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 4, 4]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-900">Monthly Expenses</h3>
                                    <p className="text-xs text-gray-500">Year 2026</p>
                                </div>
                                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded"> Yearly </span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyExpensesData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <Tooltip cursor={{ fill: '#FCE7F3', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 4, 4]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    {/* Profit Analysis Chart */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900">Profit Analysis</h3>
                                <p className="text-xs text-gray-500">Revenue vs Expenses (2026)</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">Monthly</span>
                                <span className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded text-gray-400">Weekly</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={profitData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expenses" stroke="#EC4899" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div> Revenue
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full bg-pink-500"></div> Expenses
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div> Profit
                            </div>
                        </div>
                    </Card>

                    {/* Breakdown & Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Expense Categories */}
                        <Card className="p-6 lg:col-span-1">
                            <h3 className="font-bold text-gray-900 mb-6">Expense Categories</h3>
                            <div className="relative h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCategories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">€23K</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                {expenseCategories.map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-gray-600">{cat.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">€{cat.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Top Expense Categories Details */}
                        <Card className="p-6 lg:col-span-2">
                            <h3 className="font-bold text-gray-900 mb-6">Top Expense Categories</h3>
                            <div className="space-y-4">
                                {expenseCategories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{cat.name}</p>
                                                <p className="text-xs text-gray-500">Most expenses go here</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">€{cat.value.toLocaleString()}</p>
                                            <p className="text-xs text-green-600">+12% vs last month</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Top Performing Workers */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Top Performing Workers</h3>
                            <button className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline">View All Workers <Clock className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {topPerformers.map((worker) => (
                                <Card key={worker.name} className="p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow border border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className={`w-12 h-12 rounded-full ${worker.bg} flex items-center justify-center ${worker.text} font-bold text-lg`}>
                                                {worker.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{worker.name}</p>
                                                <p className="text-xs text-gray-500">{worker.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-400">Revenue</p>
                                            <p className="font-bold text-gray-900">€{worker.revenue.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Rating</p>
                                            <div className="flex text-yellow-500 text-xs">
                                                {"★".repeat(Math.round(worker.rating))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Today's Services */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Today's Services</h3>
                            <div className="flex gap-2">
                                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">See All</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pl-2">Time</th>
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3">Client</th>
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3">Service</th>
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3">Worker</th>
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3">Price</th>
                                        <th className="text-left text-xs font-semibold text-gray-500 pb-3">Status</th>
                                        <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {todaysSessions.map((session, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 pl-2 text-sm font-medium text-gray-900">{session.time}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                                        {session.client.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium">{session.client}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600">{session.type}</td>
                                            <td className="py-4 text-sm text-gray-600">{session.worker}</td>
                                            <td className="py-4 text-sm font-bold text-gray-900">{session.price}</td>
                                            <td className="py-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${session.statusColor}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-2 text-right">
                                                <button className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-full transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        </RequirePermission>
    );
}
