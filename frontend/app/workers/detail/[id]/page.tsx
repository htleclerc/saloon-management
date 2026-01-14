"use client";

import { use } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    DollarSign,
    TrendingUp,
    Star,
    Calendar,
    Clock,
    Mail,
    Phone,
    Edit,
    MapPin,
    Award,
    Users,
    BarChart3,
    Percent,
    Eye,
    ChevronDown,
} from "lucide-react";
import {
    LineChart,
    Line,
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
} from "recharts";

// Mock data - Worker Profile
const workerData = {
    id: 1,
    name: "Orphelia",
    email: "orphelia@adorablebraids.com",
    phone: "+33 6 12 34 56 78",
    status: "Active",
    role: "Braider",
    location: "Paris, France",
};

// Performance Overview Cards
const performanceCards = [
    { label: "C$8,430", sublabel: "Total Sales", color: "text-purple-600" },
    { label: "C$40,094", sublabel: "Total Expenses", color: "text-pink-600" },
    { label: "467", sublabel: "Total Services", color: "text-orange-600" },
    { label: "4.0", sublabel: "Rating", color: "text-teal-600" },
    { label: "C$8,770", sublabel: "Net Profit", color: "text-blue-600" },
];

// Performance Center - Weekly Revenue Breakdown
const weeklyRevenueData = [
    { name: "Mon", value: 65 },
    { name: "Tue", value: 80 },
    { name: "Wed", value: 55 },
    { name: "Thu", value: 90 },
    { name: "Fri", value: 70 },
    { name: "Sat", value: 85 },
    { name: "Sun", value: 60 },
    { name: "Mon", value: 75 },
    { name: "Tue", value: 65 },
    { name: "Wed", value: 80 },
    { name: "Thu", value: 70 },
    { name: "Fri", value: 85 },
];

// Client Volume Trend
const clientVolumeTrend = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 55 },
    { month: "Mar", value: 45 },
    { month: "Apr", value: 60 },
    { month: "May", value: 50 },
    { month: "Jun", value: 65 },
];

// Earnings Breakdown Analysis
const earningsBreakdownData = [
    { month: "Jan", braids: 35, twists: 28, cornrows: 22, locs: 18 },
    { month: "Feb", braids: 40, twists: 32, cornrows: 25, locs: 20 },
    { month: "Mar", braids: 38, twists: 30, cornrows: 23, locs: 19 },
    { month: "Apr", braids: 45, twists: 35, cornrows: 28, locs: 22 },
    { month: "May", braids: 42, twists: 33, cornrows: 26, locs: 21 },
    { month: "Jun", braids: 48, twists: 38, cornrows: 30, locs: 24 },
];

// Weekly Performance Details Table
const weeklyPerformanceDetails = [
    { date: "January 2024", clients: 42, services: 45, revenue: 4500, expenses: 1200, profit: 3300 },
    { date: "February 2024", clients: 38, services: 42, revenue: 4200, expenses: 1100, profit: 3100 },
    { date: "March 2024", clients: 45, services: 48, revenue: 4800, expenses: 1300, profit: 3500 },
    { date: "April 2024", clients: 50, services: 55, revenue: 5500, expenses: 1500, profit: 4000 },
    { date: "May 2024", clients: 48, services: 52, revenue: 5200, expenses: 1400, profit: 3800 },
    { date: "June 2024", clients: 52, services: 58, revenue: 5800, expenses: 1600, profit: 4200 },
    { date: "July 2024", clients: 55, services: 60, revenue: 6000, expenses: 1700, profit: 4300 },
    { date: "August 2024", clients: 58, services: 65, revenue: 6500, expenses: 1800, profit: 4700 },
    { date: "September 2024", clients: 60, services: 68, revenue: 6800, expenses: 1900, profit: 4900 },
    { date: "October 2024", clients: 62, services: 70, revenue: 7000, expenses: 2000, profit: 5000 },
];

// Salary / Performance Details
const salaryPerformanceData = [
    { month: "Jan", value1: 50, value2: 40, value3: 60, value4: 55 },
    { month: "Feb", value1: 55, value2: 45, value3: 65, value4: 58 },
    { month: "Mar", value1: 52, value2: 42, value3: 62, value4: 56 },
    { month: "Apr", value1: 58, value2: 48, value3: 68, value4: 60 },
    { month: "May", value1: 60, value2: 50, value3: 70, value4: 62 },
    { month: "Jun", value1: 65, value2: 55, value3: 75, value4: 68 },
];

// Daily Activities Log
const dailyActivities = [
    { time: "9:00 AM", client: "Marie Dubois", service: "Box Braids", status: "Completed", amount: "C$120" },
    { time: "11:30 AM", client: "Sophie Laurent", service: "Twists", status: "Completed", amount: "C$95" },
    { time: "2:00 PM", client: "Anna Martin", service: "Cornrows", status: "In Progress", amount: "C$85" },
    { time: "4:30 PM", client: "Claire Petit", service: "Locs", status: "Pending", amount: "C$150" },
];

// Client Satisfaction Ratings
const clientSatisfactionData = [
    { name: "Marie Dubois", rating: 4.9, service: "Box Braids", date: "2 days ago", avatar: "M", color: "bg-purple-100 text-purple-600" },
    { name: "Sophie Laurent", rating: 4.8, service: "Twists", date: "1 week ago", avatar: "S", color: "bg-pink-100 text-pink-600" },
    { name: "Anna Martin", rating: 5.0, service: "Cornrows", date: "2 weeks ago", avatar: "A", color: "bg-orange-100 text-orange-600" },
];

// Service Time Distribution
const serviceTimeDistribution = [
    { name: "Box Braids", value: 35, color: "#8B5CF6" },
    { name: "Twists", value: 25, color: "#EC4899" },
    { name: "Cornrows", value: 20, color: "#F59E0B" },
    { name: "Locs", value: 12, color: "#10B981" },
    { name: "Other", value: 8, color: "#3B82F6" },
];

// Top Appointment Services
const topAppointmentServices = [
    { name: "Box Braids", count: 156, revenue: "C$18,720", percentage: 35 },
    { name: "Senegalese Twists", count: 98, revenue: "C$12,740", percentage: 25 },
    { name: "Cornrows", count: 87, revenue: "C$7,395", percentage: 20 },
    { name: "Locs Maintenance", count: 65, revenue: "C$9,750", percentage: 12 },
];

// Overall Performance Summary
const overallPerformanceData = [
    { month: "Jan", value1: 55, value2: 45, value3: 65, value4: 50 },
    { month: "Feb", value1: 60, value2: 50, value3: 70, value4: 55 },
    { month: "Mar", value1: 58, value2: 48, value3: 68, value4: 52 },
    { month: "Apr", value1: 65, value2: 55, value3: 75, value4: 58 },
    { month: "May", value1: 70, value2: 60, value3: 80, value4: 62 },
    { month: "Jun", value1: 75, value2: 65, value3: 85, value4: 68 },
    { month: "Jul", value1: 72, value2: 62, value3: 82, value4: 65 },
    { month: "Aug", value1: 78, value2: 68, value3: 88, value4: 70 },
    { month: "Sep", value1: 80, value2: 70, value3: 90, value4: 72 },
    { month: "Oct", value1: 85, value2: 75, value3: 95, value4: 78 },
    { month: "Nov", value1: 82, value2: 72, value3: 92, value4: 75 },
    { month: "Dec", value1: 88, value2: 78, value3: 98, value4: 80 },
];

// Top 5 Repeat Clients
const topRepeatClients = [
    { name: "Marie Dubois", visits: 24, spent: "C$2,880", avatar: "M", color: "bg-purple-100 text-purple-600" },
    { name: "Sophie Laurent", visits: 18, spent: "C$1,710", avatar: "S", color: "bg-pink-100 text-pink-600" },
    { name: "Anna Martin", visits: 15, spent: "C$1,275", avatar: "A", color: "bg-orange-100 text-orange-600" },
    { name: "Claire Petit", visits: 12, spent: "C$1,800", avatar: "C", color: "bg-teal-100 text-teal-600" },
    { name: "Emma Bernard", visits: 10, spent: "C$950", avatar: "E", color: "bg-blue-100 text-blue-600" },
];

// Revenue vs Expenses
const revenueVsExpensesData = [
    { name: "Revenue", value: 45000, color: "#8B5CF6" },
    { name: "Expenses", value: 12000, color: "#EC4899" },
    { name: "Profit", value: 33000, color: "#10B981" },
];

// Bottom Product Cards
const productCards = [
    { name: "Hair Care Products", revenue: "C$4,500", sales: 45, gradient: "from-pink-500 to-pink-600" },
    { name: "Styling Tools", revenue: "C$3,200", sales: 32, gradient: "from-orange-500 to-orange-600" },
];

// Worker Activity Feed
const activityFeed = [
    { action: "Completed service for Marie D.", time: "2 hours ago", type: "success" },
    { action: "New booking confirmed", time: "4 hours ago", type: "info" },
    { action: "Received 5-star review", time: "Yesterday", type: "success" },
];

// Bottom Stats Cards
const bottomStatsCards = [
    { label: "Active Appointments", value: "12", sublabel: "This Week", color: "bg-purple-50 border-purple-200" },
    { label: "Client Retention", value: "87%", sublabel: "Monthly", color: "bg-pink-50 border-pink-200" },
    { label: "Avg. Service Time", value: "2.5h", sublabel: "Per Client", color: "bg-orange-50 border-orange-200" },
];

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orphelia&apos;s Performance</h1>
                        <p className="text-sm text-gray-500">Detailed analytics and performance metrics</p>
                    </div>
                </div>

                {/* Header Section - Purple Gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Profile Image */}
                            <div className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center border-4 border-white/30 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
                                    alt="Orphelia"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-3xl font-bold text-purple-600">O</span>';
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{workerData.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 text-purple-100 text-sm mt-1">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {workerData.email}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {workerData.phone}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                                        {workerData.role}
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-400/30 rounded text-xs font-medium flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>
                                        {workerData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/workers/edit-advanced/${id}`}>
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs">
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit Profile
                                </Button>
                            </Link>
                            <Button variant="primary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50 text-xs">
                                Download Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Performance Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {performanceCards.map((card, idx) => (
                        <Card key={idx} className="p-4 text-center">
                            <h3 className={`text-xl font-bold ${card.color}`}>{card.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{card.sublabel}</p>
                        </Card>
                    ))}
                </div>

                {/* Performance Center - Action Buttons */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Center</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4" />
                            View Financials
                        </button>
                        <button className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            View Schedule
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                            <Users className="w-4 h-4" />
                            View Clients
                        </button>
                    </div>
                </div>

                {/* Weekly Revenue Breakdown & Client Volume Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Revenue Breakdown */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900">Weekly Revenue Breakdown</h3>
                                <p className="text-xs text-gray-500">Last 12 weeks</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Client Volume Trend */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900">Client Volume Trend</h3>
                                <p className="text-xs text-gray-500">6 months overview</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={clientVolumeTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                                <Line type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={3} dot={{ fill: "#EC4899", r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Earnings Breakdown Analysis */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900">Earnings Breakdown Analysis</h3>
                            <p className="text-xs text-gray-500">By service type - Last 6 months</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={earningsBreakdownData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="braids" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="twists" fill="#EC4899" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="cornrows" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="locs" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-purple-500"></div>
                            <span className="text-gray-600">Braids</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-pink-500"></div>
                            <span className="text-gray-600">Twists</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-orange-500"></div>
                            <span className="text-gray-600">Cornrows</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded bg-teal-500"></div>
                            <span className="text-gray-600">Locs</span>
                        </div>
                    </div>
                </Card>

                {/* Weekly Performance Details Table */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Weekly Performance Details</h3>
                        <Button variant="outline" size="sm" className="text-xs">
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show All
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Period</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Clients</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Services</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Revenue</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Expenses</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Profit</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {weeklyPerformanceDetails.slice(0, 6).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                        <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                        <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                        <td className="px-3 py-3 text-right text-green-600 font-medium">C${row.revenue.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-red-500 font-medium">C${row.expenses.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-purple-600 font-bold">C${row.profit.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-center">
                                            <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Salary / Performance Details Chart */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900">Salary / Performance Details</h3>
                            <p className="text-xs text-gray-500">Monthly breakdown</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Daily</button>
                            <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Weekly</button>
                            <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">Monthly</button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={salaryPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="value1" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value2" fill="#EC4899" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value3" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Daily Activities Log & Client Satisfaction */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Activities Log */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Daily Activities Log</h3>
                        <div className="space-y-3">
                            {dailyActivities.map((activity, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${activity.status === "Completed" ? "bg-green-50 border-green-100" :
                                    activity.status === "In Progress" ? "bg-blue-50 border-blue-100" :
                                        "bg-yellow-50 border-yellow-100"
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border">
                                                {activity.client.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{activity.client}</p>
                                                <p className="text-xs text-gray-500">{activity.service} • {activity.time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">{activity.amount}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${activity.status === "Completed" ? "bg-green-100 text-green-700" :
                                                activity.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Client Satisfaction Ratings */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Client Satisfaction Ratings</h3>
                        <div className="space-y-3">
                            {clientSatisfactionData.map((client, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center font-bold`}>
                                            {client.avatar}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                                            <p className="text-xs text-gray-500">{client.service} • {client.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-bold text-gray-900">{client.rating}</span>
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* My Revenue Summary & Service Time Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Revenue Summary */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">My Revenue Summary</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-gray-500">This Week</p>
                                <p className="text-lg font-bold text-purple-600">C$1,250</p>
                            </div>
                            <div className="text-center p-3 bg-pink-50 rounded-lg">
                                <p className="text-xs text-gray-500">This Month</p>
                                <p className="text-lg font-bold text-pink-600">C$4,890</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500">This Year</p>
                                <p className="text-lg font-bold text-orange-600">C$45,670</p>
                            </div>
                        </div>
                    </Card>

                    {/* Service Time Distribution */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Service Time Distribution</h3>
                        <div className="flex items-center justify-between">
                            <div className="w-1/2">
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie
                                            data={serviceTimeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {serviceTimeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-2">
                                {serviceTimeDistribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Top Appointment Services & Overall Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Appointment Services */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Top Appointment Services</h3>
                        <div className="space-y-3">
                            {topAppointmentServices.map((service, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-900">{service.name}</span>
                                        <span className="text-gray-600">{service.count} bookings • {service.revenue}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${service.percentage}%`,
                                                backgroundColor: idx === 0 ? "#8B5CF6" : idx === 1 ? "#EC4899" : idx === 2 ? "#F59E0B" : "#10B981"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Overall View */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Overall View</h3>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                                        <circle cx="48" cy="48" r="40" stroke="#8B5CF6" strokeWidth="8" fill="none"
                                            strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">75%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Goal Progress</p>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Target Revenue</span>
                                    <span className="font-bold text-gray-900">C$60,000</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Achieved</span>
                                    <span className="font-bold text-green-600">C$45,000</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Remaining</span>
                                    <span className="font-bold text-orange-600">C$15,000</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Weekly Performance Summary Chart */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Weekly Performance Summary Chart</h3>
                        <Button variant="outline" size="sm" className="text-xs">
                            Download Report
                        </Button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={overallPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="value1" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value2" fill="#EC4899" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value3" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top 5 Repeat Clients & Revenue vs Expenses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 5 Repeat Clients */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Top 5 Repeat Clients</h3>
                        <div className="space-y-3">
                            {topRepeatClients.map((client, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center font-bold`}>
                                            {client.avatar}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                                            <p className="text-xs text-gray-500">{client.visits} visits</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-purple-600">{client.spent}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Revenue vs Expenses */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Top Revenue Services</h3>
                        <div className="flex items-center">
                            <div className="w-1/2">
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={serviceTimeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                            dataKey="value"
                                        >
                                            {serviceTimeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-3">
                                {serviceTimeDistribution.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        <span className="text-sm font-bold" style={{ color: item.color }}>C${(item.value * 100).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Performance Table (Full Width) */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Overall Performance Summary</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Month</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Services</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Clients</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Revenue</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Expenses</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Net Profit</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {weeklyPerformanceDetails.slice(0, 8).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                        <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                        <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                        <td className="px-3 py-3 text-right text-green-600 font-medium">C${row.revenue.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-red-500 font-medium">C${row.expenses.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-purple-600 font-bold">C${row.profit.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">4.{8 + idx % 2}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Worker Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Worker Activity Feed</h3>
                        <div className="space-y-3">
                            {activityFeed.map((activity, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${activity.type === "success" ? "bg-green-50 border-green-100" : "bg-blue-50 border-blue-100"
                                    }`}>
                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        {bottomStatsCards.map((card, idx) => (
                            <Card key={idx} className={`p-4 border-2 ${card.color}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                        <p className="text-xs text-gray-500">{card.sublabel}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Bottom Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {productCards.map((product, idx) => (
                        <Card key={idx} className={`p-6 bg-gradient-to-r ${product.gradient} text-white`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-lg">{product.name}</h4>
                                    <p className="text-white/80 text-sm">{product.sales} sales this month</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{product.revenue}</p>
                                    <p className="text-white/80 text-sm">Revenue</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

            </div>
        </MainLayout>
    );
}
