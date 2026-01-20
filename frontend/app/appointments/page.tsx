"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, User, Plus, Search, Eye, Edit, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, FileText, CheckSquare, Square, X } from "lucide-react";
import { exportToCSV, exportToPDF, sortData, SortConfig, SortDirection, getNextSortDirection, ExportColumn } from "@/lib/export";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth, RequirePermission } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { BookingStatus } from "@/types";
import { useRouter } from "next/navigation";
import AppointmentDetailModal from "@/components/booking/AppointmentDetailModal";

// Helper for labels
const servicesList = [
    { id: 1, name: "Box Braids", price: 120 },
    { id: 2, name: "Cornrows", price: 85 },
    { id: 3, name: "Twists", price: 95 },
    { id: 4, name: "Locs", price: 150 },
    { id: 5, name: "Hair Treatment", price: 75 },
    { id: 6, name: "Senegalese Twists", price: 135 },
    { id: 7, name: "Other", price: 0 },
];

const workersList = [
    { id: 1, name: "Orphelia" },
    { id: 2, name: "Worker 2" },
    { id: 3, name: "Worker 3" },
    { id: 4, name: "Worker 4" },
];

type Appointment = {
    id: number;
    displayId: string;
    clientName: string;
    clientPhone?: string;
    serviceIds: number[];
    serviceName: string;
    workerIds: number[];
    workerName: string;
    date: string;
    time: string;
    duration: number;
    totalPrice: string;
    status: string;
};

// Export columns configuration
const exportColumns: ExportColumn[] = [
    { key: "displayId", header: "ID" },
    { key: "clientName", header: "Client" },
    { key: "clientPhone", header: "Phone" },
    { key: "serviceName", header: "Service" },
    { key: "workerName", header: "Worker" },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "duration", header: "Duration" },
    { key: "totalPrice", header: "Price" },
    { key: "status", header: "Status" },
];

export default function AppointmentsPage() {
    const { getCardStyle } = useKpiCardStyle();
    const { bookings, updateBookingStatus, cancelBooking, approveReschedule, rejectReschedule } = useBooking();
    const router = useRouter();
    const [detailModal, setDetailModal] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [workerFilter, setWorkerFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    const { user, hasPermission, canAddServices } = useAuth();
    const isWorker = user?.role === 'worker';
    const isClient = user?.role === 'client';
    const isAdminOrManager = hasPermission(['manager', 'admin']);

    // Map context bookings to UI format
    const appointments = useMemo(() => {
        return bookings.map(b => {
            const serviceNames = b.serviceIds.map(id => servicesList.find(s => s.id === id)?.name || "Service").join(", ");
            const workerNames = b.workerIds.length > 0
                ? b.workerIds.map(id => workersList.find(w => w.id === id)?.name || "Worker").join(", ")
                : "Pool";
            const totalPrice = b.serviceIds.reduce((sum, id) => sum + (servicesList.find(s => s.id === id)?.price || 0), 0);

            const isAdminModified = b.interactionHistory.some(i =>
                (i.action.toLowerCase().includes('edit') || i.action.toLowerCase().includes('update') || i.action.toLowerCase().includes('modify')) &&
                (i.user.toLowerCase().includes('admin') || i.user.toLowerCase().includes('manager') || i.user === 'Orphelia')
            );

            return {
                ...b,
                serviceName: serviceNames,
                workerName: workerNames,
                totalPrice: `€${totalPrice}`,
                displayId: `APT-${b.id.toString().slice(-3)}`,
                isAdminModified
            };
        });
    }, [bookings]);

    // Role-based filtering
    const initialAppointments = useMemo(() => {
        if (isWorker) {
            return appointments.filter(apt => apt.workerIds.includes(parseInt(user?.id || '0')));
        }
        if (isClient) {
            return appointments.filter(apt => apt.clientName === user?.name || apt.clientId === parseInt(user?.id || '0'));
        }
        return appointments;
    }, [isWorker, isClient, appointments, user]);

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        return initialAppointments.filter((apt) => {
            const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.displayId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
            const matchesWorker = workerFilter === "All" || apt.workerName.includes(workerFilter);
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
            return <ArrowUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />;
        }
        return <ArrowDown className="w-3.5 h-3.5 text-[var(--color-primary)]" />;
    };

    // Handle selection
    const toggleSelectAll = () => {
        if (selectedItems.size === paginatedAppointments.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(paginatedAppointments.map(a => a.id)));
        }
    };

    const toggleSelectItem = (id: number) => {
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
            case "Confirmed": return "bg-[var(--color-success-light)] text-[var(--color-success)]";
            case "Pending": return "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
            case "PendingApproval": return "bg-[var(--color-secondary-light)] text-[var(--color-secondary)] font-bold animate-pulse";
            case "Rescheduled": return "bg-[var(--color-primary-light)] text-[var(--color-primary)]";
            case "Completed": return "bg-blue-100 text-blue-700";
            case "Cancelled": return "bg-[var(--color-error-light)] text-[var(--color-error)]";
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

    const handleViewDetails = (appointment: any) => {
        setDetailModal({ open: true, appointment });
    };

    const handleEdit = (appointment: any, targetStep?: number) => {
        const stepParam = targetStep !== undefined ? `&step=${targetStep}` : "";
        router.push(`/appointments/book?edit=${appointment.id}${stepParam}`);
    };

    const handleCancel = (id: number) => {
        if (confirm("Are you sure you want to cancel this appointment?")) {
            cancelBooking(id, "Cancelled from appointments list");
            setDetailModal({ open: false, appointment: null });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-500 mt-1">Manage and track all appointments</p>
                    </div>
                    {(canAddServices() || isClient) && (
                        <div className="w-full md:w-auto flex justify-end">
                            <Link href="/appointments/book">
                                <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                    <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                    <span className="hidden md:inline ml-2 font-bold">{isClient ? "Book Appointment" : "New Appointment"}</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    <Card className="text-white p-4 sm:p-6" style={getCardStyle(0)}>
                        <div className="flex justify-between items-start">
                            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">Total</p>
                            <h3 className="text-xl sm:text-3xl font-bold">{stats.total}</h3>
                        </div>
                    </Card>

                    <Card gradient="" style={getCardStyle(1)} className="text-white p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">Confirmed</p>
                            <h3 className="text-xl sm:text-3xl font-bold">{stats.confirmed}</h3>
                        </div>
                    </Card>

                    <Card gradient="" style={getCardStyle(2)} className="text-white p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">Pending</p>
                            <h3 className="text-xl sm:text-3xl font-bold">{stats.pending}</h3>
                        </div>
                    </Card>

                    <Card className="text-white p-4 sm:p-6" style={getCardStyle(3)}>
                        <div className="flex justify-between items-start">
                            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">Today</p>
                            <h3 className="text-xl sm:text-3xl font-bold">{stats.today}</h3>
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
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
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
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="All">All Workers</option>
                                    {workersList.map(worker => (
                                        <option key={worker.id} value={worker.name}>{worker.name}</option>
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
                                <span className="hidden sm:inline">CSV</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleExportPDF}
                            >
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">PDF</span>
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions - shown when items are selected */}
                    {selectedItems.size > 0 && hasPermission(['manager', 'admin']) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end sm:justify-start gap-3">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                                {selectedItems.size} selected
                            </span>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleBulkStatusChange("Confirmed")}
                            >
                                <CheckSquare className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Mark Confirmed</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleBulkStatusChange("Completed")}
                            >
                                <Check className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Mark Completed</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Delete</span>
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
                                className="px-2 py-1 border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-gray-500">per page</span>
                        </div>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {paginatedAppointments.map((apt) => (
                            <div key={apt.id} className={`p-4 space-y-3 ${selectedItems.has(apt.id) ? 'bg-purple-50' : 'bg-white'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleSelectItem(apt.id)}
                                            className="p-1 hover:bg-gray-100 rounded transition"
                                        >
                                            {selectedItems.size > 0 && selectedItems.has(apt.id) ? (
                                                <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300" />
                                            )}
                                        </button>
                                        <span className="text-xs font-mono text-gray-500">{apt.displayId}</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900">{apt.clientName}</p>
                                        <p className="text-sm text-[var(--color-primary)] font-medium">{apt.serviceName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{apt.date} at {apt.time}</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <p className="font-black text-lg text-gray-900">{apt.totalPrice}</p>
                                        <div className="flex items-center justify-end gap-2">
                                            {(isAdminOrManager || (isClient && apt.isAdminModified)) && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => updateBookingStatus(apt.id, 'Confirmed')}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    disabled={apt.status !== 'Pending'}
                                                    title="Valider"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </Button>
                                            )}
                                            {isClient && apt.status === 'PendingApproval' && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => approveReschedule(apt.id)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    title="Approve Reschedule"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </Button>
                                            )}
                                            {isClient && apt.status === 'PendingApproval' && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => rejectReschedule(apt.id)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    title="Reject Reschedule"
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(apt)}
                                                className="w-10 h-10 p-0 flex items-center justify-center bg-[var(--color-primary-light)] border-transparent text-[var(--color-primary)] hover:opacity-80"
                                                title="Voir"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="p-1 hover:bg-gray-200 rounded transition"
                                        >
                                            {isAllSelected ? (
                                                <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
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
                                        className={`hover:bg-gray-50 transition cursor-pointer ${selectedItems.has(apt.id) ? 'bg-purple-50' : ''}`}
                                        onClick={() => handleViewDetails(apt)}
                                    >
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelectItem(apt.id);
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded transition"
                                            >
                                                {selectedItems.has(apt.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{apt.displayId}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{apt.clientName}</p>
                                                <p className="text-xs text-gray-500">{apt.clientPhone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{apt.serviceName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-semibold text-xs">
                                                    {apt.workerName.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-900">{apt.workerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{apt.date}</p>
                                                <p className="text-xs text-gray-500">{apt.time}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{apt.duration} min</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{apt.totalPrice}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {(isAdminOrManager || (isClient && apt.isAdminModified)) && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => updateBookingStatus(apt.id, 'Confirmed')}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        disabled={apt.status !== 'Pending'}
                                                        title="Valider"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                {isClient && apt.status === 'PendingApproval' && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => approveReschedule(apt.id)}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        title="Approve Reschedule"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                {isClient && apt.status === 'PendingApproval' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => rejectReschedule(apt.id, "Rejected by client")}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        title="Reject Reschedule"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(apt)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center bg-[var(--color-primary-light)] border-transparent text-[var(--color-primary)] hover:opacity-80"
                                                    title="Voir"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Button>
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
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-100 text-gray-600"}`}
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

                {/* Appointment Detail Modal */}
                <AppointmentDetailModal
                    isOpen={detailModal.open}
                    appointment={detailModal.appointment}
                    onClose={() => setDetailModal({ open: false, appointment: null })}
                    onCancel={handleCancel}
                    onConfirm={(id) => {
                        updateBookingStatus(id, 'Confirmed');
                        setDetailModal({ open: false, appointment: null });
                    }}
                    onEdit={handleEdit}
                    onApproveReschedule={approveReschedule}
                    onRejectReschedule={rejectReschedule}
                    servicesList={servicesList}
                    isAdmin={isAdminOrManager}
                    userRole={user?.role}
                    isAdminModified={detailModal.appointment?.isAdminModified}
                />
            </div>
        </MainLayout>
    );
}
