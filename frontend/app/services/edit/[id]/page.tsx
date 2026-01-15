"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, Save, Sparkles, Clock, Euro, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [formData, setFormData] = useState({
        name: "Box Braids",
        description: "Traditional box braids with various sizes",
        price: "120",
        duration: "3-4 hours",
        category: "Braiding",
    });

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()}>
                            <Button variant="outline" size="sm" className="p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
                            <p className="text-gray-500">Modify service ID: #{id}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="md" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-5 h-5" />
                        Delete Service
                    </Button>
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
                                        placeholder="e.g., Box Braids"
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
                                        placeholder="e.g., 3-4 hours"
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
                            Update Service
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
