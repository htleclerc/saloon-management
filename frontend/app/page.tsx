"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
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
  { name: "Alice W.", value: 15420, color: "#8B5CF6" },
  { name: "Box braids", value: 12345, color: "#EC4899" },
  { name: "Hair Coloring", value: 9876, color: "#F59E0B" },
  { name: "Dr Robert (stylist)", value: 8543, color: "#10B981" },
  { name: "Cornrows", value: 7654, color: "#3B82F6" },
  { name: "Anna Stylist", value: 6432, color: "#EF4444" },
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
    color: "bg-purple-50/80 border border-purple-100"
  },
];

export default function Dashboard() {
  const { t } = useTranslation();

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
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Income</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€45,890</h3>
                <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+12%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">Total Expenses</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€28,450</h3>
                <p className="text-xs text-pink-100 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+2.5%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-50 text-sm font-medium mb-1">Net Profit</p>
                <h3 className="text-2xl sm:text-3xl font-bold">€17,440</h3>
                <p className="text-xs text-orange-100 mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+5.4%</span> vs last month
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Clients/Workers */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-teal-50 text-sm font-medium mb-1">Total Clients</p>
                <h3 className="text-2xl sm:text-3xl font-bold">287</h3>
                <p className="text-xs text-teal-100 mt-2 flex items-center gap-1">
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
            <Link href="/income/add">
              <button className="w-full h-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                <Plus className="w-5 h-5" />
                <span>Add Revenue</span>
              </button>
            </Link>
            <Link href="/expenses/add">
              <button className="w-full h-full flex items-center justify-center gap-3 bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                <Wallet className="w-5 h-5" />
                <span>Add Expense</span>
              </button>
            </Link>
            <Link href="/workers/add">
              <button className="w-full h-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                <Users className="w-5 h-5" />
                <span>Add Worker</span>
              </button>
            </Link>
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card className="p-6 border-t-4 border-purple-500 bg-purple-50/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
                <p className="text-xs text-gray-500">Year 2026</p>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Yearly</span>
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

          {/* Monthly Expenses Chart */}
          <Card className="p-6 border-t-4 border-pink-500 bg-pink-50/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Expenses</h3>
                <p className="text-xs text-gray-500">Year 2026</p>
              </div>
              <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded">Yearly</span>
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

        {/* --- Profit Analysis (Full Width) --- */}
        <Card className="p-6 border-t-4 border-orange-500 bg-orange-50/10">
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

        {/* --- Top Performers Grid --- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Top Performing Team</h3>
            <Link href="/workers" className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline">
              View All Workers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPerformers.map((worker, idx) => (
              <Card key={worker.name} className={`p-4 flex flex-col gap-3 transition-all border ${idx === 0 ? "bg-purple-50/30 border-purple-100 hover:border-purple-200 hover:shadow-lg" :
                idx === 1 ? "bg-pink-50/30 border-pink-100 hover:border-pink-200 hover:shadow-lg" :
                  idx === 2 ? "bg-orange-50/30 border-orange-100 hover:border-orange-200 hover:shadow-lg" :
                    "bg-teal-50/30 border-teal-100 hover:border-teal-200 hover:shadow-lg"
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
              <h3 className="font-bold text-gray-900">Today's Services</h3>
              <div className="flex gap-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">5 / 12 Completed</span>
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
                  {todaysSessions.map((session, index) => (
                    <tr key={index} className={`transition-colors ${index % 5 === 0 ? "bg-purple-50/20 hover:bg-purple-50/40" :
                      index % 5 === 1 ? "bg-pink-50/20 hover:bg-pink-50/40" :
                        index % 5 === 2 ? "bg-orange-50/20 hover:bg-orange-50/40" :
                          index % 5 === 3 ? "bg-teal-50/20 hover:bg-teal-50/40" :
                            "bg-blue-50/20 hover:bg-blue-50/40"
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

          {/* Expense Categories Pie */}
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
                <Bar dataKey="value1" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value2" fill="#EC4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value3" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Recent Activities</h3>
            </div>
            <div className="space-y-4">
              {recentActivities.slice(0, 4).map((activity, idx) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${idx === 0 ? "bg-purple-50/80 border-purple-100 hover:bg-purple-100/80" :
                  idx === 1 ? "bg-pink-50/80 border-pink-100 hover:bg-pink-100/80" :
                    idx === 2 ? "bg-orange-50/80 border-orange-100 hover:bg-orange-100/80" :
                      "bg-teal-50/80 border-teal-100 hover:bg-teal-100/80"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
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

        {/* --- Monthly Forecast & Top 10 Revenue --- */}
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
                <Bar dataKey="value1" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="value2" stackId="a" fill="#EC4899" radius={[0, 0, 0, 0]} />
                <Bar dataKey="value3" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="value4" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 Revenue Generators */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Top 10 Revenue Generators</h3>
              <button className="text-purple-600 text-sm font-medium hover:underline">View All</button>
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

        {/* --- Three Stats Cards Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-purple-500 bg-purple-50/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bookings</p>
                <h2 className="text-4xl font-bold text-gray-900">847</h2>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +11% increase
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-t-4 border-pink-500 bg-pink-50/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Members</p>
                <h2 className="text-4xl font-bold text-gray-900">42</h2>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% increase
                </p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-t-4 border-orange-500 bg-orange-50/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Occupancy Rate</p>
                <h2 className="text-4xl font-bold text-gray-900">75%</h2>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5% increase
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* --- Weekly Attendance & Recent User Activity --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-purple-600" />
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
                <button className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full font-medium">Filters</button>
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

      </div >
    </MainLayout >
  );
}
