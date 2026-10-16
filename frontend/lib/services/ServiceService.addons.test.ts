import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceService } from './ServiceService';
import { DataProviderFactory } from '../providers/types';

vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

const lowerBack = { id: 10, salonId: 1, name: 'Lower back', extraPrice: 30, extraDuration: 60, displayOrder: 2, isActive: true };
const wash = { id: 11, salonId: 1, name: 'Wash + blow dry', extraPrice: 25, extraDuration: 30, displayOrder: 1, isActive: true };
const retired = { id: 12, salonId: 1, name: 'Old option', extraPrice: 5, extraDuration: 0, displayOrder: 3, isActive: false };

describe('ServiceService add-ons', () => {
    let service: ServiceService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getServiceAddons: vi.fn().mockResolvedValue([wash, lowerBack, retired]),
            getServiceAddon: vi.fn(),
            createServiceAddon: vi.fn().mockImplementation(async (data) => ({ id: 20, ...data })),
            updateServiceAddon: vi.fn().mockImplementation(async (id, data) => ({ ...lowerBack, ...data, id })),
            deleteServiceAddon: vi.fn(),
            getAddonsForService: vi.fn(),
            setAddonsForService: vi.fn(),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new ServiceService();
    });

    describe('createAddon', () => {
        it('validates and creates an add-on with audit fields', async () => {
            const addon = await service.createAddon({
                salonId: 1,
                name: 'Hip length',
                extraPrice: 140,
                extraDuration: 360,
                displayOrder: 5,
                isActive: true,
            });

            expect(mockProvider.createServiceAddon).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Hip length',
                extraPrice: 140,
                extraDuration: 360,
                createdBy: 'SYSTEM',
                updatedBy: 'SYSTEM',
            }));
            expect(addon.id).toBe(20);
        });

        it('rejects a negative extra price', async () => {
            await expect(service.createAddon({
                salonId: 1, name: 'Bad', extraPrice: -1, extraDuration: 0, displayOrder: 0, isActive: true,
            })).rejects.toThrow('Must be zero or positive');
        });

        it('rejects a negative extra duration', async () => {
            await expect(service.createAddon({
                salonId: 1, name: 'Bad', extraPrice: 0, extraDuration: -10, displayOrder: 0, isActive: true,
            })).rejects.toThrow('Extra duration must be zero or positive');
        });

        it('rejects a too short name', async () => {
            await expect(service.createAddon({
                salonId: 1, name: 'X', extraPrice: 0, extraDuration: 0, displayOrder: 0, isActive: true,
            })).rejects.toThrow('at least 2 characters');
        });
    });

    describe('getAddons', () => {
        it('returns every add-on by default and only active ones on request (provider order kept)', async () => {
            expect(await service.getAddons(1)).toHaveLength(3);
            const active = await service.getAddons(1, true);
            expect(active.map(a => a.id)).toEqual([11, 10]);
        });
    });

    describe('getAddonsForServices', () => {
        it('merges add-ons of several services, deduplicates and sorts by display order', async () => {
            mockProvider.getAddonsForService.mockImplementation(async (serviceId: number) =>
                serviceId === 1 ? [lowerBack, wash] : [wash, retired]
            );

            const addons = await service.getAddonsForServices([1, 2, 1]);
            expect(addons.map(a => a.id)).toEqual([11, 10]);
            expect(mockProvider.getAddonsForService).toHaveBeenCalledTimes(2);
        });
    });

    describe('setAddonsForService', () => {
        it('delegates to the provider and logs the change', async () => {
            await service.setAddonsForService(1, [10, 11]);
            expect(mockProvider.setAddonsForService).toHaveBeenCalledWith(1, [10, 11]);
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
        });
    });

    describe('updateAddon / deleteAddon', () => {
        it('updates with validation', async () => {
            const updated = await service.updateAddon(10, { extraPrice: 35 });
            expect(updated.extraPrice).toBe(35);
            await expect(service.updateAddon(10, { extraPrice: -3 })).rejects.toThrow();
        });

        it('deletes through the provider', async () => {
            await service.deleteAddon(10);
            expect(mockProvider.deleteServiceAddon).toHaveBeenCalledWith(10);
        });
    });
});
