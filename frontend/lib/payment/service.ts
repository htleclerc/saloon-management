/**
 * Payment Service - Orchestrator
 *
 * Routes payment operations to the correct provider based on configuration.
 * Falls back to demo mode when no providers are configured.
 */

import type { IPaymentProvider } from '@/types/payment';
import { getActiveProviders, isDemoMode as checkDemoMode, isProviderActive } from './config';
import { StripeProvider } from './providers/stripe';
import { PayPalProvider } from './providers/paypal';
import { MobileMoneyProvider } from './providers/mobilemoney';

// Singleton instances (lazy-loaded)
const providerInstances: Map<string, IPaymentProvider> = new Map();

/**
 * Factory function to create a provider instance
 */
function createProvider(name: string): IPaymentProvider {
    switch (name) {
        case 'stripe':
            return new StripeProvider();
        case 'paypal':
            return new PayPalProvider();
        case 'mobilemoney':
            return new MobileMoneyProvider();
        default:
            throw new Error(`Unknown payment provider: ${name}`);
    }
}

/**
 * Get a payment provider by name.
 * Uses singleton pattern — provider instances are cached after first creation.
 *
 * @param name - Provider name. If omitted, returns the default (first active) provider.
 * @throws Error if provider is not active or no providers are configured.
 */
export function getProvider(name?: string): IPaymentProvider {
    const activeProviders = getActiveProviders();

    if (activeProviders.length === 0) {
        throw new Error('No payment providers configured. Set PAYMENT_PROVIDERS env variable.');
    }

    const providerName = name || activeProviders[0];

    if (!isProviderActive(providerName)) {
        throw new Error(`Payment provider "${providerName}" is not active. Active providers: ${activeProviders.join(', ')}`);
    }

    // Return cached instance or create new one
    if (!providerInstances.has(providerName)) {
        providerInstances.set(providerName, createProvider(providerName));
    }

    return providerInstances.get(providerName)!;
}

/**
 * Get all active provider instances
 */
export function getAllProviders(): IPaymentProvider[] {
    return getActiveProviders().map(name => getProvider(name));
}

/**
 * Check if the system is in demo mode
 */
export function isDemoMode(): boolean {
    return checkDemoMode();
}

/**
 * Get list of active provider names
 */
export { getActiveProviders } from './config';
