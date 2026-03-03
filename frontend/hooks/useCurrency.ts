import { useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { formatCurrency, CurrencyOptions } from '@/lib/utils/currency';

/**
 * Hook to format currency based on current active salon settings
 */
export const useCurrency = () => {
    const { currentTenant } = useAuth();

    // Default to 'USD' and 'en-US' if no tenant or currency set
    // In a real app, 'currency' would be a field on the Tenant/Salon type. 
    // We'll mock read it from currentTenant if available, or fallback.
    // Assuming Tenant interface might track this, or we fallback to USD.

    // Note: The User requested "devise ins in $ by default".
    // So if nothing specified, we use USD.

    // We might need to extend the Tenant interface later to include currency.
    // For now we assume defaults or try to extract from currentTenant if it has it.

    const currencyCode = (currentTenant as any)?.currency || 'USD';
    const locale = (currentTenant as any)?.locale || 'en-US';

    const format = useCallback((amount: number, options?: CurrencyOptions) => {
        return formatCurrency(amount, currencyCode, locale, options);
    }, [currencyCode, locale]);

    const symbol = useCallback(() => {
        // Simple hack to get symbol
        try {
            return (0).toLocaleString(locale, { style: 'currency', currency: currencyCode }).replace(/\d/g, '').trim().replace(/[.,]/g, '');
        } catch {
            return '$';
        }
    }, [currencyCode, locale]);

    return {
        format,
        symbol,
        currencyCode
    };
};
