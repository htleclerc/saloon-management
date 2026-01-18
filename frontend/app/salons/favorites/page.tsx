"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MapPin, Star, Heart, Scissors, ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock data: client's favorites
const favoriteSalons = [
    { id: "tenant_1", name: "Demo Salon", specialty: "Braids & Care", address: "123 Rue de la Coiffe, Paris", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400" },
    { id: "tenant_3", name: "Luxury Spa", specialty: "Massage & Wellness", address: "8 Boulevard du Calme, Nice", rating: 4.9, reviews: 210, image: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca8b8?w=400" },
];

export default function FavoriteSalonsPage() {
    const [favorites, setFavorites] = useState<string[]>(favoriteSalons.map(s => s.id));

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(f => f !== id));
    };

    const displaySalons = favoriteSalons.filter(s => favorites.includes(s.id));

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Favorite Salons</h1>
                    <p className="text-gray-500 mt-1">Quickly find your preferred salons.</p>
                </div>

                {displaySalons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displaySalons.map(salon => (
                            <Card key={salon.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={salon.image}
                                        alt={salon.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <button
                                        onClick={() => removeFavorite(salon.id)}
                                        className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md bg-red-500 text-white transition-colors"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
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
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <Heart className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">No favorite salons</h2>
                        <p className="text-gray-500">You don't have any salons in your favorites yet.</p>
                        <Link href="/salons/discover">
                            <Button className="bg-purple-600 hover:bg-purple-700 mt-4">Discover Salons</Button>
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
