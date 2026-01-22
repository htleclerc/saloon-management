'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Scissors,
    Sparkles,
    Heart,
    Users,
    CheckCircle2,
    Plus,
    X,
    Mail,
    Building2,
    MapPin,
    Phone,
    Globe,
    Clock,
    Package,
    Upload,
    Download,
    PartyPopper,
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useOnboarding } from '@/context/OnboardingProvider';
import OnboardingLayout from '@/components/layout/OnboardingLayout';
import OnboardingProgressBar from '@/components/onboarding/OnboardingProgressBar';
import CSVImportModal from '@/components/onboarding/CSVImportModal';
import {
    getServiceTemplates,
    getProductTemplates,
    getServicesCSVTemplate,
    getProductsCSVTemplate,
    getClientsCSVTemplate,
} from '@/lib/onboarding/templates';
import {
    getExpenseCategoryTemplates,
    downloadExpenseCategoriesCSV,
} from '@/lib/onboarding/expenseCategoryTemplates';
import { validateServiceRow, validateProductRow, validateClientRow } from '@/lib/utils/csvParser';
import type { Service, Product, Client, SalonDetails, ExpenseCategory } from '@/types';

const salonTypes = [
    { id: 'braids', label: 'Braids & Locs', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'hair', label: 'Salon de coiffure', icon: Scissors, color: 'from-pink-500 to-rose-500' },
    { id: 'nails', label: "Institut d'ongles", icon: Sparkles, color: 'from-rose-500 to-orange-500' },
    { id: 'barber', label: 'Barbier', icon: Scissors, color: 'from-blue-500 to-indigo-500' },
    { id: 'beauty', label: 'Institut de beauté', icon: Heart, color: 'from-teal-500 to-emerald-500' },
    { id: 'spa', label: 'Spa & Wellness', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
];

export default function EnhancedSetupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, updateUser } = useAuth();
    const {
        config,
        currentStep,
        goToStep,
        nextStep,
        previousStep,
        setSalonType,
        setSalonDetails,
        setServices,
        addService,
        removeService,
        setProducts,
        addProduct,
        removeProduct,
        setExpenseCategories,
        addExpenseCategory,
        removeExpenseCategory,
        setClients,
        addWorker,
        completeOnboarding,
        canProceedToNext,
    } = useOnboarding();

    // Force step from URL parameter if provided (only once on mount)
    const hasProcessedUrlStep = useRef(false);
    useEffect(() => {
        if (hasProcessedUrlStep.current) return;

        const stepParam = searchParams.get('step');
        if (stepParam) {
            const step = parseInt(stepParam, 10);
            if (!isNaN(step) && step >= 1 && step <= 8 && step !== currentStep) {
                hasProcessedUrlStep.current = true;
                goToStep(step);
            }
        }
    }, [searchParams, currentStep, goToStep]);

    // Step 2: Salon Details state
    const [salonForm, setSalonForm] = useState<Partial<SalonDetails>>({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        openingHours: [],
    });

    // Step 3: Services state
    const [showServiceImport, setShowServiceImport] = useState(false);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
    const [newServiceDuration, setNewServiceDuration] = useState("");

    // Step 4: Products state
    const [showProductImport, setShowProductImport] = useState(false);
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductStock, setNewProductStock] = useState("");

    // Step 5: Expense Categories state
    const [showExpenseCategoryImport, setShowExpenseCategoryImport] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");

    // Step 6: Clients state
    const [showClientImport, setShowClientImport] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");


    // Step 7: Team state  
    const [newWorkerName, setNewWorkerName] = useState("");
    const [newWorkerEmail, setNewWorkerEmail] = useState("");

    const handleSalonTypeSelect = (typeId: string) => {
        console.log('🎯 Selecting salon type:', typeId);
        setSalonType(typeId);

        // Auto-load service templates
        const serviceTemplates = getServiceTemplates(typeId);
        console.log('📋 Services loaded:', serviceTemplates.length);
        setServices(serviceTemplates);

        // Auto-load product templates
        const productTemplates = getProductTemplates(typeId);
        console.log('📦 Products loaded:', productTemplates.length);
        setProducts(productTemplates);

        // Auto-load expense category templates
        const categoryTemplates = getExpenseCategoryTemplates(typeId);
        console.log('💰 Categories loaded:', categoryTemplates.length);
        setExpenseCategories(categoryTemplates);

        console.log('✅ All templates loaded, checking canProceed...');
    };

    const handleSalonDetailsNext = () => {
        if (salonForm.name && salonForm.address && salonForm.phone && salonForm.email && salonForm.timezone) {
            setSalonDetails({
                ...salonForm,
                openingHours: salonForm.openingHours || []
            } as SalonDetails);
            nextStep();
        }
    };

    const handleServiceImport = (importedServices: Service[]) => {
        setServices([...config.services, ...importedServices]);
        setShowServiceImport(false);
    };

    const handleProductImport = (importedProducts: Product[]) => {
        setProducts([...config.products, ...importedProducts]);
        setShowProductImport(false);
    };

    const handleClientImport = (importedClients: Client[]) => {
        setClients([...config.clients, ...importedClients]);
        setShowClientImport(false);
    };

    const handleAddWorker = () => {
        if (newWorkerName && newWorkerEmail) {
            addWorker({
                name: newWorkerName,
                email: newWorkerEmail,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newWorkerName}`,
                status: 'Active',
                sharingKey: 40,
                color: '#8B5CF6',
            });
            setNewWorkerName("");
            setNewWorkerEmail("");
        }
    };

    const handleComplete = () => {
        completeOnboarding();

        // Create user account
        const savedName = localStorage.getItem("signup_name") || salonForm.name || "New Owner";
        const savedEmail = localStorage.getItem("signup_email") || salonForm.email || "owner@salon.com";

        updateUser({ onboardingCompleted: true });

        localStorage.removeItem("signup_name");
        localStorage.removeItem("signup_email");

        router.push("/");
    };

    const stepLabels = [
        "Type",
        "Détails",
        "Services",
        "Produits",
        "Catégories",
        "Clients",
        "Équipe",
        "Révision",
    ];

    // Calculate completed steps for navigation
    const completedSteps = [1, 2, 3, 4, 5, 6, 7, 8].filter(step => {
        if (step >= currentStep) return false;
        // Use isStepComplete from context via canProceedToNext
        try {
            return config.currentStep > step; // Previous steps are completed
        } catch {
            return false;
        }
    });

    return (
        <OnboardingLayout>
            {/* Progress Bar */}
            <div className="mb-8">
                <OnboardingProgressBar
                    currentStep={currentStep}
                    totalSteps={8}
                    stepLabels={stepLabels}
                    onStepClick={goToStep}
                    completedSteps={completedSteps}
                />
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Step Content */}
                <div className="p-8 min-h-[500px]">
                    {/* Step 1: Salon Type */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Quel type de salon gérez-vous ?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Sélectionnez le type qui correspond le mieux à votre activité
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {salonTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = config.salonType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleSalonTypeSelect(type.id)}
                                            className={`relative p-6 rounded-2xl border-2 transition-all ${isSelected
                                                ? "border-[#8B5CF6] bg-purple-50 shadow-lg scale-[1.02]"
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="w-5 h-5 text-[#8B5CF6]" />
                                                </div>
                                            )}
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto mb-3`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 text-center">
                                                {type.label}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Salon Details */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Informations de votre salon
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Ces informations apparaîtront sur vos documents et réservations
                            </p>
                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nom du salon *
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={salonForm.name}
                                            onChange={(e) =>
                                                setSalonForm({ ...salonForm, name: e.target.value })
                                            }
                                            placeholder="Mon Salon de Coiffure"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Adresse *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={salonForm.address}
                                            onChange={(e) =>
                                                setSalonForm({ ...salonForm, address: e.target.value })
                                            }
                                            placeholder="123 Rue de la Beauté, Paris 75001"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Téléphone *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={salonForm.phone}
                                                onChange={(e) =>
                                                    setSalonForm({ ...salonForm, phone: e.target.value })
                                                }
                                                placeholder="+33 1 23 45 67 89"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={salonForm.email}
                                                onChange={(e) =>
                                                    setSalonForm({ ...salonForm, email: e.target.value })
                                                }
                                                placeholder="contact@monsalon.fr"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Site web (optionnel)
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="url"
                                            value={salonForm.website}
                                            onChange={(e) =>
                                                setSalonForm({ ...salonForm, website: e.target.value })
                                            }
                                            placeholder="https://monsalon.fr"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Services */}
                    {currentStep === 3 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Services proposés
                                    </h2>
                                    <p className="text-gray-600">
                                        Ajoutez et gérez vos services
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const csv = getServicesCSVTemplate();
                                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = 'services.csv';
                                            link.click();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger CSV
                                    </button>
                                    <button
                                        onClick={() => setShowServiceImport(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Importer CSV
                                    </button>
                                </div>
                            </div>

                            {/* Services List */}
                            {config.services.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                                        {config.services.map(service => (
                                            <div
                                                key={service.id}
                                                className="flex items-start gap-3 p-4 border border-purple-200 bg-purple-50 rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                        {service.name}
                                                        {service.category === 'Personnalisé' && (
                                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-purple-600">
                                                        {service.price}€ • {service.duration} min
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeService(service.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                    title="Supprimer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Scissors className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm text-blue-900">
                                                {config.services.length} service(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucun service configuré</p>
                                    <p className="text-sm">Ajoutez vos services ci-dessous</p>
                                </div>
                            )}

                            {/* Add Custom Service Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Ajouter un service personnalisé
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom du service"
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Prix (€)"
                                        value={newServicePrice}
                                        onChange={(e) => setNewServicePrice(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Durée (min)"
                                        value={newServiceDuration}
                                        onChange={(e) => setNewServiceDuration(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newServiceName && newServicePrice && newServiceDuration) {
                                                addService({
                                                    id: Date.now(),
                                                    name: newServiceName,
                                                    price: parseFloat(newServicePrice),
                                                    duration: newServiceDuration,
                                                    category: 'Personnalisé',
                                                    icon: 'Sparkles',
                                                });
                                                setNewServiceName('');
                                                setNewServicePrice('');
                                                setNewServiceDuration('');
                                            }
                                        }}
                                        disabled={!newServiceName || !newServicePrice || !newServiceDuration}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${newServiceName && newServicePrice && newServiceDuration
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Products */}
                    {currentStep === 4 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Produits et inventaire
                                    </h2>
                                    <p className="text-gray-600">
                                        Ajoutez et gérez vos produits
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const csv = getProductsCSVTemplate();
                                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = 'produits.csv';
                                            link.click();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger CSV
                                    </button>
                                    <button
                                        onClick={() => setShowProductImport(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Importer CSV
                                    </button>
                                </div>
                            </div>

                            {/* Products List */}
                            {config.products.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                                        {config.products.map(product => (
                                            <div
                                                key={product.id}
                                                className="flex items-start gap-3 p-4 border border-pink-200 bg-pink-50 rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                        {product.name}
                                                        {product.category === 'Personnalisé' && (
                                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-pink-600">
                                                        {product.price}€ • Stock: {product.stock}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                    title="Supprimer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm text-blue-900">
                                                {config.products.length} produit(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucun produit configuré</p>
                                    <p className="text-sm">Ajoutez vos produits ci-dessous</p>
                                </div>
                            )}

                            {/* Add Custom Product Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Ajouter un produit personnalisé
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom du produit"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Prix (€)"
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock initial"
                                        value={newProductStock}
                                        onChange={(e) => setNewProductStock(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newProductName && newProductPrice && newProductStock) {
                                                addProduct({
                                                    id: Date.now(),
                                                    name: newProductName,
                                                    price: parseFloat(newProductPrice),
                                                    stock: parseInt(newProductStock),
                                                    category: 'Personnalisé',
                                                });
                                                setNewProductName('');
                                                setNewProductPrice('');
                                                setNewProductStock('');
                                            }
                                        }}
                                        disabled={!newProductName || !newProductPrice || !newProductStock}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${newProductName && newProductPrice && newProductStock
                                            ? 'bg-pink-600 text-white hover:bg-pink-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Expense Categories */}
                    {currentStep === 5 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Catégories de dépenses
                                    </h2>
                                    <p className="text-gray-600">
                                        Organisez vos dépenses avec des catégories personnalisées
                                    </p>
                                </div>
                                <button
                                    onClick={() => downloadExpenseCategoriesCSV(config.expenseCategories, 'categories_depenses.csv')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger CSV
                                </button>
                            </div>

                            {config.expenseCategories.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {getExpenseCategoryTemplates(config.salonType || 'beauty').map(category => {
                                            const isSelected = config.expenseCategories.some(c => c.id === category.id);
                                            return (
                                                <label
                                                    key={category.id}
                                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                addExpenseCategory(category);
                                                            } else {
                                                                removeExpenseCategory(category.id);
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            <span className="font-medium text-sm text-gray-900 truncate">
                                                                {category.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm text-blue-900">
                                                {config.expenseCategories.length} catégorie(s) sélectionnée(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-12">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucune catégorie configurée</p>
                                    <p className="text-sm">Vous pouvez sauter cette étape</p>
                                </div>
                            )}

                            {/* Add Custom Category Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Ajouter une catégorie personnalisée
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom de la catégorie"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="color"
                                                value={newCategoryColor}
                                                onChange={(e) => setNewCategoryColor(e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (newCategoryName) {
                                                    addExpenseCategory({
                                                        id: Date.now(),
                                                        name: newCategoryName,
                                                        color: newCategoryColor,
                                                    });
                                                    setNewCategoryName('');
                                                    setNewCategoryColor('#8B5CF6');
                                                }
                                            }}
                                            disabled={!newCategoryName}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${newCategoryName
                                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            + Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowExpenseCategoryImport(true)}
                                className="w-full mt-6 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
                            >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                                    Importer depuis CSV
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Importez vos catégories depuis un fichier CSV</p>
                            </button>
                        </div>
                    )}

                    {/* Step 6: Clients */}
                    {currentStep === 6 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Base de clients
                                    </h2>
                                    <p className="text-gray-600">
                                        Optionnel - Importez ou ajoutez vos clients
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowClientImport(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="font-medium">Importer CSV</span>
                                </button>
                            </div>

                            {/* Clients List */}
                            {config.clients.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1 mb-6">
                                    {config.clients.map((client, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    <p className="text-sm text-gray-500">{client.email}</p>
                                                    {client.phone && (
                                                        <p className="text-xs text-gray-400">{client.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newClients = config.clients.filter((_, i) => i !== index);
                                                    setClients(newClients);
                                                }}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                title="Supprimer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 mb-6">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucun client importé</p>
                                    <p className="text-sm">Ajoutez manuellement ou importez via CSV</p>
                                </div>
                            )}

                            {/* Add Client Form */}
                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Ajouter un client manuellement
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom complet"
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={newClientEmail}
                                        onChange={(e) => setNewClientEmail(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Téléphone (optionnel)"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newClientName && newClientEmail) {
                                                const newClient: Client = {
                                                    id: Date.now(),
                                                    name: newClientName,
                                                    email: newClientEmail,
                                                    phone: newClientPhone || '',
                                                };
                                                setClients([...config.clients, newClient]);
                                                setNewClientName('');
                                                setNewClientEmail('');
                                                setNewClientPhone('');
                                            }
                                        }}
                                        disabled={!newClientName || !newClientEmail}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${newClientName && newClientEmail
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </div>

                            {config.clients.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-blue-900">
                                            {config.clients.length} client(s) ajouté(s)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 7: Team */}
                    {currentStep === 7 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Votre équipe</h2>
                            <p className="text-gray-600 mb-6">
                                Ajoutez les membres de votre équipe (optionnel)
                            </p>

                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newWorkerName}
                                        onChange={(e) => setNewWorkerName(e.target.value)}
                                        placeholder="Nom"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={newWorkerEmail}
                                        onChange={(e) => setNewWorkerEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                    />
                                </div>
                                <button
                                    onClick={handleAddWorker}
                                    disabled={!newWorkerName || !newWorkerEmail}
                                    className="px-4 py-3 bg-[#8B5CF6] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7C3AED] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {config.workers.length > 0 ? (
                                <div className="space-y-3">
                                    {config.workers.map((worker, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white font-bold">
                                                    {worker.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{worker.name}</p>
                                                    <p className="text-sm text-gray-500">{worker.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucun membre ajouté</p>
                                    <p className="text-sm">Vous pourrez en ajouter plus tard</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 8: Review & Completion */}
                    {currentStep === 8 && (
                        <div>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Configuration terminée !
                                </h2>
                                <p className="text-gray-600">
                                    Votre salon est prêt à être utilisé
                                </p>
                            </div>

                            <div className="space-y-4 max-w-2xl mx-auto">
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-[#8B5CF6]" />
                                        <span className="font-bold text-gray-900">Type de salon</span>
                                    </div>
                                    <p className="text-[#8B5CF6] font-medium ml-8">
                                        {salonTypes.find((t) => t.id === config.salonType)?.label || "N/A"}
                                    </p>
                                </div>

                                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-pink-500" />
                                        <span className="font-bold text-gray-900">
                                            Services ({config.services.length})
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Package className="w-5 h-5 text-orange-500" />
                                        <span className="font-bold text-gray-900">
                                            Produits ({config.products.length})
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <span className="font-bold text-gray-900">
                                            Clients ({config.clients.length}) • Équipe ({config.workers.length})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4">
                    {currentStep > 1 && currentStep < 8 && (
                        <button
                            onClick={previousStep}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Retour</span>
                        </button>
                    )}

                    {/* Skip button for optional steps */}
                    {(currentStep === 4 || currentStep === 5 || currentStep === 6 || currentStep === 7) && (
                        <button
                            onClick={nextStep}
                            className="ml-auto px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Sauter
                        </button>
                    )}

                    {currentStep < 8 ? (
                        <button
                            onClick={() => {
                                if (currentStep === 2) {
                                    handleSalonDetailsNext();
                                } else {
                                    nextStep();
                                }
                            }}
                            disabled={
                                currentStep === 2
                                    ? !(salonForm.name && salonForm.address && salonForm.phone && salonForm.email)
                                    : !canProceedToNext()
                            }
                            className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 2
                                ? (salonForm.name && salonForm.address && salonForm.phone && salonForm.email)
                                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:scale-[1.02] shadow-lg"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : canProceedToNext()
                                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:scale-[1.02] shadow-lg"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <span>Continuer</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
                        >
                            <PartyPopper className="w-5 h-5" />
                            <span>Accéder à mon salon</span>
                        </button>
                    )}
                </div>
            </div>

            {/* CSV Import Modals */}
            <CSVImportModal
                isOpen={showServiceImport}
                onClose={() => setShowServiceImport(false)}
                onImport={handleServiceImport}
                validator={validateServiceRow}
                templateContent={getServicesCSVTemplate()}
                templateFileName="services-template.csv"
                title="Importer des services"
                description="Téléchargez le modèle CSV, remplissez-le avec vos services et importez-le ici"
            />

            <CSVImportModal
                isOpen={showProductImport}
                onClose={() => setShowProductImport(false)}
                onImport={handleProductImport}
                validator={validateProductRow}
                templateContent={getProductsCSVTemplate()}
                templateFileName="products-template.csv"
                title="Importer des produits"
                description="Téléchargez le modèle CSV, remplissez-le avec vos produits et importez-le ici"
            />

            <CSVImportModal
                isOpen={showClientImport}
                onClose={() => setShowClientImport(false)}
                onImport={handleClientImport}
                validator={validateClientRow}
                templateContent={getClientsCSVTemplate()}
                templateFileName="clients-template.csv"
                title="Importer des clients"
                description="Téléchargez le modèle CSV, remplissez-le avec vos clients et importez-le ici"
            />
        </OnboardingLayout>
    );
}
