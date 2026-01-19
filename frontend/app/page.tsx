"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
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
  Receipt,
  ChevronRight,
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

// --- Mock Data ---

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
  { name: "Utilities", value: 1800, color: "#10B981" },
];

const topPerformers = [
  { name: "Isabelle", role: "Hair Stylist", revenue: 4250, clients: 42, rating: 4.9, avatar: "I", bg: "bg-[var(--color-primary-light)]", text: "text-[var(--color-primary)]" },
  { name: "Fatima S", role: "Nail Artist", revenue: 3890, clients: 38, rating: 4.8, avatar: "F", bg: "bg-[var(--color-secondary-light)]", text: "text-[var(--color-secondary)]" },
  { name: "Nadine B", role: "Colorist", revenue: 3560, clients: 35, rating: 4.8, avatar: "N", bg: "bg-[var(--color-warning-light)]", text: "text-[var(--color-warning)]" },
  { name: "Yasmine M", role: "Stylist", revenue: 3120, clients: 31, rating: 4.7, avatar: "Y", bg: "bg-[var(--color-success-light)]", text: "text-[var(--color-success)]" },
];

const todaysSessions = [
  { time: "09:00 AM", client: "Marie Anderson", type: "Box Braids", worker: "Orphelia", price: "€120", status: "Completed", statusColor: "bg-[var(--color-success-light)] text-[var(--color-success)]" },
  { time: "10:30 AM", client: "Lina Davis", type: "Cornrows", worker: "Fatima", price: "€85", status: "In Progress", statusColor: "bg-blue-100 text-blue-700" },
  { time: "12:00 PM", client: "Sophie Martin", type: "Twists", worker: "Amara", price: "€95", status: "Pending", statusColor: "bg-[var(--color-warning-light)] text-[var(--color-warning)]" },
  { time: "02:00 PM", client: "Anna Brown", type: "Locs", worker: "Orphelia", price: "€150", status: "Pending", statusColor: "bg-[var(--color-warning-light)] text-[var(--color-warning)]" },
  { time: "03:30 PM", client: "Lisa Wilson", type: "Braids", worker: "Naomie", price: "€110", status: "Pending", statusColor: "bg-[var(--color-warning-light)] text-[var(--color-warning)]" },
];

const recentNotifications = [
  { type: "success", message: "New appointment booked by Marie A.", time: "5 min ago", icon: CheckCircle },
  { type: "warning", message: "Low stock alert: Hair products", time: "15 min ago", icon: AlertTriangle },
  { type: "info", message: "Fatima completed 5 sessions today", time: "1 hour ago", icon: Users },
  { type: "info", message: "New client registration: Sophie L.", time: "2 hours ago", icon: Users },
];

const recentActivities = [
  { id: 1, client: "Marie Dubois", service: "Box Braids", amount: "€120", worker: "Orphelia", time: "2h ago" },
  { id: 2, client: "Jean Martin", service: "Cornrows", amount: "€85", worker: "Fatima", time: "4h ago" },
  { id: 3, client: "Sophie Laurent", service: "Twists", amount: "€95", worker: "Amara", time: "5h ago" },
  { id: 4, client: "Pierre Rousseau", service: "Locs", amount: "€150", worker: "Orphelia", time: "6h ago" },
];

const monthlyForecastData = [
  { day: "Mon", value1: 60, value2: 45, value3: 70, value4: 55 },
  { day: "Tue", value1: 55, value2: 50, value3: 65, value4: 60 },
  { day: "Wed", value1: 70, value2: 60, value3: 75, value4: 65 },
  { day: "Thu", value1: 65, value2: 55, value3: 70, value4: 70 },
  { day: "Fri", value1: 80, value2: 70, value3: 85, value4: 75 },
  { day: "Sat", value1: 75, value2: 65, value3: 80, value4: 80 },
  { day: "Sun", value1: 60, value2: 50, value3: 65, value4: 60 },
];

const weeklyAttendanceData = [
  { month: "Jan", value1: 50, value2: 40, value3: 60, value4: 55 },
  { month: "Feb", value1: 55, value2: 45, value3: 65, value4: 60 },
  { month: "Mar", value1: 60, value2: 50, value3: 70, value4: 65 },
  { month: "Apr", value1: 65, value2: 55, value3: 75, value4: 70 },
  { month: "May", value1: 70, value2: 60, value3: 80, value4: 75 },
  { month: "Jun", value1: 75, value2: 65, value3: 85, value4: 80 },
  { month: "Jul", value1: 55, value2: 45, value3: 65, value4: 60 },
  { month: "Aug", value1: 60, value2: 50, value3: 70, value4: 65 },
  { month: "Sep", value1: 65, value2: 55, value3: 75, value4: 70 },
  { month: "Oct", value1: 70, value2: 60, value3: 80, value4: 75 },
  { month: "Nov", value1: 60, value2: 50, value3: 70, value4: 65 },
  { month: "Dec", value1: 65, value2: 55, value3: 75, value4: 70 },
];

const topRevenueGenerators = [
  { name: "Alice W.", value: 15420, color: "var(--color-primary)" },
  { name: "Box braids", value: 12345, color: "var(--color-secondary)" },
  { name: "Hair Coloring", value: 9876, color: "var(--color-warning)" },
  { name: "Dr Robert (stylist)", value: 8543, color: "var(--color-success)" },
  { name: "Cornrows", value: 7654, color: "var(--color-primary-light)" },
  { name: "Anna Stylist", value: 6432, color: "var(--color-error)" },
];

const recentUserActivity = [
  {
    user: "Alice W.",
    action: "New user Alice W. created a new page SALOON in Section 3.",
    time: "Just now",
    color: "bg-blue-50/80 border border-blue-100"
  },
  {
    user: "Dr Robert",
    action: "Dr Robert created a new page WORKSPACE in Section 2.",
    time: "In last 30 minutes",
    color: "bg-pink-50/80 border border-pink-100"
  },
  {
    user: "Alice W.",
    action: "Alice W. has left 10 annotations for you on some files.",
    time: "12:47 PM 12 Feb 2025",
    color: "bg-orange-50/80 border border-orange-100"
  },
  {
    user: "Dr Robert",
    action: "Dr Robert has left 6 annotations.",
    time: "Today at 12:24",
    color: "bg-[var(--color-primary-light)] border border-[var(--color-primary-light)]"
  },
];

import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function Dashboard() {
  const { t } = useTranslation();
  const { getCardStyle } = useKpiCardStyle();
  const { user, hasPermission, canAddIncome, canAddExpenses, getWorkerId, isClient } = useAuth();

  if (isClient) {
    return (
      <MainLayout>
        <ClientDashboard />
      </MainLayout>
    );
  }

  const isWorker = user?.role === 'worker';
  const workerName = user?.name || "Orphelia"; // Default for demo

  // Filter Data for Workers
  const filteredTopPerformers = isWorker
    ? topPerformers.filter(p => p.name === workerName || p.name === "Isabelle") // Show themselves or a relevant subset
    : topPerformers;

  const filteredTodaysSessions = isWorker
    ? todaysSessions.filter(s => s.worker === workerName)
    : todaysSessions;

  const filteredRecentActivities = isWorker
    ? recentActivities.filter(a => a.worker === workerName)
    : recentActivities;

  // For charts and KPIs, in a real app we'd fetch worker-specific totals.
  // In demo mode, we'll scale them down or use subsets.
  const workerMonthlyRevenue = isWorker
    ? monthlyRevenueData.map(d => ({ ...d, value: Math.round(d.value * 0.4) }))
    : monthlyRevenueData;

  const workerMonthlyExpenses = isWorker
    ? monthlyExpensesData.map(d => ({ ...d, value: Math.round(d.value * 0.2) }))
    : monthlyExpensesData;

  const workerProfitData = isWorker
    ? profitData.map(d => ({
      ...d,
      revenue: Math.round(d.revenue * 0.4),
      expenses: Math.round(d.expenses * 0.2),
      profit: Math.round(d.revenue * 0.4 - d.expenses * 0.2)
    }))
    : profitData;

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          {/* Date Picker or Filters could go here */}
        </div>

        {/* --- Stats Gradient Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div
            className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]"
            style={getCardStyle(0)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{isWorker ? "My Revenue" : "Total Income"}</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€{isWorker ? "18,356" : "45,890"}</h3>
                <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+12%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div
            className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]"
            style={getCardStyle(1)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{isWorker ? "My Contribution to Expenses" : "Total Expenses"}</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€{isWorker ? "5,690" : "28,450"}</h3>
                <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+2.5%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div
            className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]"
            style={getCardStyle(2)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{isWorker ? "My Profit Contribution" : "Net Profit"}</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€{isWorker ? "12,666" : "17,440"}</h3>
                <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+5.4%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Clients/Workers */}
          <div
            className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]"
            style={getCardStyle(3)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{isWorker ? "My Total Clients" : "Total Clients"}</p>
                <h3 className="text-2xl sm:text-3xl font-bold">{isWorker ? "114" : "287"}</h3>
                <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+8%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Quick Actions --- */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canAddIncome() && (
              <Link href="/income/add">
                <button className="w-full h-full flex items-center justify-center gap-3 bg-[var(--color-primary)] hover:opacity-90 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
                  <Plus className="w-5 h-5" />
                  <span>Add Revenue</span>
                </button>
              </Link>
            )}
            {canAddExpenses() && (
              <Link href="/expenses/add">
                <button className="w-full h-full flex items-center justify-center gap-3 bg-[var(--color-secondary)] hover:opacity-90 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
                  <Wallet className="w-5 h-5" />
                  <span>Add Expense</span>
                </button>
              </Link>
            )}
            {hasPermission(['manager', 'admin']) && (
              <Link href="/workers/add">
                <button className="w-full h-full flex items-center justify-center gap-3 bg-[var(--color-warning)] hover:opacity-90 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
                  <Users className="w-5 h-5" />
                  <span>Add Worker</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card className="p-6 border-t-4 border-[var(--color-primary)] bg-[var(--color-primary-light)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
                <p className="text-xs text-gray-500">Year 2026</p>
              </div>
              <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold px-2 py-1 rounded">Yearly</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workerMonthlyRevenue}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 4, 4]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Expenses Chart */}
          <Card className="p-6 border-t-4 border-[var(--color-secondary)] bg-[var(--color-secondary-light)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Expenses</h3>
                <p className="text-xs text-gray-500">Year 2026</p>
              </div>
              <span className="bg-[var(--color-secondary-light)] text-[var(--color-secondary)] text-xs font-bold px-2 py-1 rounded">Yearly</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workerMonthlyExpenses}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: 'var(--color-secondary-light)', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="var(--color-secondary)" radius={[4, 4, 4, 4]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* --- Profit Analysis (Full Width) --- */}
        <Card className="p-6 border-t-4 border-[var(--color-warning)] bg-[var(--color-warning-light)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Profit Analysis</h3>
              <p className="text-xs text-gray-500">Revenue vs Expenses (2026)</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">Monthly</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={workerProfitData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-secondary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="profit" stroke="var(--color-warning)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div> Revenue
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-[var(--color-secondary)]"></div> Expenses
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]"></div> Profit
            </div>
          </div>
        </Card>

        {/* --- Top Performers Grid --- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">{isWorker ? "My Performance" : "Top Performing Team"}</h3>
            <Link href="/workers" className="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline">
              View All Workers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTopPerformers.map((worker, idx) => (
              <Card key={worker.name} className={`p-4 flex flex-col gap-3 transition-all border ${idx === 0 ? "bg-[var(--color-primary-light)] border-[var(--color-primary-light)] hover:border-[var(--color-primary)] hover:shadow-lg" :
                idx === 1 ? "bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] hover:border-[var(--color-secondary)] hover:shadow-lg" :
                  idx === 2 ? "bg-[var(--color-warning-light)] border-[var(--color-warning-light)] hover:border-[var(--color-warning)] hover:shadow-lg" :
                    "bg-[var(--color-success-light)] border-[var(--color-success-light)] hover:border-[var(--color-success)] hover:shadow-lg"
                }`}>
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

        {/* --- Middle Section: Services & Expense Categories --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Services */}
          <Card className="lg:col-span-2 p-6 bg-white hover:bg-gray-50/50 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">{isWorker ? "My Services Today" : "Today's Services"}</h3>
              <div className="flex gap-2">
                <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold px-3 py-1 rounded-full">5 / 12 Completed</span>
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
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-2">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTodaysSessions.map((session, index) => (
                    <tr key={index} className={`transition-colors ${index % 5 === 0 ? "bg-[var(--color-primary-light)] hover:opacity-80" :
                      index % 5 === 1 ? "bg-[var(--color-secondary-light)] hover:opacity-80" :
                        index % 5 === 2 ? "bg-[var(--color-warning-light)] hover:opacity-80" :
                          index % 5 === 3 ? "bg-[var(--color-success-light)] hover:opacity-80" :
                            "bg-blue-50/20 hover:opacity-80"
                      }`}>
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
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${session.statusColor}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right font-bold text-gray-900">{session.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {!isWorker && (
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-6">Cost Distribution</h3>
              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
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
                    <p className="text-xl font-bold text-gray-900">€23K</p>
                    <p className="text-xs text-gray-500">Expenses</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {expenseCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">€{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* --- Bottom Section: Notifications & Activities --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Attendance */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-6">Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value1" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value2" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value3" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value4" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="w-5 h-5 text-[var(--color-warning)]" />
              <h3 className="font-bold text-gray-900">Recent Activities</h3>
            </div>
            <div className="space-y-4">
              {filteredRecentActivities.slice(0, 4).map((activity, idx) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${idx === 0 ? "bg-[var(--color-primary-light)] border-[var(--color-primary-light)] hover:opacity-80" :
                  idx === 1 ? "bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] hover:opacity-80" :
                    idx === 2 ? "bg-[var(--color-warning-light)] border-[var(--color-warning-light)] hover:opacity-80" :
                      "bg-[var(--color-success-light)] border-[var(--color-success-light)] hover:opacity-80"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {activity.client.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{activity.client}</p>
                      <p className="text-xs text-gray-500">{activity.service} • {activity.worker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{activity.amount}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {!isWorker && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Forecast */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Monthly Forecast and Stats</h3>
                  <p className="text-xs text-gray-500">Based on last 4 years</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">Daily</button>
                  <button className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-400">Weekly</button>
                  <button className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-400">Monthly</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyForecastData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value1" stackId="a" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="value2" stackId="a" fill="var(--color-secondary)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="value3" stackId="a" fill="var(--color-warning)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="value4" stackId="a" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top 10 Revenue Generators */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Top 10 Revenue Generators</h3>
                <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {topRevenueGenerators.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">€{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.value / 15420) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {!isWorker && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-t-4 border-[var(--color-primary)] bg-[var(--color-primary-light)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bookings</p>
                  <h2 className="text-4xl font-bold text-gray-900">847</h2>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +11% increase
                  </p>
                </div>
                <div className="bg-[var(--color-primary-light)] p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-t-4 border-[var(--color-secondary)] bg-[var(--color-secondary-light)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Members</p>
                  <h2 className="text-4xl font-bold text-gray-900">42</h2>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +3% increase
                  </p>
                </div>
                <div className="bg-[var(--color-secondary-light)] p-3 rounded-lg">
                  <Users className="w-6 h-6 text-[var(--color-secondary)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-t-4 border-[var(--color-warning)] bg-[var(--color-warning-light)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Occupancy Rate</p>
                  <h2 className="text-4xl font-bold text-gray-900">75%</h2>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +5% increase
                  </p>
                </div>
                <div className="bg-[var(--color-warning-light)] p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- Weekly Attendance & Recent User Activity --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-bold text-gray-900">Recent Notifications</h3>
            </div>
            <div className="space-y-4">
              {recentNotifications.map((notif, idx) => {
                const Icon = notif.icon;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl transition-colors border ${notif.type === "success" ? "bg-green-50/80 border-green-100 hover:bg-green-100/80" :
                    notif.type === "warning" ? "bg-yellow-50/80 border-yellow-100 hover:bg-yellow-100/80" :
                      "bg-blue-50/80 border-blue-100 hover:bg-blue-100/80"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === "success" ? "bg-green-100 text-green-600" :
                      notif.type === "warning" ? "bg-yellow-100 text-yellow-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {notif.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent User Activity & Alerts */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Recent User Activity & Alerts</h3>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 bg-[var(--color-primary)] text-white rounded-full font-medium">Filters</button>
                <button className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Archive</button>
                <button className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Delete</button>
              </div>
            </div>
            <div className="space-y-3">
              {recentUserActivity.map((activity, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${activity.color} transition-all hover:shadow-md`}>
                  <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
