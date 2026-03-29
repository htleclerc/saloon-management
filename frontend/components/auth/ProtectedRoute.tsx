"use client";

import { useAuth, UserRole } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useToast } from "@/context/ToastProvider";
import { useTranslation } from "@/i18n";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole | UserRole[];
    fallbackPath?: string;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    fallbackPath = "/"
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasPermission, user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (requiredRole && !hasPermission(requiredRole)) {
                showToast(t("common.accessDenied"), t("common.accessDeniedMsg"), "error");
                router.push(fallbackPath);
            }
        }
    }, [isAuthenticated, isLoading, requiredRole, hasPermission, router, showToast, fallbackPath, t]);

    if (isLoading || !isAuthenticated || (requiredRole && !hasPermission(requiredRole))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">{t("common.verifyingAccess")}</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
