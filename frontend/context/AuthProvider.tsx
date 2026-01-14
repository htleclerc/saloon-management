"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "manager" | "worker";

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    demoLogin: (role: UserRole) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
    isAdmin: boolean;
    isManager: boolean;
    isWorker: boolean;
}

// Role hierarchy: admin > manager > worker
const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    worker: 1,
};

// Default mock user for development (admin)
const defaultUser: User = {
    id: "1",
    name: "Admin User",
    email: "admin@workshop.com",
    role: "admin",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(defaultUser);
    const [mounted, setMounted] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem("workshop-user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                setUser(defaultUser);
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
        if (role === 'admin') {
            setUser(defaultUser);
        } else if (role === 'worker') {
            setUser({
                id: "2",
                name: "Demo Worker",
                email: "worker@workshop.com",
                role: "worker",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            });
        }
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

    const isAdmin = user?.role === "admin";
    const isManager = user?.role === "manager" || isAdmin;
    const isWorker = user?.role === "worker" || isManager;

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
                isAdmin,
                isManager,
                isWorker,
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
