import { PlanConfig } from '@/types';

/**
 * Default plan configurations
 * These can be edited by super admins via localStorage in demo mode
 */
export const DEFAULT_PLANS: PlanConfig[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'EUR',
        limits: {
            maxSalons: 1,
            maxWorkers: 5,
            maxBookingsPerMonth: 100,
            hasAdvancedReports: false,
            hasAPIAccess: false,
        },
        features: [
            '1 salon',
            'Jusqu\'à 5 employés',
            '100 réservations/mois',
            'Rapports basiques',
            'Support email',
        ],
        isActive: true,
        isDefault: true,
        displayOrder: 1,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        currency: 'EUR',
        limits: {
            maxSalons: 3,
            maxWorkers: 20,
            maxBookingsPerMonth: 500,
            hasAdvancedReports: true,
            hasAPIAccess: false,
        },
        features: [
            'Jusqu\'à 3 salons',
            'Jusqu\'à 20 employés par salon',
            '500 réservations/mois',
            'Rapports avancés',
            'Support prioritaire',
            'Export de données',
        ],
        isActive: true,
        isDefault: false,
        displayOrder: 2,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        currency: 'EUR',
        limits: {
            maxSalons: 999,
            maxWorkers: 999,
            maxBookingsPerMonth: 99999,
            hasAdvancedReports: true,
            hasAPIAccess: true,
        },
        features: [
            'Salons illimités',
            'Employés illimités',
            'Réservations illimitées',
            'Rapports avancés',
            'Accès API',
            'Support dédié 24/7',
            'Intégrations personnalisées',
        ],
        isActive: true,
        isDefault: false,
        displayOrder: 3,
    },
];

/**
 * Load plans from localStorage or use defaults
 * In demo mode, super admins can modify these via the admin panel
 */
export function getPlans(): PlanConfig[] {
    if (typeof window === 'undefined') return DEFAULT_PLANS;

    const stored = localStorage.getItem('plan_configs');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return DEFAULT_PLANS;
        }
    }
    return DEFAULT_PLANS;
}

/**
 * Save updated plans (super admin only)
 */
export function savePlans(plans: PlanConfig[]): void {
    localStorage.setItem('plan_configs', JSON.stringify(plans));
}

/**
 * Reset plans to default configuration
 */
export function resetPlans(): void {
    localStorage.removeItem('plan_configs');
}
