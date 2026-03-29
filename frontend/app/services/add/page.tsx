"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import ServiceForm from "@/components/services/ServiceForm";
import { useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { useServices } from "@/hooks/useServices";

function AddServiceContent() {
    const router = useRouter();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { createService } = useServices();
    const searchParams = useSearchParams();
    const mode = (searchParams.get("mode") as "simple" | "advanced") || "advanced";
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const handleSubmit = async (data: any) => {
        if (handleReadOnlyClick()) return;
        try {
            await createService(data);
            showToast(t("common.success"), t("dialogs.success"), "success");
            router.push("/services");
        } catch (err) {
            console.error("Failed to create service:", err);
            showToast(t("common.error"), t("errors.generic"), "error");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t("services.addService")}</h1>
                        <p className="text-gray-500 mt-1">
                            {mode === 'advanced'
                                ? t("services.advancedDesc")
                                : t("services.simpleDesc")
                            }
                        </p>
                    </div>
                </div>

                <ServiceForm
                    mode={mode}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/services")}
                />
            </div>
        </MainLayout>
    );
}

export default function AddServicePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
            <AddServiceContent />
        </Suspense>
    );
}
