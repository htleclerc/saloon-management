"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2 } from "lucide-react";

export default function EditIncomePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: "2026-01-12",
        clientId: "1",
        clientName: "Marie Dubois",
        serviceId: "1",
        serviceName: "Box Braids",
        workerId: "1",
        workerName: "Orphelia",
        amount: "120",
        paymentMethod: "Cash",
        notes: "Special requests handled.",
        status: "Approved",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Updated income data:", formData);
        alert("Income updated successfully!");
        router.push("/income");
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this income record? This action cannot be undone.")) {
            console.log("Deleting income:", params.id);
            alert("Income record deleted!");
            router.push("/income");
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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
                        <p className="text-gray-500 mt-1">Modify an existing income transaction</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="danger" size="md" onClick={handleDelete}>
                            <Trash2 className="w-5 h-5" />
                            Delete
                        </Button>
                        <Button variant="danger" size="md" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <h3 className="text-lg font-semibold mb-6">Income Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Client */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="1">Marie Dubois</option>
                                    <option value="2">Jean Martin</option>
                                    <option value="3">Sophie Laurent</option>
                                    <option value="4">Pierre Rousseau</option>
                                </select>
                            </div>

                            {/* Service */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="serviceId"
                                    value={formData.serviceId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="1">Box Braids - €120</option>
                                    <option value="2">Cornrows - €85</option>
                                    <option value="3">Senegalese Twists - €110</option>
                                    <option value="4">Locs - €150</option>
                                    <option value="5">Goddess Braids - €130</option>
                                    <option value="6">Twists - €95</option>
                                </select>
                            </div>

                            {/* Worker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Worker <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="workerId"
                                    value={formData.workerId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="1">Orphelia</option>
                                    <option value="2">Worker 2</option>
                                    <option value="3">Worker 3</option>
                                    <option value="4">Worker 4</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (€) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>Bank Transfer</option>
                                    <option>Mobile Payment</option>
                                </select>
                            </div>

                            {/* Notes */}
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

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option>Pending</option>
                                    <option>Approved</option>
                                    <option>Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="success" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                Update Income
                            </Button>
                            <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                                <X className="w-5 h-5" />
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
}
