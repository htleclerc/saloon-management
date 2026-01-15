"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Filter, Download, Calendar, BarChart2 } from "lucide-react";

const revenues = [
    { id: 1, date: "2026-01-12", client: "Marie Dubois", service: "Box Braids", worker: "Orphelia", amount: 120, status: "Completed" },
    { id: 2, date: "2026-01-12", client: "Jean Martin", service: "Cornrows", worker: "Worker 2", amount: 85, status: "Completed" },
    { id: 3, date: "2026-01-11", client: "Sophie Laurent", service: "Twists", worker: "Orphelia", amount: 95, status: "Completed" },
    { id: 4, date: "2026-01-11", client: "Pierre Rousseau", service: "Locs", worker: "Worker 3", amount: 150, status: "Completed" },
    { id: 5, date: "2026-01-10", client: "Amélie Bernard", service: "Senegalese Twists", worker: "Worker 2", amount: 110, status: "Completed" },
    { id: 6, date: "2026-01-10", client: "Thomas Petit", service: "Box Braids", worker: "Orphelia", amount: 120, status: "Completed" },
    { id: 7, date: "2026-01-09", client: "Isabelle Moreau", service: "Goddess Braids", worker: "Worker 3", amount: 130, status: "Completed" },
    { id: 8, date: "2026-01-09", client: "Nicolas Simon", service: "Cornrows", worker: "Worker 2", amount: 85, status: "Pending" },
];

export default function RevenusPage() {
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const completedRevenue = revenues.filter(r => r.status === "Completed").reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = revenues.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.amount, 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Income Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage all income streams</p>
                    </div>
                    <div className="flex flex-nowrap gap-2">
                        <Link href="/income/advanced">
                            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <BarChart2 className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Vue Avancée</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Export</span>
                        </Button>
                        <Link href="/income/add">
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Add Income</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card gradient="bg-gradient-to-br from-purple-600 to-purple-700" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Income</p>
                        <h3 className="text-3xl font-bold">€{totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">All transactions</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-green-500 to-green-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Completed</p>
                        <h3 className="text-3xl font-bold">€{completedRevenue.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">{revenues.filter(r => r.status === "Completed").length} transactions</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-orange-500 to-orange-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Pending</p>
                        <h3 className="text-3xl font-bold">€{pendingRevenue.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">{revenues.filter(r => r.status === "Pending").length} transactions</p>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Workers</option>
                                <option value="orphelia">Orphelia</option>
                                <option value="worker2">Worker 2</option>
                                <option value="worker3">Worker 3</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="self-end">
                            <Button variant="outline" size="md">
                                <Filter className="w-5 h-5" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Revenue Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {revenues.map((revenue) => (
                                    <tr key={revenue.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4 text-sm text-gray-500">#{revenue.id}</td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{revenue.date}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    {revenue.client.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{revenue.client}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{revenue.service}</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {revenue.worker}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">€{revenue.amount}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${revenue.status === "Completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-orange-100 text-orange-800"
                                                    }`}
                                            >
                                                {revenue.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/income/edit/${revenue.id}`}>
                                                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">Edit</button>
                                                </Link>
                                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
