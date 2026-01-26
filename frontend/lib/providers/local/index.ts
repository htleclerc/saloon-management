/**
 * LocalStorage Data Provider
 * 
 * Wraps existing localStorage-based providers (BookingProvider, IncomeProvider, etc.)
 * to implement the IDataProvider interface.
 * 
 * This provider uses browser localStorage for data persistence and is the default
 * mode for the application (demo-local).
 */

import { IDataProvider, DataMode, PaginatedResponse, BookingFilters, IncomeFilters, ExpenseFilters, Review, ReviewFilters, PromoCode, InteractionHistory, SalonComment, BookingCreateData, IncomeCreateData, IncomeWorkerShare, WorkerStats, ClientStats, ClientAnalytics, DashboardAnalytics, Salon, User, UserSalon, SalonSettings, SalonStats, ServiceCategory, Product, PaginationParams, BookingWithRelations, IncomeWithRelations, SalonWorker } from '../types';
import { Client, Service, Booking, Income, Expense, ExpenseCategory } from '@/types';
import { INITIAL_SALONS, INITIAL_WORKERS, INITIAL_CLIENTS, INITIAL_SERVICES, INITIAL_SERVICE_CATEGORIES, INITIAL_EXPENSE_CATEGORIES, INITIAL_SALON_SETTINGS } from '../../constants/initialData';

const STORAGE_KEY = 'saloon-data';

interface LocalStorageData {
    salons: Salon[];
    workers: SalonWorker[];
    clients: Client[];
    services: Service[];
    bookings: Booking[];
    incomes: Income[];
    expenses: Expense[];
    products: Product[];
    reviews: Review[];
    promoCodes: PromoCode[];
    expenseCategories: ExpenseCategory[];
    serviceCategories: ServiceCategory[];
    salonSettings: SalonSettings[];
}

export class LocalStorageProvider implements IDataProvider {
    readonly mode: DataMode = 'demo-local';
    readonly isDemo = true;

    private getData(): LocalStorageData {
        if (typeof window === 'undefined') {
            return this.getEmptyData();
        }

        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            const emptyData = this.getEmptyData();
            this.saveData(emptyData);
            return emptyData;
        }

        try {
            const parsed = JSON.parse(data);
            // Merge with default data to ensure all fields exist (handling schema updates)
            return {
                ...this.getEmptyData(),
                ...parsed
            };
        } catch (e) {
            console.error('Failed to parse localStorage data', e);
            return this.getEmptyData();
        }
    }

    private saveData(data: LocalStorageData): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    private getEmptyData(): LocalStorageData {
        const { INITIAL_BOOKINGS, INITIAL_INCOMES, INITIAL_EXPENSES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_PROMO_CODES } = require('../../constants/initialData');

        return {
            salons: INITIAL_SALONS,
            workers: INITIAL_WORKERS,
            clients: INITIAL_CLIENTS,
            services: INITIAL_SERVICES,
            bookings: INITIAL_BOOKINGS || [],
            incomes: INITIAL_INCOMES || [],
            expenses: INITIAL_EXPENSES || [],
            products: INITIAL_PRODUCTS || [],
            reviews: INITIAL_REVIEWS || [],
            promoCodes: INITIAL_PROMO_CODES || [],
            expenseCategories: INITIAL_EXPENSE_CATEGORIES,
            serviceCategories: INITIAL_SERVICE_CATEGORIES,
            salonSettings: INITIAL_SALON_SETTINGS,
        };
    }

    private generateId(items: { id: number }[]): number {
        if (items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    }

    // Workers
    async getWorkers(salonId: number): Promise<SalonWorker[]> {
        return this.getData().workers.filter(w => w.salonId === salonId);
    }

    async getWorker(id: number): Promise<SalonWorker | null> {
        const workers = this.getData().workers;
        return workers.find(w => w.id === id) || null;
    }

    async createWorker(data: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalonWorker> {
        const allData = this.getData();
        const id = this.generateId(allData.workers);

        const newWorker: SalonWorker = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        allData.workers.push(newWorker);
        this.saveData(allData);
        return newWorker;
    }

    async updateWorker(id: number, updates: Partial<SalonWorker>): Promise<SalonWorker> {
        const allData = this.getData();
        const index = allData.workers.findIndex(w => w.id === id);

        if (index === -1) {
            throw new Error(`Worker with id ${id} not found`);
        }

        allData.workers[index] = { ...allData.workers[index], ...updates };
        this.saveData(allData);
        return allData.workers[index];
    }

    async deleteWorker(id: number): Promise<void> {
        const allData = this.getData();
        allData.workers = allData.workers.filter(w => w.id !== id);
        this.saveData(allData);
    }

    // Clients
    async getClients(salonId: number): Promise<Client[]> {
        return this.getData().clients.filter(c => c.salonId === salonId);
    }

    async getClient(id: number): Promise<Client | null> {
        const clients = this.getData().clients;
        return clients.find(c => c.id === id) || null;
    }

    async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
        const allData = this.getData();
        const id = this.generateId(allData.clients);
        const newClient: Client = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        allData.clients.push(newClient);
        this.saveData(allData);
        return newClient;
    }

    async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
        const allData = this.getData();
        const index = allData.clients.findIndex(c => c.id === id);

        if (index === -1) {
            throw new Error(`Client with id ${id} not found`);
        }

        allData.clients[index] = { ...allData.clients[index], ...updates };
        this.saveData(allData);
        return allData.clients[index];
    }

    async deleteClient(id: number): Promise<void> {
        const allData = this.getData();
        allData.clients = allData.clients.filter(c => c.id !== id);
        this.saveData(allData);
    }

    // Services
    async getServices(salonId: number): Promise<Service[]> {
        return this.getData().services.filter(s => s.salonId === salonId);
    }

    async getService(id: number): Promise<Service | null> {
        const services = this.getData().services;
        return services.find(s => s.id === id) || null;
    }

    async createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
        const allData = this.getData();
        const id = this.generateId(allData.services);
        const newService: Service = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        allData.services.push(newService);
        this.saveData(allData);
        return newService;
    }

    async updateService(id: number, updates: Partial<Service>): Promise<Service> {
        const allData = this.getData();
        const index = allData.services.findIndex(s => s.id === id);

        if (index === -1) {
            throw new Error(`Service with id ${id} not found`);
        }

        allData.services[index] = { ...allData.services[index], ...updates };
        this.saveData(allData);
        return allData.services[index];
    }

    async deleteService(id: number): Promise<void> {
        const allData = this.getData();
        allData.services = allData.services.filter(s => s.id !== id);
        this.saveData(allData);
    }

    // Bookings
    async getBookings(salonId: number, filters?: BookingFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Booking>> {
        const bookings = this.getData().bookings.filter(b => b.salonId === salonId);
        return {
            data: bookings,
            total: bookings.length,
            page: pagination?.page || 1,
            perPage: pagination?.perPage || 10,
            totalPages: 1
        };
    }

    async getBooking(id: number): Promise<Booking | null> {
        const bookings = this.getData().bookings;
        return bookings.find(b => b.id === id) || null;
    }

    async createBooking(data: BookingCreateData): Promise<Booking> {
        const allData = this.getData();
        const id = this.generateId(allData.bookings);

        const newBooking: Booking = {
            ...data as any,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isSensitive: (data as any).isSensitive || false,
            createdBy: (data as any).createdBy || 'SYSTEM',
            updatedBy: (data as any).updatedBy || 'SYSTEM'
        };

        allData.bookings.push(newBooking);
        this.saveData(allData);
        return newBooking;
    }

    async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
        const allData = this.getData();
        const index = allData.bookings.findIndex(b => b.id === id);

        if (index === -1) {
            throw new Error(`Booking with id ${id} not found`);
        }

        allData.bookings[index] = {
            ...allData.bookings[index],
            ...updates,
            updatedAt: new Date()
        };
        this.saveData(allData);
        return allData.bookings[index];
    }

    async deleteBooking(id: number): Promise<void> {
        const allData = this.getData();
        allData.bookings = allData.bookings.filter(b => b.id !== id);
        this.saveData(allData);
    }

    // Incomes
    async getIncomes(salonId: number, filters?: IncomeFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Income>> {
        const incomes = this.getData().incomes.filter(i => i.salonId === salonId);
        return {
            data: incomes,
            total: incomes.length,
            page: pagination?.page || 1,
            perPage: pagination?.perPage || 10,
            totalPages: 1
        };
    }

    async getIncome(id: number): Promise<Income | null> {
        const incomes = this.getData().incomes;
        return incomes.find(i => i.id === id) || null;
    }

    async createIncome(data: IncomeCreateData): Promise<Income> {
        const allData = this.getData();
        const id = this.generateId(allData.incomes);

        const finalAmount = data.amount - (data.discountAmount || 0);
        const newIncome: Income = {
            ...data as any,
            id,
            finalAmount,
            hasInvoice: false,
            invoiceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: (data as any).createdBy || 'SYSTEM',
            updatedBy: (data as any).updatedBy || 'SYSTEM'
        };

        allData.incomes.push(newIncome);
        this.saveData(allData);
        return newIncome;
    }

    async updateIncome(id: number, updates: Partial<Income>): Promise<Income> {
        const allData = this.getData();
        const index = allData.incomes.findIndex(i => i.id === id);

        if (index === -1) {
            throw new Error(`Income with id ${id} not found`);
        }

        allData.incomes[index] = { ...allData.incomes[index], ...updates };
        this.saveData(allData);
        return allData.incomes[index];
    }

    async deleteIncome(id: number): Promise<void> {
        const allData = this.getData();
        allData.incomes = allData.incomes.filter(i => i.id !== id);
        this.saveData(allData);
    }

    // Expenses
    async getExpenses(salonId: number, filters?: ExpenseFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Expense>> {
        const expenses = this.getData().expenses.filter(e => e.salonId === salonId);
        return {
            data: expenses,
            total: expenses.length,
            page: pagination?.page || 1,
            perPage: pagination?.perPage || 10,
            totalPages: 1
        };
    }

    async getExpense(id: number): Promise<Expense | null> {
        const expenses = this.getData().expenses;
        return expenses.find(e => e.id === id) || null;
    }

    async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        const allData = this.getData();
        const id = this.generateId(allData.expenses);

        const newExpense: Expense = {
            ...data as any,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: (data as any).createdBy || 'SYSTEM',
            updatedBy: (data as any).updatedBy || 'SYSTEM'
        };

        allData.expenses.push(newExpense);
        this.saveData(allData);
        return newExpense;
    }

    async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense> {
        const allData = this.getData();
        const index = allData.expenses.findIndex(e => e.id === id);

        if (index === -1) {
            throw new Error(`Expense with id ${id} not found`);
        }

        allData.expenses[index] = { ...allData.expenses[index], ...updates };
        this.saveData(allData);
        return allData.expenses[index];
    }

    async deleteExpense(id: number): Promise<void> {
        const allData = this.getData();
        allData.expenses = allData.expenses.filter(e => e.id !== id);
        this.saveData(allData);
    }

    // Expense Categories
    async getExpenseCategories(salonId: number): Promise<ExpenseCategory[]> {
        return this.getData().expenseCategories.filter(ec => ec.salonId === salonId);
    }

    async getExpenseCategory(id: number): Promise<ExpenseCategory | null> {
        const categories = this.getData().expenseCategories;
        return categories.find(c => c.id === id) || null;
    }

    async createExpenseCategory(data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseCategory> {
        const allData = this.getData();
        const id = this.generateId(allData.expenseCategories);
        const newCategory: ExpenseCategory = {
            ...data as any,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        allData.expenseCategories.push(newCategory);
        this.saveData(allData);
        return newCategory;
    }

    async updateExpenseCategory(id: number, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
        const allData = this.getData();
        const index = allData.expenseCategories.findIndex(c => c.id === id);

        if (index === -1) {
            throw new Error(`ExpenseCategory with id ${id} not found`);
        }

        allData.expenseCategories[index] = { ...allData.expenseCategories[index], ...updates };
        this.saveData(allData);
        return allData.expenseCategories[index];
    }

    async deleteExpenseCategory(id: number): Promise<void> {
        const allData = this.getData();
        allData.expenseCategories = allData.expenseCategories.filter(c => c.id !== id);
        this.saveData(allData);
    }

    /** Stub implementations to satisfy IDataProvider interface */
    async getUsers(): Promise<User[]> { throw new Error('Not implemented'); }
    async getUser(id: number): Promise<User | null> { throw new Error('Not implemented'); }
    async getUserByEmail(email: string): Promise<User | null> { throw new Error('Not implemented'); }
    async getUserByCode(userCode: string): Promise<User | null> { throw new Error('Not implemented'); }
    async createUser(data: any): Promise<User> { throw new Error('Not implemented'); }
    async updateUser(id: number, data: any): Promise<User> { throw new Error('Not implemented'); }
    async deleteUser(id: number): Promise<void> { throw new Error('Not implemented'); }
    // Salons
    async getSalons(): Promise<Salon[]> {
        return this.getData().salons;
    }

    async getSalon(id: number): Promise<Salon | null> {
        const salons = this.getData().salons;
        return salons.find(s => s.id === id) || null;
    }

    async getSalonBySlug(slug: string): Promise<Salon | null> {
        const salons = this.getData().salons;
        return salons.find(s => s.slug === slug) || null;
    }

    async createSalon(data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Salon> {
        const allData = this.getData();
        const id = this.generateId(allData.salons);
        const newSalon: Salon = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        allData.salons.push(newSalon);
        this.saveData(allData);
        return newSalon;
    }

    async updateSalon(id: number, data: Partial<Salon>): Promise<Salon> {
        const allData = this.getData();
        const index = allData.salons.findIndex(s => s.id === id);
        if (index === -1) throw new Error(`Salon ${id} not found`);
        allData.salons[index] = { ...allData.salons[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.salons[index];
    }

    async deleteSalon(id: number): Promise<void> {
        const allData = this.getData();
        allData.salons = allData.salons.filter(s => s.id !== id);
        this.saveData(allData);
    }
    async getUserSalons(userId: number): Promise<UserSalon[]> { throw new Error('Not implemented'); }
    async getSalonUsers(salonId: number): Promise<UserSalon[]> { throw new Error('Not implemented'); }
    async addUserToSalon(userId: number, salonId: number, role: any): Promise<UserSalon> { throw new Error('Not implemented'); }
    async removeUserFromSalon(userId: number, salonId: number): Promise<void> { throw new Error('Not implemented'); }
    async getSalonSettings(salonId: number): Promise<SalonSettings | null> {
        const settings = this.getData().salonSettings;
        return settings.find(s => s.salonId === salonId) || null;
    }
    async updateSalonSettings(salonId: number, data: any): Promise<SalonSettings> {
        const allData = this.getData();
        const index = allData.salonSettings.findIndex(s => s.salonId === salonId);

        if (index === -1) {
            // Create if not exists
            const id = this.generateId(allData.salonSettings);
            const newSettings: SalonSettings = {
                ...data,
                id,
                salonId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            allData.salonSettings.push(newSettings);
            this.saveData(allData);
            return newSettings;
        }

        allData.salonSettings[index] = { ...allData.salonSettings[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.salonSettings[index];
    }
    async getSalonStats(salonId: number): Promise<SalonStats> {
        const allData = this.getData();
        const salon = allData.salons.find(s => s.id === salonId);
        const salonName = salon?.name || 'Unknown Salon';

        const salonBookings = allData.bookings.filter(b => b.salonId === salonId);
        const salonIncomes = allData.incomes.filter(i => i.salonId === salonId);
        const salonExpenses = allData.expenses.filter(e => e.salonId === salonId);
        const salonWorkers = allData.workers.filter(w => w.salonId === salonId);
        const salonClients = allData.clients.filter(c => c.salonId === salonId);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthIncomes = salonIncomes.filter(i => new Date(i.date) >= startOfMonth);
        const monthExpenses = salonExpenses.filter(e => new Date(e.date) >= startOfMonth);

        return {
            salonId,
            salonName,
            totalWorkers: salonWorkers.length,
            totalClients: salonClients.length,
            totalBookings: salonBookings.length,
            completedBookings: salonBookings.filter(b => b.status === 'Finished' || b.status === 'Closed').length,
            totalRevenue: salonIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed').reduce((sum, i) => sum + i.finalAmount, 0),
            monthRevenue: monthIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed').reduce((sum, i) => sum + i.finalAmount, 0),
            totalExpenses: salonExpenses.reduce((sum, e) => sum + e.amount, 0),
            monthExpenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        };
    }

    async getDashboardAnalytics(salonId: number): Promise<DashboardAnalytics> {
        const { revenueTrendData, expenseDistributionData, topPerformersData } = require('../../mock/datas/dashboardData');
        return {
            revenueTrend: revenueTrendData,
            expenseDistribution: expenseDistributionData,
            topPerformers: topPerformersData
        };
    }

    async getWorkerStats(id: number): Promise<WorkerStats | null> {
        const allData = this.getData();
        const worker = allData.workers.find(w => w.id === id);
        if (!worker) return null;

        const workerBookings = allData.bookings.filter(b => (b.workerIds || []).includes(id));
        const workerIncomes = allData.incomes.filter(i => (i.workerIds || []).includes(id));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return {
            workerId: id,
            salonId: worker.salonId,
            name: worker.name,
            totalBookings: workerBookings.length,
            totalClients: new Set(workerBookings.map(b => b.clientId)).size,
            completedBookings: workerBookings.filter(b => b.status === 'Finished' || b.status === 'Closed').length,
            totalRevenue: workerIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed').reduce((sum, i) => sum + i.finalAmount, 0),
            monthRevenue: workerIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed' && new Date(i.date) >= startOfMonth).reduce((sum, i) => sum + i.finalAmount, 0),
            yearRevenue: workerIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed' && new Date(i.date) >= startOfYear).reduce((sum, i) => sum + i.finalAmount, 0),
            avgRating: 0, // Mock
            totalReviews: 0 // Mock
        };
    }

    async getClientByEmail(salonId: number, email: string): Promise<Client | null> {
        return this.getData().clients.find(c => c.salonId === salonId && c.email === email) || null;
    }

    async getClientByPhone(salonId: number, phone: string): Promise<Client | null> {
        return this.getData().clients.find(c => c.salonId === salonId && c.phone === phone) || null;
    }

    async getClientStats(id: number): Promise<ClientStats | null> {
        const allData = this.getData();
        const client = allData.clients.find(c => c.id === id);
        if (!client) return null;

        const clientBookings = allData.bookings.filter(b => b.clientId === id);
        const clientIncomes = allData.incomes.filter(i => i.clientId === id);

        return {
            clientId: id,
            salonId: client.salonId,
            name: client.name,
            totalBookings: clientBookings.length,
            completedBookings: clientBookings.filter(b => b.status === 'Finished' || b.status === 'Closed').length,
            totalSpent: clientIncomes.filter(i => i.status === 'Validated' || i.status === 'Closed').reduce((sum, i) => sum + i.finalAmount, 0),
            lastBookingDate: clientBookings.length > 0 ? new Date(Math.max(...clientBookings.map(b => new Date(b.date + 'T' + b.time).getTime()))) : undefined,
            avgRatingGiven: 0 // Mock
        };
    }

    async getClientAnalytics(salonId: number): Promise<ClientAnalytics> {
        // In local demo mode, we use the predefined mock data
        const { clientTrendData, clientDistributionData, recentClientActivity } = require('../../mock/datas/clientData');

        return {
            trend: clientTrendData,
            distribution: clientDistributionData,
            recentActivity: recentClientActivity
        };
    }
    // Service Categories
    async getServiceCategories(salonId: number): Promise<ServiceCategory[]> {
        return this.getData().serviceCategories.filter(sc => sc.salonId === salonId);
    }

    async getServiceCategory(id: number): Promise<ServiceCategory | null> {
        const categories = this.getData().serviceCategories;
        return categories.find(c => c.id === id) || null;
    }

    async createServiceCategory(data: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategory> {
        const allData = this.getData();
        const id = this.generateId(allData.serviceCategories);
        const newCategory: ServiceCategory = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        allData.serviceCategories.push(newCategory);
        this.saveData(allData);
        return newCategory;
    }

    async updateServiceCategory(id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory> {
        const allData = this.getData();
        const index = allData.serviceCategories.findIndex(c => c.id === id);
        if (index === -1) throw new Error(`ServiceCategory ${id} not found`);
        allData.serviceCategories[index] = { ...allData.serviceCategories[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.serviceCategories[index];
    }

    async deleteServiceCategory(id: number): Promise<void> {
        const allData = this.getData();
        allData.serviceCategories = allData.serviceCategories.filter(c => c.id !== id);
        this.saveData(allData);
    }
    async getServicesByCategory(categoryId: number): Promise<Service[]> {
        return this.getData().services.filter(s => s.categoryId === categoryId);
    }

    async getProducts(salonId: number): Promise<Product[]> {
        return this.getData().products.filter(p => p.salonId === salonId);
    }

    async getProduct(id: number): Promise<Product | null> {
        return this.getData().products.find(p => p.id === id) || null;
    }

    async getProductBySku(salonId: number, sku: string): Promise<Product | null> {
        return this.getData().products.find(p => p.salonId === salonId && p.sku === sku) || null;
    }

    async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const allData = this.getData();
        const id = this.generateId(allData.products);
        const newProduct: Product = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        allData.products.push(newProduct);
        this.saveData(allData);
        return newProduct;
    }

    async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
        const allData = this.getData();
        const index = allData.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Product ${id} not found`);
        allData.products[index] = { ...allData.products[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.products[index];
    }

    async deleteProduct(id: number): Promise<void> {
        const allData = this.getData();
        allData.products = allData.products.filter(p => p.id !== id);
        this.saveData(allData);
    }

    async updateProductStock(id: number, quantity: number): Promise<Product> {
        const product = await this.getProduct(id);
        if (!product) throw new Error(`Product ${id} not found`);
        return this.updateProduct(id, { stock: product.stock + quantity });
    }

    async getBookingWithRelations(id: number): Promise<BookingWithRelations | null> {
        const allData = this.getData();
        const booking = allData.bookings.find(b => b.id === id);
        if (!booking) return null;

        const client = allData.clients.find(c => c.id === booking.clientId);
        if (!client) throw new Error(`Client ${booking.clientId} for booking ${id} not found`);

        const workers = allData.workers.filter(w => (booking.workerIds || []).includes(w.id));
        const services = allData.services.filter(s => (booking.serviceIds || []).includes(s.id));

        return {
            ...booking,
            client,
            workers,
            services
        };
    }

    async getBookingsByClient(clientId: number): Promise<Booking[]> {
        return this.getData().bookings.filter(b => b.clientId === clientId);
    }

    async getBookingsByWorker(workerId: number): Promise<Booking[]> {
        return this.getData().bookings.filter(b => (b.workerIds || []).includes(workerId));
    }

    async getBookingsByDate(salonId: number, date: string): Promise<Booking[]> {
        return this.getData().bookings.filter(b => b.salonId === salonId && b.date === date);
    }

    async addWorkerToBooking(bookingId: number, workerId: number): Promise<void> {
        const booking = await this.getBooking(bookingId);
        if (!booking) throw new Error(`Booking ${bookingId} not found`);
        const workerIds = Array.from(new Set([...(booking.workerIds || []), workerId]));
        await this.updateBooking(bookingId, { workerIds });
    }

    async removeWorkerFromBooking(bookingId: number, workerId: number): Promise<void> {
        const booking = await this.getBooking(bookingId);
        if (!booking) throw new Error(`Booking ${bookingId} not found`);
        const workerIds = (booking.workerIds || []).filter(id => id !== workerId);
        await this.updateBooking(bookingId, { workerIds });
    }

    async getBookingWorkers(bookingId: number): Promise<SalonWorker[]> {
        const booking = await this.getBooking(bookingId);
        if (!booking) return [];
        return this.getData().workers.filter(w => (booking.workerIds || []).includes(w.id));
    }

    async addServiceToBooking(bookingId: number, serviceId: number): Promise<void> {
        const booking = await this.getBooking(bookingId);
        if (!booking) throw new Error(`Booking ${bookingId} not found`);
        const serviceIds = Array.from(new Set([...(booking.serviceIds || []), serviceId]));
        await this.updateBooking(bookingId, { serviceIds });
    }

    async removeServiceFromBooking(bookingId: number, serviceId: number): Promise<void> {
        const booking = await this.getBooking(bookingId);
        if (!booking) throw new Error(`Booking ${bookingId} not found`);
        const serviceIds = (booking.serviceIds || []).filter(id => id !== serviceId);
        await this.updateBooking(bookingId, { serviceIds });
    }

    async getBookingServices(bookingId: number): Promise<Service[]> {
        const booking = await this.getBooking(bookingId);
        if (!booking) return [];
        return this.getData().services.filter(s => (booking.serviceIds || []).includes(s.id));
    }

    async getIncomeWithRelations(id: number): Promise<IncomeWithRelations | null> {
        const allData = this.getData();
        const income = allData.incomes.find(i => i.id === id);
        if (!income) return null;

        const client = income.clientId ? allData.clients.find(c => c.id === income.clientId) : undefined;
        const booking = income.bookingId ? allData.bookings.find(b => b.id === income.bookingId) : undefined;
        const services = allData.services.filter(s => (income.serviceIds || []).includes(s.id));

        // Note: Real implementation would join with income_worker_shares
        return {
            ...income,
            client,
            booking,
            workers: [], // Simplified for now
            services,
            products: [] // Simplified for now
        };
    }

    async getIncomesByClient(clientId: number): Promise<Income[]> {
        return this.getData().incomes.filter(i => i.clientId === clientId);
    }

    async getIncomesByWorker(workerId: number): Promise<Income[]> {
        return this.getData().incomes.filter(i => (i.workerIds || []).includes(workerId));
    }

    async addWorkerToIncome(incomeId: number, workerId: number, amount: number, percentage: number): Promise<IncomeWorkerShare> {
        throw new Error('IncomeWorkerShare table not implemented in local data yet');
    }

    async removeWorkerFromIncome(incomeId: number, workerId: number): Promise<void> {
        throw new Error('IncomeWorkerShare table not implemented in local data yet');
    }

    async getIncomeWorkerShares(incomeId: number): Promise<IncomeWorkerShare[]> {
        return []; // Not implemented
    }

    async addServiceToIncome(incomeId: number, serviceId: number): Promise<void> {
        const income = await this.getIncome(incomeId);
        if (!income) throw new Error(`Income ${incomeId} not found`);
        const serviceIds = Array.from(new Set([...(income.serviceIds || []), serviceId]));
        await this.updateIncome(incomeId, { serviceIds });
    }

    async removeServiceFromIncome(incomeId: number, serviceId: number): Promise<void> {
        const income = await this.getIncome(incomeId);
        if (!income) throw new Error(`Income ${incomeId} not found`);
        const serviceIds = (income.serviceIds || []).filter(id => id !== serviceId);
        await this.updateIncome(incomeId, { serviceIds });
    }

    async getIncomeServices(incomeId: number): Promise<Service[]> {
        const income = await this.getIncome(incomeId);
        if (!income) return [];
        return this.getData().services.filter(s => (income.serviceIds || []).includes(s.id));
    }

    async addProductToIncome(incomeId: number, productId: number, quantity: number): Promise<void> {
        throw new Error('IncomeProduct table not implemented in local data yet');
    }

    async removeProductFromIncome(incomeId: number, productId: number): Promise<void> {
        throw new Error('IncomeProduct table not implemented in local data yet');
    }

    async getIncomeProducts(incomeId: number): Promise<any[]> {
        return [];
    }

    async getExpensesByCategory(categoryId: number): Promise<Expense[]> {
        return this.getData().expenses.filter(e => e.categoryId === categoryId);
    }
    async getReviews(salonId: number, filters?: ReviewFilters): Promise<Review[]> {
        let reviews = this.getData().reviews.filter(r => r.salonId === salonId);
        if (filters?.workerId) reviews = reviews.filter(r => r.workerId === filters.workerId);
        if (filters?.clientId) reviews = reviews.filter(r => r.clientId === filters.clientId);
        if (filters?.isApproved !== undefined) reviews = reviews.filter(r => r.isApproved === filters.isApproved);
        return reviews;
    }

    async getReview(id: number): Promise<Review | null> {
        return this.getData().reviews.find(r => r.id === id) || null;
    }

    async getReviewsByWorker(workerId: number): Promise<Review[]> {
        return this.getData().reviews.filter(r => r.workerId === workerId);
    }

    async getReviewsByClient(clientId: number): Promise<Review[]> {
        return this.getData().reviews.filter(r => r.clientId === clientId);
    }

    async createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
        const allData = this.getData();
        const id = this.generateId(allData.reviews);
        const newReview: Review = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        allData.reviews.push(newReview);
        this.saveData(allData);
        return newReview;
    }

    async updateReview(id: number, data: Partial<Review>): Promise<Review> {
        const allData = this.getData();
        const index = allData.reviews.findIndex(r => r.id === id);
        if (index === -1) throw new Error(`Review ${id} not found`);
        allData.reviews[index] = { ...allData.reviews[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.reviews[index];
    }

    async deleteReview(id: number): Promise<void> {
        const allData = this.getData();
        allData.reviews = allData.reviews.filter(r => r.id !== id);
        this.saveData(allData);
    }

    async approveReview(id: number): Promise<Review> {
        return this.updateReview(id, { isApproved: true });
    }

    async getPromoCodes(salonId: number): Promise<PromoCode[]> {
        return this.getData().promoCodes.filter(p => p.salonId === salonId);
    }

    async getPromoCode(id: number): Promise<PromoCode | null> {
        return this.getData().promoCodes.find(p => p.id === id) || null;
    }

    async getPromoCodeByCode(salonId: number, code: string): Promise<PromoCode | null> {
        return this.getData().promoCodes.find(p => p.salonId === salonId && p.code === code) || null;
    }

    async createPromoCode(data: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromoCode> {
        const allData = this.getData();
        const id = this.generateId(allData.promoCodes);
        const newCode: PromoCode = {
            ...data,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        allData.promoCodes.push(newCode);
        this.saveData(allData);
        return newCode;
    }

    async updatePromoCode(id: number, data: Partial<PromoCode>): Promise<PromoCode> {
        const allData = this.getData();
        const index = allData.promoCodes.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`PromoCode ${id} not found`);
        allData.promoCodes[index] = { ...allData.promoCodes[index], ...data, updatedAt: new Date() };
        this.saveData(allData);
        return allData.promoCodes[index];
    }

    async deletePromoCode(id: number): Promise<void> {
        const allData = this.getData();
        allData.promoCodes = allData.promoCodes.filter(p => p.id !== id);
        this.saveData(allData);
    }

    async incrementPromoCodeUsage(id: number): Promise<void> {
        const code = await this.getPromoCode(id);
        if (code) await this.updatePromoCode(id, { usageCount: (code.usageCount || 0) + 1 });
    }

    async getInteractionHistory(entityType: string, entityId: number): Promise<InteractionHistory[]> {
        return []; // Simplified, usually not stored in local storage for demo
    }

    async createInteractionHistory(data: any): Promise<InteractionHistory> {
        return { ...data, id: Date.now(), timestamp: new Date() }; // Mock
    }

    async getComments(entityType: string, entityId: number): Promise<SalonComment[]> {
        return []; // Simplified
    }

    async createComment(data: any): Promise<SalonComment> {
        return { ...data, id: Date.now(), timestamp: new Date() }; // Mock
    }

    async deleteComment(id: number): Promise<void> {
        // Mock
    }

    async initialize(): Promise<void> {
        // Ensure storage exists
        this.getData();
    }

    async cleanup(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
    }
}
