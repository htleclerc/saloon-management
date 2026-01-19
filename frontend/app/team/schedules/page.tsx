"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Plus, User } from "lucide-react";

const teamMembers = [
    { id: 1, name: "Orphelia", color: "from-[var(--color-primary)] to-[var(--color-primary-dark)]" },
    { id: 2, name: "Team Member 2", color: "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]" },
    { id: 3, name: "Team Member 3", color: "from-[var(--color-warning)] to-[var(--color-warning-dark)]" },
    { id: 4, name: "Team Member 4", color: "from-[var(--color-success)] to-[var(--color-success-dark)]" },
    { id: 5, name: "Team Member 5", color: "from-[var(--color-info,bg-blue-500)] to-[var(--color-info-dark,bg-blue-600)]" },
    { id: 6, name: "Team Member 6", color: "from-[var(--color-primary-dark)] to-[var(--color-secondary-dark)]" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

// Mock schedule data
const scheduleData: Record<string, Record<string, { available: boolean; appointments: number }>> = {
    "Orphelia": { "Mon": { available: true, appointments: 3 }, "Tue": { available: true, appointments: 4 }, "Wed": { available: true, appointments: 2 }, "Thu": { available: true, appointments: 5 }, "Fri": { available: true, appointments: 3 }, "Sat": { available: false, appointments: 0 }, "Sun": { available: false, appointments: 0 } },
    "Team Member 2": { "Mon": { available: true, appointments: 4 }, "Tue": { available: true, appointments: 3 }, "Wed": { available: false, appointments: 0 }, "Thu": { available: true, appointments: 4 }, "Fri": { available: true, appointments: 5 }, "Sat": { available: true, appointments: 2 }, "Sun": { available: false, appointments: 0 } },
    "Team Member 3": { "Mon": { available: true, appointments: 2 }, "Tue": { available: true, appointments: 4 }, "Wed": { available: true, appointments: 3 }, "Thu": { available: true, appointments: 2 }, "Fri": { available: true, appointments: 4 }, "Sat": { available: true, appointments: 3 }, "Sun": { available: false, appointments: 0 } },
    "Team Member 4": { "Mon": { available: true, appointments: 3 }, "Tue": { available: false, appointments: 0 }, "Wed": { available: true, appointments: 4 }, "Thu": { available: true, appointments: 3 }, "Fri": { available: true, appointments: 2 }, "Sat": { available: false, appointments: 0 }, "Sun": { available: false, appointments: 0 } },
    "Team Member 5": { "Mon": { available: false, appointments: 0 }, "Tue": { available: true, appointments: 3 }, "Wed": { available: true, appointments: 2 }, "Thu": { available: true, appointments: 4 }, "Fri": { available: true, appointments: 3 }, "Sat": { available: true, appointments: 2 }, "Sun": { available: false, appointments: 0 } },
    "Team Member 6": { "Mon": { available: true, appointments: 5 }, "Tue": { available: true, appointments: 4 }, "Wed": { available: true, appointments: 3 }, "Thu": { available: false, appointments: 0 }, "Fri": { available: true, appointments: 4 }, "Sat": { available: true, appointments: 3 }, "Sun": { available: false, appointments: 0 } },
};

export default function TeamSchedulesPage() {
    return (
        <TeamLayout
            title="Schedules"
            description="Manage team schedules and availability"
        >
            {/* Quick Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4" />
                    Default Hours
                </Button>
                <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Time Off
                </Button>
            </div>

            {/* Weekly Schedule Grid */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>
                        <p className="text-xs text-gray-500">Week of January 13 to 19, 2026</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 w-32">Team Member</th>
                                {weekDays.map((day) => (
                                    <th key={day} className="py-3 px-2 text-center text-sm font-semibold text-gray-600">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
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
                                                            {data.appointments} APT
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                        Off
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
                            <h3 className="font-semibold text-gray-900">Today</h3>
                            <p className="text-xs text-gray-500">Monday, January 13, 2026</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Yesterday</Button>
                        <Button variant="primary" size="sm">Today</Button>
                        <Button variant="outline" size="sm">Tomorrow</Button>
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
                        {teamMembers.slice(0, 4).map((member) => (
                            <div key={member.id} className="flex-1 min-w-[120px]">
                                <div className="h-10 flex items-center justify-center">
                                    <span className={`px-3 py-1 bg-gradient-to-r ${member.color} text-white text-xs rounded-full font-medium`}>
                                        {member.name}
                                    </span>
                                </div>
                                {hours.map((hour, idx) => (
                                    <div key={hour} className="h-12 border border-gray-100 rounded-lg m-0.5 hover:bg-[var(--color-primary-light)] cursor-pointer transition-colors flex items-center justify-center">
                                        {idx % 3 === 0 && (
                                            <span className="text-xs text-[var(--color-primary)] font-medium">APT</span>
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
