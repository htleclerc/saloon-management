/**
 * Feature Catalog
 *
 * Single source of truth for all feature flags in the platform.
 * Super admins can toggle features globally and assign them to plans.
 */

export interface FeatureDefinition {
    id: string;
    name: string;
    description: string;
    category: 'core' | 'marketing' | 'analytics' | 'integrations' | 'experimental';
    defaultEnabled: boolean;
    sinceVersion: string;
}

export const FEATURE_CATALOG: FeatureDefinition[] = [
    // Core
    { id: 'online_booking', name: 'Online Booking', description: 'Clients can book appointments online', category: 'core', defaultEnabled: true, sinceVersion: '1.0.0' },
    { id: 'tips_management', name: 'Tips Management', description: 'Worker tips distribution rules', category: 'core', defaultEnabled: true, sinceVersion: '1.0.0' },
    { id: 'payroll', name: 'Payroll', description: 'Salary and commission management', category: 'core', defaultEnabled: true, sinceVersion: '1.0.0' },

    // Marketing
    { id: 'promo_codes', name: 'Promo Codes', description: 'Discount code management', category: 'marketing', defaultEnabled: true, sinceVersion: '1.0.0' },
    { id: 'referral_system', name: 'Referral System', description: 'Client referral program with rewards', category: 'marketing', defaultEnabled: false, sinceVersion: '1.2.0' },
    { id: 'email_marketing', name: 'Email Marketing', description: 'Automated email campaigns', category: 'marketing', defaultEnabled: false, sinceVersion: '1.3.0' },

    // Analytics
    { id: 'advanced_reports', name: 'Advanced Reports', description: 'Detailed analytics and export', category: 'analytics', defaultEnabled: true, sinceVersion: '1.0.0' },

    // Integrations
    { id: 'api_access', name: 'API Access', description: 'REST API for third-party integrations', category: 'integrations', defaultEnabled: true, sinceVersion: '1.0.0' },
    { id: 'csv_import_export', name: 'CSV Import/Export', description: 'Bulk data import and export', category: 'integrations', defaultEnabled: true, sinceVersion: '1.0.0' },

    // Experimental
    { id: 'ai_assistant', name: 'AI Assistant', description: 'AI-powered scheduling and suggestions', category: 'experimental', defaultEnabled: false, sinceVersion: '2.0.0' },
];

export const FEATURE_CATEGORIES = [
    { id: 'core', name: 'Core', color: 'text-blue-600' },
    { id: 'marketing', name: 'Marketing', color: 'text-purple-600' },
    { id: 'analytics', name: 'Analytics', color: 'text-green-600' },
    { id: 'integrations', name: 'Integrations', color: 'text-orange-600' },
    { id: 'experimental', name: 'Experimental', color: 'text-red-600' },
] as const;

export function getFeatureById(id: string): FeatureDefinition | undefined {
    return FEATURE_CATALOG.find(f => f.id === id);
}

export function getFeaturesByCategory(category: string): FeatureDefinition[] {
    return FEATURE_CATALOG.filter(f => f.category === category);
}
