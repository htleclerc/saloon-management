"use client";

import { useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import {
    Users,
    UserPlus,
    FileText,
    BarChart3,
    Calendar,
    DollarSign,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";

const teamMenuItems = [
    {
        id: "overview",
        name: "Overview",
        description: "Dashboard & statistics",
        icon: Users,
        path: "/team",
        exact: true,
        color: "from-[var(--color-primary)] to-[var(--color-primary-dark)]",
    },
    {
        id: "add-simple",
        name: "Add Simple",
        description: "Quick creation",
        icon: UserPlus,
        path: "/team/add",
        color: "from-[var(--color-success)] to-[var(--color-success-dark)]",
    },
    {
        id: "add-advanced",
        name: "Add Advanced",
        description: "Advanced form",
        icon: FileText,
        path: "/team/add-advanced",
        color: "from-[var(--color-secondary)] to-[var(--color-secondary-dark)]",
    },
    {
        id: "performance",
        name: "Performance",
        description: "Tracking & reports",
        icon: BarChart3,
        path: "/team/performance",
        color: "from-[var(--color-warning)] to-[var(--color-warning-dark)]",
    },
    {
        id: "schedules",
        name: "Schedules",
        description: "Schedules & availability",
        icon: Calendar,
        path: "/team/schedules",
        color: "from-[var(--color-info,bg-blue-500)] to-[var(--color-info-dark,bg-blue-700)]",
    },
    {
        id: "payroll",
        name: "Payroll",
        description: "Salary & commissions",
        icon: DollarSign,
        path: "/team/payroll",
        color: "from-[var(--color-success)] opacity-80 to-[var(--color-success-dark)]",
    },
];

interface TeamLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

function TeamLayoutContent({ children, title, description }: TeamLayoutProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const { isMobile } = useResponsive();
    const [submenuCollapsed, setSubmenuCollapsed] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const isActive = (item: typeof teamMenuItems[0]) => {
        // Handle paths with query params (e.g., /team?view=advanced)
        if (item.path.includes("?")) {
            const [itemPath, itemQuery] = item.path.split("?");
            const params = new URLSearchParams(itemQuery);
            const viewParam = params.get("view");
            const currentView = searchParams.get("view");
            return pathname === itemPath && currentView === viewParam;
        }

        if (item.exact) {
            // For exact match, also check that there's no view query param
            return pathname === item.path && !searchParams.get("view");
        }
        return pathname === item.path || pathname.startsWith(item.path + "/");
    };

    const activeItem = teamMenuItems.find(isActive) || teamMenuItems[0];

    // Horizontal layout (tabs)
    if (theme.submenuLayout === "horizontal" && !isMobile) {
        return (
            <MainLayout>
                <div className="space-y-4">
                    {/* Horizontal tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                                <p className="text-gray-500 text-xs">{description}</p>
                            </div>
                        </div>
                        <nav className="flex overflow-x-auto hide-scrollbar">
                            {teamMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);
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

                    {/* Content */}
                    <div className="space-y-4">{children}</div>
                </div>
            </MainLayout>
        );
    }

    // Mobile dropdown
    if (isMobile) {
        return (
            <MainLayout>
                <div className="space-y-4">
                    {/* Mobile dropdown header */}
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
                            {mobileDropdownOpen ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {mobileDropdownOpen && (
                            <nav className="border-t border-gray-100 p-2">
                                {teamMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
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

                    {/* Content */}
                    <div className="space-y-4">{children}</div>
                </div>
            </MainLayout>
        );
    }

    // Vertical layout (sidebar) - default
    return (
        <MainLayout>
            <div className="flex gap-6 min-h-[calc(100vh-120px)]">
                {/* Sidebar */}
                <aside className={`flex-shrink-0 transition-all duration-300 ${submenuCollapsed ? "w-16" : "w-72"}`}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                            {!submenuCollapsed && (
                                <div>
                                    <h2 className="text-sm font-bold text-white">Team</h2>
                                    <p className="text-white opacity-80 text-xs text-purple-200">Team management</p>
                                </div>
                            )}
                            <button
                                onClick={() => setSubmenuCollapsed(!submenuCollapsed)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                            >
                                {submenuCollapsed ? (
                                    <PanelLeft className="w-4 h-4" />
                                ) : (
                                    <PanelLeftClose className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {/* Menu */}
                        <nav className="p-2">
                            <ul className="space-y-1">
                                {teamMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={item.path}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${active ? "bg-[var(--color-primary-light)] border border-[var(--color-primary-light)]" : "hover:bg-gray-50"
                                                    } ${submenuCollapsed ? "justify-center" : ""}`}
                                                title={submenuCollapsed ? item.name : undefined}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} flex-shrink-0 ${active ? "shadow-md" : "opacity-80 group-hover:opacity-100"
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4 text-white" />
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

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="mb-2">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        <p className="text-gray-500 text-xs">{description}</p>
                    </div>
                    <div className="space-y-4">{children}</div>
                </main>
            </div>
        </MainLayout>
    );
}

// Loading fallback for Suspense
function TeamLayoutFallback() {
    return (
        <MainLayout>
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        </MainLayout>
    );
}

export default function TeamLayout(props: TeamLayoutProps) {
    return (
        <Suspense fallback={<TeamLayoutFallback />}>
            <TeamLayoutContent {...props} />
        </Suspense>
    );
}

export { teamMenuItems };
