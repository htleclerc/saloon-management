"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Calendar,
    Building,
    Bell,
    Moon,
    Sun,
    LogOut,
    ChevronDown,
    FlaskConical,
    Heart,
    Compass,
    CalendarCheck,
    Sliders,
    CreditCard,
    BarChart3,
    MessageCircle,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Daily", icon: TrendingUp, path: "/daily", roles: ['manager', 'admin', 'worker'] },
    { name: "Income", icon: DollarSign, path: "/income", roles: ['manager', 'admin', 'worker'] },
    { name: "Team", icon: Users, path: "/team", roles: ['manager', 'admin'] },
    { name: "My Invoices", icon: FileText, path: "/client/invoices", roles: ['client'], strictRoles: true },
    { name: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { name: "Calendar", icon: Calendar, path: "/calendar", roles: ['manager', 'admin'] },
    { name: "Clients", icon: UserCheck, path: "/clients", roles: ['manager', 'admin'] },
    { name: "Expenses", icon: Receipt, path: "/expenses", roles: ['manager', 'admin'] },
    { name: "Approvals", icon: CheckSquare, path: "/approvals", roles: ['manager', 'admin'] },
    { name: "Services", icon: Scissors, path: "/services", roles: ['manager', 'admin', 'worker'] },
    { name: "Reports", icon: FileText, path: "/reports", roles: ['manager', 'admin'] },
    { name: "Configuration", icon: Sliders, path: "/configuration", roles: ['manager', 'admin'] },
    { name: "Favorites", icon: Heart, path: "/salons/favorites", roles: ['client'], strictRoles: true },
    { name: "Discover", icon: Compass, path: "/salons/discover", roles: ['client'], strictRoles: true },
    { name: "Settings", icon: Settings, path: "/settings" },
];

// Super Admin Menu (SaaS CEO view)
const superAdminMenuItems = [
    { name: "Global Dashboard", icon: LayoutDashboard, path: "/superadmin", badge: 'SaaS' },
    { name: "Salons", icon: Building, path: "/superadmin/salons" },
    { name: "Plans", icon: CreditCard, path: "/superadmin/plans" },
    { name: "Users", icon: Users, path: "/superadmin/users" },
    { name: "Analytics", icon: BarChart3, path: "/superadmin/analytics" },
    { name: "Revenue", icon: DollarSign, path: "/superadmin/billing" },
    { name: "Support", icon: MessageCircle, path: "/superadmin/support" },
    { name: "System", icon: Settings, path: "/superadmin/settings" },
];

import { useAuth } from "@/context/AuthProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleSidebar, toggleDarkMode, currentPalette, mobileMenuOpen, setMobileMenuOpen } = useTheme();
    const { isMobile, isTablet } = useResponsive();
    const {
        user,
        hasPermission,
        hasExactRole,
        demoLogin,
        logout,
        currentTenant,
        switchTenant,
        isDemoMode,
        canAddIncome,
        isSuperAdmin,
        isReadOnlyMode
    } = useAuth();
    const [showTenantDropdown, setShowTenantDropdown] = useState(false);

    // Determine which menu to show:
    // - Super admin on /admin routes: SHOW SUPER ADMIN MENU
    // - Super admin on other routes (viewing salon): SHOW REGULAR MENU
    // - Regular users: SHOW REGULAR MENU
    const isSuperAdminRoute = pathname.startsWith('/superadmin');
    const activeMenuItems = (isSuperAdmin && isSuperAdminRoute) ? superAdminMenuItems : menuItems;

    // Dynamic gradient style using CSS variables (respects custom override)
    const sidebarGradient = {
        background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
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
            {/* Header / Brand */}
            <div className={`flex items-center ${isCollapsed && !isMobile ? "justify-center" : "justify-between gap-3"} mb-6`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 flex-shrink-0 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                        {currentTenant?.logo ? (
                            <img src={currentTenant.logo} alt={currentTenant.name} className="w-full h-full object-cover" />
                        ) : (
                            <FlaskConical className="w-5 h-5 text-white" />
                        )}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-sm font-bold text-white truncate leading-tight">
                                {currentTenant?.name || "Workshop Manager"}
                            </h1>
                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">
                                {isDemoMode ? "Demo Mode" : "Workspace"}
                            </span>
                        </div>
                    )}
                </div>

                {isMobile ? (
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 text-white/70 hover:text-white"
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
                    {activeMenuItems.map((item) => {
                        // We only skip role filtering if we are explicitly rendering the Super Admin specific menu
                        // Otherwise (when Super Admin uses View/Manage toggle to see normal menu), we MUST apply role checks
                        // to prevent them from seeing Client/Worker specific items unless they have those roles.
                        const isSuperAdminList = activeMenuItems === superAdminMenuItems;

                        if (!isSuperAdminList) {
                            // Role-based visibility check for regular menu
                            // Use has ExactRole for strict role matching (e.g., client-only menus)
                            // Use hasPermission for hierarchical role matching (e.g., admin can see manager menus)
                            if ('roles' in item && item.roles) {
                                const hasAccess = (item as any).strictRoles
                                    ? hasExactRole(item.roles as any)
                                    : hasPermission(item.roles as any);
                                if (!hasAccess) return null;
                            }

                            // Additional logic for Income - although roles should cover it
                            if (item.name === "Income" && !canAddIncome()) {
                                // Only hide if worker doesn't have explicit permission and is not manager/admin
                                if (!hasPermission(['manager', 'admin'])) return null;
                            }
                        }

                        const Icon = item.icon;
                        const isActive = pathname === item.path ||
                            (item.path !== "/" && item.path !== "/superadmin" && pathname.startsWith(item.path));
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
                                        <span className="font-medium text-sm flex-1">{item.name}</span>
                                    )}
                                    {(!isCollapsed || isMobile) && (item as any).badge && (
                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                                            {(item as any).badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Demo Role Switcher - only in demo mode and NOT on superadmin paths */}
            {isDemoMode && !isSuperAdminRoute && (
                <div className={`mt-auto pt-4 border-t border-white/10 ${(isCollapsed && !isMobile) ? "hidden" : "block"}`}>
                    <p className="text-xs text-white/50 mb-2 px-3 uppercase font-semibold tracking-wider">Demo Roles</p>
                    <div className="grid grid-cols-2 gap-2 px-3">
                        <button
                            onClick={() => demoLogin('owner')}
                            className="text-xs bg-white/10 hover:bg-white/20 py-2 px-2 rounded-lg text-white transition-colors font-medium"
                        >
                            Owner
                        </button>
                        <button
                            onClick={() => demoLogin('admin')}
                            className="text-xs bg-white/10 hover:bg-white/20 py-2 px-2 rounded-lg text-white transition-colors font-medium"
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => demoLogin('worker')}
                            className="text-xs bg-white/10 hover:bg-white/20 py-2 px-2 rounded-lg text-white transition-colors font-medium"
                        >
                            Worker
                        </button>
                        <button
                            onClick={() => demoLogin('client')}
                            className="text-xs bg-white/10 hover:bg-white/20 py-2 px-2 rounded-lg text-white transition-colors font-medium"
                        >
                            Client
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile-only: Tenant Selector, Notifications, Dark Mode */}
            {isMobile && !isSuperAdminRoute && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {/* Tenant Selector */}
                    {user?.tenants && user.tenants.length > 1 && (
                        <div className="px-3">
                            <p className="text-xs text-white/50 mb-2 uppercase font-semibold tracking-wider">Salon</p>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        <span className="truncate">{currentTenant?.name || 'Select Salon'}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showTenantDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showTenantDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                                        {user.tenants.map((tenant) => (
                                            <button
                                                key={tenant.id}
                                                onClick={() => {
                                                    switchTenant(tenant.id);
                                                    setShowTenantDropdown(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${tenant.id === user.tenantId ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                {tenant.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="px-3 grid grid-cols-2 gap-2">
                        {/* Notifications */}
                        <button className="flex flex-col items-center gap-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="text-xs">Alerts</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-error)] rounded-full"></span>
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="flex flex-col items-center gap-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {theme.darkMode ? (
                                <>
                                    <Sun className="w-5 h-5" />
                                    <span className="text-xs">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-5 h-5" />
                                    <span className="text-xs">Dark</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Logout Button - always visible, positioned totally at the bottom */}
            <div className={`mt-auto pt-4 border-t border-white/10 px-3 pb-6 ${(isCollapsed && !isMobile) ? "px-2" : ""}`}>
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/70 hover:text-white ${(isCollapsed && !isMobile) ? "justify-center px-0" : ""}`}
                    title={(isCollapsed && !isMobile) ? "Logout" : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && (
                        <span className="font-medium text-sm">Logout</span>
                    )}
                </button>
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
