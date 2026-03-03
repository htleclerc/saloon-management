"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Save, Scissors, Shirt, Wrench, Check, Plus, Trash2, Store, ArrowRight, Sparkles, FileText, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const workshopTemplates = [
    { id: "hair-salon", name: "Hair Salon / Braiding", icon: Scissors, color: "from-[var(--color-primary)] to-[var(--color-primary-dark)]" },
    { id: "tailor-shop", name: "Tailor Shop / Sewing", icon: Shirt, color: "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]" },
    { id: "mechanic-shop", name: "Mechanic Shop / Garage", icon: Wrench, color: "from-[var(--color-warning)] to-[var(--color-warning-dark)]" },
];

const defaultServices = [
    { name: "Box Braids", duration: "3-4 hours", price: 120 },
    { name: "Cornrows", duration: "2-3 hours", price: 85 },
    { name: "Senegalese Twists", duration: "3-4 hours", price: 110 },
    { name: "Locs", duration: "4-5 hours", price: 150 },
];

const defaultCategories = ["Office Rental", "Electricity", "Beauty Supply", "Marketing", "Internet", "Insurance"];

export default function WorkshopSettingsPage() {
    const router = useRouter();
    const { user, canModify } = useAuth();
    const isConfigured = user?.onboardingCompleted;
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [businessName, setBusinessName] = useState("Premium Workshop");
    const [businessAddress, setBusinessAddress] = useState("123 Rue de Paris, 75001 Paris");
    const [businessPhone, setBusinessPhone] = useState("+33 1 23 45 67 89");
    const [selectedTemplate, setSelectedTemplate] = useState("hair-salon");
    const [currency, setCurrency] = useState("EUR");
    const [taxRate, setTaxRate] = useState("20");

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
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                            type="text"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="XOF">XOF (CFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Workshop Type */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Business Type</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Select the template that best matches your activity
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workshopTemplates.map((template) => {
                        const Icon = template.icon;
                        const isSelected = selectedTemplate === template.id;
                        return (
                            <button
                                key={template.id}
                                onClick={() => canModify && setSelectedTemplate(template.id)}
                                disabled={!canModify}
                                className={`relative p-5 rounded-xl border-2 transition-all text-left ${isSelected
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md"
                                    : "border-gray-200 hover:border-[var(--color-primary-light)]"
                                    } ${!canModify ? "cursor-not-allowed opacity-80" : ""}`}
                            >
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Default Services */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Default Services</h3>
                        <p className="text-xs text-gray-500">Pre-configured services for your business</p>
                    </div>
                    <ReadOnlyGuard>
                        <Link href="/services/add?mode=simple">
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4" />
                                Add
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
                                <span className="font-bold text-purple-600 text-sm">€{service.price}</span>
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
                        <h3 className="font-semibold text-gray-900 text-lg">Expense Categories</h3>
                        <p className="text-xs text-gray-500">Pre-configured spending categories</p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                            Add
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
                <Button variant="outline" size="md">Cancel</Button>
                <ReadOnlyGuard>
                    <Button variant="primary" size="md">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </ReadOnlyGuard>
            </div>

            {/* Shop Configuration - Moved to bottom */}
            <Card className="border-t-4 border-t-purple-500 shadow-xl shadow-purple-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                            <Store className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                                Shop Configuration
                                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 max-w-md">
                                Configure or re-configure your salon settings, including services, products, and team members.
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                                    <ArrowRight className="w-3 h-3" /> 7 Steps
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    <FileText className="w-3 h-3" /> CSV Support
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                    <Clock className="w-3 h-3" /> ~10 Min
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStartOnboarding}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/30 w-full md:w-auto overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span>{isConfigured ? 'Restart Configuration' : 'Start Configuration'}</span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </button>
                </div>
            </Card>
        </div>
    );
}
