"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTheme, useResponsive } from "@/context/ThemeProvider";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { theme } = useTheme();
    const { isMobile, isTablet } = useResponsive();

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
            <main className={`${getMarginLeft()} mt-16 p-4 md:p-6 transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
}
