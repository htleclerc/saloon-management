"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
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
    CheckCircle,
    User,
    Scissors
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";

// Mock data
const clients = [
    { id: 1, name: "Marie Dubois", email: "marie@email.com", phone: "+33 6 12 34 56 78" },
    { id: 2, name: "Jean Martin", email: "jean@email.com", phone: "+33 6 23 45 67 89" },
    { id: 3, name: "Sophie Laurent", email: "sophie@email.com", phone: "+33 6 34 56 78 90" },
];

const services = [
    { id: 1, name: "Box Braids", price: 120, duration: "3-4 hours" },
    { id: 2, name: "Cornrows", price: 85, duration: "2-3 hours" },
    { id: 3, name: "Senegalese Twists", price: 110, duration: "3-4 hours" },
    { id: 4, name: "Locs", price: 150, duration: "4-5 hours" },
    { id: 5, name: "Goddess Braids", price: 130, duration: "2-3 hours" },
];

const workers = [
    { id: 1, name: "Orphelia", sharingKey: 60, color: "from-purple-500 to-purple-600" },
    { id: 2, name: "Worker 2", sharingKey: 55, color: "from-pink-500 to-pink-600" },
    { id: 3, name: "Worker 3", sharingKey: 50, color: "from-orange-500 to-orange-600" },
    { id: 4, name: "Worker 4", sharingKey: 50, color: "from-teal-500 to-teal-600" },
];

const products = [
    { id: 1, name: "Hair Extensions Premium", price: 25 },
    { id: 2, name: "Braiding Gel", price: 8 },
    { id: 3, name: "Edge Control", price: 12 },
    { id: 4, name: "Moisturizing Spray", price: 15 },
];

export default function AddIncomePage() {
    const { isWorker, isAdmin, user, getWorkerId } = useAuth();
    const router = useRouter();
    // Client selection mode: 'existing' | 'anonymous' | 'new'
    const [clientMode, setClientMode] = useState<'existing' | 'anonymous' | 'new'>('existing');
    const [selectedClient, setSelectedClient] = useState<number | null>(null);

    // New client form fields
    const [newClientName, setNewClientName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [completeInfoLater, setCompleteInfoLater] = useState(false);

    // Anonymous client note
    const [anonymousNote, setAnonymousNote] = useState("");

    // Multi-service selection
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [isOtherService, setIsOtherService] = useState(false);
    const [otherServiceDescription, setOtherServiceDescription] = useState("");

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("12:00");
    const [baseAmount, setBaseAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [tips, setTips] = useState(0);
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    // Worker sharing state
    const [assignedWorkers, setAssignedWorkers] = useState<{ workerId: number, percentage: number }[]>([]);

    // Set default worker based on exact role
    useEffect(() => {
        const exactRole = user?.role;
        if (exactRole === 'worker') {
            const wId = getWorkerId();
            // In demo/mock mode, we might have string IDs like 'worker_demo_1'
            // We map them to numeric 1 if necessary for the mock data compatibility
            const numericId = wId && !isNaN(Number(wId)) ? Number(wId) : 1;
            setAssignedWorkers([{ workerId: numericId, percentage: 100 }]);
        } else if (exactRole === 'admin' || exactRole === 'owner' || exactRole === 'super_admin') {
            // Default select first worker for admin
            setAssignedWorkers([{ workerId: 1, percentage: 100 }]);
        }
    }, [user?.role, getWorkerId]);

    // Products used state
    const [usedProducts, setUsedProducts] = useState<{ productId: number; quantity: number }[]>([]);

    // Toggle service selection
    const toggleService = (serviceId: number) => {
        setSelectedServices(prev => {
            const newSelection = prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId];

            // Auto-calculate base amount from selected services
            const total = newSelection.reduce((sum, id) => {
                const service = services.find(s => s.id === id);
                return sum + (service?.price || 0);
            }, 0);
            setBaseAmount(total);

            return newSelection;
        });
    };

    // Handle 'Other' service toggle
    const toggleOtherService = () => {
        setIsOtherService(!isOtherService);
        if (isOtherService) {
            setOtherServiceDescription("");
        }
    };

    // Calculations
    const totalProductsCost = usedProducts.reduce((sum: number, p: { productId: number; quantity: number }) => {
        const product = products.find(prod => prod.id === p.productId);
        return sum + (product ? product.price * p.quantity : 0);
    }, 0);
    const subtotal = baseAmount - discount + tips;
    const totalAmount = subtotal + totalProductsCost;

    // Worker share calculations with SALON SHARING KEY applied
    const workerShares = assignedWorkers.map((aw: { workerId: number; percentage: number }) => {
        const worker = workers.find(w => w.id === aw.workerId);
        const incomeShare = (subtotal * aw.percentage) / 100; // Part du revenu
        const workerAmount = (incomeShare * (worker?.sharingKey || 50)) / 100; // Part worker après clé salon
        const salonAmount = incomeShare - workerAmount; // Part salon
        return {
            ...aw,
            worker,
            incomeShare,      // Total de cette part du revenu
            workerAmount,     // Ce que le worker reçoit (avec salon key)
            salonAmount       // Ce qui va au salon
        };
    });
    const totalWorkerAmount = workerShares.reduce((sum: number, ws: any) => sum + ws.workerAmount, 0);
    const totalSalonAmount = workerShares.reduce((sum: number, ws: any) => sum + ws.salonAmount, 0);

    const addWorker = () => {
        const availableWorkers = workers.filter(w => !assignedWorkers.find((aw: { workerId: number }) => aw.workerId === w.id));
        if (availableWorkers.length > 0) {
            const newWorkers = [...assignedWorkers, { workerId: availableWorkers[0].id, percentage: 0 }];
            // Recalculate equal parts
            const equalPart = Number((100 / newWorkers.length).toFixed(2));
            const updatedWorkers = newWorkers.map((aw, idx) => ({
                ...aw,
                percentage: idx === newWorkers.length - 1
                    ? Number((100 - (equalPart * (newWorkers.length - 1))).toFixed(2))
                    : equalPart
            }));
            setAssignedWorkers(updatedWorkers);
        }
    };

    const changeWorker = (oldWorkerId: number, newWorkerId: number) => {
        // Replace worker in the list while keeping the same percentage
        const updatedWorkers = assignedWorkers.map((aw: { workerId: number; percentage: number }) =>
            aw.workerId === oldWorkerId
                ? { ...aw, workerId: newWorkerId }
                : aw
        );
        setAssignedWorkers(updatedWorkers);
    };

    const removeWorker = (workerId: number) => {
        const filtered = assignedWorkers.filter((aw: { workerId: number }) => aw.workerId !== workerId);
        if (filtered.length > 0) {
            // Recalculate equal parts for remaining
            const equalPart = Number((100 / filtered.length).toFixed(2));
            const updatedWorkers = filtered.map((aw, idx) => ({
                ...aw,
                percentage: idx === filtered.length - 1
                    ? Number((100 - (equalPart * (filtered.length - 1))).toFixed(2))
                    : equalPart
            }));
            setAssignedWorkers(updatedWorkers);
        }
    };

    const updateWorkerPercentage = (workerId: number, percentage: number) => {
        const updated = assignedWorkers.map((aw: { workerId: number; percentage: number }) =>
            aw.workerId === workerId ? { ...aw, percentage } : aw
        );
        setAssignedWorkers(updated);
    };

    const addProduct = () => {
        const availableProducts = products.filter(p => !usedProducts.find(up => up.productId === p.id));
        if (availableProducts.length > 0) {
            setUsedProducts([...usedProducts, { productId: availableProducts[0].id, quantity: 1 }]);
        }
    };

    const removeProduct = (productId: number) => {
        setUsedProducts(usedProducts.filter(up => up.productId !== productId));
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={() => router.back()}>
                            <Button variant="outline" size="sm" className="p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900">New Service</h1>
                            <p className="text-sm md:text-base text-gray-500 hidden md:block">Record a new service and split income</p>
                        </div>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                        <Link href="/income" className="flex-1 md:flex-none">
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                                <span className="hidden md:inline">Cancel</span>
                                <span className="md:hidden">Cancel</span>
                            </Button>
                        </Link>
                        <Button variant="primary" size="sm" className="flex-1 md:flex-none">
                            <Save className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline ml-2">Save</span>
                        </Button>
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
                        {/* Left Column - Client & Service */}
                        <div className="space-y-6">
                            {/* Client Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <User className="w-4 h-4" />
                                    Client
                                </label>

                                {/* Client Mode Tabs */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setClientMode('existing')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${clientMode === 'existing'
                                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        Existing Client
                                    </button>
                                    <button
                                        onClick={() => setClientMode('anonymous')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${clientMode === 'anonymous'
                                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        Anonymous
                                    </button>
                                    <button
                                        onClick={() => setClientMode('new')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${clientMode === 'new'
                                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <Plus className="w-3 h-3 inline mr-1" />
                                        New
                                    </button>
                                </div>

                                {/* Existing Client Selection */}
                                {clientMode === 'existing' && (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                                                value={selectedClient || ""}
                                                onChange={(e) => setSelectedClient(Number(e.target.value))}
                                            >
                                                <option value="">Select a client...</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.name} - {client.phone}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Anonymous Client */}
                                {clientMode === 'anonymous' && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-orange-800">
                                            <User className="w-5 h-5" />
                                            <span className="font-medium">Anonymous client</span>
                                        </div>
                                        <p className="text-sm text-orange-700">
                                            The service will be recorded without an associated client. You can complete the information later.
                                        </p>
                                        <div>
                                            <label className="block text-xs text-orange-700 mb-1">Identification note (optional)</label>
                                            <input
                                                type="text"
                                                value={anonymousNote}
                                                onChange={(e) => setAnonymousNote(e.target.value)}
                                                placeholder="e.g. Woman, long hair, referred by Mary..."
                                                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* New Client Form */}
                                {clientMode === 'new' && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <Plus className="w-5 h-5" />
                                                <span className="font-medium">New client</span>
                                            </div>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={completeInfoLater}
                                                    onChange={(e) => setCompleteInfoLater(e.target.checked)}
                                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                />
                                                <span className="text-green-700">Complete later</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs text-green-700 mb-1">
                                                    Name {!completeInfoLater && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newClientName}
                                                    onChange={(e) => setNewClientName(e.target.value)}
                                                    placeholder="Client's full name"
                                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                                    required={!completeInfoLater}
                                                />
                                            </div>

                                            {!completeInfoLater && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs text-green-700 mb-1">Phone</label>
                                                        <input
                                                            type="tel"
                                                            value={newClientPhone}
                                                            onChange={(e) => setNewClientPhone(e.target.value)}
                                                            placeholder="+33 6 XX XX XX XX"
                                                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-green-700 mb-1">Email</label>
                                                        <input
                                                            type="email"
                                                            value={newClientEmail}
                                                            onChange={(e) => setNewClientEmail(e.target.value)}
                                                            placeholder="email@example.com"
                                                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {completeInfoLater && (
                                            <p className="text-xs text-green-600 italic">
                                                The client will be created with minimum information. You can complete their profile from the Clients page.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Service Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Scissors className="w-4 h-4" />
                                    Services performed (multiple selection)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {services.slice(0, 6).map(service => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => toggleService(service.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedServices.includes(service.id)
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-200 hover:border-purple-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{service.name}</p>
                                                    <p className="text-sm text-gray-500">{service.duration}</p>
                                                    <p className="text-lg font-bold text-purple-600 mt-1">€{service.price}</p>
                                                </div>
                                                {selectedServices.includes(service.id) && (
                                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}

                                    {/* Other Service Option */}
                                    <button
                                        type="button"
                                        onClick={toggleOtherService}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${isOtherService
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-orange-300"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">Other</p>
                                                <p className="text-sm text-gray-500">Custom service</p>
                                            </div>
                                            {isOtherService && (
                                                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Other Service Description - Required if selected */}
                                {isOtherService && (
                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                        <label className="block text-sm font-medium text-orange-900 mb-2">
                                            Custom service description *
                                        </label>
                                        <textarea
                                            value={otherServiceDescription}
                                            onChange={(e) => setOtherServiceDescription(e.target.value)}
                                            placeholder="Describe the service performed (mandatory)..."
                                            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                            rows={3}
                                            required
                                        />
                                        {otherServiceDescription.trim() === "" && (
                                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                This field is mandatory
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Selected Services Summary */}
                                {(selectedServices.length > 0 || isOtherService) && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                        <p className="text-sm font-medium text-blue-900 mb-2">Selected services:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedServices.map(serviceId => {
                                                const service = services.find(s => s.id === serviceId);
                                                return service ? (
                                                    <span key={serviceId} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                        {service.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleService(serviceId)}
                                                            className="hover:bg-purple-200 rounded-full p-0.5"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                            {isOtherService && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                                    Other
                                                    <button
                                                        type="button"
                                                        onClick={toggleOtherService}
                                                        className="hover:bg-orange-200 rounded-full p-0.5"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Date, Time, Amount */}
                        <div className="space-y-6">
                            {/* Date & Time */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                <h4 className="font-semibold text-gray-900">Amount</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Base Price (€)</label>
                                        <input
                                            type="number"
                                            value={baseAmount}
                                            onChange={(e) => setBaseAmount(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Discount (€)</label>
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Tips (€)</label>
                                        <input
                                            type="number"
                                            value={tips}
                                            onChange={(e) => setTips(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Worker Sharing Section */}
                <Card className="border-l-4 border-l-pink-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-pink-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Worker Split</h2>
                            <span className="text-sm text-gray-500">Step 2/4</span>
                        </div>
                        {/* Workers CAN add other workers */}
                        <Button variant="outline" size="sm" onClick={addWorker}>
                            <Plus className="w-4 h-4" />
                            Add Worker
                        </Button>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                        <strong>Share Configuration:</strong> {isWorker
                            ? "Define the split with your colleagues. You can modify your own share."
                            : "Define the income percentage for each involved worker."
                        }
                    </div>

                    {/* Share Validation Warning */}
                    {Math.abs(assignedWorkers.reduce((sum, aw) => sum + aw.percentage, 0) - 100) > 0.01 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            <span>Total shares must equal 100% (current: {assignedWorkers.reduce((sum, aw) => sum + aw.percentage, 0)}%)</span>
                        </div>
                    )}

                    {/* Worker Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {workerShares.map(({ workerId, percentage, worker, workerAmount, salonAmount, incomeShare }) => {
                            const ownId = getWorkerId();
                            const isOwnCard = workerId === Number(ownId) || (ownId === 'worker_demo_1' && workerId === 1);

                            // PRIVACY LOGIC:
                            // - ADMIN/OWNER/MANAGER: Sees ALL (shares, amounts, salon keys) ✅
                            // - WORKER: Sees ALL shares (for collaboration) but ONLY own amount ✅

                            // Important: isWorker is hierarchical (true for admin/manager). 
                            // We use !isAdmin to restrict data visibility to those who are NOT admins.
                            const canSeeAmount = isOwnCard || isAdmin;
                            const canSeeSalonKey = isAdmin;

                            // Add a fallback color if worker is not found
                            const cardColor = worker?.color || "from-gray-500 to-gray-600";

                            return (
                                <div key={workerId} className={`relative p-4 rounded-xl shadow-lg bg-gradient-to-br ${cardColor} text-white transition-all transform hover:scale-[1.02]`}>
                                    {/* Remove button - available for all during creation */}
                                    {assignedWorkers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWorker(workerId)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}

                                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                        {/* Worker Avatar - Mobile optimized */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {worker?.name.charAt(0)}
                                        </div>

                                        {/* Worker Selector Dropdown - Full width on mobile */}
                                        <div className="flex-1 min-w-0">
                                            <select
                                                value={workerId}
                                                onChange={(e) => changeWorker(workerId, Number(e.target.value))}
                                                className="w-full bg-white/10 border border-white/30 rounded-lg px-2 sm:px-3 py-2 text-white text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/20 transition truncate"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                    backgroundPosition: 'right 0.5rem center',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundSize: '1.5em 1.5em',
                                                    paddingRight: '2.5rem'
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
                                    </div>

                                    {/* Share Percentage - Mobile optimized */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs opacity-80">Commission share (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={percentage}
                                                onChange={(e) => updateWorkerPercentage(workerId, Number(e.target.value))}
                                                className="w-full pl-3 pr-10 py-2.5 sm:py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-base sm:text-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">%</span>
                                        </div>
                                    </div>

                                    {/* Amount Display - Shows worker's ACTUAL amount (after salon key) */}
                                    {canSeeAmount ? (
                                        <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                                            {/* Admin sees complete breakdown */}
                                            {isAdmin ? (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] sm:text-xs opacity-70">Sharing key</p>
                                                        <p className="text-sm font-bold">{worker?.sharingKey}%</p>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                        <p className="text-[10px] sm:text-xs opacity-80">Worker share</p>
                                                        <p className="text-xl sm:text-2xl font-bold">€{workerAmount.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] sm:text-xs opacity-70">Salon share</p>
                                                        <p className="text-sm opacity-80">€{salonAmount.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                        <p className="text-[10px] sm:text-xs opacity-70">Total split</p>
                                                        <p className="text-xs opacity-60">€{incomeShare.toFixed(2)}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Worker sees only their take-home */
                                                <>
                                                    <p className="text-[10px] sm:text-xs opacity-80">Your income</p>
                                                    <p className="text-2xl sm:text-3xl font-bold">€{workerAmount.toFixed(2)}</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <p className="text-[10px]">Confidential amount</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>



                </Card>

                {/* Additional Information */}
                <Card className="border-l-4 border-l-teal-500">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-teal-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                        <span className="text-sm text-gray-500">Step 3/4</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes and remarks</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about the service, client preferences, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Products Used */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Products used</label>
                                <button onClick={addProduct} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {usedProducts.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No products added</p>
                                ) : (
                                    usedProducts.map((up, idx) => {
                                        const product = products.find(p => p.id === up.productId);
                                        return (
                                            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <select
                                                    value={up.productId}
                                                    onChange={(e) => {
                                                        const newProducts = [...usedProducts];
                                                        newProducts[idx].productId = Number(e.target.value);
                                                        setUsedProducts(newProducts);
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                >
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} - €{p.price}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={up.quantity}
                                                    onChange={(e) => {
                                                        const newProducts = [...usedProducts];
                                                        newProducts[idx].quantity = Number(e.target.value);
                                                        setUsedProducts(newProducts);
                                                    }}
                                                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                                />
                                                <button onClick={() => removeProduct(up.productId)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {totalProductsCost > 0 && (
                                <p className="mt-2 text-sm text-gray-600">Total products: <span className="font-semibold">€{totalProductsCost.toFixed(2)}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: "card", label: "Bank Card", icon: CreditCard },
                                { id: "cash", label: "Cash", icon: Banknote },
                                { id: "mobile", label: "Mobile Pay", icon: Smartphone },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${paymentMethod === method.id
                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                        : "border-gray-200 text-gray-600 hover:border-purple-300"
                                        }`}
                                >
                                    <method.icon className="w-5 h-5" />
                                    <span className="font-medium">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Recap & Validation */}
                <Card className="bg-gradient-to-br from-purple-700 to-purple-900 text-white border-0">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-bold">Recap & Validation</h2>
                        <span className="text-sm opacity-80">Step 4/4</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Details */}
                        <div className="space-y-3">
                            <h4 className="font-semibold opacity-80">Service details</h4>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Client</span>
                                <span className="font-semibold">
                                    {clientMode === 'existing'
                                        ? (clients.find(c => c.id === selectedClient)?.name || "Not selected")
                                        : clientMode === 'anonymous'
                                            ? (anonymousNote ? `Anonymous (${anonymousNote})` : "Anonymous client")
                                            : (newClientName || "New client (to be created)")
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Service(s)</span>
                                <span className="font-semibold text-right">
                                    {selectedServices.length > 0
                                        ? selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')
                                        : '—'
                                    }
                                    {isOtherService && (selectedServices.length > 0 ? ', ' : '') + 'Other'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Date</span>
                                <span className="font-semibold">{date}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Schedule</span>
                                <span className="font-semibold">{startTime} - {endTime}</span>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-3">
                            <h4 className="font-semibold opacity-80">Financial split</h4>
                            <div className="flex justify-between py-2">
                                <span className="opacity-80">Base Price</span>
                                <span className="font-semibold">€{baseAmount.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between py-2">
                                    <span className="opacity-80">Discount</span>
                                    <span className="font-semibold text-red-300">-€{discount.toFixed(2)}</span>
                                </div>
                            )}
                            {tips > 0 && (
                                <div className="flex justify-between py-2">
                                    <span className="opacity-80">Tip</span>
                                    <span className="font-semibold text-green-300">+€{tips.toFixed(2)}</span>
                                </div>
                            )}
                            {totalProductsCost > 0 && (
                                <div className="flex justify-between py-2">
                                    <span className="opacity-80">Products</span>
                                    <span className="font-semibold">€{totalProductsCost.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Detailed Totals (Moved from Step 2) */}
                            <div className="pt-4 mt-2 border-t border-white/40 space-y-3">
                                {isAdmin ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="opacity-80">Total Workers</span>
                                            <span className="font-bold text-xl text-green-300">€{totalWorkerAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="opacity-80">Total Enterprise</span>
                                            <span className="font-bold text-xl text-yellow-300">€{totalSalonAmount.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-80">Your income</span>
                                        <span className="font-bold text-2xl text-green-300">
                                            €{(() => {
                                                const ownId = getWorkerId();
                                                const ownShare = workerShares.find(ws => ws.workerId === Number(ownId) || (ownId === 'worker_demo_1' && ws.workerId === 1));
                                                return ownShare?.workerAmount.toFixed(2) || '0.00';
                                            })()}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total Service</span>
                                    <span className="font-bold text-xl">€{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Action Buttons - Mobile optimized */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/20">
                        <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                            Save as draft
                        </Button>
                        <Button variant="primary" size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                            <CheckCircle className="w-5 h-5" />
                            Validate and save
                        </Button>
                    </div>
                </Card>

                {/* Help Section */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-900">Need help?</h4>
                        <p className="text-sm text-blue-700">Check our guide to understand how to split income between multiple workers.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto border-blue-300 text-blue-700">
                        View guide
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
