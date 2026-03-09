/**
 * Service & Product Zod Schemas
 */

import { z } from 'zod';
import { nameSchema, salonIdSchema, nonNegativeNumberSchema, positiveIntSchema } from './base.schemas';

/** Service create */
export const ServiceCreateSchema = z.object({
    salonId: salonIdSchema,
    categoryId: z.number().int().optional(),
    name: nameSchema,
    description: z.string().optional(),
    price: nonNegativeNumberSchema,
    duration: positiveIntSchema,
    icon: z.string().optional(),
    isActive: z.boolean().default(true),
});

/** Service update */
export const ServiceUpdateSchema = z.object({
    name: nameSchema.optional(),
    description: z.string().optional(),
    categoryId: z.number().int().optional(),
    price: nonNegativeNumberSchema.optional(),
    duration: positiveIntSchema.optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
});

/** Product create */
export const ProductCreateSchema = z.object({
    salonId: salonIdSchema,
    name: nameSchema,
    description: z.string().optional(),
    price: nonNegativeNumberSchema,
    stock: z.number().int().min(0, 'Stock must be zero or positive'),
    category: z.string().optional(),
    imageUrl: z.string().optional(),
    sku: z.string().optional(),
    isLinkedToService: z.boolean().default(false),
    linkedServiceId: z.number().int().optional(),
    isActive: z.boolean().default(true),
});

/** Product update */
export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
