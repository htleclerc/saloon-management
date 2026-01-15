"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    Receipt,
    FileText,
    Settings,
    Scissors,
    DollarSign,
    UserCheck,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Workers", icon: Users, path: "/workers" },
    { name: "Daily", icon: TrendingUp, path: "/daily" },
    { name: "Income", icon: DollarSign, path: "/income" },
    { name: "Clients", icon: UserCheck, path: "/clients" },
    { name: "Expenses", icon: Receipt, path: "/expenses" },
    { name: "Validation", icon: CheckSquare, path: "/validation" },
    { name: "Services", icon: Scissors, path: "/services" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

import { useAuth } from "@/context/AuthProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleSidebar, currentPalette, mobileMenuOpen, setMobileMenuOpen } = useTheme();
    const { isMobile, isTablet } = useResponsive();
    const { hasPermission, demoLogin } = useAuth();

    // Dynamic gradient style based on color palette
    const sidebarGradient = {
        background: `linear-gradient(180deg, ${currentPalette.primary} 0%, ${currentPalette.secondary} 100%)`
    };

    // Auto-collapse on tablet
    useEffect(() => {
        if (isTablet && !theme.sidebarCollapsed) {
            toggleSidebar();
        }
    }, [isTablet]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const isCollapsed = theme.sidebarCollapsed || isTablet;

    const navContent = (
        <div className={`p-4 ${isCollapsed && !isMobile ? "px-2" : ""}`}>
            {/* Header */}
            <div className={`flex items-center ${isCollapsed && !isMobile ? "justify-center" : "justify-between"} mb-6`}>
                {(!isCollapsed || isMobile) && <h1 className="text-lg font-bold">Workshop Manager</h1>}
                {isMobile ? (
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav>
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        // Permission checks for specific items
                        if (item.name === "Workers" && !hasPermission(['manager', 'admin'])) return null;
                        if (item.name === "Settings" && !hasPermission(['manager', 'admin'])) return null;
                        if (item.name === "Expenses" && !hasPermission(['manager', 'admin'])) return null;
                        if (item.name === "Income" && !hasPermission(['manager', 'admin'])) return null;

                        const Icon = item.icon;
                        const isActive = pathname === item.path ||
                            (item.path !== "/" && pathname.startsWith(item.path));
                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? "bg-white/20 shadow-lg" : "hover:bg-white/10"
                                        } ${(isCollapsed && !isMobile) ? "justify-center" : ""}`}
                                    title={(isCollapsed && !isMobile) ? item.name : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {(!isCollapsed || isMobile) && (
                                        <span className="font-medium text-sm">{item.name}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Demo Role Switcher */}
            <div className={`mt-auto pt-4 border-t border-white/10 ${(isCollapsed && !isMobile) ? "hidden" : "block"}`}>
                <p className="text-xs text-white/50 mb-2 px-3 uppercase font-semibold">Demo Roles</p>
                <div className="flex gap-2 px-3">
                    <button
                        onClick={() => demoLogin('admin')}
                        className="flex-1 text-xs bg-white/10 hover:bg-white/20 py-1.5 rounded text-white transition-colors"
                    >
                        Admin
                    </button>
                    <button
                        onClick={() => demoLogin('worker')}
                        className="flex-1 text-xs bg-white/10 hover:bg-white/20 py-1.5 rounded text-white transition-colors"
                    >
                        Worker
                    </button>
                </div>
            </div>
        </div>
    );

    // On mobile, render as a fixed drawer with overlay
    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Sidebar Drawer */}
                <aside
                    className={`fixed left-0 top-0 h-screen w-72 text-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                    style={sidebarGradient}
                >
                    {navContent}
                </aside>
            </>
        );
    }

    // Desktop/Tablet sidebar
    return (
        <aside
            className={`fixed left-0 top-0 h-screen text-white shadow-xl z-50 overflow-y-auto sidebar-transition ${isCollapsed ? "w-[72px]" : "w-64"}`}
            style={sidebarGradient}
        >
            {navContent}
        </aside>
    );
}

export { menuItems };
