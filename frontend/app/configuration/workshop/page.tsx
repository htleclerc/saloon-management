"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, Store, ArrowRight, Sparkles, FileText, Clock, Upload, ImagePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { extractDominantColors } from "@/lib/utils/colorExtraction";
import { useToast } from "@/context/ToastProvider";
import { useTranslation } from "@/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useCurrency } from "@/hooks/useCurrency";
import { salonService } from "@/lib/services/SalonService";
import { storageService } from "@/lib/services/StorageService";
import type { SalonSettings } from "@/types";

const defaultServices = [
    { name: "Box Braids", duration: "3-4 hours", price: 120 },
    { name: "Cornrows", duration: "2-3 hours", price: 85 },
    { name: "Senegalese Twists", duration: "3-4 hours", price: 110 },
    { name: "Locs", duration: "4-5 hours", price: 150 },
];

const defaultCategories = ["Office Rental", "Electricity", "Beauty Supply", "Marketing", "Internet", "Insurance"];

export default function WorkshopSettingsPage() {
    const router = useRouter();
    const { user, canModify, activeSalonId, currentTenant, updateTenantLogo, updateTenantColors } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { format: formatCurrency } = useCurrency();
    const isConfigured = user?.onboardingCompleted;
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [businessName, setBusinessName] = useState("Premium Workshop");
    const [businessAddress, setBusinessAddress] = useState("123 Rue de Paris, 75001 Paris");
    const [businessPhone, setBusinessPhone] = useState("+33 1 23 45 67 89");
    const [currency, setCurrency] = useState("EUR");
    const [taxRate, setTaxRate] = useState("20");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [settings, setSettings] = useState<SalonSettings | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
    const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
            showToast(t("common.error"), t("settings.appearancePage.invalidFileType"), "error");
            return;
        }

        if (file.size > MAX_LOGO_SIZE) {
            showToast(t("common.error"), t("settings.appearancePage.fileTooLarge"), "error");
            return;
        }

        try {
            setIsUploadingLogo(true);
            const folder = `salons/${activeSalonId || 'default'}`;
            const url = await storageService.uploadImage(file, 'logos', folder);

            // Persist logo URL to database
            if (activeSalonId) {
                try {
                    await salonService.update(Number(activeSalonId), { logoUrl: url });
                } catch (dbErr) {
                    console.warn("Could not persist logo to database:", dbErr);
                }
            }

            // Auto-extract colors from logo and apply together with logo URL (single atomic update)
            let extractedColors: { primary: string; secondary: string } | undefined;
            try {
                extractedColors = await extractDominantColors(file);
            } catch {
                // SVG or extraction failure — skip color extraction
            }

            // Update logo + colors in one call to avoid race condition
            updateTenantLogo(url, extractedColors);

            showToast(
                t("common.success"),
                extractedColors
                    ? t("configuration.workshop.logoAndColorsApplied")
                    : t("settings.appearancePage.logoUploaded"),
                "success"
            );
        } catch (err) {
            console.error("Logo upload failed:", err);
            showToast(t("common.error"), t("configuration.workshop.settingsSaveError"), "error");
        } finally {
            setIsUploadingLogo(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    const handleRemoveLogo = async () => {
        if (activeSalonId) {
            try {
                await salonService.update(Number(activeSalonId), { logoUrl: '' });
            } catch (err) {
                console.warn("Could not remove logo from database:", err);
            }
        }
        updateTenantLogo('');
    };

    // Load settings on mount
    useEffect(() => {
        if (activeSalonId) {
            loadSettings();
        }
    }, [activeSalonId]);

    const loadSettings = async () => {
        try {
            // Load both Salon (business info) and SalonSettings (config)
            const [salon, salonSettings] = await Promise.all([
                salonService.getById(Number(activeSalonId)),
                salonService.getSettings(Number(activeSalonId))
            ]);

            if (salon) {
                setBusinessName(salon.name);
                setBusinessAddress(salon.address || "");
                setBusinessPhone(salon.phone || "");
                setCurrency(salon.currency || "EUR");
            }

            if (salonSettings) {
                setTaxRate(salonSettings.vatRate?.toString() || "20");
                setSettings(salonSettings);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            showToast(t("common.error"), t("configuration.workshop.settingsLoadError"), "error");
        }
    };

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        if (!activeSalonId) {
            showToast(t("common.error"), t("configuration.workshop.noSalonSelected"), "error");
            return;
        }

        try {
            setIsLoading(true);
            const salonId = Number(activeSalonId);

            // Update business info (Salon table)
            await salonService.update(salonId, {
                name: businessName,
                address: businessAddress,
                phone: businessPhone,
                currency,
            });

            // Update settings (SalonSettings table) — separate try/catch so business info still saves
            try {
                await salonService.updateSettings(salonId, {
                    vatRate: Number(taxRate),
                });
            } catch (settingsError) {
                console.warn("Could not save VAT rate (column may not exist yet):", settingsError);
            }

            showToast(t("common.success"), t("configuration.workshop.settingsSaved"), "success");
        } catch (error) {
            console.error("Failed to save settings:", error);
            showToast(t("common.error"), t("configuration.workshop.settingsSaveError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOnboarding = () => {
        if (handleReadOnlyClick()) return;
        localStorage.setItem("signup_name", businessName || "Salon Owner");
        localStorage.setItem("signup_email", "owner@salon.com");
        router.push("/onboarding/setup");
    };

    return (
        <div className="space-y-6">

            {/* Business Information */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">{t("configuration.workshop.businessInfo")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("configuration.workshop.businessName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("configuration.workshop.address")}</label>
                        <input
                            type="text"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("configuration.workshop.phone")}</label>
                        <input
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("configuration.workshop.currency")}</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="XOF">XOF (CFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("configuration.workshop.vatRate")}</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Salon Logo */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.appearancePage.salonLogo")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.appearancePage.salonLogoDesc")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div
                        onClick={() => canModify && logoInputRef.current?.click()}
                        className={`relative w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                            canModify ? 'cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]' : ''
                        } ${currentTenant?.logo ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}
                    >
                        {isUploadingLogo ? (
                            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                        ) : currentTenant?.logo ? (
                            <img
                                src={currentTenant.logo}
                                alt={currentTenant?.name}
                                className="w-full h-full object-contain p-2"
                            />
                        ) : (
                            <div className="text-center">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-400">{t("settings.appearancePage.uploadLogo")}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-3">PNG, JPEG, WebP, SVG — max 2 Mo</p>
                        <div className="flex gap-2">
                            <ReadOnlyGuard>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                >
                                    <Upload className="w-4 h-4" />
                                    {currentTenant?.logo ? t("settings.appearancePage.changeLogo") : t("settings.appearancePage.uploadLogo")}
                                </Button>
                            </ReadOnlyGuard>
                            {currentTenant?.logo && (
                                <ReadOnlyGuard>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={handleRemoveLogo}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t("settings.appearancePage.removeLogo")}
                                    </Button>
                                </ReadOnlyGuard>
                            )}
                        </div>
                    </div>
                </div>

                <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                />
            </Card>

            {/* Default Services */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("configuration.workshop.defaultServices")}</h3>
                        <p className="text-xs text-gray-500">{t("configuration.workshop.defaultServicesDesc")}</p>
                    </div>
                    <ReadOnlyGuard>
                        <Link href="/services/add?mode=simple">
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4" />
                                {t("common.add")}
                            </Button>
                        </Link>
                    </ReadOnlyGuard>
                </div>
                <div className="space-y-2">
                    {defaultServices.map((service, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                <p className="text-xs text-gray-500">{service.duration}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-color-primary text-sm">{formatCurrency(service.price)}</span>
                                <ReadOnlyGuard>
                                    <button className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </ReadOnlyGuard>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Expense Categories */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("configuration.workshop.expenseCategories")}</h3>
                        <p className="text-xs text-gray-500">{t("configuration.workshop.expenseCategoriesDesc")}</p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                            {t("common.add")}
                        </Button>
                    </ReadOnlyGuard>
                </div>
                <div className="flex flex-wrap gap-2">
                    {defaultCategories.map((category, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg text-sm font-medium"
                        >
                            {category}
                            <ReadOnlyGuard>
                                <button className="text-[var(--color-primary)] opacity-60 hover:text-[var(--color-error)]">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </ReadOnlyGuard>
                        </span>
                    ))}
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 italic">
                <Button variant="outline" size="md" onClick={() => router.back()}>{t("common.cancel")}</Button>
                <ReadOnlyGuard>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        <Save className="w-4 h-4" />
                        {isLoading ? t("configuration.workshop.saving") : t("configuration.workshop.saveChanges")}
                    </Button>
                </ReadOnlyGuard>
            </div>

            {/* Shop Configuration - Moved to bottom */}
            <Card className="border-t-4 border-t-[var(--color-primary)] shadow-xl shadow-[color:var(--color-primary)]/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-[color:var(--color-primary)]/20 flex-shrink-0">
                            <Store className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                                {t("configuration.workshop.shopConfig")}
                                <Sparkles className="w-5 h-5 text-color-primary animate-pulse" />
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 max-w-md">
                                {t("configuration.workshop.shopConfigDesc")}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-color-primary bg-primary-light px-2.5 py-1 rounded-full border border-color-primary/30">
                                    <ArrowRight className="w-3 h-3" /> {t("configuration.workshop.steps")}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    <FileText className="w-3 h-3" /> {t("configuration.workshop.csvSupport")}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                    <Clock className="w-3 h-3" /> {t("configuration.workshop.estimatedTime")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStartOnboarding}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[color:var(--color-primary)]/20 w-full md:w-auto overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span>{isConfigured ? t("configuration.workshop.restartConfig") : t("configuration.workshop.startConfig")}</span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </button>
                </div>
            </Card>
        </div>
    );
}
