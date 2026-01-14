import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    subtitle?: string;
    change?: string;
    changeType?: "positive" | "negative";
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    gradient,
    subtitle,
    change,
    changeType = "positive",
}: StatCardProps) {
    return (
        <div className={`${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm opacity-90 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>
                    {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {change && (
                <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${changeType === "positive" ? "text-green-200" : "text-red-200"}`}>
                        {change}
                    </span>
                    <span className="text-sm opacity-75">vs last month</span>
                </div>
            )}
        </div>
    );
}
