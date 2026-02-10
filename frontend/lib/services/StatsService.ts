/**
 * Stats Service
 * 
 * Calculated statistics and analytics
 */

import { BaseService } from './BaseService';
import type { WorkerStats, SalonStats, ClientStats, DashboardAnalytics, Booking, Income, Expense, ExpenseCategory, Review, IncomeWorkerShare } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths, subWeeks, subYears } from 'date-fns';

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
     * Refactored to use Incomes for better performance and alignment with revenue
     */
    async getPopularServices(salonId: number, limit: number = 5): Promise<Array<{ serviceId: number; serviceName: string; count: number }>> {
        const incomesResponse = await this.provider.getIncomes(salonId, {
            status: 'Validated',
            limit: 1000 // Reasonable sample size for popularity
        });

        const serviceCounts = new Map<string, { id: number; count: number }>();

        for (const income of incomesResponse.data) {
            const serviceIds = income.serviceIds || [];
            const serviceNames = income.serviceNames || [];

            for (let i = 0; i < serviceNames.length; i++) {
                const name = serviceNames[i];
                const id = serviceIds[i] || 0;

                const current = serviceCounts.get(name) || { id, count: 0 };
                serviceCounts.set(name, { id: current.id || id, count: current.count + 1 });
            }
        }

        // Fallback to Finished bookings if no validated incomes found (e.g. new salon or strictly booking-based)
        if (serviceCounts.size === 0) {
            const bookings = await this.provider.getBookings(salonId, { status: 'Finished', limit: 100 });
            for (const booking of bookings.data) {
                const services = await this.provider.getBookingServices(booking.id);
                for (const service of services) {
                    const current = serviceCounts.get(service.name) || { id: service.id, count: 0 };
                    serviceCounts.set(service.name, { id: current.id, count: current.count + 1 });
                }
            }
        }

        return Array.from(serviceCounts.entries())
            .map(([name, data]) => ({
                serviceId: data.id,
                serviceName: name,
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
     * Refactored to use Incomes for better accuracy and performance
     */
    async getServicesByRevenue(salonId: number, workerId?: number, limit: number = 5) {
        // Fetch incomes (Validated/Pending) and Confirmed bookings for potential revenue
        const [incomesResponse, bookingsResponse] = await Promise.all([
            this.provider.getIncomes(salonId, {
                workerId,
                limit: 500
            }),
            this.provider.getBookings(salonId, {
                workerId,
                status: 'Confirmed',
                limit: 100
            })
        ]);

        const serviceStats = new Map<string, { count: number; income: number; potentialIncome: number; lastPerformed: Date }>();
        let totalRevenue = 0;
        let totalPotential = 0;

        // 1. Process Incomes (Source of truth for actual and pending money)
        for (const income of incomesResponse.data) {
            const incomeDate = new Date(income.date);
            const services = income.serviceNames || [];
            if (services.length === 0) continue;

            const amountPerService = income.amount / services.length;
            const isActual = income.status === 'Validated' || income.status === 'Closed';

            for (const serviceName of services) {
                const current = serviceStats.get(serviceName) || {
                    count: 0,
                    income: 0,
                    potentialIncome: 0,
                    lastPerformed: new Date(0)
                };

                const lastPerformed = incomeDate > current.lastPerformed ? incomeDate : current.lastPerformed;

                if (isActual) {
                    current.income += amountPerService;
                    totalRevenue += amountPerService;
                } else {
                    current.potentialIncome += amountPerService;
                    totalPotential += amountPerService;
                }

                current.count += 1;
                current.lastPerformed = lastPerformed;
                serviceStats.set(serviceName, current);
            }
        }

        // 2. Process Confirmed Bookings (Pure potential revenue not yet in Income)
        // Note: In a real system, some Confirmed bookings might already have Pending incomes.
        // To simplify, we'll only count Bookings that don't look like they have an incomeId yet.
        const potentialBookings = bookingsResponse.data.filter((b: Booking) => !b.incomeId);

        for (const booking of potentialBookings) {
            const bookingDate = new Date(booking.date + ' ' + (booking.time || '00:00'));
            // Fetching services for each booking is expensive (N+1), but here bookingsResponse.data
            // doesn't have names. However, our provider.getBookings usually includes clientName
            // but not serviceNames.
            // Actually, let's try to get services if count is small.
            if (potentialBookings.length < 20) {
                const services = await this.provider.getBookingServices(booking.id);
                for (const service of services) {
                    const current = serviceStats.get(service.name) || {
                        count: 0,
                        income: 0,
                        potentialIncome: 0,
                        lastPerformed: new Date(0)
                    };

                    current.potentialIncome += service.price;
                    current.count += 1;
                    totalPotential += service.price;
                    if (bookingDate > current.lastPerformed) current.lastPerformed = bookingDate;
                    serviceStats.set(service.name, current);
                }
            }
        }

        // 3. Fallback to Finished bookings if no stats gathered yet
        if (serviceStats.size === 0) {
            const finishedBookings = await this.provider.getBookings(salonId, { workerId, status: 'Finished', limit: 100 });
            for (const booking of finishedBookings.data) {
                const bookingDate = new Date(booking.date + ' ' + (booking.time || '00:00'));
                const services = await this.provider.getBookingServices(booking.id);

                for (const service of services) {
                    const current = serviceStats.get(service.name) || { count: 0, income: 0, potentialIncome: 0, lastPerformed: new Date(0) };
                    if (bookingDate > current.lastPerformed) current.lastPerformed = bookingDate;

                    current.count += 1;
                    current.income += service.price;
                    totalRevenue += service.price;
                    serviceStats.set(service.name, current);
                }
            }
        }

        return Array.from(serviceStats.entries())
            .map(([name, stats]) => {
                const total = stats.income + stats.potentialIncome;
                return {
                    name,
                    service: name,
                    count: stats.count,
                    income: Math.round(stats.income),
                    potentialIncome: Math.round(stats.potentialIncome),
                    totalIncome: Math.round(total),
                    percentage: totalRevenue > 0 ? Math.round((stats.income / totalRevenue) * 100) : 0,
                    lastPerformed: stats.lastPerformed
                };
            })
            .sort((a, b) => b.totalIncome - a.totalIncome)
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

        // Combine raw items first to sort and slice
        const combined = [
            ...bookings.data.map((b: Booking) => ({
                type: 'booking',
                data: b as Booking,
                time: new Date(b.updatedAt)
            })),
            ...incomes.data.map((i: Income) => ({
                type: 'payment',
                data: i as Income,
                time: new Date(i.updatedAt)
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, limit);

        // Process final items with pre-joined data or fallback
        const activities = await Promise.all(combined.map(async (item) => {
            if (item.type === 'booking') {
                const b = item.data as Booking;
                return {
                    id: `b-${b.id}`,
                    type: 'booking',
                    metadata: {
                        status: b.status,
                        client: b.clientName || 'Client'
                    },
                    time: item.time,
                    original: b
                };
            } else {
                const i = item.data as Income;
                let receivedAmount = 0;

                // Optimization: Use pre-joined workerShares
                const workerShare = i.workerShares?.find((s: any) => s.workerId === workerId);

                if (workerShare) {
                    receivedAmount = (workerShare.amount || 0) + (workerShare.tips || 0);
                } else {
                    // Fallback to separate fetch if not joined
                    try {
                        const shares = await this.provider.getIncomeWorkerShares(i.id);
                        const share = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
                        if (share) {
                            receivedAmount = (share.amount || 0) + (share.tips || 0);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch shares for income ${i.id}`, err);
                    }
                }

                return {
                    id: `i-${i.id}`,
                    type: 'payment',
                    metadata: {
                        amount: Math.round(receivedAmount)
                    },
                    time: item.time,
                    original: i
                };
            }
        }));

        return activities;
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
            .slice(0, limit)
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
        const workers = await this.getAllWorkersStats(salonId);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const today = new Date();

        // Get start of week (Monday)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay() || 7; // Get current day number, converting Sun (0) to 7
        if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
        else startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Fetch all bookings for this week
        const bookings = await this.provider.getBookings(salonId, {
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0]
        });

        const scheduleStats: Record<string, Record<string, { available: boolean; appointments: number }>> = {};

        for (const worker of workers) {
            scheduleStats[worker.name] = {};

            // Get worker details for schedule
            const workerDetails = await this.provider.getWorker(worker.workerId);
            const weeklySchedule = workerDetails?.weeklySchedule || {};

            for (let i = 0; i < days.length; i++) {
                const dayName = days[i];

                // Determine availability from worker schedule
                let isAvailable = false;
                if (weeklySchedule[dayName]) {
                    isAvailable = weeklySchedule[dayName].active;
                } else {
                    // Default fallback if no schedule set: Mon-Fri 9-5
                    isAvailable = i < 5;
                }

                // Count bookings for this worker on this day
                // Calculate date for this day of week
                const currentDayDate = new Date(startOfWeek);
                currentDayDate.setDate(startOfWeek.getDate() + i);
                const dateStr = currentDayDate.toISOString().split('T')[0];

                const dayBookings = bookings.data.filter((b: Booking) => {
                    // Check if worker is assigned
                    const hasWorker = b.workerIds?.includes(worker.workerId);
                    return b.date === dateStr && hasWorker && b.status !== 'Cancelled';
                });

                scheduleStats[worker.name][dayName] = {
                    available: isAvailable,
                    appointments: dayBookings.length
                };
            }
        }
        return scheduleStats;
    }

    /**
     * Get payroll stats for the current month
     */
    async getPayrollStats(salonId: number) {
        const workers = await this.provider.getWorkers(salonId);

        return Promise.all(workers.map(async (w: any) => {
            const stats = await this.provider.getWorkerStats(w.id);

            // Commission from explicit worker shares
            const commissions = Math.round(stats?.monthCommission || 0);
            // Actual tips stored in the database
            const tips = Math.round(stats?.monthTips || 0);
            // Base salary from worker profile
            const baseSalary = w.baseSalary || 0;

            return {
                id: w.id,
                userId: w.userId,
                name: w.name,
                baseSalary,
                commission: commissions,
                tips,
                total: baseSalary + commissions + tips,
                status: (stats?.monthRevenue || 0) > 0 ? "pending" : "pending"
            };
        }));
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

            const dayIncomes = incomes.filter((i: Income) => i.date === dateStr);
            const actualIncome = dayIncomes
                .filter((i: Income) => i.status === 'Validated' || i.status === 'Closed')
                .reduce((sum: number, i: Income) => sum + i.finalAmount, 0);
            const potentialIncome = dayIncomes
                .filter((i: Income) => i.status === 'Pending')
                .reduce((sum: number, i: Income) => sum + i.finalAmount, 0);

            return {
                day,
                income: Math.round(actualIncome),
                potentialIncome: Math.round(potentialIncome),
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
            // Optimization: Use pre-joined workerShares
            const workerShare = income.workerShares?.find((s: any) => s.workerId === workerId);

            if (workerShare) {
                commissionTotal += workerShare.amount;
                tipsTotal += workerShare.tips || 0;
            } else {
                // Fallback to separate fetch if not joined
                const shares = await this.provider.getIncomeWorkerShares(income.id);
                const share = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
                if (share) {
                    commissionTotal += share.amount;
                    tipsTotal += share.tips || 0;
                }
            }

            // Calculate products sold by this worker (if tracked in income)
            // Simplified: 0 for now until product sales are tracked per worker
            productsTotal += 0;
        }

        return [
            { name: 'Commission', value: Math.round(commissionTotal), color: 'var(--color-primary)' },
            { name: 'Tips', value: Math.round(tipsTotal), color: 'var(--color-success)' },
            { name: 'Products', value: Math.round(productsTotal), color: 'var(--color-warning)' }
        ];
    }

    /**
     * Get monthly earnings breakdown by service (last 6 months)
     */
    async getMonthlyEarningsByService(salonId: number, workerId: number) {
        const incomes = await this.provider.getIncomes(salonId, { workerId });
        const validIncomes = incomes.data.filter((i: Income) => i.status === 'Validated' || i.status === 'Closed');

        // Last 6 months
        const monthsData = [];
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = monthNames[date.getMonth()];

            const monthIncomes = validIncomes.filter((inc: Income) => inc.date.startsWith(monthKey));
            const entry: any = { month: monthName, fullDate: monthKey };

            for (const income of monthIncomes) {
                const services = income.serviceNames || ['Unique Service'];
                // Distribute final amount across services in that income
                const sharePerService = (income.finalAmount || income.amount || 0) / services.length;

                for (const svc of services) {
                    entry[svc] = (entry[svc] || 0) + sharePerService;
                }
            }
            monthsData.push(entry);
        }

        return monthsData;
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
            const income = filteredIncomes.reduce((sum: number, i: Income) => sum + (i.finalAmount || i.amount || 0), 0);

            // Filter bookings
            const uniqueClients = new Set(dayBookings.data.map((b: Booking) => b.clientId));
            const services = dayBookings.data.length;

            // Expenses (proportional allocation)
            const expenses = dayExpenses.data.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);
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
        return this.getSalaryPerformanceByPeriod(salonId, workerId, 'Month');
    }

    /**
     * Get salary performance by specific period (Day, Week, Month, Year)
     */
    async getSalaryPerformanceByPeriod(salonId: number, workerId: number, period: string = 'Month', selectedDate: Date = new Date()) {
        const incomesResponse = await this.provider.getIncomes(salonId, {
            workerId: workerId > 0 ? workerId : undefined,
            limit: 1000
        });
        const incomes = incomesResponse.data;

        const dataMap: Record<string, any> = {};

        // Define range
        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case 'Day':
                startDate = subDays(selectedDate, 6);
                endDate = selectedDate;
                break;
            case 'Week':
                startDate = subWeeks(startOfWeek(selectedDate, { weekStartsOn: 1 }), 5);
                endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
                break;
            case 'Month':
                startDate = subMonths(startOfMonth(selectedDate), 5);
                endDate = endOfMonth(selectedDate);
                break;
            case 'Year':
                startDate = subYears(selectedDate, 2);
                startDate.setMonth(0, 1);
                endDate = selectedDate;
                break;
            default:
                startDate = subMonths(startOfMonth(selectedDate), 5);
                endDate = endOfMonth(selectedDate);
        }

        // Initialize markers
        const curr = new Date(startDate);
        while (curr <= endDate) {
            let key: string;
            let label: string;
            if (period === 'Day') {
                key = format(curr, 'yyyy-MM-dd');
                label = format(curr, 'EEE');
            } else if (period === 'Week') {
                const sw = startOfWeek(curr, { weekStartsOn: 1 });
                key = format(sw, 'yyyy-MM-dd');
                label = format(sw, 'MMM dd');
            } else if (period === 'Month') {
                key = format(curr, 'yyyy-MM');
                label = format(curr, 'MMM');
            } else {
                key = format(curr, 'yyyy');
                label = format(curr, 'yyyy');
            }

            if (!dataMap[key]) {
                dataMap[key] = {
                    name: label,
                    value1: 0,
                    value1Potential: 0,
                    value2: 0,
                    value2Potential: 0,
                    value3: 0,
                    value4: 0,
                };
            }

            if (period === 'Day') curr.setDate(curr.getDate() + 1);
            else if (period === 'Week') curr.setDate(curr.getDate() + 7);
            else if (period === 'Month') curr.setMonth(curr.getMonth() + 1);
            else curr.setFullYear(curr.getFullYear() + 1);
        }

        // Fetch expenses if global view
        let expenses: any[] = [];
        if (workerId === 0) {
            const expensesResp = await this.provider.getExpenses(salonId, { limit: 1000 });
            expenses = expensesResp.data;
        }

        // Aggregation
        incomes.forEach((inc: Income) => {
            const incDate = new Date(inc.date);
            if (incDate < startDate || incDate > endDate) return;

            let key: string;
            if (period === 'Day') key = format(incDate, 'yyyy-MM-dd');
            else if (period === 'Week') key = format(startOfWeek(incDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            else if (period === 'Month') key = format(incDate, 'yyyy-MM');
            else key = format(incDate, 'yyyy');

            if (!dataMap[key]) return;

            const isActual = inc.status === 'Validated' || inc.status === 'Closed';

            if (workerId > 0) {
                const share = inc.workerShares?.find((s: any) => s.workerId === workerId);
                if (share) {
                    const workerRevenue = (inc.finalAmount || inc.amount) * (share.percentage / 100);
                    if (isActual) {
                        dataMap[key].value1 += workerRevenue;
                        dataMap[key].value2 += share.amount || 0;
                        dataMap[key].value3 += share.tips || 0;
                    } else {
                        dataMap[key].value1Potential += workerRevenue;
                        dataMap[key].value2Potential += share.amount || 0;
                    }
                }
            } else {
                if (isActual) {
                    dataMap[key].value1 += (inc.finalAmount || inc.amount || 0);
                    inc.workerShares?.forEach((share: any) => {
                        dataMap[key].value2 += (share.amount || 0);
                        // For global view, we might not show tips separate unless requested
                        // but let's keep it in value2 total for now or separate it
                    });
                } else {
                    dataMap[key].value1Potential += (inc.finalAmount || inc.amount || 0);
                    inc.workerShares?.forEach((share: any) => {
                        dataMap[key].value2Potential += (share.amount || 0);
                    });
                }
            }
        });

        // Aggregate Expenses for global view
        if (workerId === 0) {
            expenses.forEach((exp: Expense) => {
                const expDate = new Date(exp.date);
                if (expDate < startDate || expDate > endDate) return;

                let key: string;
                if (period === 'Day') key = format(expDate, 'yyyy-MM-dd');
                else if (period === 'Week') key = format(startOfWeek(expDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                else if (period === 'Month') key = format(expDate, 'yyyy-MM');
                else key = format(expDate, 'yyyy');

                if (dataMap[key]) {
                    dataMap[key].value3 += exp.amount || 0;
                }
            });
        }

        // Calculate Profit (Value 4)
        Object.keys(dataMap).forEach(key => {
            dataMap[key].value4 = dataMap[key].value1 - dataMap[key].value2 - dataMap[key].value3;
        });

        return Object.values(dataMap).map((d: any) => ({
            ...d,
            value1: Math.round(d.value1),
            value1Potential: Math.round(d.value1Potential),
            value2: Math.round(d.value2),
            value2Potential: Math.round(d.value2Potential),
            value3: Math.round(d.value3),
            value4: Math.round(d.value4),
        }));
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
            const monthIncomes = incomes.filter((inc: Income) => inc.date.startsWith(monthStr));

            const actualIncome = monthIncomes
                .filter((i: Income) => i.status === 'Validated' || i.status === 'Closed')
                .reduce((sum: number, i: Income) => sum + (i.finalAmount || i.amount || 0), 0);

            const potentialIncome = monthIncomes
                .filter((i: Income) => i.status === 'Pending')
                .reduce((sum: number, i: Income) => sum + (i.finalAmount || i.amount || 0), 0);

            const completedBookings = monthBookings.filter((b: Booking) => b.status === 'Finished');

            monthsData.push({
                month: monthName,
                value1: Math.round(actualIncome / 100), // Income index (Actual)
                value1Potential: Math.round(potentialIncome / 100), // Income index (Potential)
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
        const now = new Date();
        const history = [];

        // Aggregate last 6 months
        for (let i = 1; i <= 6; i++) {
            const date = subMonths(now, i);
            const startStr = format(startOfMonth(date), 'yyyy-MM-dd');
            const endStr = format(endOfMonth(date), 'yyyy-MM-dd');

            try {
                const incomes = await this.provider.getIncomes(salonId, {
                    startDate: startStr,
                    endDate: endStr,
                    status: 'Validated'
                });

                if (incomes.data.length > 0) {
                    const uniqueWorkers = new Set();
                    let totalPayroll = 0;

                    for (const inc of incomes.data) {
                        // Aggregate worker shares if available
                        if (inc.workerShares) {
                            inc.workerShares.forEach((s: any) => {
                                uniqueWorkers.add(s.workerId);
                                totalPayroll += (s.amount || 0) + (s.tips || 0);
                            });
                        }
                    }

                    history.push({
                        date: format(endOfMonth(date), 'yyyy-MM-dd'),
                        amount: Math.round(totalPayroll),
                        workers: uniqueWorkers.size,
                        status: "completed"
                    });
                }
            } catch (err) {
                console.error(`Error fetching payroll history for ${startStr}:`, err);
            }
        }

        return history.length > 0 ? history : [
            { date: format(subMonths(now, 1), 'yyyy-MM-dd'), amount: 0, workers: 0, status: "completed" }
        ];
    }
}

export const statsService = new StatsService();
