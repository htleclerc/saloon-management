'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
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
    DollarSign,
    ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
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
    salonTypes,
} from '@/lib/onboarding/templates';
import {
    getExpenseCategoryTemplates,
    downloadExpenseCategoriesCSV,
} from '@/lib/onboarding/expenseCategoryTemplates';
import { validateServiceRow, validateProductRow, validateClientRow } from '@/lib/utils/csvParser';
import type { Service, Product, Client, SalonDetails, ExpenseCategory } from '@/types';
import { salonService } from '@/lib/services/SalonService';
import { supabase } from '@/lib/supabase/client';
import { serviceService } from '@/lib/services/ServiceService';
import { productService } from '@/lib/services/ProductService';
import { clientService } from '@/lib/services/ClientService';
import { workerService } from '@/lib/services/WorkerService';
import { expenseService } from '@/lib/services/ExpenseService';

// Auto-detect currency from timezone (outside component to avoid re-creation)
function getCurrencyFromTimezone(timezone: string): string {
    if (timezone.startsWith('America/')) return 'USD';
    if (timezone.startsWith('Europe/London') || timezone.startsWith('Europe/Belfast')) return 'GBP';
    if (timezone.startsWith('Europe/')) return 'EUR';
    if (timezone.startsWith('Africa/Lagos') || timezone.startsWith('Africa/Dakar') || timezone.startsWith('Africa/Abidjan') || timezone.startsWith('Africa/Bamako') || timezone.startsWith('Africa/Niamey')) return 'XOF';
    if (timezone.startsWith('Africa/Douala') || timezone.startsWith('Africa/Libreville') || timezone.startsWith('Africa/Brazzaville') || timezone.startsWith('Africa/Bangui')) return 'XAF';
    if (timezone.startsWith('Africa/Casablanca') || timezone.startsWith('Africa/Rabat')) return 'MAD';
    if (timezone.startsWith('Africa/Tunis')) return 'TND';
    if (timezone.startsWith('Africa/Algiers')) return 'DZD';
    if (timezone.startsWith('Asia/Tokyo')) return 'JPY';
    if (timezone.startsWith('Asia/Shanghai') || timezone.startsWith('Asia/Chongqing')) return 'CNY';
    return 'EUR';
}

function SetupPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, updateUser, user } = useAuth();
    const { symbol } = useCurrency();
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
    const { t } = useTranslation();

    // Force step from URL parameter if provided
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

    // Pre-fill salon name from URL query param (set during signup/callback)
    const initialSalonName = searchParams.get('salonName') || '';
    // Pre-fill email from the authenticated user
    const initialEmail = user?.email || '';

    // Step 2: Salon Details state — restore from OnboardingProvider if available
    const [salonForm, setSalonForm] = useState<Partial<SalonDetails>>(() => {
        if (config.salonDetails) {
            return config.salonDetails;
        }
        return {
            name: initialSalonName,
            address: '',
            phone: '',
            email: initialEmail,
            website: '',
            timezone: '',
            currency: 'EUR',
            openingHours: [],
        };
    });

    // Set timezone and currency from browser on mount (avoid SSR mismatch)
    const hasSetTimezone = useRef(false);
    useEffect(() => {
        if (hasSetTimezone.current) return;
        hasSetTimezone.current = true;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSalonForm(prev => ({
            ...prev,
            ...(prev.timezone ? {} : { timezone: tz }),
            ...(prev.currency && prev.currency !== 'EUR' ? {} : { currency: getCurrencyFromTimezone(tz) }),
        }));
    }, []);

    // Pre-fill email and salon name from multiple sources (auth context, URL params, session cookie)
    useEffect(() => {
        let email = '';
        let salonName = '';

        // Source 1: AuthProvider user
        if (user?.email) email = user.email;

        // Source 2: URL query param for salon name
        const urlSalonName = searchParams.get('salonName');
        if (urlSalonName) salonName = urlSalonName;

        // Source 3: Supabase session cookie (no network call, instant)
        if (!email || !salonName) {
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const projectRef = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
                const authCookie = document.cookie
                    .split(';')
                    .find(c => c.trim().startsWith(`sb-${projectRef}-auth-token`));
                if (authCookie) {
                    const val = authCookie.split('=').slice(1).join('=');
                    const clean = val.replace('base64-', '');
                    const parsed = JSON.parse(atob(clean));
                    if (!email && parsed?.user?.email) {
                        email = parsed.user.email;
                    }
                    if (!salonName && parsed?.user?.user_metadata?.salon_name) {
                        salonName = parsed.user.user_metadata.salon_name;
                    }
                }
            } catch {
                // Cookie parsing failed - that's OK
            }
        }

        // Apply prefill values (only update fields that are still empty)
        if (email || salonName) {
            setSalonForm(prev => ({
                ...prev,
                ...(email && !prev.email ? { email } : {}),
                ...(salonName && !prev.name ? { name: salonName } : {}),
            }));
        }
    }, [user?.email, searchParams]);

    // Auto-save salonForm to OnboardingProvider (so it persists across logout/login)
    useEffect(() => {
        if (salonForm.name || salonForm.email || salonForm.address || salonForm.phone) {
            setSalonDetails({
                ...salonForm,
                openingHours: salonForm.openingHours || [],
            } as SalonDetails);
        }
    }, [salonForm]);

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
        setSalonType(typeId);
        setServices(getServiceTemplates(typeId) as Service[]);
        setProducts(getProductTemplates(typeId) as Product[]);
        setExpenseCategories(getExpenseCategoryTemplates(typeId) as any);
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
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newWorkerName}`,
                status: 'Active',
                sharingKey: 40,
                color: '#8B5CF6',
                salonId: 0,
                userId: 0,
                phone: '',
                bio: '',
                specialties: [],
                isActive: true
            } as any);
            setNewWorkerName("");
            setNewWorkerEmail("");
        }
    };

    const handleComplete = async () => {
        try {
            // 1. Create/Update Salon
            let salonId = user?.id ? (await salonService.getMySalons(Number(user.id)))[0]?.id || 0 : 0;

            if (!salonId && salonForm.name) {
                // Determine subscription plan based on salon type? Defaulting to 'starter' or similar logic
                const newSalon = await salonService.create({
                    name: salonForm.name,
                    slug: salonForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    country: 'FR',
                    timezone: salonForm.timezone || 'Europe/Paris',
                    currency: salonForm.currency || 'EUR',
                    subscriptionPlan: 'free',
                    subscriptionStatus: 'active',
                    isActive: true
                });
                salonId = newSalon.id;
            } else if (salonId && salonForm.name) {
                await salonService.updateSettings(salonId, {
                    // Update settings if needed, though salonService.update is for salon details
                });
                await salonService.update(salonId, {
                    name: salonForm.name,
                    address: salonForm.address,
                    phone: salonForm.phone,
                    email: salonForm.email,
                    website: salonForm.website,
                });
            }

            if (!salonId) throw new Error("Failed to create or retrieve salon");

            // 1b. Link the owner to the salon via user_salons
            if (user?.id) {
                const numericUserId = parseInt(user.id);
                if (!isNaN(numericUserId)) {
                    // Check if link already exists
                    const { data: existingLink } = await supabase
                        .from('user_salons')
                        .select('id')
                        .eq('user_id', numericUserId)
                        .eq('salon_id', salonId)
                        .single();

                    if (!existingLink) {
                        await supabase
                            .from('user_salons')
                            .insert({
                                user_id: numericUserId,
                                salon_id: salonId,
                                role_in_salon: 'Manager', // Owner gets Manager role in user_salons
                                is_active: true,
                            });
                    }
                }
            }

            // 2. Persist Services
            const servicePromises = config.services.map(service =>
                serviceService.create({
                    ...service,
                    salonId,
                    isActive: true
                })
            );

            // 3. Persist Products
            const productPromises = config.products.map(product =>
                productService.create({
                    ...product,
                    salonId,
                    isActive: true,
                    isLinkedToService: false
                })
            );

            // 4. Persist Expense Categories
            const categoryPromises = config.expenseCategories.map(cat =>
                expenseService.createCategory({
                    ...cat,
                    salonId,
                    isActive: true
                })
            );

            // 5. Persist Clients
            const clientPromises = config.clients.map(client =>
                clientService.create({
                    ...client,
                    salonId,
                    isActive: true
                })
            );

            // 6. Persist Workers
            const workerPromises = config.workers.map(worker =>
                workerService.create({
                    ...worker,
                    salonId,
                    isActive: true
                })
            );

            // Execute all persistence in parallel
            await Promise.all([
                ...servicePromises,
                ...productPromises,
                ...categoryPromises,
                ...clientPromises,
                ...workerPromises
            ]);

            completeOnboarding();

            // specific user update
            updateUser({ onboardingCompleted: true });

            router.push("/");
        } catch (error) {
            console.error("Onboarding persistence failed:", error);
            // Handle error (maybe show toast)
        }
    };

    const stepLabels = [
        t("onboarding.stepType"),
        t("onboarding.stepDetails"),
        t("onboarding.stepServices"),
        t("onboarding.stepProducts"),
        t("onboarding.stepCategories"),
        t("onboarding.stepClients"),
        t("onboarding.stepTeam"),
        t("onboarding.stepReview"),
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
                                {t("onboarding.typeTitle")}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t("onboarding.typeSubtitle")}
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
                                                ? "border-[var(--color-primary)] bg-primary-light shadow-lg scale-[1.02]"
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
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
                                {t("onboarding.detailsTitle")}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t("onboarding.detailsSubtitle")}
                            </p>
                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t("onboarding.salonName")} *
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={salonForm.name}
                                            onChange={(e) =>
                                                setSalonForm({ ...salonForm, name: e.target.value })
                                            }
                                            placeholder={t("onboarding.salonNamePlaceholder")}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t("onboarding.salonAddress")} *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={salonForm.address}
                                            onChange={(e) =>
                                                setSalonForm({ ...salonForm, address: e.target.value })
                                            }
                                            placeholder={t("onboarding.addressPlaceholder")}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t("onboarding.salonPhone")} *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={salonForm.phone}
                                                onChange={(e) =>
                                                    setSalonForm({ ...salonForm, phone: e.target.value })
                                                }
                                                placeholder={t("onboarding.phonePlaceholderFull")}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t("onboarding.salonEmail")} *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={salonForm.email}
                                                onChange={(e) =>
                                                    setSalonForm({ ...salonForm, email: e.target.value })
                                                }
                                                placeholder={t("onboarding.emailPlaceholderContact")}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t("onboarding.website")}
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
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t("onboarding.currency")} *
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                value={salonForm.currency || 'EUR'}
                                                onChange={(e) =>
                                                    setSalonForm({ ...salonForm, currency: e.target.value })
                                                }
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-white appearance-none"
                                            >
                                                <option value="EUR">EUR - Euro (€)</option>
                                                <option value="USD">USD - Dollar US ($)</option>
                                                <option value="GBP">GBP - Livre Sterling (£)</option>
                                                <option value="XOF">XOF - Franc CFA BCEAO</option>
                                                <option value="XAF">XAF - Franc CFA BEAC</option>
                                                <option value="MAD">MAD - Dirham Marocain</option>
                                                <option value="TND">TND - Dinar Tunisien</option>
                                                <option value="DZD">DZD - Dinar Algérien</option>
                                                <option value="CAD">CAD - Dollar Canadien (CA$)</option>
                                                <option value="CHF">CHF - Franc Suisse</option>
                                                <option value="JPY">JPY - Yen (¥)</option>
                                                <option value="CNY">CNY - Yuan (¥)</option>
                                                <option value="BRL">BRL - Réal Brésilien (R$)</option>
                                                <option value="MXN">MXN - Peso Mexicain (MX$)</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
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
                                        {t("onboarding.servicesTitle")}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t("onboarding.servicesSubtitle")}
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
                                        {t("onboarding.downloadCsv")}
                                    </button>
                                    <button
                                        onClick={() => setShowServiceImport(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-color-primary/30 rounded-xl hover:bg-primary-light transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {t("onboarding.importCsv")}
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
                                                className="flex items-start gap-3 p-4 border border-color-primary/30 bg-primary-light rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                        {service.name}
                                                        {(service as any).category === 'Personnalisé' && (
                                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                                                {t("onboarding.custom")}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-color-primary">
                                                        {service.price}{symbol()} • {service.duration} min
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeService(service.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                    title={t("onboarding.remove")}
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
                                                {config.services.length} {t("onboarding.serviceCount")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t("onboarding.noServicesConfigured")}</p>
                                    <p className="text-sm">{t("onboarding.addServicesBelow")}</p>
                                </div>
                            )}

                            {/* Add Custom Service Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-color-primary transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {t("onboarding.addCustomService")}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder={t("onboarding.serviceNamePlaceholder")}
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="number"
                                        placeholder={`${t("onboarding.price")} (${symbol()})`}
                                        value={newServicePrice}
                                        onChange={(e) => setNewServicePrice(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t("onboarding.durationPlaceholder")}
                                        value={newServiceDuration}
                                        onChange={(e) => setNewServiceDuration(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newServiceName && newServicePrice && newServiceDuration) {
                                                addService({
                                                    id: Date.now(),
                                                    salonId: 0, // Placeholder
                                                    name: newServiceName,
                                                    price: parseFloat(newServicePrice),
                                                    duration: parseInt(newServiceDuration),
                                                    category: 'Personnalisé',
                                                    icon: 'Sparkles',
                                                    isActive: true
                                                } as any);
                                                setNewServiceName('');
                                                setNewServicePrice('');
                                                setNewServiceDuration('');
                                            }
                                        }}
                                        disabled={!newServiceName || !newServicePrice || !newServiceDuration}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${newServiceName && newServicePrice && newServiceDuration
                                            ? 'bg-primary text-white hover:bg-primary'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        + {t("onboarding.add")}
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
                                        {t("onboarding.productsTitle")}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t("onboarding.productsSubtitle")}
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
                                        {t("onboarding.downloadCsv")}
                                    </button>
                                    <button
                                        onClick={() => setShowProductImport(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-color-primary/30 rounded-xl hover:bg-primary-light transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {t("onboarding.importCsv")}
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
                                                className="flex items-start gap-3 p-4 border border-color-secondary bg-secondary-light rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                        {product.name}
                                                        {product.category === 'Personnalisé' && (
                                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                                                {t("onboarding.custom")}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-color-secondary">
                                                        {product.price}{symbol()} • {t("onboarding.stock")}: {product.stock}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                    title={t("onboarding.remove")}
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
                                                {config.products.length} {t("onboarding.productCount")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t("onboarding.noProductsConfigured")}</p>
                                    <p className="text-sm">{t("onboarding.addProductsBelow")}</p>
                                </div>
                            )}

                            {/* Add Custom Product Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-color-secondary transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {t("onboarding.addCustomProduct")}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder={t("onboarding.productNamePlaceholder")}
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                                    />
                                    <input
                                        type="number"
                                        placeholder={`${t("onboarding.price")} (${symbol()})`}
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t("onboarding.initialStockPlaceholder")}
                                        value={newProductStock}
                                        onChange={(e) => setNewProductStock(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newProductName && newProductPrice && newProductStock) {
                                                addProduct({
                                                    id: Date.now(),
                                                    salonId: 0, // Placeholder
                                                    name: newProductName,
                                                    price: parseFloat(newProductPrice),
                                                    stock: parseInt(newProductStock),
                                                    category: 'Personnalisé',
                                                    isActive: true
                                                } as any);
                                                setNewProductName('');
                                                setNewProductPrice('');
                                                setNewProductStock('');
                                            }
                                        }}
                                        disabled={!newProductName || !newProductPrice || !newProductStock}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${newProductName && newProductPrice && newProductStock
                                            ? 'bg-secondary text-white hover:bg-secondary'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        + {t("onboarding.add")}
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
                                        {t("onboarding.categoriesTitle")}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t("onboarding.categoriesSubtitle")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => downloadExpenseCategoriesCSV(config.expenseCategories, 'categories_depenses.csv')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    {t("onboarding.downloadCsv")}
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
                                                        ? 'border-color-primary bg-primary-light'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                addExpenseCategory(category as any);
                                                            } else if (category.id) {
                                                                removeExpenseCategory(category.id);
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-color-primary rounded focus:ring-primary"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: category.color || '#ccc' }}
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
                                                {config.expenseCategories.length} {t("onboarding.categoryCount")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-12">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t("onboarding.noCategoriesConfigured")}</p>
                                    <p className="text-sm">{t("onboarding.canSkipStep")}</p>
                                </div>
                            )}

                            {/* Add Custom Category Form */}
                            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-color-primary transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {t("onboarding.addCustomCategory")}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder={t("onboarding.categoryNamePlaceholder")}
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                                                    } as any);
                                                    setNewCategoryName('');
                                                    setNewCategoryColor('#8B5CF6');
                                                }
                                            }}
                                            disabled={!newCategoryName}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${newCategoryName
                                                ? 'bg-primary text-white hover:bg-primary'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            + {t("onboarding.add")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowExpenseCategoryImport(true)}
                                className="w-full mt-6 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-color-primary hover:bg-primary-light/50 transition-all group"
                            >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-color-primary transition-colors" />
                                <p className="text-sm font-medium text-gray-700 group-hover:text-color-primary transition-colors">
                                    {t("onboarding.importFromCsv")}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{t("onboarding.importCategoriesFromCsv")}</p>
                            </button>
                        </div>
                    )}

                    {/* Step 6: Clients */}
                    {currentStep === 6 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {t("onboarding.clientsTitle")}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t("onboarding.clientsSubtitle")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowClientImport(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-color-primary/30 rounded-xl hover:bg-primary-light transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="font-medium">{t("onboarding.importCsv")}</span>
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
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold">
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
                                                title={t("onboarding.remove")}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 mb-6">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t("onboarding.noClientsImported")}</p>
                                    <p className="text-sm">{t("onboarding.addManuallyOrImport")}</p>
                                </div>
                            )}

                            {/* Add Client Form */}
                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    {t("onboarding.addClientManually")}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder={t("onboarding.fullNamePlaceholder")}
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder={t("onboarding.emailPlaceholder")}
                                        value={newClientEmail}
                                        onChange={(e) => setNewClientEmail(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder={t("onboarding.phonePlaceholder")}
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newClientName && newClientEmail) {
                                                const newClient: Client = {
                                                    id: Date.now(),
                                                    salonId: 0, // Placeholder
                                                    userId: undefined,
                                                    name: newClientName,
                                                    email: newClientEmail,
                                                    phone: newClientPhone || "",
                                                    address: undefined,
                                                    city: undefined,
                                                    postalCode: undefined,
                                                    birthDate: undefined,
                                                    notes: undefined,
                                                    isActive: true,
                                                    createdAt: new Date(),
                                                    updatedAt: new Date(),
                                                    createdBy: 'system',
                                                    updatedBy: 'system'
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
                                        + {t("onboarding.add")}
                                    </button>
                                </div>
                            </div>

                            {config.clients.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-blue-900">
                                            {config.clients.length} {t("onboarding.clientCount")}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 7: Team */}
                    {currentStep === 7 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("onboarding.teamTitle")}</h2>
                            <p className="text-gray-600 mb-6">
                                {t("onboarding.teamSubtitle")}
                            </p>

                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newWorkerName}
                                        onChange={(e) => setNewWorkerName(e.target.value)}
                                        placeholder={t("onboarding.workerNamePlaceholder")}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={newWorkerEmail}
                                        onChange={(e) => setNewWorkerEmail(e.target.value)}
                                        placeholder={t("onboarding.workerEmailPlaceholder")}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                    />
                                </div>
                                <button
                                    onClick={handleAddWorker}
                                    disabled={!newWorkerName || !newWorkerEmail}
                                    className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-primary-dark)] transition-colors"
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
                                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
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
                                    <p>{t("onboarding.noMembersAdded")}</p>
                                    <p className="text-sm">{t("onboarding.canAddLater")}</p>
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
                                    {t("onboarding.setupComplete")}
                                </h2>
                                <p className="text-gray-600">
                                    {t("onboarding.welcomeMessage")}
                                </p>
                            </div>

                            <div className="space-y-4 max-w-2xl mx-auto">
                                <div className="p-4 bg-primary-light rounded-xl border border-color-primary/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
                                        <span className="font-bold text-gray-900">{t("onboarding.reviewSalonType")}</span>
                                    </div>
                                    <p className="text-[var(--color-primary)] font-medium ml-8">
                                        {salonTypes.find((t) => t.id === config.salonType)?.label || "N/A"}
                                    </p>
                                </div>

                                <div className="p-4 bg-secondary-light rounded-xl border border-color-secondary">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-color-secondary" />
                                        <span className="font-bold text-gray-900">
                                            {t("onboarding.stepServices")} ({config.services.length})
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Package className="w-5 h-5 text-orange-500" />
                                        <span className="font-bold text-gray-900">
                                            {t("onboarding.stepProducts")} ({config.products.length})
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <span className="font-bold text-gray-900">
                                            {t("onboarding.stepClients")} ({config.clients.length}) • {t("onboarding.stepTeam")} ({config.workers.length})
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
                            type="button"
                            onClick={() => previousStep()}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t("onboarding.back")}</span>
                        </button>
                    )}

                    {/* Skip button for optional steps */}
                    {(currentStep === 4 || currentStep === 5 || currentStep === 6 || currentStep === 7) && (
                        <button
                            type="button"
                            onClick={() => nextStep()}
                            className="ml-auto px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {t("onboarding.skip")}
                        </button>
                    )}

                    {currentStep < 8 ? (
                        <button
                            type="button"
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
                                    ? "bg-gradient-primary text-white hover:scale-[1.02] shadow-lg"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : canProceedToNext()
                                    ? "bg-gradient-primary text-white hover:scale-[1.02] shadow-lg"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <span>{t("onboarding.continue")}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleComplete}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
                        >
                            <PartyPopper className="w-5 h-5" />
                            <span>{t("onboarding.accessMySalon")}</span>
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
                title={t("onboarding.importServicesTitle")}
                description={t("onboarding.importServicesDesc")}
            />

            <CSVImportModal
                isOpen={showProductImport}
                onClose={() => setShowProductImport(false)}
                onImport={handleProductImport}
                validator={validateProductRow}
                templateContent={getProductsCSVTemplate()}
                templateFileName="products-template.csv"
                title={t("onboarding.importProductsTitle")}
                description={t("onboarding.importProductsDesc")}
            />

            <CSVImportModal
                isOpen={showClientImport}
                onClose={() => setShowClientImport(false)}
                onImport={handleClientImport}
                validator={validateClientRow}
                templateContent={getClientsCSVTemplate()}
                templateFileName="clients-template.csv"
                title={t("onboarding.importClientsTitle")}
                description={t("onboarding.importClientsDesc")}
            />
        </OnboardingLayout>
    );
}

export default function EnhancedSetupPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        }>
            <SetupPageContent />
        </Suspense>
    );
}
