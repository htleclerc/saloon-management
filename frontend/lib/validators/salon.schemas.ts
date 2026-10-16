/**
 * Salon Zod Schemas
 */

import { z } from 'zod';
import { emailSchema, phoneSchema, nameSchema } from './base.schemas';

/** Opening hours for a single day */
export const OpeningHoursSchema = z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isOpen: z.boolean(),
    openTime: z.string(),
    closeTime: z.string(),
});

/** Salon details (onboarding) */
export const SalonDetailsSchema = z.object({
    name: nameSchema,
    address: z.string().min(1, 'Address is required'),
    phone: phoneSchema,
    email: emailSchema,
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    logo: z.string().optional(),
    openingHours: z.array(OpeningHoursSchema),
    timezone: z.string().min(1, 'Timezone is required'),
});

/** Salon create */
export const SalonCreateSchema = z.object({
    name: nameSchema,
    slug: z.string().min(1, 'Slug is required'),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('FR'),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    timezone: z.string().default('Europe/Paris'),
    currency: z.string().default('EUR'),
    subscriptionPlan: z.string().default('free'),
    subscriptionStatus: z.string().default('active'),
    isActive: z.boolean().default(true),
});

/** Salon update */
export const SalonUpdateSchema = SalonCreateSchema.partial();

/** Online booking settings (deposit rule and intake terms) */
export const SalonBookingSettingsSchema = z.object({
    depositType: z.enum(['none', 'fixed', 'percent']).optional(),
    depositValue: z.number().min(0, 'Deposit value must be zero or positive').optional(),
    bookingTerms: z.array(z.string().trim().min(1, 'A booking term cannot be empty').max(500)).max(20).optional(),
}).refine(
    (s) => s.depositType !== 'percent' || s.depositValue === undefined || s.depositValue <= 100,
    { message: 'A percentage deposit cannot exceed 100', path: ['depositValue'] }
);

export type SalonDetailsInput = z.infer<typeof SalonDetailsSchema>;
export type SalonCreateInput = z.infer<typeof SalonCreateSchema>;
