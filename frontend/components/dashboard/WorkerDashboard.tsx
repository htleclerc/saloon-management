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
    CheckCircle2,
    Receipt,
    History,
    LayoutGrid,
    BarChart2,
    Scissors,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { UserRole } from "@/context/AuthProvider";
import { canPerformBookingAction } from "@/lib/permissions";
import { BookingStatus } from "@/types";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
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
    { id: 1, client: "Marie Anderson", comment: "Isabelle était incroyable ! Mes tresses sont parfaites.", rating: 5, date: "Il y a 2h" },
    { id: 2, client: "Lina Davis", comment: "Super service, très professionnelle. Je recommande vivement.", rating: 4, date: "Hier" },
    { id: 3, client: "Anna Brown", comment: "Toujours un plaisir de se faire coiffer par Isabelle.", rating: 5, date: "Il y a 2j" },
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
    const [viewMode, setViewMode] = useState<"simple" | "advanced">("simple");
    const [selectedHistory, setSelectedHistory] = useState<{ title: string, subtitle: string, events: HistoryEvent[] }>({
        title: "", subtitle: "", events: []
    });

    const scrollToFeedback = () => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleViewHistory = (session: any) => {
        setSelectedHistory({
            title: `Historique du Rendez-vous`,
            subtitle: `Client: ${session.client} | Service: ${session.type}`,
            events: session.history || []
        });
        setHistoryModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        Bonjour, {workerName} <span className="text-3xl animate-bounce-slow">✨</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1 font-medium italic">Prête pour une nouvelle journée créative au salon ?</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-md border border-gray-100">
                    <button
                        onClick={() => setViewMode("simple")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === "simple"
                            ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-200"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Agenda</span>
                    </button>
                    <button
                        onClick={() => setViewMode("advanced")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === "advanced"
                            ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-200"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        <span>Analytique</span>
                    </button>
                </div>
            </div>

            {viewMode === "advanced" ? (
                <>
                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter">+12.5%</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Mon Chiffre</p>
                                <h3 className="text-3xl font-black mt-1">€18,356</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><Users className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter">Top 3</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Clients</p>
                                <h3 className="text-3xl font-black mt-1">114</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><Star className="w-6 h-6 fill-current" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter">Excellent</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Note Moyenne</p>
                                <h3 className="text-3xl font-black mt-1">4.9</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><TrendingUp className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter">+15%</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Efficacité</p>
                                <h3 className="text-3xl font-black mt-1">94%</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Performance Chart */}
                        <Card className="lg:col-span-2 p-8 border-none shadow-md overflow-hidden bg-white rounded-3xl group">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">Aperçu des Gains</h3>
                                    <p className="text-sm text-gray-400 italic font-medium">Evolution de votre performance sur 6 mois</p>
                                </div>
                                <div className="p-2 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    +12.5% Progression
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenueWorker" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                                        <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenueWorker)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Personal Profile/Summary Card */}
                        <Card className="p-0 border-none shadow-md overflow-hidden bg-white rounded-3xl flex flex-col group">
                            <div className="p-8 bg-gradient-to-br from-[var(--color-primary)] to-[#7c3aed] text-white">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/30 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {workerName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black tracking-tight">{workerName}</h3>
                                            <ShieldCheck className="w-5 h-5 text-yellow-300" />
                                        </div>
                                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Niveau Expert • 4 Ans</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6 flex-1">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl hover:bg-purple-50 transition-all group/item cursor-pointer" onClick={scrollToFeedback}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white text-[var(--color-primary)] rounded-xl shadow-sm group-hover/item:scale-110 transition-transform">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 group-hover/item:text-[var(--color-primary)] transition-colors italic">4.9/5 Excellent</p>
                                                <p className="text-xs text-gray-400 font-medium">Sur 114 avis clients</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover/item:text-[var(--color-primary)] group-hover/item:translate-x-1 transition-all" />
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl hover:bg-pink-50 transition-all group/item cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white text-[var(--color-secondary)] rounded-xl shadow-sm group-hover/item:scale-110 transition-transform">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 group-hover/item:text-[var(--color-secondary)] transition-colors italic">Rang #1 Salon</p>
                                                <p className="text-xs text-gray-400 font-medium">Top performance du mois</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover/item:text-[var(--color-secondary)] group-hover/item:translate-x-1 transition-all" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button variant="outline" className="w-full justify-between py-6 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:bg-white text-gray-600 hover:text-[var(--color-primary)] transition-all font-black uppercase text-xs tracking-widest" onClick={scrollToFeedback}>
                                        <span>Consulter les Avis</span>
                                        <MessageSquare className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            ) : (
                /* Simple View: Agenda Focus */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* Today's Agenda */}
                    <Card className="lg:col-span-2 p-8 bg-white border-none shadow-md rounded-3xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Agenda du Jour</h3>
                                <p className="text-sm text-gray-400 font-medium mt-1 italic">{sessions.length} prestations prévues aujourd'hui</p>
                            </div>
                            <div className="p-4 bg-[var(--color-primary-light)] rounded-2xl shadow-inner border border-[var(--color-primary-light)]">
                                <Scissors className="w-8 h-8 text-[var(--color-primary)]" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            {sessions.length > 0 ? sessions.map((session, index) => (
                                <div key={index} className="p-6 rounded-2xl bg-gray-50 border border-gray-50 hover:border-purple-200 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center text-[var(--color-primary)] font-black shadow-inner group-hover:scale-105 transition-transform">
                                                <span className="text-lg leading-none">{session.time.split(':')[0]}</span>
                                                <span className="text-[10px] uppercase font-black">{session.time.split(':')[1]}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-lg text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{session.client}</p>
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-2 mt-1 uppercase tracking-wider">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {session.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="text-right">
                                                <p className="font-black text-lg text-gray-900 tabular-nums">{session.price === "€--" ? "€ --" : session.price}</p>
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${session.status === 'Finished' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    session.status === 'Started' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleViewHistory(session)} className="p-3 bg-white text-gray-400 rounded-xl hover:text-purple-600 border border-gray-100 hover:border-purple-200 shadow-sm transition-all active:scale-90">
                                                    <History className="w-5 h-5" />
                                                </button>
                                                {canPerformBookingAction({ status: session.status as BookingStatus }, "start", userRole as UserRole) && onStartBooking && (
                                                    <button onClick={() => session.id && onStartBooking(session.id)} className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary-dark)] transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                                                        Démarrer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center text-gray-400 italic font-medium">Aucun rendez-vous pour le moment.</div>
                            )}
                        </div>
                    </Card>

                    {/* Quick Stats & Notifications */}
                    <div className="space-y-8">
                        <Card className="p-8 bg-gradient-to-br from-purple-700 to-indigo-800 text-white border-none shadow-xl shadow-purple-200/50 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                            <h4 className="font-black mb-6 opacity-60 tracking-widest uppercase text-[10px]">Objectif Journée</h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">CA Aujourd'hui</p>
                                        <p className="text-4xl font-black tabular-nums">€342</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-300 text-xs font-black bg-green-400/20 px-3 py-1.5 rounded-full border border-green-400/30">
                                        <TrendingUp className="w-4 h-4" />
                                        +15%
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 shadow-inner">
                                    <div className="bg-white rounded-full h-3 w-[75%] shadow-[0_0_20px_rgba(255,255,255,0.6)] group-hover:w-[80%] transition-all duration-700"></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/50 font-black uppercase tracking-widest">
                                    <span>Progression</span>
                                    <span>Objectif: €450</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-white border-none shadow-md rounded-3xl overflow-hidden flex flex-col group">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                                    Notifications
                                    <span className="bg-red-500 text-white text-[10px] w-6 h-6 rounded-xl flex items-center justify-center font-black animate-pulse shadow-lg shadow-red-200">2</span>
                                </h4>
                                <Bell className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <div className="space-y-6 flex-1">
                                {notifications.slice(0, 3).map((notif, idx) => (
                                    <div key={idx} className="flex gap-5 group/notif">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2.5 flex-shrink-0 group-hover/notif:scale-150 transition-transform shadow-md shadow-purple-200"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-700 leading-tight group-hover/notif:text-gray-900 transition-colors">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-2 font-bold uppercase tracking-tight">
                                                <Clock className="w-3 h-3" />
                                                {notif.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-10 py-4 text-xs font-black text-purple-600 hover:bg-purple-50 rounded-2xl transition-all border border-purple-100 uppercase tracking-widest active:scale-[0.98]">
                                Tout Historique
                            </button>
                        </Card>
                    </div>
                </div>
            )}

            <div id="feedback-anchor" ref={feedbackRef} className="pt-4 pb-12">
                <Card className="p-8 border-none bg-white shadow-md rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Avis Clients Recents</h3>
                            <p className="text-sm text-gray-400 italic">Retours directs sur vos dernières prestations</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs font-black uppercase tracking-widest border-gray-100 text-gray-400">Voir Tous</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-50 hover:border-purple-100 hover:bg-white hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex text-yellow-400 scale-90 -translate-x-1">
                                        {"★".repeat(comment.rating)}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">{comment.date}</span>
                                </div>
                                <p className="text-sm text-gray-700 italic font-medium leading-relaxed group-hover:text-gray-900 transition-colors">"{comment.comment}"</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center font-black text-[10px]">{comment.client.charAt(0)}</div>
                                    <span className="text-xs font-black text-gray-900 tracking-tight">{comment.client}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <HistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title="Détails du Rendez-vous"
                itemTitle={selectedHistory.title}
                itemSubtitle={selectedHistory.subtitle}
                events={selectedHistory.events}
            />
        </div>
    );
}
