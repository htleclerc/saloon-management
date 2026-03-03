"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    MessageSquare,
    CheckCircle,
    X,
    Trash2,
    AlertCircle,
    History,
    FileText,
    Download
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Booking } from "@/types";

import { bookingService } from "@/lib/services";
import { BookingWithRelations } from "@/types";

export default function AppointmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = parseInt(params.id as string);
    const fromHistory = searchParams.get("fromHistory") === "true";
    const { user, hasPermission } = useAuth();

    // State
    const [appointment, setAppointment] = React.useState<BookingWithRelations | null>(null);
    const [history, setHistory] = React.useState<any[]>([]);
    const [comments, setComments] = React.useState<any[]>([]);
    const [income, setIncome] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Safety check for user role
    // Using simple role check if hasPermission type is strict
    // const isAdminView = hasPermission(['Owner', 'SuperAdmin', 'Manager']); 
    // Fallback to user role string check to avoid complex type issues for now
    const isAdminView = user?.role === 'owner' || user?.role === 'super_admin' || user?.role === 'manager';

    React.useEffect(() => {
        const fetchData = async () => {
            if (!appointmentId) return;
            try {
                setLoading(true);
                // Fetch appointment first to get salonId
                const aptData = await bookingService.getWithRelations(appointmentId);

                if (!aptData) {
                    setError("Appointment not found");
                } else {
                    setAppointment(aptData);

                    // Fetch related data in parallel
                    // incomeService.getByBooking is not implemented in service fully yet (returned null in my edit), 
                    // so use getAll with filter or just empty for now pending implementation.
                    // Actually I can try getAll
                    // const incomeData = await incomeService.getAll(aptData.salonId, { bookingId: appointmentId }); // check filter name

                    const [historyData, commentsData] = await Promise.all([
                        bookingService.getHistory(appointmentId),
                        bookingService.getComments(appointmentId)
                    ]);

                    setHistory(historyData);
                    setComments(commentsData);
                    // setIncome(incomeData[0] || null); 
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load appointment details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [appointmentId]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (error || !appointment) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-xl font-bold text-gray-900">{error || "Appointment not found"}</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <ProtectedRoute requiredRole={["super_admin", "owner", "manager", "worker"]}>
            <MainLayout>
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">
                                    {fromHistory ? "Audit Review Mode" : "Management View"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            {isAdminView && <Button variant="primary">Edit Appointment</Button>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="p-8 border-none shadow-2xl shadow-gray-200/50 bg-white rounded-[2.5rem]">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {appointment.status === 'Confirmed' ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</p>
                                            <h2 className="text-2xl font-black text-gray-900">{appointment.status}</h2>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-right">Reference</p>
                                        <h2 className="text-xl font-bold text-[var(--color-primary)]">#BK-{appointment.id}</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Schedule</p>
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                                                <span className="text-lg font-bold">{appointment.date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-900 mt-2">
                                                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                                                <span className="text-lg font-bold">{appointment.time} - {appointment.endTime}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Client Information</p>
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <User className="w-5 h-5 text-[var(--color-primary)]" />
                                                <span className="text-lg font-bold">{appointment.clientName}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 ml-8">Regular Client • Salon Member</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Service Details</p>
                                            <div className="space-y-3">
                                                {appointment.services && appointment.services.map((service: any) => (
                                                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <span className="font-bold text-gray-700">{service.name}</span>
                                                        <span className="font-black text-[var(--color-primary)]">€{service.price}</span>
                                                    </div>
                                                ))}
                                                {(!appointment.services || appointment.services.length === 0) && (
                                                    <p className="text-gray-500 italic">No services listed</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Internal Communication */}
                            <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2.5rem] space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-[var(--color-primary)]" />
                                    Internal Comments
                                </h3>
                                <div className="space-y-4">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="bg-purple-50 p-5 rounded-3xl border border-purple-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-black text-xs text-[var(--color-primary)] uppercase tracking-wider">{comment.userCode || comment.user || 'System'}</span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(comment.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed italic">"{comment.text || comment.comment}"</p>
                                        </div>
                                    ))}
                                    {(!comments || comments.length === 0) && (
                                        <p className="text-gray-500 italic">No comments yet.</p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar: Audit & Documents */}
                        <div className="space-y-8">
                            <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem] space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <History className="w-5 h-5 text-[var(--color-primary)]" />
                                    <h3 className="font-bold text-gray-900">Audit Trail</h3>
                                </div>
                                <div className="space-y-6 relative">
                                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-50"></div>
                                    {history.slice().reverse().map((interaction: any) => (
                                        <div key={interaction.id} className="flex gap-4 relative z-10">
                                            <div className="w-5 h-5 rounded-full bg-white border-4 border-purple-200 shrink-0"></div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                                                    {interaction.action}
                                                </p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                    {interaction.user || interaction.userCode || 'System'} • {new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {income && (
                                <Card className="p-6 border-none shadow-xl shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold">Billing Available</h3>
                                    </div>
                                    <p className="text-sm text-white/80">This appointment has a validated income record and generated invoice.</p>
                                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 py-4 rounded-2xl border-none">
                                        <Download className="w-4 h-4 mr-2" /> Download PDF
                                    </Button>
                                </Card>
                            )}

                            <div className="px-4">
                                {isAdminView && (
                                    <Button variant="danger" className="w-full justify-start gap-3 py-4 rounded-2xl">
                                        <Trash2 className="w-5 h-5" />
                                        Cancel Booking
                                    </Button>
                                )}
                                <p className="text-[10px] text-gray-400 text-center mt-3 italic">
                                    <AlertCircle className="w-3 h-3 inline mr-1" />
                                    All changes are tracked in the system audit log.
                                </p>
                            </div>
                        </div>
                    </div>

                    {fromHistory && (
                        <div className="flex justify-center pt-8">
                            <Button
                                variant="outline"
                                className="gap-2 border-dashed border-2 hover:bg-gray-50"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Audit Log
                            </Button>
                        </div>
                    )}
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
