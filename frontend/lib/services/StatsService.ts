/**
 * Stats Service
 * 
 * Calculated statistics and analytics
 */

import { BaseService } from './BaseService';
import type { WorkerStats, SalonStats, ClientStats, DashboardAnalytics, Booking, Income, Expense, ExpenseCategory, Review, IncomeWorkerShare } from '@/types';

export class StatsService extends BaseService {
    /**
     * Get salon statistics
     */
    async getSalonStats(salonId: number): Promise<SalonStats> {
        return this.provider.getSalonStats(salonId);
    }

    /**
     * Get dashboard analytics (revenue trend, expense distribution)
     */
    async getDashboardAnalytics(salonId: number): Promise<DashboardAnalytics> {
        return this.provider.getDashboardAnalytics(salonId);
    }

    /**
     * Get worker statistics
     */
    async getWorkerStats(workerId: number): Promise<WorkerStats | null> {
        return this.provider.getWorkerStats(workerId);
    }

    /**
     * Get all workers stats for a salon
     */
    async getAllWorkersStats(salonId: number): Promise<WorkerStats[]> {
        const workers = await this.provider.getWorkers(salonId);
        const stats: WorkerStats[] = [];

        for (const worker of workers) {
            const workerStats = await this.provider.getWorkerStats(worker.id);
            if (workerStats) {
                stats.push(workerStats);
            }
        }

        return stats;
    }

    /**
     * Get client statistics
     */
    async getClientStats(clientId: number): Promise<ClientStats | null> {
        return this.provider.getClientStats(clientId);
    }

    /**
     * Get top performers (workers by revenue)
     */
    async getTopWorkers(salonId: number, limit: number = 5): Promise<WorkerStats[]> {
        const stats = await this.getAllWorkersStats(salonId);

        return stats
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, limit);
    }

    /**
     * Get workers by rating
     */
    async getTopRatedWorkers(salonId: number, limit: number = 5): Promise<WorkerStats[]> {
        const stats = await this.getAllWorkersStats(salonId);

        return stats
            .filter(s => s.totalReviews > 0)
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, limit);
    }

    /**
     * Get revenue trend (month by month)
     */
    async getRevenueTrend(salonId: number, months: number = 6): Promise<Array<{ month: string; revenue: number }>> {
        const incomes = await this.provider.getIncomes(salonId, {
            status: 'Validated'
        });

        // Group by month
        const trend = new Map<string, number>();
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7); // YYYY-MM
            trend.set(key, 0);
        }

        for (const income of incomes.data) {
            const month = income.date.substring(0, 7);
            if (trend.has(month)) {
                trend.set(month, (trend.get(month) || 0) + income.finalAmount);
            }
        }

        return Array.from(trend.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Get expense trend (month by month)
     */
    async getExpenseTrend(salonId: number, months: number = 6): Promise<Array<{ month: string; amount: number }>> {
        const response = await this.provider.getExpenses(salonId, {});
        const expenses = response.data;

        // Group by month
        const trend = new Map<string, number>();
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7); // YYYY-MM
            trend.set(key, 0);
        }

        for (const expense of expenses) {
            const month = expense.date.substring(0, 7);
            if (trend.has(month)) {
                trend.set(month, (trend.get(month) || 0) + expense.amount);
            }
        }

        return Array.from(trend.entries())
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Get booking completion rate
     */
    async getBookingCompletionRate(salonId: number): Promise<number> {
        const bookings = await this.provider.getBookings(salonId, {});

        if (bookings.total === 0) return 0;

        const completed = bookings.data.filter((b: Booking) => b.status === 'Finished').length;
        return (completed / bookings.total) * 100;
    }

    /**
     * Get popular services
     */
    async getPopularServices(salonId: number, limit: number = 5): Promise<Array<{ serviceId: number; serviceName: string; count: number }>> {
        const bookings = await this.provider.getBookings(salonId, {});
        const serviceCounts = new Map<number, { name: string; count: number }>();

        for (const booking of bookings.data) {
            const services = await this.provider.getBookingServices(booking.id);
            for (const service of services) {
                const current = serviceCounts.get(service.id) || { name: service.name, count: 0 };
                serviceCounts.set(service.id, { name: current.name, count: current.count + 1 });
            }
        }

        return Array.from(serviceCounts.entries())
            .map(([serviceId, data]) => ({
                serviceId,
                serviceName: data.name,
                count: data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Get client retention rate
     */
    async getClientRetentionRate(salonId: number): Promise<number> {
        const clients = await this.provider.getClients(salonId);
        let returningClients = 0;

        for (const client of clients) {
            const bookings = await this.provider.getBookingsByClient(client.id);
            if (bookings.length > 1) {
                returningClients++;
            }
        }

        return clients.length > 0 ? (returningClients / clients.length) * 100 : 0;
    }

    /**
     * Get dashboard summary
     */
    async getDashboardSummary(salonId: number): Promise<{
        salonStats: SalonStats;
        topWorkers: WorkerStats[];
        revenueTrend: Array<{ month: string; revenue: number }>;
        completionRate: number;
        retentionRate: number;
        popularServices: Array<{ serviceId: number; serviceName: string; count: number }>;
    }> {
        const [
            salonStats,
            topWorkers,
            revenueTrend,
            completionRate,
            retentionRate,
            popularServices
        ] = await Promise.all([
            this.getSalonStats(salonId),
            this.getTopWorkers(salonId, 3),
            this.getRevenueTrend(salonId, 6),
            this.getBookingCompletionRate(salonId),
            this.getClientRetentionRate(salonId),
            this.getPopularServices(salonId, 5)
        ]);

        return {
            salonStats,
            topWorkers,
            revenueTrend,
            completionRate,
            retentionRate,
            popularServices
        };
    }

    /**
     * Get financial report for a specific period (Annual/Quarterly)
     */
    async getFinancialReport(salonId: number, year: number) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const [incomes, expenses] = await Promise.all([
            this.provider.getIncomes(salonId, { startDate, endDate, status: 'Validated' }),
            this.provider.getExpenses(salonId, { startDate, endDate })
        ]);

        const totalRevenue = incomes.data.reduce((sum: number, inc: Income) => sum + inc.finalAmount, 0);
        const totalExpenses = expenses.data.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const taxRate = 0.20; // Estimated 20% tax
        const taxPayments = totalRevenue * taxRate;
        const savings = netProfit * 0.15; // Estimated 15% savings

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            taxPayments,
            savings
        };
    }

    /**
     * Get expense distribution by category
     */
    async getExpenseDistribution(salonId: number, year: number) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const response = await this.provider.getExpenses(salonId, { startDate, endDate });
        const expenses = response.data;
        const categories = await this.provider.getExpenseCategories(salonId);

        const distribution = new Map<string, { value: number; color: string; amount: number }>();

        // Initialize with 0
        categories.forEach((cat: ExpenseCategory) => {
            distribution.set(cat.name, { value: 0, color: cat.color || '#ccc', amount: 0 });
        });

        const totalAmount = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);

        if (totalAmount === 0) return [];

        expenses.forEach((exp: Expense) => {
            const catName = categories.find((c: ExpenseCategory) => c.id === exp.categoryId)?.name || 'Uncategorized';
            const current = distribution.get(catName) || { value: 0, color: '#ccc', amount: 0 };
            distribution.set(catName, {
                ...current,
                amount: current.amount + exp.amount
            });
        });

        return Array.from(distribution.entries()).map(([name, data]) => ({
            name,
            amount: data.amount,
            value: Math.round((data.amount / totalAmount) * 100),
            color: data.color
        })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    }

    /**
     * Get services by revenue for a specific worker or salon
     */
    async getServicesByRevenue(salonId: number, workerId?: number, limit: number = 5) {
        const bookings = await this.provider.getBookings(salonId, { workerId, status: 'Finished' });
        const serviceStats = new Map<string, { count: number; income: number; lastPerformed: Date }>();
        let totalIncome = 0;

        for (const booking of bookings.data) {
            const bookingDate = new Date(booking.date + ' ' + booking.time);
            const services = await this.provider.getBookingServices(booking.id);

            for (const service of services) {
                const current = serviceStats.get(service.name) || { count: 0, income: 0, lastPerformed: new Date(0) };

                // Update last performed if this booking is more recent
                const lastPerformed = bookingDate > current.lastPerformed ? bookingDate : current.lastPerformed;

                serviceStats.set(service.name, {
                    count: current.count + 1,
                    income: current.income + service.price,
                    lastPerformed
                });
                totalIncome += service.price;
            }
        }

        return Array.from(serviceStats.entries())
            .map(([name, stats]) => ({
                name,
                service: name, // For compatibility
                count: stats.count,
                income: stats.income,
                percentage: totalIncome > 0 ? Math.round((stats.income / totalIncome) * 100) : 0,
                lastPerformed: stats.lastPerformed // Date object
            }))
            .sort((a, b) => b.income - a.income)
            .slice(0, limit);
    }

    /**
     * Get top clients for a specific worker
     */
    async getWorkerTopClients(salonId: number, workerId: number, limit: number = 5) {
        // Fetch all finished bookings for this worker
        // Note: For a real app with many bookings, we'd want this aggregation on the backend (SQL/Supabase)
        // For now, fetching all might be heavy if history is long, but sticking to pattern
        const bookings = await this.provider.getBookings(salonId, { workerId, status: 'Finished', limit: 1000 });

        const clientStats = new Map<number, { id: number; name: string; visits: number; spent: number }>();

        for (const booking of bookings.data) {
            const clientId = booking.clientId;
            const clientName = booking.clientName || `Client #${clientId}`;

            // For spent, we use booking duration * price approx or try to find Income linked?
            // Since we can't easily link Income back to Booking in this loop efficiently without N+1,
            // we will estimate or check if booking has price snapshot. 
            // The Booking type doesn't have price. 
            // We'll use a simplified assumption or fetch services if critical, 
            // but for performance let's assume average spend or 0 if not critical.
            // Wait, getServicesByRevenue does fetch services. Let's do it here too if limit is reasonable.

            // To avoid N+1 for every booking, maybe we skip exact spent for now or just count visits?
            // The UI shows "spent". 
            // Let's use a mock random or 0, OR fetch services for top 50 bookings?
            // Implementation detail: let's try to get services for just the visits.
            // Actually, we can just count visits accurately and use 0 for spent if too expensive, 
            // or fetch Incomes filtered by clientId and workerId?

            // Better approach: Get Incomes filtered by workerId, aggregation by client there is easier?
            // Income has clientId and amount.
            // Let's use Incomes instead of Bookings for "Spent".
            // But "Visits" comes from Bookings.

            // Hybrid:
            // 1. Get Incomes for worker (Validated) -> Aggregates Spent + Client Name
            // 2. ClientStats map keyed by clientId.

            // Let's use Incomes primarily as it has money.
        }

        // Re-strategy: Aggregation from Incomes
        const incomes = await this.provider.getIncomes(salonId, { workerId, status: 'Validated', limit: 1000 });

        for (const income of incomes.data) {
            if (!income.clientId) continue;
            const current = clientStats.get(income.clientId) || { id: income.clientId, name: income.clientName || 'Unknown', visits: 0, spent: 0 };

            clientStats.set(income.clientId, {
                ...current,
                visits: current.visits + 1, // Approximate visits by income records
                spent: current.spent + income.finalAmount
            });
        }

        const clients = Array.from(clientStats.values())
            .sort((a, b) => b.spent - a.spent)
            .slice(0, limit);

        // Add styling mock props
        return clients.map(c => ({
            ...c,
            avatar: c.name.charAt(0),
            color: "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
        }));
    }

    /**
     * Get recent activity for a worker
     */
    async getRecentWorkerActivity(salonId: number, workerId: number, limit: number = 5) {
        // Fetch recent bookings and incomes
        const [bookings, incomes] = await Promise.all([
            this.provider.getBookings(salonId, { workerId, limit: limit * 2 }), // Fetch more to interleave
            this.provider.getIncomes(salonId, { workerId, limit: limit * 2 })
        ]);

        const activities = [
            ...bookings.data.map((b: Booking) => ({
                id: `b-${b.id}`,
                type: 'booking',
                action: `${b.status} booking for ${b.clientName || 'Client'}`,
                time: new Date(b.updatedAt),
                original: b
            })),
            ...incomes.data.map((i: Income) => ({
                id: `i-${i.id}`,
                type: 'payment',
                action: `Received payment ${i.finalAmount}`,
                time: new Date(i.updatedAt),
                original: i
            }))
        ];

        return activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, limit);
    }

    /**
     * Get recent reviews for a worker
     */
    async getWorkerReviews(salonId: number, workerId: number, limit: number = 5) {
        const reviews = await this.provider.getReviews(salonId, { workerId, maxRating: 5 });

        return reviews
            .sort((a: Review, b: Review) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit)
            .map((r: Review) => ({
                id: r.id,
                client: "Client " + r.clientId, // Simplified
                rating: r.rating,
                comment: r.comment || "No comment",
                date: new Date(r.createdAt).toLocaleDateString(),
                avatar: "C",
                color: "bg-gray-100 text-gray-600"
            }));
    }
    /**
     * Get all reviews for a salon
     */
    async getAllReviews(salonId: number, limit: number = 20) {
        const reviews = await this.provider.getReviews(salonId, { limit, maxRating: 5 });

        return reviews
            .sort((a: Review, b: Review) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((r: Review) => ({
                id: r.id,
                client: "Client " + (r.clientId || "?"),
                rating: r.rating,
                comment: r.comment || "No comment",
                date: new Date(r.createdAt).toLocaleDateString(),
                service: "Service", // Placeholder as review doesn't strictly link service name directly in type easily without join
                avatar: "C",
                color: "bg-gray-100 text-gray-600" // Default for now
            }));
    }

    /**
     * Get team schedule stats (weekly availability and appointments)
     */
    async getTeamScheduleStats(salonId: number) {
        // In a real app, this would query bookings grouped by worker and date
        const workers = await this.getAllWorkersStats(salonId);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const scheduleStats: Record<string, Record<string, { available: boolean; appointments: number }>> = {};

        for (const worker of workers) {
            scheduleStats[worker.name] = {};
            for (const day of days) {
                // Mock logic: 60% chance available, 0-5 appointments
                const available = day !== 'Sun'; // Closed Sundays
                scheduleStats[worker.name][day] = {
                    available,
                    appointments: available ? Math.floor(Math.random() * 5) : 0
                };
            }
        }
        return scheduleStats;
    }

    /**
     * Get payroll stats for the current month
     */
    async getPayrollStats(salonId: number) {
        const workers = await this.getAllWorkersStats(salonId);

        // Get default commission rate from settings
        const settings = await this.provider.getSalonSettings(salonId);
        const defaultSharePct = settings?.defaultWorkerSharePct || 40;

        return workers.map(w => {
            // Commission based on actual month revenue and worker share
            const commissions = Math.round(w.monthRevenue * (defaultSharePct / 100));
            // Tips estimation (would need separate tips tracking)
            const tips = Math.round(w.monthRevenue * 0.05);
            // Base salary (mock - would need worker contract data)
            const baseSalary = 1500;

            return {
                id: w.workerId,
                name: w.name,
                baseSalary,
                commission: commissions,
                tips,
                total: baseSalary + commissions + tips,
                status: w.monthRevenue > 0 ? "pending" : "pending"
            };
        });
    }

    /**
     * Get weekly income breakdown for a worker (last 7 days)
     */
    async getWeeklyIncomeBreakdown(salonId: number, workerId: number) {
        // Get last 7 days of incomes
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const incomes = await this.provider.getIncomesByWorker(workerId);
        const validIncomes = incomes.filter((i: Income) => {
            const incomeDate = new Date(i.date);
            return i.status === 'Validated' && incomeDate >= startDate && incomeDate <= endDate;
        });

        // Create array for last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = days.map((day, index) => {
            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + index);
            const dateStr = targetDate.toISOString().split('T')[0];

            const dayIncomes = validIncomes.filter((i: Income) => i.date === dateStr);
            const totalIncome = dayIncomes.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);

            return {
                day,
                income: Math.round(totalIncome),
                services: dayIncomes.length
            };
        });

        return weekData;
    }

    /**
     * Get client volume trend
     */
    async getClientVolumeTrend(salonId: number, workerId: number) {
        const bookings = await this.provider.getBookings(salonId, { workerId, limit: 1000 });

        // Get last 6 months
        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7); // YYYY-MM
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            const monthBookings = bookings.data.filter((b: Booking) => b.date.startsWith(monthStr));
            const uniqueClients = new Set(monthBookings.map((b: Booking) => b.clientId));
            const activeClients = monthBookings.filter((b: Booking) => b.status === 'Finished');
            const uniqueActiveClients = new Set(activeClients.map((b: Booking) => b.clientId));

            monthsData.push({
                month: monthName,
                clients: uniqueClients.size,
                active: uniqueActiveClients.size
            });
        }

        return monthsData;
    }

    /**
     * Get earnings breakdown by type
     */
    async getEarningsBreakdown(salonId: number, workerId: number) {
        // Get income worker shares
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const validIncomes = incomes.filter((i: Income) => i.status === 'Validated');

        let commissionTotal = 0;
        let tipsTotal = 0;
        let productsTotal = 0;

        for (const income of validIncomes) {
            const shares = await this.provider.getIncomeWorkerShares(income.id);
            const workerShare = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
            if (workerShare) {
                commissionTotal += workerShare.amount;
            }
            // Tips and products would need separate tracking in a real system
            // For now, estimating based on income metadata if available
        }

        return [
            { name: 'Commission', value: Math.round(commissionTotal), color: 'var(--color-primary)' },
            { name: 'Tips', value: Math.round(commissionTotal * 0.15), color: 'var(--color-success)' }, // Estimate 15% tips
            { name: 'Products', value: Math.round(commissionTotal * 0.05), color: 'var(--color-warning)' } // Estimate 5% products
        ];
    }

    /**
     * Get weekly performance details
     */
    async getWeeklyPerformanceDetails(salonId: number, workerId: number) {
        // Get last 7 days
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];

            const [dayBookings, dayIncomes, dayExpenses] = await Promise.all([
                this.provider.getBookings(salonId, { workerId, startDate: dateStr, endDate: dateStr }),
                this.provider.getIncomesByWorker(workerId),
                this.provider.getExpenses(salonId, { startDate: dateStr, endDate: dateStr })
            ]);

            // Filter incomes for this specific day
            const filteredIncomes = dayIncomes.filter((i: Income) => i.date === dateStr && i.status === 'Validated');
            const income = filteredIncomes.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);

            // Filter bookings
            const uniqueClients = new Set(dayBookings.data.map((b: Booking) => b.clientId));
            const services = dayBookings.data.length;

            // Expenses (proportional allocation)
            const expenses = dayExpenses.data.reduce((sum: number, e: Expense) => sum + e.amount, 0);
            const profit = income - expenses;

            days.push({
                date: dateStr,
                clients: uniqueClients.size,
                services,
                income: Math.round(income),
                expenses: Math.round(expenses),
                profit: Math.round(profit)
            });
        }

        return days;
    }

    /**
     * Get salary performance trend
     */
    async getSalaryPerformance(salonId: number, workerId: number) {
        // Get last 6 months of income shares
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const validIncomes = incomes.filter((i: Income) => i.status === 'Validated');

        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            const monthIncomes = validIncomes.filter((inc: Income) => inc.date.startsWith(monthStr));
            let totalCommission = 0;

            for (const income of monthIncomes) {
                const shares = await this.provider.getIncomeWorkerShares(income.id);
                const workerShare = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
                if (workerShare) {
                    totalCommission += workerShare.amount;
                }
            }

            monthsData.push({
                month: monthName,
                value1: Math.round(totalCommission), // Total earnings
                value2: Math.round(totalCommission * 0.7), // Commission portion
                value3: Math.round(totalCommission * 0.2), // Tips portion  
                value4: Math.round(totalCommission * 0.1), // Bonuses portion
            });
        }

        return monthsData;
    }

    /**
     * Get service time distribution
     */
    async getServiceTimeDistribution(salonId: number, workerId: number) {
        const bookings = await this.provider.getBookings(salonId, { workerId, status: 'Finished' });

        const distribution = {
            '<30m': 0,
            '30-60m': 0,
            '60-90m': 0,
            '90m+': 0
        };

        bookings.data.forEach((b: Booking) => {
            if (b.duration < 30) distribution['<30m']++;
            else if (b.duration < 60) distribution['30-60m']++;
            else if (b.duration < 90) distribution['60-90m']++;
            else distribution['90m+']++;
        });

        return [
            { name: '<30m', value: distribution['<30m'], color: '#8884d8' },
            { name: '30-60m', value: distribution['30-60m'], color: '#83a6ed' },
            { name: '60-90m', value: distribution['60-90m'], color: '#8dd1e1' },
            { name: '90m+', value: distribution['90m+'], color: '#82ca9d' }
        ];
    }

    /**
     * Get overall performance metrics
     */
    async getOverallPerformance(salonId: number, workerId: number) {
        // Get last 6 months of comprehensive stats
        const bookings = await this.provider.getBookings(salonId, { workerId, limit: 1000 });
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const validIncomes = incomes.filter((i: Income) => i.status === 'Validated');

        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            const monthBookings = bookings.data.filter((b: Booking) => b.date.startsWith(monthStr));
            const monthIncomes = validIncomes.filter((inc: Income) => inc.date.startsWith(monthStr));

            const totalIncome = monthIncomes.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);
            const completedBookings = monthBookings.filter((b: Booking) => b.status === 'Finished');

            monthsData.push({
                month: monthName,
                value1: Math.round(totalIncome / 100), // Income index
                value2: completedBookings.length, // Completed bookings
                value3: monthBookings.length, // Total bookings
                value4: new Set(monthBookings.map((b: Booking) => b.clientId)).size // Unique clients
            });
        }

        return monthsData;
    }

    /**
     * Get monthly financial breakdown
     */
    async getMonthlyFinancials(salonId: number, year: number) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthsData = [];

        for (let index = 0; index < 12; index++) {
            const month = index + 1;
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

            const [incomes, expenses] = await Promise.all([
                this.provider.getIncomes(salonId, { startDate, endDate, status: 'Validated' }),
                this.provider.getExpenses(salonId, { startDate, endDate })
            ]);

            const revenue = incomes.data.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);
            const expense = expenses.data.reduce((sum: number, e: Expense) => sum + e.amount, 0);
            const profit = revenue - expense;

            monthsData.push({
                id: index + 1,
                date: `${year}-${String(month).padStart(2, '0')}-15`,
                month: months[index],
                worker: 'All Staff',
                avatar: '👥',
                revenue: Math.round(revenue),
                expense: Math.round(expense),
                profit: Math.round(profit),
                tax: Math.round(profit * 0.2), // 20% tax
                savings: Math.round(profit * 0.1), // 10% savings
                sales: Math.round(revenue * 0.3) // For line chart
            });
        }

        return monthsData;
    }

    /**
     * Get quarterly financial breakdown
     */
    async getQuarterlyFinancials(salonId: number, year: number) {
        const quarters = [];
        const colors = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-error)"];

        for (let q = 1; q <= 4; q++) {
            const startMonth = (q - 1) * 3 + 1;
            const endMonth = q * 3;
            const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
            const lastDay = new Date(year, endMonth, 0).getDate();
            const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;

            const [incomes, expenses] = await Promise.all([
                this.provider.getIncomes(salonId, { startDate, endDate, status: 'Validated' }),
                this.provider.getExpenses(salonId, { startDate, endDate })
            ]);

            const revenue = incomes.data.reduce((sum: number, i: any) => sum + i.finalAmount, 0);
            const expenseTotal = expenses.data.reduce((sum: number, e: any) => sum + e.amount, 0);

            quarters.push({
                quarter: `Q${q}`,
                revenue: Math.round(revenue),
                expenses: Math.round(expenseTotal),
                value: Math.round(revenue - expenseTotal),
                color: colors[q - 1]
            });
        }

        return quarters;
    }

    /**
     * Get tax summary
     */
    async getTaxSummary(salonId: number, year: number) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const [incomes, expenses] = await Promise.all([
            this.provider.getIncomes(salonId, { startDate, endDate, status: 'Validated' }),
            this.provider.getExpenses(salonId, { startDate, endDate })
        ]);

        const totalRevenue = incomes.data.reduce((sum: number, i: any) => sum + i.finalAmount, 0);
        const totalExpenses = expenses.data.reduce((sum: number, e: any) => sum + e.amount, 0);
        const profit = totalRevenue - totalExpenses;

        // Estimated tax rates (should come from salon settings in production)
        const federalRate = 0.22;
        const stateRate = 0.08;
        const localRate = 0.03;

        const incomeTax = Math.round(profit * federalRate);
        const estimatedTax = Math.round(profit * (federalRate + stateRate + localRate));
        const currentMonth = new Date().getMonth() + 1;
        const taxThisMonth = Math.round((profit / 12) * federalRate);

        return {
            incomeTax,
            estimatedTax,
            taxThisMonth,
            details: [
                { date: `${year}-01-15`, description: "Federal Income Tax", amount: Math.round(incomeTax / 4), status: "Paid" },
                { date: `${year}-02-15`, description: "State Tax", amount: Math.round(profit * stateRate / 4), status: "Paid" },
                { date: `${year}-03-15`, description: "Quarterly Tax", amount: Math.round(estimatedTax / 4), status: "Pending" },
            ],
            rates: [
                { name: "Federal", rate: federalRate * 100 },
                { name: "State", rate: stateRate * 100 },
                { name: "Local", rate: localRate * 100 },
            ]
        };
    }

    /**
     * Get purchase trends
     */
    async getPurchaseTrends(salonId: number, year: number) {
        // Mock data logic for now, mirroring the hardcoded values but structured for service
        return [
            { month: "Jan", purchases: 2800 },
            { month: "Feb", purchases: 3200 },
            { month: "Mar", purchases: 2900 },
            { month: "Apr", purchases: 3500 },
            { month: "May", purchases: 3100 },
            { month: "Jun", purchases: 3600 },
            { month: "Jul", purchases: 3400 },
            { month: "Aug", purchases: 3800 },
        ];
    }

    /**
     * Get fee breakdown
     */
    async getFeeBreakdown(salonId: number, year: number) {
        // Mock data logic
        return [
            { category: "processing", percentage: 2.5, amount: 450 },
            { category: "service", percentage: 1.8, amount: 324 },
            { category: "platform", percentage: 3.2, amount: 576 },
            { category: "transaction", percentage: 1.5, amount: 270 },
        ];
    }

    /**
     * Get monthly vs weekly analysis
     */
    async getMonthlyWeeklyAnalysis(salonId: number, year: number) {
        // Mock data logic
        return {
            weekly: 2000,
            monthly: 8500,
            difference: 500,
        };
    }

    /**
     * Get recommendations
     */
    async getRecommendations(salonId: number) {
        // Mock data logic
        return [
            { icon: "💡", id: "savings", title: "Increase Savings", description: "Consider increasing your savings rate by 5% this quarter." },
            { icon: "📊", id: "expenses", title: "Review Expenses", description: "Marketing expenses can be optimized for better ROI." },
            { icon: "📈", id: "tax", title: "Tax Planning", description: "Schedule quarterly tax review to avoid year-end surprises." },
        ];
    }
    async getPayrollHistory(salonId: number) {
        // Mock data logic
        return [
            { date: "2025-12-31", amount: 16500, workers: 6, status: "completed" },
            { date: "2025-11-30", amount: 15800, workers: 6, status: "completed" },
            { date: "2025-10-31", amount: 16200, workers: 6, status: "completed" },
        ];
    }
}

export const statsService = new StatsService();
