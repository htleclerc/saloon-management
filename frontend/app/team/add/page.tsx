"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, AlertCircle } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useAuth } from "@/context/AuthProvider";
import { useWorkers } from "@/hooks/useServices";
import { useTranslation } from "@/i18n";

export default function AddTeamMemberPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { canModify } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const { createWorker, loading, error } = useWorkers();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        sharingKey: 50,
        role: "Worker",
        address: "",
        city: "",
        zipCode: "",
        country: "France",
        salary: "",
        status: "Active" as const,
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canModify || handleReadOnlyClick()) return;

        try {
            // Create worker using the service
            await createWorker({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                sharingKey: formData.sharingKey,
                status: formData.status,
                avatarUrl: '',
                color: '#8B5CF6'
            });

            // Success - redirect to team page
            router.push("/team");
        } catch (err) {
            // Error is already captured by the hook
            console.error('Failed to create worker:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <TeamLayout
            title={t("team.addMember")}
            description={t("team.addMemberDesc")}
        >

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-6 p-4 bg-error-light border border-error-light/50 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-error">{t("team.errorCreating")}</h4>
                            <p className="text-sm text-error mt-1">{error}</p>
                        </div>
                    </div>
                )}

                <Card>
                    <h3 className="text-lg font-semibold mb-6">{t("team.personalInfo")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.firstName")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.lastName")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.email")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.phone")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("team.sharingKey")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                name="sharingKey"
                                value={formData.sharingKey}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t("team.sharingKeyDesc")}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.role")}</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            >
                                <option value="Worker">{t("team.roles.worker")}</option>
                                <option value="Admin">{t("team.roles.admin")}</option>
                                <option value="Manager">{t("team.roles.manager")}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.address")}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.city")}</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.zipCode")}</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.status")}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!canModify}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            >
                                <option value="Active">{t("common.active")}</option>
                                <option value="Inactive">{t("common.inactive")}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.notes")}</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={!canModify}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <ReadOnlyGuard>
                            <Button type="submit" variant="success" size="lg" className="flex-1" disabled={loading}>
                                <Save className="w-5 h-5" />
                                {loading ? t("team.creating") : t("team.saveMember")}
                            </Button>
                        </ReadOnlyGuard>
                        <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            {t("common.cancel")}
                        </Button>
                    </div>
                </Card>
            </form>
        </TeamLayout>
    );
}

