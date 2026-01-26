"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MapPin, Star, Heart, Scissors, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { clientService } from "@/lib/services/ClientService";
import { Salon } from "@/types";

export default function FavoriteSalonsPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Salon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (user?.id) {
                try {
                    // Assuming user.id is the clientId for this context or we get it via other means
                    // For now using user.id directly as clientId is a common pattern in this mock setup
                    // Or we default to 0/1 if user is not client. 
                    // Let's assume user ID links to a client profile eventually.
                    const data = await clientService.getFavorites(Number(user.id));
                    setFavorites(data);
                } catch (error) {
                    console.error("Failed to fetch favorites:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const removeFavorite = async (salonId: number) => {
        if (!user?.id) return;
        try {
            await clientService.removeFavorite(Number(user.id), salonId);
            setFavorites(prev => prev.filter(f => f.id !== salonId));
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Favorite Salons</h1>
                    <p className="text-gray-500 mt-1">Quickly find your preferred salons.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map(salon => (
                            <Card key={salon.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                                {/* Image Container - Using Mock Image for now as Salon type might not have image yet or we use placeholder */}
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-4xl font-bold opacity-80 group-hover:scale-110 transition-transform duration-500">
                                        {salon.name.charAt(0)}
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(salon.id)}
                                        className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md bg-error text-white transition-colors"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary">
                                        Beauty & Wellness
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-gray-900">{salon.name}</h3>
                                        <div className="flex items-center gap-1 text-warning">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold">4.8</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{salon.address || 'No address provided'}</span>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button variant="outline" className="flex-1 text-gray-600 border-gray-200">Details</Button>
                                        <Link href={`/appointments/book?salonId=${salon.id}`} className="flex-1">
                                            <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
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
                            <Button className="bg-primary hover:bg-primary/90 mt-4">Discover Salons</Button>
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
