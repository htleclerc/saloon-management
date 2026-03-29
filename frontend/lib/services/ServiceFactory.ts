/**
 * Service Factory
 * 
 * Centralized factory for creating service instances
 * Implements singleton pattern for performance
 */

import { SalonService } from './SalonService';
import { WorkerService } from './WorkerService';
import { BookingService } from './BookingService';
import { IncomeService } from './IncomeService';
import { StatsService } from './StatsService';
import { ServiceService } from './ServiceService';
import { ClientService } from './ClientService';
import { BaseService } from './BaseService';

/**
 * Service Factory with singleton instances
 */
export class ServiceFactory {
    private static instances = new Map<string, BaseService>();

    /**
     * Get or create Salon service
     */
    static getSalonService(): SalonService {
        if (!this.instances.has('salon')) {
            this.instances.set('salon', new SalonService());
        }
        return this.instances.get('salon') as SalonService;
    }

    /**
     * Get or create Worker service
     */
    static getWorkerService(): WorkerService {
        if (!this.instances.has('worker')) {
            this.instances.set('worker', new WorkerService());
        }
        return this.instances.get('worker') as WorkerService;
    }

    /**
     * Get or create Booking service
     */
    static getBookingService(): BookingService {
        if (!this.instances.has('booking')) {
            this.instances.set('booking', new BookingService());
        }
        return this.instances.get('booking') as BookingService;
    }

    /**
     * Get or create Income service
     */
    static getIncomeService(): IncomeService {
        if (!this.instances.has('income')) {
            this.instances.set('income', new IncomeService());
        }
        return this.instances.get('income') as IncomeService;
    }

    /**
     * Get or create Stats service
     */
    static getStatsService(): StatsService {
        if (!this.instances.has('stats')) {
            this.instances.set('stats', new StatsService());
        }
        return this.instances.get('stats') as StatsService;
    }

    /**
     * Get or create Service service
     */
    static getServiceService(): ServiceService {
        if (!this.instances.has('service')) {
            this.instances.set('service', new ServiceService());
        }
        return this.instances.get('service') as ServiceService;
    }

    /**
     * Get or create Client service
     */
    static getClientService(): ClientService {
        if (!this.instances.has('client')) {
            this.instances.set('client', new ClientService());
        }
        return this.instances.get('client') as ClientService;
    }

    /**
     * Reset all service instances (useful for testing)
     */
    static reset(): void {
        this.instances.clear();
    }

    /**
     * Get all services at once
     */
    static getAllServices() {
        return {
            salon: this.getSalonService(),
            worker: this.getWorkerService(),
            booking: this.getBookingService(),
            income: this.getIncomeService(),
            stats: this.getStatsService(),
            service: this.getServiceService(),
            client: this.getClientService()
        };
    }
}

/**
 * Pre-instantiated service instances for direct import
 */
export const Services = {
    get salon() { return ServiceFactory.getSalonService(); },
    get worker() { return ServiceFactory.getWorkerService(); },
    get booking() { return ServiceFactory.getBookingService(); },
    get stats() { return ServiceFactory.getStatsService(); },
    get service() { return ServiceFactory.getServiceService(); },
    get client() { return ServiceFactory.getClientService(); }
};

/**
 * Usage examples:
 * 
 * // Option 1: Via Factory
 * const salonService = ServiceFactory.getSalonService();
 * const salons = await salonService.getAll();
 * 
 * // Option 2: Via pre-instantiated namespace
 * import { Services } from '@/lib/services/ServiceFactory';
 * const salons = await Services.salon.getAll();
 * 
 * // Option 3: Get all services
 * const services = ServiceFactory.getAllServices();
 * const stats = await services.stats.getDashboardSummary(salonId);
 */
