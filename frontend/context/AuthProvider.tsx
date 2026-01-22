"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPlanLimits, canCreateSalon } from "@/lib/utils/subscriptionHelpers";

export type UserRole = "super_admin" | "owner" | "admin" | "manager" | "worker" | "client";

// Worker-specific permissions
export interface WorkerPermissions {
    canAddIncome: boolean;
    canAddExpenses: boolean;
    canAddServices: boolean;
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    primaryColor?: string; // Hex color from logo/default
    customPrimaryColor?: string; // User-selected custom color (overrides primaryColor)
    customSecondaryColor?: string; // User-selected custom secondary color
    useCustomColorOverride?: boolean; // Whether to use custom colors instead of palette
    semanticColorMode?: "default" | "theme" | "custom";
    customSuccessColor?: string;
    customWarningColor?: string;
    customDangerColor?: string;
    // Subscription fields
    subscriptionPlan?: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
    subscriptionStatus?: 'active' | 'trial' | 'expired' | 'cancelled';
}

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    tenantId: string;
    tenants?: Tenant[]; // For owners/admins with multiple salons
    isDemo: boolean;
    demoCreatedAt?: string; // ISO timestamp for demo mode expiry
    workerId?: string; // Worker profile ID for filtering data
    permissions?: WorkerPermissions; // Worker-specific permissions
    onboardingCompleted?: boolean; // Whether user has completed onboarding
    onboardingStep?: number; // Current step for resuming onboarding
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    demoLogin: (role: UserRole) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
    hasExactRole: (requiredRole: UserRole | UserRole[]) => boolean;
    isSuperAdmin: boolean;
    isOwner: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isWorker: boolean;
    isClient: boolean;
    isDemoMode: boolean;
    currentTenant: Tenant | null;
    switchTenant: (tenantId: string) => void;
    updateTenantColors: (
        primaryColor?: string,
        secondaryColor?: string,
        useOverride?: boolean,
        semanticMode?: "default" | "theme" | "custom",
        success?: string,
        warning?: string,
        danger?: string
    ) => void;
    // Worker-specific permission utilities
    canAddIncome: () => boolean;
    canAddExpenses: () => boolean;
    canAddServices: () => boolean;
    getWorkerId: () => string | null;
    // Multi-salon & subscription utilities
    canCreateNewSalon: () => boolean;
    getSalonLimit: () => number;
    getCurrentSalonCount: () => number;
    // Read-only mode for super admin
    isReadOnlyMode: boolean;
    enterReadOnlyMode: (salonId: string, salonName: string, ownerName: string) => void;
    exitReadOnlyMode: () => void;
    toggleReadOnlyMode: () => void;
    enterManageMode: (salonId: string, salonName: string, ownerName: string) => void;
    readOnlySalonInfo: { id: string; name: string; ownerName: string } | null;
    // Check if super admin has manage rights on a salon
    canManageSalon: (salonId: string) => boolean;
    // Centralized modification check (respects Read-Only mode)
    canModify: boolean;
}

// Role hierarchy: super_admin > owner > admin > manager > worker > client
const roleHierarchy: Record<UserRole, number> = {
    super_admin: 6,
    owner: 5,
    admin: 4,
    manager: 3,
    worker: 2,
    client: 1,
};

// Default mock user for development (admin)
const defaultUser: User = {
    id: "1",
    name: "Admin User",
    email: "admin@workshop.com",
    role: "admin",
    tenantId: "tenant_1",
    tenants: [
        { id: "tenant_1", name: "Main Salon", slug: "main-salon" },
        { id: "tenant_2", name: "Downtown Branch", slug: "downtown-branch" }
    ],
    isDemo: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
    const [readOnlySalonInfo, setReadOnlySalonInfo] = useState<{ id: string; name: string; ownerName: string } | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem("workshop-user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Check if demo mode has expired (72 hours)
                if (parsedUser.isDemo && parsedUser.demoCreatedAt) {
                    const createdAt = new Date(parsedUser.demoCreatedAt);
                    const now = new Date();
                    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                    if (hoursDiff > 72) {
                        // Demo expired, logout
                        localStorage.removeItem("workshop-user");
                        setUser(null);
                        return;
                    }
                }
                setUser(parsedUser);
            } catch {
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage
    useEffect(() => {
        if (mounted && user) {
            localStorage.setItem("workshop-user", JSON.stringify(user));
        }
    }, [user, mounted]);

    const login = (userData: User) => {
        setUser(userData);
    };

    const demoLogin = (role: UserRole) => {
        let demoTenants: Tenant[] = [];

        // Super admin has no salons, only access to admin panel
        if (role === 'super_admin') {
            demoTenants = [];
        }
        // Owner gets 2 demo salons with Pro plan
        else if (role === 'owner') {
            demoTenants = [
                {
                    id: "salon-elegance-paris",
                    name: "Salon Élégance Paris",
                    slug: "elegance-paris",
                    logo: "https://ui-avatars.com/api/?name=Elegance+Paris&background=9333ea&color=fff",
                    primaryColor: "#9333ea",
                    subscriptionPlan: "pro",
                    subscriptionStatus: "active",
                },
                {
                    id: "salon-moderne-lyon",
                    name: "Coiffure Moderne Lyon",
                    slug: "moderne-lyon",
                    logo: "https://ui-avatars.com/api/?name=Moderne+Lyon&background=3b82f6&color=fff",
                    primaryColor: "#3b82f6",
                    subscriptionPlan: "pro",
                    subscriptionStatus: "active",
                },
            ];
        }
        // Admin and Manager get multiple tenants with Free plan
        else if (role === 'admin' || role === 'manager') {
            demoTenants = [
                {
                    id: "tenant_1",
                    name: "Demo Salon",
                    slug: "demo-salon",
                    logo: "https://ui-avatars.com/api/?name=DS&background=9333ea&color=fff",
                    primaryColor: "#9333ea",
                    subscriptionPlan: "free",
                    subscriptionStatus: "trial",
                },
                {
                    id: "tenant_2",
                    name: "Demo Branch",
                    slug: "demo-branch",
                    logo: "https://ui-avatars.com/api/?name=DB&background=3b82f6&color=fff",
                    primaryColor: "#3b82f6",
                    subscriptionPlan: "free",
                    subscriptionStatus: "trial",
                },
            ];
        }
        // Worker and Client get single salon with Free plan
        else {
            demoTenants = [
                {
                    id: "tenant_1",
                    name: "Mon Salon Demo",
                    slug: "demo-salon",
                    logo: "https://ui-avatars.com/api/?name=DS&background=9333ea&color=fff",
                    primaryColor: "#9333ea",
                    subscriptionPlan: "free",
                    subscriptionStatus: "trial",
                }
            ];
        }

        const getRoleName = (r: UserRole): string => {
            switch (r) {
                case 'super_admin': return 'Super Admin';
                case 'owner': return 'Demo Owner';
                case 'admin': return 'Demo Admin';
                case 'manager': return 'Demo Manager';
                case 'worker': return 'Demo Worker';
                case 'client': return 'Demo Client';
            }
        };

        const demoUser: User = {
            id: `demo_user_${Date.now()}`,
            name: getRoleName(role),
            email: `demo.${role}@workshop.demo`,
            role: role,
            tenantId: demoTenants.length > 0 ? demoTenants[0].id : "",
            tenants: demoTenants.length > 0 ? demoTenants : undefined,
            isDemo: true,
            demoCreatedAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Demo${role}`,
            // For workers, assign a worker ID and permissions (using '1' to match Orphelia in mock data)
            workerId: role === 'worker' ? '1' : undefined,
            permissions: role === 'worker' ? {
                canAddIncome: true,  // Demo worker has full permissions
                canAddExpenses: false,  // Demo: can't add expenses
                canAddServices: true
            } : undefined
        };
        setUser(demoUser);
        localStorage.setItem("workshop-user", JSON.stringify(demoUser));
        window.location.href = "/";
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("workshop-user");
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    const switchTenant = (tenantId: string) => {
        if (user && user.tenants) {
            const tenant = user.tenants.find(t => t.id === tenantId);
            if (tenant) {
                // In demo mode, simulate an "other set of demo data" by potentially 
                // changing some user properties or triggering a global state reset
                if (user.isDemo) {
                    console.log(`Demo Mode: Switching dataset to ${tenant.name}...`);
                    // Here we could simulate variations: 
                    // e.g. change name slightly or set a flag to components
                    setUser({
                        ...user,
                        tenantId,
                        name: `Demo ${tenant.name.split(' ')[1] || 'User'}`
                    });
                } else {
                    // Normal mode: Standard tenant switch (Backend would handle data isolation)
                    setUser({ ...user, tenantId });
                }
            }
        }
    };

    /**
     * Check if user has required permission
     * @param requiredRole - Single role or array of roles that can access
     * @returns boolean - true if user has permission
     */
    const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
        if (!user) return false;

        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // Check if user's role is in the allowed roles
        if (roles.includes(user.role)) return true;

        // Check hierarchy - higher roles can access lower role features
        const userLevel = roleHierarchy[user.role];
        return roles.some((role) => userLevel >= roleHierarchy[role]);
    };

    /**
     * Check if user has the exact role (no hierarchy check)
     * @param requiredRole - Single role or array of roles
     * @returns boolean - true if user has exact role match
     */
    const hasExactRole = (requiredRole: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        return roles.includes(user.role);
    };

    const isSuperAdmin = user?.role === "super_admin";
    const isOwner = user?.role === "owner" || isSuperAdmin;
    const isAdmin = user?.role === "admin" || isOwner;
    const isManager = user?.role === "manager" || isAdmin;
    const isWorker = user?.role === "worker" || isManager;
    const isClient = user?.role === "client";
    const isDemoMode = user?.isDemo || false;

    // Get current tenant
    const currentTenant = user?.tenants?.find(t => t.id === user.tenantId) || null;

    // Update tenant custom colors
    const updateTenantColors = (
        primaryColor?: string,
        secondaryColor?: string,
        useOverride?: boolean,
        semanticMode?: "default" | "theme" | "custom",
        success?: string,
        warning?: string,
        danger?: string
    ) => {
        if (!user || !currentTenant || !user.tenants) return;

        const updatedTenants = user.tenants.map(t => {
            if (t.id === currentTenant.id) {
                return {
                    ...t,
                    customPrimaryColor: primaryColor || undefined,
                    customSecondaryColor: secondaryColor || undefined,
                    useCustomColorOverride: useOverride ?? false,
                    semanticColorMode: semanticMode || undefined,
                    customSuccessColor: success || undefined,
                    customWarningColor: warning || undefined,
                    customDangerColor: danger || undefined,
                };
            }
            return t;
        });

        const updatedUser = { ...user, tenants: updatedTenants };
        setUser(updatedUser);
        localStorage.setItem("workshop-user", JSON.stringify(updatedUser));
    };

    // Worker permission utilities
    const canAddIncome = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        // Admins and managers have full permissions
        if (hasPermission(['manager', 'admin'])) return true;
        // Workers need explicit permission
        return user.permissions?.canAddIncome ?? false;
    };

    const canAddExpenses = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        // Admins and managers have full permissions
        if (hasPermission(['manager', 'admin'])) return true;
        // Workers need explicit permission
        return user.permissions?.canAddExpenses ?? false;
    };

    const canAddServices = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        // Admins and managers have full permissions
        if (hasPermission(['manager', 'admin'])) return true;
        // Workers need explicit permission
        return user.permissions?.canAddServices ?? false;
    };

    const getWorkerId = (): string | null => {
        if (!user) return null;
        // Return workerId for workers, null for other roles
        return user.workerId ?? null;
    };

    // Multi-salon & subscription utilities
    const canCreateNewSalon = (): boolean => {
        if (!user || !currentTenant) return false;
        // Super admins can always create salons
        if (isSuperAdmin) return true;

        const salonCount = user.tenants?.length || 0;
        const plan = currentTenant.subscriptionPlan || 'free';
        const limits = getPlanLimits(plan);

        return canCreateSalon(salonCount, limits.maxSalons);
    };

    const getSalonLimit = (): number => {
        if (!currentTenant) return 1;
        const plan = currentTenant.subscriptionPlan || 'free';
        const limits = getPlanLimits(plan);
        return limits.maxSalons;
    };

    const getCurrentSalonCount = (): number => {
        return user?.tenants?.length || 0;
    };

    // Read-only mode functions
    const enterReadOnlyMode = (salonId: string, salonName: string, ownerName: string) => {
        setIsReadOnlyMode(true);
        setReadOnlySalonInfo({ id: salonId, name: salonName, ownerName });
        // Switch to the salon tenant
        if (user && user.tenants) {
            const tenant = user.tenants.find(t => t.id === salonId);
            if (tenant) {
                setUser({ ...user, tenantId: salonId });
            }
        }
    };

    const exitReadOnlyMode = () => {
        setIsReadOnlyMode(false);
        setReadOnlySalonInfo(null);
        // Return to admin view (no specific tenant)
        if (user) {
            setUser({ ...user, tenantId: user.tenants?.[0]?.id || '' });
        }
    };

    const toggleReadOnlyMode = () => {
        setIsReadOnlyMode(prev => !prev);
    };

    const enterManageMode = (salonId: string, salonName: string, ownerName: string) => {
        setIsReadOnlyMode(false);
        setReadOnlySalonInfo({ id: salonId, name: salonName, ownerName });
        // Switch to the salon tenant
        if (user && user.tenants) {
            setUser({ ...user, tenantId: salonId });
        }
    };

    // Check if super admin has manage rights on a specific salon
    // In demo mode, this is simulated by checking if the salon has the super admin as an admin user
    // In real mode, this would check the database
    const canManageSalon = (salonId: string): boolean => {
        if (!user || !isSuperAdmin) return false;

        // In demo mode: permit management for representative salons
        if (isDemoMode) {
            const manageableIds = [
                'salon-elegance-paris',
                'salon-retro-bordeaux',
                'salon-zen-strasbourg',
                'salon-vintage-lille',
                'tenant_1' // Also the default demo salon
            ];
            return manageableIds.includes(salonId);
        }

        // In real mode: check if the salon is in the user's tenants (explicitly authorized)
        const salon = user.tenants?.find(t => t.id === salonId);
        if (!salon) return false;
        return (salon as any).superAdminCanManage === true;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                demoLogin,
                logout,
                updateUser,
                hasPermission,
                hasExactRole,
                isSuperAdmin,
                isOwner,
                isAdmin,
                isManager,
                isWorker,
                isClient,
                isDemoMode,
                currentTenant,
                switchTenant,
                updateTenantColors,
                // Worker permission utilities
                canAddIncome,
                canAddExpenses,
                canAddServices,
                getWorkerId,
                // Multi-salon & subscription utilities
                canCreateNewSalon,
                getSalonLimit,
                getCurrentSalonCount,
                // Read-only mode
                isReadOnlyMode,
                enterReadOnlyMode,
                exitReadOnlyMode,
                toggleReadOnlyMode,
                enterManageMode,
                readOnlySalonInfo,
                canManageSalon,
                // Centralized modification check
                canModify: !isReadOnlyMode
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Permission check component for conditional rendering
interface RequirePermissionProps {
    role: UserRole | UserRole[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequirePermission({ role, children, fallback = null }: RequirePermissionProps) {
    const { hasPermission } = useAuth();

    if (!hasPermission(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
