"use client";

import Link from "next/link";
import { Check, Clock, Layers, Settings2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDurationMinutes } from "@/lib/domain/rules/pricingRules";
import type { ServiceAddon } from "@/types";

interface ServiceAddonPickerProps {
    /** Catalog of the salon (active add-ons) */
    addons: ServiceAddon[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    disabled?: boolean;
    /** Show the link to the configuration page */
    showManageLink?: boolean;
}

/**
 * Checkbox list used to attach add-ons to a service (service edit page)
 * and to pick extras on a booking.
 */
export default function ServiceAddonPicker({ addons, selectedIds, onChange, disabled, showManageLink }: ServiceAddonPickerProps) {
    const { t } = useTranslation();
    const { format: formatCurrency } = useCurrency();

    const toggle = (id: number) => {
        if (disabled) return;
        onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
    };

    if (addons.length === 0) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 text-sm text-gray-500">
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-gray-400" />{t("services.addons.none")}</span>
                {showManageLink && (
                    <Link href="/configuration/addons" className="font-bold text-color-primary hover:underline flex items-center gap-1">
                        <Settings2 className="w-4 h-4" /> {t("services.addons.manage")}
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addons.map(addon => {
                    const selected = selectedIds.includes(addon.id);
                    return (
                        <button
                            type="button"
                            key={addon.id}
                            onClick={() => toggle(addon.id)}
                            disabled={disabled}
                            aria-pressed={selected}
                            className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 disabled:opacity-60 ${selected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                                : 'border-gray-100 bg-white hover:border-[var(--color-primary-light)]'}`}
                        >
                            <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-gray-300 bg-white'}`}>
                                {selected && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-bold text-gray-900 truncate">{addon.name}</span>
                                {addon.description && <span className="block text-xs text-gray-500 line-clamp-2">{addon.description}</span>}
                                <span className="mt-1 flex items-center gap-3 text-xs font-semibold text-color-primary">
                                    <span>+{formatCurrency(addon.extraPrice)}</span>
                                    <span className="flex items-center gap-1 text-gray-500"><Clock className="w-3 h-3" /> +{formatDurationMinutes(addon.extraDuration)}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{t("services.addons.selectedCount", { count: selectedIds.length })}</span>
                {showManageLink && (
                    <Link href="/configuration/addons" className="font-bold text-color-primary hover:underline flex items-center gap-1">
                        <Settings2 className="w-3.5 h-3.5" /> {t("services.addons.manage")}
                    </Link>
                )}
            </div>
        </div>
    );
}
