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
    { name: "Clients", icon: UserCheck, path: "/clients" },
    { name: "Revenus", icon: DollarSign, path: "/revenus" },
    { name: "Expenses", icon: Receipt, path: "/expenses" },
    { name: "Services", icon: Scissors, path: "/services" },
    { name: "Daily", icon: TrendingUp, path: "/daily" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Validation", icon: CheckSquare, path: "/validation" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleSidebar, currentPalette } = useTheme();
    const { isMobile, isTablet } = useResponsive();
    const [mobileOpen, setMobileOpen] = useState(false);

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
        setMobileOpen(false);
    }, [pathname]);

    const isCollapsed = theme.sidebarCollapsed || isTablet;

    // Mobile hamburger button
    if (isMobile) {
        return (
            <>
                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2 text-white rounded-lg shadow-lg lg:hidden"
                    style={{ backgroundColor: currentPalette.primary }}
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Mobile overlay */}
                <div
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Mobile sidebar */}
                <aside
                    className={`fixed left-0 top-0 h-screen w-72 text-white shadow-xl z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    style={sidebarGradient}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold">Workshop Manager</h1>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav>
                            <ul className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.path ||
                                        (item.path !== "/" && pathname.startsWith(item.path));
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                href={item.path}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? "bg-white/20 shadow-lg" : "hover:bg-white/10"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop/Tablet sidebar
    return (
        <aside
            className={`fixed left-0 top-0 h-screen text-white shadow-xl z-50 overflow-y-auto sidebar-transition ${isCollapsed ? "w-[72px]" : "w-64"
                }`}
            style={sidebarGradient}
        >
            <div className={`p-4 ${isCollapsed ? "px-2" : ""}`}>
                {/* Header */}
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6`}>
                    {!isCollapsed && <h1 className="text-lg font-bold">Workshop Manager</h1>}
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
                </div>

                {/* Navigation */}
                <nav>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path ||
                                (item.path !== "/" && pathname.startsWith(item.path));
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? "bg-white/20 shadow-lg" : "hover:bg-white/10"
                                            } ${isCollapsed ? "justify-center" : ""}`}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <span className="font-medium text-sm">{item.name}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export { menuItems };
