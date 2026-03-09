/**
 * Stats Service (Thin Facade)
 *
 * General dashboard stats and client analytics.
 * Revenue methods → RevenueStatsService
 * Performance methods → PerformanceStatsService
 */

import { BaseService } from './BaseService';
import type { SalonStats, ClientStats, DashboardAnalytics } from '@/types';

export class StatsService extends BaseService {
    /**
     * Get salon statistics
     */
    async getSalonStats(salonId: number): Promise<SalonStats> {
        return this.provider.getSalonStats(salonId);
    }

    /**
     * Get dashboard analytics (revenue trend, expense distribution)
     */
    async getDashboardAnalytics(salonId: number): Promise<DashboardAnalytics> {
        return this.provider.getDashboardAnalytics(salonId);
    }

    /**
     * Get client statistics
     */
    async getClientStats(clientId: number): Promise<ClientStats | null> {
        return this.provider.getClientStats(clientId);
    }

    /**
     * Get client retention rate
     */
    async getClientRetentionRate(salonId: number): Promise<number> {
        const clients = await this.provider.getClients(salonId);
        let returningClients = 0;

        for (const client of clients) {
            const bookings = await this.provider.getBookingsByClient(client.id);
            if (bookings.length > 1) {
                returningClients++;
            }
        }

        return clients.length > 0 ? (returningClients / clients.length) * 100 : 0;
    }
}

export const statsService = new StatsService();
