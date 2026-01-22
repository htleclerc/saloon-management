"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import { useAuth, UserRole } from "@/context/AuthProvider";
import {
    Building2,
    FlaskConical,
    Tags,
    Coins,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";

export const configurationMenuItems = [
    { id: "workshop", name: "Workshop", description: "Business settings", icon: Building2, path: "/configuration/workshop", color: "from-blue-500 to-blue-700", roles: ['manager', 'admin'] },
    { id: "inventory", name: "Inventory", description: "Products & Stock", icon: FlaskConical, path: "/configuration/inventory", color: "from-teal-500 to-teal-700", roles: ['manager', 'admin'] },
    { id: "promos", name: "Promos", description: "Discount codes", icon: Tags, path: "/configuration/promos", color: "from-purple-500 to-purple-700", roles: ['manager', 'admin'] },
    { id: "tips", name: "Tips Management", description: "Distribution rules", icon: Coins, path: "/configuration/tips", color: "from-yellow-500 to-orange-500", roles: ['admin'] },
];

interface ConfigurationLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function ConfigurationLayout({ children, title, description }: ConfigurationLayoutProps) {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { isMobile } = useResponsive();
    const { hasPermission } = useAuth();
    const [submenuCollapsed, setSubmenuCollapsed] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    // Filter menu items based on permissions
    const visibleMenuItems = configurationMenuItems.filter(item =>
        hasPermission(item.roles as UserRole[])
    );

    if (visibleMenuItems.length === 0) return null;

    const activeItem = visibleMenuItems.find((item) => isActive(item.path)) || visibleMenuItems[0];

    // Mobile specific layout
    if (isMobile) {
        return (
            <MainLayout>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeItem.color} flex items-center justify-center`}>
                                    <activeItem.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                                    <p className="text-xs text-gray-500">{activeItem.name}</p>
                                </div>
                            </div>
                            {mobileDropdownOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {mobileDropdownOpen && (
                            <nav className="border-t border-gray-100 p-2 max-h-80 overflow-y-auto">
                                {visibleMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.path}
                                            onClick={() => setMobileDropdownOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? "bg-purple-50 text-purple-700" : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-medium text-sm">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                    <div className="space-y-4">{children}</div>
                </div>
            </MainLayout>
        );
    }

    // Default to Horizontal Layout (Tabs)
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-gray-500 text-sm mt-1">{description}</p>
                        </div>
                    </div>
                    <nav className="flex overflow-x-auto hide-scrollbar px-2">
                        {visibleMenuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`flex items-center gap-2 px-4 py-4 border-b-2 whitespace-nowrap transition-all ${active
                                        ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]/10"
                                        : "border-transparent hover:bg-gray-50 text-gray-600"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? "text-[var(--color-primary)]" : "text-gray-400"}`} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div>{children}</div>
            </div>
        </MainLayout>
    );
}
