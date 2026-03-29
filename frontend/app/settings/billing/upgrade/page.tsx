'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, AlertTriangle, ArrowRight, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { getActivePlans, getPlanConfig } from '@/lib/utils/subscriptionHelpers';
import { PlanConfig } from '@/types';
import { useToast } from '@/context/ToastProvider';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { usePayment } from '@/hooks/usePayment';

// Map plan IDs to Stripe price IDs (from env)
const PLAN_PRICE_MAP: Record<string, string> = {
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
    enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '',
};

export default function UpgradePage() {
    const router = useRouter();
    const { currentTenant, user } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { format } = useCurrency();
    const { isDemoMode, providers, checkout } = usePayment();
    const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string>('');

    const activePlans = getActivePlans();
    const currentPlanId = currentTenant?.subscriptionPlan || 'free';
    const currentPlan = getPlanConfig(currentPlanId);

    const handleUpgrade = async (planId: string) => {
        // Demo mode — show info toast
        if (isDemoMode) {
            showToast(t("common.info"), t("settings.billing.demoUpgradeMessage", { planId }), "info");
            return;
        }

        // Free plan — no checkout needed
        if (planId === 'free') return;

        const priceId = PLAN_PRICE_MAP[planId];
        if (!priceId) {
            showToast(t("common.error"), t("settings.billing.noPriceConfigured"), "error");
            return;
        }

        setUpgradingPlan(planId);
        try {
            await checkout({
                planId,
                priceId,
                provider: selectedProvider || undefined,
            });
        } catch (err) {
            if ((err as Error).message === 'DEMO_MODE') {
                showToast(t("common.info"), t("settings.billing.demoModeActive"), "info");
            } else {
                showToast(t("common.error"), (err as Error).message, "error");
            }
        } finally {
            setUpgradingPlan(null);
        }
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'free':
            case 'starter':
                return <Sparkles className="w-6 h-6" />;
            case 'pro':
                return <Zap className="w-6 h-6" />;
            case 'enterprise':
                return <Crown className="w-6 h-6" />;
            default:
                return <Sparkles className="w-6 h-6" />;
        }
    };

    const getPlanColor = (planId: string) => {
        switch (planId) {
            case 'free':
            case 'starter':
                return 'from-gray-500 to-gray-600';
            case 'pro':
                return 'from-primary to-secondary';
            case 'enterprise':
                return 'from-amber-500 to-orange-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <SettingsLayout
            title={t("settings.billing.upgradeTitle")}
            description={t("settings.billing.upgradeSubtitle")}
        >
            {/* Provider Selector — only show if multiple providers */}
            {providers.length > 1 && (
                <Card>
                    <h3 className="font-semibold text-gray-900 mb-3">{t("settings.billing.selectProvider")}</h3>
                    <div className="flex gap-3">
                        {providers.map((provider) => (
                            <button
                                key={provider}
                                type="button"
                                onClick={() => setSelectedProvider(provider)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    (selectedProvider || providers[0]) === provider
                                        ? 'border-primary bg-primary-light text-color-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {t(`settings.billing.provider_${provider}`)}
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Alert if user reached limit */}
            {currentPlan && user?.tenants && user.tenants.length >= currentPlan.limits.maxSalons && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-900 mb-1">
                                {t("settings.billing.salonLimitReached")}
                            </h3>
                            <p className="text-sm text-orange-700">
                                {t("settings.billing.salonLimitReachedDesc", { count: currentPlan.limits.maxSalons, plan: currentPlan.name })}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activePlans.map((plan: PlanConfig) => {
                    const isCurrent = plan.id === currentPlanId;
                    const isDowngrade = activePlans.findIndex((p: PlanConfig) => p.id === plan.id) < activePlans.findIndex((p: PlanConfig) => p.id === currentPlanId);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 ${isCurrent
                                ? 'ring-2 ring-primary shadow-lg shadow-[color:var(--color-primary)]/20'
                                : 'hover:shadow-xl hover:scale-[1.02]'
                                }`}
                        >
                            {/* Badge for current plan */}
                            {isCurrent && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-primary-light text-color-primary text-xs font-bold rounded-full">
                                        {t("settings.billing.currentPlan")}
                                    </span>
                                </div>
                            )}

                            {/* Plan Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} flex items-center justify-center text-white mb-4`}>
                                {getPlanIcon(plan.id)}
                            </div>

                            {/* Plan Name */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                            {/* Price */}
                            <div className="mb-6">
                                {plan.price === 0 ? (
                                    <div className="text-4xl font-bold text-gray-900">{t("settings.billing.free")}</div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">{format(plan.price)}</span>
                                        <span className="text-gray-500 text-sm">{t("settings.billing.perMonth")}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            {isCurrent ? (
                                <Button
                                    variant="outline"
                                    className="w-full mb-6"
                                    disabled
                                >
                                    {t("settings.billing.currentPlan")}
                                </Button>
                            ) : isDowngrade ? (
                                <Button
                                    variant="outline"
                                    className="w-full mb-6"
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={upgradingPlan !== null}
                                >
                                    {upgradingPlan === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        t("settings.billing.downgrade")
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="w-full mb-6 bg-gradient-primary hover:from-primary hover:to-secondary"
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={upgradingPlan !== null}
                                >
                                    {upgradingPlan === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>{t("settings.billing.upgrade")}</span>
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Features List */}
                            <div className="space-y-3">
                                {plan.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t("settings.billing.detailedComparison")}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">{t("settings.billing.feature")}</th>
                                {activePlans.map((plan: PlanConfig) => (
                                    <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                                        {plan.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{t("settings.billing.maxSalons")}</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxSalons === 999 ? t("settings.billing.unlimited") : plan.limits.maxSalons}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{t("settings.billing.maxWorkers")}</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxWorkers === 999 ? t("settings.billing.unlimited") : plan.limits.maxWorkers}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{t("settings.billing.bookingsPerMonth")}</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxBookingsPerMonth === 99999 ? t("settings.billing.unlimited") : plan.limits.maxBookingsPerMonth}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{t("settings.billing.advancedReports")}</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4">
                                        {plan.limits.hasAdvancedReports ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{t("settings.billing.apiAccess")}</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4">
                                        {plan.limits.hasAPIAccess ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-primary border-color-primary/30">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("settings.billing.helpTitle")}</h3>
                        <p className="text-sm text-gray-700 mb-3">
                            {t("settings.billing.helpSubtitle")}
                        </p>
                        <Button variant="outline" size="sm">
                            {t("settings.billing.contactUs")}
                        </Button>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
