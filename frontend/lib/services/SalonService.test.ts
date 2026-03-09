import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalonService } from './SalonService';
import { DataProviderFactory } from '../providers/types';

vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

vi.mock('@/lib/validators', () => ({
    SalonCreateSchema: {
        parse: vi.fn()
    }
}));

describe('SalonService', () => {
    let service: SalonService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getSalons: vi.fn(),
            getSalon: vi.fn(),
            getSalonBySlug: vi.fn(),
            getSalonStats: vi.fn(),
            getSalonSettings: vi.fn(),
            updateSalonSettings: vi.fn(),
            createSalon: vi.fn(),
            updateSalon: vi.fn(),
            getUserSalons: vi.fn(),
            addUserToSalon: vi.fn(),
            removeUserFromSalon: vi.fn(),
            getSalonUsers: vi.fn(),
            createInteractionHistory: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new SalonService();
    });

    describe('getAll', () => {
        it('should return all salons', async () => {
            const salons = [{ id: 1, name: 'Salon A' }, { id: 2, name: 'Salon B' }];
            mockProvider.getSalons.mockResolvedValue(salons);

            const result = await service.getAll();

            expect(mockProvider.getSalons).toHaveBeenCalled();
            expect(result).toEqual(salons);
        });
    });

    describe('getMySalons', () => {
        it('should return only active salons for a user', async () => {
            mockProvider.getUserSalons.mockResolvedValue([
                { salonId: 1 },
                { salonId: 2 },
                { salonId: 3 },
            ]);
            mockProvider.getSalon
                .mockResolvedValueOnce({ id: 1, name: 'Active Salon', isActive: true })
                .mockResolvedValueOnce({ id: 2, name: 'Inactive Salon', isActive: false })
                .mockResolvedValueOnce(null); // Deleted salon

            const result = await service.getMySalons(10);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Active Salon');
        });

        it('should return empty array if user has no salons', async () => {
            mockProvider.getUserSalons.mockResolvedValue([]);

            const result = await service.getMySalons(10);

            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a salon by ID', async () => {
            const salon = { id: 1, name: 'Test Salon' };
            mockProvider.getSalon.mockResolvedValue(salon);

            const result = await service.getById(1);

            expect(mockProvider.getSalon).toHaveBeenCalledWith(1);
            expect(result).toEqual(salon);
        });

        it('should return null for non-existent salon', async () => {
            mockProvider.getSalon.mockResolvedValue(null);

            const result = await service.getById(999);

            expect(result).toBeNull();
        });
    });

    describe('getBySlug', () => {
        it('should return a salon by slug', async () => {
            const salon = { id: 1, name: 'Test Salon', slug: 'test-salon' };
            mockProvider.getSalonBySlug.mockResolvedValue(salon);

            const result = await service.getBySlug('test-salon');

            expect(mockProvider.getSalonBySlug).toHaveBeenCalledWith('test-salon');
            expect(result).toEqual(salon);
        });
    });

    describe('getStats', () => {
        it('should return salon stats', async () => {
            const stats = { totalRevenue: 5000, totalBookings: 100 };
            mockProvider.getSalonStats.mockResolvedValue(stats);

            const result = await service.getStats(1);

            expect(mockProvider.getSalonStats).toHaveBeenCalledWith(1);
            expect(result).toEqual(stats);
        });
    });

    describe('getSettings / updateSettings', () => {
        it('should return salon settings', async () => {
            const settings = { currency: 'EUR', timezone: 'Europe/Paris' };
            mockProvider.getSalonSettings.mockResolvedValue(settings);

            const result = await service.getSettings(1);

            expect(result).toEqual(settings);
        });

        it('should update salon settings and log interaction', async () => {
            const updatedSettings = { currency: 'USD' };
            mockProvider.updateSalonSettings.mockResolvedValue(updatedSettings);

            const result = await service.updateSettings(1, { currency: 'USD' });

            expect(mockProvider.updateSalonSettings).toHaveBeenCalledWith(1, { currency: 'USD' });
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
            expect(result).toEqual(updatedSettings);
        });
    });

    describe('create', () => {
        it('should create a salon and log interaction', async () => {
            const salonData = { name: 'New Salon', slug: 'new-salon', isActive: true };
            mockProvider.createSalon.mockResolvedValue({ id: 10, ...salonData });

            const result = await service.create(salonData as Parameters<SalonService['create']>[0]);

            expect(mockProvider.createSalon).toHaveBeenCalled();
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
            expect(result.id).toBe(10);
        });

        it('should auto-generate slug from name if not provided', async () => {
            const salonData = { name: 'Mon Beau Salon', slug: '', isActive: true };
            mockProvider.createSalon.mockResolvedValue({ id: 11, ...salonData, slug: 'mon-beau-salon' });

            await service.create(salonData as Parameters<SalonService['create']>[0]);

            expect(mockProvider.createSalon).toHaveBeenCalledWith(
                expect.objectContaining({ slug: 'mon-beau-salon' })
            );
        });
    });

    describe('update', () => {
        it('should update a salon and log interaction', async () => {
            const updatedSalon = { id: 1, name: 'Updated Salon' };
            mockProvider.updateSalon.mockResolvedValue(updatedSalon);

            const result = await service.update(1, { name: 'Updated Salon' });

            expect(mockProvider.updateSalon).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Updated Salon' }));
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
            expect(result).toEqual(updatedSalon);
        });
    });

    describe('addUser / removeUser / getUsers', () => {
        it('should add a user to a salon', async () => {
            mockProvider.addUserToSalon.mockResolvedValue({ userId: 5, salonId: 1, role: 'Manager' });

            const result = await service.addUser(1, 5, 'Manager');

            expect(mockProvider.addUserToSalon).toHaveBeenCalledWith(5, 1, 'Manager');
            expect(result.role).toBe('Manager');
        });

        it('should remove a user from a salon', async () => {
            mockProvider.removeUserFromSalon.mockResolvedValue(undefined);

            await service.removeUser(1, 5);

            expect(mockProvider.removeUserFromSalon).toHaveBeenCalledWith(5, 1);
            expect(mockProvider.createInteractionHistory).toHaveBeenCalled();
        });

        it('should return salon users', async () => {
            const users = [{ id: 1, name: 'Admin' }, { id: 2, name: 'Worker' }];
            mockProvider.getSalonUsers.mockResolvedValue(users);

            const result = await service.getUsers(1);

            expect(result).toEqual(users);
        });
    });
});
