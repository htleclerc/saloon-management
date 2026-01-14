"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    DollarSign,
    TrendingUp,
    Star,
    Calendar,
    Clock,
    Mail,
    Phone,
    Edit,
    MapPin,
    Award,
    Users,
    BarChart3,
    Percent,
    Eye,
    ChevronDown,
    LayoutGrid,
    Table,
    MessageSquare,
    History,
    Scissors,
    ThumbsUp,
    AlertCircle,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Mock data - Worker Profile
const workerData = {
    id: 1,
    name: "Orphelia",
    email: "orphelia@adorablebraids.com",
    phone: "+33 6 12 34 56 78",
    status: "Active",
    role: "Braider",
    location: "Paris, France",
    joinDate: "March 2021",
    sharingKey: 70,
};

// Performance Overview Cards
const performanceCards = [
    { label: "C$8,430", sublabel: "Total Sales", color: "text-purple-600" },
    { label: "C$40,094", sublabel: "Total Expenses", color: "text-pink-600" },
    { label: "467", sublabel: "Total Services", color: "text-orange-600" },
    { label: "4.0", sublabel: "Rating", color: "text-teal-600" },
    { label: "C$8,770", sublabel: "Net Profit", color: "text-blue-600" },
];

// Revenue Row Type
interface RevenueRow {
    id: number;
    period: string;
    services: number;
    clients: number;
    revenue: number;
    salary: number;
    status: string;
}

// Revenue Data by Period and Year
const revenueDataByYear: Record<string, { week: RevenueRow[]; month: RevenueRow[]; year: RevenueRow[] }> = {
    "2024": {
        week: [
            { id: 1, period: "Mon 13 Jan", services: 3, clients: 3, revenue: 300, salary: 210, status: "Completed" },
            { id: 2, period: "Tue 14 Jan", services: 4, clients: 4, revenue: 420, salary: 294, status: "Completed" },
            { id: 3, period: "Wed 15 Jan", services: 2, clients: 2, revenue: 180, salary: 126, status: "Completed" },
            { id: 4, period: "Thu 16 Jan", services: 5, clients: 4, revenue: 550, salary: 385, status: "Completed" },
            { id: 5, period: "Fri 17 Jan", services: 6, clients: 5, revenue: 680, salary: 476, status: "Completed" },
            { id: 6, period: "Sat 18 Jan", services: 8, clients: 7, revenue: 920, salary: 644, status: "Completed" },
            { id: 7, period: "Sun 19 Jan", services: 3, clients: 3, revenue: 280, salary: 196, status: "Pending" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 28, clients: 22, revenue: 2800, salary: 1960, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 32, clients: 26, revenue: 3200, salary: 2240, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 30, clients: 24, revenue: 3100, salary: 2170, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 35, clients: 28, revenue: 3600, salary: 2520, status: "In Progress" },
        ],
        year: [
            { id: 1, period: "January", services: 125, clients: 98, revenue: 12500, salary: 8750, status: "Completed" },
            { id: 2, period: "February", services: 118, clients: 92, revenue: 11800, salary: 8260, status: "Completed" },
            { id: 3, period: "March", services: 132, clients: 105, revenue: 13200, salary: 9240, status: "Completed" },
            { id: 4, period: "April", services: 140, clients: 112, revenue: 14000, salary: 9800, status: "Completed" },
            { id: 5, period: "May", services: 145, clients: 118, revenue: 14500, salary: 10150, status: "Completed" },
            { id: 6, period: "June", services: 150, clients: 122, revenue: 15000, salary: 10500, status: "Completed" },
            { id: 7, period: "July", services: 155, clients: 128, revenue: 15500, salary: 10850, status: "Completed" },
            { id: 8, period: "August", services: 160, clients: 132, revenue: 16000, salary: 11200, status: "Completed" },
            { id: 9, period: "September", services: 148, clients: 120, revenue: 14800, salary: 10360, status: "Completed" },
            { id: 10, period: "October", services: 152, clients: 124, revenue: 15200, salary: 10640, status: "Completed" },
            { id: 11, period: "November", services: 158, clients: 130, revenue: 15800, salary: 11060, status: "Completed" },
            { id: 12, period: "December", services: 165, clients: 135, revenue: 16500, salary: 11550, status: "In Progress" },
        ],
    },
    "2023": {
        week: [
            { id: 1, period: "Mon 15 Jan", services: 2, clients: 2, revenue: 220, salary: 154, status: "Completed" },
            { id: 2, period: "Tue 16 Jan", services: 3, clients: 3, revenue: 350, salary: 245, status: "Completed" },
            { id: 3, period: "Wed 17 Jan", services: 2, clients: 2, revenue: 200, salary: 140, status: "Completed" },
            { id: 4, period: "Thu 18 Jan", services: 4, clients: 3, revenue: 420, salary: 294, status: "Completed" },
            { id: 5, period: "Fri 19 Jan", services: 5, clients: 4, revenue: 550, salary: 385, status: "Completed" },
            { id: 6, period: "Sat 20 Jan", services: 6, clients: 5, revenue: 680, salary: 476, status: "Completed" },
            { id: 7, period: "Sun 21 Jan", services: 2, clients: 2, revenue: 200, salary: 140, status: "Completed" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 22, clients: 18, revenue: 2200, salary: 1540, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 26, clients: 20, revenue: 2600, salary: 1820, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 24, clients: 19, revenue: 2400, salary: 1680, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 28, clients: 22, revenue: 2800, salary: 1960, status: "Completed" },
        ],
        year: [
            { id: 1, period: "January", services: 100, clients: 78, revenue: 10000, salary: 7000, status: "Completed" },
            { id: 2, period: "February", services: 95, clients: 74, revenue: 9500, salary: 6650, status: "Completed" },
            { id: 3, period: "March", services: 108, clients: 85, revenue: 10800, salary: 7560, status: "Completed" },
            { id: 4, period: "April", services: 115, clients: 90, revenue: 11500, salary: 8050, status: "Completed" },
            { id: 5, period: "May", services: 120, clients: 95, revenue: 12000, salary: 8400, status: "Completed" },
            { id: 6, period: "June", services: 125, clients: 100, revenue: 12500, salary: 8750, status: "Completed" },
            { id: 7, period: "July", services: 130, clients: 105, revenue: 13000, salary: 9100, status: "Completed" },
            { id: 8, period: "August", services: 135, clients: 108, revenue: 13500, salary: 9450, status: "Completed" },
            { id: 9, period: "September", services: 125, clients: 100, revenue: 12500, salary: 8750, status: "Completed" },
            { id: 10, period: "October", services: 128, clients: 102, revenue: 12800, salary: 8960, status: "Completed" },
            { id: 11, period: "November", services: 132, clients: 106, revenue: 13200, salary: 9240, status: "Completed" },
            { id: 12, period: "December", services: 140, clients: 112, revenue: 14000, salary: 9800, status: "Completed" },
        ],
    },
    "2022": {
        week: [
            { id: 1, period: "Mon 17 Jan", services: 2, clients: 2, revenue: 180, salary: 126, status: "Completed" },
            { id: 2, period: "Tue 18 Jan", services: 2, clients: 2, revenue: 200, salary: 140, status: "Completed" },
            { id: 3, period: "Wed 19 Jan", services: 1, clients: 1, revenue: 120, salary: 84, status: "Completed" },
            { id: 4, period: "Thu 20 Jan", services: 3, clients: 2, revenue: 300, salary: 210, status: "Completed" },
            { id: 5, period: "Fri 21 Jan", services: 4, clients: 3, revenue: 400, salary: 280, status: "Completed" },
            { id: 6, period: "Sat 22 Jan", services: 5, clients: 4, revenue: 500, salary: 350, status: "Completed" },
            { id: 7, period: "Sun 23 Jan", services: 1, clients: 1, revenue: 100, salary: 70, status: "Completed" },
        ],
        month: [
            { id: 1, period: "Week 1 (1-7 Jan)", services: 18, clients: 14, revenue: 1800, salary: 1260, status: "Completed" },
            { id: 2, period: "Week 2 (8-14 Jan)", services: 20, clients: 16, revenue: 2000, salary: 1400, status: "Completed" },
            { id: 3, period: "Week 3 (15-21 Jan)", services: 18, clients: 15, revenue: 1800, salary: 1260, status: "Completed" },
            { id: 4, period: "Week 4 (22-28 Jan)", services: 22, clients: 18, revenue: 2200, salary: 1540, status: "Completed" },
        ],
        year: [
            { id: 1, period: "January", services: 78, clients: 62, revenue: 7800, salary: 5460, status: "Completed" },
            { id: 2, period: "February", services: 72, clients: 58, revenue: 7200, salary: 5040, status: "Completed" },
            { id: 3, period: "March", services: 85, clients: 68, revenue: 8500, salary: 5950, status: "Completed" },
            { id: 4, period: "April", services: 90, clients: 72, revenue: 9000, salary: 6300, status: "Completed" },
            { id: 5, period: "May", services: 95, clients: 76, revenue: 9500, salary: 6650, status: "Completed" },
            { id: 6, period: "June", services: 100, clients: 80, revenue: 10000, salary: 7000, status: "Completed" },
            { id: 7, period: "July", services: 105, clients: 84, revenue: 10500, salary: 7350, status: "Completed" },
            { id: 8, period: "August", services: 108, clients: 86, revenue: 10800, salary: 7560, status: "Completed" },
            { id: 9, period: "September", services: 100, clients: 80, revenue: 10000, salary: 7000, status: "Completed" },
            { id: 10, period: "October", services: 102, clients: 82, revenue: 10200, salary: 7140, status: "Completed" },
            { id: 11, period: "November", services: 106, clients: 85, revenue: 10600, salary: 7420, status: "Completed" },
            { id: 12, period: "December", services: 112, clients: 90, revenue: 11200, salary: 7840, status: "Completed" },
        ],
    },
};

const availableYears = ["2024", "2023", "2022"];

// Recent Revenue History
const recentRevenueHistory = [
    { id: 1, date: "14 Jan 2024", client: "Marie Dubois", service: "Box Braids", amount: "€120", status: "Completed" },
    { id: 2, date: "13 Jan 2024", client: "Sophie Laurent", service: "Senegalese Twists", amount: "€95", status: "Completed" },
    { id: 3, date: "12 Jan 2024", client: "Anna Martin", service: "Cornrows", amount: "€85", status: "Completed" },
    { id: 4, date: "11 Jan 2024", client: "Claire Petit", service: "Locs Maintenance", amount: "€150", status: "Completed" },
    { id: 5, date: "10 Jan 2024", client: "Julie Bernard", service: "Box Braids", amount: "€130", status: "Completed" },
    { id: 6, date: "9 Jan 2024", client: "Nadia Koné", service: "Twists", amount: "€110", status: "Completed" },
    { id: 7, date: "8 Jan 2024", client: "Camille Roche", service: "Cornrows", amount: "€75", status: "Completed" },
    { id: 8, date: "7 Jan 2024", client: "Lucie Moreau", service: "Knotless Braids", amount: "€180", status: "Completed" },
];

// Recent Services
const recentServices = [
    { id: 1, service: "Box Braids", count: 45, revenue: "€5,400", lastPerformed: "Today" },
    { id: 2, service: "Senegalese Twists", count: 38, revenue: "€3,610", lastPerformed: "Yesterday" },
    { id: 3, service: "Cornrows", count: 32, revenue: "€2,720", lastPerformed: "2 days ago" },
    { id: 4, service: "Locs Maintenance", count: 28, revenue: "€4,200", lastPerformed: "3 days ago" },
    { id: 5, service: "Knotless Braids", count: 24, revenue: "€4,320", lastPerformed: "4 days ago" },
];

// Activity History
const activityHistory = [
    { id: 1, action: "Completed service for Marie Dubois", type: "service", time: "2 hours ago", icon: Scissors },
    { id: 2, action: "Received 5-star review", type: "review", time: "4 hours ago", icon: Star },
    { id: 3, action: "New booking confirmed", type: "booking", time: "Yesterday", icon: Calendar },
    { id: 4, action: "Completed service for Sophie Laurent", type: "service", time: "Yesterday", icon: Scissors },
    { id: 5, action: "Profile updated", type: "profile", time: "2 days ago", icon: Edit },
    { id: 6, action: "Received payment €120", type: "payment", time: "2 days ago", icon: DollarSign },
    { id: 7, action: "New client added", type: "client", time: "3 days ago", icon: Users },
    { id: 8, action: "Completed service for Anna Martin", type: "service", time: "3 days ago", icon: Scissors },
];

// Client Comments/Reviews
const clientComments = [
    { id: 1, client: "Marie Dubois", avatar: "M", rating: 5, date: "2 days ago", comment: "Orphelia est incroyable! Mes box braids sont parfaites et elle a pris le temps de bien m'expliquer l'entretien. Je reviendrai!", color: "bg-purple-100 text-purple-600" },
    { id: 2, client: "Sophie Laurent", avatar: "S", rating: 5, date: "1 week ago", comment: "Très professionnelle et rapide. Le résultat est magnifique, exactement ce que je voulais.", color: "bg-pink-100 text-pink-600" },
    { id: 3, client: "Anna Martin", avatar: "A", rating: 4, date: "2 weeks ago", comment: "Super travail sur mes cornrows! Juste un peu long mais le résultat en vaut la peine.", color: "bg-orange-100 text-orange-600" },
    { id: 4, client: "Claire Petit", avatar: "C", rating: 5, date: "3 weeks ago", comment: "Meilleure coiffeuse pour les locs! Elle prend vraiment soin de mes cheveux.", color: "bg-teal-100 text-teal-600" },
    { id: 5, client: "Julie Bernard", avatar: "J", rating: 5, date: "1 month ago", comment: "J'adore mon nouveau look! Orphelia est très talentueuse et à l'écoute.", color: "bg-blue-100 text-blue-600" },
    { id: 6, client: "Nadia Koné", avatar: "N", rating: 4, date: "1 month ago", comment: "Très satisfaite de mes twists. Ambiance agréable au salon.", color: "bg-indigo-100 text-indigo-600" },
];

// Weekly Revenue Breakdown
const weeklyRevenueData = [
    { name: "Mon", value: 65 }, { name: "Tue", value: 80 }, { name: "Wed", value: 55 },
    { name: "Thu", value: 90 }, { name: "Fri", value: 70 }, { name: "Sat", value: 85 },
    { name: "Sun", value: 60 }, { name: "Mon", value: 75 }, { name: "Tue", value: 65 },
    { name: "Wed", value: 80 }, { name: "Thu", value: 70 }, { name: "Fri", value: 85 },
];

// Client Volume Trend
const clientVolumeTrend = [
    { month: "Jan", value: 40 }, { month: "Feb", value: 55 }, { month: "Mar", value: 45 },
    { month: "Apr", value: 60 }, { month: "May", value: 50 }, { month: "Jun", value: 65 },
];

// Earnings Breakdown
const earningsBreakdownData = [
    { month: "Jan", braids: 35, twists: 28, cornrows: 22, locs: 18 },
    { month: "Feb", braids: 40, twists: 32, cornrows: 25, locs: 20 },
    { month: "Mar", braids: 38, twists: 30, cornrows: 23, locs: 19 },
    { month: "Apr", braids: 45, twists: 35, cornrows: 28, locs: 22 },
    { month: "May", braids: 42, twists: 33, cornrows: 26, locs: 21 },
    { month: "Jun", braids: 48, twists: 38, cornrows: 30, locs: 24 },
];

// Weekly Performance Details
const weeklyPerformanceDetails = [
    { date: "January 2024", clients: 42, services: 45, revenue: 4500, expenses: 1200, profit: 3300 },
    { date: "February 2024", clients: 38, services: 42, revenue: 4200, expenses: 1100, profit: 3100 },
    { date: "March 2024", clients: 45, services: 48, revenue: 4800, expenses: 1300, profit: 3500 },
    { date: "April 2024", clients: 50, services: 55, revenue: 5500, expenses: 1500, profit: 4000 },
    { date: "May 2024", clients: 48, services: 52, revenue: 5200, expenses: 1400, profit: 3800 },
    { date: "June 2024", clients: 52, services: 58, revenue: 5800, expenses: 1600, profit: 4200 },
];

// Salary Performance Data
const salaryPerformanceData = [
    { month: "Jan", value1: 50, value2: 40, value3: 60, value4: 55 },
    { month: "Feb", value1: 55, value2: 45, value3: 65, value4: 58 },
    { month: "Mar", value1: 52, value2: 42, value3: 62, value4: 56 },
    { month: "Apr", value1: 58, value2: 48, value3: 68, value4: 60 },
    { month: "May", value1: 60, value2: 50, value3: 70, value4: 62 },
    { month: "Jun", value1: 65, value2: 55, value3: 75, value4: 68 },
];

// Client Satisfaction Data
const clientSatisfactionData = [
    { name: "Marie Dubois", rating: 4.9, service: "Box Braids", date: "2 days ago", avatar: "M", color: "bg-purple-100 text-purple-600" },
    { name: "Sophie Laurent", rating: 4.8, service: "Twists", date: "1 week ago", avatar: "S", color: "bg-pink-100 text-pink-600" },
    { name: "Anna Martin", rating: 5.0, service: "Cornrows", date: "2 weeks ago", avatar: "A", color: "bg-orange-100 text-orange-600" },
];

// Service Time Distribution
const serviceTimeDistribution = [
    { name: "Box Braids", value: 35, color: "#8B5CF6" },
    { name: "Twists", value: 25, color: "#EC4899" },
    { name: "Cornrows", value: 20, color: "#F59E0B" },
    { name: "Locs", value: 12, color: "#10B981" },
    { name: "Other", value: 8, color: "#3B82F6" },
];

// Top Appointment Services
const topAppointmentServices = [
    { name: "Senegalese Twists", count: 156, revenue: "C$18,720", percentage: 35 },
    { name: "Box Braids", count: 98, revenue: "C$12,740", percentage: 25 },
    { name: "Cornrows", count: 87, revenue: "C$7,395", percentage: 20 },
    { name: "Locs Maintenance", count: 65, revenue: "C$9,750", percentage: 12 },
];

// Overall Performance
const overallPerformanceData = [
    { month: "Jan", value1: 55, value2: 45, value3: 65, value4: 50 },
    { month: "Feb", value1: 60, value2: 50, value3: 70, value4: 55 },
    { month: "Mar", value1: 58, value2: 48, value3: 68, value4: 52 },
    { month: "Apr", value1: 65, value2: 55, value3: 75, value4: 58 },
    { month: "May", value1: 70, value2: 60, value3: 80, value4: 62 },
    { month: "Jun", value1: 75, value2: 65, value3: 85, value4: 68 },
];

// Top Repeat Clients
const topRepeatClients = [
    { name: "Marie Dubois", visits: 24, spent: "C$2,880", avatar: "M", color: "bg-purple-100 text-purple-600" },
    { name: "Sophie Laurent", visits: 18, spent: "C$1,710", avatar: "S", color: "bg-pink-100 text-pink-600" },
    { name: "Anna Martin", visits: 15, spent: "C$1,275", avatar: "A", color: "bg-orange-100 text-orange-600" },
    { name: "Claire Petit", visits: 12, spent: "C$1,800", avatar: "C", color: "bg-teal-100 text-teal-600" },
    { name: "Julie Bernard", visits: 10, spent: "C$1,300", avatar: "J", color: "bg-blue-100 text-blue-600" },
];

// Daily Activities
const dailyActivities = [
    { action: "Completed service for Marie", time: "2 hours ago", type: "success" },
    { action: "New booking confirmed", time: "4 hours ago", type: "info" },
    { action: "Received 5-star review", time: "Yesterday", type: "success" },
];

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const initialView = searchParams.get("view") === "advanced" ? "advanced" : "simple";
    const [viewMode, setViewMode] = useState<"simple" | "advanced">(initialView);
    const [revenuePeriod, setRevenuePeriod] = useState<"week" | "month" | "year">("month");
    const [selectedYear, setSelectedYear] = useState("2024");
    const [revenuePage, setRevenuePage] = useState(1);
    const itemsPerPage = 5;

    // Get paginated revenue data based on year and period
    const currentRevenueData = revenueDataByYear[selectedYear][revenuePeriod];
    const totalPages = Math.ceil(currentRevenueData.length / itemsPerPage);
    const paginatedRevenueData = currentRevenueData.slice((revenuePage - 1) * itemsPerPage, revenuePage * itemsPerPage);

    // Reset page when period or year changes
    const handlePeriodChange = (period: "week" | "month" | "year") => {
        setRevenuePeriod(period);
        setRevenuePage(1);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setRevenuePage(1);
    };

    // Simple View Component
    const SimpleView = () => (
        <div className="space-y-6">
            {/* Performance Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {performanceCards.map((card, idx) => (
                    <Card key={idx} className="p-4 text-center">
                        <h3 className={`text-xl font-bold ${card.color}`}>{card.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{card.sublabel}</p>
                    </Card>
                ))}
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"><Percent className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">Sharing Key</p><p className="text-xl font-bold text-purple-700">{workerData.sharingKey}%</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">Joined</p><p className="text-xl font-bold text-pink-700">{workerData.joinDate}</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
                        <div><p className="text-sm text-gray-600">Location</p><p className="text-xl font-bold text-teal-700">{workerData.location}</p></div>
                    </div>
                </Card>
            </div>

            {/* Revenue Table with Filter */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Revenue Overview
                    </h3>
                    <div className="flex items-center gap-3">
                        {/* Year Selector */}
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 border-0 cursor-pointer focus:ring-2 focus:ring-purple-300"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        {/* Period Filter */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => handlePeriodChange("week")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${revenuePeriod === "week"
                                    ? "bg-white text-purple-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => handlePeriodChange("month")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${revenuePeriod === "month"
                                    ? "bg-white text-purple-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => handlePeriodChange("year")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${revenuePeriod === "year"
                                    ? "bg-white text-purple-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Year
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Services</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Clients</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salary (70%)</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedRevenueData.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.period}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.services}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.clients}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">€{row.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">€{row.salary.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs px-2 py-1 rounded-full ${row.status === "Completed" ? "bg-green-100 text-green-700" :
                                            row.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-purple-50 font-semibold">
                            <tr>
                                <td className="px-4 py-3 text-sm text-purple-900">Total</td>
                                <td className="px-4 py-3 text-sm text-center text-purple-700">
                                    {currentRevenueData.reduce((sum, r) => sum + r.services, 0)}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-purple-700">
                                    {currentRevenueData.reduce((sum, r) => sum + r.clients, 0)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-green-700">
                                    €{currentRevenueData.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-purple-700">
                                    €{currentRevenueData.reduce((sum, r) => sum + r.salary, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* Pagination */}
                {
                    totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing {(revenuePage - 1) * itemsPerPage + 1} to {Math.min(revenuePage * itemsPerPage, currentRevenueData.length)} of {currentRevenueData.length} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setRevenuePage(p => Math.max(1, p - 1))}
                                    disabled={revenuePage === 1}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${revenuePage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setRevenuePage(i + 1)}
                                        className={`w-8 h-8 text-xs font-medium rounded-md transition-all ${revenuePage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setRevenuePage(p => Math.min(totalPages, p + 1))}
                                    disabled={revenuePage === totalPages}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${revenuePage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )
                }
            </Card >

            {/* Recent Revenue & Services */}
            < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                {/* Recent Revenue History */}
                < Card className="p-6" >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />Recent Revenue</h3>
                        <Button variant="outline" size="sm" className="text-xs">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {recentRevenueHistory.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{item.client.charAt(0)}</div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{item.client}</p>
                                        <p className="text-xs text-gray-500">{item.service} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">{item.amount}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card >

                {/* Recent Services */}
                < Card className="p-6" >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Scissors className="w-5 h-5 text-purple-500" />Services Summary</h3>
                        <Button variant="outline" size="sm" className="text-xs">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {recentServices.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{item.service}</p>
                                    <p className="text-xs text-gray-500">{item.count} performed • Last: {item.lastPerformed}</p>
                                </div>
                                <p className="font-bold text-purple-600">{item.revenue}</p>
                            </div>
                        ))}
                    </div>
                </Card >
            </div >

            {/* Activity History */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-blue-500" />Activity History</h3>
                    <Button variant="outline" size="sm" className="text-xs">View All</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activityHistory.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${item.type === "service" ? "bg-purple-50" :
                                item.type === "review" ? "bg-yellow-50" :
                                    item.type === "booking" ? "bg-blue-50" :
                                        item.type === "payment" ? "bg-green-50" :
                                            "bg-gray-50"
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === "service" ? "bg-purple-100 text-purple-600" :
                                    item.type === "review" ? "bg-yellow-100 text-yellow-600" :
                                        item.type === "booking" ? "bg-blue-100 text-blue-600" :
                                            item.type === "payment" ? "bg-green-100 text-green-600" :
                                                "bg-gray-100 text-gray-600"
                                    }`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card >

            {/* Client Comments Preview */}
            < Card className="p-6" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-pink-500" />Recent Client Comments</h3>
                    <Button variant="outline" size="sm" className="text-xs">View All</Button>
                </div>
                <div className="space-y-4">
                    {clientComments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full ${comment.color} flex items-center justify-center font-bold`}>{comment.avatar}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900">{comment.client}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">{comment.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card >
        </div >
    );

    // Advanced View Component
    const AdvancedView = () => (
        <div className="space-y-6">
            {/* Performance Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {performanceCards.map((card, idx) => (
                    <Card key={idx} className="p-4 text-center">
                        <h3 className={`text-xl font-bold ${card.color}`}>{card.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{card.sublabel}</p>
                    </Card>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button variant="primary" className="bg-gradient-to-r from-purple-500 to-purple-600"><Eye className="w-4 h-4 mr-2" />View Reports</Button>
                <Button variant="primary" className="bg-gradient-to-r from-pink-500 to-pink-600"><BarChart3 className="w-4 h-4 mr-2" />Analytics</Button>
                <Button variant="primary" className="bg-gradient-to-r from-orange-500 to-orange-600"><Calendar className="w-4 h-4 mr-2" />Schedule</Button>
            </div>

            {/* Weekly Revenue & Client Volume */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="font-bold text-gray-900">Weekly Revenue Breakdown</h3><p className="text-xs text-gray-500">Last 12 weeks</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="font-bold text-gray-900">Client Volume Trend</h3><p className="text-xs text-gray-500">6 months overview</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={clientVolumeTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={3} dot={{ fill: "#EC4899", r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Earnings Breakdown Analysis */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Earnings Breakdown Analysis</h3><p className="text-xs text-gray-500">By service type</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={earningsBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip />
                        <Bar dataKey="braids" fill="#8B5CF6" />
                        <Bar dataKey="twists" fill="#EC4899" />
                        <Bar dataKey="cornrows" fill="#F59E0B" />
                        <Bar dataKey="locs" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-purple-500"></div><span>Braids</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-pink-500"></div><span>Twists</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-orange-500"></div><span>Cornrows</span></div>
                    <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-teal-500"></div><span>Locs</span></div>
                </div>
            </Card>

            {/* Weekly Performance Details Table */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Weekly Performance Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Period</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Clients</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Services</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Revenue</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Expenses</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {weeklyPerformanceDetails.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-900 font-medium">{row.date}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.clients}</td>
                                    <td className="px-3 py-3 text-center text-gray-600">{row.services}</td>
                                    <td className="px-3 py-3 text-right text-green-600 font-medium">€{row.revenue.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-right text-red-500 font-medium">€{row.expenses.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-right text-purple-600 font-bold">€{row.profit.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Salary Performance Details */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div><h3 className="font-bold text-gray-900">Salary / Performance Details</h3><p className="text-xs text-gray-500">Monthly breakdown</p></div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salaryPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip />
                        <Bar dataKey="value1" fill="#8B5CF6" />
                        <Bar dataKey="value2" fill="#EC4899" />
                        <Bar dataKey="value3" fill="#F59E0B" />
                        <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Daily Activities & Client Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Daily Activities Log</h3>
                    <div className="space-y-3">
                        {dailyActivities.map((activity, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${activity.type === "success" ? "bg-green-50 border-green-100" : "bg-blue-50 border-blue-100"}`}>
                                <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                                <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Client Satisfaction Ratings</h3>
                    <div className="space-y-3">
                        {clientSatisfactionData.map((client, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center font-bold`}>{client.avatar}</div>
                                    <div><p className="font-medium text-gray-900 text-sm">{client.name}</p><p className="text-xs text-gray-500">{client.service} • {client.date}</p></div>
                                </div>
                                <div className="flex items-center gap-1"><span className="text-lg font-bold text-gray-900">{client.rating}</span><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Service Distribution & Top Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Service Time Distribution</h3>
                    <div className="flex items-center justify-between">
                        <div className="w-1/2">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={serviceTimeDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                        {serviceTimeDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-2">
                            {serviceTimeDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-gray-600">{item.name}</span></div>
                                    <span className="font-medium text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Top Appointment Services</h3>
                    <div className="space-y-3">
                        {topAppointmentServices.map((service, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-purple-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                                    <span className="text-sm font-bold text-purple-600">{service.revenue}</span>
                                </div>
                                <div className="w-full bg-white/50 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${service.percentage}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{service.count} bookings</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Overall Performance */}
            <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Weekly Performance Summary Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip />
                        <Bar dataKey="value1" fill="#8B5CF6" />
                        <Bar dataKey="value2" fill="#EC4899" />
                        <Bar dataKey="value3" fill="#F59E0B" />
                        <Bar dataKey="value4" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Repeat Clients Card */}
            <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top 5 Repeat Clients</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {topRepeatClients.map((client, idx) => (
                        <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className={`w-12 h-12 rounded-full ${client.color} flex items-center justify-center font-bold mx-auto mb-2`}>{client.avatar}</div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.visits} visits</p>
                            <p className="text-sm font-bold text-purple-600 mt-1">{client.spent}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Client Comments Section - NEW */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-pink-500" />Client Comments & Reviews</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Average Rating:</span>
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900">4.7</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientComments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-full ${comment.color} flex items-center justify-center font-bold text-lg`}>{comment.avatar}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">{comment.client}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{comment.comment}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-400">{comment.date}</span>
                                        <button className="text-xs text-purple-600 hover:underline flex items-center gap-1"><ThumbsUp className="w-3 h-3" />Helpful</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orphelia&apos;s Performance</h1>
                        <p className="text-sm text-gray-500">Detailed analytics and performance metrics</p>
                    </div>
                </div>

                {/* Header Section - Purple Gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center border-4 border-white/30 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
                                    alt="Orphelia"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-3xl font-bold text-purple-600">O</span>';
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{workerData.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 text-purple-100 text-sm mt-1">
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{workerData.email}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{workerData.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">{workerData.role}</span>
                                    <span className="px-2 py-0.5 bg-green-400/30 rounded text-xs font-medium flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full"></div>{workerData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/workers/edit-advanced/${id}`}>
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs">
                                    <Edit className="w-3 h-3 mr-1" />Edit Profile
                                </Button>
                            </Link>
                            <Button variant="primary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50 text-xs">Download Report</Button>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setViewMode("simple")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "simple" ? "bg-white text-purple-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        <LayoutGrid className="w-4 h-4" />Simple
                    </button>
                    <button
                        onClick={() => setViewMode("advanced")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "advanced" ? "bg-white text-purple-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        <Table className="w-4 h-4" />Advanced
                    </button>
                </div>

                {/* Conditional View Render */}
                {viewMode === "simple" ? <SimpleView /> : <AdvancedView />}
            </div>
        </MainLayout>
    );
}
