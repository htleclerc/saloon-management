/**
 * React Hooks for Business Services
 * 
 * Provides easy-to-use React hooks to access business services
 */

import { useState, useEffect, useCallback } from 'react';
import { workerService, clientService, bookingService, serviceService } from '@/lib/services';
import { SalonWorker, Client, Booking, Service } from '@/types';

/**
 * Hook to use WorkerService
 */
export function useWorkers() {
    const [workers, setWorkers] = useState<SalonWorker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkers = useCallback(async (salonId: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const data = await workerService.getAll(salonId);
            setWorkers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch workers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const createWorker = useCallback(async (data: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'salonId'> & { salonId?: number, isActive?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const newWorker = await workerService.create({
                salonId: 0, // Default salon ID
                isActive: true, // Default active status
                ...data
            } as any);
            setWorkers(prev => [...prev, newWorker]);
            return newWorker;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create worker';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWorker = useCallback(async (id: number, data: Partial<SalonWorker>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await workerService.update(id, data);
            setWorkers(prev => prev.map(w => w.id === id ? updated : w));
            return updated;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update worker';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteWorker = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await workerService.delete(id);
            setWorkers(prev => prev.filter(w => w.id !== id));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete worker';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        workers,
        loading,
        error,
        fetchWorkers,
        createWorker,
        updateWorker,
        deleteWorker,
    };
}

/**
 * Hook to use ClientService
 */
export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async (salonId: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const data = await clientService.getAll(salonId);
            setClients(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const createClient = useCallback(async (data: Omit<Client, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const newClient = await clientService.create(data);
            setClients(prev => [...prev, newClient]);
            return newClient;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create client';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateClient = useCallback(async (id: number, data: Partial<Client>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await clientService.update(id, data);
            setClients(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update client';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteClient = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await clientService.delete(id);
            setClients(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete client';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        clients,
        loading,
        error,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
    };
}

/**
 * Hook to use BookingService
 */
export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async (salonId: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await bookingService.getAll(salonId);
            setBookings(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const createBooking = useCallback(async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory' | 'comments' | 'endTime'> & { workerIds: number[], serviceIds: number[] }) => {
        setLoading(true);
        setError(null);
        try {
            const newBooking = await bookingService.create({
                ...data,
                workerIds: data.workerIds || [],
                serviceIds: data.serviceIds || [],
                notes: data.notes || undefined
            });
            setBookings(prev => [...prev, newBooking]);
            return newBooking;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create booking';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateBooking = useCallback(async (id: number, data: Partial<Booking>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await bookingService.update(id, data);
            setBookings(prev => prev.map(b => b.id === id ? updated : b));
            return updated;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update booking';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteBooking = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await bookingService.delete(id);
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete booking';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        createBooking,
        updateBooking,
        deleteBooking,
    };
}

/**
 * Hook to use ServiceService
 */
export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async (salonId: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const data = await serviceService.getAll(salonId);
            setServices(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const createService = useCallback(async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
        setLoading(true);
        setError(null);
        try {
            const newService = await serviceService.create(data);
            setServices(prev => [...prev, newService]);
            return newService;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create service';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        services,
        loading,
        error,
        fetchServices,
        createService
    };
}
