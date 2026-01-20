"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Income, IncomeStatus, IncomeHistoryEvent, IncomeComment } from "@/types";
import { useAuth } from "./AuthProvider";

interface IncomeContextType {
    incomes: Income[];
    addIncome: (income: Omit<Income, 'id' | 'history' | 'comments' | 'hasInvoice'>) => number;
    updateIncome: (id: number, updates: Partial<Income>) => void;
    validateIncome: (id: number, comment?: string) => void;
    addComment: (id: number, text: string) => void;
    getIncomeByBookingId: (bookingId: number) => Income | undefined;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export function IncomeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true);
        const savedIncomes = localStorage.getItem("workshop-incomes");
        if (savedIncomes) {
            try {
                setIncomes(JSON.parse(savedIncomes));
            } catch (e) {
                console.error("Failed to parse incomes", e);
            }
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("workshop-incomes", JSON.stringify(incomes));
        }
    }, [incomes, mounted]);

    const addIncome = (incomeData: Omit<Income, 'id' | 'history' | 'comments' | 'hasInvoice'>) => {
        const id = Date.now();
        const newIncome: Income = {
            ...incomeData,
            id,
            history: [
                {
                    date: new Date().toISOString().replace('T', ' ').substr(0, 16),
                    action: "Created",
                    user: user?.name || "System",
                    comment: incomeData.status === 'Draft' ? "Auto-created from booking" : ""
                }
            ],
            comments: [],
            hasInvoice: false
        };
        setIncomes(prev => [...prev, newIncome]);
        return id;
    };

    const updateIncome = (id: number, updates: Partial<Income>) => {
        setIncomes(prev => prev.map(inc => {
            if (inc.id === id) {
                const event: IncomeHistoryEvent = {
                    date: new Date().toISOString().replace('T', ' ').substr(0, 16),
                    action: "Updated",
                    user: user?.name || "System"
                };
                return {
                    ...inc,
                    ...updates,
                    history: [...inc.history, event]
                };
            }
            return inc;
        }));
    };

    const validateIncome = (id: number, comment?: string) => {
        setIncomes(prev => prev.map(inc => {
            if (inc.id === id) {
                const event: IncomeHistoryEvent = {
                    date: new Date().toISOString().replace('T', ' ').substr(0, 16),
                    action: "Validated",
                    user: user?.name || "System",
                    comment
                };
                return {
                    ...inc,
                    status: 'Validated',
                    history: [...inc.history, event]
                };
            }
            return inc;
        }));
    };

    const addComment = (id: number, text: string) => {
        setIncomes(prev => prev.map(inc => {
            if (inc.id === id) {
                const comment: IncomeComment = {
                    date: new Date().toISOString().replace('T', ' ').substr(0, 16),
                    user: user?.name || "System",
                    text
                };
                return {
                    ...inc,
                    comments: [...inc.comments, comment]
                };
            }
            return inc;
        }));
    };

    const getIncomeByBookingId = (bookingId: number) => {
        return incomes.find(inc => inc.bookingIds.includes(bookingId));
    };

    return (
        <IncomeContext.Provider
            value={{
                incomes,
                addIncome,
                updateIncome,
                validateIncome,
                addComment,
                getIncomeByBookingId
            }}
        >
            {children}
        </IncomeContext.Provider>
    );
}

export function useIncome() {
    const context = useContext(IncomeContext);
    if (context === undefined) {
        throw new Error("useIncome must be used within an IncomeProvider");
    }
    return context;
}
