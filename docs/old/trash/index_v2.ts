/**
 * Services Layer V2 - Index
 * 
 * Centralized exports for all business logic services
 */

// Base
export { BaseService } from './BaseService';

// Core Services
export { WorkerService, workerService } from './WorkerService';
export { BookingService, bookingService } from './BookingServiceV2';
export { IncomeService, incomeService } from './IncomeServiceV2';

// Export all service instances as a namespace for easy access
export const Services = {
    worker: workerService,
    booking: bookingService,
    income: incomeService
};

/**
 * Usage examples:
 * 
 * import { workerService } from '@/lib/services';
 * import { Services } from '@/lib/services';
 * 
 * // Option 1: Direct import
 * const workers = await workerService.getAll(salonId);
 * 
 * // Option 2: Via namespace
 * const workers = await Services.worker.getAll(salonId);
 */
