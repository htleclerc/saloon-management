"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, Save, Sparkles, Clock, Euro } from "lucide-react";
import Link from "next/link";

export default function AddServicePage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Braiding",
    });

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/services">
                        <Button variant="outline" size="sm" className="p-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
                        <p className="text-gray-500">Define a new service for your workshop</p>
                    </div>
                </div>

                <form className="space-y-6">
                    <Card>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="font-bold">Service Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Box Braids, Custom Suit, Engine Check"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the service details..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        <Euro className="w-4 h-4 text-gray-400" />
                                        Price (€)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        Estimated Duration
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 2-3 hours, 45 mins"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Braiding">Braiding</option>
                                        <option value="Tailoring">Tailoring</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Consultation">Consultation</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/services">
                            <Button variant="outline" size="lg">Cancel</Button>
                        </Link>
                        <Button variant="primary" size="lg" type="submit">
                            <Save className="w-5 h-5" />
                            Create Service
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
