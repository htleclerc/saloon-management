"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { useAuth, RequirePermission } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import {
    salonService,
    statsService,
    bookingService,
    incomeService,
    expenseService,
    workerService
} from "@/lib/services";
import { format } from "date-fns";
import type { Booking, WorkerStats, Expense } from "@/types";
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
    ArrowUpRight,
    ArrowDownRight,
    Star,
    LayoutGrid,
    BarChart2,
    Filter,
    Download,
    FileText
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
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";

export default function AdvancedDashboardPage() {
    const { t } = useTranslation();
    const { getCardStyle } = useKpiCardStyle();
    const { user, activeSalonId, canModify } = useAuth();
    const { startBooking } = useBooking();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [expenseTrend, setExpenseTrend] = useState<any[]>([]);
    const [profitTrend, setProfitTrend] = useState<any[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
    const [topWorkers, setTopWorkers] = useState<WorkerStats[]>([]);
    const [recentSessions, setRecentSessions] = useState<Booking[]>([]);

    useEffect(() => {
        if (!activeSalonId) return;

        async function loadData() {
            setLoading(true);
            try {
                const salonId = Number(activeSalonId);

                // Fetch stats and trends
                const salonStats = await salonService.getStats(salonId);
                setStats(salonStats);

                const revTrend = await statsService.getRevenueTrend(salonId);
                setRevenueTrend(revTrend.map(item => ({
                    name: format(new Date(item.month + "-01"), "MMM"),
                    value: item.revenue
                })));

                const expTrendResult = await statsService.getExpenseTrend(salonId);
                setExpenseTrend(expTrendResult.map(item => ({
                    name: format(new Date(item.month + "-01"), "MMM"),
                    value: item.amount
                })));

                // Calculate Profit Analysis
                const profitAnalysis = revTrend.map((item) => {
                    const monthExp = expTrendResult.find(e => e.month === item.month)?.amount || 0;
                    return {
                        name: format(new Date(item.month + "-01"), "MMM"),
                        revenue: item.revenue,
                        expenses: monthExp,
                        profit: item.revenue - monthExp
                    };
                });
                setProfitTrend(profitAnalysis);

                // Fetch expense breakdown
                const expenses = await expenseService.getAll(salonId);
                const breakdown: Record<string, number> = {};
                const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

                expenses.forEach((exp: Expense) => {
                    const cat = "Expense"; // In a real app, join with categories
                    breakdown[cat] = (breakdown[cat] || 0) + exp.amount;
                });

                setExpenseCategories(Object.entries(breakdown).map(([name, value], idx) => ({
                    name,
                    value,
                    color: colors[idx % colors.length]
                })));

                // Fetch top performers
                const workers = await workerService.getStatsBySalon(salonId);
                setTopWorkers(workers.sort((a, b) => b.monthRevenue - a.monthRevenue).slice(0, 4));

                // Fetch today's sessions
                const today = format(new Date(), "yyyy-MM-dd");
                const bookingsResponse = await bookingService.getAll(salonId, { startDate: today, endDate: today });
                setRecentSessions(bookingsResponse.data.slice(0, 5));

            } catch (error) {
                console.error("Error loading advanced dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [activeSalonId]);

    const handleAction = (path: string) => {
        router.push(path);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <RequirePermission role={['manager']} fallback={
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <Card className="text-center p-8 max-w-md">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Accès Restreint</h2>
                        <p className="text-gray-600 font-medium">Ce tableau de bord avancé est réservé aux managers et administrateurs du salon.</p>
                        <Link href="/">
                            <Button variant="primary" size="md" className="mt-6 rounded-xl">
                                Retour à l'accueil
                            </Button>
                        </Link>
                    </Card>
                </div>
            </MainLayout>
        }>
            <MainLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <LayoutGrid className="w-8 h-8 text-[var(--color-primary)]" />
                                Tableau de Bord Analytique
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base mt-1 font-medium italic">Analyse approfondie de la performance de votre salon</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                            <span className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400">
                                {format(new Date(), "MMMM yyyy")}
                            </span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter cursor-default">+12%</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Revenu Total</p>
                                <h3 className="text-3xl font-black mt-1">€{stats?.totalRevenue?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><Wallet className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter cursor-default">+5%</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Dépenses</p>
                                <h3 className="text-3xl font-black mt-1">€{stats?.totalExpenses?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><TrendingUp className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter cursor-default">Target Met</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Bénéfice Net</p>
                                <h3 className="text-3xl font-black mt-1">€{(stats?.totalRevenue - stats?.totalExpenses)?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner"><Users className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full uppercase tracking-tighter cursor-default">{stats?.totalWorkers} Staff</span>
                                </div>
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Personnel</p>
                                <h3 className="text-3xl font-black mt-1">{stats?.totalWorkers}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight uppercase text-xs opacity-50">Actions de Gestion</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button onClick={() => handleAction("/services")} className="flex items-center justify-between px-8 py-5 bg-white hover:bg-purple-50 text-gray-900 rounded-2xl font-black transition-all shadow-sm border-2 border-transparent hover:border-purple-100 group active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Plus className="w-5 h-5" /></div>
                                    <span className="text-sm">Gérer les Services</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button onClick={() => handleAction("/expenses")} className="flex items-center justify-between px-8 py-5 bg-white hover:bg-pink-50 text-gray-900 rounded-2xl font-black transition-all shadow-sm border-2 border-transparent hover:border-pink-100 group active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-100 text-pink-600 rounded-xl group-hover:scale-110 transition-transform"><Wallet className="w-5 h-5" /></div>
                                    <span className="text-sm">Nouvelle Dépense</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button onClick={() => handleAction("/team")} className="flex items-center justify-between px-8 py-5 bg-white hover:bg-emerald-50 text-gray-900 rounded-2xl font-black transition-all shadow-sm border-2 border-transparent hover:border-emerald-100 group active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
                                    <span className="text-sm">Gérer l'Équipe</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Charts Row 1: Monthly Revenue & Expenses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors italic">Chiffre d'Affaires Mensuel</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Evolution annuelle de vos revenus</p>
                                </div>
                                <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-purple-100"> Annuel </span>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueTrend}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'var(--color-primary-light)', opacity: 0.3 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                                        <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-secondary)] transition-colors italic">Dépenses Mensuelles</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Evolution annuelle de vos frais</p>
                                </div>
                                <span className="bg-pink-50 text-pink-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-pink-100"> Annuel </span>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={expenseTrend}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'var(--color-secondary-light)', opacity: 0.3 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                                        <Bar dataKey="value" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Profit Analysis Chart */}
                    <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors italic">Analyse du Profit</h3>
                                <p className="text-sm text-gray-400 font-medium italic">Comparaison Revenus vs Dépenses</p>
                            </div>
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                <button className="text-[10px] font-black px-4 py-2 bg-white text-[var(--color-primary)] rounded-xl shadow-sm border border-gray-100 uppercase tracking-widest">Mensuel</button>
                                <button className="text-[10px] font-black px-4 py-2 text-gray-400 hover:text-gray-600 uppercase tracking-widest">Hebdo</button>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={profitTrend}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="expenses" stroke="var(--color-secondary)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="profit" stroke="var(--color-warning)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-10 mt-8">
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                <div className="w-4 h-4 rounded-lg bg-[var(--color-primary)]"></div> Revenu
                            </div>
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                <div className="w-4 h-4 rounded-lg bg-[var(--color-secondary)]"></div> Dépenses
                            </div>
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                <div className="w-4 h-4 rounded-lg bg-[var(--color-warning)]"></div> Profit
                            </div>
                        </div>
                    </Card>

                    {/* Breakdown & Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Expense Categories */}
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl lg:col-span-1">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 italic">Répartition Frais</h3>
                            <div className="relative h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCategories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {expenseCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-gray-900 tabular-nums">€{(expenseCategories.reduce((acc, c) => acc + c.value, 0) / 1000).toFixed(1)}k</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Frais</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                {expenseCategories.map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-sm font-bold text-gray-500">{cat.name}</span>
                                        </div>
                                        <span className="font-black text-gray-900 tabular-nums text-sm">€{cat.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Top Expense Categories Details */}
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl lg:col-span-2">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 italic">Détails des Dépenses</h3>
                            <div className="space-y-5">
                                {expenseCategories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:border-purple-100 border border-transparent transition-all duration-300 group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color }}>
                                                <Briefcase className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900">{cat.name}</p>
                                                <p className="text-xs text-gray-400 font-medium italic">Principaux postes de dépenses</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-gray-900 tabular-nums">€{cat.value.toLocaleString()}</p>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1 justify-end mt-1">
                                                <ArrowUpRight className="w-3 h-3" />
                                                Stable
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-5 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary)] text-gray-400 font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98]">
                                Tout le Rapport Financier
                            </button>
                        </Card>
                    </div>

                    {/* Top Performing Workers */}
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Top Performance Équipe</h3>
                            <button onClick={() => handleAction("/team")} className="text-xs font-black text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-5 py-2.5 rounded-xl transition-all border border-transparent hover:border-[var(--color-primary-light)] uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Toute l'Équipe
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {topWorkers.map((worker) => (
                                <Card key={worker.workerId} className="p-6 flex flex-col gap-4 hover:shadow-2xl transition-all duration-300 border-none rounded-3xl group cursor-pointer" onClick={() => handleAction(`/team/detail/${worker.workerId}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-[var(--color-primary)] font-black text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{worker.name}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Rang #{topWorkers.indexOf(worker) + 1}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Revenue</p>
                                            <p className="text-lg font-black text-gray-900 tabular-nums">€{worker.monthRevenue.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Avis</p>
                                            <div className="flex text-yellow-400 scale-90 -translate-x-1 mt-1 justify-end">
                                                {"★".repeat(5)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-50 rounded-full mt-2 overflow-hidden shadow-inner">
                                        <div className="h-full bg-[var(--color-primary)] rounded-full group-hover:bg-purple-600 transition-all duration-700" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Today's Services */}
                    <Card className="p-8 border-none shadow-md bg-white rounded-3xl overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Journal des Services</h3>
                                <p className="text-sm text-gray-400 font-medium italic">Traitement en temps réel des rendez-vous</p>
                            </div>
                            <Button onClick={() => handleAction("/bookings")} variant="outline" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 border-gray-100 text-gray-400 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]">Tout l'Agenda</Button>
                        </div>
                        <div className="overflow-x-auto -mx-8 px-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-50">
                                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 pr-4 italic">Heure</th>
                                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 pr-4 italic">Client</th>
                                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 pr-4 italic">Service</th>
                                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 pr-4 italic">Tarif</th>
                                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 pr-4 italic text-center">Statut</th>
                                        <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest pb-5 italic">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentSessions.length > 0 ? recentSessions.map((session, index) => (
                                        <tr key={index} className="hover:bg-purple-50/30 transition-colors group">
                                            <td className="py-6 pr-4 text-sm font-black text-gray-900 tabular-nums">{session.time}</td>
                                            <td className="py-6 pr-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-black group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        Booking
                                                    </div>
                                                    <span className="text-sm font-black text-gray-700">Client RDV</span>
                                                </div>
                                            </td>
                                            <td className="py-6 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-600 italic">Prestation</span>
                                                    <span className="text-xs text-gray-400 font-medium">Salon Premium</span>
                                                </div>
                                            </td>
                                            <td className="py-6 pr-4 text-sm font-black text-gray-900 tabular-nums">€{(Math.random() * 100 + 50).toFixed(0)}</td>
                                            <td className="py-6 pr-4 text-center">
                                                <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border shadow-sm ${session.status === 'Finished' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    session.status === 'Started' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right">
                                                <button onClick={() => handleAction(`/bookings`)} className="p-3 bg-white text-gray-300 rounded-xl hover:text-purple-600 border border-gray-100 hover:border-purple-200 shadow-sm transition-all active:scale-90">
                                                    <Calendar className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-gray-400 italic font-medium">Aucune prestation prévue pour aujourd'hui.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        </RequirePermission>
    );
}
