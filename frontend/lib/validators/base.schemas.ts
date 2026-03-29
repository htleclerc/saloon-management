/**
 * Base Zod Schemas
 *
 * Reusable field validators used across all entity schemas
 */

import { z } from 'zod';

// ============================================
// COMMON FIELD VALIDATORS
// ============================================

/** Email validation */
export const emailSchema = z.string().email('Invalid email format');

/** Optional email — empty string treated as undefined */
export const optionalEmailSchema = z.union([
    z.string().email('Invalid email format'),
    z.literal(''),
]).optional().transform(val => val === '' ? undefined : val);

/** Phone validation (10+ digits after removing formatting) */
export const phoneSchema = z.string().refine(
    (val) => val.replace(/\D/g, '').length >= 10,
    { message: 'Phone number must contain at least 10 digits' }
);

/** Optional phone */
export const optionalPhoneSchema = z.union([
    phoneSchema,
    z.literal(''),
]).optional().transform(val => val === '' ? undefined : val);

/** Positive number (> 0) */
export const positiveNumberSchema = z.number().positive('Must be a positive number');

/** Non-negative number (>= 0) */
export const nonNegativeNumberSchema = z.number().min(0, 'Must be zero or positive');

/** ISO date string (YYYY-MM-DD) */
export const isoDateSchema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
);

/** Time string (HH:mm or HH:mm:ss) */
export const timeSchema = z.string().regex(
    /^\d{2}:\d{2}(:\d{2})?$/,
    'Time must be in HH:mm format'
);

/** Percentage (0–100) */
export const percentageSchema = z.number().min(0, 'Must be at least 0').max(100, 'Must be at most 100');

/** Positive integer */
export const positiveIntSchema = z.number().int().positive('Must be a positive integer');

/** Non-empty string with min length */
export const nameSchema = z.string().min(2, 'Must be at least 2 characters').trim();

/** Salon ID reference */
export const salonIdSchema = z.number().int().positive('Salon ID is required');

/** Generic entity ID */
export const entityIdSchema = z.number().int().positive();

/** Optional URL */
export const optionalUrlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));
