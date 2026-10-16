/**
 * Service Service
 * 
 * Business logic for salon services
 */

import { BaseService } from './BaseService';
import type { Service, ServiceAddon, ServiceCategory } from '@/types';
import { ServiceCreateSchema, ServiceUpdateSchema, ServiceAddonCreateSchema, ServiceAddonUpdateSchema } from '@/lib/validators';

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

    // ============================================
    // ADD-ONS (options with extra price / duration)
    // ============================================

    /**
     * Get the add-on catalog of a salon
     */
    async getAddons(salonId: number, onlyActive = false): Promise<ServiceAddon[]> {
        const addons = await this.provider.getServiceAddons(salonId);
        return onlyActive ? addons.filter(a => a.isActive) : addons;
    }

    /**
     * Get an add-on by ID
     */
    async getAddonById(id: number): Promise<ServiceAddon | null> {
        return this.provider.getServiceAddon(id);
    }

    /**
     * Create an add-on in the salon catalog
     */
    async createAddon(data: Omit<ServiceAddon, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ServiceAddon> {
        // Zod validation (name, extraPrice >= 0, extraDuration >= 0)
        const parsed = ServiceAddonCreateSchema.parse(data);

        const addon = await this.provider.createServiceAddon({
            ...data,
            ...parsed,
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('service_addon', addon.id, 'created', `Add-on ${addon.name} created`);
        return addon;
    }

    /**
     * Update an add-on
     */
    async updateAddon(id: number, data: Partial<ServiceAddon>): Promise<ServiceAddon> {
        ServiceAddonUpdateSchema.parse(data);

        const addon = await this.provider.updateServiceAddon(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('service_addon', id, 'updated');
        return addon;
    }

    /**
     * Delete an add-on (links to services are removed by the provider)
     */
    async deleteAddon(id: number): Promise<void> {
        await this.provider.deleteServiceAddon(id);
        await this.logInteraction('service_addon', id, 'deleted');
    }

    /**
     * Add-ons offered on a given service
     */
    async getAddonsForService(serviceId: number, onlyActive = false): Promise<ServiceAddon[]> {
        const addons = await this.provider.getAddonsForService(serviceId);
        return onlyActive ? addons.filter(a => a.isActive) : addons;
    }

    /**
     * Add-ons offered on any of the given services (deduplicated, sorted by display order)
     */
    async getAddonsForServices(serviceIds: number[], onlyActive = true): Promise<ServiceAddon[]> {
        const byId = new Map<number, ServiceAddon>();
        for (const serviceId of Array.from(new Set(serviceIds))) {
            const addons = await this.getAddonsForService(serviceId, onlyActive);
            addons.forEach(a => byId.set(a.id, a));
        }
        return Array.from(byId.values()).sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
    }

    /**
     * Replace the set of add-ons offered on a service
     */
    async setAddonsForService(serviceId: number, addonIds: number[]): Promise<void> {
        await this.provider.setAddonsForService(serviceId, addonIds);
        await this.logInteraction('service', serviceId, 'addons_updated', `${addonIds.length} add-on(s) linked`);
    }
}

export const serviceService = new ServiceService();
