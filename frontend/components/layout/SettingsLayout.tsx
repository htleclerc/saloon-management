"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import { useAuth, UserRole } from "@/context/AuthProvider";
import {
    User,
    Building2,
    Palette,
    Bell,
    Shield,
    Users,
    CreditCard,
    Link2,
    BarChart3,
    Mail,
    Settings,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";

const settingsMenuItems = [
    { id: "profile", name: "Profile", description: "Personal information", icon: User, path: "/settings/profile", color: "from-[var(--color-info,bg-blue-500)] to-[var(--color-info-dark,bg-blue-700)]", roles: ['client', 'worker', 'manager', 'admin'] },
    { id: "appearance", name: "Appearance", description: "Themes & fonts", icon: Palette, path: "/settings/appearance", color: "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]", roles: ['client', 'worker', 'manager', 'admin'] },
    { id: "notifications", name: "Notifications", description: "Alerts & reminders", icon: Bell, path: "/settings/notifications", color: "from-[var(--color-warning)] to-[var(--color-warning-dark)]", roles: ['client', 'worker', 'manager', 'admin'] },
    { id: "security", name: "Security", description: "Passwords & 2FA", icon: Shield, path: "/settings/security", color: "from-[var(--color-error)] to-[var(--color-error-dark)]", roles: ['client', 'worker', 'manager', 'admin'] },
    { id: "users", name: "User Management", description: "Team & roles", icon: Users, path: "/settings/users", color: "from-[var(--color-success)] to-[var(--color-success-dark)]", roles: ['admin'] },
    { id: "billing", name: "Billing", description: "Payments & invoices", icon: CreditCard, path: "/settings/billing", color: "from-[var(--color-info,bg-blue-500)] opacity-80 to-[var(--color-info-dark,bg-blue-700)]", roles: ['admin'] },
    { id: "integrations", name: "Integrations", description: "Third-party services", icon: Link2, path: "/settings/integrations", color: "from-[var(--color-primary)] opacity-80 to-[var(--color-primary-dark)]", roles: ['manager', 'admin'] },
    { id: "analytics", name: "Analytics", description: "Reports & data", icon: BarChart3, path: "/settings/analytics", color: "from-[var(--color-info,bg-blue-500)] to-[var(--color-info-dark,bg-blue-700)]", roles: ['manager', 'admin'] },
    { id: "emails", name: "Emails", description: "Email templates", icon: Mail, path: "/settings/emails", color: "from-[var(--color-warning-light)] to-[var(--color-warning)]", roles: ['manager', 'admin'] },
    { id: "advanced", name: "Advanced", description: "Advanced options", icon: Settings, path: "/settings/advanced", color: "from-gray-500 to-gray-600", roles: ['admin'] },
];

interface SettingsLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { isMobile } = useResponsive();
    const { hasPermission } = useAuth();
    const [submenuCollapsed, setSubmenuCollapsed] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    // Filter menu items based on permissions
    const visibleMenuItems = settingsMenuItems.filter(item =>
        hasPermission(item.roles as UserRole[])
    );

    const activeItem = visibleMenuItems.find((item) => isActive(item.path)) || visibleMenuItems[0];

    // Horizontal layout (tabs) - Only on Desktop if Horizontal theme is selected
    if (theme.submenuLayout === "horizontal" && !isMobile) {
        return (
            <MainLayout>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                                <p className="text-gray-500 text-xs">{description}</p>
                            </div>
                        </div>
                        <nav className="flex overflow-x-auto hide-scrollbar">
                            {visibleMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.path}
                                        className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-all ${active
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                            : "border-transparent hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="space-y-4">{children}</div>
                </div>
            </MainLayout>
        );
    }

    // Mobile dropdown - Forced on Mobile
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
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "hover:bg-gray-50"
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

    // Vertical layout (sidebar) - default
    return (
        <MainLayout>
            <div className="flex gap-6 min-h-[calc(100vh-120px)]">
                <aside className={`flex-shrink-0 transition-all duration-300 ${submenuCollapsed ? "w-16" : "w-72"}`}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                            {!submenuCollapsed && (
                                <div>
                                    <h2 className="text-sm font-bold text-white">Settings</h2>
                                    <p className="text-white opacity-80 text-xs">Configuration</p>
                                </div>
                            )}
                            <button
                                onClick={() => setSubmenuCollapsed(!submenuCollapsed)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                            >
                                {submenuCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                            </button>
                        </div>

                        <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <ul className="space-y-1">
                                {visibleMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${active ? "bg-purple-50 border border-purple-200" : "hover:bg-gray-50"
                                                    } ${submenuCollapsed ? "justify-center" : ""}`}
                                                title={submenuCollapsed ? item.name : undefined}
                                            >
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} flex-shrink-0`}>
                                                    <Icon className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                {!submenuCollapsed && (
                                                    <>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${active ? "text-[var(--color-primary)]" : "text-gray-700"}`}>
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 truncate">{item.description}</p>
                                                        </div>
                                                        {active && <ChevronRight className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />}
                                                    </>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        <p className="text-gray-500 text-xs">{description}</p>
                    </div>
                    <div className="space-y-4">{children}</div>
                </main>
            </div>
        </MainLayout>
    );
}

export { settingsMenuItems };
