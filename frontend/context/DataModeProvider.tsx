"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DataMode } from "@/lib/providers/types";

interface DataModeContextType {
    mode: DataMode;
    switchMode: (newMode: DataMode) => void;
    isDemo: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

/**
 * DataModeProvider - Manages the application's data mode
 * 
 * Allows switching between:
 * - demo-local: localStorage (offline, fast)
 * - demo-supabase: Supabase cloud (online demo, auto-cleanup)
 * - normal: Go API backend (production)
 */
export function DataModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<DataMode>(() => {
        // Server-side rendering safe
        if (typeof window === "undefined") return "demo-local";

        // Try to load from localStorage
        const savedMode = localStorage.getItem("saloon-data-mode");
        if (savedMode === "demo-local" || savedMode === "demo-supabase" || savedMode === "normal") {
            return savedMode;
        }

        // Default to demo-local
        return "demo-local";
    });

    const switchMode = (newMode: DataMode) => {
        if (newMode === mode) return;

        // Save to localStorage
        localStorage.setItem("saloon-data-mode", newMode);

        // Show confirmation and reload
        const confirmed = window.confirm(
            `Switch to ${newMode} mode? This will reload the application.`
        );

        if (confirmed) {
            setMode(newMode);
            window.location.reload();
        }
    };

    const isDemo = mode === "demo-local" || mode === "demo-supabase";

    return (
        <DataModeContext.Provider value={{ mode, switchMode, isDemo }}>
            {children}
        </DataModeContext.Provider>
    );
}

export function useDataMode() {
    const context = useContext(DataModeContext);
    if (context === undefined) {
        throw new Error("useDataMode must be used within a DataModeProvider");
    }
    return context;
}
