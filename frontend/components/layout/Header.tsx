"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { Bell, User, Search, Sun, Moon, Globe, ChevronDown, ChevronRight, Home, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme, useResponsive } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation, availableLanguages, languageFlags, languageNames, Language } from "@/i18n";
import NotificationsPanel, { Notification } from "./NotificationsPanel";

export default function Header() {
    const pathname = usePathname();
    const { theme, updateTheme, mobileMenuOpen, setMobileMenuOpen } = useTheme();
    const { user } = useAuth();
    const { t, language, setLanguage } = useTranslation();
    const { isMobile, isTablet } = useResponsive();
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Mock notifications data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'validation',
            title: 'Nouvelle demande de congé',
            message: 'Marie Dupont demande 3 jours de congé du 15 au 17 janvier.',
            timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
            isRead: false,
            actions: {
                onView: () => console.log('Voir détails du congé de Marie'),
                onApprove: () => console.log('Congé approuvé pour Marie'),
                onReject: () => console.log('Congé rejeté pour Marie')
            }
        },
        {
            id: '2',
            type: 'validation',
            title: 'Validation de dépense',
            message: 'Jean Martin a soumis une dépense de 125€ pour des fournitures.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
            isRead: false,
            actions: {
                onView: () => console.log('Voir détails de la dépense'),
                onApprove: () => console.log('Dépense approuvée'),
                onReject: () => console.log('Dépense rejetée')
            }
        },
        {
            id: '3',
            type: 'booking',
            title: 'Nouvelle réservation',
            message: 'Client: Sophie Laurent - Box Braids - Demain à 14h00',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            isRead: false
        },
        {
            id: '4',
            type: 'success',
            title: 'Paiement reçu',
            message: 'Paiement de 120€ confirmé pour la réservation #4523',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            isRead: true
        },
        {
            id: '5',
            type: 'warning',
            title: 'Stock faible',
            message: 'Le stock de "Hair Care Products" est inférieur à 10 unités.',
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
            "workers": "Workers",
            "clients": "Clients",
            "services": "Services",
            "expenses": "Expenses",
            "daily": "Daily",
            "reports": "Reports",
            "validation": "Validation",
            "settings": "Settings",
            "add": "Add Worker",
            "add-advanced": "Add Worker (Advanced)",
            "edit": "Edit Worker",
            "edit-advanced": "Edit Worker",
            "detail": "Worker Profile",
            "performance": "Performance",
            "schedules": "Schedules",
            "payroll": "Payroll",
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
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        updateTheme({ darkMode: !theme.darkMode });
    };

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
                        <Link href="/" className="text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0">
                            <Home className="w-5 h-5" />
                        </Link>
                    )}

                    {breadcrumbs.length > 0 && !isMobile && (
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}

                    <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap mask-linear-fade">
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={crumb.path}>
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                                    {crumb.isLink && !isLast ? (
                                        <Link
                                            href={crumb.path}
                                            className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors truncate max-w-[150px]"
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
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto flex-shrink-0">

                    {/* Search bar - hidden on mobile and tablet if needed */}
                    {!isMobile && !isTablet && (
                        <div className="relative mr-2 w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("header.search")}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
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
                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition text-sm ${language === lang ? "bg-purple-50 text-purple-700" : "text-gray-700"
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

                    {/* User Profile */}
                    <div className="flex items-center gap-2 ml-2">
                        {!isMobile && (
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">{user?.name || "Guest"}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role || "Unknown"}</p>
                            </div>
                        )}
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
