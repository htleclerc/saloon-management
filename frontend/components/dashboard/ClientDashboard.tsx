"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Star, MessageSquare, ChevronRight, CheckCircle } from "lucide-react";

const nextAppointments = [
    { id: 1, salon: "Demo Salon", service: "Box Braids", date: "2026-01-20", time: "09:00 AM", status: "Confirmed" },
];

const pastServices = [
    { id: 101, salon: "Downtown Branch", service: "Cornrows", date: "2025-12-15", worker: "Fatima", price: "€85", rating: null, comment: "" },
    { id: 102, salon: "Demo Salon", service: "Twists", date: "2025-11-20", worker: "Amara", price: "€95", rating: 5, comment: "Excellent service !" },
];

export default function ClientDashboard() {
    const [history, setHistory] = useState(pastServices);
    const [ratingModal, setRatingModal] = useState<{ open: boolean; serviceId: number | null }>({ open: false, serviceId: null });
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Space</h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1">Welcome back! Find your upcoming appointments and history below.</p>
                </div>
            </div>

            {/* Next Appointments */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">My Next Appointments</h3>
                    <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">Book Appointment</Button>
                </div>
                {nextAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nextAppointments.map(apt => (
                            <Card key={apt.id} className="p-4 border-l-4 border-purple-500">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-purple-600 font-bold">
                                            <Calendar className="w-4 h-4" />
                                            <span>{apt.date} at {apt.time}</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{apt.service}</p>
                                        <p className="text-sm text-gray-500">{apt.salon}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        {apt.status}
                                    </span>
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
                            <Button variant="outline" className="flex-1" onClick={() => setRatingModal({ open: false, serviceId: null })}>Cancel</Button>
                            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={submitRating}>Save</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
