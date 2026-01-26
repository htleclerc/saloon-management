"use client";

import { useRouter } from "next/navigation";
import {
    Shield,
    ArrowLeft,
    ShieldCheck,
    Globe
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";

export default function SuperAdminLoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { demoLogin } = useAuth();

    const handleDemoMode = () => {
        demoLogin("super_admin");
        router.push("/superadmin");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-poppins">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600 shadow-sm border-2 border-orange-200">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Accès Super Admin</h1>
                    <p className="text-gray-500 font-medium">Panneau de contrôle global de la plateforme</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-orange-500/5 border border-gray-100">
                    <div className="space-y-6">
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex gap-4">
                            <div className="p-3 bg-white rounded-xl h-fit text-orange-500 shadow-sm">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-orange-900 text-sm">Mode Administration</p>
                                <p className="text-xs text-orange-700 leading-relaxed">
                                    Utilisez ce mode pour gérer tous les salons, voir les statistiques globales et configurer les paramètres système.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleDemoMode}
                            className="group w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                        >
                            <Globe className="w-5 h-5 animate-pulse" />
                            <span>Entrer en Démo Admin</span>
                        </button>

                        <div className="pt-4 text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Retour au salon standard
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Saloon Management Platform</p>
                    <div className="flex gap-4">
                        <div className="h-0.5 w-8 bg-gray-300 rounded-full"></div>
                        <div className="h-0.5 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
