import { SubscriptionPlan, SubscriptionLimits, PlanConfig } from '@/types';
import { getPlans } from '@/lib/data/defaultPlans';

/**
 * Get subscription limits for a given plan
 * Dynamically loads from plan configurations
 */
export function getPlanLimits(plan: SubscriptionPlan): SubscriptionLimits {
    const plans = getPlans();
    const planConfig = plans.find(p => p.id === plan);

    if (planConfig) {
        return planConfig.limits;
    }

    // Fallback to free plan if not found
    const freePlan = plans.find(p => p.id === 'free');
    return freePlan?.limits || {
        maxSalons: 1,
        maxWorkers: 5,
        maxBookingsPerMonth: 100,
        hasAdvancedReports: false,
        hasAPIAccess: false,
    };
}

/**
 * Get full plan configuration by ID
 */
export function getPlanConfig(planId: string): PlanConfig | undefined {
    const plans = getPlans();
    return plans.find(p => p.id === planId);
}

/**
 * Get all active plans sorted by display order
 */
export function getActivePlans(): PlanConfig[] {
    return getPlans().filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get the default plan for new users
 */
export function getDefaultPlan(): PlanConfig {
    const plans = getPlans();
    return plans.find(p => p.isDefault) || plans[0];
}

/**
 * Check if a user can create a new salon based on current count and limit
 */
export function canCreateSalon(currentCount: number, limit: number): boolean {
    return currentCount < limit;
}

/**
 * Get upgrade message based on current plan
 */
export function getUpgradeMessage(currentPlan: SubscriptionPlan): string {
    const plans = getActivePlans();
    const currentIndex = plans.findIndex(p => p.id === currentPlan);

    if (currentIndex < plans.length - 1) {
        const nextPlan = plans[currentIndex + 1];
        return `Passez au plan ${nextPlan.name} pour gérer jusqu'à ${nextPlan.limits.maxSalons === 999 ? 'un nombre illimité de' : nextPlan.limits.maxSalons} salons`;
    }

    return 'Vous avez déjà le meilleur plan!';
}

/**
 * Format price for display
 */
export function formatPlanPrice(price: number, currency: string): string {
    if (price === 0) return 'Gratuit';
    return `${price}€/${currency === 'EUR' ? 'mois' : 'month'}`;
}

/**
 * Check if a feature is included in a plan
 */
export function hasFeature(plan: PlanConfig, featureName: string): boolean {
    return plan.features.some(f => f.toLowerCase().includes(featureName.toLowerCase()));
}
