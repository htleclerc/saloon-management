/**
 * Base Service Class
 * 
 * Provides common functionality for all business services
 */

import { DataProviderFactory } from '../providers/types';
import { useDataMode } from '@/context/DataModeProvider';

export abstract class BaseService {
    protected getProvider() {
        const mode = (typeof window !== 'undefined'
            ? localStorage.getItem('saloon-data-mode')
            : 'demo-local') as 'demo-local' | 'demo-supabase' | 'normal' || 'demo-local';
        return DataProviderFactory.create(mode);
    }

    protected get provider(): any {
        return this.getProvider();
    }

    protected validateRequired(data: any, fields: string[]) {
        for (const field of fields) {
            if (data[field] === undefined || data[field] === null || (typeof data[field] === 'string' && data[field].trim() === '')) {
                throw new Error(`${field} is required`);
            }
        }
    }

    protected validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    protected validatePhone(phone: string): boolean {
        // Basic phone validation (at least 10 digits)
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }

    protected getCurrentUser(): string {
        // Placeholder: should return current authenticated user's code or ID
        return 'SYSTEM';
    }

    protected async logInteraction(entityType: string, entityId: number, action: string, comment?: string) {
        try {
            const provider = this.getProvider();
            await provider.createInteractionHistory({
                entityType,
                entityId,
                userCode: this.getCurrentUser(),
                action,
                comment: comment || undefined
            });
        } catch (error) {
            console.error('Failed to log interaction:', error);
            // Don't throw - logging shouldn't crash the main operation
        }
    }

    protected async handleError<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get date range for common periods
     */
    protected getDateRange(period: 'last7days' | 'lastMonth' | 'last6months' | 'thisYear' | 'thisMonth'): { startDate: string; endDate: string } {
        const now = new Date();
        let startDate: Date;
        const endDate = new Date(now);

        switch (period) {
            case 'last7days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 6);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate.setDate(0); // Last day of previous month
                break;
            case 'last6months':
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * Aggregate data by time period
     */
    protected aggregateByPeriod<T extends { date: string }>(
        data: T[],
        groupBy: 'day' | 'week' | 'month' | 'year'
    ): Map<string, T[]> {
        const groups = new Map<string, T[]>();

        data.forEach(item => {
            let key: string;
            const date = new Date(item.date);

            switch (groupBy) {
                case 'day':
                    key = item.date;
                    break;
                case 'month':
                    key = item.date.substring(0, 7); // YYYY-MM
                    break;
                case 'year':
                    key = item.date.substring(0, 4); // YYYY
                    break;
                case 'week':
                    // ISO week number
                    const weekNum = this.getWeekNumber(date);
                    key = `${date.getFullYear()}-W${weekNum}`;
                    break;
                default:
                    key = item.date;
            }

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        });

        return groups;
    }

    /**
     * Get ISO week number
     */
    private getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * Calculate percentage distribution
     */
    protected calculatePercentageDistribution<T>(
        data: T[],
        valueField: keyof T
    ): Array<{ item: T; percentage: number }> {
        const total = data.reduce((sum, item) => {
            const value = item[valueField];
            return sum + (typeof value === 'number' ? value : 0);
        }, 0);

        if (total === 0) return data.map(item => ({ item, percentage: 0 }));

        return data.map(item => {
            const value = item[valueField];
            const numValue = typeof value === 'number' ? value : 0;
            return {
                item,
                percentage: Math.round((numValue / total) * 100)
            };
        });
    }
}
