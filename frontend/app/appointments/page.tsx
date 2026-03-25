"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, User, Plus, Search, Eye, Edit, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, FileText, CheckSquare, Square, X } from "lucide-react";
import { exportToCSV, exportToPDF, sortData, SortConfig, SortDirection, getNextSortDirection, ExportColumn } from "@/lib/export";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth, RequirePermission } from "@/context/AuthProvider";
import { bookingService } from "@/lib/services";
import { Services } from "@/lib/services";
import { BookingStatus, Booking } from "@/types";
import { BOOKING_STATUS, BOOKING_STATUS_FILTER_OPTIONS, getBookingStatusColor, getBookingStatusLabel } from "@/lib/constants/bookingStatus";
import { useRouter } from "next/navigation";
import AppointmentDetailModal from "@/components/booking/AppointmentDetailModal";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";

// Helper type for UI
type AppointmentUI = {
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
    isAdminModified: boolean;
};

// Default items per page
const DEFAULT_ITEMS_PER_PAGE = 10;

export default function AppointmentsPage() {
    const { getCardStyle } = useKpiCardStyle();
    // const { bookings, updateBookingStatus, cancelBooking, approveReschedule, rejectReschedule } = useBooking(); // Removed context usage
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const router = useRouter();
    const { t } = useTranslation();
    const { format: formatCurrency } = useCurrency();
    const [detailModal, setDetailModal] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [workerFilter, setWorkerFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    // Export columns — translated headers derived from t()
    const exportColumns: ExportColumn[] = useMemo(() => [
        { key: "displayId", header: t("common.id") },
        { key: "clientName", header: t("common.client") },
        { key: "clientPhone", header: t("common.phone") },
        { key: "serviceName", header: t("common.service") },
        { key: "workerName", header: t("common.worker") },
        { key: "date", header: t("common.date") },
        { key: "time", header: t("common.time") },
        { key: "duration", header: t("appointments.duration") },
        { key: "totalPrice", header: t("appointments.price") },
        { key: "status", header: t("appointments.status") },
    ], [t]);

    // Data state
    const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { user, hasPermission, canAddServices, canModify } = useAuth();
    const isWorker = user?.role === 'worker';
    const isClient = user?.role === 'client';
    const isAdminOrManager = hasPermission(['manager', 'super_admin', 'owner']);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const salonId = 1; // TODO: Get from context currentTenant
            const [bookingsData, workersData, servicesData] = await Promise.all([
                bookingService.getAll(salonId),
                Services.worker.getAll(salonId),
                Services.service.getAll(salonId)
            ]);

            setWorkers(workersData);
            setServices(servicesData);

            // Map to UI format
            const mappedAppointments = bookingsData.data ? bookingsData.data.map((b: any) => { // Handle paginated response structure if applicable, or array
                // Assume getBooking returns array for now or check structure. Default provider returns PaginatedResponse? check interface. 
                // Interface says PaginatedResponse<Booking>. So .data is correct.
                // Actually BaseService might resolve it. Let's assume .data or direct array.
                // Provider interface: getBookings returns PaginatedResponse<Booking>
                return b;
            }) : [];

            // Re-map using the fetched services/workers maps
            const processed = (bookingsData.data || []).map((b: any) => {
                const serviceNames = (b.serviceIds || []).map((id: number) => servicesData.find(s => s.id === id)?.name || "Service").join(", ");
                const workerNames = (b.workerIds || []).length > 0
                    ? (b.workerIds || []).map((id: number) => workersData.find(w => w.id === id)?.name || "Worker").join(", ")
                    : "Pool";

                // Calculate price if not in booking (mock logic was sum services)
                // In generic booking model, it might be stored, but let's calc for display if needed or use b.totalPrice if available (Booking has no price field? Check types. Booking has no price field, but Income has. UI shows price. Let's calc from service sum).
                const totalPrice = (b.serviceIds || []).reduce((sum: number, id: number) => sum + (servicesData.find(s => s.id === id)?.price || 0), 0);

                const isAdminModified = (b.interactionHistory || []).some((i: any) =>
                    (i.action.toLowerCase().includes('edit') || i.action.toLowerCase().includes('update') || i.action.toLowerCase().includes('modify')) &&
                    (i.user.toLowerCase().includes('admin') || i.user.toLowerCase().includes('manager') || i.user === 'Orphelia')
                );

                return {
                    id: b.id,
                    displayId: `APT-${b.id.toString().slice(-3)}`,
                    clientName: b.clientName || "Client",
                    clientPhone: "", // Not in booking type directly?
                    serviceIds: b.serviceIds || [],
                    serviceName: serviceNames,
                    workerIds: b.workerIds || [],
                    workerName: workerNames,
                    date: b.date,
                    time: b.time,
                    duration: b.duration,
                    totalPrice: formatCurrency(totalPrice),
                    status: b.status,
                    isAdminModified,
                    // keep raw for actions
                    raw: b
                };
            });
            setAppointments(processed);

        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Use effect to fetch
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        fetchData();
    }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps


    // Role-based filtering
    const filteredByRole = useMemo(() => {
        if (isWorker) {
            return appointments.filter(apt => apt.workerIds.includes(parseInt(user?.workerId || '0')));
        }
        if (isClient) {
            return appointments.filter(apt => apt.clientName === user?.name); // fallback to name match if id matching complex
        }
        return appointments;
    }, [isWorker, isClient, appointments, user]);

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        return filteredByRole.filter((apt) => {
            const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.displayId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
            const matchesWorker = workerFilter === "All" || apt.workerName.includes(workerFilter);
            return matchesSearch && matchesStatus && matchesWorker;
        });
    }, [searchTerm, statusFilter, workerFilter, filteredByRole]);

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

    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Handle bulk actions
    const handleBulkDelete = async () => {
        if (handleReadOnlyClick()) return;
        const count = selectedItems.size;
        const confirmed = await confirm({
            title: t("appointments.bulkDelete"),
            message: t("appointments.bulkDeleteConfirm", { count }),
            type: "error",
            confirmText: t("common.delete"),
            cancelText: t("common.cancel")
        });

        if (confirmed) {
            // Logic to delete multiple would go here
            showToast(t("appointments.bulkDelete"), t("appointments.bulkDeleteSuccess", { count }), "info");
            setSelectedItems(new Set());
        }
    };

    const handleBulkStatusChange = async (status: string) => {
        if (handleReadOnlyClick()) return;
        const count = selectedItems.size;
        const confirmed = await confirm({
            title: t("appointments.bulkUpdate"),
            message: t("appointments.bulkUpdateConfirm", { status, count }),
            type: "warning",
            confirmText: t("common.update"),
            cancelText: t("common.cancel")
        });

        if (confirmed) {
            // Logic to update multiple
            showToast(t("appointments.bulkUpdate"), t("appointments.bulkUpdateSuccess", { count, status }), "info");
            setSelectedItems(new Set());
        }
    };

    // Handle export
    const handleExportCSV = () => {
        try {
            const dataToExport = selectedItems.size > 0
                ? sortedAppointments.filter(a => selectedItems.has(a.id))
                : sortedAppointments;
            exportToCSV(dataToExport, exportColumns, "appointments");
            showToast(t("common.exportSuccess"), t("common.success"), "success");
        } catch (err) {
            showToast(t("common.exportFailed"), err instanceof Error ? err.message : t("common.error"), "error");
        }
    };

    const handleExportPDF = () => {
        try {
            const dataToExport = selectedItems.size > 0
                ? sortedAppointments.filter(a => selectedItems.has(a.id))
                : sortedAppointments;
            exportToPDF(dataToExport, exportColumns, "Appointments Report", "appointments");
        } catch (err) {
            showToast(t("common.exportFailed"), err instanceof Error ? err.message : t("common.error"), "error");
        }
    };

    // Use constant-based helper instead of switch on literal strings
    const getStatusColor = (status: string) => getBookingStatusColor(status);

    const stats = {
        total: filteredByRole.length,
        confirmed: filteredByRole.filter((a: any) => a.status === BOOKING_STATUS.CONFIRMED).length,
        pending: filteredByRole.filter((a: any) => a.status === BOOKING_STATUS.PENDING).length,
        today: filteredByRole.filter((a: any) => a.date === new Date().toISOString().split('T')[0]).length,
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

    const handleCancel = async (id: number) => {
        if (handleReadOnlyClick()) return;
        const confirmed = await confirm({
            title: t("appointments.cancelAppointment"),
            message: t("appointments.cancelConfirm"),
            type: "warning",
            confirmText: t("common.confirm"),
            cancelText: t("common.cancel")
        });

        if (confirmed) {
            await bookingService.updateStatus(id, 'Cancelled');
            showToast(t("common.info"), t("appointments.cancelSuccess"), "success");
            setDetailModal({ open: false, appointment: null });
            refresh();
        }
    };

    const confirmBooking = async (id: number) => {
        if (handleReadOnlyClick()) return;
        try {
            await bookingService.updateStatus(id, 'Confirmed');
            showToast(t("common.success"), t("appointments.confirmSuccess"), "success");
            refresh();
        } catch (error) {
            showToast(t("common.error"), t("common.updateError"), "error");
        }
    };

    const approveRescheduleAction = async (id: number) => {
        // Since updateStatus is generic, assume logic handles it or we manually update. 
        // Service might need specific method if complex logic exists, for now updateStatus.
        // Actually BookingProvider had specific logic.
        // Let's use updateStatus('Confirmed').
        if (handleReadOnlyClick()) return;
        try {
            await bookingService.updateStatus(id, 'Confirmed');
            showToast(t("common.success"), t("appointments.rescheduleApproved"), "success");
            refresh();
        } catch (error) {
            showToast(t("common.error"), t("common.updateError"), "error");
        }
    };

    const rejectRescheduleAction = async (id: number) => {
        if (handleReadOnlyClick()) return;
        try {
            await bookingService.updateStatus(id, 'Cancelled');
            showToast(t("common.success"), t("appointments.rescheduleRejected"), "success");
            refresh();
        } catch (error) {
            showToast(t("common.error"), t("common.updateError"), "error");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-gray-900">{t("appointments.title")}</h1>
                        <p className="text-gray-500 mt-1">{t("appointments.subtitle")}</p>
                    </div>
                    {(canAddServices() || isClient) && canModify && (
                        <div className="w-full md:w-auto flex justify-end">
                            <Link href="/appointments/book">
                                <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-[color:var(--color-primary)]/20 active:scale-95 transition-all">
                                    <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                    <span className="hidden md:inline ml-2 font-bold">{isClient ? t("appointments.book") : t("appointments.newAppointment")}</span>
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
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">{t("common.total")}</p>
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
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">{t("appointments.confirmed")}</p>
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
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">{t("appointments.pending")}</p>
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
                            <p className="text-[10px] sm:text-sm opacity-90 mb-0.5 sm:mb-1 uppercase font-bold tracking-wider">{t("dashboard.today")}</p>
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
                                placeholder={t("appointments.searchPlaceholder")}
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
                                <option value="All">{t("appointments.allStatus")}</option>
                                {BOOKING_STATUS_FILTER_OPTIONS.map((cfg) => (
                                    <option key={cfg.code} value={cfg.code}>
                                        {t(cfg.labelKey)}
                                    </option>
                                ))}
                            </select>
                            {!isWorker && (
                                <select
                                    value={workerFilter}
                                    onChange={(e) => handleFilterChange(setWorkerFilter)(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="All">{t("common.allWorkers")}</option>
                                    {workers.map((worker: any) => (
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
                    {selectedItems.size > 0 && hasPermission(['manager', 'super_admin']) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end sm:justify-start gap-3">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                                {t("approvals.selected", { count: selectedItems.size })}
                            </span>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleBulkStatusChange(BOOKING_STATUS.CONFIRMED)}
                            >
                                <CheckSquare className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">{t("appointments.markConfirmed")}</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleBulkStatusChange(BOOKING_STATUS.COMPLETED)}
                            >
                                <Check className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">{t("appointments.markCompleted")}</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">{t("common.delete")}</span>
                            </Button>
                            <button
                                onClick={() => setSelectedItems(new Set())}
                                className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
                            >
                                {t("appointments.clearSelection")}
                            </button>
                        </div>
                    )}
                </Card>

                {/* Appointments Table */}
                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t("appointments.list")}</h3>
                            <p className="text-sm text-gray-500">
                                {t("common.pagination", {
                                    start: ((currentPage - 1) * itemsPerPage) + 1,
                                    end: Math.min(currentPage * itemsPerPage, sortedAppointments.length),
                                    total: sortedAppointments.length
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{t("clients.table.show")}</span>
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
                            <span className="text-gray-500">{t("clients.table.perPage")}</span>
                        </div>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {paginatedAppointments.map((apt) => (
                            <div key={apt.id} className={`p-4 space-y-3 ${selectedItems.has(apt.id) ? 'bg-primary-light' : 'bg-white'}`}>
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
                                        {getBookingStatusLabel(apt.status, t)}
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
                                                    onClick={() => confirmBooking(apt.id)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    disabled={apt.status !== BOOKING_STATUS.PENDING}
                                                    title={t("common.validate")}
                                                >
                                                    <Check className="w-5 h-5" />
                                                </Button>
                                            )}
                                            {isClient && apt.status === BOOKING_STATUS.PENDING_APPROVAL && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => approveRescheduleAction(apt.id)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    title={t("appointments.approveReschedule")}
                                                >
                                                    <Check className="w-5 h-5" />
                                                </Button>
                                            )}
                                            {isClient && apt.status === BOOKING_STATUS.PENDING_APPROVAL && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => rejectRescheduleAction(apt.id)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                    title={t("appointments.reject")}
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(apt)}
                                                className="w-10 h-10 p-0 flex items-center justify-center bg-[var(--color-primary-light)] border-transparent text-[var(--color-primary)] hover:opacity-80"
                                                title={t("common.view")}
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
                                        className={`hover:bg-gray-50 transition cursor-pointer ${selectedItems.has(apt.id) ? 'bg-primary-light' : ''}`}
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
                                        <td className="px-6 py-4 text-sm text-gray-700">{apt.duration} {t("appointments.durationUnit")}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{apt.totalPrice}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                                {getBookingStatusLabel(apt.status, t)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {(isAdminOrManager || (isClient && apt.isAdminModified)) && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => { if (!handleReadOnlyClick()) confirmBooking(apt.id) }}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        disabled={apt.status !== BOOKING_STATUS.PENDING}
                                                        title={t("common.validate")}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                {isClient && apt.status === BOOKING_STATUS.PENDING_APPROVAL && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => { if (!handleReadOnlyClick()) approveRescheduleAction(apt.id) }}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        title={t("appointments.approveReschedule")}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                {isClient && apt.status === BOOKING_STATUS.PENDING_APPROVAL && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => { if (!handleReadOnlyClick()) rejectRescheduleAction(apt.id) }}
                                                        className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                                                        title={t("appointments.reject")}
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(apt)}
                                                    className="w-10 h-10 p-0 flex items-center justify-center bg-[var(--color-primary-light)] border-transparent text-[var(--color-primary)] hover:opacity-80"
                                                    title={t("common.view")}
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
                                {t("common.pageOf", { current: currentPage, total: totalPages })}
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
                        confirmBooking(id);
                        setDetailModal({ open: false, appointment: null });
                    }}
                    onEdit={handleEdit}
                    onApproveReschedule={approveRescheduleAction}
                    onRejectReschedule={rejectRescheduleAction}
                    servicesList={services}
                    isAdmin={isAdminOrManager}
                    userRole={user?.role}
                    isAdminModified={detailModal.appointment?.isAdminModified}
                />
            </div>
        </MainLayout>
    );
}
