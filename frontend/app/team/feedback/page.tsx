"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Star,
    Search,
    Filter,
    ArrowLeft,
    MessageSquare,
    TrendingUp,
    Calendar,
    ChevronDown,
    User as UserIcon
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const allComments = [
    { id: 1, client: "Marie Anderson", comment: "Isabelle was amazing! My box braids look perfect.", rating: 5, date: "2026-01-19", service: "Box Braids" },
    { id: 2, client: "Lina Davis", comment: "Great service, very professional. Highly recommend.", rating: 4, date: "2026-01-18", service: "Cornrows" },
    { id: 3, client: "Anna Brown", comment: "Always a pleasure to be serviced by Isabelle. She knows exactly what I want.", rating: 5, date: "2026-01-17", service: "Twists" },
    { id: 4, client: "Lisa Wilson", comment: "Very happy with my new braids! They are tight but not too tight.", rating: 5, date: "2026-01-16", service: "Braids" },
    { id: 5, client: "Sophie Martin", comment: "Professional and quick service. A bit expensive but worth it.", rating: 4, date: "2026-01-15", service: "Locs" },
    { id: 6, client: "Julie Lefebvre", comment: "The salon is beautiful and Isabelle is very talented. 10/10", rating: 5, date: "2026-01-14", service: "Box Braids" },
    { id: 7, client: "Chloe Dubois", comment: "Nice experience, but waited 10 mins after my appointment time.", rating: 3, date: "2026-01-13", service: "Cornrows" },
];

export default function FeedbackPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceNameFilter = searchParams.get("serviceName");
    const workerNameFilter = searchParams.get("workerName");

    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");

    const filteredComments = allComments.filter(comment => {
        const matchesSearch = comment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === "all" || comment.rating === parseInt(ratingFilter);
        const matchesService = !serviceNameFilter || comment.service.toLowerCase() === serviceNameFilter.toLowerCase();
        return matchesSearch && matchesRating && matchesService;
    });

    const avgRating = (allComments.reduce((acc, c) => acc + c.rating, 0) / allComments.length).toFixed(1);

    return (
        <ProtectedRoute>
            <MainLayout>
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {serviceNameFilter ? `${serviceNameFilter} Reviews` : "Customer Feedback"}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {serviceNameFilter ? `Viewing feedback for ${serviceNameFilter}` : "View and manage reviews from your clients"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <div className="px-4 py-2 bg-yellow-50 rounded-xl flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-lg font-bold text-yellow-700">{avgRating}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-100"></div>
                            <div className="px-4 py-2">
                                <span className="text-sm font-bold text-gray-900">{allComments.length} Total Reviews</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">Sentiment</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 underline decoration-green-500/30 decoration-4">92% Positive</h3>
                            <p className="text-xs text-green-600 font-medium mt-2">+5% from last month</p>
                        </Card>

                        <div className="md:col-span-2 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by client name or feedback content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full pl-12 pr-4 bg-white border-none shadow-xl shadow-gray-200/50 rounded-3xl text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            />
                        </div>
                    </div>

                    {/* Filter & List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
                                All Reviews
                            </h3>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Filter by:</span>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="bg-white border-none shadow-lg shadow-gray-200/50 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredComments.length > 0 ? (
                                filteredComments.map((comment) => (
                                    <Card key={comment.id} className="p-6 border-none shadow-lg shadow-gray-100/50 bg-white rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-lg font-bold">
                                                    {comment.client.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{comment.client}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{comment.service}</span>
                                                        <div className="flex text-yellow-400">
                                                            {"★".repeat(comment.rating)}
                                                            <span className="text-gray-200">{"★".repeat(5 - comment.rating)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">{comment.date}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-[var(--color-primary-light)] pl-4 py-1 bg-gray-50/50 rounded-r-xl">
                                            "{comment.comment}"
                                        </p>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                                    <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-medium">No reviews found matching your criteria</p>
                                    <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setRatingFilter("all"); }}>Reset Filters</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
