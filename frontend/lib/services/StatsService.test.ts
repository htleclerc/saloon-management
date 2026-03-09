import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from './StatsService';
import { PerformanceStatsService } from './PerformanceStatsService';
import { DataProviderFactory } from '../providers/types';

// Mock DataProviderFactory
vi.mock('../providers/types', () => ({
    DataProviderFactory: {
        create: vi.fn()
    }
}));

describe('StatsService', () => {
    let service: StatsService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getSalonStats: vi.fn(),
            getDashboardAnalytics: vi.fn(),
            getClientStats: vi.fn(),
            getClients: vi.fn(),
            getBookingsByClient: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new StatsService();
    });

    it('should fetch and return salon stats', async () => {
        const mockStats = {
            totalRevenue: 5000,
            totalExpenses: 2000,
            netIncome: 3000,
            averageTicket: 45,
            totalBookings: 120,
            clientRetention: 65
        };

        mockProvider.getSalonStats.mockResolvedValue(mockStats);

        const stats = await service.getSalonStats(1);

        expect(mockProvider.getSalonStats).toHaveBeenCalledWith(1);
        expect(stats.totalRevenue).toBe(5000);
    });

    it('should fetch dashboard analytics', async () => {
        const mockAnalytics = { revenue: 1000, expenses: 500 };
        mockProvider.getDashboardAnalytics.mockResolvedValue(mockAnalytics);

        const result = await service.getDashboardAnalytics(1);
        expect(mockProvider.getDashboardAnalytics).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockAnalytics);
    });
});

describe('PerformanceStatsService', () => {
    let service: PerformanceStatsService;
    let mockProvider: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvider = {
            getWorkerStats: vi.fn(),
            getWorkers: vi.fn(),
            getIncomes: vi.fn(),
            getIncomesByWorker: vi.fn(),
            getExpenses: vi.fn(),
            getBookings: vi.fn(),
            getBookingServices: vi.fn(),
            getIncomeWorkerShares: vi.fn(),
            getReviews: vi.fn(),
            getWorker: vi.fn(),
        };
        (DataProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
        service = new PerformanceStatsService();
    });

    it('should fetch and return worker stats', async () => {
        const workerId = 10;
        const mockWorkerStats = {
            workerId,
            totalRevenue: 1500,
            servicesCount: 40,
            averageRating: 4.8
        };

        mockProvider.getWorkerStats.mockResolvedValue(mockWorkerStats);

        const stats = await service.getWorkerStats(workerId);

        expect(mockProvider.getWorkerStats).toHaveBeenCalledWith(workerId);
        expect(stats?.totalRevenue).toBe(1500);
    });

    describe('getWeeklyPerformanceDetails', () => {
        it('should handle missing financial fields (NaN protection)', async () => {
            const salonId = 1;
            const workerId = 10;
            const dateStr = new Date().toISOString().split('T')[0];

            mockProvider.getBookings.mockResolvedValue({ data: [] });
            mockProvider.getIncomesByWorker.mockResolvedValue([
                { id: 1, date: dateStr, status: 'Validated' },
                { id: 2, date: dateStr, status: 'Validated', amount: 100 },
            ]);
            mockProvider.getExpenses.mockResolvedValue({
                data: [
                    { id: 1, amount: null }
                ]
            });

            const days = await service.getWeeklyPerformanceDetails(salonId, workerId);
            const today = days.find(d => d.date === dateStr);

            expect(today).toBeDefined();
            expect(today?.income).toBe(100);
            expect(today?.expenses).toBe(0);
            expect(Number.isNaN(today?.income)).toBe(false);
            expect(Number.isNaN(today?.expenses)).toBe(false);
        });
    });

    describe('getMonthlyEarningsByService', () => {
        it('should aggregate revenue by monthly service (last 6 months)', async () => {
            const salonId = 1;
            const workerId = 10;
            const now = new Date();
            const currentMonthStr = now.toISOString().substring(0, 7);

            mockProvider.getIncomes.mockResolvedValue({
                data: [
                    { id: 1, date: `${currentMonthStr}-01`, status: 'Validated', amount: 100, serviceNames: ['Haircut'] },
                    { id: 2, date: `${currentMonthStr}-02`, status: 'Validated', amount: 50, serviceNames: ['Haircut', 'Wash'] },
                ]
            });

            const data = await service.getMonthlyEarningsByService(salonId, workerId);

            expect(data).toHaveLength(6);
            const currentEntry = data.find(d => d.fullDate === currentMonthStr);
            expect(currentEntry).toBeDefined();
            expect(currentEntry?.Haircut).toBe(125);
            expect(currentEntry?.Wash).toBe(25);
        });
    });
});
