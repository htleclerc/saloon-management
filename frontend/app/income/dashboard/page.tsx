"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth, RequirePermission } from "@/context/AuthProvider";
import { useActionPermissions } from "@/lib/permissions";
import { incomeService } from "@/lib/services/IncomeService";
import { statsService } from "@/lib/services/StatsService";
import { workerService } from "@/lib/services/WorkerService";
import { salonService } from "@/lib/services/SalonService";
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
    LayoutGrid,
    BarChart2,
    ChevronDown,
    ChevronUp,
    Briefcase,
    Star,
    Wallet,
    TrendingDown,
    History,
    AlertTriangle
} from "lucide-react";
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

export default function IncomeDashboardPage() {
    const { getCardStyle } = useKpiCardStyle();
    const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
    const [expandedMobileRows, setExpandedMobileRows] = useState<number[]>([]);
    const [currentDate, setCurrentDate] = useState(format(new Date(), "MMMM dd, yyyy"));
    const { user, activeSalonId } = useAuth();
    const permissions = useActionPermissions({ user, canModify: true } as any);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [dailyBreakdown, setDailyBreakdown] = useState<any[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<any[]>([]);
    const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
    const [incomeProjection, setIncomeProjection] = useState<any[]>([]);
    const [workerPerformance, setWorkerPerformance] = useState<any[]>([]);

    useEffect(() => {
        if (!activeSalonId) return;

        async function loadData() {
            setLoading(true);
            try {
                const salonId = Number(activeSalonId);

                // Fetch stats
                const salonStats = await salonService.getStats(salonId);
                setStats(salonStats);

                // Fetch Daily Breakdown (Recent Income)
                const incomes = await incomeService.getAll(salonId);
                setDailyBreakdown(incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10));

                // Fetch Weekly Summary
                const revTrend = await statsService.getRevenueTrend(salonId);
                const expTrend = await statsService.getExpenseTrend(salonId);

                // For demo/simplicity, we'll use the monthly trend as mock for weekly/monthly view
                setMonthlySummary(revTrend.map(r => ({
                    name: format(new Date(r.month + "-01"), "MMM"),
                    income: r.revenue,
                    salary: r.revenue * 0.45 // Mock salary as 45% of revenue
                })));

                // Projection / Breakdown by category
                const breakdown: Record<string, number> = {};
                const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
                incomes.forEach(inc => {
                    const cat = (inc as any).category || "Services";
                    breakdown[cat] = (breakdown[cat] || 0) + inc.amount;
                });
                setIncomeProjection(Object.entries(breakdown).map(([name, value], idx) => ({
                    name,
                    value: Math.round((value / (incomes.reduce((acc, i) => acc + i.amount, 0) || 1)) * 100),
                    color: colors[idx % colors.length]
                })));

                // Worker performance
                const workers = await workerService.getStatsBySalon(salonId);
                setWorkerPerformance(workers.map(w => ({
                    ...w,
                    tips: Math.round(w.monthRevenue * 0.08), // Mock tips
                    services: Math.round(w.monthRevenue / 80),
                    color: colors[workers.indexOf(w) % colors.length]
                })));

            } catch (error) {
                console.error("Error loading income dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [activeSalonId]);

    const toggleMobileRow = (idx: number) => {
        setExpandedMobileRows(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="animate-pulse space-y-8">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>)}
                    </div>
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
                        <p className="text-gray-600 font-medium">L'accès aux données financières détaillées est réservé aux managers.</p>
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
                    {/* Standardized Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <DollarSign className="w-10 h-10 text-[var(--color-primary)]" />
                                Gestion des Revenus
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">Suivi analytique et gestion des flux financiers</p>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                <Link href="/income">
                                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest">
                                        <LayoutGrid size={16} />
                                        <span>Liste</span>
                                    </button>
                                </Link>
                                <button className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-white text-[var(--color-primary)] rounded-lg shadow-sm border border-gray-100 uppercase tracking-widest">
                                    <BarChart2 size={16} />
                                    <span>Analytique</span>
                                </button>
                            </div>
                            <Link href="/income/add">
                                <Button variant="primary" size="md" className="rounded-xl h-12 flex items-center gap-2 font-black shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                    <span>Ajouter</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+12.5%</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Revenu Total</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">€{stats?.totalRevenue?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Users className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">+8%</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Masse Salariale</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">€{(stats?.totalRevenue * 0.45)?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">Record</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Moyenne / Staff</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">€{(stats?.totalRevenue / (stats?.totalWorkers || 1))?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">15% Marge</span>
                                </div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Bénéfice Net</p>
                                <h3 className="text-2xl font-black mt-1 tabular-nums">€{(stats?.totalRevenue * 0.15)?.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-xl group hover:border-[var(--color-primary-light)] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] transition-all"><Users className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Staff</span>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Équipe Active</p>
                            <h3 className="text-2xl font-black mt-1 text-gray-900 tabular-nums">{stats?.totalWorkers}</h3>
                        </div>
                    </div>

                    {/* Time Period Filter */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Période :</span>
                                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                    {["Daily", "Weekly", "Monthly", "Annual"].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedPeriod === period
                                                ? "bg-white text-[var(--color-primary)] shadow-sm border border-gray-100"
                                                : "text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 active:scale-90">
                                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                                </button>
                                <span className="text-sm font-black text-gray-900 px-4 tabular-nums italic">{currentDate}</span>
                                <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 active:scale-90">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Weekly/Monthly Summary Table */}
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors italic">Comparatif Financier</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Analyse Revenu vs Salaires</p>
                                </div>
                                <History className="w-6 h-6 text-gray-300 group-hover:text-[var(--color-primary)] transition-all" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlySummary}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }} cursor={{ fill: 'var(--color-primary-light)', opacity: 0.2 }} />
                                        <Bar dataKey="income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar dataKey="salary" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-10 mt-8">
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                    <div className="w-4 h-4 rounded-lg bg-[var(--color-primary)]"></div> Revenu
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-600">
                                    <div className="w-4 h-4 rounded-lg bg-[var(--color-secondary)]"></div> Salaires
                                </div>
                            </div>
                        </Card>

                        {/* Annual Projection / Category Breakdown */}
                        <Card className="p-8 border-none shadow-md bg-white rounded-3xl group">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[var(--color-warning)] transition-colors italic">Projection & Répartition</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Sources de revenus par catégorie</p>
                                </div>
                                <TrendingUp className="w-6 h-6 text-gray-300 group-hover:text-[var(--color-warning)] transition-all" />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative h-64 flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeProjection}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {incomeProjection.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-gray-900 tabular-nums">100%</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {incomeProjection.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                                            </div>
                                            <span className="font-black text-gray-900 tabular-nums">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Daily Salary Breakdown Table */}
                    <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden group">
                        <div className="p-8 border-b-2 border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Journal des Revenus</h3>
                                <p className="text-sm text-gray-400 font-medium italic">Détails des prestations et gains</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 border-gray-100 group-hover:border-[var(--color-primary)] transition-all">Tout Voir</Button>
                        </div>

                        <div className="overflow-x-auto px-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-50 italic">
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Équipe</th>
                                        <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Prestation</th>
                                        <th className="px-4 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenu</th>
                                        <th className="px-4 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {dailyBreakdown.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-purple-50/30 transition-colors group/row">
                                            <td className="px-4 py-8 text-sm font-black text-gray-900 tabular-nums italic">{format(new Date(row.date), "dd/MM")}</td>
                                            <td className="px-4 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-[var(--color-primary)] font-black text-sm shadow-inner group-hover/row:scale-110 transition-transform">
                                                        {row.workerName?.charAt(0) || "W"}
                                                    </div>
                                                    <span className="font-black text-gray-700 text-sm tracking-tight">{row.workerName || "Membre Team"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-8 text-sm font-bold text-gray-500 italic">{row.description || "Service Salon"}</td>
                                            <td className="px-4 py-8 text-right font-black text-gray-900 tabular-nums text-lg">€{row.amount}</td>
                                            <td className="px-4 py-8 text-center">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${row.status === "Closed" || row.status === "Validated"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-orange-50 text-orange-700 border-orange-100"
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Worker Performance Comparison */}
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Performance Équipe</h3>
                            <button onClick={() => router.push("/team")} className="text-xs font-black text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-5 py-2.5 rounded-xl transition-all border border-transparent hover:border-[var(--color-primary-light)] uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Détails Staff
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {workerPerformance.map((worker, idx) => (
                                <Card key={idx}
                                    className="p-8 border-none shadow-md bg-white rounded-3xl group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                    onClick={() => router.push(`/team/detail/${worker.workerId}`)}>
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-offset-2 ring-transparent group-hover:ring-[var(--color-primary-light)] transition-all" style={{ backgroundColor: worker.color }}>
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors italic tracking-tight">{worker.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{worker.services} Prestations</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all group-hover:bg-white group-hover:shadow-inner">
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-black">CA</span>
                                            <span className="font-black text-gray-900 tabular-nums">€{worker.monthRevenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all group-hover:bg-white group-hover:shadow-inner">
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-black">Salaire</span>
                                            <span className="font-black text-gray-900 tabular-nums">€{(worker.monthRevenue * 0.45).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl transition-all group-hover:bg-white">
                                            <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest font-black">Tips</span>
                                            <span className="font-black text-emerald-600 tabular-nums">€{worker.tips?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex text-yellow-400 scale-90 -translate-x-1">
                                            {"★".repeat(5)}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic pt-1">Rang #{idx + 1}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </RequirePermission>
    );
}
