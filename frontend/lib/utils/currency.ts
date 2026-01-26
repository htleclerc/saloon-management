import { Salon } from '@/types';

/**
 * Interface for currency formatting options
 */
export interface CurrencyOptions {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

/**
 * Format a number as a currency string based on salon settings
 * @param amount The numerical amount to format
 * @param currencyCode The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param locale The locale string (e.g., 'en-US', 'fr-FR')
 * @param options Additional formatting options
 * @returns The formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'USD', // Default to USD as requested
    locale: string = 'en-US',
    options: CurrencyOptions = {}
): string => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: options.minimumFractionDigits ?? 2,
            maximumFractionDigits: options.maximumFractionDigits ?? 2,
        }).format(amount);
    } catch (error) {
        console.warn(`Error formatting currency: ${currencyCode}. Falling back to basic format.`, error);
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

/**
 * Helper to get currency symbol for manual construction if needed
 */
export const getCurrencySymbol = (currencyCode: string = 'USD', locale: string = 'en-US'): string => {
    try {
        return (0).toLocaleString(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).replace(/\d/g, '').trim();
    } catch {
        return currencyCode === 'EUR' ? '€' : '$';
    }
};
