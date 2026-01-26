"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Calendar,
    Clock,
    Star,
    MessageSquare,
    ChevronRight,
    CheckCircle,
    Plus,
    Info,
    X,
    Edit,
    Trash2,
    AlertCircle,
    MapPin,
    User,
    Sparkles,
    Heart,
    Bell,
    Settings,
    ArrowRight,
    History as HistoryIcon
} from "lucide-react";
import { useBooking } from "@/context/BookingProvider";
import { useAuth } from "@/context/AuthProvider";
import { serviceService } from "@/lib/services/ServiceService";
import { bookingService } from "@/lib/services/BookingService";
import AppointmentDetailModal from "@/components/booking/AppointmentDetailModal";

export default function ClientDashboard() {
    const { bookings, cancelBooking } = useBooking();
    const { user, isSuperAdmin, isClient, activeSalonId } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [pastBookings, setPastBookings] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [ratingModal, setRatingModal] = useState<{ open: boolean; serviceId: number | null }>({ open: false, serviceId: null });
    const [detailModal, setDetailModal] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        async function loadClientData() {
            setLoading(true);
            try {
                // Fetch all services for label matching
                if (activeSalonId) {
                    const salonServices = await serviceService.getAll(Number(activeSalonId));
                    setServices(salonServices);
                }

                // Fetch history (Finished bookings)
                if (user?.id && activeSalonId) {
                    const response = await bookingService.getAll(Number(activeSalonId), { clientId: Number(user.id) });
                    const finished = response.data.filter((b: any) => b.status === 'Finished' || b.status === 'Completed');
                    setPastBookings(finished);
                }
            } catch (error) {
                console.error("Error loading client dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadClientData();
    }, [user?.id, activeSalonId]);

    const handleRate = (serviceId: number) => {
        setRatingModal({ open: true, serviceId });
    };

    const submitRating = () => {
        if (ratingModal.serviceId) {
            // In a real app, this would call a reviewService
            setPastBookings(prev => prev.map(s =>
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
            .filter(b => (b.clientId === Number(user?.id)) && !['Cancelled', 'Completed', 'Finished'].includes(b.status))
            .map(b => ({
                ...b,
                servicesLabel: (b as any).serviceNames?.join(", ") || "Service Personnalisé",
            }));
    }, [bookings, user]);

    const handleCancel = (id: number) => {
        if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
            cancelBooking(id, "Cancelled by client");
            setDetailModal({ open: false, appointment: null });
        }
    };

    const handleEdit = (apt: any) => {
        router.push(`/appointments/book?edit=${apt.id}`);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-4">
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-gray-100 rounded-3xl"></div>
                    <div className="h-48 bg-gray-100 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 px-2 md:px-0 animate-in fade-in duration-500">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--color-primary)] to-[#7c3aed] p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
                            <Sparkles className="w-3 h-3" />
                            Espace Client Privilège
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Ravi de vous revoir, <span className="text-purple-200">{user?.name}</span> !</h1>
                        <p className="text-purple-100 text-lg font-medium italic opacity-90 max-w-xl">
                            Consultez vos prochains rendez-vous et votre historique beauté en un clin d'œil.
                        </p>
                    </div>
                    <Link href="/appointments/book" className="w-full md:w-auto">
                        <Button variant="outline" className="w-full md:w-auto px-10 py-8 rounded-[2rem] bg-white text-[var(--color-primary)] hover:bg-purple-50 border-none shadow-xl active:scale-95 transition-all text-xl font-black uppercase tracking-wider flex items-center gap-3">
                            <Plus className="w-6 h-6" />
                            Réserver
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Upcoming Appointments (Left - 2cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight italic flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-[var(--color-primary)]" />
                            Mes prochains rendez-vous
                        </h3>
                        <span className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-black rounded-full uppercase tracking-widest">
                            {clientAppointments.length} à venir
                        </span>
                    </div>

                    {clientAppointments.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {clientAppointments.map(apt => (
                                <Card
                                    key={apt.id}
                                    className="p-8 border-none bg-white rounded-[2rem] shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                                    onClick={() => setDetailModal({ open: true, appointment: apt })}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary-light)] opacity-20 rounded-bl-[4rem]"></div>
                                    <div className="w-24 h-24 bg-[var(--color-primary-light)] rounded-3xl flex flex-col items-center justify-center text-[var(--color-primary)] shrink-0">
                                        <span className="text-2xl font-black tabular-nums">{format(new Date(apt.date), "dd")}</span>
                                        <span className="text-xs font-black uppercase tracking-widest">{format(new Date(apt.date), "MMM")}</span>
                                    </div>
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-purple-600 font-black text-sm uppercase tracking-wider">
                                            <Clock className="w-4 h-4" />
                                            <span>{apt.time}</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-tight italic">{apt.servicesLabel}</h4>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 font-medium">
                                            <MapPin className="w-4 h-4" />
                                            <span>{(apt as any).salonName || "Notre Salon"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
                                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>
                                            {apt.status === 'Confirmed' ? 'Confirmé' : 'En attente'}
                                        </span>
                                        <div className="flex items-center gap-2 text-[var(--color-primary)] font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                            <span>Détails</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                            <div className="max-w-xs mx-auto space-y-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <Calendar className="w-10 h-10" />
                                </div>
                                <h4 className="text-xl font-black text-gray-400">Aucun rendez-vous prévu</h4>
                                <p className="text-gray-400 font-medium italic">Envie d'une nouvelle coiffure ? Réservez votre prochaine séance maintenant !</p>
                                <Link href="/appointments/book" className="inline-block pt-2">
                                    <Button variant="primary" className="rounded-2xl px-8 shadow-lg shadow-purple-500/20 font-black uppercase text-xs tracking-widest">
                                        Réserver
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar (Right - 1col) */}
                <div className="space-y-10">
                    {/* Quick Profile */}
                    <Card className="p-8 border-none bg-white rounded-[2.5rem] shadow-lg text-center space-y-6">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-[2rem] flex items-center justify-center text-[var(--color-primary)] text-4xl font-black shadow-inner">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl"></div>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">{user?.name}</h4>
                            <p className="text-sm font-bold text-[var(--color-primary)]">Client Fidèle</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Services</p>
                                <p className="text-2xl font-black text-gray-900">{pastBookings.length}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Points</p>
                                <p className="text-2xl font-black text-[var(--color-warning)]">{pastBookings.length * 10}</p>
                            </div>
                        </div>
                        <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                            <Settings className="w-4 h-4" />
                            Gérer mon compte
                        </button>
                    </Card>

                    {/* History Small */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight italic flex items-center gap-3 px-4">
                            <HistoryIcon className="w-6 h-6 text-[var(--color-secondary)]" />
                            Dernières Visites
                        </h3>
                        <div className="space-y-4">
                            {pastBookings.slice(0, 3).map(service => (
                                <Card key={service.id} className="p-6 border-none bg-white rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black group-hover:bg-[var(--color-secondary-light)] group-hover:text-[var(--color-secondary)] transition-all">
                                                {service.workerName?.charAt(0) || "S"}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 text-sm group-hover:text-[var(--color-secondary)] transition-colors">{(service as any).serviceNames?.join(", ") || "Prestation"}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{format(new Date(service.date), "dd MMM yyyy")}</p>
                                            </div>
                                        </div>
                                        {service.rating ? (
                                            <div className="flex text-yellow-400 scale-90 -translate-x-1">
                                                {"★".repeat(service.rating)}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full py-2.5 rounded-xl border-gray-100 text-[10px] font-black uppercase tracking-widest hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
                                                onClick={() => handleRate(service.id)}
                                            >
                                                <Star className="w-3.5 h-3.5 mr-2" /> Laisser un avis
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {pastBookings.length === 0 && (
                                <p className="text-center text-gray-400 italic font-medium py-10">Pas encore de rendez-vous terminés.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {ratingModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <Card className="w-full max-w-md p-8 space-y-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 italic">Votre Avis Compte</h3>
                            <p className="text-sm text-gray-400 font-medium">Comment s'est passée votre séance ?</p>
                        </div>
                        <div className="flex justify-center gap-3 text-4xl py-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    className={`${newRating >= star ? "text-yellow-400" : "text-gray-200"} hover:scale-125 hover:rotate-12 transition-all duration-300`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[var(--color-primary-light)] focus:bg-white rounded-2xl text-sm font-medium italic outline-none min-h-[120px] transition-all"
                            placeholder="Partagez votre expérience..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" className="flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6" onClick={() => setRatingModal({ open: false, serviceId: null })}>Annuler</Button>
                            <Button variant="primary" className="flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6 shadow-xl shadow-purple-500/20" onClick={submitRating}>Enregistrer</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                isOpen={detailModal.open}
                appointment={detailModal.appointment}
                onClose={() => setDetailModal({ open: false, appointment: null })}
                onCancel={(id) => handleCancel(id)}
                onEdit={handleEdit}
                servicesList={services}
                userRole={user?.role}
                isAdmin={isSuperAdmin}
            />
        </div>
    );
}
