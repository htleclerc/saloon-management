"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type {
    OnboardingConfig,
    SalonDetails,
    Service,
    Product,
    ExpenseCategory,
    Client,
    SalonWorker,
    CSVImportResult,
    CSVImportError
} from "@/types";

interface OnboardingContextType {
    config: OnboardingConfig;
    currentStep: number;

    // Navigation
    goToStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;

    // Data setters
    setSalonType: (type: string) => void;
    setSalonDetails: (details: SalonDetails) => void;
    setServices: (services: Service[]) => void;
    addService: (service: Service) => void;
    removeService: (serviceId: number) => void;
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    removeProduct: (productId: number) => void;
    setExpenseCategories: (categories: ExpenseCategory[]) => void;
    addExpenseCategory: (category: ExpenseCategory) => void;
    removeExpenseCategory: (categoryId: number) => void;
    setClients: (clients: Client[]) => void;
    addClient: (client: Client) => void;
    removeClient: (clientId: number) => void;
    setWorkers: (workers: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[]) => void;
    addWorker: (worker: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
    removeWorker: (index: number) => void;

    // Completion
    completeOnboarding: () => void;
    resetOnboarding: () => void;

    // Utility
    isStepComplete: (step: number) => boolean;
    canProceedToNext: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "saloon-onboarding-config";

// Initial state
const initialConfig: OnboardingConfig = {
    salonType: null,
    salonDetails: null,
    services: [],
    products: [],
    expenseCategories: [],
    clients: [],
    workers: [],
    currentStep: 1,
    isComplete: false,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<OnboardingConfig>(initialConfig);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true);

        // Check if we need to reset onboarding
        const shouldReset = localStorage.getItem('reset_onboarding');
        if (shouldReset === 'true') {
            // Clear the reset flag
            localStorage.removeItem('reset_onboarding');
            // Clear onboarding data
            localStorage.removeItem(STORAGE_KEY);
            // Force reset to initial state
            setConfig(initialConfig);
            return;
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as OnboardingConfig;
                setConfig(parsed);
            } catch (error) {
                console.error("Failed to parse onboarding config:", error);
            }
        }
    }, []);

    // Save to localStorage whenever config changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        }
    }, [config, mounted]);

    const goToStep = (step: number) => {
        setConfig(prev => ({ ...prev, currentStep: step }));
    };

    const nextStep = () => {
        setConfig(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    };

    const previousStep = () => {
        setConfig(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
    };

    const setSalonType = (type: string) => {
        setConfig(prev => ({ ...prev, salonType: type }));
    };

    const setSalonDetails = (details: SalonDetails) => {
        setConfig(prev => ({ ...prev, salonDetails: details }));
    };

    const setServices = (services: Service[]) => {
        setConfig(prev => ({ ...prev, services }));
    };

    const addService = (service: Service) => {
        setConfig(prev => ({ ...prev, services: [...prev.services, service] }));
    };

    const removeService = (serviceId: number) => {
        setConfig(prev => ({
            ...prev,
            services: prev.services.filter(s => s.id !== serviceId),
        }));
    };

    const setProducts = (products: Product[]) => {
        setConfig(prev => ({ ...prev, products }));
    };

    const addProduct = (product: Product) => {
        setConfig(prev => ({ ...prev, products: [...prev.products, product] }));
    };

    const removeProduct = (productId: number) => {
        setConfig(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== productId),
        }));
    };

    const setExpenseCategories = (categories: ExpenseCategory[]) => {
        setConfig(prev => ({ ...prev, expenseCategories: categories }));
    };

    const addExpenseCategory = (category: ExpenseCategory) => {
        setConfig(prev => ({ ...prev, expenseCategories: [...prev.expenseCategories, category] }));
    };

    const removeExpenseCategory = (categoryId: number) => {
        setConfig(prev => ({
            ...prev,
            expenseCategories: prev.expenseCategories.filter(c => c.id !== categoryId),
        }));
    };

    const setClients = (clients: Client[]) => {
        setConfig(prev => ({ ...prev, clients }));
    };

    const addClient = (client: Client) => {
        setConfig(prev => ({ ...prev, clients: [...prev.clients, client] }));
    };

    const removeClient = (clientId: number) => {
        setConfig(prev => ({
            ...prev,
            clients: prev.clients.filter(c => c.id !== clientId),
        }));
    };

    const setWorkers = (workers: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[]) => {
        setConfig(prev => ({ ...prev, workers }));
    };

    const addWorker = (worker: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
        setConfig(prev => ({ ...prev, workers: [...prev.workers, worker] }));
    };

    const removeWorker = (index: number) => {
        setConfig(prev => ({
            ...prev,
            workers: prev.workers.filter((_, i) => i !== index),
        }));
    };

    const completeOnboarding = () => {
        setConfig(prev => ({ ...prev, isComplete: true }));
        // Clear from localStorage after completion
        localStorage.removeItem(STORAGE_KEY);
    };

    const resetOnboarding = () => {
        setConfig(initialConfig);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Validation helpers
    const isStepComplete = (step: number): boolean => {
        switch (step) {
            case 1: // Salon type
                return config.salonType !== null;
            case 2: // Salon details
                return config.salonDetails !== null &&
                    config.salonDetails.name.length > 0 &&
                    config.salonDetails.address.length > 0;
            case 3: // Services
                return config.services.length > 0;
            case 4: // Products (optional - can skip)
                return true;
            case 5: // Expense Categories (optional - can skip)
                return true;
            case 6: // Clients (optional - can skip)
                return true;
            case 7: // Team (at least owner/admin exists)
                return true;
            case 8: // Review
                return isStepComplete(1) && isStepComplete(2) && isStepComplete(3);
            default:
                return false;
        }
    };

    const canProceedToNext = (): boolean => {
        return isStepComplete(config.currentStep);
    };

    return (
        <OnboardingContext.Provider
            value={{
                config,
                currentStep: config.currentStep,
                goToStep,
                nextStep,
                previousStep,
                setSalonType,
                setSalonDetails,
                setServices,
                addService,
                removeService,
                setProducts,
                addProduct,
                removeProduct,
                setExpenseCategories,
                addExpenseCategory,
                removeExpenseCategory,
                setClients,
                addClient,
                removeClient,
                setWorkers,
                addWorker,
                removeWorker,
                completeOnboarding,
                resetOnboarding,
                isStepComplete,
                canProceedToNext,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
