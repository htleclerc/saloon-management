'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getPlanLimits, canCreateSalon } from "@/lib/utils/subscriptionHelpers";
import { UserRole as DomainUserRole, Salon } from "@/types";
import { salonService } from "@/lib/services/SalonService";
import { useDataMode } from "@/context/DataModeProvider";
import { supabase } from "@/lib/supabase/client";

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
    currency?: string;
    locale?: string;
}

function deriveLocale(currency: string): string {
    const map: Record<string, string> = {
        'EUR': 'fr-FR',
        'USD': 'en-US',
        'GBP': 'en-GB',
        'XOF': 'fr-SN',
    };
    return map[currency] || 'fr-FR';
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
    updateTenantLogo: (logoUrl: string, colors?: { primary: string; secondary: string }) => void;
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
    // --- New Supabase Auth methods ---
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, salonName?: string) => Promise<void>;
    loginWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    authError: string | null;
}

const roleHierarchy: Record<UserRole, number> = {
    super_admin: 5,
    owner: 4,
    manager: 3,
    worker: 2,
    client: 1,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Generate a random user code for new users.
 */
function generateUserCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'USR';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    code += chars.charAt(sum % 36);
    return code;
}

/**
 * Auto-provision an app user record from a Supabase Auth user.
 * Handles: user by email (invited), or brand new user creation.
 * Returns the user DB id or null on failure.
 */
async function autoProvisionUser(authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): Promise<number | null> {
    try {
        // 1. Check if a user exists by email (invited/pre-created)
        if (authUser.email) {
            const { data: userByEmail } = await supabase
                .from('users')
                .select('id')
                .eq('email', authUser.email)
                .single();

            if (userByEmail) {
                // Link auth_id to the existing user
                await supabase
                    .from('users')
                    .update({
                        auth_id: authUser.id,
                        last_login_at: new Date().toISOString(),
                    })
                    .eq('id', userByEmail.id);
                return userByEmail.id;
            }
        }

        // 2. Create a brand new user record
        const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                auth_id: authUser.id,
                email: authUser.email,
                first_name: firstName,
                last_name: lastName,
                user_code: generateUserCode(),
                role: 'owner',
                is_active: true,
                last_login_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (createError || !newUser) {
            console.error('Error auto-provisioning user:', createError?.message);
            return null;
        }

        return newUser.id;
    } catch (err) {
        console.error('Auto-provision error:', err);
        return null;
    }
}

/**
 * Build an AuthProvider User object from a Supabase Auth session + app DB record.
 */
async function buildUserFromAuthId(authId: string): Promise<User | null> {
    try {
        // Fetch app user by auth_id
        const { data: dbUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authId)
            .single();

        if (error || !dbUser) {
            console.error('[Auth] buildUserFromAuthId failed:', error?.message, error?.code, 'authId:', authId);
            return null;
        }

        // Fetch user's salons via user_salons junction table with joined salon data (single query)
        const { data: userSalonsWithSalon } = await supabase
            .from('user_salons')
            .select('salon_id, role_in_salon, salons(*)')
            .eq('user_id', dbUser.id)
            .eq('is_active', true);

        let tenants: Tenant[] = [];
        let workerRole: string | undefined;

        if (userSalonsWithSalon && userSalonsWithSalon.length > 0) {
            tenants = userSalonsWithSalon
                .filter((us: Record<string, unknown>) => us.salons)
                .map((us: Record<string, unknown>) => {
                    const salon = us.salons as Record<string, unknown>;
                    return {
                        id: String(salon.id),
                        name: String(salon.name || ''),
                        slug: String(salon.slug || ''),
                        logo: salon.logo_url
                            ? String(salon.logo_url)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(String(salon.name || ''))}&background=9333ea&color=fff`,
                        subscriptionPlan: (salon.subscription_plan || 'free') as Tenant['subscriptionPlan'],
                        subscriptionStatus: (salon.subscription_status || 'active') as Tenant['subscriptionStatus'],
                        currency: String(salon.currency || 'EUR'),
                        locale: deriveLocale(String(salon.currency || 'EUR')),
                    };
                });

            // Check if user is a worker in any salon
            const workerEntry = userSalonsWithSalon.find((us: { role_in_salon: string }) => us.role_in_salon === 'Worker');
            if (workerEntry) workerRole = 'worker';
        }

        // For super_admin without user_salons entries, fetch all salons
        // Note: regular owners must have explicit user_salons entries (created during onboarding)
        if (tenants.length === 0 && dbUser.role === 'super_admin') {
            try {
                const allSalons = await salonService.getAll();
                tenants = allSalons.map((salon: Salon) => ({
                    id: salon.id.toString(),
                    name: salon.name,
                    slug: salon.slug,
                    logo: salon.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(salon.name)}&background=9333ea&color=fff`,
                    subscriptionPlan: salon.subscriptionPlan as Tenant['subscriptionPlan'],
                    subscriptionStatus: salon.subscriptionStatus as Tenant['subscriptionStatus'],
                    currency: salon.currency || 'EUR',
                    locale: deriveLocale(salon.currency || 'EUR'),
                }));
            } catch {
                // Silently fail - user may not have salons yet
            }
        }

        const fullName = [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ') || dbUser.email;

        return {
            id: String(dbUser.id),
            name: fullName,
            email: dbUser.email,
            role: dbUser.role as UserRole,
            avatar: dbUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.email}`,
            tenantId: tenants.length > 0 ? tenants[0].id : '',
            tenants: tenants.length > 0 ? tenants : undefined,
            isDemo: false,
            workerId: workerRole ? String(dbUser.id) : undefined,
            userCode: dbUser.user_code || undefined,
        };
    } catch (err) {
        console.error('Error building user from auth_id:', err);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
    const [readOnlySalonInfo, setReadOnlySalonInfo] = useState<{ id: string; name: string; ownerName: string } | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    // --- Initialization: check Supabase session first, then fallback to demo localStorage ---
    useEffect(() => {
        setMounted(true);

        const initAuth = async () => {
            try {
                // 1. Try Supabase Auth session (with timeout to avoid hanging on unreachable server)
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase connection timeout')), 5000)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

                if (session?.user) {
                    console.log('[Auth] Session found for user:', session.user.id, session.user.email);

                    // Stale-while-revalidate: serve cached user instantly, then refresh in background
                    const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
                    const cacheKey = `auth-cache-${session.user.id}`;
                    const cached = sessionStorage.getItem(cacheKey);
                    let usedCache = false;

                    if (cached) {
                        try {
                            const { user: cachedUser, timestamp } = JSON.parse(cached);
                            if (Date.now() - timestamp < AUTH_CACHE_TTL) {
                                console.log('[Auth] Using cached user (stale-while-revalidate)');
                                setUser(cachedUser);
                                setIsLoading(false);
                                usedCache = true;
                                if (!cachedUser.isDemo) {
                                    localStorage.setItem('saloon-data-mode', 'demo-supabase');
                                }
                            }
                        } catch {
                            sessionStorage.removeItem(cacheKey);
                        }
                    }

                    // Build fresh user (foreground if no cache, background if cache was used)
                    const refreshUser = async () => {
                        let appUser = await buildUserFromAuthId(session.user.id);
                        console.log('[Auth] buildUserFromAuthId result:', appUser ? 'found' : 'null');

                        // If no app user found, auto-provision from Supabase Auth user
                        if (!appUser) {
                            console.log('[Auth] Auto-provisioning user...');
                            const provisionedId = await autoProvisionUser(session.user);
                            console.log('[Auth] Auto-provision result:', provisionedId);
                            if (provisionedId) {
                                appUser = await buildUserFromAuthId(session.user.id);
                                console.log('[Auth] buildUserFromAuthId after provision:', appUser ? 'found' : 'null');
                            }
                        }

                        if (appUser) {
                            // Cache the fresh user
                            sessionStorage.setItem(cacheKey, JSON.stringify({ user: appUser, timestamp: Date.now() }));

                            setUser(appUser);
                            if (!usedCache) setIsLoading(false);

                            // Ensure storage mode is set to supabase for real (non-demo) users
                            if (!appUser.isDemo) {
                                localStorage.setItem('saloon-data-mode', 'demo-supabase');
                            }

                            // If user has no tenants, redirect to onboarding (unless already there)
                            if (!appUser.tenants || appUser.tenants.length === 0) {
                                if (!window.location.pathname.startsWith('/onboarding')) {
                                    const salonName = session.user.user_metadata?.salon_name || '';
                                    const onboardingUrl = salonName
                                        ? `/onboarding/setup?salonName=${encodeURIComponent(salonName)}`
                                        : '/onboarding/setup';
                                    window.location.href = onboardingUrl;
                                }
                            }
                        } else if (!usedCache) {
                            console.error('[Auth] Supabase session exists but failed to build app user. Possible RLS issue.');
                        }
                    };

                    if (usedCache) {
                        // Revalidate in background — don't await
                        refreshUser();
                        return;
                    }

                    await refreshUser();
                    return;
                }

                // 2. Fallback to demo mode (localStorage)
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
                                document.cookie = "workshop-demo-active=; Max-Age=0; path=/";
                                setUser(null);
                                setIsLoading(false);
                                return;
                            }
                        }
                        setUser(parsedUser);
                    } catch {
                        setUser(null);
                    }
                }
            } catch (err) {
                // Supabase unreachable — silently fall back to demo/localStorage mode
                console.warn('Supabase auth unavailable, using demo mode:', (err as Error).message);

                // Fallback to demo mode (localStorage) on Supabase failure
                const savedUser = localStorage.getItem("workshop-user");
                if (savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);
                        if (parsedUser.isDemo && parsedUser.demoCreatedAt) {
                            const createdAt = new Date(parsedUser.demoCreatedAt);
                            const now = new Date();
                            const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                            if (hoursDiff <= 72) {
                                setUser(parsedUser);
                            }
                        } else {
                            setUser(parsedUser);
                        }
                    } catch {
                        setUser(null);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // 3. Listen for Supabase auth state changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    if (event === 'SIGNED_IN' && session?.user) {
                        let appUser = await buildUserFromAuthId(session.user.id);

                        // Auto-provision if no app user found
                        if (!appUser) {
                            const provisionedId = await autoProvisionUser(session.user);
                            if (provisionedId) {
                                appUser = await buildUserFromAuthId(session.user.id);
                            }
                        }

                        if (appUser) {
                            // Clear demo mode if switching to real auth
                            localStorage.removeItem("workshop-user");
                            document.cookie = "workshop-demo-active=; Max-Age=0; path=/";
                            setUser(appUser);

                            // If user has no tenants, redirect to onboarding (unless already there)
                            if (!appUser.tenants || appUser.tenants.length === 0) {
                                if (!window.location.pathname.startsWith('/onboarding')) {
                                    const salonName = session.user.user_metadata?.salon_name || '';
                                    const onboardingUrl = salonName
                                        ? `/onboarding/setup?salonName=${encodeURIComponent(salonName)}`
                                        : '/onboarding/setup';
                                    window.location.href = onboardingUrl;
                                }
                            }
                        }
                    } else if (event === 'SIGNED_OUT') {
                        // Only clear if not in demo mode
                        const savedUser = localStorage.getItem("workshop-user");
                        if (!savedUser) {
                            setUser(null);
                        }
                    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                        // Session refreshed, rebuild user in case data changed
                        const appUser = await buildUserFromAuthId(session.user.id);
                        if (appUser) setUser(appUser);
                    }
                } catch (err) {
                    console.warn('Auth state change error (Supabase may be unreachable):', (err as Error).message);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Persist demo user to localStorage
    useEffect(() => {
        if (mounted && user && user.isDemo) {
            localStorage.setItem("workshop-user", JSON.stringify(user));
        }
    }, [user, mounted]);

    // --- Legacy login (for demo mode compatibility) ---
    const login = (userData: User) => setUser(userData);

    const mapSalonToTenant = (salon: Salon): Tenant => ({
        id: salon.id.toString(),
        name: salon.name,
        slug: salon.slug,
        logo: salon.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(salon.name)}&background=9333ea&color=fff`,
        subscriptionPlan: salon.subscriptionPlan as Tenant['subscriptionPlan'],
        subscriptionStatus: salon.subscriptionStatus as Tenant['subscriptionStatus'],
        currency: salon.currency || 'EUR',
        locale: deriveLocale(salon.currency || 'EUR'),
    });

    // --- Supabase Auth: Email/Password login ---
    const loginWithEmail = useCallback(async (email: string, password: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setAuthError(error.message);
            throw error;
        }
        // onAuthStateChange will handle setting the user
    }, []);

    // --- Supabase Auth: Sign up ---
    const signUp = useCallback(async (email: string, password: string, fullName: string, salonName?: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, salon_name: salonName || '' },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setAuthError(error.message);
            throw error;
        }
        // User needs to confirm email before onAuthStateChange fires
    }, []);

    // --- Supabase Auth: OAuth login (Google, Facebook) ---
    const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setAuthError(error.message);
            throw error;
        }
        // Browser will redirect to OAuth provider
    }, []);

    // --- Supabase Auth: Password reset ---
    const resetPassword = useCallback(async (email: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });
        if (error) {
            setAuthError(error.message);
            throw error;
        }
    }, []);

    // --- Demo login (preserved) ---
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
                    subscriptionPlan: "pro",
                    subscriptionStatus: "active",
                    currency: "EUR",
                    locale: "fr-FR",
                }
            ];
        } else if (role === 'manager') {
            demoTenants = [
                {
                    id: "1",
                    name: "Demo Salon",
                    slug: "demo-salon",
                    logo: "https://ui-avatars.com/api/?name=DS&background=9333ea&color=fff",
                    subscriptionPlan: "free",
                    subscriptionStatus: "trial",
                    currency: "EUR",
                    locale: "fr-FR",
                }
            ];
        }

        // Try to fetch real tenants from Supabase/API if not in purely local demo mode
        const dataMode = localStorage.getItem('saloon-data-mode') || 'demo-local';
        if (dataMode !== 'demo-local') {
            try {
                const realSalons = await salonService.getAll();
                if (realSalons.length > 0) {
                    const filteredSalons = realSalons.filter(s => s.mode === 'demo');
                    if (filteredSalons.length > 0) {
                        demoTenants = filteredSalons.map(mapSalonToTenant);
                    } else {
                        demoTenants = realSalons.map(mapSalonToTenant);
                    }
                }
            } catch (error) {
                console.warn("Could not fetch real salons for demo, falling back to mock:", error);
            }
        }

        // Preserve logo and custom colors from previous demo session
        try {
            const prevUser = JSON.parse(localStorage.getItem('workshop-user') || '{}') as Partial<User>;
            if (prevUser.tenants && prevUser.tenants.length > 0) {
                const prevTenantMap = new Map(prevUser.tenants.map(t => [t.id, t]));
                demoTenants = demoTenants.map(t => {
                    const prev = prevTenantMap.get(t.id);
                    if (prev) {
                        return {
                            ...t,
                            logo: prev.logo || t.logo,
                            customPrimaryColor: prev.customPrimaryColor,
                            customSecondaryColor: prev.customSecondaryColor,
                            useCustomColorOverride: prev.useCustomColorOverride,
                            semanticColorMode: prev.semanticColorMode,
                            customSuccessColor: prev.customSuccessColor,
                            customWarningColor: prev.customWarningColor,
                            customDangerColor: prev.customDangerColor,
                        };
                    }
                    return t;
                });
            }
        } catch {
            // Ignore parse errors
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

        // Set demo cookie for middleware to recognize demo sessions
        document.cookie = "workshop-demo-active=true; path=/; max-age=259200"; // 72 hours

        window.location.href = "/";
    };

    // --- Logout (handles both real auth and demo) ---
    const logout = async () => {
        // Clear client-side state immediately
        setUser(null);
        localStorage.removeItem("workshop-user");
        sessionStorage.clear(); // Clear auth cache
        document.cookie = "workshop-demo-active=; Max-Age=0; path=/";

        try {
            // Sign out client-side first
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[Auth] signOut exception:', err);
        }

        // Use server-side logout route to clear HTTP-only cookies reliably
        // This also handles the redirect to /login
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/auth/logout';
        document.body.appendChild(form);
        form.submit();
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            if (user.isDemo) {
                localStorage.setItem("workshop-user", JSON.stringify(updatedUser));
            }
        }
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

    const updateTenantLogo = (logoUrl: string, colors?: { primary: string; secondary: string }) => {
        if (!user || !currentTenant || !user.tenants) return;
        const updatedTenants = user.tenants.map(t => {
            if (t.id === currentTenant.id) {
                const updated: Tenant = { ...t, logo: logoUrl };
                if (colors) {
                    updated.customPrimaryColor = colors.primary;
                    updated.customSecondaryColor = colors.secondary;
                    updated.useCustomColorOverride = true;
                }
                return updated;
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
                        if (user.role === 'super_admin' || user.isDemo) {
                            const allSalons = await salonService.getAll();
                            if (user.isDemo) {
                                salons = allSalons.filter(s => s.mode === 'demo');
                            } else {
                                salons = allSalons;
                            }
                        } else {
                            const numericId = parseInt(user.id.includes('_') ? user.id.split('_').pop()! : user.id);
                            salons = await salonService.getMySalons(isNaN(numericId) ? 1 : numericId);
                        }

                        if (salons.length > 0) {
                            const newTenants = salons.map(mapSalonToTenant);
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
                currentTenant, switchTenant, updateTenantColors, updateTenantLogo,
                canAddIncome, canAddExpenses, canAddServices, getWorkerId,
                canCreateNewSalon, getSalonLimit, getCurrentSalonCount,
                isReadOnlyMode, enterReadOnlyMode, exitReadOnlyMode, toggleReadOnlyMode, enterManageMode,
                readOnlySalonInfo, canManageSalon, canModify: !isReadOnlyMode,
                activeSalonId: user?.tenantId ?? null,
                // New Supabase Auth methods
                loginWithEmail, signUp, loginWithOAuth, resetPassword, authError,
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
