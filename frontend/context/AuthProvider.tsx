'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getPlanLimits, canCreateSalon } from "@/lib/utils/subscriptionHelpers";
import { UserRole as DomainUserRole, Salon } from "@/types";
import { salonService } from "@/lib/services/SalonService";
import { useDataMode } from "@/context/DataModeProvider";
import { setServiceUserContext, clearServiceUserContext } from "@/lib/services/BaseService";

export type UserRole = DomainUserRole;

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
    primaryColor?: string;
    customPrimaryColor?: string;
    customSecondaryColor?: string;
    useCustomColorOverride?: boolean;
    semanticColorMode?: "default" | "theme" | "custom";
    customSuccessColor?: string;
    customWarningColor?: string;
    customDangerColor?: string;
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
    tenants?: Tenant[];
    isDemo: boolean;
    demoCreatedAt?: string;
    workerId?: string;
    userCode?: string;
    permissions?: WorkerPermissions;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    demoLogin: (role: UserRole) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
    hasExactRole: (requiredRole: UserRole | UserRole[]) => boolean;
    isSuperAdmin: boolean;
    isOwner: boolean;
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
    canAddIncome: () => boolean;
    canAddExpenses: () => boolean;
    canAddServices: () => boolean;
    getWorkerId: () => string | null;
    canCreateNewSalon: () => boolean;
    getSalonLimit: () => number;
    getCurrentSalonCount: () => number;
    isReadOnlyMode: boolean;
    enterReadOnlyMode: (salonId: string, salonName: string, ownerName: string) => void;
    exitReadOnlyMode: () => void;
    toggleReadOnlyMode: () => void;
    enterManageMode: (salonId: string, salonName: string, ownerName: string) => void;
    readOnlySalonInfo: { id: string; name: string; ownerName: string } | null;
    canManageSalon: (salonId: string) => boolean;
    canModify: boolean;
    activeSalonId: string | null;
}

const roleHierarchy: Record<UserRole, number> = {
    super_admin: 5,
    owner: 4,
    manager: 3,
    worker: 2,
    client: 1,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
    const [readOnlySalonInfo, setReadOnlySalonInfo] = useState<{ id: string; name: string; ownerName: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem("workshop-user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.isDemo && parsedUser.demoCreatedAt) {
                    const createdAt = new Date(parsedUser.demoCreatedAt);
                    const now = new Date();
                    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                    if (hoursDiff > 72) {
                        localStorage.removeItem("workshop-user");
                        setUser(null);
                        return;
                    }
                }
                setUser(parsedUser);
                // Sync service layer user context
                setServiceUserContext(parsedUser.userCode || 'SYSTEM', parsedUser.id || null);
            } catch {
                setUser(null);
                clearServiceUserContext();
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (mounted && user) {
            localStorage.setItem("workshop-user", JSON.stringify(user));
            // Keep service layer user context in sync
            setServiceUserContext(user.userCode || 'SYSTEM', user.id || null);
        }
    }, [user, mounted]);

    const login = (userData: User) => {
        setServiceUserContext(userData.userCode || 'SYSTEM', userData.id || null);
        setUser(userData);
    };

    const mapSalonToTenant = (salon: Salon): Tenant => ({
        id: salon.id.toString(),
        name: salon.name,
        slug: salon.slug,
        logo: salon.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(salon.name)}&background=9333ea&color=fff`,
        primaryColor: "#9333ea", // Default or should come from settings
        subscriptionPlan: salon.subscriptionPlan as any,
        subscriptionStatus: salon.subscriptionStatus as any,
    });

    const demoLogin = async (role: UserRole) => {
        let demoTenants: Tenant[] = [];
        if (role === 'super_admin') demoTenants = [];
        else if (role === 'owner') {
            demoTenants = [
                {
                    id: "1",
                    name: "Demo Salon",
                    slug: "demo-salon",
                    logo: "https://ui-avatars.com/api/?name=Demo+Salon&background=9333ea&color=fff",
                    primaryColor: "#9333ea",
                    subscriptionPlan: "pro",
                    subscriptionStatus: "active",
                }
            ];
        } else if (role === 'manager') {
            demoTenants = [
                {
                    id: "1",
                    name: "Demo Salon",
                    slug: "demo-salon",
                    logo: "https://ui-avatars.com/api/?name=DS&background=9333ea&color=fff",
                    primaryColor: "#9333ea",
                    subscriptionPlan: "free",
                    subscriptionStatus: "trial",
                }
            ];
        }

        // Try to fetch real tenants from Supabase/API if not in purely local demo mode
        const dataMode = localStorage.getItem('saloon-data-mode') || 'demo-local';
        if (dataMode !== 'demo-local') {
            try {
                const realSalons = await salonService.getAll();
                if (realSalons.length > 0) {
                    // Filter by mode if we are in demo login
                    const filteredSalons = realSalons.filter(s => s.mode === 'demo');
                    if (filteredSalons.length > 0) {
                        demoTenants = filteredSalons.map(mapSalonToTenant);
                    } else {
                        // Fallback to all if no demo salons found (unlikely)
                        demoTenants = realSalons.map(mapSalonToTenant);
                    }
                }
            } catch (error) {
                console.warn("Could not fetch real salons for demo, falling back to mock:", error);
            }
        }

        const demoUser: User = {
            id: `demo_user_${Date.now()}`,
            name: `Demo ${role}`,
            email: `demo.${role}@workshop.demo`,
            role: role,
            tenantId: demoTenants.length > 0 ? demoTenants[0].id : "",
            tenants: demoTenants.length > 0 ? demoTenants : undefined,
            isDemo: true,
            demoCreatedAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Demo${role}`,
            workerId: role === 'worker' ? '1' : undefined,
            userCode: role === 'worker' ? 'WRK-001' : 'ADM-000',
            permissions: role === 'worker' ? {
                canAddIncome: true,
                canAddExpenses: false,
                canAddServices: true
            } : undefined
        };
        setUser(demoUser);
        localStorage.setItem("workshop-user", JSON.stringify(demoUser));

        // Give a small delay to ensure state is processed before reload if needed, 
        // though window.location.href will interrupt anyway.
        window.location.href = "/";
    };

    const logout = () => {
        setUser(null);
        clearServiceUserContext();
        localStorage.removeItem("workshop-user");
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) setUser({ ...user, ...updates });
    };

    const switchTenant = (tenantId: string) => {
        if (user && user.tenants) {
            const tenant = user.tenants.find(t => t.id === tenantId);
            if (tenant) setUser({ ...user, tenantId });
        }
    };

    const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (roles.includes(user.role)) return true;
        const userLevel = roleHierarchy[user.role];
        return roles.some((role) => userLevel >= roleHierarchy[role]);
    };

    const hasExactRole = (requiredRole: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        return roles.includes(user.role);
    };

    const isSuperAdmin = user?.role === "super_admin";
    const isOwner = user?.role === "owner" || isSuperAdmin;
    const isManager = user?.role === "manager" || isOwner;
    const isWorker = user?.role === "worker" || isManager;
    const isClient = user?.role === "client";

    const isDemoMode = user?.isDemo || false;

    const currentTenant = user?.tenants?.find(t => t.id === user.tenantId) || null;

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

    const canAddIncome = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        if (isManager) return true;
        return user.permissions?.canAddIncome ?? false;
    };

    const canAddExpenses = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        if (isManager) return true;
        return user.permissions?.canAddExpenses ?? false;
    };

    const canAddServices = (): boolean => {
        if (!user || isReadOnlyMode) return false;
        if (isManager) return true;
        return user.permissions?.canAddServices ?? false;
    };

    const getWorkerId = (): string | null => {
        if (!user) return null;
        return user.workerId ?? null;
    };

    const canCreateNewSalon = (): boolean => {
        if (!user || !currentTenant) return false;
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

    const getCurrentSalonCount = (): number => user?.tenants?.length || 0;

    const enterReadOnlyMode = (salonId: string, salonName: string, ownerName: string) => {
        setIsReadOnlyMode(true);
        setReadOnlySalonInfo({ id: salonId, name: salonName, ownerName });
        if (user && user.tenants) {
            const tenant = user.tenants.find(t => t.id === salonId);
            if (tenant) setUser({ ...user, tenantId: salonId });
        }
    };

    const exitReadOnlyMode = () => {
        setIsReadOnlyMode(false);
        setReadOnlySalonInfo(null);
        if (user) setUser({ ...user, tenantId: user.tenants?.[0]?.id || '' });
    };

    const toggleReadOnlyMode = () => setIsReadOnlyMode(prev => !prev);

    const enterManageMode = (salonId: string, salonName: string, ownerName: string) => {
        setIsReadOnlyMode(false);
        setReadOnlySalonInfo({ id: salonId, name: salonName, ownerName });
        if (user && user.tenants) setUser({ ...user, tenantId: salonId });
    };

    const canManageSalon = (salonId: string): boolean => {
        if (!user || !isSuperAdmin) return false;
        if (isDemoMode) return true;
        const salon = user.tenants?.find(t => t.id === salonId);
        return !!salon;
    };

    // Effect to refresh tenants for existing user session
    useEffect(() => {
        const refreshTenants = async () => {
            if (user && mounted) {
                const dataMode = localStorage.getItem('saloon-data-mode') || 'demo-local';
                if (dataMode !== 'demo-local') {
                    try {
                        let salons: Salon[] = [];
                        // For demo mode or super admins, we often want to show all salons available in the DB
                        if (user.role === 'super_admin' || user.isDemo) {
                            const allSalons = await salonService.getAll();
                            if (user.isDemo) {
                                salons = allSalons.filter(s => s.mode === 'demo');
                            } else {
                                salons = allSalons;
                            }
                        } else {
                            // Attempt to parse ID, fallback to 1 for demo purposes if parsing fails
                            const numericId = parseInt(user.id.includes('_') ? user.id.split('_').pop()! : user.id);
                            salons = await salonService.getMySalons(isNaN(numericId) ? 1 : numericId);
                        }

                        if (salons.length > 0) {
                            const newTenants = salons.map(mapSalonToTenant);
                            // Only update if they look different to avoid infinite loops
                            const currentTenantsStr = JSON.stringify(user.tenants || []);
                            const newTenantsStr = JSON.stringify(newTenants);

                            if (newTenantsStr !== currentTenantsStr) {
                                setUser(curr => curr ? {
                                    ...curr,
                                    tenants: newTenants,
                                    tenantId: (curr.tenantId && newTenants.some(t => t.id === curr.tenantId))
                                        ? curr.tenantId
                                        : newTenants[0].id
                                } : null);
                            }
                        }
                    } catch (error) {
                        console.error("Failed to refresh dynamic tenants:", error);
                    }
                }
            }
        };

        if (user && mounted) {
            refreshTenants();
        }
    }, [user?.id, mounted]);

    return (
        <AuthContext.Provider
            value={{
                user, isAuthenticated: !!user, isLoading, login, demoLogin, logout, updateUser,
                hasPermission, hasExactRole, isSuperAdmin, isOwner, isManager, isWorker, isClient, isDemoMode,
                currentTenant, switchTenant, updateTenantColors,
                canAddIncome, canAddExpenses, canAddServices, getWorkerId,
                canCreateNewSalon, getSalonLimit, getCurrentSalonCount,
                isReadOnlyMode, enterReadOnlyMode, exitReadOnlyMode, toggleReadOnlyMode, enterManageMode,
                readOnlySalonInfo, canManageSalon, canModify: !isReadOnlyMode,
                activeSalonId: user?.tenantId ?? null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

interface RequirePermissionProps {
    role: UserRole | UserRole[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequirePermission({ role, children, fallback = null }: RequirePermissionProps) {
    const { hasPermission } = useAuth();
    if (!hasPermission(role)) return <>{fallback}</>;
    return <>{children}</>;
}

