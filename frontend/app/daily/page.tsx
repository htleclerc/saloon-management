"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Scissors,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from "lucide-react";

const appointments = [
    { id: 1, time: "09:00", client: "Marie Dubois", service: "Box Braids", worker: "Orphelia", amount: "€120", status: "Completed" },
    { id: 2, time: "10:30", client: "Jean Martin", service: "Cornrows", worker: "Worker 2", amount: "€85", status: "In Progress" },
    { id: 3, time: "13:00", client: "Sophie Laurent", service: "Twists", worker: "Orphelia", amount: "€95", status: "Scheduled" },
    { id: 4, time: "15:30", client: "Pierre Rousseau", service: "Locs", worker: "Worker 3", amount: "€150", status: "Scheduled" },
];

export default function DailyPage() {
    const [selectedDate, setSelectedDate] = useState("2024-01-15");
    const { getCardStyle } = useKpiCardStyle();
    const { user, hasPermission, getWorkerId } = useAuth();

    const workerId = getWorkerId();
    const isWorker = user?.role === 'worker';

    // Filter appointments by worker if user is a worker
    const filteredAppointments = isWorker
        ? appointments.filter(apt => apt.worker === user?.name || apt.worker === 'Orphelia') // Using name match for demo
        : appointments;

    // Filter workers list to show only current worker for workers
    const availableWorkers = isWorker
        ? ['Orphelia'] // Show only current worker in demo
        : ['Orphelia', 'Worker 2', 'Worker 3'];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daily Overview</h1>
                        <p className="text-gray-500 mt-1">Manage today's schedule and track daily performance</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                        <Button variant="outline" size="sm" className="p-2">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2 px-4 font-semibold text-gray-700">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <span>{selectedDate}</span>
                        </div>
                        <Button variant="outline" size="sm" className="p-2">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Daily Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Income"
                        value="€1,245"
                        subtitle="15 appointments"
                        icon={DollarSign}
                        gradient=""
                        style={getCardStyle(0)}
                    />
                    <StatCard
                        title="Completed"
                        value="12"
                        subtitle="Out of 15"
                        icon={CheckCircle}
                        gradient=""
                        style={getCardStyle(1)}
                    />
                    <StatCard
                        title="Pending"
                        value="2"
                        subtitle="Scheduled"
                        icon={Clock}
                        gradient=""
                        style={getCardStyle(2)}
                    />
                    <StatCard
                        title="Avg. Ticket"
                        value="€56"
                        subtitle="+5% from yesterday"
                        icon={TrendingUp}
                        gradient=""
                        style={getCardStyle(3)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline/Schedule */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
                            <Button variant="outline" size="sm">Print Schedule</Button>
                        </div>
                        <div className="space-y-6">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="relative pl-8 border-l-2 border-purple-100 pb-6 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-bold text-purple-600 w-16">{apt.time}</div>
                                            <div>
                                                <p className="font-bold text-gray-900">{apt.client}</p>
                                                <p className="text-sm text-gray-500">{apt.service} • {apt.worker}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{apt.amount}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Worker Availability</h3>
                            <div className="space-y-4">
                                {availableWorkers.map((worker, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                                                {worker.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{worker}</span>
                                        </div>
                                        <span className={`w - 3 h - 3 rounded - full ${i === 2 ? 'bg-red-500' : 'bg-green-500'} `}></span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-700 to-purple-900 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Quick Note</h3>
                            </div>
                            <p className="text-sm opacity-90 leading-relaxed mb-4">
                                Remember to check the stock for hair oils. We are running low on the premium brand.
                            </p>
                            <Button variant="secondary" size="sm" className="w-full">
                                Add Note
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
