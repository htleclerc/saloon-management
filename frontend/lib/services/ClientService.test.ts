import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientService } from './ClientService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('ClientService', () => {
    let service: ClientService;
    let mockProvider: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getClients: vi.fn(),
            getClient: vi.fn(),
            createClient: vi.fn(),
            updateClient: vi.fn(),
            deleteClient: vi.fn(),
            getClientByEmail: vi.fn(),
            getClientStats: vi.fn(),
            createInteractionHistory: vi.fn()
        };
        (DataProviderFactory.create as any).mockReturnValue(mockProvider);
        service = new ClientService();
    });

    it('should throw error if email is invalid during creation', async () => {
        const data = {
            salonId: 1,
            name: 'John Client',
            email: 'invalid-email',
            phone: '1234567890'
        };

        await expect(service.create(data as any)).rejects.toThrow('Valid email is required');
    });

    it('should throw error if duplicate email exists in same salon', async () => {
        const data = {
            salonId: 1,
            name: 'John Client',
            email: 'john@example.com',
            phone: '1234567890'
        };

        mockProvider.getClientByEmail.mockResolvedValue({ id: 99, email: 'john@example.com' });

        await expect(service.create(data as any)).rejects.toThrow(/already exists in this salon/);
    });

    it('should format phone numbers correctly', () => {
        expect(service.formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
        expect(service.formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
        expect(service.formatPhoneNumber('123')).toBe('123'); // Too short to format
    });

    it('should call provider.createClient with correct data', async () => {
        const data = {
            salonId: 1,
            name: 'New Client',
            email: 'new@example.com',
            phone: '1234567890'
        };

        mockProvider.getClientByEmail.mockResolvedValue(null);
        mockProvider.createClient.mockResolvedValue({ id: 100, ...data });

        const result = await service.create(data as any);

        expect(mockProvider.createClient).toHaveBeenCalled();
        expect(result.id).toBe(100);
    });
});
