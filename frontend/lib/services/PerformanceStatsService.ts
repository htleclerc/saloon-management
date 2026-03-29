/**
 * Performance Stats Service
 *
 * Worker and team performance analytics: worker stats, service rankings,
 * activity logs, reviews, schedule stats, salary performance
 */

import { BaseService } from './BaseService';
import type { WorkerStats, Booking, Income, Expense, Review, IncomeWorkerShare } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths, subWeeks, subYears } from 'date-fns';

export class PerformanceStatsService extends BaseService {
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
        const incomesResponse = await this.provider.getIncomes(salonId, {
            status: 'Validated',
            limit: 1000
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
     * Get services by revenue for a specific worker or salon
     */
    async getServicesByRevenue(salonId: number, workerId?: number, limit: number = 5) {
        const [incomesResponse, bookingsResponse] = await Promise.all([
            this.provider.getIncomes(salonId, { workerId, limit: 500 }),
            this.provider.getBookings(salonId, { workerId, status: 'Confirmed', limit: 100 })
        ]);

        const serviceStats = new Map<string, { count: number; income: number; potentialIncome: number; lastPerformed: Date }>();
        let totalRevenue = 0;
        let totalPotential = 0;

        for (const income of incomesResponse.data) {
            const incomeDate = new Date(income.date);
            const services = income.serviceNames || [];
            if (services.length === 0) continue;

            const amountPerService = income.amount / services.length;
            const isActual = income.status === 'Validated' || income.status === 'Closed';

            for (const serviceName of services) {
                const current = serviceStats.get(serviceName) || {
                    count: 0, income: 0, potentialIncome: 0, lastPerformed: new Date(0)
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

        const potentialBookings = bookingsResponse.data.filter((b: Booking) => !b.incomeId);

        for (const booking of potentialBookings) {
            const bookingDate = new Date(booking.date + ' ' + (booking.time || '00:00'));
            if (potentialBookings.length < 20) {
                const services = await this.provider.getBookingServices(booking.id);
                for (const service of services) {
                    const current = serviceStats.get(service.name) || {
                        count: 0, income: 0, potentialIncome: 0, lastPerformed: new Date(0)
                    };

                    current.potentialIncome += service.price;
                    current.count += 1;
                    totalPotential += service.price;
                    if (bookingDate > current.lastPerformed) current.lastPerformed = bookingDate;
                    serviceStats.set(service.name, current);
                }
            }
        }

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
        const bookings = await this.provider.getBookings(salonId, { workerId, status: 'Finished', limit: 1000 });

        const clientStats = new Map<number, { id: number; name: string; visits: number; spent: number }>();

        const incomes = await this.provider.getIncomes(salonId, { workerId, status: 'Validated', limit: 1000 });

        for (const income of incomes.data) {
            if (!income.clientId) continue;
            const current = clientStats.get(income.clientId) || { id: income.clientId, name: income.clientName || 'Unknown', visits: 0, spent: 0 };

            clientStats.set(income.clientId, {
                ...current,
                visits: current.visits + 1,
                spent: current.spent + income.finalAmount
            });
        }

        const clients = Array.from(clientStats.values())
            .sort((a, b) => b.spent - a.spent)
            .slice(0, limit);

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
        const [bookings, incomes] = await Promise.all([
            this.provider.getBookings(salonId, { workerId, limit: limit * 2 }),
            this.provider.getIncomes(salonId, { workerId, limit: limit * 2 })
        ]);

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

        return Promise.all(combined.map(async (item) => {
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
                const workerShare = i.workerShares?.find((s: IncomeWorkerShare) => s.workerId === workerId);

                if (workerShare) {
                    receivedAmount = (workerShare.amount || 0) + (workerShare.tips || 0);
                } else {
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
                client: "Client " + r.clientId,
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
                service: "Service",
                avatar: "C",
                color: "bg-gray-100 text-gray-600"
            }));
    }

    /**
     * Get team schedule stats (weekly availability and appointments)
     */
    async getTeamScheduleStats(salonId: number) {
        const workers = await this.getAllWorkersStats(salonId);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const today = new Date();

        const weekStart = new Date(today);
        const day = weekStart.getDay() || 7;
        if (day !== 1) weekStart.setHours(-24 * (day - 1));
        else weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const bookings = await this.provider.getBookings(salonId, {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0]
        });

        const scheduleStats: Record<string, Record<string, { available: boolean; appointments: number }>> = {};

        for (const worker of workers) {
            scheduleStats[worker.name] = {};
            const workerDetails = await this.provider.getWorker(worker.workerId);
            const weeklySchedule = workerDetails?.weeklySchedule || {};

            for (let i = 0; i < days.length; i++) {
                const dayName = days[i];
                let isAvailable = false;
                if (weeklySchedule[dayName]) {
                    isAvailable = weeklySchedule[dayName].active;
                } else {
                    isAvailable = i < 5;
                }

                const currentDayDate = new Date(weekStart);
                currentDayDate.setDate(weekStart.getDate() + i);
                const dateStr = currentDayDate.toISOString().split('T')[0];

                const dayBookings = bookings.data.filter((b: Booking) => {
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
     * Get weekly income breakdown for a worker (last 7 days)
     */
    async getWeeklyIncomeBreakdown(salonId: number, workerId: number) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const incomes = await this.provider.getIncomesByWorker(workerId);

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

        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7);
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
        const incomes = await this.provider.getIncomesByWorker(workerId);
        const validIncomes = incomes.filter((i: Income) => i.status === 'Validated');

        let commissionTotal = 0;
        let tipsTotal = 0;
        let productsTotal = 0;

        for (const income of validIncomes) {
            const workerShare = income.workerShares?.find((s: IncomeWorkerShare) => s.workerId === workerId);

            if (workerShare) {
                commissionTotal += workerShare.amount;
                tipsTotal += workerShare.tips || 0;
            } else {
                const shares = await this.provider.getIncomeWorkerShares(income.id);
                const share = shares.find((s: IncomeWorkerShare) => s.workerId === workerId);
                if (share) {
                    commissionTotal += share.amount;
                    tipsTotal += share.tips || 0;
                }
            }
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

        const monthsData = [];
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = monthNames[date.getMonth()];

            const monthIncomes = validIncomes.filter((inc: Income) => inc.date.startsWith(monthKey));
            const entry: Record<string, string | number> = { month: monthName, fullDate: monthKey };

            for (const income of monthIncomes) {
                const services = income.serviceNames || ['Unique Service'];
                const sharePerService = (income.finalAmount || income.amount || 0) / services.length;

                for (const svc of services) {
                    entry[svc] = (Number(entry[svc]) || 0) + sharePerService;
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

            const filteredIncomes = dayIncomes.filter((i: Income) => i.date === dateStr && i.status === 'Validated');
            const income = filteredIncomes.reduce((sum: number, i: Income) => sum + (i.finalAmount || i.amount || 0), 0);

            const uniqueClients = new Set(dayBookings.data.map((b: Booking) => b.clientId));
            const services = dayBookings.data.length;

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

        interface SalaryPeriodData {
            name: string;
            value1: number;
            value1Potential: number;
            value2: number;
            value2Potential: number;
            value3: number;
            value4: number;
        }
        const dataMap: Record<string, SalaryPeriodData> = {};

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
                    value1: 0, value1Potential: 0,
                    value2: 0, value2Potential: 0,
                    value3: 0, value4: 0,
                };
            }

            if (period === 'Day') curr.setDate(curr.getDate() + 1);
            else if (period === 'Week') curr.setDate(curr.getDate() + 7);
            else if (period === 'Month') curr.setMonth(curr.getMonth() + 1);
            else curr.setFullYear(curr.getFullYear() + 1);
        }

        let expenses: Expense[] = [];
        if (workerId === 0) {
            const expensesResp = await this.provider.getExpenses(salonId, { limit: 1000 });
            expenses = expensesResp.data;
        }

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
                const share = inc.workerShares?.find((s: IncomeWorkerShare) => s.workerId === workerId);
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
                    inc.workerShares?.forEach((s: IncomeWorkerShare) => {
                        dataMap[key].value2 += (s.amount || 0);
                    });
                } else {
                    dataMap[key].value1Potential += (inc.finalAmount || inc.amount || 0);
                    inc.workerShares?.forEach((s: IncomeWorkerShare) => {
                        dataMap[key].value2Potential += (s.amount || 0);
                    });
                }
            }
        });

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

        Object.keys(dataMap).forEach(key => {
            dataMap[key].value4 = dataMap[key].value1 - dataMap[key].value2 - dataMap[key].value3;
        });

        return Object.values(dataMap).map((d: SalaryPeriodData) => ({
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
        const bookings = await this.provider.getBookings(salonId, { workerId, limit: 1000 });
        const incomes = await this.provider.getIncomesByWorker(workerId);

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
                value1: Math.round(actualIncome / 100),
                value1Potential: Math.round(potentialIncome / 100),
                value2: completedBookings.length,
                value3: monthBookings.length,
                value4: new Set(monthBookings.map((b: Booking) => b.clientId)).size
            });
        }

        return monthsData;
    }
}

export const performanceStatsService = new PerformanceStatsService();
