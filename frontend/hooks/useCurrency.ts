import { useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { formatCurrency, getCurrencySymbol, CurrencyOptions } from '@/lib/utils/currency';

/**
 * Hook to format currency based on current active salon settings.
 * Reads currency & locale from the Tenant context (mapped from Salon.currency).
 */
export const useCurrency = () => {
    const { currentTenant } = useAuth();

    const currencyCode = currentTenant?.currency || 'EUR';
    const locale = currentTenant?.locale || 'fr-FR';

    const format = useCallback((amount: number, options?: CurrencyOptions) => {
        return formatCurrency(amount, currencyCode, locale, options);
    }, [currencyCode, locale]);

    const symbol = useCallback(() => {
        return getCurrencySymbol(currencyCode, locale);
    }, [currencyCode, locale]);

    return {
        format,
        symbol,
        currencyCode
    };
};
