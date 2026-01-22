"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TipsConfiguration, TipsDistributionRule } from "@/types";

interface TipsContextType {
    configuration: TipsConfiguration;
    updateConfiguration: (updates: Partial<TipsConfiguration>) => void;
    calculateTipSplits: (totalTips: number, workers: { id: number, sharingKey: number }[]) => { workerId: number, amount: number, salonAmount: number }[];
}

const TipsContext = createContext<TipsContextType | undefined>(undefined);

export function TipsProvider({ children }: { children: ReactNode }) {
    const [configuration, setConfiguration] = useState<TipsConfiguration>({
        rule: 'EQUAL_WORKERS',
        salonPercentage: 0,
        isActive: true
    });
    const [mounted, setMounted] = useState(false);

    // Initial load
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("workshop-tips-config");
        if (saved) {
            try {
                setConfiguration(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse tips config", e);
            }
        }
    }, []);

    // Persist
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("workshop-tips-config", JSON.stringify(configuration));
        }
    }, [configuration, mounted]);

    const updateConfiguration = (updates: Partial<TipsConfiguration>) => {
        setConfiguration(prev => ({ ...prev, ...updates }));
    };

    const calculateTipSplits = (totalTips: number, workers: { id: number, sharingKey: number }[]) => {
        if (!configuration.isActive || workers.length === 0) {
            // Default: 100% to workers equally if inactive (or fallback)
            // But wait, if inactive, maybe tips specific field is disabled? 
            // The prompt says "gestion à part qu'on peut désactiver". 
            // If disabled, tips might not be collected or just full manual. 
            // Let's assume if disabled, we default to full worker retention (Equal split among workers is standard behavior)
            const share = totalTips / workers.length;
            return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
        }

        switch (configuration.rule) {
            case 'EQUAL_WORKERS': {
                const share = totalTips / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
            }
            case 'EQUAL_ALL': {
                // Workers + Salon count as one entity? 
                // "partagé équitablement entre les employés (avec ... le salon)"
                // e.g. 2 workers + Salon = 3 shares. 
                const share = totalTips / (workers.length + 1);
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: share / workers.length }));
                // Wait, salon gets 1 share TOTAL. 
                // So Total Salon = share. 
                // We need to return salonAmount PER WORKER for the data structure in AddIncome? 
                // AddIncome sums up salon amounts. 
                // So each worker contributes portion of salon share? 
                // Easier: return structure is per worker. 
                // Worker gets `share`. 
                // Salon gets `share`. 
                // Distribute salon share across workers entries? 
                // Salon amount is global. 
                // Let's divide salon share by N workers to distribute the attribution.
                const salonSharePerWorkerEntry = share / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: salonSharePerWorkerEntry }));
            }
            case 'SALON_KEY': {
                return workers.map(w => {
                    // Uses worker's sharing key (e.g. 50% / 50%)
                    // The tip amount for this worker is... wait, total tips is global. 
                    // We assume tips are split equally first? Or attributed to specific workers?
                    // In AddIncomePage, tips is a global field "Tips". 
                    // So we must assume the tip is for the group. 
                    // So first we split tip equally among workers?. 
                    // THEN apply sharing key on that portion?
                    const baseShare = totalTips / workers.length;
                    const workerPart = (baseShare * w.sharingKey) / 100;
                    const salonPart = baseShare - workerPart;
                    return { workerId: w.id, amount: workerPart, salonAmount: salonPart };
                });
            }
            case 'CUSTOM_PERCENTAGE': {
                const salonPct = configuration.salonPercentage || 0;
                const totalSalon = (totalTips * salonPct) / 100;
                const totalWorkers = totalTips - totalSalon;
                const workerShare = totalWorkers / workers.length;
                const salonSharePerWorkerEntry = totalSalon / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: workerShare, salonAmount: salonSharePerWorkerEntry }));
            }
            case 'POOL': {
                // All to Salon (Pool)
                // Workers get 0
                return workers.map(w => ({ workerId: w.id, amount: 0, salonAmount: totalTips / workers.length }));
            }
            default:
                const share = totalTips / workers.length;
                return workers.map(w => ({ workerId: w.id, amount: share, salonAmount: 0 }));
        }
    };

    return (
        <TipsContext.Provider value={{ configuration, updateConfiguration, calculateTipSplits }}>
            {children}
        </TipsContext.Provider>
    );
}

export function useTips() {
    const context = useContext(TipsContext);
    if (context === undefined) {
        throw new Error("useTips must be used within a TipsProvider");
    }
    return context;
}
