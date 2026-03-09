/**
 * Service Service
 * 
 * Business logic for salon services
 */

import { BaseService } from './BaseService';
import type { Service, ServiceCategory } from '@/types';
import { ServiceCreateSchema, ServiceUpdateSchema } from '@/lib/validators';

export class ServiceService extends BaseService {
    /**
     * Get all services for a salon
     */
    async getAll(salonId: number): Promise<Service[]> {
        return this.provider.getServices(salonId);
    }

    /**
     * Get service by ID
     */
    async getById(id: number): Promise<Service | null> {
        return this.provider.getService(id);
    }

    /**
     * Get services by category
     */
    async getByCategory(categoryId: number): Promise<Service[]> {
        return this.provider.getServicesByCategory(categoryId);
    }

    /**
     * Get all categories for a salon
     */
    async getCategories(salonId: number): Promise<ServiceCategory[]> {
        return this.provider.getServiceCategories(salonId);
    }

    /**
     * Create a new service
     */
    async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Service> {
        // Zod validation (covers required fields, price >= 0, duration > 0)
        ServiceCreateSchema.parse(data);

        // Create
        const service = await this.provider.createService({
            ...data,
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });

        // Log action
        await this.logInteraction('service', service.id, 'created', `Service ${service.name} created`);

        return service;
    }

    /**
     * Update an existing service
     */
    async update(id: number, data: Partial<Service>): Promise<Service> {
        // Zod validation (covers price >= 0, duration > 0 when present)
        ServiceUpdateSchema.parse(data);

        const service = await this.provider.updateService(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('service', id, 'updated');

        return service;
    }

    /**
     * Delete a service
     */
    async delete(id: number): Promise<void> {
        await this.provider.deleteService(id);
        await this.logInteraction('service', id, 'deleted');
    }
}

export const serviceService = new ServiceService();
