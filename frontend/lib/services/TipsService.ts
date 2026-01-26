/**
 * Tips Service
 * 
 * Business logic for tips distribution
 */

import { BaseService } from './BaseService';
import { SalonWorker, TipsConfiguration } from '@/types';

export interface CalculatedTipSplit {
    workerId: number;
    amount: number;
    salonAmount: number;
}

export class TipsService extends BaseService {
    /**
     * Calculate tip splits based on salon configuration
     */
    async calculateSplits(salonId: number, totalTips: number, workers: SalonWorker[]): Promise<CalculatedTipSplit[]> {
        if (workers.length === 0) return [];

        const settings = await this.provider.getSalonSettings(salonId);

        // Default fallbacks if settings missing
        const rule = settings?.tipsDistributionRule || 'EQUAL_WORKERS';
        const isActive = settings?.tipsEnabled ?? true; // Default true if legacy? Or false? Provider said true.

        if (!isActive) {
            // If disabled, default to equal split among workers (standard behavior)
            const share = totalTips / workers.length;
            return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
        }

        switch (rule) {
            case 'EQUAL_WORKERS': {
                const share = totalTips / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
            }
            case 'EQUAL_ALL': {
                const share = totalTips / (workers.length + 1);
                // Distribute salon share across workers entries for income tracking structure
                const salonSharePerWorkerEntry = share / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: salonSharePerWorkerEntry }));
            }
            case 'SALON_KEY': {
                return workers.map(w => {
                    const baseShare = totalTips / workers.length;
                    const workerPart = (baseShare * (w.sharingKey || 0)) / 100;
                    const salonPart = baseShare - workerPart;
                    return { workerId: w.id, amount: workerPart, salonAmount: salonPart };
                });
            }
            case 'CUSTOM_PERCENTAGE': {
                // Settings usually don't store "salonPercentage" directly on root, possibly in JSON or extra field?
                // Provider used local state `salonPercentage`. 
                // We'll assume a default or need to extend Settings interface if we want full fidelity.
                // For now, simple fallback.
                const salonPct = 0; // TODO: Add to SalonSettings schema if needed
                const totalSalon = (totalTips * salonPct) / 100;
                const totalWorkers = totalTips - totalSalon;
                const workerShare = totalWorkers / workers.length;
                const salonSharePerWorkerEntry = totalSalon / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: workerShare, salonAmount: salonSharePerWorkerEntry }));
            }
            case 'POOL': {
                return workers.map(w => ({ workerId: w.id, amount: 0, salonAmount: totalTips / workers.length }));
            }
            default:
                const share = totalTips / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
        }
    }

    /**
     * Update tips configuration (Salon Settings)
     */
    async updateConfiguration(salonId: number, updates: Partial<TipsConfiguration>): Promise<void> {
        // Map TipsConfiguration back to SalonSettings fields
        await this.provider.updateSalonSettings(salonId, {
            tipsEnabled: updates.isActive,
            tipsDistributionRule: updates.rule,
            // salonPercentage not in standard schema yet, ignored for now
        });
    }

    async getConfiguration(salonId: number): Promise<TipsConfiguration> {
        const settings = await this.provider.getSalonSettings(salonId);
        return {
            isActive: settings?.tipsEnabled ?? true,
            rule: settings?.tipsDistributionRule || 'EQUAL_WORKERS',
            salonPercentage: 0
        };
    }
}

export const tipsService = new TipsService();
