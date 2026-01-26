/**
 * Services Layer - Index
 * 
 * Centralized exports for all business logic services
 */

// Base
export { BaseService } from './BaseService';

// Import services and instances
import { WorkerService, workerService } from './WorkerService';
import { ClientService, clientService } from './ClientService';
import { BookingService, bookingService } from './BookingService';
import { IncomeService, incomeService } from './IncomeService';
import { ExpenseService, expenseService } from './ExpenseService';
import { SalonService, salonService } from './SalonService';
import { StatsService, statsService } from './StatsService';
import { ServiceService, serviceService } from './ServiceService';
import { ProductService, productService } from './ProductService';
import { TipsService, tipsService } from './TipsService';
import { PromoCodeService, promoCodeService } from './PromoCodeService';

// Export services and instances
export { WorkerService, workerService };
export { ClientService, clientService };
export { BookingService, bookingService };
export { IncomeService, incomeService };
export { ExpenseService, expenseService };
export { SalonService, salonService };
export { StatsService, statsService };
export { ServiceService, serviceService };
export { ProductService, productService };
export { TipsService, tipsService };
export { PromoCodeService, promoCodeService };

// Export all service instances as a namespace for easy access
export const Services = {
    worker: workerService,
    client: clientService,
    booking: bookingService,
    income: incomeService,
    expense: expenseService,
    salon: salonService,
    stats: statsService,
    service: serviceService,
    product: productService,
    tips: tipsService,
    promo: promoCodeService
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
