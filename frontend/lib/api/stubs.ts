/**
 * API Stubs - Simulated Backend Responses
 * 
 * Provides mock data and simulated API responses for development and testing.
 * These stubs can be used when the backend is not available or for demo purposes.
 */

import { SalonWorker, Client, Booking, Service, Income, Expense, ExpenseCategory } from '@/types';
import { INITIAL_WORKERS, INITIAL_CLIENTS, INITIAL_SERVICES } from '../constants/initialData';

// Simulated API delay (milliseconds)
const API_DELAY = 500;

/**
 * Simulate API request delay
 */
const delay = (ms: number = API_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate API error
 */
class APIError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Mock Workers Data
 */
export const mockWorkers: SalonWorker[] = [...INITIAL_WORKERS];

/**
 * Mock Clients Data
 */
export const mockClients: Client[] = [...INITIAL_CLIENTS];

/**
 * Mock Services Data
 */
export const mockServices: Service[] = [...INITIAL_SERVICES];

/**
 * Worker Stubs
 */
export const workerStubs = {
    /**
     * GET /api/workers
     */
    getAll: async (): Promise<SalonWorker[]> => {
        await delay();
        return mockWorkers;
    },

    /**
     * GET /api/workers/:id
     */
    getById: async (id: number): Promise<SalonWorker> => {
        await delay();
        const worker = mockWorkers.find(w => w.id === id);
        if (!worker) {
            throw new APIError(404, `Worker ${id} not found`);
        }
        return worker;
    },

    /**
     * POST /api/workers
     */
    create: async (data: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<SalonWorker> => {
        await delay();
        const newWorker: SalonWorker = {
            ...data,
            id: Math.max(...mockWorkers.map(w => w.id), 0) + 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM'
        };
        mockWorkers.push(newWorker);
        return newWorker;
    },

    /**
     * PUT /api/workers/:id
     */
    update: async (id: number, data: Partial<SalonWorker>): Promise<SalonWorker> => {
        await delay();
        const index = mockWorkers.findIndex(w => w.id === id);
        if (index === -1) {
            throw new APIError(404, `Worker ${id} not found`);
        }
        mockWorkers[index] = { ...mockWorkers[index], ...data };
        return mockWorkers[index];
    },

    /**
     * DELETE /api/workers/:id
     */
    delete: async (id: number): Promise<void> => {
        await delay();
        const index = mockWorkers.findIndex(w => w.id === id);
        if (index === -1) {
            throw new APIError(404, `Worker ${id} not found`);
        }
        mockWorkers.splice(index, 1);
    }
};

/**
 * Client Stubs
 */
export const clientStubs = {
    getAll: async (): Promise<Client[]> => {
        await delay();
        return mockClients;
    },

    getById: async (id: number): Promise<Client> => {
        await delay();
        const client = mockClients.find(c => c.id === id);
        if (!client) {
            throw new APIError(404, `Client ${id} not found`);
        }
        return client;
    },

    create: async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Client> => {
        await delay();
        const newClient: Client = {
            ...data,
            id: Math.max(...mockClients.map(c => c.id), 0) + 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM'
        };
        mockClients.push(newClient);
        return newClient;
    },

    update: async (id: number, data: Partial<Client>): Promise<Client> => {
        await delay();
        const index = mockClients.findIndex(c => c.id === id);
        if (index === -1) {
            throw new APIError(404, `Client ${id} not found`);
        }
        mockClients[index] = { ...mockClients[index], ...data };
        return mockClients[index];
    },

    delete: async (id: number): Promise<void> => {
        await delay();
        const index = mockClients.findIndex(c => c.id === id);
        if (index === -1) {
            throw new APIError(404, `Client ${id} not found`);
        }
        mockClients.splice(index, 1);
    }
};

/**
 * Service Stubs
 */
export const serviceStubs = {
    getAll: async (): Promise<Service[]> => {
        await delay();
        return mockServices;
    },

    getById: async (id: number): Promise<Service> => {
        await delay();
        const service = mockServices.find(s => s.id === id);
        if (!service) {
            throw new APIError(404, `Service ${id} not found`);
        }
        return service;
    },

    create: async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Service> => {
        await delay();
        const newService: Service = {
            ...data,
            id: Math.max(...mockServices.map(s => s.id), 0) + 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM'
        };
        mockServices.push(newService);
        return newService;
    },

    update: async (id: number, data: Partial<Service>): Promise<Service> => {
        await delay();
        const index = mockServices.findIndex(s => s.id === id);
        if (index === -1) {
            throw new APIError(404, `Service ${id} not found`);
        }
        mockServices[index] = { ...mockServices[index], ...data };
        return mockServices[index];
    },

    delete: async (id: number): Promise<void> => {
        await delay();
        const index = mockServices.findIndex(s => s.id === id);
        if (index === -1) {
            throw new APIError(404, `Service ${id} not found`);
        }
        mockServices.splice(index, 1);
    }
};

/**
 * Export all stubs
 */
export const apiStubs = {
    workers: workerStubs,
    clients: clientStubs,
    services: serviceStubs
};
