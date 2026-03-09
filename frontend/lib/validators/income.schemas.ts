/**
 * Income Zod Schemas
 */

import { z } from 'zod';
import { salonIdSchema, entityIdSchema, isoDateSchema, nonNegativeNumberSchema, percentageSchema } from './base.schemas';

/** Income status enum */
export const IncomeStatusSchema = z.enum([
    'Draft', 'Pending', 'Validated', 'Refused', 'Closed', 'Cancelled'
]);

/** Worker share in income */
export const WorkerShareSchema = z.object({
    workerId: entityIdSchema,
    percentage: percentageSchema,
    amount: z.number().optional(),
    tips: z.number().min(0).optional(),
});

/** Product in income */
export const IncomeProductSchema = z.object({
    productId: entityIdSchema,
    quantity: z.number().int().positive(),
});

/** Income create data — with custom validation for percentage sum */
export const IncomeCreateSchema = z.object({
    salonId: salonIdSchema,
    bookingId: entityIdSchema.optional(),
    bookingIds: z.array(entityIdSchema).optional(),
    clientId: entityIdSchema.optional(),
    clientName: z.string().optional(),
    amount: nonNegativeNumberSchema,
    discountAmount: nonNegativeNumberSchema.optional(),
    date: isoDateSchema,
    paymentMethod: z.string().optional(),
    status: IncomeStatusSchema.optional().default('Draft'),
    promoCodeId: entityIdSchema.optional(),
    workerShares: z.array(WorkerShareSchema).min(1, 'At least one worker share must be specified'),
    serviceIds: z.array(entityIdSchema),
    products: z.array(IncomeProductSchema).optional(),
    notes: z.string().optional(),
    tips: z.number().min(0).optional(),
}).refine(
    (data) => {
        const totalPercentage = data.workerShares.reduce((sum, share) => sum + share.percentage, 0);
        return Math.abs(totalPercentage - 100) <= 0.01;
    },
    { message: 'Worker share percentages must sum to 100%', path: ['workerShares'] }
);

/** Income update data */
export const IncomeUpdateSchema = z.object({
    amount: nonNegativeNumberSchema.optional(),
    discountAmount: nonNegativeNumberSchema.optional(),
    date: isoDateSchema.optional(),
    paymentMethod: z.string().optional(),
    status: IncomeStatusSchema.optional(),
    notes: z.string().optional(),
    tips: z.number().min(0).optional(),
    serviceIds: z.array(entityIdSchema).optional(),
    workerShares: z.array(WorkerShareSchema).optional(),
    products: z.array(IncomeProductSchema).optional(),
    isActive: z.boolean().optional(),
});

export type IncomeCreateInput = z.infer<typeof IncomeCreateSchema>;
