"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Plus, User } from "lucide-react";
import { useTranslation } from "@/i18n";

import { useWorkers } from "@/hooks/useServices";
import { statsService } from "@/lib/services/StatsService";
import { useEffect, useState } from "react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function TeamSchedulesPage() {
    const { t } = useTranslation();
    const { workers } = useWorkers();
    const [scheduleData, setScheduleData] = useState<Record<string, Record<string, { available: boolean; appointments: number }>>>({});

    useEffect(() => {
        const loadStats = async () => {
            const data = await statsService.getTeamScheduleStats(1);
            setScheduleData(data);
        };
        loadStats();
    }, []);
    return (
        <TeamLayout
            title={t("team.schedules")}
            description={t("team.schedulesDesc")}
        >
            {/* Quick Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4" />
                    {t("team.defaultHours")}
                </Button>
                <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4" />
                    {t("team.addTimeOff")}
                </Button>
            </div>

            {/* Weekly Schedule Grid */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("team.weeklySchedule")}</h3>
                        <p className="text-xs text-gray-500">{t("team.weekOf")} January 13 to 19, 2026</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 w-32">{t("team.team")}</th>
                                {weekDays.map((day) => (
                                    <th key={day} className="py-3 px-2 text-center text-sm font-semibold text-gray-600">{t("common.days." + day)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((member) => (
                                <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: member.color || "var(--color-primary)" }}>
                                                {member.name[0]}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                                        </div>
                                    </td>
                                    {weekDays.map((day) => {
                                        const data = scheduleData[member.name]?.[day] || { available: false, appointments: 0 };
                                        return (
                                            <td key={day} className="py-3 px-2 text-center">
                                                {data.available ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="px-2 py-1 bg-[var(--color-success-light)] text-[var(--color-success)] text-xs rounded-full font-medium">
                                                            {data.appointments} {t("team.apt")}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                        {t("team.off")}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Today's Timeline */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("team.today")}</h3>
                            <p className="text-xs text-gray-500">Monday, January 13, 2026</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">{t("team.yesterday")}</Button>
                        <Button variant="primary" size="sm">{t("team.today")}</Button>
                        <Button variant="outline" size="sm">{t("team.tomorrow")}</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-[800px]">
                        {/* Time Column */}
                        <div className="w-16 flex-shrink-0">
                            <div className="h-10" /> {/* Header spacer */}
                            {hours.map((hour) => (
                                <div key={hour} className="h-12 flex items-center text-xs text-gray-500">
                                    {hour}
                                </div>
                            ))}
                        </div>

                        {/* Team Member Columns */}
                        {workers.slice(0, 4).map((member) => (
                            <div key={member.id} className="flex-1 min-w-[120px]">
                                <div className="h-10 flex items-center justify-center">
                                    <span className="px-3 py-1 text-white text-xs rounded-full font-medium" style={{ backgroundColor: member.color || "var(--color-primary)" }}>
                                        {member.name}
                                    </span>
                                </div>
                                {hours.map((hour, idx) => (
                                    <div key={hour} className="h-12 border border-gray-100 rounded-lg m-0.5 hover:bg-[var(--color-primary-light)] cursor-pointer transition-colors flex items-center justify-center">
                                        {idx % 3 === 0 && (
                                            <span className="text-xs text-[var(--color-primary)] font-medium">{t("team.apt")}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </TeamLayout>
    );
}
