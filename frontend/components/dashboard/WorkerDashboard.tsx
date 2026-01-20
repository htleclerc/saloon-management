"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    DollarSign,
    TrendingUp,
    Users,
    Star,
    Clock,
    MessageSquare,
    ChevronRight,
    ArrowUpRight,
    Award,
    Bell,
    CheckCircle,
    AlertTriangle,
    Receipt,
    History,
    CheckCircle2,
    LayoutGrid,
    BarChart2
} from "lucide-react";
import { UserRole } from "@/context/AuthProvider";
import { canPerformBookingAction } from "@/lib/permissions";
import { BookingStatus } from "@/types";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";

interface WorkerDashboardProps {
    workerName: string;
    revenueData: any[];
    sessions: any[];
    activities: any[];
    notifications: any[];
    userActivities: any[];
    onStartBooking?: (id: number) => void;
    userRole?: string;
}

const comments = [
    { id: 1, client: "Marie Anderson", comment: "Isabelle was amazing! My box braids look perfect.", rating: 5, date: "2h ago" },
    { id: 2, client: "Lina Davis", comment: "Great service, very professional. Highly recommend.", rating: 4, date: "1d ago" },
    { id: 3, client: "Anna Brown", comment: "Always a pleasure to be serviced by Isabelle.", rating: 5, date: "2d ago" },
    { id: 4, client: "Lisa Wilson", comment: "Very happy with my new braids!", rating: 5, date: "3d ago" },
    { id: 5, client: "Sophie Martin", comment: "Professional and quick service.", rating: 4, date: "4d ago" },
];

export default function WorkerDashboard({
    workerName,
    revenueData,
    sessions,
    activities,
    notifications,
    userActivities,
    onStartBooking,
    userRole = "worker"
}: WorkerDashboardProps) {
    const { getCardStyle } = useKpiCardStyle();
    const feedbackRef = useRef<HTMLDivElement>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"simple" | "advanced">("advanced");
    const [selectedHistory, setSelectedHistory] = useState<{ title: string, subtitle: string, events: HistoryEvent[] }>({
        title: "",
        subtitle: "",
        events: []
    });

    const scrollToFeedback = () => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleViewHistory = (session: any) => {
        setSelectedHistory({
            title: `Appointment History`,
            subtitle: `Client: ${session.client} | Service: ${session.type}`,
            events: session.history || []
        });
        setHistoryModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Hello, {workerName} <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1">Ready for another productive day at the salon?</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* View Toggle - Left in Desktop */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                        <button
                            onClick={() => setViewMode("simple")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "simple"
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>Agenda</span>
                        </button>
                        <button
                            onClick={() => setViewMode("advanced")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "advanced"
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <BarChart2 className="w-4 h-4" />
                            <span>Analytics</span>
                        </button>
                    </div>

                    {/* Date Toggle */}
                    <div className="flex items-center gap-1.5 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                        <button className="px-3 py-1.5 text-xs font-bold bg-white text-gray-900 rounded-lg shadow-sm border border-gray-100">Today</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-white/50 rounded-lg transition-all">Week</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-white/50 rounded-lg transition-all">Month</button>
                    </div>
                </div>
            </div>

            {viewMode === "advanced" ? (
                <>
                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+12.5%</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">My Revenue</p>
                                <h3 className="text-3xl font-bold mt-1">€18,356</h3>
                            </div>
                        </div>

                        <div
                            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%)' }}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+8%</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">Total Clients</p>
                                <h3 className="text-3xl font-bold mt-1">114</h3>
                            </div>
                        </div>

                        <div
                            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">New</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">Avg Rating</p>
                                <h3 className="text-3xl font-bold mt-1">4.9</h3>
                            </div>
                        </div>

                        <div
                            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+15%</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">Efficiency</p>
                                <h3 className="text-3xl font-bold mt-1">94%</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Performance Chart */}
                        <Card className="lg:col-span-2 p-6 border-none shadow-xl shadow-gray-200/50 overflow-hidden bg-white rounded-3xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Earnings Overview</h3>
                                    <p className="text-sm text-gray-500">Your performance over the last 6 months</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <ArrowUpRight className="w-3 h-3" />
                                        12.5% Up
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                padding: '12px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="var(--color-primary)"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Personal Profile/Summary Card */}
                        <Card className="p-0 border-none shadow-xl shadow-gray-200/50 overflow-hidden bg-white rounded-3xl flex flex-col">
                            <div className="p-6 bg-gradient-to-br from-[var(--color-primary)] to-[#7c3aed] text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30">
                                        {workerName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold">{workerName}</h3>
                                            <Award className="w-4 h-4 text-yellow-300" />
                                        </div>
                                        <p className="text-white/80 text-sm">Senior Barber • Level 4</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6 flex-1">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl hover:bg-gray-100/80 transition-colors group cursor-pointer" onClick={scrollToFeedback}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl group-hover:scale-110 transition-transform">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">4.9 Overall</p>
                                                <p className="text-xs text-gray-500">Based on 114 reviews</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl hover:bg-gray-100/80 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[var(--color-secondary-light)] text-[var(--color-secondary)] rounded-xl group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Rank #1</p>
                                                <p className="text-xs text-gray-500">Top performer this month</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button variant="outline" className="w-full justify-between py-6 rounded-2xl border-2 hover:bg-gray-50" onClick={scrollToFeedback}>
                                        <span className="font-bold">View Feedback</span>
                                        <MessageSquare className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Services & Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* My Services Today - Scrollable Table */}
                        <Card className="lg:col-span-2 p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">My Appointments</h3>
                                    <p className="text-sm text-gray-500">You have 5 clients scheduled for today</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">5 Clients Remaining</span>
                            </div>
                            <div className="overflow-x-auto -mx-6 px-6 pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-4">Time</th>
                                            <th className="pb-4">Client</th>
                                            <th className="pb-4">Service</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right">Amount</th>
                                            <th className="pb-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sessions.map((session, index) => (
                                            <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 font-bold text-gray-900 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-[var(--color-primary)]" />
                                                        {session.time}
                                                    </div>
                                                </td>
                                                <td className="py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                                                            {session.client.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">{session.client}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5">
                                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{session.type}</span>
                                                </td>
                                                <td className="py-5">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${session.statusColor}`}>
                                                        {session.status}
                                                    </span>
                                                    {canPerformBookingAction({ status: session.status as BookingStatus }, "start", userRole as UserRole) && onStartBooking && (
                                                        <button
                                                            onClick={() => session.id && onStartBooking(session.id)}
                                                            className="ml-2 text-[10px] bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                                                        >
                                                            Start
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-5 text-right font-bold text-gray-900">{session.price}</td>
                                                <td className="py-5 text-center text-gray-400">
                                                    <button
                                                        onClick={() => handleViewHistory(session)}
                                                        className="p-1.5 hover:bg-white/50 rounded-lg hover:text-purple-600 transition-all"
                                                        title="View History"
                                                    >
                                                        <History size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Recent Feedback */}
                        <div id="feedback-section" ref={feedbackRef} className="h-full">
                            <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Feedback</h3>
                                    <Link href="/team/feedback">
                                        <button className="text-[var(--color-primary)] text-sm font-bold hover:underline">View All</button>
                                    </Link>
                                </div>
                                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-primary-light)] transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">{comment.client}</span>
                                                    <div className="flex text-yellow-400">
                                                        {"★".repeat(comment.rating)}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium">{comment.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 italic leading-relaxed">"{comment.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto pt-6 border-t border-gray-100 mt-4">
                                    <div className="bg-gradient-to-br from-[var(--color-primary-light)] to-blue-50 p-4 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-primary)]">Monthly Quality</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">Excellent Performance!</p>
                                        </div>
                                        <Award className="w-8 h-8 text-[var(--color-primary)]/40" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Notifications & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl">
                            <div className="flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-[var(--color-primary)]" />
                                <h3 className="text-xl font-bold text-gray-900">Recent Notifications</h3>
                            </div>
                            <div className="space-y-4">
                                {notifications.slice(0, 4).map((notif, idx) => {
                                    const Icon = notif.icon;
                                    return (
                                        <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${notif.type === "success" ? "bg-green-50/50 border-green-100 hover:bg-green-100/50" :
                                            notif.type === "warning" ? "bg-yellow-50/50 border-yellow-100 hover:bg-yellow-100/50" :
                                                "bg-blue-50/50 border-blue-100 hover:bg-blue-100/50"
                                            }`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === "success" ? "bg-green-100 text-green-600" :
                                                notif.type === "warning" ? "bg-yellow-100 text-yellow-600" :
                                                    "bg-blue-100 text-blue-600"
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{notif.message}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {notif.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-[var(--color-secondary)]" />
                                    <h3 className="text-xl font-bold text-gray-900">Recent Activity & Alerts</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-bold bg-[var(--color-primary)] text-white rounded-full">Filters</button>
                                    <button className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100">Archive</button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {userActivities.slice(0, 4).map((activity, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${activity.color}`}>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed mb-2">{activity.action}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{activity.user}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            ) : (
                /* Simple View: Agenda Focus */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Today's Agenda */}
                    <Card className="lg:col-span-2 p-6 bg-white border-none shadow-xl shadow-gray-200/30 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Today's Agenda</h3>
                                <p className="text-sm text-gray-500">{sessions.length} services scheduled for today</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <Bell className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-100 scrollbar-track-transparent">
                            {sessions.map((session, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg group-hover:bg-white transition-colors shadow-sm">
                                                {session.time.split(':')[0]}
                                                <span className="text-[10px] ml-0.5 mt-1">{session.time.split(':')[1]}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{session.client}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {session.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{session.price}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${session.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewHistory(session)}
                                                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-purple-600 border border-transparent hover:border-purple-100"
                                                >
                                                    <History className="w-5 h-5" />
                                                </button>
                                                {canPerformBookingAction({ status: session.status as BookingStatus }, "start", userRole as UserRole) && onStartBooking && (
                                                    <button
                                                        onClick={() => session.id && onStartBooking(session.id)}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Stats & Notifications */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl shadow-purple-200/50 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h4 className="font-bold mb-4 opacity-90 tracking-wide uppercase text-[10px]">Performance Snapshot</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-tight">Daily Revenue</p>
                                        <p className="text-3xl font-bold">€342.00</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-300 text-xs font-bold bg-green-400/20 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        +15%
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-white rounded-full h-2 w-[75%] shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/70 font-bold uppercase tracking-wider">
                                    <span>Progress</span>
                                    <span>Goal: €450.00</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border-none shadow-xl shadow-gray-200/30 rounded-3xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    Notifications
                                    <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">2</span>
                                </h4>
                                <Bell className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                                {notifications.slice(0, 3).map((notif, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {notif.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-2xl transition-all border border-purple-100 active:scale-[0.98]">
                                View All Activity
                            </button>
                        </Card>
                    </div>
                </div>
            )}

            <HistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title="Service History"
                itemTitle={selectedHistory.title}
                itemSubtitle={selectedHistory.subtitle}
                events={selectedHistory.events}
            />
        </div>
    );
}
