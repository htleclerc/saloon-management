/**
 * Payment Configuration
 *
 * Reads PAYMENT_PROVIDERS env var to determine which providers are active.
 * Server-side only — never exposes secrets to the client.
 */

import type { PaymentConfig } from '@/types/payment';

const VALID_PROVIDERS = ['stripe', 'paypal', 'mobilemoney'] as const;

/**
 * Get the list of active payment providers from env
 */
export function getActiveProviders(): string[] {
    const envValue = process.env.PAYMENT_PROVIDERS || '';
    if (!envValue.trim()) return [];

    return envValue
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(p => VALID_PROVIDERS.includes(p as typeof VALID_PROVIDERS[number]));
}

/**
 * Check if the system is in demo mode (no payment providers configured)
 */
export function isDemoMode(): boolean {
    return getActiveProviders().length === 0;
}

/**
 * Get the default (first) active provider
 */
export function getDefaultProvider(): string {
    const providers = getActiveProviders();
    return providers[0] || '';
}

/**
 * Check if a specific provider is active
 */
export function isProviderActive(provider: string): boolean {
    return getActiveProviders().includes(provider.toLowerCase());
}

/**
 * Get public payment config (safe to send to client — no secrets)
 */
export function getPaymentConfig(): PaymentConfig {
    const providers = getActiveProviders();
    return {
        providers,
        defaultProvider: providers[0] || '',
        isDemoMode: providers.length === 0,
    };
}

/**
 * Get Stripe config (server-side only)
 */
export function getStripeConfig() {
    return {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        prices: {
            pro: process.env.STRIPE_PRICE_PRO || '',
            enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
        },
    };
}

/**
 * Get PayPal config (server-side only)
 */
export function getPayPalConfig() {
    return {
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    };
}

/**
 * Get Mobile Money config (server-side only)
 */
export function getMobileMoneyConfig() {
    return {
        apiKey: process.env.MOBILEMONEY_API_KEY || '',
    };
}
