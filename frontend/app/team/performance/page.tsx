"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { BarChart3, TrendingUp, Star, Users, Award, Target } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";

import { statsService } from "@/lib/services/StatsService";
import { useEffect, useState } from "react";
import { WorkerStats } from "@/types";

interface PerformanceData extends WorkerStats {
    growth: string;
}

export default function TeamPerformancePage() {
    const { getCardStyle } = useKpiCardStyle();
    const { format } = useCurrency();
    const { t } = useTranslation();
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await statsService.getAllWorkersStats(1);
                // Mock growth calculation for now since we don't have historical data granular enough in WorkerStats
                const enhancedStats = stats.map(s => ({
                    ...s,
                    growth: Math.random() > 0.3 ? `+${Math.floor(Math.random() * 20)}%` : `-${Math.floor(Math.random() * 10)}%`
                }));
                setPerformanceData(enhancedStats);
            } catch (error) {
                console.error("Failed to load performance stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const totalIncome = performanceData.reduce((sum, w) => sum + w.totalRevenue, 0);
    const avgRating = performanceData.length > 0
        ? (performanceData.reduce((sum, w) => sum + w.avgRating, 0) / performanceData.length).toFixed(1)
        : "0.0";
    const totalServices = performanceData.reduce((sum, w) => sum + w.completedBookings, 0);
    const topPerformer = performanceData.length > 0
        ? performanceData.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current).name
        : "-";

    return (
        <TeamLayout
            title={t("team.performance")}
            description={t("team.performanceDesc")}
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t("team.totalIncome")}
                    value={format(totalIncome)}
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title={t("team.avgRating")}
                    value={avgRating}
                    subtitle={t("team.outOf5")}
                    icon={Star}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title={t("team.servicesCompleted")}
                    value={totalServices}
                    icon={BarChart3}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title={t("team.topPerformer")}
                    value={topPerformer}
                    icon={Award}
                    gradient=""
                    style={getCardStyle(3)}
                />
            </div>

            {/* Performance Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{t("team.performanceRanking")}</h3>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>{t("team.thisMonth")}</option>
                        <option>{t("team.thisQuarter")}</option>
                        <option>{t("team.thisYear")}</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.rank")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("team.team")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.income")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.services")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("common.rating")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("team.growth")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {performanceData
                                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                                .map((worker, idx) => (
                                    <tr key={worker.name} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]" :
                                                idx === 1 ? "bg-gray-100 text-gray-600" :
                                                    idx === 2 ? "bg-[var(--color-warning-light)] opacity-80 text-[var(--color-warning)]" :
                                                        "bg-gray-50 text-gray-500"
                                                }`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-gray-900">{worker.name}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{format(worker.totalRevenue)}</td>
                                        <td className="px-4 py-4 text-right text-gray-600">{worker.completedBookings}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                                                <span className="font-medium">{worker.avgRating}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.growth.startsWith("+") ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-error-light)] text-[var(--color-error)]"
                                                }`}>
                                                {worker.growth}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Goals Section */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("team.monthlyGoals")}</h3>
                        <p className="text-xs text-gray-500">{t("team.goalsDesc")}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{t("team.totalIncome")}</span>
                            <span className="text-sm text-gray-600">{format(totalIncome)} / {format(250000)}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full" style={{ width: `${(totalIncome / 250000) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{t("team.customerSatisfaction")}</span>
                            <span className="text-sm text-gray-600">{avgRating} / 5.0</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-warning-dark)] rounded-full" style={{ width: `${(parseFloat(avgRating) / 5) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </Card>
        </TeamLayout>
    );
}
