"use client";

import React from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Star,
    Clock,
    DollarSign,
    ArrowLeft,
    Users,
    TrendingUp,
    Award,
    ChevronRight,
    MessageSquare,
    Image as ImageIcon,
    Plus,
    History,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const services = [
    {
        id: 1,
        name: "Box Braids",
        description: "Traditional box braids with various sizes and lengths. Our most popular protective style that lasts up to 8 weeks with proper care.",
        price: 120,
        duration: "3-4 hours",
        image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800",
        rating: 4.9,
        popularity: 95,
        color: "from-purple-500 to-purple-700",
        stats: {
            thisMonth: 190,
            revenue: 22800,
            growth: "+15%"
        },
        reviews: [
            { id: 1, user: "Marie Dubois", text: "Best braids I've ever had. Isabelle is a magician!", rating: 5, date: "2 days ago" },
            { id: 2, user: "Sarah Jones", text: "Very consistent work. The salon environment is great.", rating: 5, date: "1 week ago" }
        ],
        gallery: [
            "https://images.unsplash.com/photo-1595476108410-d3923412705e?w=400",
            "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400",
            "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=400"
        ]
    }
];

const chartData = [
    { name: "Jan", revenue: 4500, bookings: 40 },
    { name: "Feb", revenue: 5200, bookings: 45 },
    { name: "Mar", revenue: 4800, bookings: 42 },
    { name: "Apr", revenue: 6100, bookings: 54 },
    { name: "May", revenue: 5800, bookings: 50 },
    { name: "Jun", revenue: 7200, bookings: 63 },
];

const serviceUsageHistory: HistoryEvent[] = [
    { date: "2026-01-19 14:30", action: "Income Validated", user: "Admin", comment: "Commission paid to Orphelia" },
    { date: "2026-01-19 11:00", action: "Booking Finished", user: "Orphelia", comment: "Client: Marie Dubois" },
    { date: "2026-01-18 16:45", action: "Income Drafted", user: "System", comment: "Auto-drafted from booking #452" },
    { date: "2026-01-18 10:20", action: "Booking Started", user: "Orphelia", comment: "Client: Sarah Jones" },
    { date: "2026-01-17 09:00", action: "Appointment Set", user: "System", comment: "Online booking by Yasmine M" },
];

export default function ServiceDetailPage() {
    const params = useParams();
    const serviceId = parseInt(params.id as string);
    const { isAdmin, isManager, isOwner, isLoading } = useAuth();
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // Find service (in real app, fetch from API)
    const service = services.find(s => s.id === serviceId) || services[0];

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/services">
                            <button className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    {service.duration}
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-lg">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    {service.rating}
                                </div>
                            </div>
                        </div>
                    </div>
                    {isManager && (
                        <div className="flex items-center gap-3">
                            <ReadOnlyGuard>
                                <Button variant="outline">Archive Service</Button>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <Link href={`/services/edit/${service.id}`}>
                                    <Button variant="primary">Edit Service</Button>
                                </Link>
                            </ReadOnlyGuard>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Left Column: Info, Gallery & Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <Card className="p-0 border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white rounded-[2.5rem]">
                            <div className="aspect-[21/9] w-full relative">
                                <img src={service.image} className="w-full h-full object-cover" alt={service.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                    <div className="text-white">
                                        <p className="text-white/80 font-medium mb-1 uppercase tracking-widest text-xs">Starting from</p>
                                        <h2 className="text-5xl font-black italic">€{service.price}</h2>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl border border-white/30 text-white">
                                        <Award className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Info & Gallery Description Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">About this Service</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['Protective Style', 'Low Maintenance', 'Long Lasting', 'Hydrating'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
                                    Style Gallery
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {service.gallery.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-[var(--color-primary)]">
                                            <img src={img} className="w-full h-full object-cover" alt={`${service.name} ${idx}`} />
                                        </div>
                                    ))}
                                    <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 italic">Recent Customer Reviews</h3>
                                <Link href={`/team/feedback?serviceName=${encodeURIComponent(service.name)}`}>
                                    <button className="text-[var(--color-primary)] text-sm font-bold hover:underline">See all reviews</button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.reviews.map(review => (
                                    <Card key={review.id} className="p-5 border-none shadow-lg shadow-gray-100/50 bg-white rounded-3xl flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                                                    {review.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{review.user}</p>
                                                    <div className="flex text-yellow-400">
                                                        {"★".repeat(review.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Stats & Analytics */}
                    <div className="flex flex-col space-y-6 h-full">
                        {isAdmin ? (
                            <>
                                {/* Admin Only: Financial Insights */}
                                <Card className="p-6 border-none shadow-xl shadow-purple-500/10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-[2rem]">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 bg-white/20 p-1 rounded-full" />
                                        Financial Insights
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-white/70 text-sm">Monthly Revenue</p>
                                            <div className="flex items-end gap-2">
                                                <h4 className="text-3xl font-black italic">€22,800</h4>
                                                <span className="text-green-400 text-xs font-black pb-1">↑ 15%</span>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/20 w-full"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Bookings</p>
                                                <p className="text-xl font-black italic">190</p>
                                            </div>
                                            <div>
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Margin</p>
                                                <p className="text-xl font-black italic">68%</p>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between items-center bg-white/10 border-white/20 text-white hover:bg-white/20 py-4 rounded-2xl border-none shadow-none"
                                                onClick={() => setHistoryModalOpen(true)}
                                            >
                                                <span className="font-bold flex items-center gap-2">
                                                    <History className="w-4 h-4" />
                                                    View Usage History
                                                </span>
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Revenue Chart */}
                                <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Growth Trend</h3>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Recent History Activity - Admin Only (Moved here) */}
                                <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem] flex flex-col flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Usage Activity</h3>
                                        <History className="w-4 h-4 text-[var(--color-primary)]" />
                                    </div>
                                    <div className="space-y-4">
                                        {serviceUsageHistory.slice(0, 4).map((event, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className={`p-2 rounded-xl shrink-0 ${event.action.includes('Income') || event.action.includes('Invoice') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {event.action.includes('Income') || event.action.includes('Invoice') ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {event.action.replace('Invoice', 'Income')}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                                        {(typeof event.date === 'string' ? event.date : event.date.toLocaleDateString()).split(' ')[0]} • {event.user}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <Link href={`/services/${service.id}/history`}>
                                            <button className="w-full py-4 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest hover:bg-[var(--color-primary-light)] rounded-2xl transition-colors border-2 border-dashed border-[var(--color-primary-light)]">
                                                View Full Audit Log
                                            </button>
                                        </Link>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem] space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                                    <p className="text-sm text-gray-500">Your results for this service</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[var(--color-primary)] text-white rounded-xl">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                            <span className="font-bold text-gray-900">4.9/5.0</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400">RATING</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-200 text-gray-600 rounded-xl">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900">42 Clients</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400">TOTAL</span>
                                    </div>
                                </div>
                                <Button className="w-full py-6 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20">
                                    MY BOOKINGS
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <HistoryModal
                        isOpen={historyModalOpen}
                        onClose={() => setHistoryModalOpen(false)}
                        title={`${service.name} History`}
                        itemTitle="Usage & Income Audit"
                        itemSubtitle={`Complete trace of all bookings and validated income for ${service.name}`}
                        events={serviceUsageHistory.filter(e => e.action.toLowerCase().includes('validated') || e.action.toLowerCase().includes('income'))}
                        viewAllLink={`/services/${service.id}/history`}
                    />
                )}
            </div>
        </MainLayout>
    );
}
