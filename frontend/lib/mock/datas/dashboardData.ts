import { RevenueTrendPoint, ExpenseDistributionPoint, TopPerformer } from '@/types';

/**
 * MOCK DATA FOR DASHBOARD ANALYTICS
 * Based on the original origin/cc-mockup-full version
 */

export const revenueTrendData: RevenueTrendPoint[] = [
    { name: "Jan", value: 4500 }, { name: "Feb", value: 5200 }, { name: "Mar", value: 4900 },
    { name: "Apr", value: 6300 }, { name: "May", value: 5800 }, { name: "Jun", value: 7200 },
    { name: "Jul", value: 6800 }, { name: "Aug", value: 7500 }, { name: "Sep", value: 8200 },
    { name: "Oct", value: 8800 }, { name: "Nov", value: 7900 }, { name: "Dec", value: 8500 }
];

export const expenseDistributionData: ExpenseDistributionPoint[] = [
    { key: "dashboard.expenseCategories.salaries", value: 8500, color: "var(--color-primary)" },
    { key: "dashboard.expenseCategories.rent", value: 5200, color: "var(--color-secondary)" },
    { key: "dashboard.expenseCategories.supplies", value: 3850, color: "var(--color-warning)" },
    { key: "dashboard.expenseCategories.utilities", value: 1800, color: "var(--color-success)" }
];

export const topPerformersData: TopPerformer[] = [
    {
        name: "Isabelle",
        role: "Hair Stylist",
        revenue: 4250,
        clients: 42,
        rating: 4.9,
        avatar: "I",
        bg: "bg-purple-100",
        text: "text-purple-600"
    },
    {
        name: "Fatima S",
        role: "Nail Artist",
        revenue: 3890,
        clients: 38,
        rating: 4.8,
        avatar: "F",
        bg: "bg-pink-100",
        text: "text-pink-600"
    },
    {
        name: "Nadine B",
        role: "Colorist",
        revenue: 3560,
        clients: 35,
        rating: 4.8,
        avatar: "N",
        bg: "bg-orange-100",
        text: "text-orange-600"
    }
];

export const dashboardActivity = [
    {
        type: "newIncome",
        amount: "€120.00",
        time: "2 mins ago"
    },
    {
        type: "newBooking",
        client: "Sarah Connor",
        time: "15 mins ago"
    }
];
