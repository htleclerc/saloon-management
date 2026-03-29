"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
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
    submenuLayout: "horizontal",
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

    // Dynamic Salon Color Override (if provided by Auth)
    const { currentTenant, activeSalonId, user } = useAuth();

    // Build scoped localStorage key per salon + user
    const themeKey = activeSalonId && user?.id
        ? `workshop-theme-${activeSalonId}-${user.id}`
        : null;

    // Skip saving when theme was just loaded from storage
    const skipSaveRef = useRef(false);

    // Load theme from localStorage on mount and when salon/user changes
    useEffect(() => {
        setMounted(true);
        const key = themeKey || "workshop-theme";
        const savedTheme = localStorage.getItem(key);
        if (savedTheme) {
            try {
                skipSaveRef.current = true;
                setTheme({ ...defaultTheme, ...JSON.parse(savedTheme) });
            } catch {
                console.error("Failed to parse saved theme");
            }
        } else if (themeKey) {
            // Scoped key has no data — migrate from global key
            const globalTheme = localStorage.getItem("workshop-theme");
            if (globalTheme) {
                try {
                    skipSaveRef.current = true;
                    setTheme({ ...defaultTheme, ...JSON.parse(globalTheme) });
                } catch { /* ignore */ }
            }
        }
    }, [themeKey]);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        // Save to scoped key only (skip when auth not ready or when just loaded)
        if (themeKey) {
            if (skipSaveRef.current) {
                skipSaveRef.current = false;
            } else {
                localStorage.setItem(themeKey, JSON.stringify(theme));
            }
        }

        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme.designType);
        document.documentElement.setAttribute("data-palette", theme.colorPaletteId);
        document.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;

        // Apply color palette CSS variables
        const palette = colorPalettes.find(p => p.id === theme.colorPaletteId) || colorPalettes[0];

        // Priority logic based on useCustomColorOverride flag:
        // - If useCustomColorOverride is true: custom colors (fallback to palette)
        // - If useCustomColorOverride is false: palette colors
        const useCustom = currentTenant?.useCustomColorOverride ?? false;

        const primaryColor = useCustom
            ? (currentTenant?.customPrimaryColor || palette.primary)
            : palette.primary;

        const secondaryColor = useCustom
            ? (currentTenant?.customSecondaryColor || palette.secondary)
            : palette.secondary;

        document.documentElement.style.setProperty("--color-primary", primaryColor);
        document.documentElement.style.setProperty("--color-secondary", secondaryColor);

        // For light colors: use custom hex+opacity if override is enabled, otherwise palette light colors
        const hasCustomPrimary = useCustom && currentTenant?.customPrimaryColor;
        const hasCustomSecondary = useCustom && currentTenant?.customSecondaryColor;

        document.documentElement.style.setProperty(
            "--color-primary-light",
            hasCustomPrimary ? `${primaryColor}15` : palette.primaryLight
        );
        document.documentElement.style.setProperty(
            "--color-secondary-light",
            hasCustomSecondary ? `${secondaryColor}15` : palette.secondaryLight
        );

        // --- Semantic Colors (Success, Warning, Danger) ---
        const semanticMode = currentTenant?.semanticColorMode || "default";

        // Defaults from globals.css as fallback
        const standardColors = {
            success: "#22c55e",
            warning: "#f59e0b",
            error: "#ef4444"
        };

        let successColor = standardColors.success;
        let warningColor = standardColors.warning;
        let errorColor = standardColors.error;

        if (semanticMode === "theme") {
            successColor = primaryColor;
            warningColor = secondaryColor;
            errorColor = "#ef4444"; // Danger usually stays red unless customized
        } else if (semanticMode === "custom") {
            successColor = currentTenant?.customSuccessColor || standardColors.success;
            warningColor = currentTenant?.customWarningColor || standardColors.warning;
            errorColor = currentTenant?.customDangerColor || standardColors.error;
        }

        document.documentElement.style.setProperty("--color-success", successColor);
        document.documentElement.style.setProperty("--color-warning", warningColor);
        document.documentElement.style.setProperty("--color-error", errorColor);

        // Generate light variants (15% opacity)
        document.documentElement.style.setProperty("--color-success-light", `${successColor}15`);
        document.documentElement.style.setProperty("--color-warning-light", `${warningColor}15`);
        document.documentElement.style.setProperty("--color-error-light", `${errorColor}15`);

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
    }, [theme, mounted, currentTenant, themeKey]);

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
