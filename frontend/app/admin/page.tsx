'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    Building, Users, TrendingUp, DollarSign,
    Activity, Zap, ArrowUpRight, ArrowDownRight,
    BarChart3, Calendar, CreditCard, Package, Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { salonService } from '@/lib/services/SalonService';

export default function AdminDashboardPage() {
    const { isSuperAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [metrics, setMetrics] = useState({
        totalSalons: 0,
        salonGrowth: 0,
        activeSalons: 0,
        trialSalons: 0,
        totalUsers: 0,
        userGrowth: 0,
        mrr: 0,
        mrrGrowth: 0,
        revenue: 0,
        revenueGrowth: 0,
    });
    const [recentSalons, setRecentSalons] = useState<any[]>([]);
    const [topSalons, setTopSalons] = useState<any[]>([]);

    useEffect(() => {
        if (!isSuperAdmin) {
            router.push('/');
            return;
        }

        async function fetchGlobalStats() {
            setLoading(true);
            try {
                const allSalons = await salonService.getAll();
                const activeSalons = allSalons.filter(s => s.isActive).length;
                let totalUsers = 0;
                let mrr = 0;
                let totalRevenue = 0;

                const salonsWithStats = [];

                for (const salon of allSalons) {
                    const salonUsers = await salonService.getUsers(salon.id);
                    totalUsers += salonUsers.length;

                    const salonStats = await salonService.getStats(salon.id);
                    totalRevenue += salonStats.monthRevenue || 0;
                    mrr += (salonStats.monthRevenue || 0); // Treating month revenue as MRR proxy

                    salonsWithStats.push({
                        id: salon.id.toString(),
                        name: salon.name,
                        plan: 'Pro', // Fallback display plan
                        users: salonUsers.length,
                        created: 'Actif',
                        revenue: salonStats.monthRevenue || 0
                    });
                }

                const sortedByRevenue = [...salonsWithStats].sort((a, b) => b.revenue - a.revenue);
                setTopSalons(sortedByRevenue.slice(0, 4));

                const sortedById = [...salonsWithStats].sort((a, b) => Number(b.id) - Number(a.id));
                setRecentSalons(sortedById.slice(0, 4));

                setMetrics({
                    totalSalons: allSalons.length,
                    salonGrowth: 12.5, // Trend placeholder
                    activeSalons,
                    trialSalons: allSalons.length - activeSalons,
                    totalUsers,
                    userGrowth: 8.3, // Trend placeholder 
                    mrr,
                    mrrGrowth: 15.2, // Trend placeholder
                    revenue: totalRevenue,
                    revenueGrowth: 18.7, // Trend placeholder
                });
            } catch (err) {
                console.error("Error fetching global stats", err);
            } finally {
                setLoading(false);
            }
        }

        fetchGlobalStats();
    }, [isSuperAdmin, router]);

    if (!isSuperAdmin) return null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-color-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic animate-pulse">
                    Chargement des données globales...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard Global SaaS
                    </h1>
                    <p className="text-gray-600">
                        Vue d'ensemble de votre plateforme de gestion de salons
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Salons */}
                    <Card className="bg-gradient-to-br from-primary to-[var(--color-primary-light)] border-color-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-color-primary mb-1">Total Salons</p>
                                <p className="text-3xl font-bold text-color-primary">{metrics.totalSalons}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">+{metrics.salonGrowth}%</span>
                                    <span className="text-xs text-color-primary ml-1">ce mois</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary-light0 flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-color-primary/30">
                            <div className="flex justify-between text-xs">
                                <span className="text-color-primary">Actifs: {metrics.activeSalons}</span>
                                <span className="text-color-primary">Trial: {metrics.trialSalons}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Total Users */}
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Total Utilisateurs</p>
                                <p className="text-3xl font-bold text-blue-900">{metrics.totalUsers.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">+{metrics.userGrowth}%</span>
                                    <span className="text-xs text-blue-600 ml-1">ce mois</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    {/* MRR */}
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-1">MRR</p>
                                <p className="text-3xl font-bold text-green-900">{metrics.mrr.toLocaleString()}€</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">+{metrics.mrrGrowth}%</span>
                                    <span className="text-xs text-green-600 ml-1">vs dernier mois</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    {/* Revenue */}
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700 mb-1">Revenu Total</p>
                                <p className="text-3xl font-bold text-orange-900">{metrics.revenue.toLocaleString()}€</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">+{metrics.revenueGrowth}%</span>
                                    <span className="text-xs text-orange-600 ml-1">ce mois</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Salons */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Derniers Salons Créés</h3>
                            <button
                                onClick={() => router.push('/admin/salons')}
                                className="text-sm text-color-primary hover:text-color-primary font-medium"
                            >
                                Voir tout →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentSalons.map((salon) => (
                                <div key={salon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                                            <Building className="w-5 h-5 text-color-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{salon.name}</p>
                                            <p className="text-xs text-gray-500">{salon.users} utilisateurs • {salon.created}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${salon.plan === 'Enterprise' ? 'bg-amber-100 text-amber-700' :
                                        salon.plan === 'Pro' ? 'bg-primary-light text-color-primary' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {salon.plan}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Top Salons by Revenue */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Top Salons (Revenu)</h3>
                            <button
                                onClick={() => router.push('/admin/analytics')}
                                className="text-sm text-color-primary hover:text-color-primary font-medium"
                            >
                                Analytics →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {topSalons.map((salon, index) => (
                                <div key={salon.id} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-500 text-white' :
                                        index === 1 ? 'bg-gray-300 text-gray-700' :
                                            index === 2 ? 'bg-orange-400 text-white' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{salon.name}</p>
                                        <p className="text-xs text-gray-500">{salon.users} utilisateurs</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{salon.revenue}€</p>
                                        <p className="text-xs text-gray-500">MRR</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => router.push('/admin/salons')}
                            className="flex flex-col items-center gap-2 p-4 bg-primary-light hover:bg-primary-light rounded-xl transition-colors group"
                        >
                            <Building className="w-8 h-8 text-color-primary group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-color-primary">Gérer Salons</span>
                        </button>
                        <button
                            onClick={() => router.push('/admin/plans')}
                            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                        >
                            <CreditCard className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-blue-900">Plans</span>
                        </button>
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                        >
                            <Users className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-green-900">Utilisateurs</span>
                        </button>
                        <button
                            onClick={() => router.push('/admin/analytics')}
                            className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                        >
                            <BarChart3 className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-orange-900">Analytics</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
