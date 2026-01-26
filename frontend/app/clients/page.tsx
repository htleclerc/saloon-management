"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import Button from "@/components/ui/Button";
import {
    Plus, Download, Filter, Search, Eye, Edit, Trash2, Users, UserPlus, RefreshCcw,
    User, ArrowUp, Upload, MessageSquare, X, Phone, Mail, MapPin, Calendar, CreditCard,
    FileText, UserCheck
} from "lucide-react";
import { exportToCSV, exportToPDF, ExportColumn } from "@/lib/export";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { clientService } from "@/lib/services/ClientService";
import { Client, ClientStats, ClientAnalytics } from "@/types";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation } from "@/i18n";

export default function ClientsPage() {
    const { t } = useTranslation();
    const { activeSalonId } = useAuth();
    const [clients, setClients] = useState<(Client & { stats?: ClientStats | null })[]>([]);
    const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { getCardStyle } = useKpiCardStyle();
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (activeSalonId) {
            loadData();
        }
    }, [activeSalonId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const salonId = Number(activeSalonId);

            // Parallel loading of clients and analytics
            const [clientsData, analyticsData] = await Promise.all([
                clientService.getAll(salonId),
                clientService.getClientAnalytics(salonId)
            ]);

            // Fetch stats for each client
            const clientsWithStats = await Promise.all(clientsData.map(async (client: Client) => {
                const stats = await clientService.getClientStats(client.id);
                return { ...client, stats };
            }));

            setClients(clientsWithStats);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to load clients data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.isActive).length;

    // Fallback if stats service is not fully ready for all clients
    const newClientsThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return clients.filter(c => new Date(c.createdAt) >= startOfMonth).length;
    }, [clients]);

    const returningRate = useMemo(() => {
        const returningClients = clients.filter(c => (c.stats?.totalBookings || 0) > 1).length;
        return totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;
    }, [clients, totalClients]);

    const toggleClientSelection = (id: number) => {
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

    const clientExportColumns: ExportColumn[] = [
        { key: "id", header: t("clients.table.id") },
        { key: "name", header: t("clients.table.name") },
        { key: "phone", header: t("common.phone") },
        { key: "email", header: t("common.email") },
        { key: "address", header: t("common.address") },
        { key: "type", header: t("clients.filters.type") },
        { key: "totalVisits", header: t("clients.table.visits") },
        { key: "totalSpent", header: t("clients.totalSpent") },
        { key: "status", header: t("clients.table.status") },
    ];

    const handleExportAll = () => exportToCSV(clients, clientExportColumns, "clients");
    const handleExportPDF = () => exportToPDF(clients, clientExportColumns, t("clients.title"), "clients");

    const handleExportSelected = () => {
        const selectedClients = clients.filter(c => selectedClientIds.has(c.id));
        if (selectedClients.length === 0) {
            alert(t("common.noData"));
            return;
        }
        exportToCSV(selectedClients, clientExportColumns, "clients_selected");
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t("clients.title")}</h1>
                        <p className="text-gray-500 mt-1">{t("clients.subtitle")}</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center justify-end">
                        <ReadOnlyGuard>
                            <Link href="/clients/add">
                                <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                    <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                    <span className="hidden md:inline ml-2 font-bold whitespace-nowrap">{t("clients.addClient")}</span>
                                </Button>
                            </Link>
                        </ReadOnlyGuard>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{t("common.total")}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">{t("clients.stats.total")}</p>
                            <h3 className="text-3xl font-bold">{totalClients}</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <ArrowUp className="w-3 h-3" />
                                <span>+23 {t("dashboard.thisMonth")}</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{t("dashboard.vsLastMonth")}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">{t("clients.stats.newThisMonth")}</p>
                            <h3 className="text-3xl font-bold">{newClientsThisMonth}</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <Plus className="w-3 h-3" />
                                <span>{t("clients.stats.recentRegistrations")}</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <RefreshCcw className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{t("clients.stats.returningRate")}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">{t("clients.stats.returningRate")}</p>
                            <h3 className="text-3xl font-bold">{returningRate}%</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <RefreshCcw className="w-3 h-3" />
                                <span>{t("clients.stats.loyaltyIndex")}</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="text-white" style={getCardStyle(3)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{t("common.active")}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">{t("clients.stats.active")}</p>
                            <h3 className="text-3xl font-bold">{activeClients}</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
                                <UserCheck className="w-3 h-3" />
                                <span>{t("clients.stats.activeDatabase")}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{t("clients.actions.quickActions")}</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200">
                                <Filter className="w-4 h-4 mr-2" />
                                {t("common.filters")}
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
                        <ReadOnlyGuard>
                            <button className="flex-1 h-14 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl transition-all font-bold active:scale-95">
                                <Plus className="w-6 h-6" />
                                <span className="hidden sm:inline">{t("clients.actions.quickGeneric")}</span>
                            </button>
                        </ReadOnlyGuard>
                        <ReadOnlyGuard>
                            <button className="flex-1 h-14 flex items-center justify-center gap-2 bg-[#EC4899] hover:bg-[#DB2777] text-white rounded-2xl transition-all font-bold active:scale-95">
                                <Upload className="w-6 h-6" />
                                <span className="hidden sm:inline">{t("clients.actions.import")}</span>
                            </button>
                        </ReadOnlyGuard>
                    </div>
                </div>

                {/* Filter & Sort Clients */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("clients.filters.title")}</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("clients.filters.type")}</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>{t("clients.filters.allTypes")}</option>
                                <option>{t("clients.filters.regular")}</option>
                                <option>{t("clients.filters.vip")}</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("clients.filters.status")}</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>{t("clients.filters.allStatus")}</option>
                                <option>{t("clients.filters.active")}</option>
                                <option>{t("clients.filters.inactive")}</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("clients.filters.regDate")}</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>{t("clients.filters.allTime")}</option>
                                <option>{t("clients.filters.thisMonth")}</option>
                                <option>{t("clients.filters.last3Months")}</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t("clients.filters.sortBy")}</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent">
                                <option>{t("clients.filters.nameAsc")}</option>
                                <option>{t("clients.filters.nameDesc")}</option>
                                <option>{t("clients.filters.totalSpent")}</option>
                                <option>{t("clients.filters.recent")}</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <Button variant="primary" size="md" className="w-full md:w-auto bg-[#A855F7] hover:bg-[#9333EA] border-none h-[42px] px-6">
                                {t("clients.actions.applyFilters")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t("clients.table.title")}</h3>
                            <p className="text-sm text-gray-500">{t("clients.table.subtitle")}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{t("clients.table.show")}:</span>
                            <select className="border-none bg-transparent font-semibold text-gray-900 focus:ring-0 cursor-pointer">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            <span>{t("clients.table.perPage")}</span>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t("clients.table.id")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("clients.table.name")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t("clients.table.contact")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t("clients.table.address")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("clients.table.visits")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("clients.totalSpent")}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t("clients.table.status")}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("clients.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients
                                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())))
                                    .map((client) => (
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
                                                        <span className="text-xs text-gray-400 hidden md:block">{t("clients.table.registered")} {new Date(client.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 font-medium flex items-center gap-2">
                                                        <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-xs">@</span>
                                                        {client.email || "N/A"}
                                                    </p>
                                                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                                                        <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-xs">Ph</span>
                                                        {client.phone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">{client.address || "N/A"}</td>
                                            <td className="px-6 py-4 text-gray-900 font-semibold">{client.stats?.totalBookings || 0}</td>
                                            <td className="px-6 py-4 text-gray-900 font-bold">{client.stats?.totalSpent || 0}€</td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${client.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    {client.isActive ? t("common.active") : t("common.inactive")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <ReadOnlyGuard>
                                                        <Link href={`/clients/edit/${client.id}`}>
                                                            <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                    </ReadOnlyGuard>

                                                    <ReadOnlyGuard>
                                                        <button
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            onClick={async () => {
                                                                if (confirm(t("dialogs.confirmDelete"))) {
                                                                    await clientService.delete(client.id);
                                                                    loadData();
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </ReadOnlyGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Bulk Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("clients.actions.bulkActions")}</h3>
                    <div className="flex flex-wrap gap-4">
                        <ReadOnlyGuard>
                            <Button variant="secondary" size="md" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none flex-1 md:flex-none justify-center">
                                <Users className="w-4 h-4 mr-2" />
                                {t("clients.actions.sendEmail")}
                            </Button>
                        </ReadOnlyGuard>
                        <ReadOnlyGuard>
                            <Button variant="secondary" size="md" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex-1 md:flex-none justify-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t("clients.actions.sendSms")}
                            </Button>
                        </ReadOnlyGuard>
                        <Button variant="secondary" size="md" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none flex-1 md:flex-none justify-center" onClick={handleExportSelected}>
                            <Download className="w-4 h-4 mr-2" />
                            {t("clients.actions.exportSelected")} ({selectedClientIds.size})
                        </Button>
                        <ReadOnlyGuard>
                            <Button variant="danger" size="md" className="bg-red-100 text-red-700 hover:bg-red-200 border-none flex-1 md:flex-none justify-center">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("clients.actions.deleteSelected")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </div>

                {/* Trend & Distribution */}
                {analytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Client Registration Trend */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 text-gray-900">{t("clients.trend.title")}</h3>
                            <div className="space-y-4">
                                {analytics.trend.map((item, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl ${idx === 0 ? "bg-gray-50" : idx === 1 ? "bg-red-50" : "bg-orange-50"}`}>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{t(item.key)}</p>
                                            <h4 className="text-2xl font-bold text-gray-900">{item.clients} {t("clients.trend.clientsSuffix")}</h4>
                                        </div>
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${idx === 0 ? "bg-[#A855F7] shadow-purple-200" : idx === 1 ? "bg-[#EC4899] shadow-pink-200" : "bg-[#F59E0B] shadow-orange-200"}`}>
                                            +{item.clients}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Client Distribution */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 text-gray-900">{t("clients.distribution.title")}</h3>
                            <div className="space-y-6">
                                {analytics.distribution.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">{t(item.key)}</span>
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
                                <p className="text-xs text-center text-gray-400">{t("clients.distribution.updatedEvery")}</p>
                            </div>
                        </div>
                    </div>
                )}

                {analytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Client Activity */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t("clients.activity.title")}</h3>
                            <div className="space-y-3">
                                {analytics.recentActivity.map((activity) => (
                                    <div key={activity.id} className={`flex items-center gap-4 p-3 rounded-lg ${activity.type === 'registration' ? 'bg-green-50' : 'bg-blue-50'}`}>
                                        <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-white`}>
                                            {activity.icon === 'plus' ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{t(activity.titleKey)}</p>
                                            <p className="text-sm text-gray-500">{t(activity.descKey, activity.params)}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">{t(activity.timeKey)}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
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
                                        {selectedClient.type || t("clients.filters.regular")}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedClient.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {selectedClient.isActive ? t("common.active") : t("common.inactive")}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedClient.name}</h2>
                            <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{t("common.id")}: {selectedClient.id}</span>
                            </p>

                            <div className="grid gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t("common.phone")}</p>
                                        <p className="font-medium text-gray-900">{selectedClient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t("common.email")}</p>
                                        <p className="font-medium text-gray-900">{selectedClient.email || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t("common.address")}</p>
                                        <p className="font-medium text-gray-900">{selectedClient.address || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                    <p className="text-purple-600 text-sm font-semibold mb-1">{t("clients.totalSpent")}</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedClient.stats?.totalSpent || 0}€</p>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                                    <p className="text-blue-600 text-sm font-semibold mb-1">{t("clients.visits")}</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedClient.stats?.totalBookings || 0}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <ReadOnlyGuard>
                                    <Link href={`/clients/edit/${selectedClient.id}`} className="w-full">
                                        <Button variant="primary" size="lg" className="w-full justify-center">
                                            <Edit className="w-4 h-4 mr-2" />
                                            {t("clients.editClient")}
                                        </Button>
                                    </Link>
                                </ReadOnlyGuard>
                                <ReadOnlyGuard>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
                                        onClick={async () => {
                                            if (confirm(t("dialogs.confirmDelete"))) {
                                                await clientService.delete(selectedClient.id);
                                                setSelectedClient(null);
                                                loadData();
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {t("common.delete")}
                                    </Button>
                                </ReadOnlyGuard>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
