/**
 * Onboarding Validators
 *
 * Wrappers around Zod schemas that return the legacy { isValid, errors } format
 * for backward compatibility with onboarding UI components.
 */

import type { SalonDetails, Service, Product, Client } from '@/types';
import { SalonDetailsSchema } from '@/lib/validators/salon.schemas';
import { ServiceCreateSchema } from '@/lib/validators/service.schemas';
import { ProductCreateSchema } from '@/lib/validators/service.schemas';
import { ClientCreateSchema } from '@/lib/validators/client.schemas';
import { WorkerCreateSchema } from '@/lib/validators/worker.schemas';
import { z } from 'zod';

/** Convert Zod errors to legacy Record<string, string> format */
function zodToLegacyErrors(zodError: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const issue of zodError.issues) {
        const key = issue.path.join('.');
        if (key && !errors[key]) {
            errors[key] = issue.message;
        }
    }
    return errors;
}

/**
 * Validate salon details
 */
export function validateSalonDetails(details: Partial<SalonDetails>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const result = SalonDetailsSchema.safeParse(details);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    return { isValid: false, errors: zodToLegacyErrors(result.error) };
}

/**
 * Validate service
 */
export function validateService(service: Partial<Service>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    // Use a partial schema for onboarding (salonId not yet assigned)
    const OnboardingServiceSchema = ServiceCreateSchema.omit({ salonId: true }).partial();
    const RequiredFields = z.object({
        name: z.string().min(2, 'Service name must be at least 2 characters'),
        price: z.number().min(0, 'Price must be positive'),
        duration: z.number().int().positive('Duration must be a positive number (in minutes)'),
    });

    const result = RequiredFields.safeParse(service);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    return { isValid: false, errors: zodToLegacyErrors(result.error) };
}

/**
 * Validate product
 */
export function validateProduct(product: Partial<Product>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const RequiredFields = z.object({
        name: z.string().min(2, 'Product name must be at least 2 characters'),
        price: z.number().min(0, 'Price must be positive'),
        stock: z.number().int().min(0, 'Stock must be positive'),
    });

    const result = RequiredFields.safeParse(product);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    return { isValid: false, errors: zodToLegacyErrors(result.error) };
}

/**
 * Validate client
 */
export function validateClient(client: Partial<Client>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const RequiredFields = z.object({
        name: z.string().min(2, 'Client name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        phone: z.string().regex(/^[\d\s+()-]+$/, 'Invalid phone number format'),
    });

    const result = RequiredFields.safeParse(client);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    return { isValid: false, errors: zodToLegacyErrors(result.error) };
}

/**
 * Validate worker data
 */
export function validateWorker(worker: { name: string; email: string; sharingKey?: number }): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const RequiredFields = z.object({
        name: z.string().min(2, 'Worker name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        sharingKey: z.number().min(0, 'Sharing key must be between 0 and 100').max(100, 'Sharing key must be between 0 and 100').optional(),
    });

    const result = RequiredFields.safeParse(worker);
    if (result.success) {
        return { isValid: true, errors: {} };
    }
    return { isValid: false, errors: zodToLegacyErrors(result.error) };
}
