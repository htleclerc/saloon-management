"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Search, MapPin, Star, Heart, Scissors } from "lucide-react";
import Link from "next/link";
import { salonService } from "@/lib/services/SalonService";
import { Salon } from "@/types";

interface SalonWithUI extends Salon {
    rating: number;
    image: string;
    specialty: string;
}

export default function DiscoverSalonsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [allSalons, setAllSalons] = useState<SalonWithUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const salons = await salonService.getAll();
                const salonsWithUI = salons.map(s => ({
                    ...s,
                    rating: 5.0, // Placeholder as backend doesn't provide it in list yet
                    image: s.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
                    specialty: "Hair Styling" // Placeholder
                }));
                setAllSalons(salonsWithUI);
            } catch (error) {
                console.error("Failed to fetch salons:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalons();
    }, []);

    const toggleFavorite = (id: string) => {
        setFavorites((prev: string[]) =>
            prev.includes(id) ? prev.filter((f: string) => f !== id) : [...prev, id]
        );
    };

    const filteredSalons = allSalons.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Discover Salons</h1>
                    <p className="text-gray-500 mt-1">Find the best salons near you.</p>
                </div>

                {/* Search Bar */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* Salons Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSalons.map(salon => (
                            <Card key={salon.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={salon.image}
                                        alt={salon.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <button
                                        onClick={() => toggleFavorite(salon.id.toString())}
                                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors ${favorites.includes(salon.id.toString()) ? "bg-red-500 text-white" : "bg-black/20 text-white hover:bg-black/40"}`}
                                    >
                                        <Heart className={`w-5 h-5 ${favorites.includes(salon.id.toString()) ? "fill-current" : ""}`} />
                                    </button>
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-purple-700">
                                        {salon.specialty}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-gray-900">{salon.name}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold">{salon.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{salon.address}</span>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button variant="outline" className="flex-1 text-gray-600 border-gray-200">Details</Button>
                                        <Link href={`/appointments/book?salonId=${salon.id}`} className="flex-1">
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                                                <Scissors className="w-4 h-4" /> Book
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {filteredSalons.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                No salons found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
