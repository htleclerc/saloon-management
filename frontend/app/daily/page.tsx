"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { useConfirm } from "@/context/ConfirmProvider";
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
    CheckCircle,
    PlayCircle
} from "lucide-react";

export default function DailyPage() {
    const [selectedDate, setSelectedDate] = useState("2026-01-19"); // Hardcoded to match task context if needed
    const { getCardStyle } = useKpiCardStyle();
    const { user, hasPermission, getWorkerId, canModify } = useAuth();
    const { bookings, startBooking } = useBooking();
    const { confirm } = useConfirm();

    const workerId = getWorkerId();
    const isWorker = user?.role === 'worker';

    // Simple date filter for demo: only today's bookings
    const dailyBookings = bookings.filter(b => b.date === selectedDate);

    const filteredAppointments = isWorker
        ? dailyBookings.filter(apt => (apt.workerIds || []).includes(Number(workerId) || 0))
        : dailyBookings;

    const availableWorkers = isWorker
        ? [user?.name || 'Worker']
        : ['Orphelia', 'Worker 2', 'Worker 3'];

    const handleStart = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Start appointment?",
            message: "Start this appointment and create draft income?",
            type: "info",
            confirmText: "Start",
            cancelText: "Cancel"
        });
        if (isConfirmed) {
            startBooking(id);
        }
    };

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
                        title="Today's Bookings"
                        value={filteredAppointments.length.toString()}
                        subtitle="Total scheduled"
                        icon={Calendar}
                        gradient=""
                        style={getCardStyle(0)}
                    />
                    <StatCard
                        title="Completed"
                        value={filteredAppointments.filter(b => b.status === 'Closed' || b.status === 'Finished').length.toString()}
                        subtitle="Done for today"
                        icon={CheckCircle}
                        gradient=""
                        style={getCardStyle(1)}
                    />
                    <StatCard
                        title="In Progress"
                        value={filteredAppointments.filter(b => b.status === 'Started').length.toString()}
                        subtitle="Currently working"
                        icon={Clock}
                        gradient=""
                        style={getCardStyle(2)}
                    />
                    <StatCard
                        title="Income (Draft)"
                        value="€-- "
                        subtitle="Calculated on validation"
                        icon={DollarSign}
                        gradient=""
                        style={getCardStyle(3)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
                            <Button variant="outline" size="sm">Print Schedule</Button>
                        </div>
                        <div className="space-y-6">
                            {filteredAppointments.length > 0 ? filteredAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
                                <div key={apt.id} className="relative pl-8 border-l-2 border-purple-100 pb-6 last:pb-0">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${apt.status === 'Started' ? 'bg-blue-500' :
                                        apt.status === 'Closed' || apt.status === 'Finished' ? 'bg-green-500' : 'bg-purple-500'
                                        }`}></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-bold text-purple-600 w-16">{apt.time}</div>
                                            <div>
                                                <p className="font-bold text-gray-900">{apt.clientName}</p>
                                                <p className="text-sm text-gray-500">Service: {apt.serviceIds.join(", ")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${apt.status === 'Closed' || apt.status === 'Finished' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'Started' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            {canModify && (apt.status === 'Pending' || apt.status === 'Confirmed') && (
                                                <Button size="sm" onClick={() => handleStart(apt.id)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                                    <PlayCircle className="w-4 h-4" /> Start
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-12">No appointments scheduled for this date.</p>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Staff Status</h3>
                            <div className="space-y-4">
                                {availableWorkers.map((worker, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                                                {worker.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{worker}</span>
                                        </div>
                                        <span className={`w-3 h-3 rounded-full bg-green-500`}></span>
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
                                Ensure all started bookings are closed at the end of the service to generate invoices.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
