"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { ArrowLeft, Trash2 } from "lucide-react";
import ServiceForm, { ServiceFormData } from "@/components/services/ServiceForm";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { useAuth } from "@/context/AuthProvider";
import { serviceService } from "@/lib/services";
import type { Service, ServiceAddon, ServiceCategory } from "@/types";

function EditServiceContent() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm: confirmAction } = useConfirm();
    const { activeSalonId } = useAuth();
    const searchParams = useSearchParams();
    const id = Number(params.id);
    const mode = (searchParams.get("mode") as "simple" | "advanced") || "advanced";
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const [service, setService] = useState<Service | null>(null);
    const [linkedAddonIds, setLinkedAddonIds] = useState<number[]>([]);
    const [addons, setAddons] = useState<ServiceAddon[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const found = await serviceService.getById(id);
                if (!found) {
                    showToast(t("common.error"), t("common.loadError"), "error");
                    router.push("/services");
                    return;
                }
                const salonId = Number(activeSalonId) || found.salonId;
                const [salonAddons, linked, salonCategories] = await Promise.all([
                    serviceService.getAddons(salonId),
                    serviceService.getAddonsForService(id),
                    serviceService.getCategories(salonId).catch(() => [] as ServiceCategory[]),
                ]);
                if (cancelled) return;
                setService(found);
                setAddons(salonAddons);
                setLinkedAddonIds(linked.map(a => a.id));
                setCategories(salonCategories);
            } catch (err) {
                console.error("Failed to load service", err);
                if (!cancelled) showToast(t("common.error"), t("common.loadError"), "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id, activeSalonId, router, showToast, t]);

    const handleSubmit = async (data: ServiceFormData) => {
        if (handleReadOnlyClick() || !service) return;
        setSaving(true);
        try {
            await serviceService.update(service.id, {
                name: data.name,
                description: data.description || undefined,
                price: data.price,
                duration: data.duration,
                categoryId: data.categoryId,
                isActive: data.isActive,
            });
            await serviceService.setAddonsForService(service.id, data.addonIds);
            showToast(t("common.success"), t("common.saveSuccess"), "success");
            router.push("/services");
        } catch (err) {
            console.error(err);
            showToast(t("common.error"), err instanceof Error ? err.message : t("errors.generic"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (handleReadOnlyClick() || !service) return;

        const isConfirmed = await confirmAction({
            title: t("services.archiveService"),
            message: t("dialogs.confirmDelete"),
            type: 'error',
            confirmText: t("common.archive"),
            cancelText: t("common.cancel")
        });

        if (isConfirmed) {
            try {
                await serviceService.update(service.id, { isActive: false });
                showToast(t("common.success"), t("services.archiveSuccess"), "success");
                router.push("/services");
            } catch (err) {
                console.error(err);
                showToast(t("common.error"), t("errors.generic"), "error");
            }
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t("services.editService")}</h1>
                            <p className="text-gray-500 mt-1">{service ? service.name : `${t("services.editingId")}: #${id}`}</p>
                        </div>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="danger" size="md" onClick={handleArchive} className="rounded-xl px-6" disabled={!service}>
                            <Trash2 className="w-5 h-5" />
                            {t("services.archiveService")}
                        </Button>
                    </ReadOnlyGuard>
                </div>

                {loading || !service ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : (
                    <ServiceForm
                        initialData={{
                            name: service.name,
                            description: service.description || "",
                            price: Number(service.price),
                            duration: Number(service.duration),
                            categoryId: service.categoryId,
                            isActive: service.isActive,
                            gallery: [],
                            addonIds: linkedAddonIds,
                        }}
                        mode={mode}
                        categories={categories}
                        addons={addons}
                        saving={saving}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/services")}
                    />
                )}
            </div>
        </MainLayout>
    );
}

export default function EditServicePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
            <EditServiceContent />
        </Suspense>
    );
}
