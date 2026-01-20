"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Booking, BookingStatus, DayCapacity, BookingInteraction, BookingComment } from "@/types";
import { useAuth } from "./AuthProvider";
import { useIncome } from "./IncomeProvider";

interface BookingContextType {
    bookings: Booking[];
    dayCapacities: Record<string, DayCapacity>;
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory' | 'comments' | 'endTime'>) => void;
    updateBookingStatus: (id: number, status: BookingStatus, comment?: string) => void;
    updateBookingWorkers: (id: number, workerIds: number[]) => void;
    cancelBooking: (id: number, reason?: string) => void;
    updateBooking: (id: number, updates: Partial<Booking>) => void;
    approveReschedule: (id: number) => void;
    rejectReschedule: (id: number, reason?: string) => void;
    addComment: (id: number, text: string) => void;
    updateDayCapacity: (date: string, updates: Partial<DayCapacity>) => void;
    toggleSlotClosure: (date: string, time: string) => void;
    getAvailableSlots: (date: string, clientId?: number | string) => Array<{ time: string; status: 'available' | 'waitlist' | 'unavailable'; isSensitive?: boolean; weight: number; max: number }>;
    getBookingHistory: (id: number) => BookingInteraction[];
    startBooking: (id: number) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Default time slots
const DEFAULT_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export function BookingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { addIncome } = useIncome();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [dayCapacities, setDayCapacities] = useState<Record<string, DayCapacity>>({});
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true);
        const savedBookings = localStorage.getItem("workshop-bookings");
        const savedCapacities = localStorage.getItem("workshop-capacities");

        if (savedBookings) setBookings(JSON.parse(savedBookings));
        if (savedCapacities) setDayCapacities(JSON.parse(savedCapacities));
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("workshop-bookings", JSON.stringify(bookings));
            localStorage.setItem("workshop-capacities", JSON.stringify(dayCapacities));
        }
    }, [bookings, dayCapacities, mounted]);

    // Auto-closure logic
    useEffect(() => {
        if (!mounted) return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const currentDateStr = now.toISOString().split('T')[0];

            setBookings(prev => prev.map(b => {
                if (b.status === 'Started' && b.date === currentDateStr && currentTimeStr >= b.endTime) {
                    const interaction: BookingInteraction = {
                        id: Math.random().toString(36).substr(2, 9),
                        timestamp: new Date(),
                        user: "System",
                        action: "Auto-closed (time expired)",
                    };
                    return {
                        ...b,
                        status: 'Closed',
                        updatedAt: new Date(),
                        interactionHistory: [...b.interactionHistory, interaction]
                    };
                }
                return b;
            }));
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [mounted]);

    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory' | 'comments' | 'endTime'>) => {
        const endTime = calculateEndTime(bookingData.time, bookingData.duration);
        const newBooking: Booking = {
            ...bookingData,
            endTime,
            id: Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
            interactionHistory: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                    user: user?.name || "System",
                    action: "Created",
                }
            ],
            comments: []
        };
        setBookings(prev => [...prev, newBooking]);
    };

    const updateBookingStatus = (id: number, status: BookingStatus, comment?: string) => {
        setBookings(prev => prev.map(b => {
            if (b.id === id) {
                const interaction: BookingInteraction = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                    user: user?.name || "System",
                    action: `Status changed to ${status}`,
                    comment
                };
                return {
                    ...b,
                    status,
                    updatedAt: new Date(),
                    interactionHistory: [...b.interactionHistory, interaction]
                };
            }
            return b;
        }));
    };

    const updateBookingWorkers = (id: number, workerIds: number[]) => {
        setBookings(prev => prev.map(b => {
            if (b.id === id) {
                const interaction: BookingInteraction = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                    user: user?.name || "System",
                    action: `Workers updated`,
                };
                return {
                    ...b,
                    workerIds,
                    updatedAt: new Date(),
                    interactionHistory: [...b.interactionHistory, interaction]
                };
            }
            return b;
        }));
    };

    const cancelBooking = (id: number, reason?: string) => {
        updateBookingStatus(id, 'Cancelled', reason);
    };

    const updateBooking = (id: number, updates: Partial<Booking>) => {
        setBookings(prev => prev.map(b => {
            if (b.id === id) {
                const updatedBooking = { ...b, ...updates };
                let action = "Booking modified";
                let newStatus = b.status;

                // Check if admin is rescheduling
                const isReschedule = updates.time || updates.date;
                const isAdmin = user?.role === 'admin' || user?.role === 'manager' || user?.name === 'Orphelia';

                if (isReschedule && isAdmin && b.status !== 'PendingApproval') {
                    newStatus = 'PendingApproval';
                    action = `Rescheduled to ${updates.date || b.date} at ${updates.time || b.time} - Waiting for client approval`;
                }

                if (updates.time || updates.duration) {
                    updatedBooking.endTime = calculateEndTime(updatedBooking.time, updatedBooking.duration);
                }

                const interaction: BookingInteraction = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                    user: user?.name || "System",
                    action: action,
                };

                return {
                    ...updatedBooking,
                    status: newStatus,
                    updatedAt: new Date(),
                    interactionHistory: [...b.interactionHistory, interaction]
                };
            }
            return b;
        }));
    };

    const approveReschedule = (id: number) => {
        updateBookingStatus(id, 'Confirmed', "Reschedule approved by client");
    };

    const rejectReschedule = (id: number, reason?: string) => {
        updateBookingStatus(id, 'Cancelled', reason || "Reschedule rejected by client");
    };

    const addComment = (id: number, text: string) => {
        setBookings(prev => prev.map(b => {
            if (b.id === id) {
                const comment: BookingComment = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                    user: user?.name || "System",
                    text
                };
                return {
                    ...b,
                    comments: [...b.comments, comment],
                    updatedAt: new Date()
                };
            }
            return b;
        }));
    };

    const updateDayCapacity = (date: string, updates: Partial<DayCapacity>) => {
        setDayCapacities(prev => ({
            ...prev,
            [date]: {
                ...(prev[date] || { date, maxSlots: 5, closedSlots: [], isClosed: false, allowOverbooking: false }),
                ...updates
            }
        }));
    };

    const toggleSlotClosure = (date: string, time: string) => {
        setDayCapacities(prev => {
            const current = prev[date] || { date, maxSlots: 5, closedSlots: [], isClosed: false, allowOverbooking: false };
            const isClosed = current.closedSlots.includes(time);
            const newClosedSlots = isClosed
                ? current.closedSlots.filter(t => t !== time)
                : [...current.closedSlots, time];

            return {
                ...prev,
                [date]: { ...current, closedSlots: newClosedSlots }
            };
        });
    };

    const getAvailableSlots = (date: string, clientId?: number | string) => {
        const capacity = dayCapacities[date] || { date, maxSlots: 5, closedSlots: [], isClosed: false, allowOverbooking: false };

        if (capacity.isClosed) {
            return DEFAULT_TIME_SLOTS.map(time => ({ time, status: 'unavailable' as const, weight: 0, max: capacity.maxSlots }));
        }

        const activeBookings = bookings.filter(b =>
            b.date === date &&
            !['Cancelled', 'Closed'].includes(b.status)
        );

        return DEFAULT_TIME_SLOTS.map(time => {
            if (capacity.closedSlots.includes(time)) {
                return { time, status: 'unavailable' as const, weight: 0, max: capacity.maxSlots };
            }

            // Check if this specific client already has a booking that overlaps with this time
            if (clientId) {
                const hasOwnBooking = activeBookings.some(b => {
                    const start = b.time;
                    const end = b.endTime;
                    return time >= start && time < (end || start);
                });
                if (hasOwnBooking) {
                    return { time, status: 'unavailable' as const, weight: 0, max: capacity.maxSlots };
                }
            }

            // Calculate weight (number of distinct bookings overlapping this slot)
            const overlappingBookings = activeBookings.filter(b => {
                const start = b.time;
                const end = b.endTime;
                return time >= start && time < (end || start);
            });
            const bookingCount = overlappingBookings.length;

            let status: 'available' | 'waitlist' | 'unavailable' = 'available';
            let isSensitive = false;

            if (bookingCount >= capacity.maxSlots) {
                if (capacity.allowOverbooking || (user?.role === 'admin' || user?.role === 'manager')) {
                    status = 'available'; // Admins can always "force" booking
                    isSensitive = true;
                } else {
                    status = 'waitlist';
                }
            } else if (bookingCount > 0) {
                isSensitive = true;
            }

            return { time, status, isSensitive, weight: bookingCount, max: capacity.maxSlots };
        });
    };

    const getBookingHistory = (id: number) => {
        return bookings.find(b => b.id === id)?.interactionHistory || [];
    };

    const startBooking = (id: number) => {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        // 1. Update booking status
        updateBookingStatus(id, 'Started', "Appointment started by user");

        // 2. Create draft income
        // Calculation of amount (sum of services if we had prices here, but for now we follow the pre-filled detail logic)
        // In a real app we'd fetch prices. For this mockup, let's assume some default or use previous data.
        const incomeId = addIncome({
            date: booking.date,
            clientId: booking.clientId as any,
            clientName: booking.clientName,
            serviceIds: booking.serviceIds,
            workerIds: booking.workerIds,
            amount: 100, // Placeholder amount, will be editable
            status: 'Draft',
            createdBy: user?.name || "System",
            bookingIds: [id],
        });

        // 3. Link income to booking
        setBookings(prev => prev.map(b => b.id === id ? { ...b, incomeId } : b));
    };

    return (
        <BookingContext.Provider
            value={{
                bookings,
                dayCapacities,
                addBooking,
                updateBookingStatus,
                updateBookingWorkers,
                cancelBooking,
                updateBooking,
                approveReschedule,
                rejectReschedule,
                addComment,
                updateDayCapacity,
                toggleSlotClosure,
                getAvailableSlots,
                getBookingHistory,
                startBooking
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error("useBooking must be used within a BookingProvider");
    }
    return context;
}
