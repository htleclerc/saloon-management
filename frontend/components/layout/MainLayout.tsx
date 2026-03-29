"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DemoModeBanner from "../ui/DemoModeBanner";
import LoadingScreen from "../ui/LoadingScreen";
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
    const { isAuthenticated, isLoading, isReadOnlyMode } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <LoadingScreen />;
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
            <main className={`${getMarginLeft()} ${isReadOnlyMode ? 'mt-32' : 'mt-16'} px-5 py-3 md:pt-2 md:px-6 md:pb-6 transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
}
