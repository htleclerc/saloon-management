"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Lock,
    Unlock,
    Users,
    AlertTriangle,
    Plus,
    Check,
    X,
    Settings
} from "lucide-react";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const DEFAULT_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function CalendarPage() {
    const { user, hasPermission, canModify } = useAuth();
    const {
        bookings,
        dayCapacities,
        updateDayCapacity,
        toggleSlotClosure,
        updateBookingStatus
    } = useBooking();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

    const capacity = useMemo(() => {
        return dayCapacities[selectedDate] || {
            date: selectedDate,
            maxSlots: 5,
            closedSlots: [],
            isClosed: false,
            allowOverbooking: false
        };
    }, [dayCapacities, selectedDate]);

    const activeBookings = useMemo(() => {
        return bookings.filter(b => b.date === selectedDate && !['Cancelled', 'Closed'].includes(b.status));
    }, [bookings, selectedDate]);

    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const toggleDayStatus = () => {
        if (!canModify) return;
        updateDayCapacity(selectedDate, { isClosed: !capacity.isClosed });
    };

    const toggleOverbooking = () => {
        if (!canModify) return;
        updateDayCapacity(selectedDate, { allowOverbooking: !capacity.allowOverbooking });
    };

    const adjustMaxCapacity = (delta: number) => {
        if (!canModify) return;
        const newVal = Math.max(1, capacity.maxSlots + delta);
        updateDayCapacity(selectedDate, { maxSlots: newVal });
    };

    if (!hasPermission(['super_admin', 'manager'])) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-gray-500">You don't have permission to manage the calendar.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Interactive Calendar</h1>
                        <p className="text-gray-500 mt-1">Manage slots, capacity, and overbooking</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                            <Button variant="outline" size="sm" className="p-2" onClick={handlePrevDay}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-2 px-3 font-bold text-gray-800">
                                <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
                                <span>{selectedDate}</span>
                            </div>
                            <Button variant="outline" size="sm" className="p-2" onClick={handleNextDay}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <ReadOnlyGuard>
                                <Button
                                    variant={capacity.isClosed ? "primary" : "outline"}
                                    className={capacity.isClosed ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-100 hover:bg-red-50"}
                                    onClick={toggleDayStatus}
                                >
                                    {capacity.isClosed ? <Lock className="w-4 h-4 sm:mr-2" /> : <Unlock className="w-4 h-4 sm:mr-2" />}
                                    <span className="hidden sm:inline">{capacity.isClosed ? "Day Closed" : "Close Day"}</span>
                                </Button>
                            </ReadOnlyGuard>

                            <ReadOnlyGuard>
                                <Link href="/appointments/book">
                                    <Button className="bg-[var(--color-primary)] hover:opacity-90">
                                        <Plus className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">New Appointment</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                        </div>
                    </div>
                </div>

                {/* Management Bar */}
                <Card className="p-4 bg-white border-[var(--color-primary-light)]">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default Capacity</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => adjustMaxCapacity(-1)}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-black text-[var(--color-primary)] w-8 text-center">{capacity.maxSlots}</span>
                                    <button
                                        onClick={() => adjustMaxCapacity(1)}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-100"></div>

                            <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overbooking</p>
                                    <button
                                        onClick={toggleOverbooking}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${capacity.allowOverbooking
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold'
                                            : 'border-gray-100 text-gray-400 font-medium'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${capacity.allowOverbooking ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
                                            {capacity.allowOverbooking && <Check className="w-2 h-2 text-white" />}
                                        </div>
                                        {capacity.allowOverbooking ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Bookings</p>
                                <p className="text-xl font-black text-gray-900">{activeBookings.length}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {DEFAULT_TIME_SLOTS.map((time) => {
                        const isClosed = capacity.closedSlots.includes(time) || capacity.isClosed;
                        const bookingsInSlot = activeBookings.filter(b => b.time === time);
                        const isFull = bookingsInSlot.length >= capacity.maxSlots;
                        const isOverbooked = bookingsInSlot.length > capacity.maxSlots;

                        return (
                            <div
                                key={time}
                                className={`group relative p-4 rounded-2xl border-2 transition-all h-32 flex flex-col justify-between ${isClosed
                                    ? 'bg-gray-50 border-gray-100 opacity-60'
                                    : isOverbooked
                                        ? 'bg-red-50 border-red-200'
                                        : isFull
                                            ? 'bg-[var(--color-warning-light)] border-[var(--color-warning)]'
                                            : 'bg-white border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`font-black text-lg ${isClosed ? 'text-gray-400' : 'text-gray-900'}`}>{time}</span>
                                    <ReadOnlyGuard>
                                        <button
                                            onClick={() => toggleSlotClosure(selectedDate, time)}
                                            className={`p-1.5 rounded-lg transition-all ${isClosed
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                                                }`}
                                            title={isClosed ? "Open Slot" : "Close Slot"}
                                        >
                                            {isClosed ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                        </button>
                                    </ReadOnlyGuard>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                            <Users className="w-3 h-3" />
                                            <span>{bookingsInSlot.length}/{capacity.maxSlots}</span>
                                        </div>
                                        {isOverbooked && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isOverbooked ? 'bg-[var(--color-error)]' : isFull ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-primary)]'
                                                }`}
                                            style={{ width: `${Math.min(100, (bookingsInSlot.length / capacity.maxSlots) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Floating Tooltip with appointments list on hover */}
                                {bookingsInSlot.length > 0 && (
                                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-900 text-white p-2 rounded-lg text-[10px] invisible group-hover:visible z-50 shadow-xl border border-gray-800 animate-in fade-in slide-in-from-bottom-1">
                                        <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-purple-400">Bookings ({bookingsInSlot.length})</p>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {bookingsInSlot.map((b, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="truncate pr-2">{b.clientName}</span>
                                                    <span className="text-gray-400">{b.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
}
