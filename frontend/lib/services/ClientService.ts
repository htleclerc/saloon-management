/**
 * Client Service
 * 
 * Business logic for Client management
 */

import { BaseService } from './BaseService';
import { Client, Salon, ClientStats, ClientAnalytics } from '@/types';

export class ClientService extends BaseService {
    /**
     * Get all clients for a salon
     */
    async getAll(salonId: number): Promise<Client[]> {
        return this.handleError(
            async () => {
                return await this.provider.getClients(salonId);
            },
            'Failed to fetch clients'
        );
    }

    /**
     * Get a single client by ID
     */
    async getById(id: number): Promise<Client | null> {
        return this.handleError(
            async () => {
                return await this.provider.getClient(id);
            },
            `Failed to fetch client ${id}`
        );
    }

    /**
     * Create a new client
     */
    async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Client> {
        // Business validation
        this.validateRequired(data, ['salonId', 'name', 'email', 'phone']);

        if (data.email && !this.validateEmail(data.email)) {
            throw new Error('Valid email is required');
        }

        if (data.phone && !this.validatePhone(data.phone)) {
            throw new Error('Valid phone number is required');
        }

        if (data.email) {
            const existingClient = await this.provider.getClientByEmail(data.salonId, data.email);
            if (existingClient) {
                throw new Error(`Client with email ${data.email} already exists in this salon`);
            }
        }

        return this.handleError(
            async () => {
                return await this.provider.createClient({
                    ...data,
                    createdBy: this.getCurrentUser(),
                    updatedBy: this.getCurrentUser()
                } as any);
            },
            'Failed to create client'
        );
    }

    /**
     * Update an existing client
     */
    async update(id: number, data: Partial<Client>): Promise<Client> {
        // Business validation
        if (data.email && !this.validateEmail(data.email)) {
            throw new Error('Valid email is required');
        }

        return this.handleError(
            async () => {
                return await this.provider.updateClient(id, {
                    ...data,
                    updatedBy: this.getCurrentUser()
                });
            },
            `Failed to update client ${id}`
        );
    }

    /**
     * Delete a client
     */
    async delete(id: number): Promise<void> {
        return this.handleError(
            async () => {
                await this.provider.deleteClient(id);
            },
            `Failed to delete client ${id}`
        );
    }

    /**
     * Search clients by name, email, or phone
     */
    async search(salonId: number, query: string): Promise<Client[]> {
        const clients = await this.getAll(salonId);
        const lowerQuery = query.toLowerCase();
        return clients.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.email && c.email.toLowerCase().includes(lowerQuery)) ||
            (c.phone && c.phone.includes(query))
        );
    }

    /**
     * Get clients by email domain
     */
    async getByEmailDomain(salonId: number, domain: string): Promise<Client[]> {
        const clients = await this.getAll(salonId);
        const lowerDomain = `@${domain.toLowerCase()}`;
        return clients.filter(c => c.email && c.email.toLowerCase().endsWith(lowerDomain));
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Format phone number
     */
    formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX for 10-digit numbers
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }

        return phone;
    }

    /**
     * Get client's favorite salons
     */
    async getFavorites(clientId: number): Promise<Salon[]> {
        // Try to get from localStorage (for demo modes)
        const dataMode = (typeof window !== 'undefined'
            ? localStorage.getItem('saloon-data-mode')
            : 'demo-local') as 'demo-local' | 'demo-supabase' | 'normal' || 'demo-local';

        if (dataMode === 'demo-local') {
            // Get from localStorage
            const favoritesKey = `client-${clientId}-favorites`;
            const storedFavorites = typeof window !== 'undefined' ? localStorage.getItem(favoritesKey) : null;
            const favoriteIds: number[] = storedFavorites ? JSON.parse(storedFavorites) : [1]; // Default to Demo Salon

            // Get salons by IDs
            const allSalons = await this.provider.getSalons();
            return allSalons.filter((s: Salon) => favoriteIds.includes(s.id));
        }

        // For Supabase/production: use provider method if available
        // Otherwise return empty for now (would need client_salons junction table)
        return [];
    }

    /**
     * Add salon to favorites
     */
    async addFavorite(clientId: number, salonId: number): Promise<void> {
        const dataMode = (typeof window !== 'undefined'
            ? localStorage.getItem('saloon-data-mode')
            : 'demo-local') as 'demo-local' | 'demo-supabase' | 'normal' || 'demo-local';

        if (dataMode === 'demo-local') {
            const favoritesKey = `client-${clientId}-favorites`;
            const storedFavorites = typeof window !== 'undefined' ? localStorage.getItem(favoritesKey) : null;
            const favoriteIds: number[] = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (!favoriteIds.includes(salonId)) {
                favoriteIds.push(salonId);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(favoritesKey, JSON.stringify(favoriteIds));
                }
            }
            return;
        }

        // For Supabase/production: use provider method
        console.log(`Adding favorite salon ${salonId} for client ${clientId}`);
    }

    /**
     * Remove salon from favorites
     */
    async removeFavorite(clientId: number, salonId: number): Promise<void> {
        const dataMode = (typeof window !== 'undefined'
            ? localStorage.getItem('saloon-data-mode')
            : 'demo-local') as 'demo-local' | 'demo-supabase' | 'normal' || 'demo-local';

        if (dataMode === 'demo-local') {
            const favoritesKey = `client-${clientId}-favorites`;
            const storedFavorites = typeof window !== 'undefined' ? localStorage.getItem(favoritesKey) : null;
            const favoriteIds: number[] = storedFavorites ? JSON.parse(storedFavorites) : [];

            const updatedFavorites = favoriteIds.filter(id => id !== salonId);
            if (typeof window !== 'undefined') {
                localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
            }
            return;
        }

        // For Supabase/production: use provider method
        console.log(`Removing favorite salon ${salonId} for client ${clientId}`);
    }

    /**
     * Get client statistics
     */
    async getClientStats(id: number): Promise<ClientStats | null> {
        return this.handleError(
            async () => {
                return await this.provider.getClientStats(id);
            },
            `Failed to fetch stats for client ${id}`
        );
    }

    /**
     * Get client analytics (trend, distribution, activity)
     */
    async getClientAnalytics(salonId: number): Promise<ClientAnalytics> {
        return this.handleError(
            async () => {
                return await this.provider.getClientAnalytics(salonId);
            },
            'Failed to fetch client analytics'
        );
    }
}

// Singleton instance
export const clientService = new ClientService();
