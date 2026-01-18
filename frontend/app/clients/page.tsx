"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import Button from "@/components/ui/Button";
import { Plus, Download, Filter, Search, Eye, Edit, Trash2, Users, UserPlus, RefreshCcw, User, ArrowUp, Upload, MessageSquare, X, Phone, Mail, MapPin, Calendar, CreditCard, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { exportToCSV, exportToPDF, ExportColumn } from "@/lib/export";

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

// Export columns configuration
const clientExportColumns: ExportColumn[] = [
    { key: "id", header: "Client ID" },
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    { key: "address", header: "Address" },
    { key: "type", header: "Type" },
    { key: "totalVisits", header: "Total Visits" },
    { key: "totalSpent", header: "Total Spent" },
    { key: "status", header: "Status" },
];

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { getCardStyle } = useKpiCardStyle();
    const [selectedClient, setSelectedClient] = useState<any>(null); // Quick type for now
    const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Active").length;
    const vipClients = clients.filter(c => c.type === "VIP").length;
    const totalRevenue = clients.reduce((sum, c) => sum + parseFloat(c.totalSpent.replace(/[€,]/g, "")), 0);

    // Toggle client selection
    const toggleClientSelection = (id: string) => {
        const newSelected = new Set(selectedClientIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedClientIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedClientIds.size === clients.length) {
            setSelectedClientIds(new Set());
        } else {
            setSelectedClientIds(new Set(clients.map(c => c.id)));
        }
    };

    // Export handlers
    const handleExportAll = () => {
        exportToCSV(clients, clientExportColumns, "clients");
    };

    const handleExportPDF = () => {
        exportToPDF(clients, clientExportColumns, "Clients Report", "clients");
    };

    const handleExportSelected = () => {
        const selectedClients = clients.filter(c => selectedClientIds.has(c.id));
        if (selectedClients.length === 0) {
            alert("Please select at least one client to export");
            return;
        }
        exportToCSV(selectedClients, clientExportColumns, "clients_selected");
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                        <p className="text-gray-500 mt-1">Add, modify, or delete client information</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Total</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Total Clients</p>
                            <h3 className="text-3xl font-bold">{totalClients}</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+23 this month</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">New</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">New This Month</p>
                            <h3 className="text-3xl font-bold">42</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+8 from last month</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <RefreshCcw className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Rate</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Returning Clients</p>
                            <h3 className="text-3xl font-bold">78%</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+5% improvement</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(3)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Anonymous</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Anonymous Clients</p>
                            <h3 className="text-3xl font-bold">124</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>14.6% of total</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200" onClick={handleExportAll}>
                                <Download className="w-4 h-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200" onClick={handleExportPDF}>
                                <FileText className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/clients/add">
                            <button className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white py-3 rounded-lg transition-colors font-medium">
                                <UserPlus className="w-5 h-5" />
                                Add New Client
                            </button>
                        </Link>
                        <button className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-lg transition-colors font-medium">
                            <User className="w-5 h-5" />
                            Generate Anonymous
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 bg-[#EC4899] hover:bg-[#DB2777] text-white py-3 rounded-lg transition-colors font-medium">
                            <Upload className="w-5 h-5" />
                            Import Clients
                        </button>
                    </div>
                </div>

                {/* Filter & Sort Clients */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort Clients</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Client Type</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>All Clients</option>
                                <option>Regular</option>
                                <option>VIP</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Registration Date</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>All Time</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Sort By</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>Name (A-Z)</option>
                                <option>Name (Z-A)</option>
                                <option>Total Spent</option>
                                <option>Recent</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <Button variant="primary" size="md" className="w-full md:w-auto bg-[#A855F7] hover:bg-[#9333EA] border-none h-[42px] px-6">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        {/* ... (Header content unchanged) ... */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">All Clients</h3>
                            <p className="text-sm text-gray-500">Manage your client database</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Show:</span>
                            <select className="border-none bg-transparent font-semibold text-gray-900 focus:ring-0 cursor-pointer">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            <span>per page</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedClientIds.size === clients.length && clients.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-[#A855F7] focus:ring-[#A855F7]"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Client ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Visits</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients.map((client) => (
                                    <tr
                                        key={client.id}
                                        onClick={() => setSelectedClient(client)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedClientIds.has(client.id)}
                                                onChange={() => toggleClientSelection(client.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="rounded border-gray-300 text-[#A855F7] focus:ring-[#A855F7]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono hidden lg:table-cell">{client.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-[#A855F7] font-bold text-sm border border-purple-200">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <span className="font-semibold text-gray-900 hidden md:block">{client.name}</span>
                                                    <span className="text-xs text-gray-400 hidden md:block">Registered {client.id === "CLI-00123" ? "2 months ago" : "recently"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <div className="text-sm">
                                                <p className="text-gray-900 font-medium flex items-center gap-2">
                                                    <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-xs">@</span>
                                                    {client.email}
                                                </p>
                                                <p className="text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-xs">Ph</span>
                                                    {client.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">{client.address}</td>
                                        <td className="px-6 py-4 text-gray-900 font-semibold">{client.totalVisits}</td>
                                        <td className="px-6 py-4 text-gray-900 font-bold">{client.totalSpent}</td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {/* Logic to choose badge style based on status/type */}
                                            {client.type === "VIP" ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                    VIP
                                                </span>
                                            ) : client.id.includes("125") ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                                                    Anonymous
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${client.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    {client.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination - Simple Placeholder */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900">Prev</button>
                        <button className="px-3 py-1 text-sm bg-[#A855F7] text-white rounded">1</button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900">2</button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900">3</button>
                        <span className="text-gray-400">...</span>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900">Next</button>
                    </div>
                </div>


                {/* Bulk Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Bulk Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="secondary" size="md" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none flex-1 md:flex-none justify-center">
                            <Users className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                        <Button variant="secondary" size="md" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex-1 md:flex-none justify-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send SMS
                        </Button>
                        <Button variant="secondary" size="md" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none flex-1 md:flex-none justify-center" onClick={handleExportSelected}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Selected ({selectedClientIds.size})
                        </Button>
                        <Button variant="danger" size="md" className="bg-red-100 text-red-700 hover:bg-red-200 border-none flex-1 md:flex-none justify-center">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
                {/* Trend & Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Registration Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900">Client Registration Trend</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">This Week</p>
                                    <h4 className="text-2xl font-bold text-gray-900">8 clients</h4>
                                </div>
                                <div className="w-12 h-12 bg-[#A855F7] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-purple-200">
                                    +8
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">This Month</p>
                                    <h4 className="text-2xl font-bold text-gray-900">42 clients</h4>
                                </div>
                                <div className="w-12 h-12 bg-[#EC4899] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-pink-200">
                                    +42
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">This Year</p>
                                    <h4 className="text-2xl font-bold text-gray-900">347 clients</h4>
                                </div>
                                <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-orange-200">
                                    +347
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Distribution */}
                    {/* Client Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900">Client Distribution</h3>
                        <div className="space-y-6">
                            {clientDistributionData.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()} ({((item.value / 500000) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-1000"
                                            style={{ width: `${(item.value / 500000) * 100}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs text-center text-gray-400">Data updated every 24 hours</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
            </div>

            {/* Client Details Modal */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedClient(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="px-6 pt-6 pb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-[#A855F7] font-bold text-3xl border-2 border-purple-200">
                                    {selectedClient.name.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedClient.type === "VIP" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                        {selectedClient.type}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedClient.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {selectedClient.status}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedClient.name}</h2>
                            <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">ID: {selectedClient.id}</span>
                            </p>

                            <div className="grid gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Phone</p>
                                        <p className="font-medium text-gray-900">{selectedClient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Email</p>
                                        <p className="font-medium text-gray-900">{selectedClient.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Address</p>
                                        <p className="font-medium text-gray-900">{selectedClient.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                    <p className="text-purple-600 text-sm font-semibold mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedClient.totalSpent}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                                    <p className="text-blue-600 text-sm font-semibold mb-1">Total Visits</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedClient.totalVisits}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="primary" size="lg" className="w-full justify-center">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                                <Button variant="outline" size="lg" className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout >
    );
}
