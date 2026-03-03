import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TipsService } from './TipsService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('TipsService', () => {
    let service: TipsService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getSalonSettings: vi.fn(),
            updateSalonSettings: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new TipsService();
    });

    const mockWorkers = [
        { id: 1, name: 'Worker 1', sharingKey: 50 },
        { id: 2, name: 'Worker 2', sharingKey: 80 }
    ];

    it('should split tips equally among workers by default', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ tipsDistributionRule: 'EQUAL_WORKERS', tipsEnabled: true });

        const splits = await service.calculateSplits(1, 100, mockWorkers as any);

        expect(splits).toHaveLength(2);
        expect(splits[0].amount).toBe(50);
        expect(splits[0].salonAmount).toBe(0);
        expect(splits[1].amount).toBe(50);
    });

    it('should include salon in split when rule is EQUAL_ALL', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ tipsDistributionRule: 'EQUAL_ALL', tipsEnabled: true });

        const splits = await service.calculateSplits(1, 90, mockWorkers as any);

        // 90 / (2 workers + 1 salon) = 30 each
        // Salon share (30) is distributed among worker entries (30/2 = 15 each)
        expect(splits[0].amount).toBe(30);
        expect(splits[0].salonAmount).toBe(15);
        expect(splits[1].amount).toBe(30);
        expect(splits[1].salonAmount).toBe(15);
    });

    it('should use worker sharing keys when rule is SALON_KEY', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ tipsDistributionRule: 'SALON_KEY', tipsEnabled: true });

        const splits = await service.calculateSplits(1, 100, mockWorkers as any);

        // Worker 1: 50% sharing key. Base share is 50. 50 * 0.5 = 25. Salon get 25.
        // Worker 2: 80% sharing key. Base share is 50. 50 * 0.8 = 40. Salon get 10.
        expect(splits[0].workerId).toBe(1);
        expect(splits[0].amount).toBe(25);
        expect(splits[0].salonAmount).toBe(25);

        expect(splits[1].workerId).toBe(2);
        expect(splits[1].amount).toBe(40);
        expect(splits[1].salonAmount).toBe(10);
    });

    it('should give everything to salon when rule is POOL', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ tipsDistributionRule: 'POOL', tipsEnabled: true });

        const splits = await service.calculateSplits(1, 100, mockWorkers as any);

        expect(splits[0].amount).toBe(0);
        expect(splits[0].salonAmount).toBe(50);
        expect(splits[1].amount).toBe(0);
        expect(splits[1].salonAmount).toBe(50);
    });

    it('should return empty array if no workers provided', async () => {
        const splits = await service.calculateSplits(1, 100, []);
        expect(splits).toEqual([]);
    });

    it('should fallback to equal worker split if tips are disabled', async () => {
        mockProvider.getSalonSettings.mockResolvedValue({ tipsEnabled: false });

        const splits = await service.calculateSplits(1, 100, mockWorkers as any);

        expect(splits[0].amount).toBe(50);
        expect(splits[0].salonAmount).toBe(0);
    });
});
