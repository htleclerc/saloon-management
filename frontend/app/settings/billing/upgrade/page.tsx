'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, AlertTriangle, ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';
import { getActivePlans, getPlanConfig } from '@/lib/utils/subscriptionHelpers';
import { PlanConfig } from '@/types';

export default function UpgradePage() {
    const router = useRouter();
    const { currentTenant, user } = useAuth();

    const activePlans = getActivePlans();
    const currentPlanId = currentTenant?.subscriptionPlan || 'free';
    const currentPlan = getPlanConfig(currentPlanId);

    const handleUpgrade = (planId: string) => {
        // In demo mode, just show a success message
        alert(`Upgrade simulé vers le plan ${planId}. En production, ceci redirigerait vers le processus de paiement.`);
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
                return 'from-purple-600 to-pink-500';
            case 'enterprise':
                return 'from-amber-500 to-orange-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <SettingsLayout
            title="Mettre à niveau votre plan"
            description="Choisissez le plan qui correspond le mieux à vos besoins"
        >
            {/* Alert if user reached limit */}
            {currentPlan && user?.tenants && user.tenants.length >= currentPlan.limits.maxSalons && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-900 mb-1">
                                Limite de salons atteinte
                            </h3>
                            <p className="text-sm text-orange-700">
                                Vous avez atteint la limite de {currentPlan.limits.maxSalons} salon{currentPlan.limits.maxSalons > 1 ? 's' : ''} pour votre plan <span className="font-semibold">{currentPlan.name}</span>.
                                Passez à un plan supérieur pour créer plus de salons!
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
                    const isUpgrade = activePlans.findIndex((p: PlanConfig) => p.id === plan.id) > activePlans.findIndex((p: PlanConfig) => p.id === currentPlanId);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 ${isCurrent
                                    ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20'
                                    : 'hover:shadow-xl hover:scale-[1.02]'
                                }`}
                        >
                            {/* Badge for current plan */}
                            {isCurrent && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                        Plan actuel
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
                                    <div className="text-4xl font-bold text-gray-900">Gratuit</div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                                        <span className="text-gray-500 text-sm">/mois</span>
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
                                    Plan actuel
                                </Button>
                            ) : isDowngrade ? (
                                <Button
                                    variant="outline"
                                    className="w-full mb-6"
                                    onClick={() => handleUpgrade(plan.id)}
                                >
                                    Rétrograder
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="w-full mb-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                                    onClick={() => handleUpgrade(plan.id)}
                                >
                                    <span>Mettre à niveau</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">Comparaison détaillée</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Fonctionnalité</th>
                                {activePlans.map((plan: PlanConfig) => (
                                    <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                                        {plan.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">Nombre de salons</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxSalons === 999 ? 'Illimité' : plan.limits.maxSalons}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">Employés par salon</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxWorkers === 999 ? 'Illimité' : plan.limits.maxWorkers}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">Réservations/mois</td>
                                {activePlans.map((plan: PlanConfig) => (
                                    <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                                        {plan.limits.maxBookingsPerMonth === 99999 ? 'Illimité' : plan.limits.maxBookingsPerMonth}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">Rapports avancés</td>
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
                                <td className="py-3 px-4 font-medium text-gray-900">Accès API</td>
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
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Besoin d'aide pour choisir?</h3>
                        <p className="text-sm text-gray-700 mb-3">
                            Contactez notre équipe pour discuter de vos besoins et trouver le plan parfait pour votre business.
                        </p>
                        <Button variant="outline" size="sm">
                            Contactez-nous
                        </Button>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
