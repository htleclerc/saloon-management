import type { SalonDetails, Service, Product, Client } from '@/types';

/**
 * Validate salon details
 */
export function validateSalonDetails(details: Partial<SalonDetails>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!details.name || details.name.trim().length === 0) {
        errors.name = 'Salon name is required';
    } else if (details.name.trim().length < 2) {
        errors.name = 'Salon name must be at least 2 characters';
    }

    if (!details.address || details.address.trim().length === 0) {
        errors.address = 'Address is required';
    }

    if (!details.phone || details.phone.trim().length === 0) {
        errors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]+$/.test(details.phone)) {
        errors.phone = 'Invalid phone number format';
    }

    if (!details.email || details.email.trim().length === 0) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
        errors.email = 'Invalid email format';
    }

    if (details.website && details.website.trim().length > 0) {
        try {
            new URL(details.website);
        } catch {
            errors.website = 'Invalid website URL';
        }
    }

    if (!details.timezone || details.timezone.trim().length === 0) {
        errors.timezone = 'Timezone is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validate service
 */
export function validateService(service: Partial<Service>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!service.name || service.name.trim().length === 0) {
        errors.name = 'Service name is required';
    } else if (service.name.trim().length < 2) {
        errors.name = 'Service name must be at least 2 characters';
    }

    if (service.price === undefined || service.price === null) {
        errors.price = 'Price is required';
    } else if (service.price < 0) {
        errors.price = 'Price must be positive';
    }

    if (service.duration === undefined || service.duration === null) {
        errors.duration = 'Duration is required';
    } else {
        const durationNum = typeof service.duration === 'string' ? parseInt(service.duration, 10) : service.duration;
        if (isNaN(durationNum) || durationNum <= 0) {
            errors.duration = 'Duration must be a positive number (in minutes)';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validate product
 */
export function validateProduct(product: Partial<Product>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!product.name || product.name.trim().length === 0) {
        errors.name = 'Product name is required';
    } else if (product.name.trim().length < 2) {
        errors.name = 'Product name must be at least 2 characters';
    }

    if (product.price === undefined || product.price === null) {
        errors.price = 'Price is required';
    } else if (product.price < 0) {
        errors.price = 'Price must be positive';
    }

    if (product.stock === undefined || product.stock === null) {
        errors.stock = 'Stock quantity is required';
    } else if (product.stock < 0) {
        errors.stock = 'Stock must be positive';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validate client
 */
export function validateClient(client: Partial<Client>): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!client.name || client.name.trim().length === 0) {
        errors.name = 'Client name is required';
    } else if (client.name.trim().length < 2) {
        errors.name = 'Client name must be at least 2 characters';
    }

    if (!client.email || client.email.trim().length === 0) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
        errors.email = 'Invalid email format';
    }

    if (!client.phone || client.phone.trim().length === 0) {
        errors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]+$/.test(client.phone)) {
        errors.phone = 'Invalid phone number format';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validate worker data
 */
export function validateWorker(worker: { name: string; email: string; sharingKey?: number }): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!worker.name || worker.name.trim().length === 0) {
        errors.name = 'Worker name is required';
    } else if (worker.name.trim().length < 2) {
        errors.name = 'Worker name must be at least 2 characters';
    }

    if (!worker.email || worker.email.trim().length === 0) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(worker.email)) {
        errors.email = 'Invalid email format';
    }

    if (worker.sharingKey !== undefined) {
        if (worker.sharingKey < 0 || worker.sharingKey > 100) {
            errors.sharingKey = 'Sharing key must be between 0 and 100';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
