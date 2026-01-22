import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Edit, Power, PowerOff, Star, Sparkles, Zap, Crown } from 'lucide-react';
import { PlanConfig } from '@/types';

interface PlanConfigCardProps {
    plan: PlanConfig;
    onEdit: (plan: PlanConfig) => void;
    onToggleActive: (planId: string) => void;
}

function getPlanIcon(planId: string) {
    switch (planId) {
        case 'free':
        case 'starter':
            return <Sparkles className="w-5 h-5" />;
        case 'pro':
            return <Zap className="w-5 h-5" />;
        case 'enterprise':
            return <Crown className="w-5 h-5" />;
        default:
            return <Sparkles className="w-5 h-5" />;
    }
}

function getPlanColor(planId: string) {
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
}

export default function PlanConfigCard({ plan, onEdit, onToggleActive }: PlanConfigCardProps) {
    return (
        <Card className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}>
            {/* Default Badge */}
            {plan.isDefault && (
                <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Défaut
                    </div>
                </div>
            )}

            {/* Plan Icon & Name */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} flex items-center justify-center text-white mb-3`}>
                {getPlanIcon(plan.id)}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>

            {/* Price */}
            <div className="mb-4">
                {plan.price === 0 ? (
                    <div className="text-2xl font-bold text-gray-900">Gratuit</div>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-500 text-xs">/mois</span>
                    </div>
                )}
            </div>

            {/* Limits Summary */}
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Salons</span>
                    <span className="font-semibold text-gray-900">
                        {plan.limits.maxSalons === 999 ? 'Illimité' : plan.limits.maxSalons}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Employés</span>
                    <span className="font-semibold text-gray-900">
                        {plan.limits.maxWorkers === 999 ? 'Illimité' : plan.limits.maxWorkers}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Réservations/mois</span>
                    <span className="font-semibold text-gray-900">
                        {plan.limits.maxBookingsPerMonth === 99999 ? 'Illimité' : plan.limits.maxBookingsPerMonth}
                    </span>
                </div>
            </div>

            {/* Active/Inactive Status */}
            <div className="mb-4">
                <button
                    onClick={() => onToggleActive(plan.id)}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${plan.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                >
                    {plan.isActive ? (
                        <>
                            <Power className="w-4 h-4" />
                            Actif
                        </>
                    ) : (
                        <>
                            <PowerOff className="w-4 h-4" />
                            Inactif
                        </>
                    )}
                </button>
            </div>

            {/* Edit Button */}
            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onEdit(plan)}
            >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
            </Button>
        </Card>
    );
}
