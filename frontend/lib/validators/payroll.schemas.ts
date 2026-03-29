/**
 * Payroll Zod Schemas
 */

import { z } from 'zod';
import { salonIdSchema, entityIdSchema, isoDateSchema, nonNegativeNumberSchema } from './base.schemas';

/** Payment status enum */
export const PaymentStatusSchema = z.enum([
    'pending', 'approved', 'rejected', 'disputed', 'auto_approved', 'cancelled', 'refunded'
]);

/** Payment record create */
export const PaymentRecordSchema = z.object({
    workerId: entityIdSchema,
    salonId: salonIdSchema,
    paymentMonth: isoDateSchema,
    baseSalary: nonNegativeNumberSchema,
    commission: nonNegativeNumberSchema,
    tips: nonNegativeNumberSchema,
    totalAmount: nonNegativeNumberSchema,
    paidAmount: nonNegativeNumberSchema,
    paidDate: isoDateSchema,
    paidBy: entityIdSchema.optional(),
    notes: z.string().optional(),
    status: PaymentStatusSchema.optional().default('approved'),
});

/** Payment update */
export const PaymentUpdateSchema = z.object({
    paidAmount: nonNegativeNumberSchema.optional(),
    paidDate: isoDateSchema.optional(),
    notes: z.string().optional(),
    status: PaymentStatusSchema.optional(),
    lastStatusChangedBy: entityIdSchema.optional(),
});

/** Payment status update */
export const PaymentStatusUpdateSchema = z.object({
    paymentId: entityIdSchema,
    status: PaymentStatusSchema,
    userId: entityIdSchema,
    reason: z.string().optional(),
});

/** Rejection — reason is mandatory */
export const PaymentRejectionSchema = z.object({
    paymentId: entityIdSchema,
    workerId: entityIdSchema,
    reason: z.string().min(1, 'Rejection reason is required').trim(),
});

/** Dispute — note is mandatory */
export const PaymentDisputeSchema = z.object({
    paymentId: entityIdSchema,
    workerId: entityIdSchema,
    disputeNote: z.string().min(1, 'Dispute note is required').trim(),
});

export type PaymentRecordInput = z.infer<typeof PaymentRecordSchema>;
export type PaymentStatusUpdateInput = z.infer<typeof PaymentStatusUpdateSchema>;
