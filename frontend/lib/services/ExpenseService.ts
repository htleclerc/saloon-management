/**
 * Expense Service
 * 
 * Business logic for salon expenses
 */

import { BaseService } from './BaseService';
import type { Expense, ExpenseCategory, ExpenseFilters, PaginatedResponse } from '@/types';
import { ExpenseCreateSchema, ExpenseCategoryCreateSchema } from '@/lib/validators';

export class ExpenseService extends BaseService {
    /**
     * Get all expenses for a salon
     */
    async getAll(salonId: number, filters?: ExpenseFilters): Promise<Expense[]> {
        const response = await this.provider.getExpenses(salonId, filters);
        let data = response.data;

        // Client-side status filter (status column may not exist in all DB setups)
        if (filters?.status) {
            data = data.filter(e => e.status === filters.status);
        }

        return data;
    }

    /**
     * Get expense by ID
     */
    async getById(id: number): Promise<Expense | null> {
        return this.provider.getExpense(id);
    }

    /**
     * Get all expense categories for a salon
     */
    async getCategories(salonId: number): Promise<ExpenseCategory[]> {
        return this.provider.getExpenseCategories(salonId);
    }

    /**
     * Create new expense category
     */
    async createCategory(data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ExpenseCategory> {
        // Zod validation
        ExpenseCategoryCreateSchema.parse(data);

        return this.provider.createExpenseCategory({
            ...data,
            isActive: true, // Ensure active by default
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });
    }

    /**
     * Create new expense
     */
    async create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Expense> {
        // Zod validation (covers required fields, amount >= 0, date format)
        ExpenseCreateSchema.parse(data);

        const expense = await this.provider.createExpense({
            ...data,
            status: data.status || 'Pending',
            isActive: true,
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('expense', expense.id, 'created');

        return expense;
    }

    /**
     * Update expense
     */
    async update(id: number, data: Partial<Expense>): Promise<Expense> {
        const expense = await this.provider.updateExpense(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('expense', id, 'updated');

        return expense;
    }

    /**
     * Delete expense
     */
    async delete(id: number): Promise<void> {
        await this.provider.deleteExpense(id);
        await this.logInteraction('expense', id, 'deleted');
    }

    /**
     * Change expense status
     * Note: The expenses table may not have a 'status' column.
     * We archive the expense (isActive = false) and track the action via interaction history.
     */
    async updateStatus(id: number, status: Expense['status']): Promise<Expense> {
        const expense = await this.provider.updateExpense(id, {
            isActive: false,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('expense', id, `status_changed_to_${status}`);

        // Return with the intended status for UI consistency
        return { ...expense, status };
    }

    /**
     * Approve expense (archives it and logs the approval)
     */
    async approve(id: number): Promise<Expense> {
        return this.updateStatus(id, 'Approved');
    }

    /**
     * Reject expense (archives it and logs the rejection)
     */
    async reject(id: number): Promise<Expense> {
        return this.updateStatus(id, 'Rejected');
    }

    /**
     * Get archived (approved/rejected) expenses for history
     */
    async getArchived(salonId: number): Promise<Expense[]> {
        const response = await this.provider.getExpenses(salonId, { isActive: false });
        return response.data;
    }
}

export const expenseService = new ExpenseService();
