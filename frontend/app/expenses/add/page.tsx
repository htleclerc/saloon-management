"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X } from "lucide-react";

export default function AddExpensePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: "",
        salon: "Salon 1",
        paymentMethod: "Cash",
        notes: "",
        status: "Pending", // Pending for admin validation if submitted by worker
    });

    // Check user role - in real app, get from auth context
    const userRole = "Worker"; // or "Admin"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Expense data:", formData);

        if (userRole === "Worker") {
            alert("Expense submitted for admin approval!");
        } else {
            alert("Expense added successfully!");
        }
        router.push("/expenses");
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
                        <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
                        <p className="text-gray-500 mt-1">Record a new business expense</p>
                    </div>
                    <Button variant="danger" size="md" onClick={() => router.back()}>
                        <X className="w-5 h-5" />
                        Cancel
                    </Button>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="">Select a category</option>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    placeholder="Brief description of the expense"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    placeholder="Enter amount"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    placeholder="Add any additional notes..."
                                />
                            </div>

                            {/* Status Info - Show only for Workers */}
                            {userRole === "Worker" && (
                                <div className="md:col-span-2">
                                    <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning-light)] rounded-lg p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[var(--color-warning)] rounded-full"></div>
                                            <p className="text-sm font-medium text-[var(--color-warning)]">
                                                This expense will be submitted for admin approval
                                            </p>
                                        </div>
                                        <p className="text-xs text-[var(--color-warning)] opacity-80 mt-1 ml-4">
                                            As a worker, your expense submissions require administrator approval before being added to the records.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="success" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                {userRole === "Worker" ? "Submit for Approval" : "Save Expense"}
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
