"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { ArrowLeft, Trash2 } from "lucide-react";
import ServiceForm from "@/components/services/ServiceForm";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const mode = (searchParams.get("mode") as "simple" | "advanced") || "advanced";
    const { handleReadOnlyClick } = useReadOnlyGuard();

    // In a real app, fetch this from API
    const initialData = {
        name: "Box Braids",
        description: "Traditional box braids with various sizes",
        price: "120",
        duration: "3-4 hours",
        category: "Braiding",
        status: "active",
        image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
        gallery: [
            "https://images.unsplash.com/photo-1595476108410-d3923412705e?w=400",
            "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400"
        ]
    };

    const handleSubmit = (data: any) => {
        if (handleReadOnlyClick()) return;
        console.log("Updating service:", data);
        // In a real app, send to API
        router.push("/services");
    };

    const handleArchive = () => {
        if (handleReadOnlyClick()) return;
        console.log("Archiving service:", id);
        // In a real app, send to API (soft delete)
        router.push("/services");
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
                            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
                            <p className="text-gray-500 mt-1">Modifying service ID: #{id}</p>
                        </div>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="danger" size="md" onClick={handleArchive} className="rounded-xl px-6">
                            <Trash2 className="w-5 h-5" />
                            Archive Service
                        </Button>
                    </ReadOnlyGuard>
                </div>

                <ServiceForm
                    initialData={initialData}
                    mode={mode}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/services")}
                />
            </div>
        </MainLayout>
    );
}
