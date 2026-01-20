"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Save, Scissors, Shirt, Wrench, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

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
    const [businessName, setBusinessName] = useState("Premium Workshop");
    const [businessAddress, setBusinessAddress] = useState("123 Rue de Paris, 75001 Paris");
    const [businessPhone, setBusinessPhone] = useState("+33 1 23 45 67 89");
    const [selectedTemplate, setSelectedTemplate] = useState("hair-salon");
    const [currency, setCurrency] = useState("EUR");
    const [taxRate, setTaxRate] = useState("20");

    return (
        <SettingsLayout
            title="Workshop Configuration"
            description="Configurez les informations et paramètres de votre entreprise"
        >
            {/* Business Information */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Informations de l'entreprise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de l'entreprise <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                        <input
                            type="text"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="XOF">XOF (CFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">TVA (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Workshop Type */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Type d'entreprise</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Sélectionnez le template qui correspond le mieux à votre activité
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workshopTemplates.map((template) => {
                        const Icon = template.icon;
                        const isSelected = selectedTemplate === template.id;
                        return (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`relative p-5 rounded-xl border-2 transition-all text-left ${isSelected
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md"
                                    : "border-gray-200 hover:border-[var(--color-primary-light)]"
                                    }`}
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
                        <h3 className="font-semibold text-gray-900 text-lg">Services par défaut</h3>
                        <p className="text-xs text-gray-500">Services pré-configurés pour votre entreprise</p>
                    </div>
                    <Link href="/services/add?mode=simple">
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </Button>
                    </Link>
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
                                <button className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Expense Categories */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Catégories de dépenses</h3>
                        <p className="text-xs text-gray-500">Catégories pré-configurées pour vos dépenses</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {defaultCategories.map((category, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg text-sm font-medium"
                        >
                            {category}
                            <button className="text-[var(--color-primary)] opacity-60 hover:text-[var(--color-error)]">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md">Annuler</Button>
                <Button variant="primary" size="md">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                </Button>
            </div>
        </SettingsLayout>
    );
}
