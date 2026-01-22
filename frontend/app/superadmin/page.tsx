'use client';

import { useAuth } from '@/context/AuthProvider';
import { useState } from 'react';
import { Shield, Building2, Users, TrendingUp, Eye, ArrowRight, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats] = useState({
        totalSalons: 12,
        activeSalons: 10,
        totalUsers: 156,
        monthlyRevenue: 45600,
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Super Admin Dashboard
                    </h1>
                </div>
                <p className="text-gray-600">
                    Welcome, {user?.name || 'Super Admin'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                            +2 this month
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.totalSalons}
                    </h3>
                    <p className="text-gray-600 text-sm">Total Salons</p>
                </div>

                {/* Active Salons */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
                            {Math.round((stats.activeSalons / stats.totalSalons) * 100)}% active
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.activeSalons}
                    </h3>
                    <p className="text-gray-600 text-sm">Active Salons</p>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-600 font-medium">
                            +12 this month
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.totalUsers}
                    </h3>
                    <p className="text-gray-600 text-sm">Users</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-sm text-orange-600 font-medium">
                            +15%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.monthlyRevenue.toLocaleString('en-US')}€
                    </h3>
                    <p className="text-gray-600 text-sm">Total Monthly Revenue</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* View All Salons */}
                    <button
                        onClick={() => router.push('/superadmin/salons')}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-purple-400 transition-all group text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                    <Eye className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">
                                        Manage Salons
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        View and access all salon instances
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>

                    {/* Analytics (Future) */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 text-left opacity-60 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-200 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-1">
                                        Global Analytics
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Coming soon
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
