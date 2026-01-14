"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
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
import Link from "next/link";

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

export default function AddRevenuePage() {
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

    const [selectedService, setSelectedService] = useState<number | null>(1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("12:00");
    const [baseAmount, setBaseAmount] = useState(120);
    const [discount, setDiscount] = useState(0);
    const [tips, setTips] = useState(0);
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");

    // Worker sharing state
    const [assignedWorkers, setAssignedWorkers] = useState([
        { workerId: 1, percentage: 60 },
    ]);

    // Products used state
    const [usedProducts, setUsedProducts] = useState<{ productId: number; quantity: number }[]>([]);

    // Calculations
    const selectedServiceData = services.find(s => s.id === selectedService);
    const totalProductsCost = usedProducts.reduce((sum, p) => {
        const product = products.find(prod => prod.id === p.productId);
        return sum + (product ? product.price * p.quantity : 0);
    }, 0);
    const subtotal = baseAmount - discount + tips;
    const totalAmount = subtotal + totalProductsCost;

    // Worker share calculations
    const workerShares = assignedWorkers.map(aw => {
        const worker = workers.find(w => w.id === aw.workerId);
        const share = (subtotal * aw.percentage) / 100;
        return { ...aw, worker, share };
    });
    const totalWorkerShare = workerShares.reduce((sum, ws) => sum + ws.share, 0);
    const businessShare = subtotal - totalWorkerShare;

    const addWorker = () => {
        const availableWorkers = workers.filter(w => !assignedWorkers.find(aw => aw.workerId === w.id));
        if (availableWorkers.length > 0) {
            setAssignedWorkers([...assignedWorkers, { workerId: availableWorkers[0].id, percentage: 0 }]);
        }
    };

    const removeWorker = (workerId: number) => {
        setAssignedWorkers(assignedWorkers.filter(aw => aw.workerId !== workerId));
    };

    const updateWorkerPercentage = (workerId: number, percentage: number) => {
        setAssignedWorkers(assignedWorkers.map(aw =>
            aw.workerId === workerId ? { ...aw, percentage } : aw
        ));
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
                        <Link href="/revenus">
                            <Button variant="outline" size="sm" className="p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Nouvelle prestation</h1>
                            <p className="text-sm md:text-base text-gray-500 hidden md:block">Enregistrer une nouvelle prestation et répartir les revenus</p>
                        </div>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                        <Link href="/revenus" className="flex-1 md:flex-none">
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                                <span className="hidden md:inline">Annuler</span>
                                <span className="md:hidden">Annuler</span>
                            </Button>
                        </Link>
                        <Button variant="primary" size="sm" className="flex-1 md:flex-none">
                            <Save className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline ml-2">Enregistrer</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Aujourd'hui"
                        value="12"
                        subtitle="prestations"
                        icon={Calendar}
                        gradient="bg-gradient-to-br from-purple-600 to-purple-700"
                    />
                    <StatCard
                        title="Revenus du jour"
                        value="€1,850"
                        subtitle="+15% vs hier"
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-green-500 to-green-600"
                    />
                    <StatCard
                        title="En attente"
                        value="3"
                        subtitle="à valider"
                        icon={Clock}
                        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                    />
                    <StatCard
                        title="Clients actifs"
                        value="8"
                        subtitle="aujourd'hui"
                        icon={Users}
                        gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                    />
                </div>

                {/* Main Form */}
                <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Détails de la prestation</h2>
                        <span className="text-sm text-gray-500 ml-auto">Étape 1/4</span>
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
                                        Client existant
                                    </button>
                                    <button
                                        onClick={() => setClientMode('anonymous')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${clientMode === 'anonymous'
                                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        Anonyme
                                    </button>
                                    <button
                                        onClick={() => setClientMode('new')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${clientMode === 'new'
                                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <Plus className="w-3 h-3 inline mr-1" />
                                        Nouveau
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
                                                <option value="">Sélectionner un client...</option>
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
                                            <span className="font-medium">Client anonyme</span>
                                        </div>
                                        <p className="text-sm text-orange-700">
                                            La prestation sera enregistrée sans client associé. Vous pourrez compléter les informations plus tard.
                                        </p>
                                        <div>
                                            <label className="block text-xs text-orange-700 mb-1">Note d'identification (optionnel)</label>
                                            <input
                                                type="text"
                                                value={anonymousNote}
                                                onChange={(e) => setAnonymousNote(e.target.value)}
                                                placeholder="Ex: Femme, cheveux longs, référée par Marie..."
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
                                                <span className="font-medium">Nouveau client</span>
                                            </div>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={completeInfoLater}
                                                    onChange={(e) => setCompleteInfoLater(e.target.checked)}
                                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                />
                                                <span className="text-green-700">Compléter plus tard</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs text-green-700 mb-1">
                                                    Nom {!completeInfoLater && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newClientName}
                                                    onChange={(e) => setNewClientName(e.target.value)}
                                                    placeholder="Nom complet du client"
                                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                                    required={!completeInfoLater}
                                                />
                                            </div>

                                            {!completeInfoLater && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs text-green-700 mb-1">Téléphone</label>
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
                                                            placeholder="email@exemple.com"
                                                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {completeInfoLater && (
                                            <p className="text-xs text-green-600 italic">
                                                Le client sera créé avec un minimum d'informations. Vous pourrez compléter son profil depuis la page Clients.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Service Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Scissors className="w-4 h-4" />
                                    Service effectué
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {services.slice(0, 4).map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => {
                                                setSelectedService(service.id);
                                                setBaseAmount(service.price);
                                            }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedService === service.id
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-200 hover:border-purple-300"
                                                }`}
                                        >
                                            <p className="font-semibold text-gray-900">{service.name}</p>
                                            <p className="text-sm text-gray-500">{service.duration}</p>
                                            <p className="text-lg font-bold text-purple-600 mt-1">€{service.price}</p>
                                        </button>
                                    ))}
                                </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Début</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fin</label>
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
                                <h4 className="font-semibold text-gray-900">Montant</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Prix de base (€)</label>
                                        <input
                                            type="number"
                                            value={baseAmount}
                                            onChange={(e) => setBaseAmount(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Réduction (€)</label>
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Pourboire (€)</label>
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
                            <h2 className="text-xl font-bold text-gray-900">Répartition entre travailleurs</h2>
                            <span className="text-sm text-gray-500">Étape 2/4</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={addWorker}>
                            <Plus className="w-4 h-4" />
                            Ajouter un travailleur
                        </Button>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                        <strong>Configuration des parts:</strong> Définissez le pourcentage de revenus pour chaque travailleur impliqué.
                    </div>

                    {/* Worker Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {workerShares.map(({ workerId, percentage, worker, share }) => (
                            <div key={workerId} className={`relative p-4 rounded-xl bg-gradient-to-br ${worker?.color} text-white`}>
                                {assignedWorkers.length > 1 && (
                                    <button
                                        onClick={() => removeWorker(workerId)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                        {worker?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{worker?.name}</p>
                                        <p className="text-xs opacity-80">Clé: {worker?.sharingKey}%</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs opacity-80">Part attribuée (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={percentage}
                                        onChange={(e) => updateWorkerPercentage(workerId, Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/20">
                                    <p className="text-xs opacity-80">Montant</p>
                                    <p className="text-2xl font-bold">€{share.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Share Summary */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-500">Total réparti aux travailleurs</p>
                            <p className="text-xl font-bold text-gray-900">€{totalWorkerShare.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Part de l'entreprise</p>
                            <p className="text-xl font-bold text-green-600">€{businessShare.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>

                {/* Additional Information */}
                <Card className="border-l-4 border-l-teal-500">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-teal-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Informations complémentaires</h2>
                        <span className="text-sm text-gray-500">Étape 3/4</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes et remarques</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajouter des notes sur la prestation, les préférences du client, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Products Used */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Produits utilisés</label>
                                <button onClick={addProduct} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Ajouter
                                </button>
                            </div>
                            <div className="space-y-2">
                                {usedProducts.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Aucun produit ajouté</p>
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
                                <p className="mt-2 text-sm text-gray-600">Total produits: <span className="font-semibold">€{totalProductsCost.toFixed(2)}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Mode de paiement</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: "card", label: "Carte bancaire", icon: CreditCard },
                                { id: "cash", label: "Espèces", icon: Banknote },
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
                        <h2 className="text-xl font-bold">Récapitulatif et validation</h2>
                        <span className="text-sm opacity-80">Étape 4/4</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Details */}
                        <div className="space-y-3">
                            <h4 className="font-semibold opacity-80">Détails de la prestation</h4>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Client</span>
                                <span className="font-semibold">
                                    {clientMode === 'existing'
                                        ? (clients.find(c => c.id === selectedClient)?.name || "Non sélectionné")
                                        : clientMode === 'anonymous'
                                            ? (anonymousNote ? `Anonyme (${anonymousNote})` : "Client anonyme")
                                            : (newClientName || "Nouveau client (à créer)")
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Service</span>
                                <span className="font-semibold">{selectedServiceData?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Date</span>
                                <span className="font-semibold">{date}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Horaire</span>
                                <span className="font-semibold">{startTime} - {endTime}</span>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-3">
                            <h4 className="font-semibold opacity-80">Répartition financière</h4>
                            <div className="flex justify-between py-2 border-b border-white/20">
                                <span className="opacity-80">Prix de base</span>
                                <span className="font-semibold">€{baseAmount.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between py-2 border-b border-white/20">
                                    <span className="opacity-80">Réduction</span>
                                    <span className="font-semibold text-red-300">-€{discount.toFixed(2)}</span>
                                </div>
                            )}
                            {tips > 0 && (
                                <div className="flex justify-between py-2 border-b border-white/20">
                                    <span className="opacity-80">Pourboire</span>
                                    <span className="font-semibold text-green-300">+€{tips.toFixed(2)}</span>
                                </div>
                            )}
                            {totalProductsCost > 0 && (
                                <div className="flex justify-between py-2 border-b border-white/20">
                                    <span className="opacity-80">Produits</span>
                                    <span className="font-semibold">€{totalProductsCost.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-sm opacity-80 mb-1">Total Prestation</p>
                            <p className="text-3xl font-bold">€{subtotal.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-sm opacity-80 mb-1">Part Travailleurs</p>
                            <p className="text-3xl font-bold">€{totalWorkerShare.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-sm opacity-80 mb-1">Part Entreprise</p>
                            <p className="text-3xl font-bold">€{businessShare.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/20">
                        <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                            Enregistrer comme brouillon
                        </Button>
                        <Button variant="primary" size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                            <CheckCircle className="w-5 h-5" />
                            Valider et enregistrer
                        </Button>
                    </div>
                </Card>

                {/* Help Section */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-900">Besoin d'aide ?</h4>
                        <p className="text-sm text-blue-700">Consultez notre guide pour comprendre comment répartir les revenus entre plusieurs travailleurs.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto border-blue-300 text-blue-700">
                        Voir le guide
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
