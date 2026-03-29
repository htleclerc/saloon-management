/**
 * Global Feature Flags
 *
 * Manages platform-wide feature toggles stored in localStorage.
 * A feature must be globally enabled AND included in the user's plan to be available.
 */

import { FEATURE_CATALOG } from './featureCatalog';

const STORAGE_KEY = 'global_feature_flags';

export interface GlobalFeatureFlags {
    [featureId: string]: boolean;
}

/**
 * Load global feature flags from localStorage, falling back to catalog defaults
 */
export function getGlobalFeatureFlags(): GlobalFeatureFlags {
    const defaults: GlobalFeatureFlags = {};
    for (const feature of FEATURE_CATALOG) {
        defaults[feature.id] = feature.defaultEnabled;
    }

    if (typeof window === 'undefined') return defaults;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return { ...defaults, ...parsed };
        } catch {
            return defaults;
        }
    }
    return defaults;
}

/**
 * Save global feature flags
 */
export function saveGlobalFeatureFlags(flags: GlobalFeatureFlags): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

/**
 * Reset global feature flags to catalog defaults
 */
export function resetGlobalFeatureFlags(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if a single feature is globally enabled
 */
export function isFeatureGloballyEnabled(featureId: string): boolean {
    const flags = getGlobalFeatureFlags();
    return flags[featureId] ?? false;
}
