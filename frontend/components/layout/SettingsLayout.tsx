"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
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
    { id: "profile", name: "Profile", description: "Informations personnelles", icon: User, path: "/settings/profile", color: "from-blue-500 to-blue-600" },
    { id: "workshop", name: "Workshop", description: "Configuration entreprise", icon: Building2, path: "/settings/workshop", color: "from-purple-500 to-purple-600" },
    { id: "appearance", name: "Appearance", description: "Thème & polices", icon: Palette, path: "/settings/appearance", color: "from-pink-500 to-pink-600" },
    { id: "notifications", name: "Notifications", description: "Alertes & rappels", icon: Bell, path: "/settings/notifications", color: "from-orange-500 to-orange-600" },
    { id: "security", name: "Security", description: "Mots de passe & 2FA", icon: Shield, path: "/settings/security", color: "from-red-500 to-red-600" },
    { id: "users", name: "User Management", description: "Équipe & rôles", icon: Users, path: "/settings/users", color: "from-green-500 to-green-600" },
    { id: "billing", name: "Billing", description: "Paiements & factures", icon: CreditCard, path: "/settings/billing", color: "from-teal-500 to-teal-600" },
    { id: "integrations", name: "Integrations", description: "Services tiers", icon: Link2, path: "/settings/integrations", color: "from-indigo-500 to-indigo-600" },
    { id: "analytics", name: "Analytics", description: "Rapports & données", icon: BarChart3, path: "/settings/analytics", color: "from-cyan-500 to-cyan-600" },
    { id: "emails", name: "Emails", description: "Modèles email", icon: Mail, path: "/settings/emails", color: "from-yellow-500 to-yellow-600" },
    { id: "advanced", name: "Advanced", description: "Options avancées", icon: Settings, path: "/settings/advanced", color: "from-gray-500 to-gray-600" },
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
    const [submenuCollapsed, setSubmenuCollapsed] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
    const activeItem = settingsMenuItems.find((item) => isActive(item.path)) || settingsMenuItems[0];

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
                            {settingsMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.path}
                                        className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-all ${active
                                            ? "border-purple-600 bg-purple-50 text-purple-700"
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
                                {settingsMenuItems.map((item) => {
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

    // Vertical layout (sidebar) - default
    return (
        <MainLayout>
            <div className="flex gap-6 min-h-[calc(100vh-120px)]">
                <aside className={`flex-shrink-0 transition-all duration-300 ${submenuCollapsed ? "w-16" : "w-72"}`}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-pink-600">
                            {!submenuCollapsed && (
                                <div>
                                    <h2 className="text-sm font-bold text-white">Settings</h2>
                                    <p className="text-purple-200 text-xs">Configuration</p>
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
                                {settingsMenuItems.map((item) => {
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
                                                            <p className={`text-sm font-medium truncate ${active ? "text-purple-700" : "text-gray-700"}`}>
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 truncate">{item.description}</p>
                                                        </div>
                                                        {active && <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0" />}
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
