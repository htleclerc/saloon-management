"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Check, X, Plus, Search, Scissors, Heart, AlertCircle, HelpCircle } from "lucide-react";

// Mock data
const services = [
    { id: 1, name: "Box Braids", description: "Classic box braids with extensions", duration: "3-4 hours", price: "€120", image: "🎀", category: "Braids" },
    { id: 2, name: "Cornrows", description: "Traditional cornrow braiding", duration: "2-3 hours", price: "€85", image: "🌾", category: "Braids" },
    { id: 3, name: "Twists", description: "Beautiful twist hairstyle", duration: "2.5-3 hours", price: "€95", image: "🌀", category: "Braids" },
    { id: 4, name: "Locs", description: "Professional locs maintenance", duration: "3-5 hours", price: "€150", image: "🔗", category: "Locs" },
    { id: 5, name: "Hair Treatment", description: "Deep conditioning treatment", duration: "1-2 hours", price: "€75", image: "💆", category: "Treatment" },
    { id: 6, name: "Senegalese Twists", description: "Elegant Senegalese twist style", duration: "4-5 hours", price: "€135", image: "✨", category: "Braids" },
    { id: 7, name: "Other", description: "Custom service", duration: "Variable", price: "To be defined", image: "🎨", category: "Other" },
];

const salons = [
    { id: "tenant_1", name: "Demo Salon", servicesOffered: [1, 2, 5] },
    { id: "tenant_2", name: "Downtown Branch", servicesOffered: [3, 4, 6] },
    { id: "tenant_3", name: "Luxury Spa", servicesOffered: [5, 6, 7] },
    { id: "tenant_4", name: "Afro Chic", servicesOffered: [1, 2, 3, 4] },
];

const workers = [
    { id: 1, name: "Orphelia", avatar: "O", specialty: "Braids & Twists", rating: 4.9, clients: 187, available: true, color: "from-purple-500 to-purple-700" },
    { id: 2, name: "Worker 2", avatar: "W2", specialty: "All Services", rating: 4.8, clients: 156, available: true, color: "from-pink-500 to-pink-700" },
    { id: 3, name: "Worker 3", avatar: "W3", specialty: "Locs Specialist", rating: 4.7, clients: 165, available: false, color: "from-orange-500 to-orange-700" },
    { id: 4, name: "Worker 4", avatar: "W4", specialty: "Braids Expert", rating: 4.6, clients: 142, available: true, color: "from-teal-500 to-teal-700" },
];

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { BookingStatus, Client } from "@/types";

export default function BookAppointmentPage() {
    const { user, isClient, isAdmin, isWorker } = useAuth();
    const { getAvailableSlots, addBooking, updateBooking, bookings } = useBooking();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSalonId = searchParams.get("salonId");

    const [isEditMode, setIsEditMode] = useState(false);
    const [step, setStep] = useState<number>(isClient ? 1 : 0); // Admins start at Step 0: Client Selection, Clients at 1: Salon
    const [selectedSalon, setSelectedSalon] = useState<any>(null);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [selectedWorkers, setSelectedWorkers] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [initialBooking, setInitialBooking] = useState<any>(null);
    const [serviceDetails, setServiceDetails] = useState("");
    const [bookingComment, setBookingComment] = useState("");
    const [salonSearch, setSalonSearch] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [showMobileHelp, setShowMobileHelp] = useState(false);

    const [clientInfo, setClientInfo] = useState({
        name: user?.name || "",
        phone: "",
        email: user?.email || "",
        isAnonymous: false
    });

    // Derive favorites from booking history
    const favoriteSalonIds = useMemo(() => {
        return Array.from(new Set(bookings
            .filter(b => b.clientId === parseInt(user?.id || '0'))
            .map(b => b.salonId)));
    }, [bookings, user]);

    const favoriteServiceIds = useMemo(() => {
        const ids = bookings
            .filter(b => b.clientId === parseInt(user?.id || '0'))
            .flatMap(b => b.serviceIds);
        return Array.from(new Set(ids));
    }, [bookings, user]);

    const filteredAndSortedSalons = useMemo(() => {
        return salons
            .filter(s => {
                const matchesName = s.name.toLowerCase().includes(salonSearch.toLowerCase());
                const matchesService = s.servicesOffered.some(sid =>
                    services.find(ser => ser.id === sid)?.name.toLowerCase().includes(salonSearch.toLowerCase())
                );
                return matchesName || matchesService;
            })
            .sort((a, b) => {
                const aFav = favoriteSalonIds.includes(a.id);
                const bFav = favoriteSalonIds.includes(b.id);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return 0;
            });
    }, [salonSearch, favoriteSalonIds, step, isAdmin]); // Re-run if step/admin changes

    // Extract unique clients from bookings
    const existingClients = useMemo(() => {
        const clientMap = new Map();
        bookings.forEach(b => {
            if (b.clientId && b.clientId !== 'anonymous' && b.clientName) {
                clientMap.set(b.clientId, {
                    id: b.clientId,
                    name: b.clientName,
                    email: b.clientEmail,
                    phone: b.clientPhone
                });
            }
        });
        return Array.from(clientMap.values());
    }, [bookings]);

    const filteredClients = useMemo(() => {
        if (!clientSearch) return existingClients;
        return existingClients.filter(c =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
            (c.phone && c.phone.includes(clientSearch))
        );
    }, [clientSearch, existingClients]);

    // Automatic salon selection for admins
    useEffect(() => {
        if (isAdmin && !selectedSalon) {
            setSelectedSalon(salons[0]); // Default to first salon (Demo Salon)
        }
    }, [isAdmin, selectedSalon]);

    const handleNext = () => {
        if (step === 2 && isClient) {
            setStep(4); // Skip Workers for clients
        } else if (step === 0 && !isClient) {
            setStep(2); // Skip Salon for Admin/Workers
        } else if (step < 5) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step === 4 && isClient) {
            setStep(2); // Skip Workers for clients
        } else if (step === 2 && !isClient) {
            setStep(0); // Skip Salon back to Client for Admin
        } else if (step > (isClient ? 1 : 0)) {
            setStep(step - 1);
        }
    };

    // Handle deep linking and pre-selection
    useEffect(() => {
        if (urlSalonId) {
            const salon = salons.find(s => s.id === urlSalonId);
            if (salon) {
                setSelectedSalon(salon);
                if (isClient && step === 1) {
                    setStep(2); // Jump to Services if salon is already known
                }
            }
        }
    }, [urlSalonId, isClient]);

    // Handle Edit Mode pre-filling
    useEffect(() => {
        const editId = searchParams.get("edit");
        if (editId && bookings.length > 0) {
            const bookingToEdit = bookings.find(b => b.id === parseInt(editId));
            if (bookingToEdit && !isEditMode) {
                setIsEditMode(true);
                setClientInfo({
                    name: bookingToEdit.clientName,
                    email: bookingToEdit.clientEmail || "",
                    phone: bookingToEdit.clientPhone || "",
                    isAnonymous: bookingToEdit.clientId === 'anonymous'
                });

                const salon = salons.find(s => s.id === bookingToEdit.salonId);
                if (salon) setSelectedSalon(salon);

                const selectedSrvs = services.filter(s => bookingToEdit.serviceIds.includes(s.id));
                setSelectedServices(selectedSrvs);

                const selectedWrks = workers.filter(w => bookingToEdit.workerIds.includes(w.id));
                setSelectedWorkers(selectedWrks);

                setSelectedDate(bookingToEdit.date);
                setSelectedTime(bookingToEdit.time);
                setServiceDetails(bookingToEdit.customServiceDetails || "");
                setInitialBooking(bookingToEdit);

                // Check for jump step
                const jumpStep = searchParams.get("step");
                if (jumpStep !== null) {
                    setStep(parseInt(jumpStep));
                } else {
                    setStep(5);
                }
            }
        }
    }, [searchParams, bookings, isEditMode]);

    // Update client info if user changes
    useEffect(() => {
        if (user) {
            setClientInfo(prev => ({
                ...prev,
                name: user.name,
                email: user.email || ""
            }));
        }
    }, [user]);

    const toggleService = (service: any) => {
        setSelectedServices(prev =>
            prev.find(s => s.id === service.id)
                ? prev.filter(s => s.id !== service.id)
                : [...prev, service]
        );
    };

    const toggleWorker = (worker: any) => {
        setSelectedWorkers(prev =>
            prev.find(w => w.id === worker.id)
                ? prev.filter(w => w.id !== worker.id)
                : [...prev, worker]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return clientInfo.isAnonymous || clientInfo.name; // For Admin
            case 1: return selectedSalon !== null;
            case 2: return selectedServices.length > 0 && (selectedServices.find(s => s.id === 7) ? serviceDetails.trim() !== "" : true);
            case 3: return selectedWorkers.length > 0;
            case 4: return selectedDate !== "" && selectedTime !== "";
            case 5: return true;
            default: return false;
        }
    };

    const handleSubmit = () => {
        const totalDuration = selectedServices.reduce((sum, s) => {
            let mins = 60;
            if (s.duration && s.duration.toLowerCase().includes('hour')) {
                mins = (parseInt(s.duration) || 1) * 60;
            } else if (s.duration) {
                mins = parseInt(s.duration) || 60;
            }
            return sum + mins;
        }, 0);

        if (isEditMode) {
            const editId = searchParams.get("edit");
            if (editId) {
                updateBooking(parseInt(editId), {
                    salonId: selectedSalon?.id || urlSalonId || "tenant_1",
                    clientName: clientInfo.name,
                    clientEmail: clientInfo.email,
                    clientPhone: clientInfo.phone,
                    serviceIds: selectedServices.map(s => s.id),
                    customServiceDetails: serviceDetails,
                    workerIds: selectedWorkers.map(w => w.id),
                    date: selectedDate,
                    time: selectedTime,
                    duration: totalDuration,
                });
            }
        } else {
            addBooking({
                salonId: selectedSalon?.id || urlSalonId || "tenant_1",
                clientId: clientInfo.isAnonymous ? 'anonymous' : (user?.id ? parseInt(user.id) : 'new'),
                clientName: clientInfo.name,
                clientEmail: clientInfo.email,
                clientPhone: clientInfo.phone,
                serviceIds: selectedServices.map(s => s.id),
                customServiceDetails: serviceDetails,
                workerIds: selectedWorkers.map(w => w.id),
                date: selectedDate,
                time: selectedTime,
                duration: totalDuration,
                status: isClient ? 'Pending' : 'Confirmed',
            });
        }

        console.log("Booking created/updated");
        router.push("/appointments");
    };

    const handleUpdateCurrentStep = () => {
        const editId = searchParams.get("edit");
        if (!editId || !isEditMode) return;

        const totalDuration = selectedServices.reduce((sum, s) => {
            let mins = 60;
            if (s.duration && s.duration.toLowerCase().includes('hour')) {
                mins = (parseInt(s.duration) || 1) * 60;
            } else if (s.duration) {
                mins = parseInt(s.duration) || 60;
            }
            return sum + mins;
        }, 0);

        updateBooking(parseInt(editId), {
            salonId: selectedSalon?.id || urlSalonId || "tenant_1",
            clientName: clientInfo.name,
            clientEmail: clientInfo.email,
            clientPhone: clientInfo.phone,
            serviceIds: selectedServices.map(s => s.id),
            customServiceDetails: serviceDetails,
            workerIds: selectedWorkers.map(w => w.id),
            date: selectedDate,
            time: selectedTime,
            duration: totalDuration,
        });

        // After individual update, go back to summary
        setStep(5);
    };

    const handleStepJump = (targetStep: number) => {
        if (isEditMode) {
            setStep(targetStep);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] via-white to-gray-50/30">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/appointments" className="inline-flex items-center text-[var(--color-primary)] hover:opacity-80 mb-4 transition-opacity">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Appointments
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Book Your Appointment {selectedSalon ? `at ${selectedSalon.name}` : ""}
                    </h1>
                    <p className="text-gray-600">Follow the steps to schedule your visit</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-4xl mx-auto overflow-hidden">
                        {[
                            { num: 0, label: "Client", roles: ['admin', 'manager', 'worker'] },
                            { num: 1, label: "Salon", roles: ['client'] }, // Admin skips salon selection
                            { num: 2, label: "Services" },
                            { num: 3, label: "Workers", roles: ['admin', 'manager', 'worker'] },
                            { num: 4, label: "Schedule" },
                            { num: 5, label: "Summary" }
                        ].filter(s => !s.roles || s.roles.includes(user?.role || '')).map((s, idx, arr) => (
                            <div key={s.num} className="flex items-center flex-1 last:flex-none">
                                <button
                                    onClick={() => handleStepJump(s.num)}
                                    disabled={!isEditMode}
                                    className={`flex flex-col items-center flex-1 transition-all ${isEditMode ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${step >= s.num ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary-light)]' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                                    </div>
                                    <span className={`text-[8px] sm:text-[10px] mt-2 font-bold uppercase tracking-wider text-center line-clamp-1 ${step >= s.num ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                                        <span className="hidden xs:inline">{s.label}</span>
                                        {step === s.num && <span className="xs:hidden">{s.label}</span>}
                                    </span>
                                </button>
                                {idx < arr.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded transition-all ${step > s.num ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 0: Select Client (Admin/Worker only) */}
                {(step === 0 || step === -1) && !isClient && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-primary">Who is the client?</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setClientInfo({ ...clientInfo, isAnonymous: true, name: "Anonymous Client" })}
                                    className={`p-6 rounded-xl border-2 transition-all ${clientInfo.isAnonymous ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="font-bold">Anonymous</p>
                                </button>
                                <button
                                    onClick={() => setClientInfo({ ...clientInfo, isAnonymous: false, name: "" })}
                                    className={`p-6 rounded-xl border-2 transition-all ${!clientInfo.isAnonymous && clientInfo.name === "" ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                >
                                    <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--color-primary)]">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold">New Client</p>
                                </button>
                                <button
                                    onClick={() => setStep(-1)} // Toggle search mode
                                    className={`p-6 rounded-xl border-2 transition-all ${step === -1 ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                >
                                    <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--color-primary)]">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold">Search Client</p>
                                </button>
                            </div>

                            {step === -1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or phone..."
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none"
                                            value={clientSearch}
                                            onChange={(e) => setClientSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {filteredClients.length === 0 ? (
                                            <p className="text-center py-4 text-gray-500 text-sm italic">No matching clients found</p>
                                        ) : (
                                            filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setClientInfo({ name: c.name, email: c.email || "", phone: c.phone || "", isAnonymous: false });
                                                        setStep(0);
                                                    }}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-primary-light)] rounded-xl border border-gray-100 transition-colors"
                                                >
                                                    <div className="text-left font-primary">
                                                        <p className="font-bold text-gray-900">{c.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.email || "No email"} • {c.phone || "No phone"}</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold">Select</Button>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setStep(0)}
                                        className="text-sm font-bold text-[var(--color-primary)] px-2"
                                    >
                                        ← Back to selection
                                    </button>
                                </div>
                            )}

                            {!clientInfo.isAnonymous && step !== -1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={clientInfo.name}
                                            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none"
                                            placeholder="e.g. Marie Dubois"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Phone</label>
                                        <input
                                            type="tel"
                                            value={clientInfo.phone}
                                            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none"
                                            placeholder="06 00 00 00 00"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Step 1: Select Salon */}
                {step === 1 && (
                    <Card className="p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select a salon</h2>
                            <div className="relative w-full sm:w-80 md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search salon or service..."
                                    value={salonSearch}
                                    onChange={(e) => setSalonSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        {filteredAndSortedSalons.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No salons found matching "{salonSearch}"</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {filteredAndSortedSalons.map((salon) => {
                                    const isSelected = selectedSalon?.id === salon.id;
                                    const isFavorite = favoriteSalonIds.includes(salon.id);
                                    return (
                                        <div
                                            key={salon.id}
                                            onClick={() => setSelectedSalon(salon)}
                                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${isSelected
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg'
                                                : 'border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white rounded-full p-1 animate-in zoom-in">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                            {!isSelected && isFavorite && (
                                                <div className="absolute top-4 right-4 text-[var(--color-error)] animate-pulse">
                                                    <Heart className="w-5 h-5 fill-current" />
                                                </div>
                                            )}
                                            <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-[var(--color-primary)] mb-4">
                                                <Scissors className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900">{salon.name}</h3>
                                                {isFavorite && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Fav</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{isFavorite ? "Your favorite!" : "Click to select"}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                )}

                {/* Step 2: Select Services */}
                {step === 2 && (
                    <Card className="p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Select services</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {services.map((service) => {
                                const isSelected = selectedServices.find(s => s.id === service.id);
                                const isFavorite = favoriteServiceIds.includes(service.id);
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service)}
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${isSelected
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg'
                                            : 'border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white rounded-full p-1 animate-in zoom-in">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        {!isSelected && isFavorite && (
                                            <div className="absolute top-4 right-4 text-[var(--color-error)]">
                                                <Heart className="w-5 h-5 fill-current" />
                                            </div>
                                        )}
                                        <div className="text-5xl mb-4">{service.image}</div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                            {isFavorite && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Fav</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {service.duration}
                                            </span>
                                            <span className="text-gray-900 font-bold text-lg">{service.price}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedServices.find(s => s.id === 7) && (
                            <div className="mt-6 p-4 bg-[var(--color-primary-light)] rounded-xl animate-in zoom-in-95">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Custom service details *
                                </label>
                                <textarea
                                    value={serviceDetails}
                                    onChange={(e) => setServiceDetails(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none min-h-[100px]"
                                    placeholder="Describe what you want..."
                                />
                            </div>
                        )}
                    </Card>
                )}

                {/* Step 3: Select Workers (Admin/Worker only) */}
                {step === 3 && !isClient && (
                    <Card className="p-4 sm:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select workers</h2>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {workers.map((worker) => {
                                const isSelected = selectedWorkers.find(w => w.id === worker.id);
                                return (
                                    <div
                                        key={worker.id}
                                        onClick={() => worker.available && toggleWorker(worker)}
                                        className={`p-4 sm:p-6 rounded-xl border-2 transition-all relative ${!worker.available
                                            ? 'opacity-50 cursor-not-allowed border-gray-100'
                                            : isSelected
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg cursor-pointer'
                                                : 'border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md cursor-pointer'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[var(--color-primary)] text-white rounded-full p-1 animate-in zoom-in">
                                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-xl`}>
                                                {worker.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-1">{worker.name}</h3>
                                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider line-clamp-1">{worker.specialty}</p>
                                                {!worker.available && <span className="text-[8px] sm:text-[10px] text-red-500 font-bold uppercase mt-1 block">Unavailable</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* Step 4: Select Date & Time */}
                {step === 4 && (
                    <Card className="p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 font-primary text-center sm:text-left">When would you like to come?</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Appointment date</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowMobileHelp(!showMobileHelp)}
                                        className="lg:hidden p-1 text-orange-500 hover:text-orange-600 transition-all active:scale-90"
                                    >
                                        <HelpCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Custom Mobile Help Panel */}
                                {showMobileHelp && (
                                    <div className="lg:hidden mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-orange-700 mb-1 uppercase tracking-tight">Créneaux Flexibles</p>
                                                <p className="text-[10px] text-orange-600 leading-snug">
                                                    Les créneaux orange indiquent une forte affluence. Nous les laissons ouverts pour vous offrir plus de flexibilité. Ces demandes seront validées manuellement.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowMobileHelp(false)}
                                                className="text-orange-400 p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none text-sm sm:text-base mb-4"
                                />

                                {/* Desktop Information Panel */}
                                <div className="hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-6 bg-gradient-to-br from-[var(--color-warning-light)] to-white border border-[var(--color-warning-light)] rounded-2xl shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 text-[var(--color-warning)]">
                                            <div className="bg-[var(--color-warning-light)] p-2 rounded-lg">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-sm uppercase tracking-widest">Flexible Scheduling</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                                                Orange slots indicate potentially busy times where we allow <span className="text-[var(--color-warning)] font-bold underline decoration-[var(--color-warning-light)] decoration-2 underline-offset-2">flexible requests</span>.
                                            </p>
                                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                                These will be reviewed manually. Choose them if you're flexible with the exact start time.
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-[var(--color-warning-light)] grid grid-cols-2 gap-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary-light)]"></div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Your Selection</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)] shadow-sm shadow-[var(--color-warning-light)]"></div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Needs Review</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Standard Slot</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning-light)] border border-[var(--color-warning-light)]"></div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Waitlist</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-wider">Time slot</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 h-[200px] sm:h-[300px] overflow-y-auto p-1 scrollbar-hide">
                                    {getAvailableSlots(selectedDate || "2026-01-20", user?.id).map((slot) => {
                                        const isSelected = selectedTime === slot.time;
                                        const isClosed = slot.status === 'unavailable';
                                        const isOverbooked = slot.weight > slot.max;
                                        const isFull = slot.weight === slot.max;
                                        const isDanger = (slot.weight >= slot.max + 2) || (slot.weight > slot.max && !selectedDate.includes("allowOverbooking")); // Simplification for now

                                        let styleClasses = "border-gray-100 hover:border-[var(--color-primary-light)] text-gray-700";

                                        if (isSelected) {
                                            styleClasses = "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg";
                                        } else if (isClosed) {
                                            styleClasses = "border-gray-50 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50";
                                        } else if (isDanger) {
                                            styleClasses = "border-[var(--color-error-light)] bg-[var(--color-error)] text-white font-bold";
                                        } else if (isOverbooked) {
                                            styleClasses = "border-[var(--color-error-light)] bg-[var(--color-error-light)] text-[var(--color-error)] font-bold";
                                        } else if (isFull) {
                                            styleClasses = "border-[var(--color-warning-light)] bg-[var(--color-warning)] text-white font-bold shadow-sm shadow-[var(--color-warning-light)]";
                                        } else if (slot.weight > 0) {
                                            styleClasses = "border-[var(--color-warning-light)] bg-[var(--color-warning-light)] text-[var(--color-warning)] hover:border-[var(--color-warning)]";
                                        }

                                        return (
                                            <button
                                                key={slot.time}
                                                disabled={isClosed && !isAdmin}
                                                onClick={() => setSelectedTime(slot.time)}
                                                className={`py-2 sm:py-3 px-1 sm:px-2 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center relative ${styleClasses}`}
                                            >
                                                <span>{slot.time}</span>
                                                {slot.weight > 0 && (
                                                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border ${isSelected ? 'bg-white text-[var(--color-primary)] border-[var(--color-primary)]' :
                                                        isFull || isDanger ? 'bg-white text-gray-900 border-gray-200' :
                                                            'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary-light)]'
                                                        }`}>
                                                        {slot.weight}
                                                    </span>
                                                )}
                                                {isDanger && <span className="text-[6px] uppercase mt-0.5">Alert</span>}
                                                {isFull && !isDanger && <span className="text-[6px] uppercase mt-0.5">Surcharge</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 5: Summary */}
                {step === 5 && (
                    <Card className="p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 font-primary text-center sm:text-left">Review your request</h2>
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl space-y-1">
                                        <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Salon</p>
                                        <p className="text-sm sm:font-bold text-gray-900 truncate">{selectedSalon?.name || "Not selected"}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl space-y-1">
                                        <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Client</p>
                                        <p className="text-sm sm:font-bold text-gray-900 truncate">{clientInfo.name}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl space-y-1">
                                        <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Date & Time</p>
                                        <p className="text-sm sm:font-bold text-gray-900">{selectedDate}</p>
                                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                                            <span>{selectedTime}</span>
                                            <ArrowRight className="w-2 h-2" />
                                            <span className="font-bold text-[var(--color-primary)]">
                                                {(() => {
                                                    if (!selectedTime) return "";
                                                    const totalDuration = selectedServices.reduce((sum, s) => {
                                                        let mins = 60;
                                                        if (s.duration && s.duration.toLowerCase().includes('hour')) {
                                                            mins = (parseInt(s.duration) || 1) * 60;
                                                        } else if (s.duration) {
                                                            mins = parseInt(s.duration) || 60;
                                                        }
                                                        return sum + mins;
                                                    }, 0);
                                                    const [h, m] = selectedTime.split(':').map(Number);
                                                    const d = new Date();
                                                    d.setHours(h, m, 0, 0);
                                                    d.setMinutes(d.getMinutes() + totalDuration);
                                                    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Services</p>
                                    <div className="space-y-2">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl sm:text-2xl">{s.image}</span>
                                                    <div>
                                                        <p className="text-sm sm:font-bold text-gray-900">{s.name}</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-500">{s.duration}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm sm:font-bold text-[var(--color-primary)]">{s.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Comment (Optional)</label>
                                    <textarea
                                        value={bookingComment}
                                        onChange={(e) => setBookingComment(e.target.value)}
                                        className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none"
                                        placeholder="Add a detail for the salon..."
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="lg:w-80 bg-gradient-to-br from-[var(--color-primary)] to-gray-900 rounded-2xl sm:rounded-3xl p-6 text-white shadow-2xl h-fit lg:sticky lg:top-24">
                                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 border-b border-white/20 pb-4">Global Summary</h3>
                                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="opacity-70">Services</span>
                                        <span className="font-bold">{selectedServices.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="opacity-70">Total Duration</span>
                                        <span className="font-bold">~{selectedServices.reduce((sum, s) => {
                                            let mins = 60;
                                            if (s.duration && s.duration.toLowerCase().includes('hour')) {
                                                mins = (parseInt(s.duration) || 1) * 60;
                                            } else if (s.duration) {
                                                mins = parseInt(s.duration) || 60;
                                            }
                                            return sum + mins;
                                        }, 0)} min</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="opacity-70">Assigned</span>
                                        <span className="font-bold">{selectedWorkers.length > 0 ? selectedWorkers.length : 'Automatic'}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/20 mb-6">
                                    <p className="text-[8px] sm:text-[10px] opacity-60 uppercase font-black tracking-tighter mb-1">Estimated Total</p>
                                    <p className="text-3xl sm:text-4xl font-black">${selectedServices.reduce((sum, s) => sum + (parseInt(s.price.replace('€', '')) || 0), 0)}</p>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-white text-[var(--color-primary)] hover:bg-white/90 font-black uppercase py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
                {/* Navigation Buttons */}
                <div className="flex items-center justify-end sm:justify-between mt-8 gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        disabled={step === (isClient ? 1 : 0)}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>

                    {step < 5 && (
                        <div className="flex gap-3">
                            {isEditMode && (
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={handleUpdateCurrentStep}
                                    disabled={!canProceed()}
                                    className="gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    <span className="hidden sm:inline">Save this step</span>
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="bg-[var(--color-primary)] hover:opacity-90 gap-2"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
