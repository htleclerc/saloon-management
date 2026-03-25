/**
 * Revenue Stats Service
 *
 * Financial analytics: revenue trends, expense distribution,
 * financial reports, tax summaries, payroll stats
 */

import { BaseService } from './BaseService';
import type { Income, Expense, ExpenseCategory, IncomeWorkerShare } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, subMonths } from 'date-fns';

export class RevenueStatsService extends BaseService {
    /**
     * Get revenue trend (month by month)
     */
    async getRevenueTrend(salonId: number, months: number = 6): Promise<Array<{ month: string; revenue: number }>> {
        const incomes = await this.provider.getIncomes(salonId, {
            status: 'Validated'
        });

        const trend = new Map<string, number>();
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7);
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

        const trend = new Map<string, number>();
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7);
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
        const taxRate = 0.20;
        const taxPayments = totalRevenue * taxRate;
        const savings = netProfit * 0.15;

        return { totalRevenue, totalExpenses, netProfit, taxPayments, savings };
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
                tax: Math.round(profit * 0.2),
                savings: Math.round(profit * 0.1),
                sales: Math.round(revenue * 0.3)
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

            const revenue = incomes.data.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);
            const expenseTotal = expenses.data.reduce((sum: number, e: Expense) => sum + e.amount, 0);

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

        const totalRevenue = incomes.data.reduce((sum: number, i: Income) => sum + i.finalAmount, 0);
        const totalExpenses = expenses.data.reduce((sum: number, e: Expense) => sum + e.amount, 0);
        const profit = totalRevenue - totalExpenses;

        const federalRate = 0.22;
        const stateRate = 0.08;
        const localRate = 0.03;

        const incomeTax = Math.round(profit * federalRate);
        const estimatedTax = Math.round(profit * (federalRate + stateRate + localRate));
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
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        const expenses = await this.provider.getExpenses(salonId, { startDate, endDate });

        const monthsData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < 12; i++) {
            const monthPrefix = `${year}-${String(i + 1).padStart(2, '0')}`;
            const monthExpenses = expenses.data.filter((e: Expense) => e.date.startsWith(monthPrefix));
            const total = monthExpenses.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);

            if (total > 0 || i <= new Date().getMonth()) {
                monthsData.push({
                    month: monthNames[i],
                    purchases: Math.round(total)
                });
            }
        }
        return monthsData;
    }

    /**
     * Get fee breakdown
     */
    async getFeeBreakdown(salonId: number, year: number) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const incomes = await this.provider.getIncomes(salonId, { startDate, endDate, status: 'Validated' });
        const totalRevenue = incomes.data.reduce((sum: number, i: Income) => sum + (i.finalAmount || 0), 0);

        if (totalRevenue === 0) return [];

        return [
            { category: "processing", percentage: 2.5, amount: Math.round(totalRevenue * 0.025) },
            { category: "service", percentage: 1.8, amount: Math.round(totalRevenue * 0.018) },
            { category: "platform", percentage: 3.2, amount: Math.round(totalRevenue * 0.032) },
            { category: "transaction", percentage: 1.5, amount: Math.round(totalRevenue * 0.015) },
        ];
    }

    /**
     * Get monthly vs weekly analysis
     */
    async getMonthlyWeeklyAnalysis(salonId: number, year: number) {
        const now = new Date();
        const startOfThisWeek = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const startOfThisMonth = format(startOfMonth(now), 'yyyy-MM-dd');

        const lastMonthDate = subMonths(now, 1);
        const startOfLastMonth = format(startOfMonth(lastMonthDate), 'yyyy-MM-dd');
        const endOfLastMonth = format(endOfMonth(lastMonthDate), 'yyyy-MM-dd');

        const [thisWeekIncomes, thisMonthIncomes, lastMonthIncomes] = await Promise.all([
            this.provider.getIncomes(salonId, { startDate: startOfThisWeek, status: 'Validated' }),
            this.provider.getIncomes(salonId, { startDate: startOfThisMonth, status: 'Validated' }),
            this.provider.getIncomes(salonId, { startDate: startOfLastMonth, endDate: endOfLastMonth, status: 'Validated' })
        ]);

        const weekly = thisWeekIncomes.data.reduce((sum: number, i: Income) => sum + (i.finalAmount || 0), 0);
        const monthly = thisMonthIncomes.data.reduce((sum: number, i: Income) => sum + (i.finalAmount || 0), 0);
        const lastMonthly = lastMonthIncomes.data.reduce((sum: number, i: Income) => sum + (i.finalAmount || 0), 0);

        return {
            weekly: Math.round(weekly),
            monthly: Math.round(monthly),
            difference: Math.round(monthly - lastMonthly),
        };
    }

    /**
     * Get recommendations
     */
    async getRecommendations(salonId: number) {
        const now = new Date();
        const startOfThisMonth = format(startOfMonth(now), 'yyyy-MM-dd');

        const [incomes, expenses] = await Promise.all([
            this.provider.getIncomes(salonId, { startDate: startOfThisMonth, status: 'Validated' }),
            this.provider.getExpenses(salonId, { startDate: startOfThisMonth })
        ]);

        const revenue = incomes.data.reduce((sum: number, i: Income) => sum + (i.finalAmount || 0), 0);
        const expense = expenses.data.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);

        const recs = [];

        if (revenue > expense * 2) {
            recs.push({ icon: "💡", id: "savings", title: "Increase Savings", description: "Your margins look great! Consider increasing your savings rate by 5% this quarter." });
        } else {
            recs.push({ icon: "💡", id: "savings", title: "Review Pricing", description: "Your revenue is closely matching expenses. Consider reviewing your service pricing." });
        }

        if (expense > 0) {
            recs.push({ icon: "📊", id: "expenses", title: "Review Expenses", description: "Analyze your highest expense categories to identify optimization opportunities." });
        }

        recs.push({ icon: "📈", id: "tax", title: "Tax Planning", description: "Schedule quarterly tax review to avoid year-end surprises." });

        return recs;
    }

    /**
     * Get payroll stats for the current month
     */
    async getPayrollStats(salonId: number) {
        const workers = await this.provider.getWorkers(salonId);

        return Promise.all(workers.map(async (w: { id: number; userId?: number; name: string; baseSalary?: number }) => {
            const stats = await this.provider.getWorkerStats(w.id);

            const commissions = Math.round(stats?.monthCommission || 0);
            const tips = Math.round(stats?.monthTips || 0);
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
     * Get payroll history (last 6 months)
     */
    async getPayrollHistory(salonId: number) {
        const now = new Date();
        const history = [];

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
                        if (inc.workerShares) {
                            inc.workerShares.forEach((s: IncomeWorkerShare) => {
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

export const revenueStatsService = new RevenueStatsService();
