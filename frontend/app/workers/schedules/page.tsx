"use client";

import WorkersLayout from "@/components/layout/WorkersLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Plus, User } from "lucide-react";

const workers = [
    { id: 1, name: "Orphelia", color: "from-purple-500 to-purple-700" },
    { id: 2, name: "Worker 2", color: "from-pink-500 to-pink-700" },
    { id: 3, name: "Worker 3", color: "from-orange-500 to-orange-700" },
    { id: 4, name: "Worker 4", color: "from-teal-500 to-teal-700" },
    { id: 5, name: "Worker 5", color: "from-blue-500 to-blue-700" },
    { id: 6, name: "Worker 6", color: "from-indigo-500 to-indigo-700" },
];

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

// Mock schedule data
const scheduleData: Record<string, Record<string, { available: boolean; appointments: number }>> = {
    "Orphelia": { "Lun": { available: true, appointments: 3 }, "Mar": { available: true, appointments: 4 }, "Mer": { available: true, appointments: 2 }, "Jeu": { available: true, appointments: 5 }, "Ven": { available: true, appointments: 3 }, "Sam": { available: false, appointments: 0 }, "Dim": { available: false, appointments: 0 } },
    "Worker 2": { "Lun": { available: true, appointments: 4 }, "Mar": { available: true, appointments: 3 }, "Mer": { available: false, appointments: 0 }, "Jeu": { available: true, appointments: 4 }, "Ven": { available: true, appointments: 5 }, "Sam": { available: true, appointments: 2 }, "Dim": { available: false, appointments: 0 } },
    "Worker 3": { "Lun": { available: true, appointments: 2 }, "Mar": { available: true, appointments: 4 }, "Mer": { available: true, appointments: 3 }, "Jeu": { available: true, appointments: 2 }, "Ven": { available: true, appointments: 4 }, "Sam": { available: true, appointments: 3 }, "Dim": { available: false, appointments: 0 } },
    "Worker 4": { "Lun": { available: true, appointments: 3 }, "Mar": { available: false, appointments: 0 }, "Mer": { available: true, appointments: 4 }, "Jeu": { available: true, appointments: 3 }, "Ven": { available: true, appointments: 2 }, "Sam": { available: false, appointments: 0 }, "Dim": { available: false, appointments: 0 } },
    "Worker 5": { "Lun": { available: false, appointments: 0 }, "Mar": { available: true, appointments: 3 }, "Mer": { available: true, appointments: 2 }, "Jeu": { available: true, appointments: 4 }, "Ven": { available: true, appointments: 3 }, "Sam": { available: true, appointments: 2 }, "Dim": { available: false, appointments: 0 } },
    "Worker 6": { "Lun": { available: true, appointments: 5 }, "Mar": { available: true, appointments: 4 }, "Mer": { available: true, appointments: 3 }, "Jeu": { available: false, appointments: 0 }, "Ven": { available: true, appointments: 4 }, "Sam": { available: true, appointments: 3 }, "Dim": { available: false, appointments: 0 } },
};

export default function WorkersSchedulesPage() {
    return (
        <WorkersLayout
            title="Schedules"
            description="Gérez les horaires et disponibilités de votre équipe"
        >
            {/* Quick Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4" />
                    Heures par défaut
                </Button>
                <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4" />
                    Ajouter un congé
                </Button>
            </div>

            {/* Weekly Schedule Grid */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Planning Hebdomadaire</h3>
                        <p className="text-xs text-gray-500">Semaine du 13 au 19 janvier 2026</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 w-32">Travailleur</th>
                                {weekDays.map((day) => (
                                    <th key={day} className="py-3 px-2 text-center text-sm font-semibold text-gray-600">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => (
                                <tr key={worker.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
                                                {worker.name[0]}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{worker.name}</span>
                                        </div>
                                    </td>
                                    {weekDays.map((day) => {
                                        const data = scheduleData[worker.name]?.[day] || { available: false, appointments: 0 };
                                        return (
                                            <td key={day} className="py-3 px-2 text-center">
                                                {data.available ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                            {data.appointments} RDV
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                        Repos
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
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Aujourd'hui</h3>
                            <p className="text-xs text-gray-500">Lundi 13 janvier 2026</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Hier</Button>
                        <Button variant="primary" size="sm">Aujourd'hui</Button>
                        <Button variant="outline" size="sm">Demain</Button>
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

                        {/* Worker Columns */}
                        {workers.slice(0, 4).map((worker) => (
                            <div key={worker.id} className="flex-1 min-w-[120px]">
                                <div className="h-10 flex items-center justify-center">
                                    <span className={`px-3 py-1 bg-gradient-to-r ${worker.color} text-white text-xs rounded-full font-medium`}>
                                        {worker.name}
                                    </span>
                                </div>
                                {hours.map((hour, idx) => (
                                    <div key={hour} className="h-12 border border-gray-100 rounded-lg m-0.5 hover:bg-purple-50 cursor-pointer transition-colors flex items-center justify-center">
                                        {idx % 3 === 0 && (
                                            <span className="text-xs text-purple-600 font-medium">RDV</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </WorkersLayout>
    );
}
