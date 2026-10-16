"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Sparkles,
    Clock,
    Euro,
    Plus,
    Trash2,
    CheckCircle,
    Layout,
    Layers
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import ServiceAddonPicker from "@/components/services/ServiceAddonPicker";
import type { ServiceAddon, ServiceCategory } from "@/types";

/** Typed payload emitted by the form (prices and durations are numbers, duration in minutes) */
export interface ServiceFormData {
    name: string;
    description: string;
    price: number;
    duration: number;
    categoryId?: number;
    isActive: boolean;
    image?: string;
    gallery: string[];
    addonIds: number[];
}

interface ServiceFormProps {
    initialData?: Partial<ServiceFormData>;
    mode: "simple" | "advanced";
    onSubmit: (data: ServiceFormData) => void | Promise<void>;
    onCancel: () => void;
    /** Salon categories; when empty the category field is hidden */
    categories?: ServiceCategory[];
    /** Salon add-on catalog; when provided the "extras offered" picker is shown */
    addons?: ServiceAddon[];
    saving?: boolean;
}

interface FormState {
    name: string;
    description: string;
    price: string;
    duration: string;
    categoryId: string;
    isActive: boolean;
    image: string;
    gallery: string[];
    addonIds: number[];
}

export default function ServiceForm({ initialData, mode, onSubmit, onCancel, categories = [], addons, saving }: ServiceFormProps) {
    const { symbol } = useCurrency();
    const { t } = useTranslation();
    const [formData, setFormData] = useState<FormState>({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price !== undefined ? String(initialData.price) : "",
        duration: initialData?.duration !== undefined ? String(initialData.duration) : "",
        categoryId: initialData?.categoryId !== undefined ? String(initialData.categoryId) : "",
        isActive: initialData?.isActive ?? true,
        image: initialData?.image ?? "",
        gallery: initialData?.gallery ?? [],
        addonIds: initialData?.addonIds ?? [],
    });

    const isAdvanced = mode === "advanced";
    const isEdit = !!initialData && initialData.name !== undefined;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price) || 0,
            duration: Math.max(0, Math.round(Number(formData.duration) || 0)),
            categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
            isActive: formData.isActive,
            image: formData.image || undefined,
            gallery: formData.gallery,
            addonIds: formData.addonIds,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem] p-8">
                <div className="space-y-8">
                    {/* Mode Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${isAdvanced ? 'bg-primary-light text-color-primary' : 'bg-blue-100 text-blue-600'}`}>
                                {isAdvanced ? <Sparkles className="w-6 h-6" /> : <Layout className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isAdvanced ? "Advanced Configuration" : "Quick Update"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {isAdvanced ? "Detailed service management & media" : "Basic service details for fast updates"}
                                </p>
                            </div>
                        </div>
                        {isAdvanced && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("common.status")}:</span>
                                <select
                                    className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1.5 focus:ring-0"
                                    value={formData.isActive ? "active" : "archived"}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                                >
                                    <option value="active">{t("common.active")}</option>
                                    <option value="archived">{t("common.archive")}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Always visible: Base fields */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t("services.name")}</label>
                            <input
                                type="text"
                                placeholder="e.g., Box Braids"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                minLength={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Euro className="w-4 h-4" />
                                {`${t("services.price")} (${symbol()})`}
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 transition-all"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {t("services.durationMinutes")}
                            </label>
                            <input
                                type="number"
                                min={5}
                                step={5}
                                placeholder={t("services.durationPlaceholder")}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 transition-all"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                            />
                        </div>

                        {/* Advanced Fields */}
                        {isAdvanced && (
                            <>
                                {categories.length > 0 && (
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t("services.category")}</label>
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-gray-900 transition-all appearance-none"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        >
                                            <option value="">—</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={String(c.id)}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t("services.description")}</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the service details, hair to bring, preparation..."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium text-gray-700 transition-all"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Media Section */}
                                <div className="md:col-span-2 space-y-6 pt-4">
                                    <h4 className="text-sm font-black text-gray-900 border-l-4 border-color-primary pl-3">Media & Gallery</h4>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                placeholder="https://images.unsplash.com/..."
                                                className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium text-gray-600 transition-all"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                            {formData.image && (
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                                                    <img src={formData.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gallery Preview</label>
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                            {formData.gallery.map((img: string, idx: number) => (
                                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group">
                                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                        onClick={() => {
                                                            const newGallery = [...formData.gallery];
                                                            newGallery.splice(idx, 1);
                                                            setFormData({ ...formData, gallery: newGallery });
                                                        }}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors group"
                                            >
                                                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Extras offered on this service */}
                        {addons && (
                            <div className="md:col-span-2 space-y-4 pt-4">
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 border-l-4 border-color-primary pl-3 flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> {t("services.addons.title")}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 pl-4">{t("services.addons.subtitle")}</p>
                                </div>
                                <ServiceAddonPicker
                                    addons={addons}
                                    selectedIds={formData.addonIds}
                                    onChange={(ids) => setFormData({ ...formData, addonIds: ids })}
                                    showManageLink
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-8 py-6 rounded-2xl font-bold"
                >
                    {t("common.cancel")}
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    className="px-10 py-6 rounded-2xl font-black text-lg shadow-xl shadow-[color:var(--color-primary)]/20"
                >
                    {isEdit ? t("common.save") : t("services.addService")}
                    <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </form>
    );
}
