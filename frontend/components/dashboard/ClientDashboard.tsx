"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Star, MessageSquare, ChevronRight, CheckCircle, Plus, Info, X, Edit, Trash2, AlertCircle } from "lucide-react";
import { useBooking } from "@/context/BookingProvider";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppointmentDetailModal from "@/components/booking/AppointmentDetailModal";

// Helper for labels
const servicesList = [
    { id: 1, name: "Box Braids", price: 120 },
    { id: 2, name: "Cornrows", price: 85 },
    { id: 3, name: "Twists", price: 95 },
    { id: 4, name: "Locs", price: 150 },
    { id: 5, name: "Hair Treatment", price: 75 },
    { id: 6, name: "Senegalese Twists", price: 135 },
    { id: 7, name: "Other", price: 0 },
];

const pastServicesDefault = [
    { id: 101, salon: "Downtown Branch", service: "Cornrows", date: "2025-12-15", worker: "Fatima", price: "€85", rating: null, comment: "" },
    { id: 102, salon: "Demo Salon", service: "Twists", date: "2025-11-20", worker: "Amara", price: "€95", rating: 5, comment: "Excellent service!" },
];

export default function ClientDashboard() {
    const { bookings, cancelBooking } = useBooking();
    const { user, isAdmin, isClient } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState(pastServicesDefault);
    const [ratingModal, setRatingModal] = useState<{ open: boolean; serviceId: number | null }>({ open: false, serviceId: null });
    const [detailModal, setDetailModal] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");

    const handleRate = (serviceId: number) => {
        setRatingModal({ open: true, serviceId });
    };

    const submitRating = () => {
        if (ratingModal.serviceId) {
            setHistory(prev => prev.map(s =>
                s.id === ratingModal.serviceId
                    ? { ...s, rating: newRating, comment: newComment }
                    : s
            ));
            setRatingModal({ open: false, serviceId: null });
            setNewRating(0);
            setNewComment("");
        }
    };

    // Filter user's upcoming appointments
    const clientAppointments = React.useMemo(() => {
        return bookings
            .filter(b => (b.clientName === user?.name || b.clientId === parseInt(user?.id || '0')) && !['Cancelled', 'Completed', 'Finished'].includes(b.status))
            .map(b => ({
                ...b,
                salon: "Demo Salon", // In a real app, this would be looked up
                servicesLabel: b.serviceIds.map(id => servicesList.find(s => s.id === id)?.name || "Service").join(", "),
            }));
    }, [bookings, user]);

    const handleCancel = (id: number) => {
        if (confirm("Are you sure you want to cancel this appointment?")) {
            cancelBooking(id, "Cancelled by client");
            setDetailModal({ open: false, appointment: null });
        }
    };

    const handleEdit = (apt: any) => {
        // Redirige vers le booking avec des params pour pré-remplir
        // Pour cet MVP, on simule en passant l'ID
        router.push(`/appointments/book?edit=${apt.id}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">Client Space</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Find your upcoming appointments and history below.</p>
                </div>
                <div className="flex w-full md:w-auto items-center justify-center md:justify-end">
                    <Link href="/appointments/book">
                        <Button variant="primary" size="md" className="rounded-2xl h-14 w-full md:w-auto md:px-8 flex items-center justify-center shadow-xl shadow-purple-500/30 active:scale-95 transition-all text-lg md:text-base">
                            <Plus className="w-8 h-8 md:w-6 md:h-6" />
                            <span className="ml-2 font-bold whitespace-nowrap">Book Appointment</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Next Appointments */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">My Next Appointments</h3>
                </div>
                {clientAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clientAppointments.map(apt => (
                            <Card
                                key={apt.id}
                                className="p-4 border-l-4 border-purple-500 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => setDetailModal({ open: true, appointment: apt })}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-purple-600 font-bold">
                                            <Calendar className="w-4 h-4" />
                                            <span>{apt.date} at {apt.time}</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{apt.servicesLabel}</p>
                                        <p className="text-sm text-gray-500">{apt.salon}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold uppercase">Details</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-8 text-center text-gray-500 italic">
                        You have no upcoming appointments.
                    </Card>
                )}
            </div>

            {/* History & Ratings */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">My Past Services</h3>
                <div className="grid grid-cols-1 gap-4">
                    {history.map(service => (
                        <Card key={service.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                                        {service.service.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{service.service}</p>
                                        <p className="text-sm text-gray-500">{service.salon} • with {service.worker}</p>
                                        <p className="text-xs text-gray-400 mt-1">{service.date}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:items-end justify-center gap-2">
                                    {service.rating ? (
                                        <div className="space-y-1">
                                            <div className="flex text-yellow-400">
                                                {"★".repeat(service.rating)}
                                                <span className="text-gray-200">{"★".repeat(5 - service.rating)}</span>
                                            </div>
                                            {service.comment && <p className="text-xs text-gray-600 italic max-w-xs md:text-right">"{service.comment}"</p>}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-sm"
                                            onClick={() => handleRate(service.id)}
                                        >
                                            <Star className="w-4 h-4" /> Rate service
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Rating Modal */}
            {ratingModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <Card className="w-full max-w-md p-6 space-y-4">
                        <h3 className="text-xl font-bold">Rate your service</h3>
                        <div className="flex justify-center gap-2 text-3xl">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    className={`${newRating >= star ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition-transform`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                            placeholder="Your comment..."
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex gap-3 pt-2">
                            <Button variant="danger" className="flex-1" onClick={() => setRatingModal({ open: false, serviceId: null })}>Cancel</Button>
                            <Button variant="success" className="flex-1" onClick={submitRating}>Save</Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                isOpen={detailModal.open}
                appointment={detailModal.appointment}
                onClose={() => setDetailModal({ open: false, appointment: null })}
                onCancel={handleCancel}
                onEdit={handleEdit}
                servicesList={servicesList}
                userRole={user?.role}
                isAdmin={isAdmin}
            />
        </div>
    );
}
