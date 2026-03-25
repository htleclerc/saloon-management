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
 * @param currencyCode The ISO 4217 currency code (e.g., 'EUR', 'USD')
 * @param locale The locale string (e.g., 'fr-FR', 'en-US')
 * @param options Additional formatting options
 * @returns The formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'EUR',
    locale: string = 'fr-FR',
    options: CurrencyOptions = {}
): string => {
    // Safety check for NaN or invalid numbers
    const safeAmount = (typeof amount !== 'number' || isNaN(amount)) ? 0 : amount;

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: options.minimumFractionDigits ?? 0,
            maximumFractionDigits: options.maximumFractionDigits ?? 0,
        }).format(safeAmount);
    } catch (error) {
        console.warn(`Error formatting currency: ${currencyCode}. Falling back to basic format.`, error);
        return `${currencyCode} ${safeAmount.toFixed(0)}`;
    }
};

/**
 * Helper to get currency symbol for manual construction if needed
 */
export const getCurrencySymbol = (currencyCode: string = 'EUR', locale: string = 'fr-FR'): string => {
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
