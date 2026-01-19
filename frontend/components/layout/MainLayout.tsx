"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DemoModeBanner from "../ui/DemoModeBanner";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { theme } = useTheme();
    const { isMobile, isTablet } = useResponsive();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Initializing Workspace...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Calculate main content margin based on sidebar state
    const getMarginLeft = () => {
        if (isMobile) return "ml-0";
        if (theme.sidebarCollapsed || isTablet) return "ml-[72px]";
        return "ml-64";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />
            <DemoModeBanner />
            <main className={`${getMarginLeft()} mt-12 p-3 md:pt-2 md:px-6 md:pb-6 transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
}
