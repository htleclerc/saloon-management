'use client';

import { useAuth } from '@/context/AuthProvider';
import { useState, useEffect } from 'react';
import { Shield, Building2, Users, TrendingUp, Eye, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { salonService } from '@/lib/services/SalonService';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/i18n';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { format } = useCurrency();
    const { t } = useTranslation();
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
                <Loader2 className="w-10 h-10 text-color-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic animate-pulse">
                    {t("superadmin.loadingGlobalData")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-color-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {t("superadmin.dashboard")}
                    </h1>
                </div>
                <p className="text-gray-600">
                    {t("superadmin.welcome", { name: user?.name || 'Super Admin' })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-color-primary/30 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary-light rounded-xl">
                            <Building2 className="w-6 h-6 text-color-primary" />
                        </div>
                        <span className="text-xs bg-primary-light text-color-primary px-2.5 py-1 rounded-full font-bold">
                            Total
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.totalSalons}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">{t("superadmin.registeredSalons")}</p>
                </div>

                {/* Active Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-green-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">
                            {stats.totalSalons > 0 ? Math.round((stats.activeSalons / stats.totalSalons) * 100) : 0}% {t("superadmin.activity")}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stats.activeSalons}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">{t("superadmin.activeSalons")}</p>
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
                    <p className="text-gray-500 text-sm font-medium">{t("superadmin.totalUsers")}</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-bold">
                            {t("superadmin.vsLastMonth")}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        {format(stats.monthlyRevenue)}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">{t("superadmin.globalMonthlyRevenue")}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    {t("superadmin.quickActions")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* View All Salons */}
                    <button
                        onClick={() => router.push('/superadmin/salons')}
                        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:border-color-primary hover:shadow-xl transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500 -z-10"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary-light rounded-2xl group-hover:bg-primary transition-colors shadow-inner">
                                    <Eye className="w-6 h-6 text-color-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-color-primary transition-colors">
                                        {t("superadmin.manageSalonsAction")}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {t("superadmin.manageSalonsDesc")}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-color-primary group-hover:translate-x-2 transition-all" />
                        </div>
                    </button>

                    {/* Analytics (Future) */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 text-left opacity-75 relative group grayscale hover:grayscale-0 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-200 rounded-2xl shadow-inner group-hover:bg-primary-light group-hover:text-color-primary transition-all">
                                    <BarChart3 className="w-6 h-6 text-gray-400 group-hover:text-color-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-600 mb-1 group-hover:text-gray-900">
                                        {t("superadmin.globalAnalytics")}
                                    </h3>
                                    <p className="text-sm text-gray-400 group-hover:text-gray-500">
                                        {t("superadmin.globalAnalyticsDesc")} <span className="italic font-medium text-color-primary ml-1">{t("superadmin.comingSoonLabel")}</span>
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
