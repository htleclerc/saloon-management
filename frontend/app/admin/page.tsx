'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    Building, Users, TrendingUp, DollarSign,
    Activity, Zap, ArrowUpRight, ArrowDownRight,
    BarChart3, Calendar, CreditCard, Package
} from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AdminDashboardPage() {
    const { isSuperAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isSuperAdmin) {
            router.push('/');
        }
    }, [isSuperAdmin, router]);

    if (!isSuperAdmin) return null;

    // Mock data - will be replaced with real API calls
    const metrics = {
        totalSalons: 247,
        salonGrowth: 12.5,
        activeSalons: 231,
        trialSalons: 16,
        totalUsers: 1834,
        userGrowth: 8.3,
        mrr: 7183,
        mrrGrowth: 15.2,
        revenue: 86196,
        revenueGrowth: 18.7,
    };

    const recentSalons = [
        { id: '1', name: 'Salon Élégance', plan: 'Pro', users: 12, created: '2 jours' },
        { id: '2', name: 'Beauty Lounge', plan: 'Free', users: 3, created: '3 jours' },
        { id: '3', name: 'Coiffure Moderne', plan: 'Enterprise', users: 45, created: '5 jours' },
        { id: '4', name: 'Spa Luxe', plan: 'Pro', users: 18, created: '1 semaine' },
    ];

    const topSalons = [
        { id: '1', name: 'Premium Spa Paris', revenue: 2400, users: 45 },
        { id: '2', name: 'Salon Elite Lyon', revenue: 1850, users: 32 },
        { id: '3', name: 'Beauty Center Nice', revenue: 1620, users: 28 },
        { id: '4', name: 'Coiffure Royale', revenue: 1420, users: 24 },
    ];

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
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700 mb-1">Total Salons</p>
                                <p className="text-3xl font-bold text-purple-900">{metrics.totalSalons}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">+{metrics.salonGrowth}%</span>
                                    <span className="text-xs text-purple-600 ml-1">ce mois</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-purple-200">
                            <div className="flex justify-between text-xs">
                                <span className="text-purple-700">Actifs: {metrics.activeSalons}</span>
                                <span className="text-purple-700">Trial: {metrics.trialSalons}</span>
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
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                                Voir tout →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentSalons.map((salon) => (
                                <div key={salon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <Building className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{salon.name}</p>
                                            <p className="text-xs text-gray-500">{salon.users} utilisateurs • {salon.created}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${salon.plan === 'Enterprise' ? 'bg-amber-100 text-amber-700' :
                                        salon.plan === 'Pro' ? 'bg-purple-100 text-purple-700' :
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
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                            className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                        >
                            <Building className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-purple-900">Gérer Salons</span>
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
