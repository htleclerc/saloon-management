"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { Bell, User, Search, Sun, Moon, Globe, ChevronDown, ChevronRight, Home, Menu, Building, FlaskConical, Settings, LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation, availableLanguages, languageFlags, languageNames, Language } from "@/i18n";
import NotificationsPanel, { Notification } from "./NotificationsPanel";

export default function Header() {
    const pathname = usePathname();
    const { theme, updateTheme, toggleDarkMode, mobileMenuOpen, setMobileMenuOpen } = useTheme();
    const { user, isDemoMode, currentTenant, switchTenant, logout } = useAuth();
    const { t, language, setLanguage } = useTranslation();
    const { isMobile, isTablet } = useResponsive();
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const tenantDropdownRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Mock notifications data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'validation',
            title: 'New leave request',
            message: 'Marie Dupont requested 3 days of leave from Jan 15 to Jan 17.',
            timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
            isRead: false,
            actions: {
                onView: () => console.log('View Marie\'s leave details'),
                onApprove: () => console.log('Approved leave for Marie'),
                onReject: () => console.log('Rejected leave for Marie')
            }
        },
        {
            id: '2',
            type: 'validation',
            title: 'Expense validation',
            message: 'Jean Martin submitted an expense of €125 for supplies.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
            isRead: false,
            actions: {
                onView: () => console.log('View expense details'),
                onApprove: () => console.log('Expense approved'),
                onReject: () => console.log('Expense rejected')
            }
        },
        {
            id: '3',
            type: 'booking',
            title: 'New booking',
            message: 'Client: Sophie Laurent - Box Braids - Tomorrow at 2:00 PM',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            isRead: false
        },
        {
            id: '4',
            type: 'success',
            title: 'Payment received',
            message: 'Payment of €120 confirmed for booking #4523',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            isRead: true
        },
        {
            id: '5',
            type: 'warning',
            title: 'Low stock',
            message: 'The stock of "Hair Care Products" is below 10 units.',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            isRead: true
        }
    ]);

    // Breadcrumbs logic
    const getBreadcrumbs = () => {
        if (pathname === "/") return [];

        const segments = pathname.split("/").filter(Boolean);

        // Special path segment mappings (segment -> display label)
        const pathMappings: Record<string, string> = {
            "team": "Team",
            "clients": "Clients",
            "services": "Services",
            "expenses": "Expenses",
            "daily": "Daily",
            "reports": "Reports",
            "approvals": "Approvals",
            "settings": "Settings",
            "add": "Add",
            "add-advanced": "Add (Advanced)",
            "edit": "Edit",
            "edit-advanced": "Edit",
            "detail": "Profile",
            "performance": "Performance",
            "schedules": "Schedules",
            "payroll": "Payroll",
            "income": "Income",
            "dashboard": "Dashboard",
        };

        // Check if a segment is a dynamic ID (numeric or long string)
        const isDynamicId = (segment: string): boolean => {
            // Check if it's a number
            if (/^\d+$/.test(segment)) return true;
            // Check if it's a long alphanumeric ID (like UUIDs)
            if (segment.length > 20) return true;
            return false;
        };

        // Paths that should not be clickable (intermediate paths needing ID)
        const nonClickablePaths = ["edit", "edit-advanced", "detail"];

        return segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join("/")}`;
            const previousSegment = index > 0 ? segments[index - 1] : null;

            let label = segment;
            let isLink = true;

            // Check if this segment should be non-clickable
            if (nonClickablePaths.includes(segment)) {
                isLink = false;
            }

            // Check if this is a dynamic ID
            if (isDynamicId(segment)) {
                // Don't show ID as label, show a descriptive name based on context
                if (previousSegment === "detail") {
                    label = "Profile";
                } else if (previousSegment === "edit" || previousSegment === "edit-advanced") {
                    label = ""; // Hide ID for edit pages, the previous segment already says "Edit Worker"
                } else {
                    label = "Details";
                }
                isLink = false; // IDs should not be clickable links
            } else if (pathMappings[segment]) {
                label = pathMappings[segment];
            } else {
                // Try to find translation for segment
                if (t(`nav.${segment}`) !== `nav.${segment}`) {
                    label = t(`nav.${segment}`);
                } else if (t(`settings.${segment}`) !== `settings.${segment}`) {
                    label = t(`settings.${segment}`);
                } else if (t(`dashboard.${segment}`) !== `dashboard.${segment}`) {
                    label = t(`dashboard.${segment}`);
                } else if (t(`workers.${segment}`) !== `workers.${segment}`) {
                    label = t(`workers.${segment}`);
                } else {
                    // Formatting for unknown segments
                    label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
                }
            }

            return { label, path, isLink };
        })
            .filter(crumb => crumb.label !== "") // First filter: remove empty labels
            .filter((crumb, index, self) => {
                // Second filter: logic for hiding intermediate non-clickable links
                // We only check against the array of *visible* labels now

                // User request: If a middle link is not clickable, do not display it.
                // Only display the last link (current page) and clickable real links.
                const isLast = index === self.length - 1;
                return crumb.isLink || isLast;
            });
    };

    const breadcrumbs = getBreadcrumbs();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setLangDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
            if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(event.target as Node)) {
                setTenantDropdownOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    // Calculate left margin based on sidebar state
    const getLeftPosition = () => {
        if (isMobile) return "left-0";
        if (theme.sidebarCollapsed || isTablet) return "left-[72px]";
        return "left-64";
    };

    return (
        <header className={`fixed top-0 ${getLeftPosition()} right-0 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300`}>
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">

                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="Navigation"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                {/* Breadcrumbs (Left side) */}
                <div className="hidden md:flex items-center gap-1.5 overflow-hidden">
                    {!isMobile && (
                        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap mask-linear-fade">
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <Fragment key={crumb.path}>
                                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                                        {crumb.isLink && !isLast ? (
                                            <Link
                                                href={crumb.path}
                                                className="text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px]"
                                            >
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className={`text-sm font-medium truncate max-w-[150px] ${isLast ? "text-gray-900" : "text-gray-500"
                                                }`}>
                                                {crumb.label}
                                            </span>
                                        )}
                                    </Fragment>
                                );
                            })}
                            {breadcrumbs.length === 0 && (
                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Dashboard</h2>
                            )}
                        </div>
                    )}
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    {/* Search Bar */}
                    {/* Search Bar - Hidden for now as requested */}
                    <div className="hidden">
                        <div className="hidden lg:flex items-center relative group">
                            <input
                                type="text"
                                placeholder={t("header.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearching(true);
                                    // Simulation loop: clear searching state after a short delay
                                    setTimeout(() => setIsSearching(false), 500);
                                }}
                                className="w-48 xl:w-64 h-10 pl-10 pr-4 bg-gray-100 border-transparent focus:bg-white focus:border-[var(--color-primary-light)] focus:ring-4 focus:ring-[var(--color-primary-light)] rounded-xl text-sm transition-all duration-300 outline-none"
                            />
                            <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${isSearching ? "text-[var(--color-primary)] animate-pulse" : "text-gray-400 group-focus-within:text-[var(--color-primary)]"}`} />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3 text-gray-500" />
                                </button>
                            )}

                            {/* Mock Search Results dropdown if needed */}
                            {searchQuery.length > 2 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold px-2 py-1">Recent Results</p>
                                    <div className="space-y-1">
                                        <button className="w-full text-left px-2 py-2 hover:bg-[var(--color-primary-light)] rounded-lg text-sm text-gray-700 flex items-center gap-2 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                                            <span>Results for "{searchQuery}"...</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Demo Mode Badge */}
                    {isDemoMode && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-sm animate-pulse">
                            <FlaskConical className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold text-white tracking-wide">DEMO MODE</span>
                        </div>
                    )}

                    {/* Tenant Selector - for users with multiple tenants (hidden on mobile) */}
                    {user?.tenants && user.tenants.length > 1 && !isMobile && (
                        <div className="relative" ref={tenantDropdownRef}>
                            <button
                                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-light)] hover:opacity-80 border border-[var(--color-primary-light)] rounded-lg transition text-sm"
                                title="Switch Salon"
                            >
                                <Building className="w-4 h-4 text-[var(--color-primary)]" />
                                <span className="text-[var(--color-primary)] font-medium max-w-[120px] truncate">
                                    {currentTenant?.name || "Select Salon"}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-[var(--color-primary)] transition-transform ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {tenantDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[200px] z-50">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Salons</p>
                                    </div>
                                    {user.tenants.map((tenant) => (
                                        <button
                                            key={tenant.id}
                                            onClick={() => {
                                                switchTenant(tenant.id);
                                                setTenantDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-sm ${user.tenantId === tenant.id ? "bg-[var(--color-primary-light)]" : ""
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.tenantId === tenant.id
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "bg-gray-100 text-gray-600"
                                                }`}>
                                                <Building className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={`font-medium ${user.tenantId === tenant.id ? "text-[var(--color-primary)]" : "text-gray-700"
                                                    }`}>
                                                    {tenant.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{tenant.slug}</p>
                                            </div>
                                            {user.tenantId === tenant.id && (
                                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition text-sm"
                            title={t("header.language")}
                        >
                            <Globe className="w-4 h-4 text-gray-600" />
                            <span className="text-lg">{languageFlags[language]}</span>
                            {!isMobile && (
                                <span className="text-gray-600 text-xs font-medium">{language.toUpperCase()}</span>
                            )}
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>

                        {langDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
                                {availableLanguages.map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setLanguage(lang as Language);
                                            setLangDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition text-sm ${language === lang ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "text-gray-700"
                                            }`}
                                    >
                                        <span className="text-lg">{languageFlags[lang as Language]}</span>
                                        <span>{languageNames[lang as Language]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title={theme.darkMode ? t("header.lightMode") : t("header.darkMode")}
                    >
                        {theme.darkMode ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                            title={t("header.notifications")}
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                                    {notifications.filter(n => !n.isRead).length > 99 ? '99+' : notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <NotificationsPanel
                                notifications={notifications}
                                onMarkAsRead={(id) => {
                                    setNotifications(prev => prev.map(n =>
                                        n.id === id ? { ...n, isRead: true } : n
                                    ));
                                }}
                                onMarkAllAsRead={() => {
                                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                }}
                                onClose={() => setNotificationsOpen(false)}
                            />
                        )}
                    </div>

                    {/* User Profile with Dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center gap-2 ml-2 hover:opacity-80 transition"
                        >
                            {!isMobile && (
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-700">{user?.name || "Guest"}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role || "Unknown"}</p>
                                </div>
                            )}
                            <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </button>

                        {profileDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[180px] z-50">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700">{user?.name || "Guest"}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role || "Unknown"}</p>
                                </div>
                                <Link
                                    href="/settings/profile"
                                    onClick={() => setProfileDropdownOpen(false)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition text-sm text-gray-700"
                                >
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>View Profile</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setProfileDropdownOpen(false)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition text-sm text-gray-700"
                                >
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span>Settings</span>
                                </Link>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 transition text-sm text-red-600"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
