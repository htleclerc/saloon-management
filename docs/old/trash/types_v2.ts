/**
 * DATA PROVIDER ABSTRACTION LAYER V2
 * 
 * Complete interface for all data operations
 * Aligned with MCD V2 and SQL Schema V2
 */

import {
    // Core
    User, UserSalon, Salon, SalonSettings, SalonStats,
    // Workforce
    Worker, WorkerStats,
    // Clients
    Client, ClientStats,
    // Services
    ServiceCategory, Service, Product,
    // Bookings
    Booking, BookingWithRelations, BookingCreateData, BookingFilters,
    // Incomes
    Income, IncomeWithRelations, IncomeCreateData, IncomeWorkerShare, IncomeFilters,
    // Expenses
    ExpenseCategory, Expense, ExpenseFilters,
    // Reviews
    Review, ReviewFilters,
    // Promo
    PromoCode,
    // Audit
    InteractionHistory, Comment,
    // Filters
    PaginationParams, PaginatedResponse
} from '@/types/index_v2';

export type DataMode = 'demo-local' | 'demo-supabase' | 'normal';

/**
 * Complete Data Provider Interface V2
 * 
 * All providers (LocalStorage, Supabase, API) must implement this interface
 */
export interface IDataProvider {
    // ============================================
    // METADATA
    // ============================================
    readonly mode: DataMode;
    readonly isDemo: boolean;

    // ============================================
    // LIFECYCLE
    // ============================================
    initialize?(): Promise<void>;
    cleanup?(): Promise<void>;

    // ============================================
    // USERS
    // ============================================
    getUsers(): Promise<User[]>;
    getUser(id: number): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByCode(userCode: string): Promise<User | null>;
    createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    updateUser(id: number, data: Partial<User>): Promise<User>;
    deleteUser(id: number): Promise<void>;

    // ============================================
    // SALONS
    // ============================================
    getSalons(): Promise<Salon[]>;
    getSalon(id: number): Promise<Salon | null>;
    getSalonBySlug(slug: string): Promise<Salon | null>;
    createSalon(data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Salon>;
    updateSalon(id: number, data: Partial<Salon>): Promise<Salon>;
    deleteSalon(id: number): Promise<void>;

    // User-Salon Junction
    getUserSalons(userId: number): Promise<UserSalon[]>;
    getSalonUsers(salonId: number): Promise<UserSalon[]>;
    addUserToSalon(userId: number, salonId: number, roleInSalon: 'Admin' | 'Manager' | 'Worker'): Promise<UserSalon>;
    removeUserFromSalon(userId: number, salonId: number): Promise<void>;

    // Salon Settings
    getSalonSettings(salonId: number): Promise<SalonSettings | null>;
    updateSalonSettings(salonId: number, data: Partial<SalonSettings>): Promise<SalonSettings>;

    // Salon Stats
    getSalonStats(salonId: number): Promise<SalonStats>;

    // ============================================
    // WORKERS
    // ============================================
    getWorkers(salonId: number): Promise<Worker[]>;
    getWorker(id: number): Promise<Worker | null>;
    getWorkerStats(id: number): Promise<WorkerStats | null>;
    createWorker(data: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Worker>;
    updateWorker(id: number, data: Partial<Worker>): Promise<Worker>;
    deleteWorker(id: number): Promise<void>;

    // ============================================
    // CLIENTS
    // ============================================
    getClients(salonId: number): Promise<Client[]>;
    getClient(id: number): Promise<Client | null>;
    getClientByEmail(salonId: number, email: string): Promise<Client | null>;
    getClientByPhone(salonId: number, phone: string): Promise<Client | null>;
    getClientStats(id: number): Promise<ClientStats | null>;
    createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client>;
    updateClient(id: number, data: Partial<Client>): Promise<Client>;
    deleteClient(id: number): Promise<void>;

    // ============================================
    // SERVICE CATEGORIES
    // ============================================
    getServiceCategories(salonId: number): Promise<ServiceCategory[]>;
    getServiceCategory(id: number): Promise<ServiceCategory | null>;
    createServiceCategory(data: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategory>;
    updateServiceCategory(id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory>;
    deleteServiceCategory(id: number): Promise<void>;

    // ============================================
    // SERVICES
    // ============================================
    getServices(salonId: number): Promise<Service[]>;
    getService(id: number): Promise<Service | null>;
    getServicesByCategory(categoryId: number): Promise<Service[]>;
    createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service>;
    updateService(id: number, data: Partial<Service>): Promise<Service>;
    deleteService(id: number): Promise<void>;

    // ============================================
    // PRODUCTS
    // ============================================
    getProducts(salonId: number): Promise<Product[]>;
    getProduct(id: number): Promise<Product | null>;
    getProductBySku(salonId: number, sku: string): Promise<Product | null>;
    createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
    updateProduct(id: number, data: Partial<Product>): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    updateProductStock(id: number, quantity: number): Promise<Product>;

    // ============================================
    // BOOKINGS
    // ============================================
    getBookings(salonId: number, filters?: BookingFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Booking>>;
    getBooking(id: number): Promise<Booking | null>;
    getBookingWithRelations(id: number): Promise<BookingWithRelations | null>;
    getBookingsByClient(clientId: number): Promise<Booking[]>;
    getBookingsByWorker(workerId: number): Promise<Booking[]>;
    getBookingsByDate(salonId: number, date: string): Promise<Booking[]>;
    createBooking(data: BookingCreateData): Promise<Booking>;
    updateBooking(id: number, data: Partial<Booking>): Promise<Booking>;
    deleteBooking(id: number): Promise<void>;

    // Booking-Worker Junction
    addWorkerToBooking(bookingId: number, workerId: number): Promise<void>;
    removeWorkerFromBooking(bookingId: number, workerId: number): Promise<void>;
    getBookingWorkers(bookingId: number): Promise<Worker[]>;

    // Booking-Service Junction
    addServiceToBooking(bookingId: number, serviceId: number): Promise<void>;
    removeServiceFromBooking(bookingId: number, serviceId: number): Promise<void>;
    getBookingServices(bookingId: number): Promise<Service[]>;

    // ============================================
    // INCOMES
    // ============================================
    getIncomes(salonId: number, filters?: IncomeFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Income>>;
    getIncome(id: number): Promise<Income | null>;
    getIncomeWithRelations(id: number): Promise<IncomeWithRelations | null>;
    getIncomesByClient(clientId: number): Promise<Income[]>;
    getIncomesByWorker(workerId: number): Promise<Income[]>;
    createIncome(data: IncomeCreateData): Promise<Income>;
    updateIncome(id: number, data: Partial<Income>): Promise<Income>;
    deleteIncome(id: number): Promise<void>;

    // Income-Worker Junction
    addWorkerToIncome(incomeId: number, workerId: number, amount: number, percentage: number): Promise<IncomeWorkerShare>;
    removeWorkerFromIncome(incomeId: number, workerId: number): Promise<void>;
    getIncomeWorkerShares(incomeId: number): Promise<IncomeWorkerShare[]>;

    // Income-Service Junction
    addServiceToIncome(incomeId: number, serviceId: number): Promise<void>;
    removeServiceFromIncome(incomeId: number, serviceId: number): Promise<void>;
    getIncomeServices(incomeId: number): Promise<Service[]>;

    // Income-Product Junction
    addProductToIncome(incomeId: number, productId: number, quantity: number): Promise<void>;
    removeProductFromIncome(incomeId: number, productId: number): Promise<void>;
    getIncomeProducts(incomeId: number): Promise<Array<{ product: Product; quantity: number }>>;

    // ============================================
    // EXPENSE CATEGORIES
    // ============================================
    getExpenseCategories(salonId: number): Promise<ExpenseCategory[]>;
    getExpenseCategory(id: number): Promise<ExpenseCategory | null>;
    createExpenseCategory(data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseCategory>;
    updateExpenseCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory>;
    deleteExpenseCategory(id: number): Promise<void>;

    // ============================================
    // EXPENSES
    // ============================================
    getExpenses(salonId: number, filters?: ExpenseFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Expense>>;
    getExpense(id: number): Promise<Expense | null>;
    getExpensesByCategory(categoryId: number): Promise<Expense[]>;
    createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense>;
    updateExpense(id: number, data: Partial<Expense>): Promise<Expense>;
    deleteExpense(id: number): Promise<void>;

    // ============================================
    // REVIEWS
    // ============================================
    getReviews(salonId: number, filters?: ReviewFilters): Promise<Review[]>;
    getReview(id: number): Promise<Review | null>;
    getReviewsByWorker(workerId: number): Promise<Review[]>;
    getReviewsByClient(clientId: number): Promise<Review[]>;
    createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review>;
    updateReview(id: number, data: Partial<Review>): Promise<Review>;
    deleteReview(id: number): Promise<void>;
    approveReview(id: number): Promise<Review>;

    // ============================================
    // PROMO CODES
    // ============================================
    getPromoCodes(salonId: number): Promise<PromoCode[]>;
    getPromoCode(id: number): Promise<PromoCode | null>;
    getPromoCodeByCode(salonId: number, code: string): Promise<PromoCode | null>;
    createPromoCode(data: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromoCode>;
    updatePromoCode(id: number, data: Partial<PromoCode>): Promise<PromoCode>;
    deletePromoCode(id: number): Promise<void>;
    incrementPromoCodeUsage(id: number): Promise<void>;

    // ============================================
    // AUDIT & HISTORY
    // ============================================
    getInteractionHistory(entityType: string, entityId: number): Promise<InteractionHistory[]>;
    createInteractionHistory(data: Omit<InteractionHistory, 'id' | 'timestamp'>): Promise<InteractionHistory>;

    getComments(entityType: string, entityId: number): Promise<Comment[]>;
    createComment(data: Omit<Comment, 'id' | 'timestamp'>): Promise<Comment>;
    deleteComment(id: number): Promise<void>;
}

/**
 * Data Provider Factory V2
 */
export class DataProviderFactory {
    private static instance: IDataProvider | null = null;

    static create(mode: DataMode): IDataProvider {
        // Singleton pattern
        if (this.instance && this.instance.mode === mode) {
            return this.instance;
        }

        switch (mode) {
            case 'demo-local': {
                const { LocalStorageProvider } = require('./local');
                this.instance = new LocalStorageProvider();
                return this.instance;
            }

            case 'demo-supabase': {
                const { SupabaseProvider } = require('./supabase');
                this.instance = new SupabaseProvider();
                return this.instance;
            }

            case 'normal': {
                // Production API provider
                const { APIProvider } = require('./api');
                this.instance = new APIProvider();
                return this.instance;
            }

            default:
                throw new Error(`Unknown data mode: ${mode}`);
        }
    }

    static reset(): void {
        this.instance = null;
    }
}

/**
 * Helper to get current provider instance
 */
export function getCurrentProvider(): IDataProvider {
    // Get mode from context/config
    const mode = (typeof window !== 'undefined'
        ? localStorage.getItem('data-mode')
        : 'demo-local') as DataMode || 'demo-local';

    return DataProviderFactory.create(mode);
}
