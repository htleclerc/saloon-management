"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PromoCode } from "@/types";

interface PromoCodeContextType {
    promoCodes: PromoCode[];
    addPromoCode: (code: Omit<PromoCode, 'id' | 'usageCount' | 'isActive'>) => void;
    updatePromoCode: (id: number, updates: Partial<PromoCode>) => void;
    deletePromoCode: (id: number) => void;
    validatePromoCode: (code: string) => PromoCode | null;
}

const PromoCodeContext = createContext<PromoCodeContextType | undefined>(undefined);

export function PromoCodeProvider({ children }: { children: ReactNode }) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [mounted, setMounted] = useState(false);

    // Initial load
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("workshop-promos");
        if (saved) {
            try {
                setPromoCodes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse promo codes", e);
            }
        } else {
            // Default Welcome Code
            setPromoCodes([
                { id: 1, code: "WELCOME10", type: "percentage", value: 10, isActive: true, usageCount: 0 }
            ]);
        }
    }, []);

    // Persist
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("workshop-promos", JSON.stringify(promoCodes));
        }
    }, [promoCodes, mounted]);

    const addPromoCode = (data: Omit<PromoCode, 'id' | 'usageCount' | 'isActive'>) => {
        const newCode: PromoCode = {
            ...data,
            id: Date.now(),
            isActive: true,
            usageCount: 0,
            code: data.code.toUpperCase()
        };
        setPromoCodes(prev => [...prev, newCode]);
    };

    const updatePromoCode = (id: number, updates: Partial<PromoCode>) => {
        setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deletePromoCode = (id: number) => {
        setPromoCodes(prev => prev.filter(p => p.id !== id));
    };

    const validatePromoCode = (code: string) => {
        const promo = promoCodes.find(p => p.code === code.toUpperCase() && p.isActive);
        if (!promo) return null;

        // Check expiration
        if (promo.endDate) {
            const today = new Date().toISOString().split('T')[0];
            if (promo.endDate < today) return null;
        }

        return promo;
    };

    return (
        <PromoCodeContext.Provider value={{ promoCodes, addPromoCode, updatePromoCode, deletePromoCode, validatePromoCode }}>
            {children}
        </PromoCodeContext.Provider>
    );
}

export function usePromoCode() {
    const context = useContext(PromoCodeContext);
    if (context === undefined) {
        throw new Error("usePromoCode must be used within a PromoCodeProvider");
    }
    return context;
}
