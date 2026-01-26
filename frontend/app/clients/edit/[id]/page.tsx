"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

import { clientService } from "@/lib/services/ClientService";
import { useAuth } from "@/context/AuthProvider";
import { Client } from "@/types";

export default function EditClientPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { activeSalonId } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        country: "France",
        notes: "",
    });

    useEffect(() => {
        if (params.id) {
            loadClient();
        }
    }, [params.id]);

    const loadClient = async () => {
        setIsLoading(true);
        try {
            const client = await clientService.getById(Number(params.id));
            if (client) {
                setFormData({
                    name: client.name,
                    email: client.email || "",
                    phone: client.phone || "",
                    address: client.address || "",
                    city: client.city || "",
                    zipCode: client.postalCode || "",
                    country: "France", // Default or extract from address
                    notes: client.notes || "",
                });
            } else {
                setError("Client not found");
            }
        } catch (err) {
            setError("Failed to load client data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (handleReadOnlyClick()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await clientService.update(Number(params.id), {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: `${formData.address}${formData.city ? ', ' + formData.city : ''}`,
                city: formData.city,
                postalCode: formData.zipCode,
                notes: formData.notes,
            });
            router.push("/clients");
        } catch (err: any) {
            setError(err.message || "Failed to update client");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (handleReadOnlyClick()) return;
        if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
            setIsSubmitting(true);
            try {
                await clientService.delete(Number(params.id));
                router.push("/clients");
            } catch (err: any) {
                setError(err.message || "Failed to delete client");
                setIsSubmitting(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
                        <p className="text-gray-500 mt-1">Update client information</p>
                    </div>
                    <div className="flex gap-3">
                        <ReadOnlyGuard>
                            <Button variant="danger" size="md" onClick={handleDelete}>
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </Button>
                        </ReadOnlyGuard>
                        <Button variant="danger" size="md" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500">Loading client data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <h3 className="text-lg font-semibold mb-6">Personal Information</h3>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option>France</option>
                                        <option>Belgium</option>
                                        <option>Switzerland</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button type="submit" variant="success" size="lg" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? "Updating..." : "Update Client"}
                                </Button>
                                <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                                    <X className="w-5 h-5" />
                                    Cancel
                                </Button>
                            </div>
                        </Card>
                    </form>
                )}
            </div>
        </MainLayout>
    );
}
