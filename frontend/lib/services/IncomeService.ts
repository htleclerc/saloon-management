/**
 * Income Service
 *
 * Business logic for income and revenue management
 * Uses Zod validation for all inputs
 */

import { BaseService } from './BaseService';
import { incomeCreateSchema, incomeUpdateSchema, validateData } from '../validation/schemas';
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
            userCode
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
     * Searches incomes linked to a specific booking
     */
    async getByBooking(bookingId: number): Promise<Income | null> {
        try {
            // Strategy 1: Use the bookingId field on Income
            // We need a salonId-agnostic way. Try to get the booking first.
            const booking = await this.provider.getBooking(bookingId);
            if (!booking) return null;

            // Use filters to find incomes for this salon with this bookingId
            const response = await this.provider.getIncomes(booking.salonId, {
                isActive: true
            });

            // Search for income linked to this booking
            const matchingIncome = response.data.find(
                (income: Income) => income.bookingId === bookingId ||
                    (income.bookingIds && income.bookingIds.includes(bookingId))
            );

            return matchingIncome || null;
        } catch (error) {
            console.error(`Failed to get income for booking ${bookingId}:`, error);
            return null;
        }
    }

    /**
     * Create new income with Zod validation
     */
    async create(data: IncomeCreateData): Promise<Income> {
        // Zod validation (validates amount, percentages sum, discount <= amount, etc.)
        const validated = validateData(incomeCreateSchema, data);

        // Create income
        const finalAmount = validated.amount - (validated.discountAmount || 0);
        const income = await this.provider.createIncome({
            ...validated,
            status: validated.status || 'Draft'
        });

        // Add worker shares
        income.workerIds = [];
        for (const share of validated.workerShares) {
            const workerAmount = share.amount !== undefined ? share.amount : (finalAmount * share.percentage) / 100;
            const workerTips = share.tips || 0;
            await this.provider.addWorkerToIncome(
                income.id,
                share.workerId,
                workerAmount,
                share.percentage
            );
            income.workerIds.push(share.workerId);
        }

        // Add services
        if (validated.serviceIds) {
            income.serviceIds = [];
            for (const serviceId of validated.serviceIds) {
                await this.provider.addServiceToIncome(income.id, serviceId);
                income.serviceIds.push(serviceId);
            }
        }

        // Add products
        if (validated.products) {
            for (const product of validated.products) {
                await this.provider.addProductToIncome(income.id, product.productId, product.quantity);
            }
        }

        // Log action
        await this.logInteraction('income', income.id, 'created', `Income of ${income.finalAmount}€ created`);

        return income;
    }

    /**
     * Update income with Zod validation
     */
    async update(id: number, data: Partial<Income> & { workerShares?: IncomeWorkerShare[] }): Promise<Income> {
        const current = await this.getById(id);
        if (!current) throw new Error('Income not found');

        // Block updates for Validated records unless status is changing to Refused or Draft
        if (current.status === 'Validated' && data.status !== 'Refused' && data.status !== 'Draft') {
            throw new Error('Validated income cannot be modified. Contest it first.');
        }

        // Validate update fields with Zod
        validateData(incomeUpdateSchema, data);

        // If updating a Refused record, force it back to Pending/Draft if not specified
        if (current.status === 'Refused' && !data.status) {
            data.status = 'Pending';
        }

        // Recalculate finalAmount if base values change
        if (data.amount !== undefined || data.discountAmount !== undefined) {
            const amount = data.amount !== undefined ? data.amount : current.amount;
            const discount = data.discountAmount !== undefined ? data.discountAmount : current.discountAmount;
            (data as Record<string, unknown>).finalAmount = amount - discount;
        }

        const income = await this.provider.updateIncome(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        // Sync Junctions if provided
        if (data.serviceIds || data.workerShares || (data as Record<string, unknown>).products) {
            await this.provider.clearIncomeJunctions(id);

            const finalAmount = income.finalAmount;

            // Re-add workers
            if (data.workerShares) {
                income.workerIds = [];
                for (const share of data.workerShares) {
                    const shareAmount = share.amount !== undefined
                        ? share.amount
                        : (finalAmount * share.percentage) / 100;
                    await this.provider.addWorkerToIncome(
                        id,
                        share.workerId,
                        shareAmount,
                        share.percentage
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
            const products = (data as Record<string, unknown>).products as Array<{ productId: number; quantity: number }> | undefined;
            if (products) {
                for (const product of products) {
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
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const yearStr = year.toString();

        const validIncomes = incomes.filter((i: Income) =>
            i.status === 'Validated' && i.date.startsWith(yearStr)
        );

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
