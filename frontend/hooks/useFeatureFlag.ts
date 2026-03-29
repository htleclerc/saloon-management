/**
 * Feature Flag Hook
 *
 * Checks if a feature is available based on:
 * 1. Global feature flags (super admin toggle)
 * 2. Plan-level feature assignment (plan includes the feature ID)
 *
 * Both must be true for a feature to be available.
 */

import { useAuth } from '@/context/AuthProvider';
import { getPlanConfig, hasPlanFeatureById } from '@/lib/utils/subscriptionHelpers';
import { isFeatureGloballyEnabled } from '@/lib/data/featureFlags';

export function useFeatureFlag() {
    const { currentTenant, isSuperAdmin } = useAuth();

    const isFeatureAvailable = (featureId: string): boolean => {
        // Super admin always has access
        if (isSuperAdmin) return true;

        // 1. Check global flag
        if (!isFeatureGloballyEnabled(featureId)) return false;

        // 2. Check plan-level
        const planId = currentTenant?.subscriptionPlan || 'free';
        const planConfig = getPlanConfig(planId);
        if (!planConfig) return false;

        return hasPlanFeatureById(planConfig, featureId);
    };

    return { isFeatureAvailable };
}
