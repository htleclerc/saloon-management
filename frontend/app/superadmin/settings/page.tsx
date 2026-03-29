'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { useToast } from '@/context/ToastProvider';
import { Settings2, ToggleLeft, ToggleRight, RotateCcw, CheckCircle, XCircle, Tag, Zap } from 'lucide-react';
import { FEATURE_CATALOG, FEATURE_CATEGORIES, type FeatureDefinition } from '@/lib/data/featureCatalog';
import { getGlobalFeatureFlags, saveGlobalFeatureFlags, resetGlobalFeatureFlags, type GlobalFeatureFlags } from '@/lib/data/featureFlags';
import { getPlans } from '@/lib/data/defaultPlans';
import type { PlanConfig } from '@/types';

const APP_VERSION = '1.2.0';

export default function SuperAdminSettingsPage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [flags, setFlags] = useState<GlobalFeatureFlags>({});
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setFlags(getGlobalFeatureFlags());
        setPlans(getPlans());
        setMounted(true);
    }, []);

    const toggleFlag = (featureId: string) => {
        const updated = { ...flags, [featureId]: !flags[featureId] };
        setFlags(updated);
        saveGlobalFeatureFlags(updated);
    };

    const handleReset = () => {
        resetGlobalFeatureFlags();
        setFlags(getGlobalFeatureFlags());
        showToast(t("common.success"), t("superadmin.featureFlagsReset"), "success");
    };

    const enabledCount = Object.values(flags).filter(Boolean).length;
    const totalCount = FEATURE_CATALOG.length;

    if (!mounted) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Settings2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">{t("superadmin.systemConfiguration")}</h1>
                        <p className="text-gray-500 text-sm">{t("superadmin.featureFlagsDescription")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-xs font-bold">
                        v{APP_VERSION}
                    </span>
                    <Button variant="outline" onClick={handleReset} className="rounded-xl text-xs font-bold">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {t("superadmin.resetDefaults")}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-2xl font-black text-gray-900">{enabledCount}/{totalCount}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t("superadmin.featuresEnabled")}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-2xl font-black text-gray-900">{plans.filter(p => p.isActive).length}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t("superadmin.activePlansCount")}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-2xl font-black text-[var(--color-primary)]">v{APP_VERSION}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t("superadmin.currentVersion")}</p>
                </Card>
            </div>

            {/* Global Feature Flags */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-[var(--color-primary)]" />
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">{t("superadmin.globalFeatureFlags")}</h2>
                </div>

                <div className="space-y-8">
                    {FEATURE_CATEGORIES.map(category => {
                        const features = FEATURE_CATALOG.filter(f => f.category === category.id);
                        if (features.length === 0) return null;

                        return (
                            <div key={category.id}>
                                <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${category.color}`}>
                                    {category.name}
                                </h3>
                                <div className="space-y-2">
                                    {features.map(feature => (
                                        <FeatureRow
                                            key={feature.id}
                                            feature={feature}
                                            enabled={flags[feature.id] ?? false}
                                            onToggle={() => toggleFlag(feature.id)}
                                            appVersion={APP_VERSION}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Feature / Plan Matrix */}
            <Card className="p-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-[var(--color-primary)]" />
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">{t("superadmin.featurePlanMatrix")}</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">{t("superadmin.featurePlanMatrixDesc")}</p>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Feature</th>
                            <th className="text-center py-3 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Global</th>
                            {plans.filter(p => p.isActive).map(plan => (
                                <th key={plan.id} className="text-center py-3 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider">
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {FEATURE_CATALOG.map(feature => (
                            <tr key={feature.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="py-3 px-2 font-medium text-gray-900">{feature.name}</td>
                                <td className="py-3 px-2 text-center">
                                    {flags[feature.id] ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                    )}
                                </td>
                                {plans.filter(p => p.isActive).map(plan => (
                                    <td key={plan.id} className="py-3 px-2 text-center">
                                        {plan.features.includes(feature.id) ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

function FeatureRow({ feature, enabled, onToggle, appVersion }: {
    feature: FeatureDefinition;
    enabled: boolean;
    onToggle: () => void;
    appVersion: string;
}) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${enabled ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{feature.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${feature.sinceVersion <= appVersion ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        v{feature.sinceVersion}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
            </div>
            <button
                onClick={onToggle}
                className="flex-shrink-0 ml-4"
            >
                {enabled ? (
                    <ToggleRight className="w-10 h-10 text-green-500" />
                ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
            </button>
        </div>
    );
}
