/**
 * Referral Service
 *
 * Business logic for client referral/sponsorship program
 */

import { BaseService } from './BaseService';
import { promoCodeService } from './PromoCodeService';
import type { ReferralSettings, Referral, ReferralWithRelations, ReferralStats, Client, PromoCode } from '@/types';

export class ReferralService extends BaseService {

    // ─── Settings ───────────────────────────────────────

    async getSettings(salonId: number): Promise<ReferralSettings | null> {
        return this.provider.getReferralSettings(salonId);
    }

    async updateSettings(salonId: number, data: Partial<ReferralSettings>): Promise<ReferralSettings> {
        return this.provider.upsertReferralSettings(salonId, data);
    }

    // ─── Referral Code Management ───────────────────────

    generateCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'REF-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async ensureClientHasReferralCode(clientId: number, salonId: number): Promise<string> {
        const clients = await this.provider.getClients(salonId);
        const client = clients.find(c => c.id === clientId);
        if (!client) throw new Error('Client not found');

        if (client.referralCode) return client.referralCode;

        const code = this.generateCode();
        await this.provider.updateClient(clientId, { referralCode: code });
        return code;
    }

    async getClientByReferralCode(salonId: number, code: string): Promise<Client | null> {
        return this.provider.getClientByReferralCode(salonId, code);
    }

    // ─── Validation ─────────────────────────────────────

    async validateReferralCode(salonId: number, code: string, referredClientId: number): Promise<{
        valid: boolean;
        error?: string;
        referrerClient?: Client;
    }> {
        const settings = await this.provider.getReferralSettings(salonId);
        if (!settings?.isActive) {
            return { valid: false, error: 'program_inactive' };
        }

        const referrerClient = await this.provider.getClientByReferralCode(salonId, code);
        if (!referrerClient) {
            return { valid: false, error: 'invalid_code' };
        }

        if (referrerClient.id === referredClientId) {
            return { valid: false, error: 'self_referral' };
        }

        const existingReferral = await this.provider.getReferralByReferred(referredClientId);
        if (existingReferral) {
            return { valid: false, error: 'already_referred' };
        }

        if (settings.maxReferralsPerClient) {
            const referrals = await this.provider.getReferralsByReferrer(referrerClient.id);
            if (referrals.length >= settings.maxReferralsPerClient) {
                return { valid: false, error: 'max_referrals_reached' };
            }
        }

        return { valid: true, referrerClient };
    }

    // ─── Referral Processing ────────────────────────────

    async applyReferral(salonId: number, referralCode: string, referredClientId: number): Promise<Referral> {
        const validation = await this.validateReferralCode(salonId, referralCode, referredClientId);
        if (!validation.valid || !validation.referrerClient) {
            throw new Error(validation.error || 'invalid_referral');
        }

        const settings = await this.provider.getReferralSettings(salonId);
        if (!settings) throw new Error('Referral settings not found');

        // Generate reward promo code for the referred client (immediate discount)
        const referredPromo = await this.generateRewardPromoCode(
            salonId,
            settings.referredRewardType,
            settings.referredRewardValue,
            settings.rewardExpiryDays,
            `Referral reward - welcome discount`
        );

        const referral = await this.provider.createReferral({
            salonId,
            referrerClientId: validation.referrerClient.id,
            referredClientId,
            referralCode,
            status: 'pending',
            referrerPromoCodeId: null,
            referredPromoCodeId: referredPromo.id,
            referrerRewardUsed: false,
            referredRewardUsed: false,
            completedAt: null,
        });

        // Mark the referred client
        await this.provider.updateClient(referredClientId, {
            referredByClientId: validation.referrerClient.id
        });

        return referral;
    }

    async completeReferral(referralId: number): Promise<Referral> {
        const referral = await this.provider.getReferral(referralId);
        if (!referral || referral.status !== 'pending') {
            throw new Error('Referral not found or not pending');
        }

        const settings = await this.provider.getReferralSettings(referral.salonId);
        if (!settings) throw new Error('Referral settings not found');

        // Generate reward promo code for the referrer
        const referrerPromo = await this.generateRewardPromoCode(
            referral.salonId,
            settings.referrerRewardType,
            settings.referrerRewardValue,
            settings.rewardExpiryDays,
            `Referral reward - thank you for referring`
        );

        return this.provider.updateReferral(referralId, {
            status: 'completed',
            referrerPromoCodeId: referrerPromo.id,
            completedAt: new Date(),
        });
    }

    // ─── Queries ────────────────────────────────────────

    async getReferralsBySalon(salonId: number): Promise<ReferralWithRelations[]> {
        const referrals = await this.provider.getReferrals(salonId);
        const clients = await this.provider.getClients(salonId);
        const clientMap = new Map(clients.map(c => [c.id, c]));

        return referrals.map(r => ({
            ...r,
            referrerClient: clientMap.get(r.referrerClientId),
            referredClient: clientMap.get(r.referredClientId),
        }));
    }

    async getReferralStats(salonId: number): Promise<ReferralStats> {
        const referrals = await this.provider.getReferrals(salonId);
        const clients = await this.provider.getClients(salonId);
        const clientMap = new Map(clients.map(c => [c.id, c]));

        const completed = referrals.filter(r => r.status === 'completed');
        const pending = referrals.filter(r => r.status === 'pending');

        // Count referrals per referrer
        const referrerCounts = new Map<number, number>();
        for (const r of referrals) {
            referrerCounts.set(r.referrerClientId, (referrerCounts.get(r.referrerClientId) || 0) + 1);
        }

        const topReferrers = Array.from(referrerCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([clientId, count]) => ({
                clientId,
                clientName: clientMap.get(clientId)?.name || 'Unknown',
                referralCount: count,
            }));

        return {
            totalReferrals: referrals.length,
            completedReferrals: completed.length,
            pendingReferrals: pending.length,
            totalRewardsGiven: completed.length * 2, // Each completed referral = 2 rewards
            topReferrers,
        };
    }

    // ─── Private Helpers ────────────────────────────────

    private async generateRewardPromoCode(
        salonId: number,
        rewardType: 'percentage' | 'fixed',
        rewardValue: number,
        expiryDays: number,
        description: string
    ): Promise<PromoCode> {
        const code = `REF-${Date.now().toString(36).toUpperCase()}`;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + expiryDays);

        return promoCodeService.create({
            salonId,
            code,
            description,
            type: rewardType,
            value: rewardValue,
            isActive: true,
            usageCount: 0,
            maxUsage: 1,
            endDate: endDate.toISOString().split('T')[0],
            affectWorkerShare: false,
        });
    }
}

export const referralService = new ReferralService();
