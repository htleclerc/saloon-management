"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2 } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { useTranslation } from "@/i18n";

export default function EditExpensePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { t } = useTranslation();
    const { handleReadOnlyClick } = useReadOnlyGuard();
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

    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (handleReadOnlyClick()) return;
        console.log("Updated expense data:", formData);
        showToast(t("common.success"), t("expenses.updateSuccess"), "success");
        router.push("/expenses");
    };

    const handleDelete = async () => {
        if (handleReadOnlyClick()) return;
        const confirmed = await confirm({
            title: t("common.delete"),
            message: t("expenses.deleteConfirm"),
            type: "error",
            confirmText: t("common.delete"),
            cancelText: t("common.cancel")
        });

        if (confirmed) {
            console.log("Deleting expense:", params.id);
            showToast(t("common.success"), t("expenses.deleteSuccess"), "success");
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
                        <h1 className="text-3xl font-bold text-gray-900">{t("expenses.editExpense")}</h1>
                        <p className="text-gray-500 mt-1">{t("expenses.modifyExisting")}</p>
                    </div>
                    <div className="flex gap-3">
                        <ReadOnlyGuard>
                            <Button variant="danger" size="md" onClick={handleDelete}>
                                <Trash2 className="w-5 h-5" />
                                {t("common.delete")}
                            </Button>
                        </ReadOnlyGuard>
                        <Button variant="danger" size="md" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            {t("common.cancel")}
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
                            <Button type="submit" variant="success" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                {t("expenses.updateExpense")}
                            </Button>
                            <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                                <X className="w-5 h-5" />
                                {t("common.cancel")}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
}
