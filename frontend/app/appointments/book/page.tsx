"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Check, X, Plus, Search, Scissors, Heart, AlertCircle, HelpCircle, ChevronRight } from "lucide-react";

// Local services array removed in favor of ServiceProvider
import { useServices } from "@/context/ServiceProvider";
import { CLIENTS } from "@/lib/data";

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
import { useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

function BookAppointmentContent() {
    const { user, isClient, isAdmin, isWorker } = useAuth();
    const { getAvailableSlots, addBooking, updateBooking, bookings } = useBooking();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSalonId = searchParams.get("salonId");

    const [isEditMode, setIsEditMode] = useState(false);
    const [step, setStep] = useState<number>(isClient ? 1 : 0); // Admins start at Step 0: Client Selection, Clients at 1: Salon
    const [selectedSalon, setSelectedSalon] = useState<any>(null);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [selectedWorkers, setSelectedWorkers] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

    // Service & Admin State
    const { services, addService } = useServices();
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceSearch, setServiceSearch] = useState("");
    const [newServiceName, setNewServiceName] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
    const [newServiceDuration, setNewServiceDuration] = useState("");

    // Pagination for Clients
    const [visibleClientsCount, setVisibleClientsCount] = useState(10);

    const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()));

    // Logic: Show first 12, then "View All" button
    const SERVICES_LIMIT = 12;
    const showModalTrigger = services.length > SERVICES_LIMIT;
    const visibleServices = services.slice(0, SERVICES_LIMIT);

    const handleSaveNewService = () => {
        if (handleReadOnlyClick()) return;
        if (!newServiceName || !newServicePrice) {
            // Simple alert or toast if we had access, but for now just return
            alert("Name and Price are required");
            return;
        }
        addService({
            name: newServiceName,
            price: Number(newServicePrice),
            duration: newServiceDuration || "Variable",
            category: "Custom",
            description: "Added via Admin Interface"
        });
        setNewServiceName("");
        setNewServicePrice("");
        setNewServiceDuration("");
        // Deselect "Other" if you want, or keep it.
        // For now, let's just clear inputs.
    };

    // Virtual "Other" Service ID for UI handling
    const OTHER_SERVICE_ID = 9999;

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

    // Extract unique clients from bookings and merge with Mock CLIENTS
    const existingClients = useMemo(() => {
        const clientMap = new Map();

        // 1. Add Mock Clients first
        CLIENTS.forEach(c => {
            clientMap.set(c.id, {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone
            });
        });

        // 2. Add Booking Clients (overriding or adding new ones)
        bookings.forEach(b => {
            if (b.clientId && b.clientId !== 'anonymous' && b.clientName) {
                // Use a synthetic ID if string, or keep number if number
                // For this map, we need a consistent key. 
                // Currently mock IDs are numbers. Booking IDs are numbers.
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
        if (handleReadOnlyClick()) return;
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
        if (handleReadOnlyClick()) return;
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
        <div
            className="min-h-screen"
            style={{
                background: "linear-gradient(135deg, var(--color-primary-light) 0%, #ffffff 50%, #f9fafb 100%)"
            }}
        >
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
                {(step === 0) && !isClient && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-primary">Who is the client?</h2>
                        <div className="space-y-6">
                            {/* Two Buttons Side-by-Side */}
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setClientInfo({ ...clientInfo, isAnonymous: true, name: "Anonymous Client" })}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${clientInfo.isAnonymous ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${clientInfo.isAnonymous ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)]'}`}>
                                            <X className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-sm block">Anonymous</span>
                                        </div>
                                        {clientInfo.isAnonymous && <Check className="w-5 h-5 text-[var(--color-primary)] ml-auto" />}
                                    </button>

                                    <button
                                        onClick={() => setClientInfo({ ...clientInfo, isAnonymous: false, name: "" })}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${!clientInfo.isAnonymous && clientInfo.name === "" ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!clientInfo.isAnonymous && clientInfo.name === "" ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'}`}>
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-sm block">New Client</span>
                                        </div>
                                        {!clientInfo.isAnonymous && clientInfo.name === "" && <Check className="w-5 h-5 text-[var(--color-primary)] ml-auto" />}
                                    </button>
                                </div>

                                {/* Dynamic Content Area (Full Width) */}
                                <div>
                                    {/* Anonymous Warning */}
                                    {clientInfo.isAnonymous && (
                                        <div className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">Warning: Anonymous Booking</p>
                                                <p className="text-xs mt-1 opacity-90">This appointment will not be linked to any client history. You won't be able to track loyalty points or past preferences.</p>
                                            </div>
                                            <Button size="sm" onClick={() => setStep(1)} className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-none">
                                                Continue
                                            </Button>
                                        </div>
                                    )}

                                    {/* New Client Form */}
                                    {!clientInfo.isAnonymous && clientInfo.name === "" && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={clientInfo.name}
                                                        onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none bg-white"
                                                        placeholder="e.g. Marie Dubois"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={clientInfo.phone}
                                                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none bg-white"
                                                        placeholder="06 00 00 00 00"
                                                    />
                                                </div>
                                                <div className="col-span-full flex justify-end">
                                                    <Button
                                                        onClick={() => setStep(1)}
                                                        disabled={!clientInfo.name}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        Continue to Salon Selection
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider with Text */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500 font-bold tracking-wider">Or select existing</span>
                                </div>
                            </div>

                            {/* Inline Search and List */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-shadow"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setVisibleClientsCount(10); // Reset pagination
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {filteredClients.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                                            <p className="text-sm font-medium">No matching clients found</p>
                                            <p className="text-xs mt-1">Try a different search or create a New Client above</p>
                                        </div>
                                    ) : (
                                        <>
                                            {filteredClients.slice(0, visibleClientsCount).map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setClientInfo({ name: c.name, email: c.email || "", phone: c.phone || "", isAnonymous: false });
                                                        setStep(1);
                                                    }}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-primary-light)] rounded-xl border border-gray-100 transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{c.name}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.email || c.phone || "No contact info"}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                                                </button>
                                            ))}

                                            {/* Show More Button */}
                                            {filteredClients.length > visibleClientsCount && (
                                                <button
                                                    onClick={() => setVisibleClientsCount(prev => prev + 10)}
                                                    className="w-full py-3 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-colors border border-transparent hover:border-[var(--color-primary-light)]"
                                                >
                                                    Show more clients ({filteredClients.length - visibleClientsCount} remaining)
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
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
                            {(showModalTrigger ? visibleServices : services).map((service) => {
                                const isSelected = selectedServices.find(s => s.id === service.id);
                                const isFavorite = favoriteServiceIds.includes(service.id);
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                                            } else {
                                                setSelectedServices([...selectedServices, service]);
                                            }
                                        }}
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
                                        <div className="text-3xl mb-4">{service.image || "✂️"}</div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{service.name}</h3>
                                            {isFavorite && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Fav</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.category || "General"}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {service.duration}
                                            </span>
                                            <span className="text-gray-900 font-bold text-lg">€{service.price}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Modal Trigger Card */}
                            {showModalTrigger && (
                                <button
                                    onClick={() => setIsServiceModalOpen(true)}
                                    className="p-6 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 text-purple-700 flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition-all font-bold group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Search className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <span>View all {services.length} services...</span>
                                </button>
                            )}

                            {/* Custom "Other" Service Card */}
                            <div
                                onClick={() => {
                                    const isSelected = selectedServices.find(s => s.id === OTHER_SERVICE_ID);
                                    if (isSelected) {
                                        setSelectedServices(selectedServices.filter(s => s.id !== OTHER_SERVICE_ID));
                                    } else {
                                        setSelectedServices([...selectedServices, { id: OTHER_SERVICE_ID, name: "Custom Service", price: "Pending", duration: "Variable" }]);
                                    }
                                }}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${selectedServices.find(s => s.id === OTHER_SERVICE_ID)
                                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                                    : 'border-dashed border-gray-300 hover:border-orange-300 hover:bg-orange-50/30'
                                    }`}
                            >
                                {selectedServices.find(s => s.id === OTHER_SERVICE_ID) && (
                                    <div className="absolute top-4 right-4 bg-orange-500 text-white rounded-full p-1 animate-in zoom-in">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="text-3xl mb-4">🎨</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Other / Custom</h3>
                                <p className="text-sm text-gray-600 mb-3">Service not listed?</p>
                                <span className="text-orange-600 font-bold text-sm">Describe details below</span>
                            </div>
                        </div>

                        {selectedServices.find(s => s.id === OTHER_SERVICE_ID) && (
                            <div className="mt-6 p-6 bg-orange-50 border border-orange-100 rounded-xl animate-in zoom-in-95 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Custom service details *
                                    </label>
                                    <textarea
                                        value={serviceDetails}
                                        onChange={(e) => setServiceDetails(e.target.value)}
                                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
                                        placeholder="Describe what you want (Style, Length, Color...)"
                                    />
                                </div>

                                {/* Admin Add to Catalog */}
                                {isAdmin && (
                                    <div className="pt-4 border-t border-orange-200">
                                        <p className="text-xs font-bold text-orange-800 mb-3 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Quick Add to Catalog (Admin Only)
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                            <input
                                                placeholder="Service Name"
                                                className="px-3 py-2 text-xs border rounded-lg md:col-span-2"
                                                value={newServiceName}
                                                onChange={e => setNewServiceName(e.target.value)}
                                            />
                                            <input
                                                placeholder="Price (€)"
                                                type="number"
                                                className="px-3 py-2 text-xs border rounded-lg"
                                                value={newServicePrice}
                                                onChange={e => setNewServicePrice(e.target.value)}
                                            />
                                            <input
                                                placeholder="Duration (e.g. 2h)"
                                                className="px-3 py-2 text-xs border rounded-lg"
                                                value={newServiceDuration}
                                                onChange={e => setNewServiceDuration(e.target.value)}
                                            />
                                        </div>
                                        <Button size="sm" variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100" onClick={handleSaveNewService}>
                                            Save Service to Catalog
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Large Selection Modal */}
                        {isServiceModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                        <h3 className="font-bold text-xl">All Services</h3>
                                        <button onClick={() => setIsServiceModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                                    </div>
                                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                autoFocus
                                                placeholder="Search services..."
                                                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                                value={serviceSearch}
                                                onChange={e => setServiceSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {filteredServices.map(service => {
                                            const isSelected = selectedServices.find(s => s.id === service.id);
                                            return (
                                                <div
                                                    key={service.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                                                        } else {
                                                            setSelectedServices([...selectedServices, service]);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'}`}
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900">{service.name}</p>
                                                        <p className="text-xs text-gray-500">{service.duration}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-purple-600">€{service.price}</span>
                                                        {isSelected && <Check className="w-5 h-5 text-purple-600 fill-purple-100" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredServices.length === 0 && (
                                            <div className="col-span-full text-center py-10 text-gray-500">
                                                <p>No services found.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                        <Button onClick={() => setIsServiceModalOpen(false)}>Done ({selectedServices.length} selected)</Button>
                                    </div>
                                </div>
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
                                    <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 text-[var(--color-warning)]">
                                            <div className="bg-orange-100 p-2 rounded-lg">
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
                                    <p className="text-3xl sm:text-4xl font-black">€{selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0)}</p>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full !bg-none bg-white text-[var(--color-primary)] hover:bg-gray-50 font-black uppercase py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-xl border-4 border-white/20 hover:border-white transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
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

export default function BookAppointmentPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>}>
            <BookAppointmentContent />
        </Suspense>
    );
}
