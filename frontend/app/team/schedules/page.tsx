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

const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const getWeekRange = (date: Date): string => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to ${endOfWeek.toLocaleDateString('en-US', options)}`;
};

export default function TeamSchedulesPage() {
    const { t } = useTranslation();
    const { workers } = useWorkers();
    const [scheduleData, setScheduleData] = useState<Record<string, Record<string, { available: boolean; appointments: number }>>>({});
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [showDefaultHoursModal, setShowDefaultHoursModal] = useState(false);
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            const data = await statsService.getTeamScheduleStats(1);
            setScheduleData(data);
        };
        loadStats();
    }, []);

    const handlePreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };
    return (
        <TeamLayout
            title={t("team.schedules")}
            description={t("team.schedulesDesc")}
        >
            {/* Quick Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowDefaultHoursModal(true)}>
                    <Clock className="w-4 h-4" />
                    {t("team.defaultHours")}
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowTimeOffModal(true)}>
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
                        <p className="text-xs text-gray-500">{t("team.weekOf")} {getWeekRange(currentDate)}</p>
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
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("team.today")}</h3>
                            <p className="text-xs text-gray-500">{formatDate(currentDate)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <input
                            type="date"
                            value={currentDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value);
                                if (!isNaN(newDate.getTime())) {
                                    setCurrentDate(newDate);
                                }
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePreviousDay}>{t("team.yesterday")}</Button>
                            <Button variant="primary" size="sm" onClick={handleToday}>{t("team.today")}</Button>
                            <Button variant="outline" size="sm" onClick={handleNextDay}>{t("team.tomorrow")}</Button>
                        </div>
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

            {/* Default Hours Modal */}
            {showDefaultHoursModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t("team.defaultHours")}</h3>
                                    <p className="text-xs text-gray-500">{t("team.setDefaultWorkingHours")}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDefaultHoursModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {weekDays.map((day) => (
                                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <span className="w-20 font-medium text-gray-900">{t("common.days." + day)}</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="time"
                                            defaultValue="09:00"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="time"
                                            defaultValue="18:00"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                        />
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={day !== "Sun"} />
                                            <span className="text-sm text-gray-600">{t("team.active")}</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <Button variant="outline" size="sm" onClick={() => setShowDefaultHoursModal(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => {
                                // Here you would save the default hours
                                setShowDefaultHoursModal(false);
                            }}>
                                {t("common.save")}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Time Off Modal */}
            {showTimeOffModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-lg w-full">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t("team.addTimeOff")}</h3>
                                    <p className="text-xs text-gray-500">{t("team.requestTimeOff")}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTimeOffModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.teamMember")}</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm">
                                    <option value="">{t("team.selectMember")}</option>
                                    {workers.map((member) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.startDate")}</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.endDate")}</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.reason")}</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                                    placeholder={t("team.reasonPlaceholder")}
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <Button variant="outline" size="sm" onClick={() => setShowTimeOffModal(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => {
                                // Here you would save the time off request
                                setShowTimeOffModal(false);
                            }}>
                                {t("common.save")}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </TeamLayout>
    );
}
