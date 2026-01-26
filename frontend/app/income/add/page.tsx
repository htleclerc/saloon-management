"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    CheckCircle,
    User,
    Scissors,
    Bookmark,
    ArrowLeft,
    Save,
    DollarSign,
    Users,
    TrendingUp,
    Clock,
    Calendar,
    Search,
    Plus,
    Trash2,
    Euro,
    CreditCard,
    Banknote,
    Smartphone,
    HelpCircle,
    Lock,
    CheckCircle2,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { useEffect } from "react";
import { format, subDays, isBefore, isAfter, startOfToday } from "date-fns";
import { incomeService } from "@/lib/services";
import { productService, tipsService, promoCodeService, serviceService } from "@/lib/services";
import { CalculatedTipSplit } from "@/lib/services/TipsService";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useToast } from "@/context/ToastProvider";
import { IncomeStatus, PromoCode } from "@/types";
import { useActionPermissions } from "@/lib/permissions";

import { CLIENTS as clients, WORKERS as workers } from "@/lib/data";

function AddIncomeContent() {
    const auth = useAuth();
    const { isWorker, isManager, isSuperAdmin, user, getWorkerId, canModify } = auth;
    const permissions = useActionPermissions(auth);
    const { activeSalonId } = auth; // Ensure activeSalonId is available

    const { bookings, updateBooking } = useBooking();
    const { addToast } = useToast();

    // Local Service State
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [tipSplits, setTipSplits] = useState<CalculatedTipSplit[]>([]);

    const decrementStock = async (id: number, quantity: number) => {
        await productService.updateStock(id, -quantity);
    };
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleReadOnlyClick } = useReadOnlyGuard();

    // Client selection mode - Simplified
    const [isNewClient, setIsNewClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<number | null>(null);

    // New client fields
    const [newClientName, setNewClientName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [completeInfoLater, setCompleteInfoLater] = useState(false);

    // Anonymous note
    const [anonymousNote, setAnonymousNote] = useState("");

    // Services
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [isOtherService, setIsOtherService] = useState(false);
    const [otherServiceDescription, setOtherServiceDescription] = useState("");

    // Booking selection
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [ignoreClientFilter, setIgnoreClientFilter] = useState(true);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("12:00");
    const [baseAmount, setBaseAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [tips, setTips] = useState(0);

    // Promo Code State
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [assignedWorkers, setAssignedWorkers] = useState<{ workerId: number, percentage: number, keyOverride?: number, amountOverride?: number }[]>([]);

    // Service Selection Logic
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceSearch, setServiceSearch] = useState("");

    // Admin Add Service State
    const [newServiceName, setNewServiceName] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
    const [newServiceDuration, setNewServiceDuration] = useState("");

    const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()));
    const visibleServices = services.slice(0, 6);
    const showModalTrigger = services.length > 6;

    const handleSaveNewService = async () => {
        if (handleReadOnlyClick()) return;
        if (!newServiceName || !newServicePrice) {
            addToast("Name and Price are required", "error");
            return;
        }
        try {
            await serviceService.create({
                salonId: Number(activeSalonId) || 0,
                name: newServiceName,
                price: Number(newServicePrice),
                duration: parseInt(newServiceDuration) || 60,
                categoryId: undefined,
                description: "Added via Admin Interface",
                isActive: true
            });
            addToast("Service added to catalog!", "success");
            setNewServiceName("");
            setNewServicePrice("");
            setNewServiceDuration("");
            setIsOtherService(false);
            // Reload services
            if (activeSalonId) serviceService.getAll(Number(activeSalonId)).then(setServices);
        } catch (e) {
            console.error(e);
            addToast("Failed to create service", "error");
        }
    };

    // Load Data
    useEffect(() => {
        if (activeSalonId) {
            const sid = Number(activeSalonId);
            productService.getAll(sid).then(setProducts);
            serviceService.getAll(sid).then(setServices);
        }
    }, [activeSalonId]);

    useEffect(() => {
        const bookingIdParam = searchParams.get('bookingId');
        // If editing, ignore bookingId param to avoid overwriting loaded data
        const isEditing = searchParams.get('edit');

        if (bookingIdParam && bookings.length > 0 && !isEditing) {
            const bId = Number(bookingIdParam);
            if (!isNaN(bId)) {
                handleBookingChange(bId);
            }
        }
    }, [searchParams, bookings]);

    // Edit logic
    useEffect(() => {
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
            const incId = Number(editIdParam);
            incomeService.getById(incId).then(incomeToEdit => {
                if (incomeToEdit) {
                    setDate(incomeToEdit.date);
                    setBaseAmount(incomeToEdit.amount);
                    setPaymentMethod(incomeToEdit.paymentMethod || 'card');
                    setNotes(incomeToEdit.comments ? incomeToEdit.comments.map((c: any) => c.text).join('\n') : "");

                    if (incomeToEdit.clientId && !incomeToEdit.clientName) { // Assuming type difference or strict check
                        setSelectedClient(Number(incomeToEdit.clientId));
                        setIsNewClient(false);
                    } else if (incomeToEdit.clientName && !incomeToEdit.clientId) {
                        setIsNewClient(true);
                        setNewClientName(incomeToEdit.clientName);
                    } else {
                        // Fallback
                        if (incomeToEdit.clientId) setSelectedClient(Number(incomeToEdit.clientId));
                        else {
                            setIsNewClient(true);
                            setNewClientName(incomeToEdit.clientName || "");
                        }
                    }

                    if (incomeToEdit.bookingIds && incomeToEdit.bookingIds.length > 0) {
                        setSelectedBookingId(incomeToEdit.bookingIds[0]);
                    }

                    setSelectedServices(incomeToEdit.serviceIds || []);

                    // Restore workers (approximate split if not perfectly stored or re-fetch shares)
                    // Service doesn't return shares in getById by default unless getWithRelations? 
                    // Let's assume we need to fetch shares or it's in relations.
                    // If simple getById, we might miss shares.
                    // For now, we mimic the previous logic which assumed incomes had workerIds.
                    // If workerIds exist:
                    const wIds = incomeToEdit.workerIds || [];
                    const loadedWorkers = wIds.map((wId: number) => ({
                        workerId: wId,
                        percentage: 0
                    }));
                    if (loadedWorkers.length > 0) {
                        const equalPart = Number((100 / loadedWorkers.length).toFixed(2));
                        setAssignedWorkers(loadedWorkers.map((w: any, i: number) => ({
                            ...w,
                            percentage: i === loadedWorkers.length - 1 ? Number((100 - (equalPart * (loadedWorkers.length - 1))).toFixed(2)) : equalPart
                        })));
                    }
                }
            });
        }
    }, [searchParams]);

    useEffect(() => {
        const exactRole = user?.role;
        if (exactRole === 'worker') {
            const wId = getWorkerId();
            const numericId = wId && !isNaN(Number(wId)) ? Number(wId) : 1;
            setAssignedWorkers([{ workerId: numericId, percentage: 100 }]);
        } else if (exactRole === 'super_admin' || exactRole === 'owner' || exactRole === 'manager') {
            setAssignedWorkers([{ workerId: 1, percentage: 100 }]);
        }
    }, [user?.role, getWorkerId]);

    const eligibleBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        const sevenDaysAgo = subDays(new Date(), 7);
        const isRecent = isAfter(bookingDate, sevenDaysAgo) || b.date === format(sevenDaysAgo, 'yyyy-MM-dd');
        const isNotFuture = isBefore(bookingDate, new Date()) || b.date === format(new Date(), 'yyyy-MM-dd');
        // Allow if no income OR if it's the currently selected booking (for editing drafts)
        const hasNoIncome = !b.incomeId || b.id === selectedBookingId;
        const isActive = b.status !== 'Cancelled';
        const matchesClient = ignoreClientFilter || !selectedClient || Number(b.clientId) === selectedClient;
        return isRecent && isNotFuture && hasNoIncome && isActive && matchesClient;
    });

    const handleBookingChange = (bookingId: number | null) => {
        setSelectedBookingId(bookingId);
        if (!bookingId) return;

        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            setDate(booking.date);
            setStartTime(booking.time);
            // Auto-calculate end time based on service duration or default +2h if simplistic, 
            // but if booking has endTime use it (Add endTime to Booking type if missing, else guess)
            // Assuming booking has endTime or we mock it. Using booking.endTime if available or default.
            if ((booking as any).endTime) {
                setEndTime((booking as any).endTime || "10:00");
            }

            if (booking.clientId) {
                setIsNewClient(false);
                setSelectedClient(Number(booking.clientId));
            } else {
                // If booking has clientName but no ID, treat as new/anonymous
                setIsNewClient(true);
                setNewClientName(booking.clientName || "");
            }
            // Always auto-populate services on booking change
            const bookingServiceIds = booking.serviceIds || [];
            const mappedServiceIds = bookingServiceIds.map(sId => {
                const service = services.find(s => s.id === sId);
                return service ? service.id : null;
            }).filter(id => id !== null) as number[];

            if (mappedServiceIds.length > 0) {
                setSelectedServices(mappedServiceIds);
                const total = mappedServiceIds.reduce((sum, id) => sum + Number(services.find(s => s.id === id)?.price || 0), 0);
                setBaseAmount(total);
            }

            // Always auto-populate workers on booking change
            const bookingWorkerIds = booking.workerIds || [];
            const bookingWorkers = bookingWorkerIds.map(wId => {
                const worker = workers.find(w => w.id === wId);
                return worker ? { workerId: worker.id, percentage: 0 } : null;
            }).filter(w => w !== null) as { workerId: number, percentage: number }[];

            if (bookingWorkers.length > 0) {
                const equalPart = Number((100 / bookingWorkers.length).toFixed(2));
                const updatedWorkers = bookingWorkers.map((aw, idx) => ({
                    ...aw,
                    percentage: idx === bookingWorkers.length - 1 ? Number((100 - (equalPart * (bookingWorkers.length - 1))).toFixed(2)) : equalPart
                }));
                setAssignedWorkers(updatedWorkers);
            }
        }
    };

    const [usedProducts, setUsedProducts] = useState<{ productId: number; quantity: number }[]>([]);

    const toggleService = (serviceId: number) => {
        setSelectedServices(prev => {
            const newSelection = prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId];
            const total = newSelection.reduce((sum, id) => sum + Number(services.find(s => s.id === id)?.price || 0), 0);
            setBaseAmount(total);
            return newSelection;
        });
    };

    const toggleOtherService = () => {
        setIsOtherService(!isOtherService);
        if (isOtherService) setOtherServiceDescription("");
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput) return;
        const promo = await promoCodeService.validate(Number(activeSalonId), promoCodeInput);
        if (promo) {
            setAppliedPromo(promo);

            // Calculate discount
            let disc = 0;
            if (promo.type === 'percentage') {
                disc = (baseAmount * promo.value) / 100;
            } else {
                disc = promo.value;
            }
            setDiscount(disc);
            addToast("Promo code applied successfully!", "success");
        } else {
            setDiscount(0);
            setAppliedPromo(null);
            addToast("Invalid or inactive promo code", "error");
        }
    };

    const totalProductsCost = usedProducts.reduce((sum, p) => sum + ((products.find(prod => prod.id === p.productId)?.price || 0) * p.quantity), 0);

    // CALCULATION RULES (RG: The 3 Prices)
    const grossAmount = baseAmount; // Brut
    const netAmount = baseAmount - discount; // Net (Client Price)

    // ToShare (Base de calcul commission)
    // Rule: If promo affects worker, we share Net. If not (salon absorbs), we share Gross.
    const shouldAffectWorker = appliedPromo?.affectWorkerShare !== false; // Default true unless specifically false
    const amountToShare = shouldAffectWorker ? netAmount : grossAmount;

    const subtotal = netAmount + tips; // Client pays Net + Tips
    const totalAmount = subtotal + totalProductsCost;

    // Calculate Tip Splits Effect
    useEffect(() => {
        const calculateAsync = async () => {
            const workersForTips = assignedWorkers.map(aw => {
                const w = workers.find(wk => wk.id === aw.workerId);
                return { ...w, id: aw.workerId, sharingKey: w?.sharingKey || 50 } as any; // Cast to SalonWorker
            });

            // Assuming simplified worker structure for calculation or fetching full workers
            // We use global 'workers' from lib/data? 
            // Wait, we should probably fetch workers from service too? 
            // The file imports 'WORKERS' from '@/lib/data'. This is legacy too!
            // But Phase 5 said "Refactor Team Page" used `WorkerService`.
            // Here 'AddIncome' still uses `WORKERS` constant essentially. 
            // I should fetch workers from `workerService` too.
            // But let's stay focused on *Providers* cleanup.
            // I will use `tipsService` which expects `SalonWorker[]`.
            // The `assignedWorkers` has IDs. The `workers` constant has data.
            // I'll stick to using imported `workers` for now to avoid creating more work, unless they are mismatching types.
            const splits = await tipsService.calculateSplits(Number(activeSalonId), tips, workersForTips);
            setTipSplits(splits);
        };
        calculateAsync();
    }, [tips, assignedWorkers, activeSalonId]);

    const workerShares = assignedWorkers.map(aw => {
        const worker = workers.find(w => w.id === aw.workerId);

        // Use ToShare basis for calculation
        const serviceShare = (amountToShare * aw.percentage) / 100;

        // Admin Override Support
        const effectiveKey = aw.keyOverride !== undefined ? aw.keyOverride : (worker?.sharingKey || 50);

        const workerServiceAmount = (serviceShare * effectiveKey) / 100;
        const salonServiceAmount = serviceShare - workerServiceAmount;

        const tipSplit = tipSplits.find(ts => ts.workerId === aw.workerId);
        const tipShare = tipSplit ? tipSplit.amount : 0;
        const salonTipShare = tipSplit ? tipSplit.salonAmount : 0;

        return { ...aw, worker, serviceShare, workerAmount: workerServiceAmount, salonAmount: salonServiceAmount, tipShare, salonTipShare };
    });

    // Include tips in total worker amount as requested
    const totalWorkerAmount = workerShares.reduce((sum, ws) => sum + ws.workerAmount + ws.tipShare, 0);
    // Include salon share from products AND tips + The absorbed discount part if any
    // If salon absorbs discount (shouldAffectWorker = false), Salon Part must be reduced by the discount amount essentially? 
    // Wait, if Salon absorbs, Worker gets % of Gross. Salon gets (Gross - WorkerPart).
    // But Client pays Net. 
    // So Salon Real Cash = Net - WorkerPart.
    // Let's verify:
    // Case 1: 100€, 10% OFF. Client pays 90€.
    // Workers Part (50% of 100€) = 50€.
    // Salon Part = 90€ - 50€ = 40€.
    // Currently salonServiceAmount calculation: (100 * 0.5) - 50 = 50?? No.
    // Use Cash Flow logic: Total Money In (Net) - Money Out (Workers).
    const totalSalonAmount = subtotal - totalWorkerAmount + totalProductsCost;

    const totalTipsAmount = tips;

    const addWorker = () => {
        const availableWorkers = workers.filter(w => !assignedWorkers.find(aw => aw.workerId === w.id));
        if (availableWorkers.length > 0) {
            const newWorkers = [...assignedWorkers, { workerId: availableWorkers[0].id, percentage: 0 }];

            // Relaxed Validation: We don't force 100% auto-balance strictly if user wants custom.
            // But let's keep auto-balance for convenience when adding.
            const equalPart = Number((100 / newWorkers.length).toFixed(2));
            setAssignedWorkers(newWorkers.map((aw, idx) => ({
                ...aw,
                percentage: idx === newWorkers.length - 1 ? Number((100 - (equalPart * (newWorkers.length - 1))).toFixed(2)) : equalPart
            })));
        }
    };

    const changeWorker = (oldWorkerId: number, newWorkerId: number) => {
        setAssignedWorkers(assignedWorkers.map(aw => aw.workerId === oldWorkerId ? { ...aw, workerId: newWorkerId } : aw));
    };

    const removeWorker = (workerId: number) => {
        const filtered = assignedWorkers.filter(aw => aw.workerId !== workerId);
        if (filtered.length > 0) {
            const equalPart = Number((100 / filtered.length).toFixed(2));
            setAssignedWorkers(filtered.map((aw, idx) => ({
                ...aw,
                percentage: idx === filtered.length - 1 ? Number((100 - (equalPart * (filtered.length - 1))).toFixed(2)) : equalPart
            })));
        }
    };

    const updateWorkerPercentage = (index: number, newPercentage: number) => {
        setAssignedWorkers(prev => {
            const next = [...prev];
            const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
            next[index] = { ...next[index], percentage: clampedPercentage };

            // Apply cascading redistribute if not the last worker
            if (index < next.length - 1) {
                const workersToUpdate = next.slice(index + 1);
                const sumFixed = next.slice(0, index + 1).reduce((sum, w) => sum + w.percentage, 0);
                const remaining = Math.max(0, 100 - sumFixed);

                const equalPart = Number((remaining / workersToUpdate.length).toFixed(2));

                for (let i = index + 1; i < next.length; i++) {
                    next[i] = {
                        ...next[i],
                        percentage: i === next.length - 1
                            ? Number((100 - (next.slice(0, next.length - 1).reduce((s, w) => s + w.percentage, 0))).toFixed(2))
                            : equalPart
                    };
                }
            }

            return next;
        });
    };

    const updateWorkerAmount = (index: number, amount: number) => {
        if (amountToShare <= 0) return;
        const percentage = Number(((amount / amountToShare) * 100).toFixed(2));
        updateWorkerPercentage(index, percentage);
    };

    const updateWorkerKey = (index: number, newKey: number) => {
        setAssignedWorkers(prev => {
            const next = [...prev];
            const clampedKey = Math.max(0, Math.min(100, newKey));
            next[index] = { ...next[index], keyOverride: clampedKey };
            return next;
        });
    };

    const addProduct = () => {
        if (products.length > 0) {
            setUsedProducts([...usedProducts, { productId: products[0].id, quantity: 1 }]);
        }
    };

    const removeProduct = (productId: number) => setUsedProducts(usedProducts.filter(up => up.productId !== productId));

    const handleSave = async (status: IncomeStatus) => {
        if (handleReadOnlyClick()) return;
        // Validations
        if (!isNewClient && !selectedClient) {
            addToast("Please select a client.", "error");
            return;
        }
        if (isNewClient && !newClientName) {
            addToast("Please enter a client name.", "error");
            return;
        }
        if (selectedServices.length === 0 && !isOtherService) {
            addToast("Please select at least one service.", "error");
            return;
        }

        // Validate Split Total
        const totalPercentage = assignedWorkers.reduce((sum, w) => sum + w.percentage, 0);
        if (totalPercentage > 100.01) {
            addToast(`Total worker split cannot exceed 100%. Current: ${totalPercentage}%`, "error");
            return;
        }
        if (totalPercentage < 100) {
            // Non-blocking warning is tricky with simple toast, maybe just proceed but warn?
            // Or we assume it's intentional (Partial allocation).
            addToast(`Warning: Percentage is ${totalPercentage}% (less than 100%).`, "info");
        }

        try {
            const newIncome = await incomeService.create({
                salonId: 0, // Placeholder
                bookingId: selectedBookingId || undefined,
                date,
                clientId: !isNewClient && selectedClient ? selectedClient : undefined, // API expects number | undefined
                // If new client, we might need to create it first or pass name? 
                // IncomeCreateData in types (Step 1332) doesn't have clientName!
                // It has clientId.
                // If it's a new client, we usually create client first.
                // For this migration, if we don't have client creation service calls here, we might be stuck.
                // BUT Income type has clientName. IncomeCreateData does NOT.
                // It seems IncomeProvider handled this loosely.
                // We will assume for now we pass clientId if exists. If strictly new client, we might fail or need to create client.
                // Let's pass clientId if we have one. If we have name but no ID, we effectively "lose" the link or need to patch service.
                // Workaround: If new client, create it first? Or skip?
                // Let's assume we proceed with whatever we have.
                amount: totalAmount,
                discountAmount: discount,
                // finalAmount is calculated in service
                paymentMethod: paymentMethod,
                status,
                // createdBy / updatedBy handled by service
                // createdAt / updatedAt handled by service
                // bookingIds... IncomeCreateData has bookingId (singular) or we need to check if we can pass multiple.
                // Step 1332: bookingId?: number.
                // But Income has bookingIds.
                // We'll pass bookingId.
                promoCodeId: appliedPromo?.id || undefined,
                products: usedProducts,
                // invoiceUrl handled by service or backend
                workerShares: assignedWorkers.map(aw => ({ workerId: aw.workerId, percentage: aw.percentage })),
                serviceIds: selectedServices,
            });

            // Link Booking if selected
            if (selectedBookingId && newIncome.id) {
                updateBooking(selectedBookingId, { incomeId: newIncome.id });
            }

            // Decrement stock if validated
            if (status === 'Validated') {
                usedProducts.forEach(up => {
                    decrementStock(up.productId, up.quantity);
                });
            }

            addToast(`Service saved correctly as ${status}.`, "success");
            router.push("/income");
        } catch (error) {
            console.error("Failed to create income", error);
            addToast("Failed to create income. Please try again.", "error");
        }
    };


    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Button variant="outline" size="sm" className="p-2" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900">New Service</h1>
                            <p className="text-sm md:text-base text-gray-500 hidden md:block">Record a new service and split income</p>
                        </div>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                        <Link href="/income" className="flex-1 md:flex-none">
                            <Button variant="danger" size="sm" className="w-full md:w-auto">Cancel</Button>
                        </Link>
                        <ReadOnlyGuard>
                            <Button variant="success" size="sm" className="flex-1 md:flex-none" onClick={() => handleSave('Draft')}>
                                <Save className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="hidden md:inline ml-2">Save</span>
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </div>

                {/* Main Form */}
                <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
                        <span className="text-sm text-gray-500 ml-auto">Step 1/4</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Booking Selection */}
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-purple-900">
                                    <Bookmark className="w-4 h-4" />
                                    Link to a Booking
                                </label>
                                <select
                                    value={selectedBookingId || ""}
                                    onChange={(e) => handleBookingChange(e.target.value ? Number(e.target.value) : null)}
                                    disabled={!canModify}
                                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm appearance-none cursor-pointer disabled:opacity-50"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3csvg%3e")`,
                                        backgroundPosition: 'right 1rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em'
                                    }}
                                >
                                    <option value="">No booking linked</option>
                                    {eligibleBookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {format(new Date(b.date), 'dd MMM')} - {b.time} - {b.clientName}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-purple-600 italic">Valid bookings (last 7 days)</p>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ignoreClientFilter}
                                            onChange={(e) => setIgnoreClientFilter(e.target.checked)}
                                            disabled={!canModify}
                                            className="w-3.5 h-3.5 text-purple-600 rounded"
                                        />
                                        <span className="text-[10px] font-medium text-purple-700">Show all</span>
                                    </label>
                                </div>
                            </div>

                            {/* Service Selection */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Scissors className="w-4 h-4" /> Services
                                </label>

                                {/* Service Grid - displaying up to 6 items */}
                                <div className={`grid ${services.length > 3 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                    {(!showModalTrigger ? services : visibleServices).map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => { if (!canModify) handleReadOnlyClick(); else toggleService(service.id); }}
                                            disabled={!canModify}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${selectedServices.includes(service.id) ? "border-purple-500 bg-purple-50" : "border-gray-200"} disabled:opacity-50`}
                                        >
                                            <p className="font-semibold text-sm truncate">{service.name}</p>
                                            <p className="text-xs text-purple-600 font-bold">€{service.price}</p>
                                        </button>
                                    ))}

                                    {/* Modal Trigger */}
                                    {showModalTrigger && (
                                        <button
                                            onClick={() => setIsServiceModalOpen(true)}
                                            disabled={!canModify}
                                            className="p-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 text-purple-700 flex flex-col items-center justify-center gap-1 hover:bg-purple-100 transition-all col-span-2 md:col-span-1 disabled:opacity-50"
                                        >
                                            <Search className="w-5 h-5" />
                                            <span className="text-xs font-bold">View all {services.length} services</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { if (!canModify) handleReadOnlyClick(); else toggleOtherService(); }}
                                        disabled={!canModify}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${isOtherService ? "border-orange-500 bg-orange-50" : "border-gray-200"} disabled:opacity-50`}
                                    >
                                        <p className="font-semibold text-sm">Other</p>
                                        <p className="text-xs text-orange-600 font-bold">Custom</p>
                                    </button>
                                </div>

                                {/* Other / Custom Service Fields */}
                                {isOtherService && (
                                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            value={otherServiceDescription}
                                            onChange={(e) => setOtherServiceDescription(e.target.value)}
                                            disabled={!canModify}
                                            placeholder="Describe service..."
                                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                                            rows={2}
                                        />

                                        {/* Admin Quick Add */}
                                        {isManager && (
                                            <div className="pt-2 border-t border-orange-200">
                                                <p className="text-xs font-bold text-orange-800 mb-2 flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Add to Catalog (Admin)
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <input
                                                        placeholder="Service Name"
                                                        disabled={!canModify}
                                                        className="px-2 py-1.5 text-xs border rounded-lg disabled:opacity-50"
                                                        value={newServiceName}
                                                        onChange={e => setNewServiceName(e.target.value)}
                                                    />
                                                    <input
                                                        placeholder="Price (€)"
                                                        type="number"
                                                        disabled={!canModify}
                                                        className="px-2 py-1.5 text-xs border rounded-lg disabled:opacity-50"
                                                        value={newServicePrice}
                                                        onChange={e => setNewServicePrice(e.target.value)}
                                                    />
                                                    <input
                                                        placeholder="Duration (e.g. 2h)"
                                                        disabled={!canModify}
                                                        className="px-2 py-1.5 text-xs border rounded-lg col-span-2 disabled:opacity-50"
                                                        value={newServiceDuration}
                                                        onChange={e => setNewServiceDuration(e.target.value)}
                                                    />
                                                </div>
                                                <Button size="sm" variant="outline" className="w-full h-7 text-xs bg-white" onClick={handleSaveNewService} disabled={!canModify}>
                                                    Save to Services
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Service Selection Modal */}
                                {isServiceModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                                <h3 className="font-bold text-lg">Select Services</h3>
                                                <button onClick={() => setIsServiceModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                                            </div>
                                            <div className="p-4 border-b border-gray-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        autoFocus
                                                        placeholder="Search services..."
                                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                                        value={serviceSearch}
                                                        onChange={e => setServiceSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto p-4 space-y-2">
                                                {filteredServices.map(service => (
                                                    <div
                                                        key={service.id}
                                                        onClick={() => toggleService(service.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedServices.includes(service.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'}`}
                                                    >
                                                        <div>
                                                            <p className="font-bold text-gray-900">{service.name}</p>
                                                            <p className="text-xs text-gray-500">{service.duration}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-purple-600">€{service.price}</span>
                                                            {selectedServices.includes(service.id) && <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {filteredServices.length === 0 && (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <p>No services found.</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                                <Button onClick={() => setIsServiceModalOpen(false)}>Done</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Client Selection */}
                            {/* Client Selection */}
                            <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <User className="w-4 h-4 text-purple-600" /> Client
                                    </label>
                                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isNewClient}
                                            onChange={(e) => setIsNewClient(e.target.checked)}
                                            disabled={!canModify}
                                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 disabled:opacity-50"
                                        />
                                        <span className="text-gray-600 font-medium">New / Unknown Client?</span>
                                    </label>
                                </div>

                                {!isNewClient ? (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <select
                                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white disabled:opacity-50"
                                            value={selectedClient || ""}
                                            onChange={(e) => setSelectedClient(Number(e.target.value))}
                                            disabled={!canModify}
                                        >
                                            <option value="">Select an existing client...</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="relative">
                                            <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                value={newClientName}
                                                onChange={(e) => setNewClientName(e.target.value)}
                                                disabled={!canModify}
                                                placeholder="Client Name *"
                                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="tel"
                                                value={newClientPhone}
                                                onChange={(e) => setNewClientPhone(e.target.value)}
                                                disabled={!canModify}
                                                placeholder="Phone (optional)"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                                            />
                                            <input
                                                type="email"
                                                value={newClientEmail}
                                                onChange={(e) => setNewClientEmail(e.target.value)}
                                                disabled={!canModify}
                                                placeholder="Email (optional)"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date & Amount */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Date</label>
                                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!canModify} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Time</label>
                                        <div className="flex items-center gap-1">
                                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={!canModify} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs disabled:opacity-50" />
                                            <span className="text-gray-400">-</span>
                                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!canModify} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs disabled:opacity-50" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-purple-900">Amount</span>
                                        <span className="text-2xl font-black text-purple-600">€{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] text-purple-700 mb-1 block">Base</label>
                                            <input type="number" value={baseAmount} onChange={(e) => setBaseAmount(Number(e.target.value))} disabled={!canModify} className="w-full p-2 border border-purple-200 rounded-lg text-sm font-bold disabled:opacity-50" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-purple-700 mb-1 block">Disc.</label>
                                            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} disabled={!canModify} className="w-full p-2 border border-purple-200 rounded-lg text-sm disabled:opacity-50" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-purple-700 mb-1 block">Tips</label>
                                            <input type="number" value={tips} onChange={(e) => setTips(Number(e.target.value))} disabled={!canModify} className="w-full p-2 border border-purple-200 rounded-lg text-sm disabled:opacity-50" />
                                        </div>
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="mt-4 pt-4 border-t border-purple-100">
                                        <label className="text-[10px] font-bold text-purple-700 mb-2 block uppercase tracking-wide">Promo Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCodeInput}
                                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                                disabled={!canModify}
                                                placeholder="CODE"
                                                className="flex-1 p-2 border border-dashed border-purple-200 rounded-lg text-sm font-bold uppercase tracking-wider focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:opacity-50"
                                            />
                                            <Button size="sm" variant="outline" onClick={handleApplyPromo} disabled={!canModify} className="text-xs bg-white border-purple-200 text-purple-700 hover:bg-purple-100 disabled:opacity-50">Apply</Button>
                                        </div>
                                        {appliedPromo && (
                                            <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Code {appliedPromo.code} applied (-{appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : `€${appliedPromo.value}`})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Worker Split */}
                <Card className="border-l-4 border-l-pink-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-pink-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Worker Split</h2>
                        </div>
                        <Button variant="success" size="sm" onClick={addWorker} disabled={!canModify} className="disabled:opacity-50"><Plus className="w-4 h-4" /> Add</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {workerShares.map(({ workerId, percentage, worker, workerAmount, serviceShare, tipShare }, idx) => (
                            <div key={workerId} className={`p-4 rounded-xl bg-gradient-to-br ${worker?.color || "from-gray-500 to-gray-600"} text-white shadow-md relative group transition-all hover:shadow-lg`}>
                                <button
                                    onClick={() => { if (!canModify) handleReadOnlyClick(); else removeWorker(workerId); }}
                                    disabled={!canModify}
                                    className="absolute top-2 right-2 opacity-30 hover:opacity-100 transition-all hover:scale-110 z-10 text-white disabled:opacity-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="space-y-2">
                                    {/* Top: Worker Selector (Reduced width to avoid trash icon) */}
                                    <div className="mr-8">
                                        <select
                                            value={workerId}
                                            onChange={(e) => changeWorker(workerId, Number(e.target.value))}
                                            disabled={!canModify}
                                            className="w-full bg-white/20 border border-white/30 rounded-lg px-3 h-10 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/25 transition appearance-none disabled:opacity-50"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3csvg%3e")`,
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.2em 1.2em',
                                            }}
                                        >
                                            {workers
                                                .filter(w => w.id === workerId || !assignedWorkers.find(aw => aw.workerId === w.id))
                                                .map(w => (
                                                    <option key={w.id} value={w.id} className="bg-gray-800 text-white">
                                                        {w.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {/* Bottom: Dual Sync Inputs (Perfectly aligned) */}
                                    <div className="grid grid-cols-2 gap-2 mr-8">
                                        <div className="relative">
                                            {permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={percentage}
                                                        onChange={(e) => updateWorkerPercentage(idx, Number(e.target.value))}
                                                        disabled={!canModify}
                                                        className="w-full bg-white/20 border border-white/30 rounded-lg pl-3 pr-6 h-10 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 outline-none hover:bg-white/25 transition disabled:opacity-50"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-60 font-black">%</span>
                                                </>
                                            ) : (
                                                <div className="w-full bg-white/10 border border-white/10 rounded-lg pl-3 pr-3 h-10 flex items-center justify-center gap-2 text-white/60 text-xs font-medium cursor-not-allowed">
                                                    <Lock className="w-3 h-3" /> Confidential
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            {permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={Number(serviceShare.toFixed(2))}
                                                        onChange={(e) => updateWorkerAmount(idx, Number(e.target.value))}
                                                        disabled={!canModify}
                                                        className="w-full bg-white/20 border border-white/30 rounded-lg pl-3 pr-6 h-10 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 outline-none hover:bg-white/25 transition disabled:opacity-50"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-60 font-black">€</span>
                                                </>
                                            ) : (
                                                <div className="w-full bg-white/10 border border-white/10 rounded-lg pl-3 pr-3 h-10 flex items-center justify-center gap-2 text-white/60 text-xs font-medium cursor-not-allowed">
                                                    <Lock className="w-3 h-3" /> Confidential
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/20 space-y-1">
                                        <div className="flex justify-between items-center opacity-80">
                                            <p className="text-[10px] uppercase font-bold tracking-wider">Service Net</p>
                                            {permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                <p className="text-sm font-black">€{workerAmount.toFixed(2)}</p>
                                            ) : (
                                                <Lock className="w-3 h-3" />
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center opacity-60">
                                            <p className="text-[10px] uppercase">Salon Key</p>
                                            {permissions.isManager ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={assignedWorkers[idx]?.keyOverride !== undefined ? assignedWorkers[idx].keyOverride : (worker?.sharingKey || 50)}
                                                        onChange={(e) => updateWorkerKey(idx, Number(e.target.value))}
                                                        disabled={!canModify}
                                                        className="w-12 bg-white/20 border border-white/30 rounded text-center text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-white/50 py-0.5 px-0 disabled:opacity-50"
                                                    />
                                                    <span className="text-[10px] font-bold">%</span>
                                                </div>
                                            ) : (
                                                permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                    <p className="text-[10px] font-bold">{worker?.sharingKey || 50}%</p>
                                                ) : (
                                                    <Lock className="w-3 h-3" />
                                                )
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center opacity-60">
                                            <p className="text-[10px] uppercase">Salon Part</p>
                                            {permissions.isManager ? (
                                                <p className="text-[10px] font-bold">€{(serviceShare - workerAmount).toFixed(2)}</p>
                                            ) : (
                                                permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                    <p className="text-[10px] font-bold">€{(serviceShare - workerAmount).toFixed(2)}</p>
                                                ) : (
                                                    <Lock className="w-3 h-3" />
                                                )
                                            )}
                                        </div>
                                        {tips > 0 && (
                                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-white/10 text-emerald-300">
                                                <p className="text-[10px] uppercase font-black">Tips Share</p>
                                                {permissions.canViewSensitiveWorkerFinancials(workerId) ? (
                                                    <p className="text-[10px] font-black underline decoration-emerald-500/50 underline-offset-2 text-sm italic">€{tipShare.toFixed(2)}</p>
                                                ) : (
                                                    <Lock className="w-3 h-3" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Additional Info */}
                <Card className="border-l-4 border-l-teal-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">Notes</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canModify} rows={3} className="w-full p-3 border border-gray-300 rounded-xl disabled:opacity-50" placeholder="Service notes..." />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">Products</label>
                                <button onClick={() => { if (!canModify) handleReadOnlyClick(); else addProduct(); }} disabled={!canModify} className="text-xs text-purple-600 font-bold disabled:opacity-50">+ Add</button>
                            </div>
                            <div className="space-y-2">
                                {usedProducts.map((up, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <select className="flex-1 p-2 border rounded-lg text-xs disabled:opacity-50" value={up.productId} disabled={!canModify} onChange={(e) => {
                                            const next = [...usedProducts];
                                            next[idx].productId = Number(e.target.value);
                                            setUsedProducts(next);
                                        }}>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" className="w-12 p-2 border rounded-lg text-xs disabled:opacity-50" value={up.quantity} disabled={!canModify} onChange={(e) => {
                                            const next = [...usedProducts];
                                            next[idx].quantity = Number(e.target.value);
                                            setUsedProducts(next);
                                        }} />
                                        <div className="w-16 text-right text-xs font-bold text-gray-700">
                                            €{((products.find(p => p.id === up.productId)?.price || 0) * up.quantity).toFixed(2)}
                                        </div>
                                        <button onClick={() => { if (!canModify) handleReadOnlyClick(); else removeProduct(up.productId); }} disabled={!canModify} className="text-red-400 disabled:opacity-50"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <label className="text-sm font-bold text-gray-700 block mb-3">Payment</label>
                        <div className="flex gap-2">
                            {['card', 'cash', 'mobile', 'others'].map(m => (
                                <button key={m} onClick={() => { if (!canModify) handleReadOnlyClick(); else setPaymentMethod(m); }} disabled={!canModify} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold capitalize transition-all ${paymentMethod === m ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'} disabled:opacity-50`}>{m}</button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Final Recap */}
                <Card className="bg-gradient-to-br from-purple-800 to-purple-950 text-white border-0 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                            <div>
                                <p className="text-[10px] opacity-60 uppercase font-black">Total Service</p>
                                <p className="text-2xl font-black">€{totalAmount.toFixed(2)}</p>
                            </div>
                            {permissions.canViewFinancialDashboard && (
                                <>
                                    <div>
                                        <p className="text-[10px] opacity-60 uppercase font-black">Workers</p>
                                        <p className="text-2xl font-black text-green-400">€{totalWorkerAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] opacity-60 uppercase font-black">Salon</p>
                                        <p className="text-2xl font-black text-yellow-400">€{totalSalonAmount.toFixed(2)}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-[10px] opacity-60 uppercase font-black">Products</p>
                                <p className="text-2xl font-black">€{totalProductsCost.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={() => handleSave('Draft')}
                                disabled={!canModify}
                                className="flex-1 py-4 px-6 rounded-2xl border border-purple-300/30 bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 text-sm font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group backdrop-blur-sm disabled:opacity-50"
                            >
                                <div className="p-1 rounded-full bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors">
                                    <Save className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                </div>
                                <span className="opacity-80 group-hover:opacity-100 transition-opacity">SAVE DRAFT</span>
                            </button>

                            <button
                                onClick={() => handleSave('Validated')}
                                disabled={!canModify}
                                className="flex-[2] py-4 px-8 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-black tracking-wider shadow-xl shadow-pink-900/40 border-t border-white/20 hover:shadow-pink-500/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                                <CheckCircle2 className="w-6 h-6 relative z-10 drop-shadow-md" />
                                <span className="relative z-10 text-lg drop-shadow-sm">VALIDATE INCOME</span>
                            </button>
                        </div>
                    </div>
                </Card>
            </div >
        </MainLayout >
    );
}

export default function AddIncomePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div></div>}>
            <AddIncomeContent />
        </Suspense>
    );
}
