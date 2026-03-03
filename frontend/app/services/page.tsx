"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import Button from "@/components/ui/Button";
import {
    Plus,
    Star,
    Clock,
    DollarSign,
    Layout,
    ChevronRight,
    X,
    TrendingUp,
    Users,
    Trash2,
    Eye,
    Filter,
    Calendar,
    Download,
    Euro,
    Search
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation } from "@/i18n";
import Link from "next/link";
import { canPerformServiceAction } from "@/lib/permissions";
import { UserRole } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { serviceService } from "@/lib/services";

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [services, setServices] = useState<any[]>([]);
    const { getCardStyle } = useKpiCardStyle();
    const { user, activeSalonId } = useAuth();
    const { t } = useTranslation();

    useMemo(() => {
        if (activeSalonId) {
            serviceService.getAll(Number(activeSalonId)).then(setServices);
        }
    }, [activeSalonId]);

    // const { services } = useServices(); // Removed
    const canAdd = canPerformServiceAction("add", user?.role as UserRole);
    const canEdit = canPerformServiceAction("edit", user?.role as UserRole);
    const isManager = ["manager", "admin", "owner", "super_admin"].includes(user?.role || "");

    // Mobile Modal State
    const [selectedService, setSelectedService] = useState<any>(null);

    // Enrich services with display properties
    const enrichedServices = useMemo(() =>
        services.map((service, idx) => ({
            ...service,
            description: service.description || `Professional ${service.name} service`,
            image: service.image || `https://images.unsplash.com/photo-${1580618672591 + idx}?w=400`,
            rating: 4.5 + (idx % 5) * 0.1,
            popularity: 70 + (idx % 30),
            color: idx % 2 === 0 ? "from-[var(--color-primary)] to-[var(--color-primary-dark)]" : "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]",
            price: typeof service.price === 'string' ? parseFloat(service.price) : service.price
        })),
        [services]
    );

    const totalServices = enrichedServices.length;
    const avgPrice = enrichedServices.length > 0
        ? Math.round(enrichedServices.reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : 0), 0) / enrichedServices.length)
        : 0;
    const mostPopular = enrichedServices.length > 0
        ? enrichedServices.reduce((max, s) => (s.popularity > max.popularity ? s : max), enrichedServices[0])
        : { name: "N/A", popularity: 0 };

    const displayServices = useMemo(() =>
        enrichedServices.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [enrichedServices, searchTerm]
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t("services.management")}</h1>
                        <p className="text-gray-500 mt-1">{t("services.subtitle")}</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center justify-end">
                        {canAdd && (
                            <ReadOnlyGuard>
                                <Link href="/services/add?mode=advanced">
                                    <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-primary/30 active:scale-95 transition-all">
                                        <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                        <span className="hidden md:inline ml-2 font-bold">{t("services.addService")}</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <p className="text-sm opacity-90 mb-1">{t("services.total")}</p>
                        <h3 className="text-3xl font-bold">{totalServices}</h3>
                        <p className="text-sm opacity-80 mt-1">{t("services.active")}</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <p className="text-sm opacity-90 mb-1">{t("services.avgPrice")}</p>
                        <h3 className="text-3xl font-bold">€{avgPrice}</h3>
                        <p className="text-sm opacity-80 mt-1">Across all services</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <p className="text-sm opacity-90 mb-1">{t("services.mostPopular")}</p>
                        <h3 className="text-2xl font-bold">{mostPopular.name}</h3>
                        <p className="text-sm opacity-80 mt-1">{mostPopular.popularity}% {t("services.popularity")}</p>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("services.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-xl shadow-gray-200/50 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayServices.map((service) => (
                        <Card key={service.id} className="overflow-hidden hover:shadow-2xl transition-shadow">
                            <div className="relative w-full h-48 rounded-t-lg -mt-6 -mx-6 mb-4 overflow-hidden group">
                                {service.image ? (
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white text-6xl font-bold`}>
                                        {service.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{service.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-warning fill-warning" />
                                        <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        <span className="text-2xl font-bold text-primary">€{service.price}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{t("services.popularity")}</p>
                                        <div className="flex items-center gap-1">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${service.color}`}
                                                    style={{ width: `${service.popularity}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{service.popularity}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {canEdit && (
                                        <ReadOnlyGuard>
                                            <Link href={`/services/edit/${service.id}?mode=advanced`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    {t("common.edit")}
                                                </Button>
                                            </Link>
                                        </ReadOnlyGuard>
                                    )}
                                    <Link href={`/services/${service.id}`} className="flex-1">
                                        <Button variant="primary" size="sm" className="w-full">
                                            {t("common.view")}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Service Statistics - Admin/Manager Only */}
                {isManager && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-4">{t("services.statsMonth")}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.name")}</th>
                                        <th className="hidden lg:table-cell px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.duration")}</th>
                                        <th className="hidden sm:table-cell px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.price")}</th>
                                        <th className="hidden md:table-cell px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.rating")}</th>
                                        <th className="hidden xl:table-cell px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.bookings")}</th>
                                        <th className="px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.revenue")}</th>
                                        <th className="hidden sm:table-cell px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">{t("common.actions")}</th>
                                        {/* Mobile replacements */}
                                        <th className="sm:hidden px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.rating")}</th>
                                        <th className="sm:hidden px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">{t("services.usage")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayServices.map((service, idx) => {
                                        const bookings = Math.round(service.popularity * 2);
                                        const revenue = bookings * service.price;
                                        return (
                                            <tr
                                                key={service.id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => setSelectedService(service)}
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {service.image ? (
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                                                <img src={service.image} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className={`w-10 h-10 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
                                                                {service.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="truncate">
                                                            <p className="font-bold text-gray-900 text-sm truncate max-w-[120px] sm:max-w-none">{service.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">ID: #{service.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-600 font-medium">{service.duration}</td>
                                                <td className="hidden sm:table-cell px-4 py-4 text-right font-bold text-purple-600 text-sm">€{service.price}</td>
                                                <td className="hidden md:table-cell px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 bg-warning-light px-2 py-1 rounded-lg w-fit mx-auto">
                                                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                                                        <span className="font-bold text-warning text-xs">{service.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden xl:table-cell px-4 py-4 text-right font-bold text-gray-600 text-sm">{bookings}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-black text-success text-sm italic">€{revenue.toLocaleString()}</span>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {canEdit && (
                                                            <ReadOnlyGuard>
                                                                <Link href={`/services/edit/${service.id}?mode=simple`}>
                                                                    <button className="p-2 bg-primary-light text-primary rounded-lg hover:bg-primary-light/80 transition-colors shadow-sm" title="Quick Edit">
                                                                        <Layout className="w-4 h-4" />
                                                                    </button>
                                                                </Link>
                                                            </ReadOnlyGuard>
                                                        )}
                                                        <Link href={`/services/${service.id}`}>
                                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm" title="View Details">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </td>
                                                {/* Mobile Only: Rating & Bookings */}
                                                <td className="sm:hidden px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-warning font-bold text-xs">
                                                        <Star className="w-3 h-3 fill-warning" />
                                                        {service.rating}
                                                    </div>
                                                </td>
                                                <td className="sm:hidden px-4 py-4 text-right font-bold text-gray-500 text-xs">
                                                    {bookings}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Mobile Detail Modal */}
                {selectedService && (
                    <div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedService(null)}
                    >
                        <div
                            className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex gap-4">
                                    {selectedService.image ? (
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                                            <img src={selectedService.image} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className={`w-16 h-16 bg-gradient-to-br ${selectedService.color} rounded-2xl flex items-center justify-center text-2xl text-white font-black`}>
                                            {selectedService.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedService.name}</h3>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{selectedService.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-primary-light rounded-2xl">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t("services.price")}</p>
                                    <p className="text-lg font-black text-primary">€{selectedService.price}</p>
                                </div>
                                <div className="p-4 bg-info-light rounded-2xl">
                                    <p className="text-[10px] font-black text-info uppercase tracking-widest mb-1">{t("services.duration")}</p>
                                    <p className="text-lg font-black text-info">{selectedService.duration}</p>
                                </div>
                                <div className="p-4 bg-warning-light rounded-2xl">
                                    <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">{t("services.rating")}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-warning fill-warning" />
                                        <p className="text-lg font-black text-warning">{selectedService.rating}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-success-light rounded-2xl">
                                    <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1">{t("services.bookings")}</p>
                                    <p className="text-lg font-black text-success">{Math.round(selectedService.popularity * 2)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link href={`/services/${selectedService.id}`} className="block">
                                    <Button variant="primary" className="w-full py-4 rounded-2xl font-black shadow-lg shadow-primary/20">
                                        {t("services.viewFull")}
                                    </Button>
                                </Link>
                                {canEdit && (
                                    <ReadOnlyGuard>
                                        <Link href={`/services/edit/${selectedService.id}?mode=advanced`} className="block">
                                            <Button variant="outline" className="w-full py-4 rounded-2xl font-black border-gray-100">
                                                {t("services.settingsMedia")}
                                            </Button>
                                        </Link>
                                    </ReadOnlyGuard>
                                )}
                                <button
                                    className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                                    onClick={() => setSelectedService(null)}
                                >
                                    {t("services.closeDetails")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
