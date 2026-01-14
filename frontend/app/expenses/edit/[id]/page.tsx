"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2 } from "lucide-react";

export default function EditExpensePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: "2026-01-10",
        category: "Beauty Supply",
        description: "Hair extensions and oils",
        amount: "350",
        salon: "Salon 1",
        paymentMethod: "Card",
        notes: "Restocked for the month.",
        status: "Approved",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Updated expense data:", formData);
        alert("Expense updated successfully!");
        router.push("/expenses");
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this expense record? This action cannot be undone.")) {
            console.log("Deleting expense:", params.id);
            alert("Expense record deleted!");
            router.push("/expenses");
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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
                        <p className="text-gray-500 mt-1">Modify an existing business expense</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="danger" size="md" onClick={handleDelete}>
                            <Trash2 className="w-5 h-5" />
                            Delete
                        </Button>
                        <Button variant="outline" size="md" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <h3 className="text-lg font-semibold mb-6">Expense Information</h3>
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

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="Office Rental">Office Rental</option>
                                    <option value="Rental Relative Expenses">Rental Relative Expenses</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="IG & Facebook & Google">IG & Facebook & Google</option>
                                    <option value="Office Cleaning">Office Cleaning</option>
                                    <option value="Internet">Internet</option>
                                    <option value="TV">TV</option>
                                    <option value="Beauty Supply">Beauty Supply</option>
                                    <option value="Other Expenses">Other Expenses</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
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

                            {/* Salon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Salon/Location
                                </label>
                                <select
                                    name="salon"
                                    value={formData.salon}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option>Salon 1</option>
                                    <option>Salon 2</option>
                                    <option>Salon 1 & 2</option>
                                </select>
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
                                    <option>Check</option>
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
                            <Button type="submit" variant="primary" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                Update Expense
                            </Button>
                            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
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
