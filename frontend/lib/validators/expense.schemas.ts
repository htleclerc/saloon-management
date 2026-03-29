/**
 * Expense Zod Schemas
 */

import { z } from 'zod';
import { salonIdSchema, entityIdSchema, isoDateSchema, nonNegativeNumberSchema } from './base.schemas';

/** Expense status enum */
export const ExpenseStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

/** Expense create */
export const ExpenseCreateSchema = z.object({
    salonId: salonIdSchema,
    categoryId: entityIdSchema,
    amount: nonNegativeNumberSchema,
    date: isoDateSchema,
    description: z.string().optional(),
    paymentMethod: z.string().optional(),
    receiptUrl: z.string().optional(),
    status: ExpenseStatusSchema.optional().default('Pending'),
    isActive: z.boolean().default(true),
});

/** Expense update */
export const ExpenseUpdateSchema = ExpenseCreateSchema.partial();

/** Expense category create */
export const ExpenseCategoryCreateSchema = z.object({
    salonId: salonIdSchema,
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().default(true),
});

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>;
