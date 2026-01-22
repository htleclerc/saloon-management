"use client";

import { useState } from "react";
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
import Link from "next/link";
import { canPerformServiceAction } from "@/lib/permissions";
import { UserRole } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const services = [
    {
        id: 1,
        name: "Box Braids",
        description: "Traditional box braids with various sizes",
        price: 120,
        duration: "3-4 hours",
        image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
        rating: 4.9,
        popularity: 95,
        color: "from-purple-500 to-purple-700",
    },
    {
        id: 2,
        name: "Cornrows",
        description: "Classic cornrow braiding style",
        price: 85,
        duration: "2-3 hours",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
        rating: 4.8,
        popularity: 88,
        color: "from-pink-500 to-pink-700",
    },
    {
        id: 3,
        name: "Senegalese Twists",
        description: "Rope twists with synthetic hair",
        price: 110,
        duration: "3-4 hours",
        image: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=400",
        rating: 4.7,
        popularity: 82,
        color: "from-orange-500 to-orange-700",
    },
    {
        id: 4,
        name: "Locs",
        description: "Dreadlock installation and maintenance",
        price: 150,
        duration: "4-5 hours",
        image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
        rating: 4.9,
        popularity: 75,
        color: "from-teal-500 to-teal-700",
    },
    {
        id: 5,
        name: "Goddess Braids",
        description: "Thick, stylish goddess braids",
        price: 130,
        duration: "2-3 hours",
        image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400",
        rating: 4.8,
        popularity: 78,
        color: "from-blue-500 to-blue-700",
    },
    {
        id: 6,
        name: "Twists",
        description: "Various twist styles",
        price: 95,
        duration: "2-3 hours",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
        rating: 4.6,
        popularity: 85,
        color: "from-indigo-500 to-indigo-700",
        status: "active",
    },
    {
        id: 7,
        name: "Old Style",
        description: "Archived style",
        price: 50,
        duration: "1 hour",
        image: "",
        rating: 4.0,
        popularity: 10,
        color: "from-gray-500 to-gray-700",
        status: "archived",
    }
];

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { getCardStyle } = useKpiCardStyle();
    const { user } = useAuth();
    const canAdd = canPerformServiceAction("add", user?.role as UserRole);
    const canEdit = canPerformServiceAction("edit", user?.role as UserRole);
    const isManager = ["manager", "admin", "owner", "super_admin"].includes(user?.role || "");

    // Mobile Modal State
    const [selectedService, setSelectedService] = useState<any>(null);

    // Filter out archived services
    const activeServices = services.filter(s => (s as any).status !== 'archived');

    const totalServices = activeServices.length;
    const avgPrice = Math.round(activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length);
    const mostPopular = activeServices.reduce((max, s) => (s.popularity > max.popularity ? s : max), activeServices[0]);

    const displayServices = activeServices.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                        <p className="text-gray-500 mt-1">Manage your workshop services and pricing</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center justify-end">
                        {canAdd && (
                            <ReadOnlyGuard>
                                <Link href="/services/add?mode=advanced">
                                    <Button variant="primary" size="md" className="rounded-2xl h-14 w-14 md:h-12 md:w-auto md:px-6 flex items-center justify-center p-0 md:p-auto shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
                                        <Plus className="w-8 h-8 md:w-6 md:h-6" />
                                        <span className="hidden md:inline ml-2 font-bold">Add Service</span>
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <p className="text-sm opacity-90 mb-1">Total Services</p>
                        <h3 className="text-3xl font-bold">{totalServices}</h3>
                        <p className="text-sm opacity-80 mt-1">Active services</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <p className="text-sm opacity-90 mb-1">Average Price</p>
                        <h3 className="text-3xl font-bold">€{avgPrice}</h3>
                        <p className="text-sm opacity-80 mt-1">Across all services</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <p className="text-sm opacity-90 mb-1">Most Popular</p>
                        <h3 className="text-2xl font-bold">{mostPopular.name}</h3>
                        <p className="text-sm opacity-80 mt-1">{mostPopular.popularity}% popularity</p>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-xl shadow-gray-200/50 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
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
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                        <span className="text-2xl font-bold text-purple-600">€{service.price}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Popularity</p>
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
                                                    Edit
                                                </Button>
                                            </Link>
                                        </ReadOnlyGuard>
                                    )}
                                    <Link href={`/services/${service.id}`} className="flex-1">
                                        <Button variant="primary" size="sm" className="w-full">
                                            View Details
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
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-4">Service Statistics (This Month)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Service</th>
                                        <th className="hidden lg:table-cell px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Duration</th>
                                        <th className="hidden sm:table-cell px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                                        <th className="hidden md:table-cell px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                        <th className="hidden xl:table-cell px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Bookings</th>
                                        <th className="px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                                        <th className="hidden sm:table-cell px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                        {/* Mobile replacements */}
                                        <th className="sm:hidden px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                        <th className="sm:hidden px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Usage</th>
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
                                                    <div className="flex items-center justify-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg w-fit mx-auto">
                                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-bold text-yellow-700 text-xs">{service.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden xl:table-cell px-4 py-4 text-right font-bold text-gray-600 text-sm">{bookings}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-black text-green-600 text-sm italic">€{revenue.toLocaleString()}</span>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {canEdit && (
                                                            <ReadOnlyGuard>
                                                                <Link href={`/services/edit/${service.id}?mode=simple`}>
                                                                    <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors shadow-sm" title="Quick Edit">
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
                                                    <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-xs">
                                                        <Star className="w-3 h-3 fill-yellow-500" />
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
                                <div className="p-4 bg-purple-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Price</p>
                                    <p className="text-lg font-black text-purple-600">€{selectedService.price}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Duration</p>
                                    <p className="text-lg font-black text-blue-600">{selectedService.duration}</p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">Rating</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <p className="text-lg font-black text-yellow-600">{selectedService.rating}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Bookings</p>
                                    <p className="text-lg font-black text-green-600">{Math.round(selectedService.popularity * 2)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link href={`/services/${selectedService.id}`} className="block">
                                    <Button variant="primary" className="w-full py-4 rounded-2xl font-black shadow-lg shadow-purple-500/20">
                                        View Full Portfolio
                                    </Button>
                                </Link>
                                {canEdit && (
                                    <ReadOnlyGuard>
                                        <Link href={`/services/edit/${selectedService.id}?mode=advanced`} className="block">
                                            <Button variant="outline" className="w-full py-4 rounded-2xl font-black border-gray-100">
                                                Settings & Media
                                            </Button>
                                        </Link>
                                    </ReadOnlyGuard>
                                )}
                                <button
                                    className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                                    onClick={() => setSelectedService(null)}
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
