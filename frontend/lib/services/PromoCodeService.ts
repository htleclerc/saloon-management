/**
 * Promo Code Service
 * 
 * Business logic for promotions
 */

import { BaseService } from './BaseService';
import type { PromoCode } from '@/types';

export class PromoCodeService extends BaseService {
    /**
     * Validate a promo code
     */
    async validate(salonId: number, code: string): Promise<PromoCode | null> {
        const promo = await this.provider.getPromoCodeByCode(salonId, code);

        if (!promo) return null;
        if (!promo.isActive) return null;

        // Check dates
        const now = new Date();
        const start = promo.startDate ? new Date(promo.startDate) : null;
        const end = promo.endDate ? new Date(promo.endDate) : null;

        if (start && now < start) return null;
        if (end && now > end) return null;

        // Check usage limits
        if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return null;

        return promo;
    }

    /**
     * Get all promo codes
     */
    async getAll(salonId: number): Promise<PromoCode[]> {
        return this.provider.getPromoCodes(salonId);
    }

    /**
     * Create promo code
     */
    async create(data: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<PromoCode> {
        return this.provider.createPromoCode(data);
    }

    /**
     * Update promo code
     */
    async update(id: number, data: Partial<PromoCode>): Promise<PromoCode> {
        return this.provider.updatePromoCode(id, data);
    }

    /**
     * Delete promo code
     */
    async delete(id: number): Promise<void> {
        return this.provider.deletePromoCode(id);
    }
}

export const promoCodeService = new PromoCodeService();
