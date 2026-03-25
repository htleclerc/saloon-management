'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaymentConfig, PaymentMethodInfo, InvoiceInfo } from '@/types/payment';

interface UsePaymentReturn {
    config: PaymentConfig | null;
    loading: boolean;
    error: string | null;
    isDemoMode: boolean;
    providers: string[];
    checkout: (params: { planId: string; priceId: string; provider?: string }) => Promise<void>;
    openPortal: (provider?: string) => Promise<void>;
    cancelSubscription: (subscriptionId: string, provider?: string) => Promise<void>;
    getPaymentMethods: (provider?: string) => Promise<PaymentMethodInfo[]>;
    getInvoices: (provider?: string, limit?: number) => Promise<InvoiceInfo[]>;
}

/**
 * Client-side hook for payment operations.
 * Fetches config on mount and provides methods to interact with payment APIs.
 */
export function usePayment(): UsePaymentReturn {
    const [config, setConfig] = useState<PaymentConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch payment config on mount
    useEffect(() => {
        let cancelled = false;
        async function fetchConfig() {
            try {
                const res = await fetch('/api/payment/config');
                if (!res.ok) throw new Error('Failed to fetch payment config');
                const data = await res.json();
                if (!cancelled) {
                    setConfig(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError((err as Error).message);
                    // Fallback to demo mode
                    setConfig({ providers: [], defaultProvider: '', isDemoMode: true });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchConfig();
        return () => { cancelled = true; };
    }, []);

    const checkout = useCallback(async (params: { planId: string; priceId: string; provider?: string }) => {
        setError(null);
        const res = await fetch('/api/payment/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        const data = await res.json();

        if (data.isDemoMode) {
            throw new Error('DEMO_MODE');
        }

        if (!res.ok) {
            throw new Error(data.error || 'Checkout failed');
        }

        // Redirect to checkout URL
        if (data.url) {
            window.location.href = data.url;
        }
    }, []);

    const openPortal = useCallback(async (provider?: string) => {
        setError(null);
        const res = await fetch('/api/payment/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider }),
        });
        const data = await res.json();

        if (data.isDemoMode) {
            throw new Error('DEMO_MODE');
        }

        if (!res.ok) {
            throw new Error(data.error || 'Failed to open portal');
        }

        if (data.url) {
            window.location.href = data.url;
        }
    }, []);

    const cancelSubscription = useCallback(async (subscriptionId: string, provider?: string) => {
        setError(null);
        const res = await fetch('/api/payment/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriptionId, provider }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to cancel subscription');
        }
    }, []);

    const getPaymentMethods = useCallback(async (provider?: string): Promise<PaymentMethodInfo[]> => {
        const params = new URLSearchParams();
        if (provider) params.set('provider', provider);

        const res = await fetch(`/api/payment/methods?${params}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load payment methods');
        }

        return data.methods || [];
    }, []);

    const getInvoices = useCallback(async (provider?: string, limit?: number): Promise<InvoiceInfo[]> => {
        const params = new URLSearchParams();
        if (provider) params.set('provider', provider);
        if (limit) params.set('limit', String(limit));

        const res = await fetch(`/api/payment/invoices?${params}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load invoices');
        }

        return data.invoices || [];
    }, []);

    return {
        config,
        loading,
        error,
        isDemoMode: config?.isDemoMode ?? true,
        providers: config?.providers ?? [],
        checkout,
        openPortal,
        cancelSubscription,
        getPaymentMethods,
        getInvoices,
    };
}
