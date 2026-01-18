"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, User, Plus, Search, Eye, Edit, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, FileText, CheckSquare, Square } from "lucide-react";
import { exportToCSV, exportToPDF, sortData, SortConfig, SortDirection, getNextSortDirection, ExportColumn } from "@/lib/export";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth, RequirePermission } from "@/context/AuthProvider";

// Mock appointments data
const appointmentsData = [
    { id: "APT-001", clientName: "Marie Dubois", clientPhone: "+33 6 12 34 56 78", service: "Box Braids", worker: "Orphelia", date: "2026-01-20", time: "09:00", duration: "3h", price: "€120", status: "Confirmed" },
    { id: "APT-002", clientName: "Jean Martin", clientPhone: "+33 6 98 76 54 32", service: "Cornrows", worker: "Worker 2", date: "2026-01-20", time: "10:30", duration: "2h", price: "€85", status: "Pending" },
    { id: "APT-003", clientName: "Sophie Laurent", clientPhone: "+33 7 11 22 33 44", service: "Twists", worker: "Worker 3", date: "2026-01-20", time: "14:00", duration: "2.5h", price: "€95", status: "Confirmed" },
    { id: "APT-004", clientName: "Pierre Rousseau", clientPhone: "+33 6 55 66 77 88", service: "Locs", worker: "Orphelia", date: "2026-01-21", time: "11:00", duration: "4h", price: "€150", status: "Completed" },
    { id: "APT-005", clientName: "Anonymous Client", clientPhone: "-", service: "Braids", worker: "Worker 4", date: "2026-01-21", time: "15:30", duration: "2h", price: "€110", status: "Cancelled" },
    { id: "APT-006", clientName: "Amélie Bernard", clientPhone: "+33 7 44 55 66 77", service: "Hair Treatment", worker: "Worker 2", date: "2026-01-22", time: "10:00", duration: "1.5h", price: "€75", status: "Confirmed" },
    { id: "APT-007", clientName: "Lucas Petit", clientPhone: "+33 6 22 33 44 55", service: "Box Braids", worker: "Orphelia", date: "2026-01-22", time: "14:00", duration: "3h", price: "€120", status: "Pending" },
    { id: "APT-008", clientName: "Emma Leroy", clientPhone: "+33 7 88 99 00 11", service: "Cornrows", worker: "Worker 3", date: "2026-01-23", time: "09:30", duration: "2h", price: "€85", status: "Confirmed" },
    { id: "APT-009", clientName: "Thomas Moreau", clientPhone: "+33 6 11 22 33 44", service: "Twists", worker: "Worker 2", date: "2026-01-23", time: "11:00", duration: "2.5h", price: "€95", status: "Pending" },
    { id: "APT-010", clientName: "Léa Simon", clientPhone: "+33 7 55 66 77 88", service: "Locs", worker: "Worker 4", date: "2026-01-24", time: "10:00", duration: "4h", price: "€150", status: "Confirmed" },
    { id: "APT-011", clientName: "Hugo Michel", clientPhone: "+33 6 99 88 77 66", service: "Hair Treatment", worker: "Orphelia", date: "2026-01-24", time: "15:00", duration: "1.5h", price: "€75", status: "Completed" },
    { id: "APT-012", clientName: "Chloé Garcia", clientPhone: "+33 7 33 22 11 00", service: "Senegalese Twists", worker: "Worker 2", date: "2026-01-25", time: "09:00", duration: "4h", price: "€135", status: "Confirmed" },
];

type Appointment = typeof appointmentsData[0];

// Export columns configuration
const exportColumns: ExportColumn[] = [
    { key: "id", header: "ID" },
    { key: "clientName", header: "Client" },
    { key: "clientPhone", header: "Phone" },
    { key: "service", header: "Service" },
    { key: "worker", header: "Worker" },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "duration", header: "Duration" },
    { key: "price", header: "Price" },
    { key: "status", header: "Status" },
];

export default function AppointmentsPage() {
    const { getCardStyle } = useKpiCardStyle();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [workerFilter, setWorkerFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const { user, hasPermission, canAddServices } = useAuth();
    const isWorker = user?.role === 'worker';
    const isClient = user?.role === 'client';
    const currentUserName = user?.name || 'Admin User';

    // Filter total data based on worker/client status
    const initialAppointments = useMemo(() => {
        if (isWorker) {
            return appointmentsData.filter(apt => apt.worker === currentUserName);
        }
        if (isClient) {
            // For demo, we'll match clientName with the user's name
            return appointmentsData.filter(apt => apt.clientName === "Marie Dubois" || apt.clientName === currentUserName);
        }
        return appointmentsData;
    }, [isWorker, isClient, currentUserName]);

    // Get unique workers for filter
    const workers = useMemo(() => {
        const uniqueWorkers = [...new Set(initialAppointments.map(a => a.worker))];
        return uniqueWorkers.sort();
    }, [initialAppointments]);

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        return initialAppointments.filter((apt) => {
            const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
            const matchesWorker = workerFilter === "All" || apt.worker === workerFilter;
            return matchesSearch && matchesStatus && matchesWorker;
        });
    }, [searchTerm, statusFilter, workerFilter, initialAppointments]);

    // Sort appointments
    const sortedAppointments = useMemo(() => {
        return sortData(filteredAppointments, sortConfig);
    }, [filteredAppointments, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const paginatedAppointments = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle sort
    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                const nextDirection = getNextSortDirection(current.direction);
                return nextDirection ? { key, direction: nextDirection } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    // Get sort icon
    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) {
            return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-3.5 h-3.5 text-purple-600" />;
        }
        return <ArrowDown className="w-3.5 h-3.5 text-purple-600" />;
    };

    // Handle selection
    const toggleSelectAll = () => {
        if (selectedItems.size === paginatedAppointments.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(paginatedAppointments.map(a => a.id)));
        }
    };

    const toggleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const isAllSelected = paginatedAppointments.length > 0 && selectedItems.size === paginatedAppointments.length;

    // Handle bulk actions
    const handleBulkDelete = () => {
        alert(`Would delete ${selectedItems.size} appointments: ${Array.from(selectedItems).join(", ")}`);
        setSelectedItems(new Set());
    };

    const handleBulkStatusChange = (status: string) => {
        alert(`Would change status to "${status}" for ${selectedItems.size} appointments`);
        setSelectedItems(new Set());
    };

    // Handle export
    const handleExportCSV = () => {
        const dataToExport = selectedItems.size > 0
            ? sortedAppointments.filter(a => selectedItems.has(a.id))
            : sortedAppointments;
        exportToCSV(dataToExport, exportColumns, "appointments");
    };

    const handleExportPDF = () => {
        const dataToExport = selectedItems.size > 0
            ? sortedAppointments.filter(a => selectedItems.has(a.id))
            : sortedAppointments;
        exportToPDF(dataToExport, exportColumns, "Appointments Report", "appointments");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Completed": return "bg-blue-100 text-blue-700";
            case "Cancelled": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const stats = {
        total: initialAppointments.length,
        confirmed: initialAppointments.filter(a => a.status === "Confirmed").length,
        pending: initialAppointments.filter(a => a.status === "Pending").length,
        today: initialAppointments.filter(a => a.date === "2026-01-20").length,
    };

    // Reset page when filters change
    const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
        setter(value);
        setCurrentPage(1);
        setSelectedItems(new Set());
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-500 mt-1">Manage and track all appointments</p>
                    </div>
                    {canAddServices() && (
                        <Link href="/appointments/book">
                            <Button variant="primary" size="lg" className="bg-purple-600 hover:bg-purple-700 gap-2">
                                <Plus className="w-5 h-5" />
                                New Appointment
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Total Appointments</p>
                            <h3 className="text-3xl font-bold">{stats.total}</h3>
                        </div>
                    </Card>

                    <Card gradient="" style={getCardStyle(1)} className="text-white">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Confirmed</p>
                            <h3 className="text-3xl font-bold">{stats.confirmed}</h3>
                        </div>
                    </Card>

                    <Card gradient="" style={getCardStyle(2)} className="text-white">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Pending</p>
                            <h3 className="text-3xl font-bold">{stats.pending}</h3>
                        </div>
                    </Card>

                    <Card className="text-white" style={getCardStyle(3)}>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm opacity-90 mb-1">Today</p>
                            <h3 className="text-3xl font-bold">{stats.today}</h3>
                        </div>
                    </Card>
                </div>

                {/* Filters & Actions */}
                <Card className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by client, service, worker, or ID..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                <option value="All">All Status</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            {!isWorker && (
                                <select
                                    value={workerFilter}
                                    onChange={(e) => handleFilterChange(setWorkerFilter)(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="All">All Workers</option>
                                    {workers.map(worker => (
                                        <option key={worker} value={worker}>{worker}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleExportCSV}
                            >
                                <Download className="w-4 h-4" />
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleExportPDF}
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions - shown when items are selected */}
                    {selectedItems.size > 0 && hasPermission(['manager', 'admin']) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-purple-600">
                                {selectedItems.size} selected
                            </span>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleBulkStatusChange("Confirmed")}
                            >
                                Mark Confirmed
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleBulkStatusChange("Completed")}
                            >
                                Mark Completed
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                            <button
                                onClick={() => setSelectedItems(new Set())}
                                className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
                            >
                                Clear selection
                            </button>
                        </div>
                    )}
                </Card>

                {/* Appointments Table */}
                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Appointments List</h3>
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedAppointments.length)} of {sortedAppointments.length} appointments
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-gray-500">per page</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="p-1 hover:bg-gray-200 rounded transition"
                                        >
                                            {isAllSelected ? (
                                                <CheckSquare className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("id")}
                                    >
                                        <div className="flex items-center gap-1">
                                            ID {getSortIcon("id")}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("clientName")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Client {getSortIcon("clientName")}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("service")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Service {getSortIcon("service")}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("worker")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Worker {getSortIcon("worker")}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("date")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date & Time {getSortIcon("date")}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("price")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Price {getSortIcon("price")}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort("status")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status {getSortIcon("status")}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAppointments.map((apt) => (
                                    <tr
                                        key={apt.id}
                                        className={`hover:bg-gray-50 transition ${selectedItems.has(apt.id) ? 'bg-purple-50' : ''}`}
                                    >
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleSelectItem(apt.id)}
                                                className="p-1 hover:bg-gray-200 rounded transition"
                                            >
                                                {selectedItems.has(apt.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-purple-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{apt.id}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{apt.clientName}</p>
                                                <p className="text-xs text-gray-500">{apt.clientPhone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{apt.service}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-xs">
                                                    {apt.worker.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-900">{apt.worker}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{apt.date}</p>
                                                <p className="text-xs text-gray-500">{apt.time}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{apt.duration}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{apt.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 hover:bg-purple-50 rounded-lg transition text-purple-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {hasPermission(['manager', 'admin']) && (
                                                    <>
                                                        <button className="p-2 hover:bg-pink-50 rounded-lg transition text-pink-600">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-red-50 rounded-lg transition text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? "bg-purple-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}
