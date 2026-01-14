"use client";

import Link from "next/link";
import WorkersLayout from "@/components/layout/WorkersLayout";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Users, DollarSign, TrendingUp, Star, Plus, Eye } from "lucide-react";

const workers = [
    {
        id: 1,
        name: "Orphelia",
        avatar: "O",
        status: "Active",
        sharingKey: 70,
        totalRevenue: "€45,830",
        totalSalary: "€32,081",
        clients: 187,
        rating: 4.9,
        services: 203,
        color: "from-purple-500 to-purple-700",
    },
    {
        id: 2,
        name: "Worker 2",
        avatar: "W2",
        status: "Active",
        sharingKey: 55,
        totalRevenue: "€38,650",
        totalSalary: "€21,258",
        clients: 156,
        rating: 4.8,
        services: 178,
        color: "from-pink-500 to-pink-700",
    },
    {
        id: 3,
        name: "Worker 3",
        avatar: "W3",
        status: "Active",
        sharingKey: 60,
        totalRevenue: "€42,200",
        totalSalary: "€25,320",
        clients: 165,
        rating: 4.7,
        services: 189,
        color: "from-orange-500 to-orange-700",
    },
    {
        id: 4,
        name: "Worker 4",
        avatar: "W4",
        status: "Active",
        sharingKey: 50,
        totalRevenue: "€35,420",
        totalSalary: "€17,710",
        clients: 142,
        rating: 4.6,
        services: 165,
        color: "from-teal-500 to-teal-700",
    },
    {
        id: 5,
        name: "Worker 5",
        avatar: "W5",
        status: "Inactive",
        sharingKey: 55,
        totalRevenue: "€28,340",
        totalSalary: "€15,587",
        clients: 118,
        rating: 4.5,
        services: 134,
        color: "from-blue-500 to-blue-700",
    },
    {
        id: 6,
        name: "Worker 6",
        avatar: "W6",
        status: "Active",
        sharingKey: 65,
        totalRevenue: "€39,850",
        totalSalary: "€25,903",
        clients: 171,
        rating: 4.8,
        services: 192,
        color: "from-indigo-500 to-indigo-700",
    },
];

export default function WorkersPage() {
    const totalRevenue = workers.reduce((sum, w) => sum + parseFloat(w.totalRevenue.replace(/[€,]/g, "")), 0);
    const totalSalary = workers.reduce((sum, w) => sum + parseFloat(w.totalSalary.replace(/[€,]/g, "")), 0);
    const totalClients = workers.reduce((sum, w) => sum + w.clients, 0);

    return (
        <WorkersLayout
            title="Workers Overview"
            description="Gérez votre équipe et suivez leurs performances"
        >
            <div className="space-y-6">
                {/* Quick Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/workers/add">
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                            Quick Add
                        </Button>
                    </Link>
                    <Link href="/workers/add-advanced">
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4" />
                            Complete Form
                        </Button>
                    </Link>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Workers"
                        value={workers.length}
                        icon={Users}
                        gradient="bg-gradient-to-br from-purple-600 to-purple-700"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`€${totalRevenue.toLocaleString()}`}
                        subtitle="All workers"
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                    />
                    <StatCard
                        title="Total Salaries"
                        value={`€${totalSalary.toLocaleString()}`}
                        subtitle="All workers"
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                    />
                    <StatCard
                        title="Total Clients"
                        value={totalClients}
                        subtitle="All workers"
                        icon={Star}
                        gradient="bg-gradient-to-br from-teal-500 to-teal-600"
                    />
                </div>

                {/* Workers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workers.map((worker) => (
                        <Card key={worker.id} className="hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                                        {worker.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{worker.name}</h3>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${worker.status === "Active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {worker.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-semibold">{worker.rating}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sharing Key:</span>
                                    <span className="font-semibold text-purple-600">{worker.sharingKey}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Revenue:</span>
                                    <span className="font-semibold text-gray-900">{worker.totalRevenue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Salary:</span>
                                    <span className="font-semibold text-green-600">{worker.totalSalary}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Clients:</span>
                                    <span className="font-semibold text-gray-900">{worker.clients}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Services:</span>
                                    <span className="font-semibold text-gray-900">{worker.services}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/workers/detail/${worker.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </Button>
                                </Link>
                                <Link href={`/workers/edit/${worker.id}`} className="flex-1">
                                    <Button variant="primary" size="sm" className="w-full">
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Performance Table */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Performance Overview (This Month)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Share %</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salary</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Clients</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {workers.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                                    {worker.avatar}
                                                </div>
                                                <span className="font-medium text-gray-900">{worker.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${worker.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {worker.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-purple-600 font-semibold">{worker.sharingKey}%</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{worker.totalRevenue}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-green-600">{worker.totalSalary}</td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">{worker.clients}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold">{worker.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link href={`/workers/detail/${worker.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </WorkersLayout>
    );
}
