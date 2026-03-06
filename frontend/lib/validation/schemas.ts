/**
 * ZOD VALIDATION SCHEMAS
 *
 * Centralized validation schemas for all business entities.
 * Used by services to validate inputs before processing.
 */

import { z } from 'zod';

// ============================================================
// COMMON VALIDATORS
// ============================================================

const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits').regex(/[\d\s\-+()]{10,}/, 'Invalid phone format');
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format');
const positiveNumber = z.number().positive('Must be a positive number');
const nonNegativeNumber = z.number().nonnegative('Must be zero or positive');
const percentage = z.number().min(0, 'Percentage must be >= 0').max(100, 'Percentage must be <= 100');

// ============================================================
// WORKER SCHEMAS
// ============================================================

export const workerCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    name: z.string().min(1, 'Worker name is required').max(200, 'Name too long'),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    color: z.string().min(1, 'Color is required'),
    sharingKey: percentage,
    status: z.enum(['Active', 'Inactive', 'OnLeave']).optional().default('Active'),
    bio: z.string().max(1000, 'Bio too long').optional(),
    specialties: z.array(z.string()).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    birthDate: dateSchema.optional(),
    gender: z.string().optional(),
    employeeRole: z.string().optional(),
    contractType: z.string().optional(),
    hireDate: dateSchema.optional(),
    contractEndDate: dateSchema.optional(),
    baseSalary: nonNegativeNumber.optional(),
    experienceLevel: z.string().optional(),
}).strict().passthrough();

export const workerUpdateSchema = workerCreateSchema.partial().omit({ salonId: true });

// ============================================================
// CLIENT SCHEMAS
// ============================================================

export const clientCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    name: z.string().min(1, 'Client name is required').max(200, 'Name too long'),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    birthDate: dateSchema.optional(),
    notes: z.string().max(2000, 'Notes too long').optional(),
}).strict().passthrough();

export const clientUpdateSchema = clientCreateSchema.partial().omit({ salonId: true });

// ============================================================
// BOOKING SCHEMAS
// ============================================================

export const bookingCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    clientId: z.number().int().positive('Client ID is required'),
    date: dateSchema,
    time: timeSchema,
    duration: z.number().int().positive('Duration must be a positive number of minutes').max(480, 'Duration cannot exceed 8 hours'),
    status: z.enum(['Created', 'Pending', 'Confirmed', 'Started', 'Finished', 'Cancelled', 'PendingApproval', 'Rescheduled', 'Closed']).optional(),
    notes: z.string().max(2000).optional(),
    workerIds: z.array(z.number().int().positive()).min(1, 'At least one worker must be assigned'),
    serviceIds: z.array(z.number().int().positive()).min(1, 'At least one service must be selected'),
    clientName: z.string().optional(),
    clientPhone: z.string().optional(),
    clientEmail: z.string().optional(),
});

export const bookingUpdateSchema = z.object({
    date: dateSchema.optional(),
    time: timeSchema.optional(),
    duration: z.number().int().positive().max(480).optional(),
    status: z.enum(['Created', 'Pending', 'Confirmed', 'Started', 'Finished', 'Cancelled', 'PendingApproval', 'Rescheduled', 'Closed']).optional(),
    notes: z.string().max(2000).optional(),
}).passthrough();

// ============================================================
// INCOME SCHEMAS
// ============================================================

const workerShareSchema = z.object({
    workerId: z.number().int().positive('Worker ID is required'),
    percentage: percentage,
    amount: nonNegativeNumber.optional(),
    tips: nonNegativeNumber.optional(),
});

export const incomeCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    bookingId: z.number().int().positive().optional(),
    bookingIds: z.array(z.number().int().positive()).optional(),
    clientId: z.number().int().positive().optional(),
    clientName: z.string().max(200).optional(),
    amount: positiveNumber,
    discountAmount: nonNegativeNumber.optional(),
    date: dateSchema,
    paymentMethod: z.string().max(50).optional(),
    status: z.enum(['Draft', 'Pending', 'Validated', 'Refused', 'Closed', 'Cancelled']).optional(),
    promoCodeId: z.number().int().positive().optional(),
    workerShares: z.array(workerShareSchema).min(1, 'At least one worker share must be specified'),
    serviceIds: z.array(z.number().int().positive()).optional().default([]),
    products: z.array(z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
    })).optional(),
    notes: z.string().max(2000).optional(),
    tips: nonNegativeNumber.optional(),
}).refine(
    (data) => {
        const totalPercentage = data.workerShares.reduce((sum, s) => sum + s.percentage, 0);
        return Math.abs(totalPercentage - 100) <= 0.01;
    },
    { message: 'Worker shares must sum to 100%', path: ['workerShares'] }
).refine(
    (data) => {
        if (data.discountAmount === undefined) return true;
        return data.discountAmount <= data.amount;
    },
    { message: 'Discount cannot exceed the total amount', path: ['discountAmount'] }
);

export const incomeUpdateSchema = z.object({
    amount: positiveNumber.optional(),
    discountAmount: nonNegativeNumber.optional(),
    date: dateSchema.optional(),
    paymentMethod: z.string().max(50).optional(),
    status: z.enum(['Draft', 'Pending', 'Validated', 'Refused', 'Closed', 'Cancelled']).optional(),
    notes: z.string().max(2000).optional(),
    tips: nonNegativeNumber.optional(),
    workerShares: z.array(workerShareSchema).optional(),
    serviceIds: z.array(z.number().int().positive()).optional(),
    products: z.array(z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
    })).optional(),
}).passthrough();

// ============================================================
// EXPENSE SCHEMAS
// ============================================================

export const expenseCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    categoryId: z.number().int().positive('Category ID is required'),
    amount: positiveNumber,
    date: dateSchema,
    description: z.string().max(1000).optional(),
    paymentMethod: z.string().max(50).optional(),
    receiptUrl: z.string().url('Invalid receipt URL').optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().omit({ salonId: true });

// ============================================================
// SERVICE SCHEMAS
// ============================================================

export const serviceCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    categoryId: z.number().int().positive().optional(),
    name: z.string().min(1, 'Service name is required').max(200, 'Name too long'),
    description: z.string().max(1000).optional(),
    price: nonNegativeNumber,
    duration: z.number().int().positive('Duration must be positive').max(480, 'Duration cannot exceed 8 hours'),
    icon: z.string().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().omit({ salonId: true });

// ============================================================
// PRODUCT SCHEMAS
// ============================================================

export const productCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
    description: z.string().max(1000).optional(),
    price: nonNegativeNumber,
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    category: z.string().max(100).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    sku: z.string().max(50).optional(),
    isLinkedToService: z.boolean().optional().default(false),
    linkedServiceId: z.number().int().positive().optional(),
});

export const productUpdateSchema = productCreateSchema.partial().omit({ salonId: true });

// ============================================================
// REVIEW SCHEMAS
// ============================================================

export const reviewCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    bookingId: z.number().int().positive().optional(),
    clientId: z.number().int().positive().optional(),
    workerId: z.number().int().positive().optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().max(2000).optional(),
});

// ============================================================
// PROMO CODE SCHEMAS
// ============================================================

export const promoCodeCreateSchema = z.object({
    salonId: z.number().int().positive('Salon ID is required'),
    code: z.string().min(3, 'Code must be at least 3 characters').max(30, 'Code too long').toUpperCase(),
    description: z.string().max(500).optional(),
    type: z.enum(['percentage', 'fixed']),
    value: positiveNumber,
    maxUsage: z.number().int().positive().optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    affectWorkerShare: z.boolean().optional().default(false),
}).refine(
    (data) => {
        if (data.type === 'percentage' && data.value > 100) return false;
        return true;
    },
    { message: 'Percentage discount cannot exceed 100%', path: ['value'] }
).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate;
        }
        return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] }
);

// ============================================================
// SALON SCHEMAS
// ============================================================

export const salonCreateSchema = z.object({
    name: z.string().min(1, 'Salon name is required').max(200, 'Name too long'),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().min(1, 'Country is required').max(100),
    phone: phoneSchema.optional().or(z.literal('')),
    email: emailSchema.optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    timezone: z.string().min(1).default('Europe/Paris'),
    currency: z.string().min(1).max(10).default('EUR'),
});

export const salonUpdateSchema = salonCreateSchema.partial();

// ============================================================
// HELPERS
// ============================================================

/**
 * Parse and validate data, returning typed result or throwing descriptive error
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new Error(`Validation failed: ${errors}`);
    }
    return result.data;
}

/**
 * Parse and validate data, returning result object (no throw)
 */
export function safeValidateData<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        };
    }
    return { success: true, data: result.data };
}
