"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SERVICES as INITIAL_SERVICES } from "@/lib/data";

export interface Service {
    id: number;
    name: string;
    price: number | string; // Allow string for display purposes or consistency with booking mock
    duration: string;
    category?: string;
    description?: string;
    image?: string;
}

interface ServiceContextType {
    services: Service[];
    addService: (service: Omit<Service, "id">) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
    const [services, setServices] = useState<Service[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedServices = localStorage.getItem("workshop-services");
        if (savedServices) {
            setServices(JSON.parse(savedServices));
        } else {
            // Initialize with data from lib/data.ts, normalizing properties if needed
            // Booking page uses: id, name, description, duration, price, image, category
            // lib/data uses: id, name, price, duration
            // We merge them or just use what we have.
            const normalizedServices = INITIAL_SERVICES.map(s => ({
                ...s,
                price: s.price, // Ensure number/string consistency if needed
                category: "General",
                description: "Standard service",
                image: "💇‍♀️"
            }));
            setServices(normalizedServices);
        }
    }, []);

    useEffect(() => {
        if (mounted && services.length > 0) {
            localStorage.setItem("workshop-services", JSON.stringify(services));
        }
    }, [services, mounted]);

    const addService = (newService: Omit<Service, "id">) => {
        const nextId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
        setServices(prev => [...prev, { ...newService, id: nextId }]);
    };

    return (
        <ServiceContext.Provider value={{ services, addService }}>
            {children}
        </ServiceContext.Provider>
    );
}

export function useServices() {
    const context = useContext(ServiceContext);
    if (context === undefined) {
        throw new Error("useServices must be used within a ServiceProvider");
    }
    return context;
}
