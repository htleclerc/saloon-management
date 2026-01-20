"use client";

import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import ServiceForm from "@/components/services/ServiceForm";

export default function AddServicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = (searchParams.get("mode") as "simple" | "advanced") || "advanced";

    const handleSubmit = (data: any) => {
        console.log("Creating service:", data);
        // In a real app, send to API
        router.push("/services");
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
                        <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
                        <p className="text-gray-500 mt-1">
                            {mode === 'advanced'
                                ? "Configure comprehensive service details and media"
                                : "Quickly initiate a new service with basic info"
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
