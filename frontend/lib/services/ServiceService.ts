/**
 * Service Service
 * 
 * Business logic for salon services
 */

import { BaseService } from './BaseService';
import type { Service, ServiceCategory } from '@/types';

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
        return this.provider.createService(data);
    }

    /**
     * Update an existing service
     */
    async update(id: number, data: Partial<Service>): Promise<Service> {
        return this.provider.updateService(id, data);
    }

    /**
     * Delete a service
     */
    async delete(id: number): Promise<void> {
        return this.provider.deleteService(id);
    }
}

export const serviceService = new ServiceService();
