/**
 * Income Service
 * 
 * Business logic for income and revenue management
 */

import { BaseService } from './BaseService';
import type { Income, IncomeWithRelations, IncomeCreateData, IncomeFilters, IncomeWorkerShare, PaginatedResponse } from '@/types';

export class IncomeService extends BaseService {
    async getAll(salonId: number, filters?: IncomeFilters): Promise<Income[]> {
        const response = await this.provider.getIncomes(salonId, filters);
        return response.data;
    }

    /**
     * Get income by ID
     */
    async getById(id: number): Promise<Income | null> {
        return this.provider.getIncome(id);
    }

    /**
     * Get income with relations
     */
    async getWithRelations(id: number): Promise<IncomeWithRelations | null> {
        return this.provider.getIncomeWithRelations(id);
    }

    /**
     * Get income by booking ID
     */
    async getByBooking(bookingId: number): Promise<Income | null> {
        // TODO: Implement getIncomesByBooking in IDataProvider or use filters
        // const incomes = await this.provider.getIncomesByBooking(bookingId); 
        return null;
    }

    /**
     * Create new income
     */
    async create(data: IncomeCreateData): Promise<Income> {
        // Validation
        this.validateRequired(data, ['salonId', 'amount', 'date']);

        if (data.amount < 0) {
            throw new Error('Amount must be positive');
        }

        if (data.discountAmount && data.discountAmount < 0) {
            throw new Error('Discount amount must be positive');
        }

        if (!data.workerShares || data.workerShares.length === 0) {
            throw new Error('At least one worker share must be specified');
        }

        // Validate percentages sum to 100
        const totalPercentage = data.workerShares.reduce((sum, share) => sum + share.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new Error(`Worker shares must sum to 100% (currently ${totalPercentage}%)`);
        }

        // Create income
        const finalAmount = data.amount - (data.discountAmount || 0);
        const income = await this.provider.createIncome({
            ...data,
            status: data.status || 'Draft'
        });

        // Add worker shares
        for (const share of data.workerShares) {
            const workerAmount = (finalAmount * share.percentage) / 100;
            await this.provider.addWorkerToIncome(
                income.id,
                share.workerId,
                workerAmount,
                share.percentage
            );
        }

        // Add services
        if (data.serviceIds) {
            for (const serviceId of data.serviceIds) {
                await this.provider.addServiceToIncome(income.id, serviceId);
            }
        }

        // Add products
        if (data.products) {
            for (const product of data.products) {
                await this.provider.addProductToIncome(income.id, product.productId, product.quantity);
            }
        }

        // Log action
        await this.logInteraction('income', income.id, 'created', `Income of ${income.finalAmount}€ created`);

        return income;
    }

    /**
     * Update income
     */
    async update(id: number, data: Partial<Income>): Promise<Income> {
        const income = await this.provider.updateIncome(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('income', id, 'updated');

        return income;
    }

    /**
     * Delete income
     */
    async delete(id: number): Promise<void> {
        await this.provider.deleteIncome(id);
        await this.logInteraction('income', id, 'deleted');
    }

    /**
     * Change income status
     */
    async updateStatus(id: number, status: Income['status']): Promise<Income> {
        const income = await this.provider.updateIncome(id, {
            status,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('income', id, `status_changed_to_${status}`);

        return income;
    }

    /**
     * Validate income (change status to Validated)
     */
    async validate(id: number): Promise<Income> {
        return this.updateStatus(id, 'Validated');
    }

    /**
     * Refuse income
     */
    async refuse(id: number, reason?: string): Promise<Income> {
        const income = await this.updateStatus(id, 'Refused');

        if (reason) {
            await this.logInteraction('income', id, 'refused', reason);
        }

        return income;
    }

    /**
     * Get worker shares for income
     */
    async getWorkerShares(incomeId: number): Promise<IncomeWorkerShare[]> {
        return this.provider.getIncomeWorkerShares(incomeId);
    }

    /**
     * Calculate worker total revenue
     */
    async getWorkerTotalRevenue(workerId: number, startDate?: string, endDate?: string): Promise<number> {
        const incomes = await this.provider.getIncomesByWorker(workerId);

        let filtered = incomes.filter((i: Income) => i.status === 'Validated');

        if (startDate) {
            filtered = filtered.filter((i: Income) => i.date >= startDate);
        }

        if (endDate) {
            filtered = filtered.filter((i: Income) => i.date <= endDate);
        }

        // Get shares and sum amounts
        let total = 0;
        for (const income of filtered) {
            const shares = await this.provider.getIncomeWorkerShares(income.id);
            const workerShare = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
            if (workerShare) {
                total += workerShare.amount;
            }
        }

        return total;
    }

    /**
     * Get worker transactions (paginated)
     */
    async getWorkerTransactions(workerId: number, page: number = 1, limit: number = 10, filters?: { search?: string, year?: number, month?: number }): Promise<PaginatedResponse<{ id: number, date: string, client: string, service: string, amount: number, status: Income['status'] }>> {
        // Since provider.getIncomesByWorker doesn't support pagination params in the signature shown in earlier views,
        // we might need to filter manually or use getIncomes with workerId filter if supported by provider
        // Based on types/index.ts, IncomeFilters has workerId.

        // We need salonId for getIncomes. 
        // If we don't have salonId, we might need a specific provider method
        // Using getIncomesByWorker from provider which likely returns all
        const allIncomes = await this.provider.getIncomesByWorker(workerId);

        // Apply text filter if any
        let filtered = allIncomes;
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((i: Income) =>
                (i.clientName || '').toLowerCase().includes(searchLower) ||
                (i.paymentMethod || '').toLowerCase().includes(searchLower)
            );
        }

        // Apply date filter
        // Apply date filter
        if (filters?.year) {
            const yearStr = filters.year.toString();
            filtered = filtered.filter((i: Income) => i.date.startsWith(yearStr));
        }
        if (filters?.month) {
            const m = filters.month.toString().padStart(2, '0');
            filtered = filtered.filter((i: Income) => {
                const parts = i.date.split('-');
                return parts[1] === m;
            });
        }

        // Pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit).map((inc: Income) => ({
            id: inc.id,
            date: inc.date,
            client: inc.clientName || 'Unknown',
            service: 'Service', // Placeholder as we'd need relation
            amount: inc.finalAmount,
            status: inc.status
        }));

        return {
            data,
            total,
            page,
            perPage: limit,
            totalPages
        };
    }

    /**
     * Get worker performance stats
     */
    async getWorkerPerformanceStats(workerId: number, year: number) {
        // Fetch all validated incomes for the year
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const yearStr = year.toString();

        const validIncomes = incomes.filter((i: Income) =>
            i.date.startsWith(yearStr)
        );

        // We need to group by week, month, year
        // This is a simplified implementation

        // Helper to get week number
        const getWeek = (date: Date) => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
        };

        interface PeriodStats {
            id: number;
            period: string;
            services: number;
            clients: number;
            income: number;
            salary: number;
            status: string;
        }

        const weeks = new Map<number, PeriodStats>();
        const months = new Map<string, PeriodStats>();

        // Initialize aggregation objects
        validIncomes.forEach((inc: Income) => {
            const date = new Date(inc.date);
            const weekNum = getWeek(date);
            const monthName = date.toLocaleString('default', { month: 'long' });

            // Weekly
            if (!weeks.has(weekNum)) {
                weeks.set(weekNum, { id: weekNum, period: `Week ${weekNum}`, services: 0, clients: 0, income: 0, salary: 0, status: 'Completed' });
            }
            const w = weeks.get(weekNum)!;
            w.services++; // Approx, per income
            w.clients++;
            w.income += inc.finalAmount;
            // Salary approx (using default 50% for now or need worker share calculation)
            // Ideally we fetch shares. For performance, we'll estimate or fetch shares if needed.
            // Let's assume we can't easily get shares without N+1 queries here.

            // Monthly
            if (!months.has(monthName)) {
                months.set(monthName, { id: date.getMonth(), period: monthName, services: 0, clients: 0, income: 0, salary: 0, status: 'Completed' });
            }
            const m = months.get(monthName)!;
            m.services++;
            m.clients++;
            m.income += inc.finalAmount;
        });

        // Convert Maps to Arrays and sort
        const weekData = Array.from(weeks.values()).sort((a, b) => b.id - a.id);
        const monthData = Array.from(months.values()).sort((a, b) => b.id - a.id); // Sort logic might need adjustment

        // Year aggregate
        const yearTotal = validIncomes.reduce((acc: number, curr: Income) => acc + curr.finalAmount, 0);
        const yearData = [{
            id: 1,
            period: yearStr,
            services: validIncomes.length,
            clients: validIncomes.length,
            income: yearTotal,
            salary: 0, // Fill later
            status: 'Completed'
        }];

        return {
            week: weekData,
            month: monthData,
            year: yearData
        };
    }
}

// Export singleton instance
export const incomeService = new IncomeService();
