import { CSSProperties } from 'react';
import { useTheme } from '@/context/ThemeProvider';

/**
 * Custom hook for generating KPI card styles based on the current design type
 * 
 * Design Types:
 * - minimal: Solid colors, no gradients
 * - modern: Subtle same-color gradients with shadows
 * - gradient: Full gradients mixing primary and secondary colors
 * - glassmorphism: Same as gradient for now
 */
export function useKpiCardStyle() {
    const { theme } = useTheme();

    /**
     * Returns the appropriate style object for a KPI card based on its index
     * Cards alternate between primary and secondary colors
     * 
     * @param index - The card index (0-based) for alternating colors
     * @returns CSSProperties object to apply to the card
     */
    const getCardStyle = (index: number): CSSProperties => {
        const isPrimary = index % 2 === 0;
        const colorVar = isPrimary ? 'primary' : 'secondary';

        switch (theme.designType) {
            case 'minimal':
                // Flat, solid colors - no gradients
                return {
                    backgroundColor: `var(--color-${colorVar})`,
                };

            case 'modern':
                // Subtle gradient using the same color (light to slightly darker)
                // This creates depth without color mixing
                return {
                    background: `linear-gradient(135deg, var(--color-${colorVar}) 0%, var(--color-${colorVar}) 100%)`,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                };

            case 'gradient':
            case 'glassmorphism':
                // Full gradient mixing primary and secondary colors
                return {
                    background: isPrimary
                        ? 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))'
                        : 'linear-gradient(to bottom right, var(--color-secondary), var(--color-primary))',
                };

            default:
                // Fallback to gradient mode
                return {
                    background: isPrimary
                        ? 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))'
                        : 'linear-gradient(to bottom right, var(--color-secondary), var(--color-primary))',
                };
        }
    };

    return { getCardStyle };
}
