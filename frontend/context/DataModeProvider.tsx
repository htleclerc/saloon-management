"use client";

import { createContext, useContext, useState, useCallback, useTransition, ReactNode } from "react";
import { DataMode } from "@/lib/providers/types";

interface DataModeContextType {
    mode: DataMode;
    switchMode: (newMode: DataMode) => void;
    isDemo: boolean;
    isSwitching: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

/**
 * DataModeProvider - Manages the application's data mode
 *
 * Allows switching between:
 * - demo-local: localStorage (offline, fast)
 * - demo-supabase: Supabase cloud (online demo, auto-cleanup)
 * - normal: Go API backend (production)
 *
 * Uses React transitions for smooth mode switching without full page reload.
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

    const [isPending, startTransition] = useTransition();

    const switchMode = useCallback((newMode: DataMode) => {
        if (newMode === mode) return;

        // Persist the new mode
        localStorage.setItem("saloon-data-mode", newMode);

        // Use React transition for a smooth switch
        startTransition(() => {
            setMode(newMode);
        });
    }, [mode]);

    const isDemo = mode === "demo-local" || mode === "demo-supabase";

    return (
        <DataModeContext.Provider value={{ mode, switchMode, isDemo, isSwitching: isPending }}>
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
