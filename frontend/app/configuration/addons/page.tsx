"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { Plus, Trash2, Layers, X, Pencil, Clock } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { serviceService } from "@/lib/services";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { formatDurationMinutes } from "@/lib/domain/rules/pricingRules";
import type { ServiceAddon } from "@/types";

interface AddonFormState {
    name: string;
    description: string;
    extraPrice: number;
    extraDuration: number;
    displayOrder: number;
}

const EMPTY_FORM: AddonFormState = { name: "", description: "", extraPrice: 0, extraDuration: 0, displayOrder: 0 };

export default function AddonsConfigPage() {
    const { t } = useTranslation();
    const { format: formatCurrency, symbol } = useCurrency();
    const { canModify, activeSalonId } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [addons, setAddons] = useState<ServiceAddon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<AddonFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const salonId = activeSalonId ? Number(activeSalonId) : 0;

    const loadAddons = useCallback(async () => {
        if (!salonId) return;
        try {
            setAddons(await serviceService.getAddons(salonId));
        } catch (e) {
            console.error("Failed to load add-ons", e);
            showToast(t("common.error"), t("common.loadError"), "error");
        }
    }, [salonId, showToast, t]);

    useEffect(() => {
        loadAddons();
    }, [loadAddons]);

    const handleOpenModal = (addon?: ServiceAddon) => {
        if (handleReadOnlyClick()) return;
        if (addon) {
            setEditingId(addon.id);
            setForm({
                name: addon.name,
                description: addon.description || "",
                extraPrice: addon.extraPrice,
                extraDuration: addon.extraDuration,
                displayOrder: addon.displayOrder,
            });
        } else {
            setEditingId(null);
            setForm({ ...EMPTY_FORM, displayOrder: addons.length + 1 });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (handleReadOnlyClick() || !salonId) return;
        if (form.name.trim().length < 2) {
            showToast(t("common.error"), t("errors.generic"), "warning");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                extraPrice: Number(form.extraPrice) || 0,
                extraDuration: Math.max(0, Math.round(Number(form.extraDuration) || 0)),
                displayOrder: Number(form.displayOrder) || 0,
            };
            if (editingId) {
                await serviceService.updateAddon(editingId, payload);
            } else {
                await serviceService.createAddon({ ...payload, salonId, isActive: true });
            }
            showToast(t("common.success"), t("common.saveSuccess"), "success");
            setIsModalOpen(false);
            await loadAddons();
        } catch (e) {
            console.error("Failed to save add-on", e);
            showToast(t("common.error"), e instanceof Error ? e.message : t("common.saveError"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (addon: ServiceAddon) => {
        if (handleReadOnlyClick()) return;
        try {
            await serviceService.updateAddon(addon.id, { isActive: !addon.isActive });
            await loadAddons();
        } catch (e) {
            console.error("Failed to toggle add-on", e);
            showToast(t("common.error"), t("common.updateError"), "error");
        }
    };

    const handleDelete = async (addon: ServiceAddon) => {
        if (handleReadOnlyClick()) return;
        const ok = await confirm({
            title: t("common.delete"),
            message: t("configuration.addons.deleteConfirm"),
            type: "error",
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
        });
        if (!ok) return;
        try {
            await serviceService.deleteAddon(addon.id);
            showToast(t("common.success"), t("common.deleteSuccess"), "success");
            await loadAddons();
        } catch (e) {
            console.error("Failed to delete add-on", e);
            showToast(t("common.error"), t("common.deleteError"), "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("configuration.addons.title")}</h1>
                    <p className="text-gray-500 text-sm">{t("configuration.addons.subtitle")}</p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()} disabled={!canModify} className="disabled:opacity-50 shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("configuration.addons.newAddon")}
                </Button>
            </div>

            <div className="grid gap-4">
                {addons.map((addon) => (
                    <Card key={addon.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${addon.isActive ? 'bg-primary-light text-color-primary' : 'bg-gray-100 text-gray-400'}`}>
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 truncate">{addon.name}</h3>
                                <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="font-semibold text-color-primary">+{formatCurrency(addon.extraPrice)}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> +{formatDurationMinutes(addon.extraDuration)}</span>
                                    {addon.description && <span className="text-gray-400 truncate">{addon.description}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <button
                                onClick={() => handleToggleActive(addon)}
                                disabled={!canModify}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${addon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'} disabled:opacity-50`}
                            >
                                {addon.isActive ? t("common.active") : t("common.inactive")}
                            </button>
                            <ReadOnlyGuard>
                                <button onClick={() => handleOpenModal(addon)} className="p-2 text-gray-400 hover:text-color-primary transition-colors" aria-label={t("common.edit")}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <button onClick={() => handleDelete(addon)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={t("common.delete")}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </ReadOnlyGuard>
                        </div>
                    </Card>
                ))}

                {addons.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t("configuration.addons.noAddons")}</p>
                    </div>
                )}
            </div>

            <Card className="bg-blue-50 border-blue-100">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold">i</div>
                    <p className="text-sm text-blue-800 self-center">{t("configuration.addons.linkHint")}</p>
                </div>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{editingId ? t("configuration.addons.editAddon") : t("configuration.addons.newAddon")}</h2>
                            <button onClick={() => setIsModalOpen(false)} aria-label={t("common.close")}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.addons.name")}</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                disabled={!canModify}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                placeholder={t("configuration.addons.namePlaceholder")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.addons.description")}</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                disabled={!canModify}
                                rows={2}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                placeholder={t("configuration.addons.descriptionPlaceholder")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.addons.extraPrice", { currency: symbol() })}</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.extraPrice}
                                    onChange={(e) => setForm({ ...form, extraPrice: Number(e.target.value) })}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.addons.extraDuration")}</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={5}
                                    value={form.extraDuration}
                                    onChange={(e) => setForm({ ...form, extraDuration: Number(e.target.value) })}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.addons.displayOrder")}</label>
                            <input
                                type="number"
                                min={0}
                                value={form.displayOrder}
                                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                                disabled={!canModify}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>{t("common.cancel")}</Button>
                            <Button variant="primary" className="flex-1" onClick={handleSave} disabled={!canModify || saving}>{t("configuration.addons.save")}</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
