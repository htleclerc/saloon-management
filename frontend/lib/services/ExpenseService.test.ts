import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseService } from './ExpenseService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('ExpenseService', () => {
    let service: ExpenseService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getExpenses: vi.fn(),
            getExpense: vi.fn(),
            getExpenseCategories: vi.fn(),
            createExpenseCategory: vi.fn(),
            createExpense: vi.fn(),
            updateExpense: vi.fn(),
            deleteExpense: vi.fn(),
            createInteractionHistory: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new ExpenseService();
    });

    it('should create an expense and log interaction', async () => {
        const expenseData = {
            salonId: 1,
            categoryId: 10,
            amount: 50,
            date: '2026-02-10',
            description: 'Cleaning supplies'
        };

        mockProvider.createExpense.mockResolvedValue({ id: 500, ...expenseData });

        const result = await service.create(expenseData as any);

        expect(mockProvider.createExpense).toHaveBeenCalledWith(expect.objectContaining({
            amount: 50,
            status: 'Pending'
        }));
        expect(mockProvider.createInteractionHistory).toHaveBeenCalledWith(expect.objectContaining({
            entityType: 'expense',
            action: 'created'
        }));
        expect(result.id).toBe(500);
    });

    it('should approve an expense', async () => {
        const expenseId = 500;
        mockProvider.updateExpense.mockResolvedValue({ id: expenseId, status: 'Approved' });

        await service.approve(expenseId);

        expect(mockProvider.updateExpense).toHaveBeenCalledWith(expenseId, expect.objectContaining({
            status: 'Approved'
        }));
        expect(mockProvider.createInteractionHistory).toHaveBeenCalledWith(expect.objectContaining({
            action: 'status_changed_to_Approved'
        }));
    });

    it('should throw error if required fields are missing during creation', async () => {
        const invalidData = {
            salonId: 1,
            amount: 50
            // missing categoryId, date
        };

        await expect(service.create(invalidData as any)).rejects.toThrow();
    });

    it('should fetch categories for a salon', async () => {
        mockProvider.getExpenseCategories.mockResolvedValue([{ id: 1, name: 'Rent' }]);

        const categories = await service.getCategories(1);

        expect(categories).toHaveLength(1);
        expect(categories[0].name).toBe('Rent');
        expect(mockProvider.getExpenseCategories).toHaveBeenCalledWith(1);
    });
});
