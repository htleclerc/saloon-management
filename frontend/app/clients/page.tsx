"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plus, Download, Filter, Search, Eye, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const clients = [
    { id: "CLI-00123", name: "Marie Dubois", phone: "+33 6 12 34 56 78", email: "marie.dubois@email.com", address: "Paris, France", type: "Regular", totalVisits: 12, totalSpent: "€1440", status: "Active" },
    { id: "CLI-00124", name: "Jean Martin", phone: "+33 6 98 76 54 32", email: "jean.martin@email.com", address: "Lyon, France", type: "VIP", totalVisits: 8, totalSpent: "€960", status: "Active" },
    { id: "CLI-00125", name: "Sophie Laurent", phone: "+33 7 11 22 33 44", email: "sophie.laurent@email.com", address: "Marseille, France", type: "Regular", totalVisits: 5, totalSpent: "€475", status: "Active" },
    { id: "CLI-00126", name: "Pierre Rousseau", phone: "+33 6 55 66 77 88", email: "pierre.r@email.com", address: "Toulouse, France", type: "VIP", totalVisits: 15, totalSpent: "€2250", status: "Active" },
    { id: "CLI-00127", name: "Amélie Bernard", phone: "+33 7 44 55 66 77", email: "amelie.b@email.com", address: "Nice, France", type: "Regular", totalVisits: 3, totalSpent: "€330", status: "Inactive" },
    { id: "CLI-00128", name: "Thomas Petit", phone: "+33 6 33 44 55 66", email: "thomas.petit@email.com", address: "Nantes, France", type: "Regular", totalVisits: 7, totalSpent: "€735", status: "Active" },
    { id: "CLI-00129", name: "Isabelle Moreau", phone: "+33 7 22 33 44 55", email: "isabelle.m@email.com", address: "Bordeaux, France", type: "VIP", totalVisits: 20, totalSpent: "€2600", status: "Active" },
    { id: "CLI-00130", name: "Nicolas Simon", phone: "+33 6 77 88 99 00", email: "nicolas.simon@email.com", address: "Strasbourg, France", type: "Regular", totalVisits: 2, totalSpent: "€170", status: "Active" },
];

const clientTrendData = [
    { name: "This Month", clients: 8 },
    { name: "Last Month", clients: 42 },
    { name: "2 Months ago", clients: 347 },
];

const clientDistributionData = [
    { name: "Regular Clients", value: 123854, color: "#8B5CF6" },
    { name: "Occasional Clients", value: 104143, color: "#EC4899" },
    { name: "New Clients", value: 95643, color: "#F59E0B" },
    { name: "Above The Month", value: 84854, color: "#10B981" },
    { name: "Inactive Members", value: 78163, color: "#6B7280" },
];

export default function ClientsPage() {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Active").length;
    const vipClients = clients.filter(c => c.type === "VIP").length;
    const totalRevenue = clients.reduce((sum, c) => sum + parseFloat(c.totalSpent.replace(/[€,]/g, "")), 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                        <p className="text-gray-500 mt-1">Manage your client base and track their activity</p>
                    </div>
                    <Link href="/clients/add">
                        <Button variant="primary" size="md">
                            <Plus className="w-5 h-5" />
                            Add Client
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card gradient="bg-gradient-to-br from-purple-600 to-purple-700" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Clients</p>
                        <h3 className="text-4xl font-bold">{totalClients}</h3>
                        <p className="text-sm opacity-80 mt-1">+3% this month</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-pink-500 to-pink-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Active Clients</p>
                        <h3 className="text-4xl font-bold">{activeClients}</h3>
                        <p className="text-sm opacity-80 mt-1">Currently active</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-orange-500 to-orange-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">VIP Clients</p>
                        <h3 className="text-4xl font-bold">{vipClients}</h3>
                        <p className="text-sm opacity-80 mt-1">Premium members</p>
                    </Card>
                    <Card gradient="bg-gradient-to-br from-teal-500 to-teal-600" className="text-white">
                        <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold">€{totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">All clients</p>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/clients/add">
                        <Button variant="primary" size="lg" className="w-full">
                            <Plus className="w-5 h-5" />
                            Add New Client
                        </Button>
                    </Link>
                    <Button variant="secondary" size="lg" className="w-full">
                        <Download className="w-5 h-5" />
                        Generate Anonymous
                    </Button>
                    <Button variant="secondary" size="lg" className="w-full">
                        <Download className="w-5 h-5" />
                        Import Clients
                    </Button>
                </div>

                {/* Filter & Sort */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>All Clients</option>
                                <option>Regular</option>
                                <option>VIP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>All Time</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>Name (A-Z)</option>
                                <option>Name (Z-A)</option>
                                <option>Total Spent</option>
                                <option>Recent</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <Button variant="primary" size="md">
                            <Filter className="w-5 h-5" />
                            Apply Filters
                        </Button>
                        <Button variant="outline" size="md">
                            <Download className="w-5 h-5" />
                            Export
                        </Button>
                    </div>
                </Card>

                {/* Clients Table */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">All Clients</h3>
                        <p className="text-sm text-gray-500">Showing {clients.length} of 8,447 results</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Visits</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{client.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm">
                                                <p className="text-gray-900">{client.phone}</p>
                                                <p className="text-gray-500">{client.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{client.address}</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.type === "VIP" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {client.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">{client.totalVisits}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{client.totalSpent}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="text-purple-600 hover:text-purple-800 p-1">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <Link href={`/clients/edit/${client.id}`}>
                                                    <button className="text-blue-600 hover:text-blue-800 p-1">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button className="text-red-600 hover:text-red-800 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Bulk Actions & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bulk Actions */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" size="sm" className="w-full">Send Email</Button>
                            <Button variant="outline" size="sm" className="w-full">Send SMS</Button>
                            <Button variant="outline" size="sm" className="w-full">Export Selected</Button>
                            <Button variant="danger" size="sm" className="w-full">Delete Selected</Button>
                        </div>
                    </Card>

                    {/* Client Distribution */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Client Distribution</h3>
                        <div className="space-y-3">
                            {clientDistributionData.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{ width: `${(item.value / 500000) * 100}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Client Registration Trend */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Client Registration Trend</h3>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        {clientTrendData.map((item, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-sm text-gray-500 mb-1">{item.name}</p>
                                <p className={`text-3xl font-bold ${idx === 0 ? 'text-purple-600' : idx === 1 ? 'text-pink-600' : 'text-orange-600'}`}>
                                    {item.clients}
                                </p>
                                <p className="text-sm text-gray-500">{item.clients === 8 ? "clients" : item.clients === 42 ? "clients" : "clients"}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Client Activity */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Recent Client Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">New Client registered</p>
                                <p className="text-sm text-gray-500">Marie Smith created a new account with email verification</p>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                <Edit className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">Client information updated</p>
                                <p className="text-sm text-gray-500">James Clerk updated his phone number and address</p>
                            </div>
                            <span className="text-sm text-gray-500">5 hours ago</span>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout >
    );
}
