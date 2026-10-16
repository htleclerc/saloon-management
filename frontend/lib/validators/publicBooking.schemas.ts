/**
 * Public booking (no account) Zod schemas
 */

import { z } from 'zod';
import { isoDateSchema, timeSchema } from './base.schemas';

/** Phone: at least 8 digits once formatting is removed (international clients) */
const publicPhoneSchema = z.string().trim().refine(
    (val) => val.replace(/\D/g, '').length >= 8,
    { message: 'Phone number must contain at least 8 digits' }
);

export const PublicBookingRequestSchema = z.object({
    serviceIds: z.array(z.number().int().positive()).min(1, 'Select at least one service').max(10),
    addonIds: z.array(z.number().int().positive()).max(20).default([]),
    workerId: z.number().int().positive().optional(),
    date: isoDateSchema,
    time: timeSchema,
    client: z.object({
        firstName: z.string().trim().min(1, 'First name is required').max(100),
        lastName: z.string().trim().min(1, 'Last name is required').max(100),
        phone: publicPhoneSchema,
        email: z.string().trim().email('Invalid email format').max(255).optional().or(z.literal('')),
    }),
    notes: z.string().trim().max(1000).optional(),
    termsAccepted: z.boolean().default(false),
});

export type PublicBookingRequest = z.infer<typeof PublicBookingRequestSchema>;

export const PublicAvailabilityQuerySchema = z.object({
    date: isoDateSchema,
    duration: z.coerce.number().int().min(5).max(24 * 60),
    workerId: z.coerce.number().int().positive().optional(),
});
