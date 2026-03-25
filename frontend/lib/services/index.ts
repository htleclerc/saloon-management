/**
 * Services Layer - Index
 * 
 * Centralized exports for all business logic services
 */

// Base
export { BaseService } from './BaseService';

// Import Service Classes and Instances
import { WorkerService, workerService } from './WorkerService';
import { NotificationService, notificationService } from './NotificationService';
import { ClientService, clientService } from './ClientService';
import { BookingService, bookingService } from './BookingService';
import { IncomeService, incomeService } from './IncomeService';
import { ExpenseService, expenseService } from './ExpenseService';
import { SalonService, salonService } from './SalonService';
import { StatsService, statsService } from './StatsService';
import { RevenueStatsService, revenueStatsService } from './RevenueStatsService';
import { PerformanceStatsService, performanceStatsService } from './PerformanceStatsService';
import { ServiceService, serviceService } from './ServiceService';
import { ProductService, productService } from './ProductService';
import { TipsService, tipsService } from './TipsService';
import { PromoCodeService, promoCodeService } from './PromoCodeService';
import { invoiceService } from './InvoiceService';
import { PayrollService, payrollService, type PayrollSummary } from './PayrollService';

// Export everything
export {
    WorkerService, workerService,
    NotificationService, notificationService,
    ClientService, clientService,
    BookingService, bookingService,
    IncomeService, incomeService,
    ExpenseService, expenseService,
    SalonService, salonService,
    StatsService, statsService,
    RevenueStatsService, revenueStatsService,
    PerformanceStatsService, performanceStatsService,
    ServiceService, serviceService,
    ProductService, productService,
    TipsService, tipsService,
    PromoCodeService, promoCodeService,
    invoiceService,
    PayrollService, payrollService,
    PayrollSummary
};

// Export all service instances as a namespace for easy access
export const Services = {
    worker: workerService,
    client: clientService,
    booking: bookingService,
    income: incomeService,
    expense: expenseService,
    salon: salonService,
    stats: statsService,
    revenue: revenueStatsService,
    performance: performanceStatsService,
    service: serviceService,
    product: productService,
    tips: tipsService,
    promo: promoCodeService,
    invoice: invoiceService,
    payroll: payrollService
};
