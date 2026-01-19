"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { BarChart3, TrendingUp, Star, Users, Award, Target } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";

const performanceData = [
    { name: "Orphelia", revenue: 45830, services: 203, rating: 4.9, growth: "+12%" },
    { name: "Worker 2", revenue: 38650, services: 178, rating: 4.8, growth: "+8%" },
    { name: "Worker 3", revenue: 42200, services: 189, rating: 4.7, growth: "+15%" },
    { name: "Worker 4", revenue: 35420, services: 165, rating: 4.6, growth: "+5%" },
    { name: "Worker 5", revenue: 28340, services: 134, rating: 4.5, growth: "-3%" },
    { name: "Worker 6", revenue: 39850, services: 192, rating: 4.8, growth: "+10%" },
];

export default function TeamPerformancePage() {
    const { getCardStyle } = useKpiCardStyle();
    const totalIncome = performanceData.reduce((sum, w) => sum + w.revenue, 0);
    const avgRating = (performanceData.reduce((sum, w) => sum + w.rating, 0) / performanceData.length).toFixed(1);

    return (
        <TeamLayout
            title="Performance"
            description="Track team performance and statistics"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Income"
                    value={`€${totalIncome.toLocaleString()}`}
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title="Average Rating"
                    value={avgRating}
                    subtitle="out of 5"
                    icon={Star}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title="Services Completed"
                    value={performanceData.reduce((sum, w) => sum + w.services, 0)}
                    icon={BarChart3}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title="Top Performer"
                    value="Orphelia"
                    icon={Award}
                    gradient=""
                    style={getCardStyle(3)}
                />
            </div>

            {/* Performance Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">Performance Ranking</h3>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                        <option>This month</option>
                        <option>This quarter</option>
                        <option>This year</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Income</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Services</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {performanceData
                                .sort((a, b) => b.revenue - a.revenue)
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
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">€{worker.revenue.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right text-gray-600">{worker.services}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Star className="w-4 h-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                                                <span className="font-medium">{worker.rating}</span>
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
                        <h3 className="font-semibold text-gray-900">Monthly Goals</h3>
                        <p className="text-xs text-gray-500">Progress towards team goals</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Total Income</span>
                            <span className="text-sm text-gray-600">€{totalIncome.toLocaleString()} / €250,000</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full" style={{ width: `${(totalIncome / 250000) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
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
