import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceService } from './ServiceService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('ServiceService', () => {
    let service: ServiceService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getServices: vi.fn(),
            getService: vi.fn(),
            createService: vi.fn(),
            updateService: vi.fn(),
            deleteService: vi.fn(),
            createInteractionHistory: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new ServiceService();
    });

    it('should throw error if name is missing during creation', async () => {
        const data = {
            salonId: 1,
            price: 50,
            duration: 30
        };

        await expect(service.create(data as any)).rejects.toThrow(/expected string/i);
    });

    it('should throw error if price is negative', async () => {
        const data = {
            salonId: 1,
            name: 'Haircut',
            price: -10,
            duration: 30
        };

        await expect(service.create(data as any)).rejects.toThrow('Must be zero or positive');
    });

    it('should throw error if duration is invalid', async () => {
        const data = {
            salonId: 1,
            name: 'Haircut',
            price: 50,
            duration: 0
        };

        await expect(service.create(data as any)).rejects.toThrow('Must be a positive integer');
    });

    it('should call provider.createService with correct data', async () => {
        const data = {
            salonId: 1,
            name: 'Deluxe Haircut',
            price: 75,
            duration: 60
        };

        mockProvider.createService.mockResolvedValue({ id: 200, ...data });

        const result = await service.create(data as any);

        expect(mockProvider.createService).toHaveBeenCalled();
        expect(result.id).toBe(200);
    });
});
