/**
 * Booking Zod Schemas
 */

import { z } from 'zod';
import { salonIdSchema, entityIdSchema, isoDateSchema, timeSchema, positiveIntSchema } from './base.schemas';

/** Booking status enum */
export const BookingStatusSchema = z.enum([
    'Created', 'Pending', 'Confirmed', 'Started', 'Finished',
    'Cancelled', 'PendingApproval', 'Rescheduled', 'Closed'
]);

/** Booking create data */
export const BookingCreateSchema = z.object({
    salonId: salonIdSchema,
    clientId: entityIdSchema,
    date: isoDateSchema,
    time: timeSchema,
    duration: positiveIntSchema,
    status: BookingStatusSchema.optional().default('Pending'),
    notes: z.string().optional(),
    workerIds: z.array(z.number().int().positive()),
    serviceIds: z.array(z.number().int().positive()).min(1, 'At least one service must be selected'),
    clientName: z.string().optional(),
    clientPhone: z.string().optional(),
    clientEmail: z.string().optional(),
});

/** Booking update */
export const BookingUpdateSchema = z.object({
    date: isoDateSchema.optional(),
    time: timeSchema.optional(),
    duration: positiveIntSchema.optional(),
    status: BookingStatusSchema.optional(),
    notes: z.string().optional(),
    isSensitive: z.boolean().optional(),
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;
