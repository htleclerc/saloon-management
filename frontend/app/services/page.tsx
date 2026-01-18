"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import Button from "@/components/ui/Button";
import { Plus, Star, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

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
    },
];

import Link from "next/link";

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { getCardStyle } = useKpiCardStyle();
    const { hasPermission } = useAuth();
    const isManager = hasPermission(['manager', 'admin']);
    const totalServices = services.length;
    const avgPrice = Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length);
    const mostPopular = services.reduce((max, s) => (s.popularity > max.popularity ? s : max), services[0]);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                        <p className="text-gray-500 mt-1">Manage your workshop services and pricing</p>
                    </div>
                    {isManager && (
                        <Link href="/services/add">
                            <Button variant="primary" size="md">
                                <Plus className="w-5 h-5" />
                                Add Service
                            </Button>
                        </Link>
                    )}
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

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Card key={service.id} className="overflow-hidden hover:shadow-2xl transition-shadow">
                            <div className={`w-full h-48 bg-gradient-to-br ${service.color} rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center text-white text-6xl font-bold`}>
                                {service.name.charAt(0)}
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
                                    {isManager && (
                                        <Link href={`/services/edit/${service.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Edit
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="primary" size="sm" className="flex-1">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Service Statistics */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Service Statistics (This Month)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {services.map((service, idx) => {
                                    const bookings = Math.round(service.popularity * 2);
                                    const revenue = bookings * service.price;
                                    return (
                                        <tr key={service.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                                                        {service.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{service.name}</p>
                                                        <p className="text-xs text-gray-500">{service.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{service.duration}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-purple-600">€{service.price}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-semibold">{service.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{bookings}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-green-600">€{revenue.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isManager && (
                                                        <>
                                                            <Link href={`/services/edit/${service.id}`}>
                                                                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">Edit</button>
                                                            </Link>
                                                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                                        </>
                                                    )}
                                                    {!isManager && (
                                                        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">Details</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
