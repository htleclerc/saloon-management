/**
 * Income Service
 * 
 * Business logic for income and revenue management
 */

import { BaseService } from './BaseService';
import type { Income, IncomeWithRelations, IncomeCreateData, IncomeFilters, IncomeWorkerShare, PaginatedResponse } from '@/types';
import { IncomeCreateSchema } from '@/lib/validators';

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

    async getHistory(id: number) {
        return this.getInteractionHistory('income', id);
    }

    /**
     * Add comment to income
     */
    async addComment(id: number, text: string, userCode: string) {
        return this.provider.createComment({
            entityType: 'income',
            entityId: id,
            text,
            userCode,
            salonId: 0 // Only req for some implementations, generic
        });
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
        const allIncomes = await this.provider.getIncomes(0, { limit: 1000 });
        return allIncomes.data.find((i: Income) => i.bookingId === bookingId || i.bookingIds?.includes(bookingId)) || null;
    }

    /**
     * Create new income
     */
    async create(data: IncomeCreateData): Promise<Income> {
        // Zod validation (covers required fields, amount >= 0, discount >= 0, workerShares min(1), percentage sum)
        IncomeCreateSchema.parse(data);

        // Create income
        const finalAmount = data.amount - (data.discountAmount || 0);
        const income = await this.provider.createIncome({
            ...data,
            status: data.status || 'Draft'
        });

        // Add worker shares
        income.workerIds = [];
        for (const share of data.workerShares) {
            const workerAmount = share.amount !== undefined ? share.amount : (finalAmount * share.percentage) / 100;
            const workerTips = share.tips || 0;
            await this.provider.addWorkerToIncome(
                income.id,
                share.workerId,
                workerAmount,
                share.percentage,
                workerTips
            );
            income.workerIds.push(share.workerId);
        }

        // Add services
        if (data.serviceIds) {
            income.serviceIds = [];
            for (const serviceId of data.serviceIds) {
                await this.provider.addServiceToIncome(income.id, serviceId);
                income.serviceIds.push(serviceId);
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
    async update(id: number, data: Partial<Income> & { workerShares?: IncomeWorkerShare[]; products?: Array<{ productId: number; quantity: number }> }): Promise<Income> {
        const current = await this.getById(id);
        if (!current) throw new Error('Income not found');

        // Block updates for Validated records unless status is changing to Refused or Draft
        if (current.status === 'Validated' && data.status !== 'Refused' && data.status !== 'Draft') {
            throw new Error('Validated income cannot be modified. Contest it first.');
        }

        // If updating a Refused record, force it back to Pending/Draft if not specified
        if (current.status === 'Refused' && !data.status) {
            data.status = 'Pending';
        }

        // Recalculate finalAmount if base values change
        if (data.amount !== undefined || data.discountAmount !== undefined) {
            const amount = data.amount !== undefined ? data.amount : current.amount;
            const discount = data.discountAmount !== undefined ? data.discountAmount : current.discountAmount;
            (data as Partial<Income> & { finalAmount?: number }).finalAmount = amount - discount;
        }

        const income = await this.provider.updateIncome(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        // Sync Junctions if provided
        if (data.serviceIds || data.workerShares || data.products) {
            await this.provider.clearIncomeJunctions(id);

            const finalAmount = income.finalAmount;

            // Re-add workers
            if (data.workerShares) {
                income.workerIds = [];
                for (const share of data.workerShares) {
                    const workerAmount = share.amount !== undefined ? share.amount : (finalAmount * share.percentage) / 100;
                    await this.provider.addWorkerToIncome(
                        id,
                        share.workerId,
                        workerAmount,
                        share.percentage,
                        share.tips || 0
                    );
                    income.workerIds.push(share.workerId);
                }
            }

            // Re-add services
            if (data.serviceIds) {
                income.serviceIds = [];
                for (const serviceId of data.serviceIds) {
                    await this.provider.addServiceToIncome(id, serviceId);
                    income.serviceIds.push(serviceId);
                }
            }

            // Re-add products
            if (data.products) {
                for (const product of data.products) {
                    await this.provider.addProductToIncome(id, product.productId, product.quantity);
                }
            }
        }

        await this.logInteraction('income', id, 'updated');
        return income;
    }

    /**
     * Delete income
     */
    async delete(id: number): Promise<void> {
        const income = await this.getById(id);
        if (!income) return;

        if (income.status === 'Draft') {
            await this.provider.deleteIncome(id);
            await this.logInteraction('income', id, 'deleted');
        } else {
            await this.provider.updateIncome(id, { isActive: false });
            await this.logInteraction('income', id, 'archived');
        }
    }

    /**
     * Contest income (change status to Refused)
     */
    async contest(id: number): Promise<Income> {
        return this.updateStatus(id, 'Refused');
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
            service: inc.serviceNames?.[0] || 'Unknown',
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
        // Fetch all validated incomes with relations for the worker
        // This is more expensive but accurate for tips
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const yearStr = year.toString();

        const validIncomes = incomes.filter((i: Income) =>
            i.status === 'Validated' && i.date.startsWith(yearStr)
        );

        // We need to fetch worker shares for each income to get the explicit tips
        const incomesWithShares = await Promise.all(validIncomes.map(async (inc: Income) => {
            const shares = await this.provider.getIncomeWorkerShares(inc.id);
            const workerShare = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
            return {
                ...inc,
                workerTips: workerShare?.tips || 0,
                workerSalary: workerShare?.amount || 0
            };
        }));

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
            tips: number;
            status: string;
        }

        const weeks = new Map<number, PeriodStats>();
        const months = new Map<string, PeriodStats>();

        incomesWithShares.forEach((inc) => {
            const date = new Date(inc.date);
            const weekNum = getWeek(date);
            const monthName = date.toLocaleString('default', { month: 'long' });

            // Weekly
            if (!weeks.has(weekNum)) {
                weeks.set(weekNum, { id: weekNum, period: `Week ${weekNum}`, services: 0, clients: 0, income: 0, salary: 0, tips: 0, status: 'Validated' });
            }
            const w = weeks.get(weekNum)!;
            w.services++;
            w.clients++;
            w.income += inc.finalAmount;
            w.salary += inc.workerSalary;
            w.tips += inc.workerTips;

            // Monthly
            if (!months.has(monthName)) {
                months.set(monthName, { id: date.getMonth(), period: monthName, services: 0, clients: 0, income: 0, salary: 0, tips: 0, status: 'Validated' });
            }
            const m = months.get(monthName)!;
            m.services++;
            m.clients++;
            m.income += inc.finalAmount;
            m.salary += inc.workerSalary;
            m.tips += inc.workerTips;
        });

        const weekData = Array.from(weeks.values()).sort((a, b) => b.id - a.id);
        const monthData = Array.from(months.values()).sort((a, b) => b.id - a.id);

        const yearTotal = incomesWithShares.reduce((acc, curr) => acc + curr.finalAmount, 0);
        const yearSalary = incomesWithShares.reduce((acc, curr) => acc + curr.workerSalary, 0);
        const yearTips = incomesWithShares.reduce((acc, curr) => acc + curr.workerTips, 0);

        const yearData = [{
            id: 1,
            period: yearStr,
            services: validIncomes.length,
            clients: validIncomes.length,
            income: yearTotal,
            salary: yearSalary,
            tips: yearTips,
            status: 'Validated'
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
