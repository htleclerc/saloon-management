"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useToast } from "@/context/ToastProvider";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";

export default function AddExpensePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { symbol } = useCurrency();
    const { handleReadOnlyClick } = useReadOnlyGuard();
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

    const { showToast } = useToast();

    // Check user role - in real app, get from auth context
    const userRole = "worker"; // or "admin"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (handleReadOnlyClick()) return;

        if (userRole === "worker") {
            showToast(t("common.info"), t("expenses.submittedInfo"), "info");
        } else {
            showToast(t("common.success"), t("expenses.addSuccess"), "success");
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
                        <h1 className="text-3xl font-bold text-gray-900">{t("expenses.addExpense")}</h1>
                        <p className="text-gray-500 mt-1">{t("expenses.recordNew")}</p>
                    </div>
                    <Button variant="danger" size="md" onClick={() => router.back()}>
                        <X className="w-5 h-5" />
                        {t("common.cancel")}
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <h3 className="text-lg font-semibold mb-6">{t("expenses.information")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("common.date")} <span className="text-red-500">*</span>
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
                                    {t("expenses.category")} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="">{t("common.search")}...</option>
                                    <option value="rent">{t("expenses.categories.rent")}</option>
                                    <option value="supplies">{t("expenses.categories.supplies")}</option>
                                    <option value="utilities">{t("expenses.categories.utilities")}</option>
                                    <option value="marketing">{t("expenses.categories.marketing")}</option>
                                    <option value="insurance">{t("expenses.categories.insurance")}</option>
                                    <option value="maintenance">{t("expenses.categories.maintenance")}</option>
                                    <option value="software">{t("expenses.categories.software")}</option>
                                    <option value="salary">{t("expenses.categories.salary")}</option>
                                    <option value="other">{t("expenses.categories.other")}</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("common.description")} <span className="text-red-500">*</span>
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
                                    {t("common.amount")} ({symbol()}) <span className="text-red-500">*</span>
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
                                    {t("common.salon")}
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
                                    {t("common.payment")}
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="cash">{t("payment.methods.cash")}</option>
                                    <option value="card">{t("payment.methods.card")}</option>
                                    <option value="mobile">{t("payment.methods.mobile")}</option>
                                    <option value="others">{t("payment.methods.others")}</option>
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
                            {userRole === "worker" && (
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
                                {userRole === "worker" ? t("expenses.submitForApproval") : t("expenses.saveExpense")}
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
