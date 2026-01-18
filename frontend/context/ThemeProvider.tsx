"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export type SubmenuLayout = "vertical" | "horizontal";
export type DesignType = "modern" | "minimal" | "glassmorphism" | "gradient";
export type FontSize = "small" | "normal" | "large";

// Color palette options with primary and secondary colors
export interface ColorPalette {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    primaryLight: string;
    secondaryLight: string;
}

export const colorPalettes: ColorPalette[] = [
    { id: "purple-pink", name: "Purple & Pink", primary: "#9333ea", secondary: "#ec4899", primaryLight: "#f3e8ff", secondaryLight: "#fce7f3" },
    { id: "blue-cyan", name: "Blue & Cyan", primary: "#3b82f6", secondary: "#06b6d4", primaryLight: "#dbeafe", secondaryLight: "#cffafe" },
    { id: "green-teal", name: "Green & Teal", primary: "#22c55e", secondary: "#14b8a6", primaryLight: "#dcfce7", secondaryLight: "#ccfbf1" },
    { id: "orange-yellow", name: "Orange & Yellow", primary: "#f97316", secondary: "#eab308", primaryLight: "#ffedd5", secondaryLight: "#fef9c3" },
    { id: "red-pink", name: "Red & Pink", primary: "#ef4444", secondary: "#f472b6", primaryLight: "#fee2e2", secondaryLight: "#fce7f3" },
    { id: "indigo-purple", name: "Indigo & Purple", primary: "#6366f1", secondary: "#a855f7", primaryLight: "#e0e7ff", secondaryLight: "#f3e8ff" },
    { id: "slate-blue", name: "Slate & Blue", primary: "#475569", secondary: "#3b82f6", primaryLight: "#f1f5f9", secondaryLight: "#dbeafe" },
    { id: "emerald-lime", name: "Emerald & Lime", primary: "#10b981", secondary: "#84cc16", primaryLight: "#d1fae5", secondaryLight: "#ecfccb" },
];

interface ThemeSettings {
    submenuLayout: SubmenuLayout;
    designType: DesignType;
    sidebarCollapsed: boolean;
    colorPaletteId: string;
    fontFamily: string;
    fontSize: FontSize;
    darkMode: boolean;
    compactMode: boolean;
    animations: boolean;
    transparency: number; // 0.0 to 1.0
}

interface ThemeContextType {
    theme: ThemeSettings;
    updateTheme: (updates: Partial<ThemeSettings>) => void;
    toggleSidebar: () => void;
    toggleDarkMode: () => void;
    currentPalette: ColorPalette;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

const defaultTheme: ThemeSettings = {
    submenuLayout: "vertical",
    designType: "modern",
    sidebarCollapsed: false,
    colorPaletteId: "purple-pink",
    fontFamily: "Open Sans",
    fontSize: "normal",
    darkMode: false,
    compactMode: false,
    animations: true,
    transparency: 0.95,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get current color palette
    const currentPalette = colorPalettes.find(p => p.id === theme.colorPaletteId) || colorPalettes[0];

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("workshop-theme");
        if (savedTheme) {
            try {
                const parsed = JSON.parse(savedTheme);
                setTheme({ ...defaultTheme, ...parsed });
            } catch {
                console.error("Failed to parse saved theme");
            }
        }
    }, []);

    // Dynamic Salon Color Override (if provided by Auth)
    const { currentTenant } = useAuth();

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        localStorage.setItem("workshop-theme", JSON.stringify(theme));

        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme.designType);
        document.documentElement.setAttribute("data-palette", theme.colorPaletteId);
        document.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;

        // Apply color palette CSS variables
        const palette = colorPalettes.find(p => p.id === theme.colorPaletteId) || colorPalettes[0];

        // Priority logic based on useCustomColorOverride flag:
        // - If useCustomColorOverride is true: ONLY custom colors (no palette fallback)
        // - If useCustomColorOverride is false: Tenant logo colors > Palette colors (ignore custom)
        const useCustom = currentTenant?.useCustomColorOverride ?? false;

        const primaryColor = useCustom
            ? (currentTenant?.customPrimaryColor || palette.primary)
            : (currentTenant?.primaryColor || palette.primary);

        const secondaryColor = useCustom
            ? (currentTenant?.customSecondaryColor || palette.secondary)
            : palette.secondary;

        document.documentElement.style.setProperty("--color-primary", primaryColor);
        document.documentElement.style.setProperty("--color-secondary", secondaryColor);

        // For light colors: use custom if override is enabled and custom color exists, otherwise use palette light colors
        const hasCustomPrimary = useCustom && currentTenant?.customPrimaryColor;
        const hasCustomSecondary = useCustom && currentTenant?.customSecondaryColor;
        const hasTenantPrimary = !useCustom && currentTenant?.primaryColor;

        document.documentElement.style.setProperty(
            "--color-primary-light",
            (hasCustomPrimary || hasTenantPrimary) ? `${primaryColor}15` : palette.primaryLight
        );
        document.documentElement.style.setProperty(
            "--color-secondary-light",
            hasCustomSecondary ? `${secondaryColor}15` : palette.secondaryLight
        );

        // Apply font size
        const fontSizes = { small: "14px", normal: "16px", large: "18px" };
        document.documentElement.style.setProperty("--base-font-size", fontSizes[theme.fontSize]);

        // Apply Opacity/Transparency
        document.documentElement.style.setProperty("--bg-opacity", theme.transparency.toString());

        // Dark mode
        if (theme.darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Animations
        if (!theme.animations) {
            document.documentElement.classList.add("no-animations");
        } else {
            document.documentElement.classList.remove("no-animations");
        }
    }, [theme, mounted, currentTenant]);

    const updateTheme = (updates: Partial<ThemeSettings>) => {
        setTheme((prev) => ({ ...prev, ...updates }));
    };

    const toggleSidebar = () => {
        setTheme((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
    };

    const toggleDarkMode = () => {
        setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
    };

    // Always provide the context, even before mount (using default values)
    return (
        <ThemeContext.Provider value={{
            theme,
            updateTheme,
            toggleSidebar,
            toggleDarkMode,
            currentPalette,
            mobileMenuOpen,
            setMobileMenuOpen
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Hook for responsive breakpoints
export function useResponsive() {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 640);
            setIsTablet(width >= 640 && width < 1024);
            setIsDesktop(width >= 1024);
        };

        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    return { isMobile, isTablet, isDesktop };
}
