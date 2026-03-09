/**
 * Client Zod Schemas
 */

import { z } from 'zod';
import { nameSchema, salonIdSchema, optionalEmailSchema, optionalPhoneSchema } from './base.schemas';

/** Client create */
export const ClientCreateSchema = z.object({
    salonId: salonIdSchema,
    name: nameSchema,
    email: optionalEmailSchema,
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    birthDate: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
});

/** Client update */
export const ClientUpdateSchema = z.object({
    name: nameSchema.optional(),
    email: optionalEmailSchema,
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    birthDate: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type ClientCreateInput = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>;
