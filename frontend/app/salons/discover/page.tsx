"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Search, MapPin, Star, Heart, Scissors, ChevronRight } from "lucide-react";
import Link from "next/link";

const allSalons = [
    { id: "tenant_1", name: "Demo Salon", specialty: "Braids & Care", address: "123 Rue de la Coiffe, Paris", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400" },
    { id: "tenant_2", name: "Downtown Branch", specialty: "Nail Art & Beauty", address: "45 Avenue du Style, Lyon", rating: 4.6, reviews: 89, image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400" },
    { id: "tenant_3", name: "Luxury Spa", specialty: "Massage & Wellness", address: "8 Boulevard du Calme, Nice", rating: 4.9, reviews: 210, image: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca8b8?w=400" },
    { id: "tenant_4", name: "Afro Chic", specialty: "African Braids", address: "10 Rue de l'Afrique, Bordeaux", rating: 4.7, reviews: 56, image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400" },
];

export default function DiscoverSalonsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
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

                {/* Salons Grid */}
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
                                    onClick={() => toggleFavorite(salon.id)}
                                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors ${favorites.includes(salon.id) ? "bg-red-500 text-white" : "bg-black/20 text-white hover:bg-black/40"}`}
                                >
                                    <Heart className={`w-5 h-5 ${favorites.includes(salon.id) ? "fill-current" : ""}`} />
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
            </div>
        </MainLayout>
    );
}
