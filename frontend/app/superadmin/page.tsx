'use client';

import { useAuth } from '@/context/AuthProvider';
import { useState, useEffect } from 'react';
import { Shield, Building2, Users, TrendingUp, Eye, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { salonService } from '@/lib/services/SalonService';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSalons: 0,
        activeSalons: 0,
        totalUsers: 0,
        monthlyRevenue: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const allSalons = await salonService.getAll();
                const activeSalons = allSalons.filter(s => s.isActive).length;

                // In a real app, we would have a UserService or a global stats endpoint
                // For now, we simulate user count by summing workers across all salons
                let totalUsers = 0;
                let totalRevenue = 0;

                for (const salon of allSalons) {
                    const salonUsers = await salonService.getUsers(salon.id);
                    totalUsers += salonUsers.length;

                    // Sum up revenue for each salon (demo data for now)
                    const salonStats = await salonService.getStats(salon.id);
                    totalRevenue += salonStats.monthRevenue;
                }

                setStats({
                    totalSalons: allSalons.length,
                    activeSalons: activeSalons,
                    totalUsers: totalUsers,
                    monthlyRevenue: totalRevenue,
                });
            } catch (error) {
                console.error("Error fetching superadmin stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic animate-pulse">
                    Chargement des données globales...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Tableau de Bord Super Admin
                    </h1>
                </div>
                <p className="text-gray-600">
                    Bienvenue, <span className="font-semibold text-purple-700">{user?.name || 'Super Admin'}</span>. Voici l'état global du réseau.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-bold">
                            Total
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.totalSalons}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">Salons enregistrés</p>
                </div>

                {/* Active Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-green-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">
                            {stats.totalSalons > 0 ? Math.round((stats.activeSalons / stats.totalSalons) * 100) : 0}% Activité
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.activeSalons}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">Salons actifs</p>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                            Global
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.totalUsers}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">Utilisateurs totaux</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-bold">
                            +12.5% vs mois dernier
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.monthlyRevenue.toLocaleString('fr-FR')}€
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">CA Mensuel Global</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                    Actions Rapides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* View All Salons */}
                    <button
                        onClick={() => router.push('/superadmin/salons')}
                        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:border-purple-400 hover:shadow-xl transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500 -z-10"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors shadow-inner">
                                    <Eye className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                                        Gérer les Salons
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Voir, modérer et configurer tous les salons du réseau.
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                        </div>
                    </button>

                    {/* Analytics (Future) */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 text-left opacity-75 relative group grayscale hover:grayscale-0 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-200 rounded-2xl shadow-inner group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                                    <BarChart3 className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-600 mb-1 group-hover:text-gray-900">
                                        Analytique Globale
                                    </h3>
                                    <p className="text-sm text-gray-400 group-hover:text-gray-500">
                                        Statistiques croisées et tendances du réseau. <span className="italic font-medium text-purple-500 ml-1">Bientôt disponible</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
