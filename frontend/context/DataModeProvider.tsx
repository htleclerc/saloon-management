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

    const switchMode = async (newMode: DataMode) => {
        if (newMode === mode) return;

        // Since this causes a full reload, and we are inside a provider that might be above ConfirmProvider,
        // we should check if we can access the confirm context. 
        // If this provider is wrapping the app, we might need to handle this differently.
        // However, for now, let's assume we can use the confirm dialog if we move this logic or if we accept that
        // this specific action might need a different UX.

        // But the user specifically complained about THIS alert.
        // "il reste encore des alertes" and showed this one.

        // Let's try to use valid UI.
        // We will persist the pending mode and show a UI, or use useConfirm if available.
        // But we can't use useConfirm inside DataModeProvider if DataModeProvider wraps ConfirmProvider.

        localStorage.setItem("saloon-data-mode", newMode);
        setMode(newMode);
        window.location.reload();
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
