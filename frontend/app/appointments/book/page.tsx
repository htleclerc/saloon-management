"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Check, X, Plus, Search, Scissors, Heart, AlertCircle, HelpCircle, ChevronRight } from "lucide-react";

// Local services array removed in favor of ServiceProvider
import { serviceService, salonService, workerService, clientService } from "@/lib/services";
import type { Salon, SalonWorker, Client } from "@/types";

interface DisplayWorker extends SalonWorker {
    rating: number;
    clients: number;
    available: boolean;
    specialty: string;
    avatar: string;
}

import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { BookingStatus } from "@/types";
import { useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { format } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

function BookAppointmentContent() {
    const { t, language } = useTranslation();
    const { user, isClient, isSuperAdmin, isOwner, isManager, isWorker } = useAuth();
    const isAdmin = isSuperAdmin || isOwner || isManager;
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
    // Service & Admin State
    const [services, setServices] = useState<any[]>([]);
    const [salons, setSalons] = useState<Salon[]>([]);
    const [workers, setWorkers] = useState<DisplayWorker[]>([]);

    // Function to load workers and their stats
    const loadWorkers = async (salonId: number) => {
        try {
            const [workersList, statsList] = await Promise.all([
                workerService.getAll(salonId),
                workerService.getStatsBySalon(salonId)
            ]);

            const mergedWorkers: DisplayWorker[] = workersList.map(w => {
                const stat = statsList.find(s => s.workerId === w.id);
                return {
                    ...w,
                    rating: stat?.avgRating || 5.0,
                    clients: stat?.totalClients || 0,
                    available: w.status === 'Active',
                    specialty: w.specialties?.[0] || 'General',
                    avatar: w.avatarUrl || w.name.charAt(0)
                };
            });
            setWorkers(mergedWorkers);
        } catch (error) {
            console.error("Failed to load workers", error);
            setWorkers([]);
        }
    };

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const fetchedSalons = await salonService.getAll();
                setSalons(fetchedSalons);

                // If urlSalonId is present, we might want to load its services/workers immediately
                if (urlSalonId) {
                    loadWorkers(Number(urlSalonId));
                }
            } catch (error) {
                console.error("Failed to load salons", error);
            }
        };
        loadInitialData();
    }, []);

    // Effect to reload services when salon changes
    useEffect(() => {
        if (selectedSalon?.id) {
            const salonId = Number(selectedSalon.id);
            serviceService.getAll(salonId).then(setServices);
            loadWorkers(salonId);
        } else {
            // Reset
            setServices([]);
            setWorkers([]);
        }
    }, [selectedSalon]);

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

    const handleSaveNewService = async () => {
        if (handleReadOnlyClick()) return;
        if (!newServiceName || !newServicePrice) {
            alert("Name and Price are required");
            return;
        }
        try {
            await serviceService.create({
                salonId: selectedSalon?.id || 1,
                name: newServiceName,
                price: Number(newServicePrice),
                duration: parseInt(newServiceDuration) || 60,
                categoryId: undefined,
                description: "Added via Admin Interface",
                isActive: true
            });
            setNewServiceName("");
            setNewServicePrice("");
            setNewServiceDuration("");
            // Reload
            if (selectedSalon?.id) serviceService.getAll(Number(selectedSalon.id)).then(setServices);
        } catch (e) {
            console.error(e);
        }
    };

    // Virtual "Other" Service ID for UI handling
    const OTHER_SERVICE_ID = 9999;

    // Derive favorites from booking history
    const favoriteSalonIds = useMemo(() => {
        return Array.from(new Set(bookings
            .filter(b => b.clientId === (user?.id ? Number(user.id) : 0))
            .map(b => b.salonId)));
    }, [bookings, user]);

    const favoriteServiceIds = useMemo(() => {
        const ids = bookings
            .filter(b => b.clientId === (user?.id ? Number(user.id) : 0))
            .flatMap(b => b.serviceIds);
        return Array.from(new Set(ids));
    }, [bookings, user]);

    const filteredAndSortedSalons = useMemo(() => {
        return salons
            .filter(s => {
                const matchesName = s.name.toLowerCase().includes(salonSearch.toLowerCase());
                // service check might be harder with dynamic services fetching. 
                // We'd need to fetch services for all salons to filter by service name.
                // For now, let's filter by salon name only or rely on pre-fetched services if we fetch all.
                // But we only fetch services for selected salon usually.
                // Let's assume matchesName is primary.
                return matchesName;
            })
            .sort((a, b) => {
                const aFav = favoriteSalonIds.includes(Number(a.id));
                const bFav = favoriteSalonIds.includes(Number(b.id));
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return 0;
            });
    }, [salonSearch, favoriteSalonIds]); // Re-run if search/favorites change

    const [dbClients, setDbClients] = useState<Client[]>([]);

    useEffect(() => {
        if ((isAdmin || isWorker) && selectedSalon?.id) {
            clientService.getAll(Number(selectedSalon.id)).then(setDbClients).catch(console.error);
        } else if (isAdmin || isWorker) {
            // Fallback or load all? Usually by salon.
            // If no salon selected yet, maybe wait?
        }
    }, [isAdmin, isWorker, selectedSalon]);

    // Extract unique clients from bookings and merge with DB clients
    const existingClients = useMemo(() => {
        const clientMap = new Map();

        // 1. Add DB Clients first
        dbClients.forEach(c => {
            clientMap.set(c.id, {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone
            });
        });

        // 2. Add Booking Clients (overriding or adding new ones if not in DB)
        bookings.forEach(b => {
            if (b.clientId && b.clientId > 0 && b.clientName) {
                // Only add if not already present or to enrich?
                // Booking might have ephemeral data, but DB is source of truth.
                // If ID matches, prefer DB data usually, but booking might have specific contact info used at that time.
                // Let's ensure we don't duplicate.
                if (!clientMap.has(b.clientId)) {
                    clientMap.set(b.clientId, {
                        id: typeof b.clientId === 'number' ? b.clientId : 0,
                        name: b.clientName,
                        email: b.notes || "",
                        phone: ""
                    });
                }
            }
        });
        return Array.from(clientMap.values());
    }, [bookings, dbClients]);

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
        if (isAdmin && !selectedSalon && salons.length > 0) {
            setSelectedSalon(salons[0]);
        }
    }, [isAdmin, selectedSalon, salons]);

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
            const salon = salons.find(s => s.id === Number(urlSalonId));
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
                // Try to find client details if available
                const client = existingClients.find(c => c.id === bookingToEdit.clientId);

                setClientInfo({
                    name: bookingToEdit.clientName || "",
                    email: client?.email || "",
                    phone: client?.phone || "",
                    isAnonymous: bookingToEdit.clientId === 0
                });

                const salon = salons.find(s => s.id === Number(bookingToEdit.salonId));
                if (salon) setSelectedSalon(salon);

                const selectedSrvs = services.filter(s => (bookingToEdit.serviceIds || []).includes(s.id));
                setSelectedServices(selectedSrvs);

                const selectedWrks = workers.filter(w => (bookingToEdit.workerIds || []).includes(w.id));
                setSelectedWorkers(selectedWrks);

                setSelectedDate(bookingToEdit.date);
                setSelectedTime(bookingToEdit.time);
                setServiceDetails(bookingToEdit.notes || "");
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
                    salonId: Number(selectedSalon?.id || urlSalonId || 1),
                    clientName: clientInfo.name,
                    serviceIds: selectedServices.map(s => s.id),
                    workerIds: selectedWorkers.map(w => w.id),
                    date: selectedDate,
                    time: selectedTime,
                    duration: totalDuration,
                });
            }
        } else {
            addBooking({
                salonId: Number(selectedSalon?.id || urlSalonId || 1),
                clientId: clientInfo.isAnonymous ? 0 : (user?.id ? Number(user.id) : 0),
                serviceIds: selectedServices.map(s => s.id),
                workerIds: selectedWorkers.map(w => w.id),
                date: selectedDate,
                time: selectedTime,
                duration: totalDuration,
                status: (isClient ? 'Pending' : 'Confirmed') as BookingStatus,
                notes: bookingComment || undefined
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
            // Client email/phone are not stored on booking directly in this schema, assumed handled by backend or separate update
            serviceIds: selectedServices.map(s => s.id),
            notes: serviceDetails, // Mapped custom details to notes
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

    // Helper for locale
    const getLocale = () => {
        switch (language) {
            case 'fr': return fr;
            case 'es': return es;
            default: return enUS;
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
                        {t('booking.backToAppointments')}
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {t('booking.title')} {selectedSalon ? `${t('booking.at')} ${selectedSalon.name}` : ""}
                    </h1>
                    <p className="text-gray-600">{t('booking.subtitle')}</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-4xl mx-auto overflow-hidden">
                        {[
                            { num: 0, label: t('booking.steps.client'), roles: ['super_admin', 'manager', 'worker'] },
                            { num: 1, label: t('booking.steps.salon'), roles: ['client'] }, // Admin skips salon selection
                            { num: 2, label: t('booking.steps.services') },
                            { num: 3, label: t('booking.steps.workers'), roles: ['super_admin', 'manager', 'worker'] },
                            { num: 4, label: t('booking.steps.schedule') },
                            { num: 5, label: t('booking.steps.summary') }
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-primary">{t('booking.clientSelection.title')}</h2>
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
                                            <span className="font-bold text-sm block">{t('booking.clientSelection.anonymous')}</span>
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
                                            <span className="font-bold text-sm block">{t('booking.clientSelection.newClient')}</span>
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
                                                <p className="font-bold text-sm">{t('booking.clientSelection.warningTitle')}</p>
                                                <p className="text-xs mt-1 opacity-90">{t('booking.clientSelection.warningMessage')}</p>
                                            </div>
                                            <Button size="sm" onClick={() => setStep(1)} className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-none">
                                                {t('booking.clientSelection.continue')}
                                            </Button>
                                        </div>
                                    )}

                                    {/* New Client Form */}
                                    {!clientInfo.isAnonymous && clientInfo.name === "" && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">{t('booking.clientSelection.fullName')} <span className="text-red-500">*</span></label>
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
                                                    <label className="text-sm font-bold text-gray-700">{t('booking.clientSelection.phone')}</label>
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
                                                        {t('booking.clientSelection.continue')}
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
                                    <span className="bg-white px-2 text-gray-500 font-bold tracking-wider">{t('booking.clientSelection.orExisting')}</span>
                                </div>
                            </div>

                            {/* Inline Search and List */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t('booking.clientSelection.searchPlaceholder')}
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
                                            <p className="text-sm font-medium">{t('booking.clientSelection.noClientFound')}</p>
                                            <p className="text-xs mt-1">{t('booking.clientSelection.tryDifferent')}</p>
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
                                                    {t('booking.clientSelection.showMore')} ({filteredClients.length - visibleClientsCount} remaining)
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
                {/* Simplified remaining steps for brevity in replacement, but ensuring proper i18n usage */}
                {/* Step 1: Select Salon */}
                {step === 1 && (
                    <Card className="p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('booking.salonSelection.title')}</h2>
                            <div className="relative w-full sm:w-80 md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('booking.salonSelection.searchPlaceholder')}
                                    value={salonSearch}
                                    onChange={(e) => setSalonSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        {filteredAndSortedSalons.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">{t('booking.salonSelection.noSalonsFound')} "{salonSearch}"</p>
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
                                            <p className="text-xs text-gray-500 mt-1">{isFavorite ? t('booking.salonSelection.yourFavorite') : t('booking.salonSelection.clickToSelect')}</p>
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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('booking.serviceSelection.title')}</h2>
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
                                    <span>{t('booking.serviceSelection.viewAll', { count: services.length })}</span>
                                </button>
                            )}

                            {/* Custom "Other" Service Card */}
                            <div
                                onClick={() => {
                                    const isSelected = selectedServices.find(s => s.id === OTHER_SERVICE_ID);
                                    if (isSelected) {
                                        setSelectedServices(selectedServices.filter(s => s.id !== OTHER_SERVICE_ID));
                                    } else {
                                        setSelectedServices([...selectedServices, { id: OTHER_SERVICE_ID, name: t('booking.serviceSelection.customService'), price: t('booking.serviceSelection.pending'), duration: t('booking.serviceSelection.variable') }]);
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
                                <div className="text-3xl mb-4">✨</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('booking.serviceSelection.customService')}</h3>
                                <p className="text-sm text-gray-600 mb-3">Service not listed?</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 3: Select Workers */}
                {step === 3 && (
                    <Card className="p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('booking.workerSelection.title')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {/* Any Professional Option */}
                            <div
                                onClick={() => setSelectedWorkers([])}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${selectedWorkers.length === 0
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg'
                                    : 'border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md'
                                    }`}
                            >
                                {selectedWorkers.length === 0 && (
                                    <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white rounded-full p-1 animate-in zoom-in">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                                    🏢
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900">{t('booking.workerSelection.anyProfessional')}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{t('booking.workerSelection.anyProfessionalDesc')}</p>
                                </div>
                            </div>

                            {workers.map((worker) => {
                                const isSelected = selectedWorkers.find(w => w.id === worker.id);
                                return (
                                    <div
                                        key={worker.id}
                                        onClick={() => worker.available && toggleWorker(worker)}
                                        className={`p-6 rounded-xl border-2 transition-all relative ${isSelected
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg cursor-pointer'
                                            : worker.available
                                                ? 'border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md cursor-pointer'
                                                : 'border-gray-100 opacity-60 cursor-not-allowed bg-gray-50'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white rounded-full p-1 animate-in zoom-in">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <img
                                            src={worker.avatar}
                                            alt={worker.name}
                                            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-white shadow-sm"
                                        />
                                        <div className="text-center">
                                            <h3 className="font-bold text-gray-900">{worker.name}</h3>
                                            <p className="text-xs text-[var(--color-primary)] font-medium mb-2">{worker.specialty}</p>
                                            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    ⭐ {worker.rating}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    👥 {worker.clients} {t('booking.workerSelection.clients')}
                                                </span>
                                            </div>
                                            {!worker.available && (
                                                <div className="mt-3 text-xs bg-red-100 text-red-600 py-1 px-2 rounded-full inline-block font-bold">
                                                    {t('booking.workerSelection.unavailable')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* Step 4: Schedule */}
                {step === 4 && (
                    <Card className="p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('booking.scheduleSelection.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                                    {t('booking.scheduleSelection.selectDate')}
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none bg-gray-50 font-medium"
                                />
                            </div>

                            {/* Time Slots */}
                            <div>
                                <div className="space-y-6">
                                    {/* Morning */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span>🌅</span> {t('booking.scheduleSelection.morning')}
                                        </h3>
                                        <div className="grid grid-cols-4 gap-2">
                                            {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${selectedTime === time
                                                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                                                        : 'bg-white border border-gray-200 hover:border-[var(--color-primary)] text-gray-700'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Afternoon */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span>☀️</span> {t('booking.scheduleSelection.afternoon')}
                                        </h3>
                                        <div className="grid grid-cols-4 gap-2">
                                            {["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"].map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${selectedTime === time
                                                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                                                        : 'bg-white border border-gray-200 hover:border-[var(--color-primary)] text-gray-700'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 5: Summary */}
                {step === 5 && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.summary.title')}</h2>
                        <div className="space-y-6">
                            {/* Recap Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('booking.summary.salon')}</p>
                                    <p className="font-bold text-gray-900">{selectedSalon?.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('booking.summary.client')}</p>
                                    <p className="font-bold text-gray-900">{clientInfo.isAnonymous ? t('booking.clientSelection.anonymous') : clientInfo.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('booking.summary.services')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedServices.map(s => (
                                            <span key={s.id} className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-medium shadow-sm">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('booking.summary.professional')}</p>
                                    <p className="font-bold text-gray-900">
                                        {selectedWorkers.length > 0
                                            ? selectedWorkers.map(w => w.name).join(", ")
                                            : t('booking.summary.any')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('booking.summary.date')}</p>
                                    <p className="font-bold text-gray-900">
                                        {selectedDate && format(new Date(selectedDate), 'dd MMM yyyy', { locale: getLocale() })} {t('booking.at')} {selectedTime}
                                    </p>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="flex items-center justify-between p-6 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary)]/20">
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-primary)]">{t('booking.summary.totalDuration')}</p>
                                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                                        {selectedServices.reduce((acc, s) => {
                                            let mins = 60;
                                            if (s.duration && s.duration.toLowerCase().includes('hour')) {
                                                mins = (parseInt(s.duration) || 1) * 60;
                                            } else if (s.duration) {
                                                mins = parseInt(s.duration) || 60;
                                            }
                                            return acc + mins;
                                        }, 0)} min
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-[var(--color-primary)]">{t('booking.summary.totalPrice')}</p>
                                    <p className="text-3xl font-bold text-[var(--color-primary)]">
                                        €{selectedServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('booking.summary.comments')}</label>
                                <textarea
                                    value={bookingComment}
                                    onChange={(e) => setBookingComment(e.target.value)}
                                    placeholder={t('booking.summary.addComment')}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none min-h-[100px]"
                                />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    <Button
                        variant="secondary"
                        onClick={handleBack}
                        disabled={step === 0 && !isClient}
                        className={step === 0 && !isClient ? "invisible" : ""}
                    >
                        {t('common.back')}
                    </Button>

                    <Button
                        variant="primary"
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={!canProceed()}
                    >
                        {step === 5 ? (isEditMode ? t('booking.summary.update') : t('booking.summary.confirm')) : t('common.continue')}
                        {step !== 5 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main page component wrapped in Suspense
export default function BookAppointmentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <BookAppointmentContent />
        </Suspense>
    );
}
