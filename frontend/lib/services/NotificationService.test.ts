
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService } from './NotificationService';

// Define mocks using vi.hoisted to allow access in tests and factory
const mocks = vi.hoisted(() => {
    return {
        single: vi.fn(),
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        from: vi.fn(),
    };
});

// Chain setup
mocks.insert.mockReturnValue({ select: mocks.select });
mocks.select.mockReturnValue({ single: mocks.single, eq: mocks.eq }); // select returns builder that has eq
mocks.eq.mockReturnValue({ order: mocks.order, eq: mocks.eq }); // eq returns builder
mocks.order.mockReturnValue({ limit: mocks.limit });
mocks.from.mockReturnValue({
    insert: mocks.insert,
    select: mocks.select,
    update: mocks.update
});
mocks.update.mockReturnValue({ eq: mocks.eq });

vi.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: mocks.from
    }
}));

// Mock BroadcastChannel
const mockPostMessage = vi.fn();
class MockBroadcastChannel {
    name: string;
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
    constructor(name: string) {
        this.name = name;
    }
    postMessage = mockPostMessage;
    close = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
}

global.BroadcastChannel = MockBroadcastChannel as any;

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new NotificationService();
    });

    it('should try DB insert on create and return result if successful', async () => {
        const notifData = {
            userCode: 'ADM-000',
            title: 'Test',
            message: 'Hello'
        };

        const mockDBResponse = {
            data: { id: 123, user_code: 'ADM-000', title: 'Test', message: 'Hello', created_at: new Date().toISOString(), is_read: false },
            error: null
        };

        // Setup mock return
        mocks.single.mockResolvedValue(mockDBResponse);

        const result = await service.create(notifData);

        expect(mocks.from).toHaveBeenCalledWith('notifications');
        expect(mocks.insert).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ user_code: 'ADM-000' })]));
        expect(result.id).toBe('123');
        // If DB succeeds, we don't necessarily broadcast in the current implementation? 
        // Actually the code says: Try DB -> Fallback Broadcast. 
        // Wait, checking logic:
        // if (!error && created) { return ... } else { warn; broadcast }
        // So if DB works, NO broadcast.
        expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('should fallback to BroadcastChannel if DB fails', async () => {
        const notifData = {
            userCode: 'WRK-123',
            title: 'Fallback',
            message: 'DB Failed'
        };

        // Simulate DB Error
        mocks.single.mockResolvedValue({ data: null, error: { message: 'RLS Error' } });

        const result = await service.create(notifData);

        expect(mocks.from).toHaveBeenCalledWith('notifications');
        // Should fallback to broadcast
        expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({
            type: 'NEW_NOTIFICATION',
            payload: expect.objectContaining({
                user_code: 'WRK-123',
                title: 'Fallback'
            })
        }));

        // Should return a fallback object
        expect(result.title).toBe('Fallback');
        expect(result.id).toBeDefined();
    });

    it('should get notifications for user from DB', async () => {
        const mockData = [
            { id: 1, user_code: 'ADM-000', title: 'N1', created_at: new Date().toISOString() },
            { id: 2, user_code: 'ADM-000', title: 'N2', created_at: new Date().toISOString() }
        ];

        mocks.limit.mockResolvedValue({ data: mockData, error: null });

        const results = await service.getForUser('ADM-000');

        expect(results).toHaveLength(2);
        expect(results[0].title).toBe('N1');
        expect(mocks.eq).toHaveBeenCalledWith('user_code', 'ADM-000');
    });

    it('should return empty array if DB fetch fails (graceful degradation)', async () => {
        mocks.limit.mockResolvedValue({ data: null, error: { message: 'Table not found' } });

        const results = await service.getForUser('ADM-000');

        expect(results).toEqual([]);
    });
});
