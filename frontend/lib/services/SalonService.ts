/**
 * Salon Service
 * 
 * Multi-tenant salon management
 */

import { BaseService } from './BaseService';
import type { Salon, SalonSettings, SalonStats } from '@/types';

export class SalonService extends BaseService {
    /**
     * Get all salons (SuperAdmin only)
     */
    async getAll(): Promise<Salon[]> {
        return this.provider.getSalons();
    }

    /**
     * Get salons for current user
     */
    async getMySalons(userId: number): Promise<Salon[]> {
        const userSalons = await this.provider.getUserSalons(userId);
        const salons: Salon[] = [];

        for (const us of userSalons) {
            const salon = await this.provider.getSalon(us.salonId);
            if (salon && salon.isActive) {
                salons.push(salon);
            }
        }

        return salons;
    }

    /**
     * Get salon by ID
     */
    async getById(id: number): Promise<Salon | null> {
        return this.provider.getSalon(id);
    }

    /**
     * Get salon by slug
     */
    async getBySlug(slug: string): Promise<Salon | null> {
        return this.provider.getSalonBySlug(slug);
    }

    /**
     * Get salon statistics
     */
    async getStats(salonId: number): Promise<SalonStats> {
        return this.provider.getSalonStats(salonId);
    }

    /**
     * Get salon settings
     */
    async getSettings(salonId: number): Promise<SalonSettings | null> {
        return this.provider.getSalonSettings(salonId);
    }

    /**
     * Update salon settings
     */
    async updateSettings(salonId: number, data: Partial<SalonSettings>): Promise<SalonSettings> {
        const settings = await this.provider.updateSalonSettings(salonId, data);
        await this.logInteraction('salon_settings', salonId, 'updated');
        return settings;
    }

    /**
     * Create new salon
     */
    async create(data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Salon> {
        this.validateRequired(data, ['name', 'slug']);

        // Generate slug if not provided
        if (!data.slug) {
            data.slug = this.generateSlug(data.name);
        }

        const salon = await this.provider.createSalon({
            ...data,
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('salon', salon.id, 'created');

        return salon;
    }

    /**
     * Update salon
     */
    async update(id: number, data: Partial<Salon>): Promise<Salon> {
        const salon = await this.provider.updateSalon(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('salon', id, 'updated');

        return salon;
    }

    /**
     * Add user to salon
     */
    async addUser(salonId: number, userId: number, role: 'Manager' | 'Worker') {
        const userSalon = await this.provider.addUserToSalon(userId, salonId, role);
        await this.logInteraction('salon', salonId, 'user_added', `User ${userId} added as ${role}`);
        return userSalon;
    }

    /**
     * Remove user from salon
     */
    async removeUser(salonId: number, userId: number) {
        await this.provider.removeUserFromSalon(userId, salonId);
        await this.logInteraction('salon', salonId, 'user_removed', `User ${userId} removed`);
    }

    /**
     * Get users in salon
     */
    async getUsers(salonId: number) {
        return this.provider.getSalonUsers(salonId);
    }

    /**
     * Generate URL-friendly slug from name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
            .replace(/^-+|-+$/g, ''); // Trim dashes
    }


}

export const salonService = new SalonService();
