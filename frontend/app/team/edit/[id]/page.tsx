"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2 } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import { useWorkers } from "@/hooks/useServices";
import { workerService } from "@/lib/services/WorkerService";
import { WorkerStatus } from "@/types";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";

export default function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { t } = useTranslation();
    const { canModify } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const { updateWorker, deleteWorker } = useWorkers();

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        sharingKey: 50,
        role: "worker",
        address: "",
        city: "",
        zipCode: "",
        country: "France",
        status: "Active",
        notes: "",
    });

    useEffect(() => {
        const loadWorker = async () => {
            try {
                const worker = await workerService.getById(Number(id));
                if (worker) {
                    setFormData({
                        firstName: worker.firstName || "",
                        lastName: worker.lastName || "",
                        email: worker.email || "",
                        phone: worker.phone || "",
                        sharingKey: worker.sharingKey,
                        role: (worker.employeeRole || "worker").toLowerCase(),
                        address: worker.address || "",
                        city: worker.city || "",
                        zipCode: worker.postalCode || "",
                        country: "France",
                        status: worker.status,
                        notes: worker.bio || "",
                    });
                }
            } catch (err) {
                console.error("Failed to load worker", err);
            } finally {
                setLoading(false);
            }
        };
        loadWorker();
    }, [id]);

    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canModify || handleReadOnlyClick()) return;

        try {
            await updateWorker(Number(id), {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                sharingKey: formData.sharingKey,
                employeeRole: formData.role,
                status: formData.status as WorkerStatus,
                address: formData.address,
                city: formData.city,
                postalCode: formData.zipCode,
                bio: formData.notes
            });
            showToast(t("common.success"), t("team.updateSuccess"), "success");
            router.push("/team");
        } catch (e) {
            console.error(e);
            showToast(t("common.error"), t("common.updateError"), "error");
        }
    };

    const handleDelete = async () => {
        if (!canModify || handleReadOnlyClick()) return;
        const confirmed = await confirm({
            title: t("common.delete"),
            message: t("team.deleteConfirm"),
            type: "error",
            confirmText: t("common.delete"),
            cancelText: t("common.cancel")
        });

        if (confirmed) {
            try {
                await deleteWorker(Number(id));
                showToast(t("common.success"), t("team.deleteSuccess"), "success");
                router.push("/team");
            } catch (e) {
                console.error(e);
                showToast(t("common.error"), t("common.deleteError"), "error");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let value: any = e.target.value;
        if (e.target.name === "sharingKey") {
            value = parseInt(value);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    if (loading) {
        return (
            <TeamLayout title={t("team.editMember")} description={t("team.editMemberDesc")}>
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </TeamLayout>
        );
    }

    return (
        <TeamLayout title={t("team.editMember")} description={t("team.editMemberDesc")}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t("team.editMember")}</h1>
                        <p className="text-gray-500 mt-1">{t("team.editMemberDesc")}</p>
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

                <form onSubmit={handleSubmit}>
                    <Card>
                        <h3 className="text-lg font-semibold mb-6">{t("team.personalInfo")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("team.firstName")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("team.lastName")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("team.email")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("team.phone")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("team.sharingKey")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="sharingKey"
                                    value={formData.sharingKey}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t("team.sharingKeyDesc")}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.role")}</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="worker">{t("team.roles.worker")}</option>
                                    <option value="manager">{t("team.roles.manager")}</option>
                                    <option value="admin">{t("team.roles.admin")}</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.address")}</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.city")}</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.zipCode")}</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.status")}</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.notes")}</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="success" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                {t("team.updateMember")}
                            </Button>
                            <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                                <X className="w-5 h-5" />
                                {t("common.cancel")}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </TeamLayout>
    );
}
