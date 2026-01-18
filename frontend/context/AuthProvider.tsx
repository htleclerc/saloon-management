"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    demoLogin: (role: UserRole) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
    hasExactRole: (requiredRole: UserRole | UserRole[]) => boolean;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isWorker: boolean;
    isClient: boolean;
    isDemoMode: boolean;
    currentTenant: Tenant | null;
    switchTenant: (tenantId: string) => void;
    updateTenantColors: (primaryColor?: string, secondaryColor?: string, useOverride?: boolean) => void;
    // Worker-specific permission utilities
    canAddIncome: () => boolean;
    canAddExpenses: () => boolean;
    canAddServices: () => boolean;
    getWorkerId: () => string | null;
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
    const [mounted, setMounted] = useState(false);

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
        const demoTenants: Tenant[] = [
            {
                id: "tenant_1",
                name: "Demo Salon",
                slug: "demo-salon",
                logo: "https://ui-avatars.com/api/?name=DS&background=9333ea&color=fff",
                primaryColor: "#9333ea"
            },
            {
                id: "tenant_2",
                name: "Demo Branch",
                slug: "demo-branch",
                logo: "https://ui-avatars.com/api/?name=DB&background=3b82f6&color=fff",
                primaryColor: "#3b82f6"
            },
            {
                id: "tenant_3",
                name: "Luxury Spa",
                slug: "luxury-spa",
                logo: "https://ui-avatars.com/api/?name=LS&background=22c55e&color=fff",
                primaryColor: "#22c55e"
            }
        ];

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
            tenantId: demoTenants[0].id,
            tenants: role === 'super_admin' || role === 'owner' || role === 'admin' || role === 'manager' ? demoTenants : undefined,
            isDemo: true,
            demoCreatedAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Demo${role}`,
            // For workers, assign a worker ID and permissions
            workerId: role === 'worker' ? 'worker_demo_1' : undefined,
            permissions: role === 'worker' ? {
                canAddIncome: true,  // Demo worker has full permissions
                canAddExpenses: false,  // Demo: can't add expenses
                canAddServices: true
            } : undefined
        };
        setUser(demoUser);
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
    const updateTenantColors = (primaryColor?: string, secondaryColor?: string, useOverride?: boolean) => {
        if (!user || !currentTenant || !user.tenants) return;

        const updatedTenants = user.tenants.map(t => {
            if (t.id === currentTenant.id) {
                return {
                    ...t,
                    customPrimaryColor: primaryColor || undefined,
                    customSecondaryColor: secondaryColor || undefined,
                    useCustomColorOverride: useOverride ?? false,
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
        if (!user) return false;
        // Admins and managers have full permissions
        if (hasPermission(['manager', 'admin'])) return true;
        // Workers need explicit permission
        return user.permissions?.canAddIncome ?? false;
    };

    const canAddExpenses = (): boolean => {
        if (!user) return false;
        // Admins and managers have full permissions
        if (hasPermission(['manager', 'admin'])) return true;
        // Workers need explicit permission
        return user.permissions?.canAddExpenses ?? false;
    };

    const canAddServices = (): boolean => {
        if (!user) return false;
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

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                demoLogin,
                logout,
                updateUser,
                hasPermission,
                hasExactRole,
                isSuperAdmin,
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
