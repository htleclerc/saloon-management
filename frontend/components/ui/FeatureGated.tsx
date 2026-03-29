"use client";

import { Lock, ArrowUpCircle } from "lucide-react";
import { getFeatureById } from "@/lib/data/featureCatalog";
import { isFeatureGloballyEnabled } from "@/lib/data/featureFlags";
import { useTranslation } from "@/i18n";

interface FeatureGatedProps {
    featureId: string;
}

export default function FeatureGated({ featureId }: FeatureGatedProps) {
    const { t } = useTranslation();
    const feature = getFeatureById(featureId);
    const isGloballyDisabled = !isFeatureGloballyEnabled(featureId);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                {isGloballyDisabled ? (
                    <Lock className="w-8 h-8 text-gray-400" />
                ) : (
                    <ArrowUpCircle className="w-8 h-8 text-[var(--color-primary)]" />
                )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {feature?.name || featureId}
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
                {isGloballyDisabled
                    ? t("featureGating.notYetAvailable")
                    : t("featureGating.upgradeRequired")
                }
            </p>
            {feature && (
                <p className="text-gray-400 text-xs mt-3">
                    {feature.description}
                </p>
            )}
        </div>
    );
}
