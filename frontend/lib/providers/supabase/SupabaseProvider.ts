/**
 * SUPABASE PROVIDER
 * 
 * Complete implementation of IDataProvider for Supabase
 * Supports multi-tenant, pagination, filters, and relations
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { IDataProvider } from '@/lib/providers/types';
import type {
    User, UserSalon, Salon, SalonSettings, SalonStats,
    SalonWorker, WorkerStats,
    Client, ClientStats, ClientAnalytics,
    DashboardAnalytics,
    ServiceCategory, Service, Product,
    Booking, BookingWithRelations, BookingCreateData, BookingFilters,
    Income, IncomeWithRelations, IncomeCreateData, IncomeWorkerShare, IncomeFilters,
    ExpenseCategory, Expense, ExpenseFilters,
    Review, ReviewFilters,
    PromoCode,
    // Audit
    InteractionHistory, SalonComment,
    PaginationParams, PaginatedResponse
} from '@/types/index';

export class SupabaseProvider implements IDataProvider {
    readonly mode = 'demo-supabase' as const;
    readonly isDemo = true;

    constructor() {
        if (!isSupabaseConfigured()) {
            console.warn('⚠️ Supabase not configured properly');
        }
    }

    // ============================================
    // USERS
    // ============================================

    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch users: ${error.message}`);
        return (data || []).map(this.mapUserFromDB);
    }

    async getUser(id: number): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapUserFromDB(data) : null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data ? this.mapUserFromDB(data) : null;
    }

    async getUserByCode(userCode: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_code', userCode)
            .single();

        if (error) return null;
        return data ? this.mapUserFromDB(data) : null;
    }

    async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const { data: created, error } = await supabase
            .from('users')
            .insert([this.mapUserToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create user: ${error.message}`);
        return this.mapUserFromDB(created);
    }

    async updateUser(id: number, data: Partial<User>): Promise<User> {
        const { data: updated, error } = await supabase
            .from('users')
            .update(this.mapUserToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update user: ${error.message}`);
        return this.mapUserFromDB(updated);
    }

    async deleteUser(id: number): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete user: ${error.message}`);
    }

    // ============================================
    // SALONS
    // ============================================

    async getSalons(): Promise<Salon[]> {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch salons: ${error.message}`);
        return (data || []).map(this.mapSalonFromDB);
    }

    async getSalon(id: number): Promise<Salon | null> {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapSalonFromDB(data) : null;
    }

    async getSalonBySlug(slug: string): Promise<Salon | null> {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data ? this.mapSalonFromDB(data) : null;
    }

    async createSalon(data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Salon> {
        const { data: created, error } = await supabase
            .from('salons')
            .insert([this.mapSalonToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create salon: ${error.message}`);
        return this.mapSalonFromDB(created);
    }

    async updateSalon(id: number, data: Partial<Salon>): Promise<Salon> {
        const { data: updated, error } = await supabase
            .from('salons')
            .update(this.mapSalonToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update salon: ${error.message}`);
        return this.mapSalonFromDB(updated);
    }

    async deleteSalon(id: number): Promise<void> {
        const { error } = await supabase
            .from('salons')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete salon: ${error.message}`);
    }

    // User-Salon Junction
    async getUserSalons(userId: number): Promise<UserSalon[]> {
        const { data, error } = await supabase
            .from('user_salons')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw new Error(`Failed to fetch user salons: ${error.message}`);
        return (data || []).map(this.mapUserSalonFromDB);
    }

    async getSalonUsers(salonId: number): Promise<UserSalon[]> {
        const { data, error } = await supabase
            .from('user_salons')
            .select('*')
            .eq('salon_id', salonId)
            .eq('is_active', true);

        if (error) throw new Error(`Failed to fetch salon users: ${error.message}`);
        return (data || []).map(this.mapUserSalonFromDB);
    }

    async addUserToSalon(userId: number, salonId: number, roleInSalon: 'Manager' | 'Worker'): Promise<UserSalon> {
        const { data, error } = await supabase
            .from('user_salons')
            .insert([{
                user_id: userId,
                salon_id: salonId,
                role_in_salon: roleInSalon,
                is_active: true
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to add user to salon: ${error.message}`);
        return this.mapUserSalonFromDB(data);
    }

    async removeUserFromSalon(userId: number, salonId: number): Promise<void> {
        const { error } = await supabase
            .from('user_salons')
            .delete()
            .eq('user_id', userId)
            .eq('salon_id', salonId);

        if (error) throw new Error(`Failed to remove user from salon: ${error.message}`);
    }

    // Salon Settings
    async getSalonSettings(salonId: number): Promise<SalonSettings | null> {
        const { data, error } = await supabase
            .from('salon_settings')
            .select('*')
            .eq('salon_id', salonId)
            .single();

        if (error) return null;
        return data ? this.mapSalonSettingsFromDB(data) : null;
    }

    async updateSalonSettings(salonId: number, data: Partial<SalonSettings>): Promise<SalonSettings> {
        const { data: updated, error } = await supabase
            .from('salon_settings')
            .update(this.mapSalonSettingsToDB(data))
            .eq('salon_id', salonId)
            .select()
            .single();

        if (error) {
            // If not exists, create
            const { data: created, error: createError } = await supabase
                .from('salon_settings')
                .insert([{ salon_id: salonId, ...this.mapSalonSettingsToDB(data) }])
                .select()
                .single();

            if (createError) throw new Error(`Failed to update salon settings: ${createError.message}`);
            return this.mapSalonSettingsFromDB(created);
        }

        return this.mapSalonSettingsFromDB(updated);
    }

    // Salon Stats (from view)
    async getSalonStats(salonId: number): Promise<SalonStats> {
        const { data, error } = await supabase
            .from('salon_stats')
            .select('*')
            .eq('salon_id', salonId)
            .single();

        if (error) throw new Error(`Failed to fetch salon stats: ${error.message}`);
        return this.mapSalonStatsFromDB(data);
    }

    async getDashboardAnalytics(salonId: number): Promise<DashboardAnalytics> {
        // For demo-supabase mode, we provide consistent mock stats
        if (this.isDemo) {
            const { revenueTrendData, expenseDistributionData } = require('../../mock/datas/dashboardData');
            return {
                revenueTrend: revenueTrendData,
                expenseDistribution: expenseDistributionData
            };
        }

        // Production implementation (fallback)
        return {
            revenueTrend: [],
            expenseDistribution: []
        };
    }

    // ============================================
    // WORKERS
    // ============================================

    async getWorkers(salonId: number): Promise<SalonWorker[]> {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .eq('salon_id', salonId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch workers: ${error.message}`);
        return (data || []).map(this.mapWorkerFromDB);
    }

    async getWorker(id: number): Promise<SalonWorker | null> {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapWorkerFromDB(data) : null;
    }

    async getWorkerStats(id: number): Promise<WorkerStats | null> {
        const { data, error } = await supabase
            .from('worker_stats')
            .select('*')
            .eq('worker_id', id)
            .single();

        if (error) return null;
        return data ? this.mapWorkerStatsFromDB(data) : null;
    }

    async createWorker(data: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalonWorker> {
        const dbWorker = {
            salon_id: data.salonId,
            user_id: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            avatar_url: data.avatarUrl,
            color: data.color,
            status: data.status,
            sharing_key: data.sharingKey,
            bio: data.bio,
            specialties: data.specialties,
            is_active: data.isActive ?? true
        };

        const { data: created, error } = await supabase
            .from('workers')
            .insert([dbWorker])
            .select()
            .single();

        if (error) throw new Error(`Failed to create worker: ${error.message}`);
        return this.mapWorkerFromDB(created);
    }

    async updateWorker(id: number, data: Partial<SalonWorker>): Promise<SalonWorker> {
        const dbWorker: any = {};
        if (data.salonId !== undefined) dbWorker.salon_id = data.salonId;
        if (data.userId !== undefined) dbWorker.user_id = data.userId;
        if (data.name !== undefined) dbWorker.name = data.name;
        if (data.email !== undefined) dbWorker.email = data.email;
        if (data.phone !== undefined) dbWorker.phone = data.phone;
        if (data.avatarUrl !== undefined) dbWorker.avatar_url = data.avatarUrl;
        if (data.color !== undefined) dbWorker.color = data.color;
        if (data.status !== undefined) dbWorker.status = data.status;
        if (data.sharingKey !== undefined) dbWorker.sharing_key = data.sharingKey;
        if (data.bio !== undefined) dbWorker.bio = data.bio;
        if (data.specialties !== undefined) dbWorker.specialties = data.specialties;
        if (data.isActive !== undefined) dbWorker.is_active = data.isActive;

        const { data: updated, error } = await supabase
            .from('workers')
            .update(dbWorker)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update worker: ${error.message}`);
        return this.mapWorkerFromDB(updated);
    }

    async deleteWorker(id: number): Promise<void> {
        const { error } = await supabase
            .from('workers')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete worker: ${error.message}`);
    }

    // ============================================
    // CLIENTS
    // ============================================

    async getClients(salonId: number): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('salon_id', salonId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
        return (data || []).map(this.mapClientFromDB);
    }

    async getClient(id: number): Promise<Client | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapClientFromDB(data) : null;
    }

    async getClientByEmail(salonId: number, email: string): Promise<Client | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('salon_id', salonId)
            .eq('email', email)
            .single();

        if (error) return null;
        return data ? this.mapClientFromDB(data) : null;
    }

    async getClientByPhone(salonId: number, phone: string): Promise<Client | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('salon_id', salonId)
            .eq('phone', phone)
            .single();

        if (error) return null;
        return data ? this.mapClientFromDB(data) : null;
    }

    async getClientStats(id: number): Promise<ClientStats | null> {
        const { data, error } = await supabase
            .from('client_stats')
            .select('*')
            .eq('client_id', id)
            .single();

        if (error) return null;
        return data ? this.mapClientStatsFromDB(data) : null;
    }

    async getClientAnalytics(salonId: number): Promise<ClientAnalytics> {
        // For demo-supabase mode, we provide consistent mock stats
        // In a real production mode (not demo), we would call a RPC or aggregate
        if (this.isDemo) {
            const { clientTrendData, clientDistributionData, recentClientActivity } = require('../../mock/datas/clientData');
            return {
                trend: clientTrendData,
                distribution: clientDistributionData,
                recentActivity: recentClientActivity
            };
        }

        // Production implementation (fallback)
        return {
            trend: [],
            distribution: [],
            recentActivity: []
        };
    }

    async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
        const dbClient = {
            salon_id: data.salonId,
            user_id: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postal_code: data.postalCode,
            birth_date: data.birthDate,
            notes: data.notes,
            is_active: data.isActive ?? true
        };

        const { data: created, error } = await supabase
            .from('clients')
            .insert([dbClient])
            .select()
            .single();

        if (error) throw new Error(`Failed to create client: ${error.message}`);
        return this.mapClientFromDB(created);
    }

    async updateClient(id: number, data: Partial<Client>): Promise<Client> {
        const dbClient: any = {};
        if (data.salonId !== undefined) dbClient.salon_id = data.salonId;
        if (data.userId !== undefined) dbClient.user_id = data.userId;
        if (data.name !== undefined) dbClient.name = data.name;
        if (data.email !== undefined) dbClient.email = data.email;
        if (data.phone !== undefined) dbClient.phone = data.phone;
        if (data.address !== undefined) dbClient.address = data.address;
        if (data.city !== undefined) dbClient.city = data.city;
        if (data.postalCode !== undefined) dbClient.postal_code = data.postalCode;
        if (data.birthDate !== undefined) dbClient.birth_date = data.birthDate;
        if (data.notes !== undefined) dbClient.notes = data.notes;
        if (data.isActive !== undefined) dbClient.is_active = data.isActive;

        const { data: updated, error } = await supabase
            .from('clients')
            .update(dbClient)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update client: ${error.message}`);
        return this.mapClientFromDB(updated);
    }

    async deleteClient(id: number): Promise<void> {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete client: ${error.message}`);
    }

    // ============================================
    // MAPPERS
    // ============================================

    private mapUserFromDB(db: any): User {
        return {
            id: db.id,
            userCode: db.user_code,
            email: db.email,
            firstName: db.first_name,
            lastName: db.last_name,
            phone: db.phone,
            role: db.role,
            isActive: db.is_active,
            emailVerifiedAt: db.email_verified_at ? new Date(db.email_verified_at) : undefined,
            lastLoginAt: db.last_login_at ? new Date(db.last_login_at) : undefined,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at)
        };
    }

    private mapUserToDB(user: Partial<User>): any {
        const db: any = {};
        if (user.userCode !== undefined) db.user_code = user.userCode;
        if (user.email !== undefined) db.email = user.email;
        if (user.firstName !== undefined) db.first_name = user.firstName;
        if (user.lastName !== undefined) db.last_name = user.lastName;
        if (user.phone !== undefined) db.phone = user.phone;
        if (user.role !== undefined) db.role = user.role;
        if (user.isActive !== undefined) db.is_active = user.isActive;
        return db;
    }

    private mapUserSalonFromDB(db: any): UserSalon {
        return {
            id: db.id,
            userId: db.user_id,
            salonId: db.salon_id,
            roleInSalon: db.role_in_salon,
            isActive: db.is_active,
            joinedAt: new Date(db.joined_at),
            createdAt: new Date(db.created_at)
        };
    }

    private mapSalonFromDB(db: any): Salon {
        return {
            id: db.id,
            name: db.name,
            slug: db.slug,
            address: db.address,
            city: db.city,
            postalCode: db.postal_code,
            country: db.country,
            phone: db.phone,
            email: db.email,
            website: db.website,
            logoUrl: db.logo_url,
            timezone: db.timezone,
            currency: db.currency,
            subscriptionPlan: db.subscription_plan,
            subscriptionStatus: db.subscription_status,
            subscriptionEndsAt: db.subscription_ends_at ? new Date(db.subscription_ends_at) : undefined,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapSalonToDB(salon: Partial<Salon>): any {
        const db: any = {};
        if (salon.name !== undefined) db.name = salon.name;
        if (salon.slug !== undefined) db.slug = salon.slug;
        if (salon.address !== undefined) db.address = salon.address;
        if (salon.city !== undefined) db.city = salon.city;
        if (salon.postalCode !== undefined) db.postal_code = salon.postalCode;
        if (salon.country !== undefined) db.country = salon.country;
        if (salon.phone !== undefined) db.phone = salon.phone;
        if (salon.email !== undefined) db.email = salon.email;
        if (salon.website !== undefined) db.website = salon.website;
        if (salon.logoUrl !== undefined) db.logo_url = salon.logoUrl;
        if (salon.timezone !== undefined) db.timezone = salon.timezone;
        if (salon.currency !== undefined) db.currency = salon.currency;
        if (salon.subscriptionPlan !== undefined) db.subscription_plan = salon.subscriptionPlan;
        if (salon.subscriptionStatus !== undefined) db.subscription_status = salon.subscriptionStatus;
        if (salon.isActive !== undefined) db.is_active = salon.isActive;
        if (salon.createdBy !== undefined) db.created_by = salon.createdBy;
        if (salon.updatedBy !== undefined) db.updated_by = salon.updatedBy;
        return db;
    }

    private mapSalonSettingsFromDB(db: any): SalonSettings {
        return {
            id: db.id,
            salonId: db.salon_id,
            allowOnlineBooking: db.allow_online_booking,
            bookingAdvanceDays: db.booking_advance_days,
            bookingSlotDuration: db.booking_slot_duration,
            requireClientApproval: db.require_client_approval,
            sendEmailConfirmations: db.send_email_confirmations,
            sendSmsReminders: db.send_sms_reminders,
            tipsEnabled: db.tips_enabled,
            tipsDistributionRule: db.tips_distribution_rule,
            defaultWorkerSharePct: db.default_worker_share_pct,
            openingHours: db.opening_hours || [],
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at)
        };
    }

    private mapSalonSettingsToDB(settings: Partial<SalonSettings>): any {
        const db: any = {};
        if (settings.allowOnlineBooking !== undefined) db.allow_online_booking = settings.allowOnlineBooking;
        if (settings.bookingAdvanceDays !== undefined) db.booking_advance_days = settings.bookingAdvanceDays;
        if (settings.bookingSlotDuration !== undefined) db.booking_slot_duration = settings.bookingSlotDuration;
        if (settings.requireClientApproval !== undefined) db.require_client_approval = settings.requireClientApproval;
        if (settings.sendEmailConfirmations !== undefined) db.send_email_confirmations = settings.sendEmailConfirmations;
        if (settings.sendSmsReminders !== undefined) db.send_sms_reminders = settings.sendSmsReminders;
        if (settings.tipsEnabled !== undefined) db.tips_enabled = settings.tipsEnabled;
        if (settings.tipsDistributionRule !== undefined) db.tips_distribution_rule = settings.tipsDistributionRule;
        if (settings.defaultWorkerSharePct !== undefined) db.default_worker_share_pct = settings.defaultWorkerSharePct;
        if (settings.openingHours !== undefined) db.opening_hours = settings.openingHours;
        return db;
    }

    private mapSalonStatsFromDB(db: any): SalonStats {
        return {
            salonId: db.salon_id,
            salonName: db.salon_name,
            totalWorkers: db.total_workers || 0,
            totalClients: db.total_clients || 0,
            totalBookings: db.total_bookings || 0,
            completedBookings: db.completed_bookings || 0,
            totalRevenue: db.total_revenue || 0,
            monthRevenue: db.month_revenue || 0,
            totalExpenses: db.total_expenses || 0,
            monthExpenses: db.month_expenses || 0
        };
    }

    private mapWorkerFromDB(db: any): SalonWorker {
        return {
            id: db.id,
            salonId: db.salon_id,
            userId: db.user_id,
            name: db.name,
            email: db.email,
            phone: db.phone,
            avatarUrl: db.avatar_url,
            color: db.color,
            status: db.status,
            sharingKey: db.sharing_key,
            bio: db.bio,
            specialties: db.specialties || [],
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapWorkerToDB(worker: Partial<SalonWorker>): any {
        const db: any = {};
        if (worker.salonId !== undefined) db.salon_id = worker.salonId;
        if (worker.userId !== undefined) db.user_id = worker.userId;
        if (worker.name !== undefined) db.name = worker.name;
        if (worker.email !== undefined) db.email = worker.email;
        if (worker.phone !== undefined) db.phone = worker.phone;
        if (worker.avatarUrl !== undefined) db.avatar_url = worker.avatarUrl;
        if (worker.color !== undefined) db.color = worker.color;
        if (worker.status !== undefined) db.status = worker.status;
        if (worker.sharingKey !== undefined) db.sharing_key = worker.sharingKey;
        if (worker.bio !== undefined) db.bio = worker.bio;
        if (worker.specialties !== undefined) db.specialties = worker.specialties;
        if (worker.isActive !== undefined) db.is_active = worker.isActive;
        if (worker.createdBy !== undefined) db.created_by = worker.createdBy;
        if (worker.updatedBy !== undefined) db.updated_by = worker.updatedBy;
        return db;
    }

    private mapWorkerStatsFromDB(db: any): WorkerStats {
        return {
            workerId: db.worker_id,
            salonId: db.salon_id,
            name: db.name,
            totalBookings: db.total_bookings || 0,
            totalClients: db.total_clients || 0,
            completedBookings: db.completed_bookings || 0,
            totalRevenue: db.total_revenue || 0,
            monthRevenue: db.month_revenue || 0,
            yearRevenue: db.year_revenue || 0,
            avgRating: db.avg_rating || 0,
            totalReviews: db.total_reviews || 0
        };
    }

    private mapClientFromDB(db: any): Client {
        return {
            id: db.id,
            salonId: db.salon_id,
            userId: db.user_id,
            name: db.name,
            email: db.email,
            phone: db.phone,
            address: db.address,
            city: db.city,
            postalCode: db.postal_code,
            birthDate: db.birth_date,
            notes: db.notes,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapClientToDB(client: Partial<Client>): any {
        const db: any = {};
        if (client.salonId !== undefined) db.salon_id = client.salonId;
        if (client.userId !== undefined) db.user_id = client.userId;
        if (client.name !== undefined) db.name = client.name;
        if (client.email !== undefined) db.email = client.email;
        if (client.phone !== undefined) db.phone = client.phone;
        if (client.address !== undefined) db.address = client.address;
        if (client.city !== undefined) db.city = client.city;
        if (client.postalCode !== undefined) db.postal_code = client.postalCode;
        if (client.birthDate !== undefined) db.birth_date = client.birthDate;
        if (client.notes !== undefined) db.notes = client.notes;
        if (client.isActive !== undefined) db.is_active = client.isActive;
        if (client.createdBy !== undefined) db.created_by = client.createdBy;
        if (client.updatedBy !== undefined) db.updated_by = client.updatedBy;
        return db;
    }

    private mapClientStatsFromDB(db: any): ClientStats {
        return {
            clientId: db.client_id,
            salonId: db.salon_id,
            name: db.name,
            totalBookings: db.total_bookings || 0,
            completedBookings: db.completed_bookings || 0,
            totalSpent: db.total_spent || 0,
            lastBookingDate: db.last_booking_date ? new Date(db.last_booking_date) : undefined,
            avgRatingGiven: db.avg_rating_given || 0
        };
    }

    // ============================================
    // SERVICE CATEGORIES
    // ============================================

    async getServiceCategories(salonId: number): Promise<ServiceCategory[]> {
        const { data, error } = await supabase
            .from('service_categories')
            .select('*')
            .eq('salon_id', salonId)
            .order('display_order', { ascending: true });

        if (error) throw new Error(`Failed to fetch service categories: ${error.message}`);
        return (data || []).map(this.mapServiceCategoryFromDB);
    }

    async getServiceCategory(id: number): Promise<ServiceCategory | null> {
        const { data, error } = await supabase
            .from('service_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapServiceCategoryFromDB(data) : null;
    }

    async createServiceCategory(data: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategory> {
        const { data: created, error } = await supabase
            .from('service_categories')
            .insert([this.mapServiceCategoryToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create service category: ${error.message}`);
        return this.mapServiceCategoryFromDB(created);
    }

    async updateServiceCategory(id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory> {
        const { data: updated, error } = await supabase
            .from('service_categories')
            .update(this.mapServiceCategoryToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update service category: ${error.message}`);
        return this.mapServiceCategoryFromDB(updated);
    }

    async deleteServiceCategory(id: number): Promise<void> {
        const { error } = await supabase
            .from('service_categories')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete service category: ${error.message}`);
    }

    // ============================================
    // SERVICES
    // ============================================

    async getServices(salonId: number): Promise<Service[]> {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('salon_id', salonId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch services: ${error.message}`);
        return (data || []).map(this.mapServiceFromDB);
    }

    async getService(id: number): Promise<Service | null> {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapServiceFromDB(data) : null;
    }

    async getServicesByCategory(categoryId: number): Promise<Service[]> {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('category_id', categoryId);

        if (error) throw new Error(`Failed to fetch services by category: ${error.message}`);
        return (data || []).map(this.mapServiceFromDB);
    }

    async createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
        const dbService = {
            salon_id: data.salonId,
            category_id: data.categoryId,
            name: data.name,
            description: data.description,
            price: data.price,
            duration: data.duration,
            icon: data.icon,
            is_active: data.isActive ?? true
        };

        const { data: created, error } = await supabase
            .from('services')
            .insert([dbService])
            .select()
            .single();

        if (error) throw new Error(`Failed to create service: ${error.message}`);
        return this.mapServiceFromDB(created);
    }

    async updateService(id: number, data: Partial<Service>): Promise<Service> {
        const dbService: any = {};
        if (data.salonId !== undefined) dbService.salon_id = data.salonId;
        if (data.categoryId !== undefined) dbService.category_id = data.categoryId;
        if (data.name !== undefined) dbService.name = data.name;
        if (data.description !== undefined) dbService.description = data.description;
        if (data.price !== undefined) dbService.price = data.price;
        if (data.duration !== undefined) dbService.duration = data.duration;
        if (data.icon !== undefined) dbService.icon = data.icon;
        if (data.isActive !== undefined) dbService.is_active = data.isActive;

        const { data: updated, error } = await supabase
            .from('services')
            .update(dbService)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update service: ${error.message}`);
        return this.mapServiceFromDB(updated);
    }

    async deleteService(id: number): Promise<void> {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete service: ${error.message}`);
    }

    // ============================================
    // PRODUCTS
    // ============================================

    async getProducts(salonId: number): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('salon_id', salonId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch products: ${error.message}`);
        return (data || []).map(this.mapProductFromDB);
    }

    async getProduct(id: number): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapProductFromDB(data) : null;
    }

    async getProductBySku(salonId: number, sku: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('salon_id', salonId)
            .eq('sku', sku)
            .single();

        if (error) return null;
        return data ? this.mapProductFromDB(data) : null;
    }

    async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const dbProduct = {
            salon_id: data.salonId,
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            image_url: data.imageUrl,
            sku: data.sku,
            is_linked_to_service: data.isLinkedToService,
            linked_service_id: data.linkedServiceId,
            is_active: data.isActive ?? true
        };

        const { data: created, error } = await supabase
            .from('products')
            .insert([dbProduct])
            .select()
            .single();

        if (error) throw new Error(`Failed to create product: ${error.message}`);
        return this.mapProductFromDB(created);
    }

    async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
        const dbProduct: any = {};
        if (data.salonId !== undefined) dbProduct.salon_id = data.salonId;
        if (data.name !== undefined) dbProduct.name = data.name;
        if (data.description !== undefined) dbProduct.description = data.description;
        if (data.price !== undefined) dbProduct.price = data.price;
        if (data.stock !== undefined) dbProduct.stock = data.stock;
        if (data.category !== undefined) dbProduct.category = data.category;
        if (data.imageUrl !== undefined) dbProduct.image_url = data.imageUrl;
        if (data.sku !== undefined) dbProduct.sku = data.sku;
        if (data.isLinkedToService !== undefined) dbProduct.is_linked_to_service = data.isLinkedToService;
        if (data.linkedServiceId !== undefined) dbProduct.linked_service_id = data.linkedServiceId;
        if (data.isActive !== undefined) dbProduct.is_active = data.isActive;

        const { data: updated, error } = await supabase
            .from('products')
            .update(dbProduct)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update product: ${error.message}`);
        return this.mapProductFromDB(updated);
    }

    async deleteProduct(id: number): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete product: ${error.message}`);
    }

    async updateProductStock(id: number, quantity: number): Promise<Product> {
        const product = await this.getProduct(id);
        if (!product) throw new Error('Product not found');

        const newStock = product.stock + quantity;
        return this.updateProduct(id, { stock: newStock });
    }

    // ============================================
    // BOOKINGS
    // ============================================

    async getBookings(
        salonId: number,
        filters?: BookingFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Booking>> {
        let query = supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('salon_id', salonId);

        // Apply filters
        if (filters?.clientId) query = query.eq('client_id', filters.clientId);
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.startDate) query = query.gte('date', filters.startDate);
        if (filters?.endDate) query = query.lte('date', filters.endDate);
        if (filters?.isSensitive !== undefined) query = query.eq('is_sensitive', filters.isSensitive);

        // Apply pagination
        const page = pagination?.page || 1;
        const perPage = pagination?.perPage || 50;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        query = query.range(from, to).order('date', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

        const total = count || 0;
        const totalPages = Math.ceil(total / perPage);

        return {
            data: (data || []).map(this.mapBookingFromDB),
            total,
            page,
            perPage,
            totalPages
        };
    }

    async getBooking(id: number): Promise<Booking | null> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapBookingFromDB(data) : null;
    }

    async getBookingWithRelations(id: number): Promise<BookingWithRelations | null> {
        const booking = await this.getBooking(id);
        if (!booking) return null;

        const [client, workers, services] = await Promise.all([
            (booking.clientId && typeof booking.clientId === 'number') ? this.getClient(booking.clientId) : Promise.resolve(undefined),
            this.getBookingWorkers(id),
            this.getBookingServices(id)
        ]);

        if (!client) return null;

        return {
            ...booking,
            client,
            workers,
            services
        };
    }

    async getBookingsByClient(clientId: number): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_id', clientId)
            .order('date', { ascending: false });

        if (error) throw new Error(`Failed to fetch bookings by client: ${error.message}`);
        return (data || []).map(this.mapBookingFromDB);
    }

    async getBookingsByWorker(workerId: number): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('booking_workers')
            .select('booking_id')
            .eq('worker_id', workerId);

        if (error) throw new Error(`Failed to fetch bookings by worker: ${error.message}`);

        const bookingIds = (data || []).map((row: any) => row.booking_id).filter(Boolean);
        if (bookingIds.length === 0) return [];

        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .in('id', bookingIds)
            .order('date', { ascending: false });

        if (bookingsError) throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
        return (bookings || []).map(this.mapBookingFromDB);
    }

    async getBookingsByDate(salonId: number, date: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('salon_id', salonId)
            .eq('date', date)
            .order('time', { ascending: true });

        if (error) throw new Error(`Failed to fetch bookings by date: ${error.message}`);
        return (data || []).map(this.mapBookingFromDB);
    }

    async createBooking(data: BookingCreateData): Promise<Booking> {

        const [hours, minutes] = data.time.split(':').map(Number);
        const endMinutes = hours * 60 + minutes + data.duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

        const { data: created, error } = await supabase
            .from('bookings')
            .insert([{
                salon_id: data.salonId,
                client_id: data.clientId,
                date: data.date,
                time: data.time,
                end_time: endTimeStr,
                duration: data.duration,
                status: data.status || 'Pending',
                notes: data.notes,
                is_sensitive: false
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create booking: ${error.message}`);

        const booking = this.mapBookingFromDB(created);

        // Add workers
        for (const workerId of data.workerIds) {
            await this.addWorkerToBooking(booking.id, workerId);
        }

        // Add services
        for (const serviceId of data.serviceIds) {
            await this.addServiceToBooking(booking.id, serviceId);
        }

        return booking;
    }

    async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
        const { data: updated, error } = await supabase
            .from('bookings')
            .update(this.mapBookingToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update booking: ${error.message}`);
        return this.mapBookingFromDB(updated);
    }

    async deleteBooking(id: number): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete booking: ${error.message}`);
    }

    // Booking-Worker Junction
    async addWorkerToBooking(bookingId: number, workerId: number): Promise<void> {
        const { error } = await supabase
            .from('booking_workers')
            .insert([{ booking_id: bookingId, worker_id: workerId }]);

        if (error) throw new Error(`Failed to add worker to booking: ${error.message}`);
    }

    async removeWorkerFromBooking(bookingId: number, workerId: number): Promise<void> {
        const { error } = await supabase
            .from('booking_workers')
            .delete()
            .eq('booking_id', bookingId)
            .eq('worker_id', workerId);

        if (error) throw new Error(`Failed to remove worker from booking: ${error.message}`);
    }

    async getBookingWorkers(bookingId: number): Promise<SalonWorker[]> {
        const { data, error } = await supabase
            .from('booking_workers')
            .select('worker_id')
            .eq('booking_id', bookingId);

        if (error) throw new Error(`Failed to fetch booking workers: ${error.message}`);

        const workerIds = (data || []).map((row: any) => row.worker_id);
        if (workerIds.length === 0) return [];

        const workers: SalonWorker[] = [];
        for (const id of workerIds) {
            const worker = await this.getWorker(id);
            if (worker) workers.push(worker);
        }

        return workers;
    }

    // Booking-Service Junction
    async addServiceToBooking(bookingId: number, serviceId: number): Promise<void> {
        const { error } = await supabase
            .from('booking_services')
            .insert([{ booking_id: bookingId, service_id: serviceId }]);

        if (error) throw new Error(`Failed to add service to booking: ${error.message}`);
    }

    async removeServiceFromBooking(bookingId: number, serviceId: number): Promise<void> {
        const { error } = await supabase
            .from('booking_services')
            .delete()
            .eq('booking_id', bookingId)
            .eq('service_id', serviceId);

        if (error) throw new Error(`Failed to remove service from booking: ${error.message}`);
    }

    async getBookingServices(bookingId: number): Promise<Service[]> {
        const { data, error } = await supabase
            .from('booking_services')
            .select('service_id')
            .eq('booking_id', bookingId);

        if (error) throw new Error(`Failed to fetch booking services: ${error.message}`);

        const serviceIds = (data || []).map((row: any) => row.service_id);
        if (serviceIds.length === 0) return [];

        const services: Service[] = [];
        for (const id of serviceIds) {
            const service = await this.getService(id);
            if (service) services.push(service);
        }

        return services;
    }

    private mapServiceCategoryFromDB(db: any): ServiceCategory {
        return {
            id: db.id,
            salonId: db.salon_id,
            name: db.name,
            description: db.description,
            color: db.color,
            icon: db.icon,
            displayOrder: db.display_order,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapServiceCategoryToDB(cat: Partial<ServiceCategory>): any {
        const db: any = {};
        if (cat.salonId !== undefined) db.salon_id = cat.salonId;
        if (cat.name !== undefined) db.name = cat.name;
        if (cat.description !== undefined) db.description = cat.description;
        if (cat.color !== undefined) db.color = cat.color;
        if (cat.icon !== undefined) db.icon = cat.icon;
        if (cat.displayOrder !== undefined) db.display_order = cat.displayOrder;
        if (cat.isActive !== undefined) db.is_active = cat.isActive;
        if (cat.createdBy !== undefined) db.created_by = cat.createdBy;
        if (cat.updatedBy !== undefined) db.updated_by = cat.updatedBy;
        return db;
    }

    private mapServiceFromDB(db: any): Service {
        return {
            id: db.id,
            salonId: db.salon_id,
            categoryId: db.category_id,
            name: db.name,
            description: db.description,
            price: db.price,
            duration: db.duration,
            icon: db.icon,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapServiceToDB(service: Partial<Service>): any {
        const db: any = {};
        if (service.salonId !== undefined) db.salon_id = service.salonId;
        if (service.categoryId !== undefined) db.category_id = service.categoryId;
        if (service.name !== undefined) db.name = service.name;
        if (service.description !== undefined) db.description = service.description;
        if (service.price !== undefined) db.price = service.price;
        if (service.duration !== undefined) db.duration = service.duration;
        if (service.icon !== undefined) db.icon = service.icon;
        if (service.isActive !== undefined) db.is_active = service.isActive;
        if (service.createdBy !== undefined) db.created_by = service.createdBy;
        if (service.updatedBy !== undefined) db.updated_by = service.updatedBy;
        return db;
    }

    private mapProductFromDB(db: any): Product {
        return {
            id: db.id,
            salonId: db.salon_id,
            name: db.name,
            description: db.description,
            price: db.price,
            stock: db.stock,
            category: db.category,
            imageUrl: db.image_url,
            sku: db.sku,
            isLinkedToService: db.is_linked_to_service,
            linkedServiceId: db.linked_service_id,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapProductToDB(product: Partial<Product>): any {
        const db: any = {};
        if (product.salonId !== undefined) db.salon_id = product.salonId;
        if (product.name !== undefined) db.name = product.name;
        if (product.description !== undefined) db.description = product.description;
        if (product.price !== undefined) db.price = product.price;
        if (product.stock !== undefined) db.stock = product.stock;
        if (product.category !== undefined) db.category = product.category;
        if (product.imageUrl !== undefined) db.image_url = product.imageUrl;
        if (product.sku !== undefined) db.sku = product.sku;
        if (product.isLinkedToService !== undefined) db.is_linked_to_service = product.isLinkedToService;
        if (product.linkedServiceId !== undefined) db.linked_service_id = product.linkedServiceId;
        if (product.isActive !== undefined) db.is_active = product.isActive;
        if (product.createdBy !== undefined) db.created_by = product.createdBy;
        if (product.updatedBy !== undefined) db.updated_by = product.updatedBy;
        return db;
    }

    private mapBookingFromDB(db: any): Booking {
        return {
            id: db.id,
            salonId: db.salon_id,
            clientId: db.client_id,
            clientName: db.client?.name || 'Unknown',
            date: db.date,
            time: db.time,
            endTime: db.end_time || '',
            duration: db.duration || 0,
            status: db.status,
            notes: db.notes,
            isSensitive: db.is_sensitive || false,
            // These would normally come from a join or separate call
            serviceIds: [],
            workerIds: [],
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapBookingToDB(booking: Partial<Booking>): any {
        const db: any = {};
        if (booking.clientId !== undefined) db.client_id = booking.clientId;
        if (booking.date !== undefined) db.date = booking.date;
        if (booking.time !== undefined) db.time = booking.time;
        if (booking.endTime !== undefined) db.end_time = booking.endTime;
        if (booking.duration !== undefined) db.duration = booking.duration;
        if (booking.status !== undefined) db.status = booking.status;
        if (booking.notes !== undefined) db.notes = booking.notes;
        if (booking.isSensitive !== undefined) db.is_sensitive = booking.isSensitive;
        if (booking.createdBy !== undefined) db.created_by = booking.createdBy;
        if (booking.updatedBy !== undefined) db.updated_by = booking.updatedBy;
        return db;
    }

    // ============================================
    // INCOME
    // ============================================

    async getIncomes(
        salonId: number,
        filters?: IncomeFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Income>> {
        let query = supabase
            .from('incomes')
            .select('*', { count: 'exact' })
            .eq('salon_id', salonId);

        // Apply filters
        if (filters?.clientId) query = query.eq('client_id', filters.clientId);
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.startDate) query = query.gte('date', filters.startDate);
        if (filters?.endDate) query = query.lte('date', filters.endDate);
        if (filters?.hasInvoice !== undefined) query = query.eq('has_invoice', filters.hasInvoice);

        // Apply pagination
        const page = pagination?.page || 1;
        const perPage = pagination?.perPage || 50;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        query = query.range(from, to).order('date', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw new Error(`Failed to fetch incomes: ${error.message}`);

        return {
            data: (data || []).map(this.mapIncomeFromDB),
            total: count || 0,
            page,
            perPage,
            totalPages: Math.ceil((count || 0) / perPage)
        };
    }

    async getIncome(id: number): Promise<Income | null> {
        const { data, error } = await supabase
            .from('incomes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapIncomeFromDB(data) : null;
    }

    async getIncomeWithRelations(id: number): Promise<IncomeWithRelations | null> {
        const income = await this.getIncome(id);
        if (!income) return null;

        const [client, booking, promoCode, workerShares, services, products] = await Promise.all([
            (income.clientId && typeof income.clientId === 'number') ? this.getClient(income.clientId) : Promise.resolve(undefined),
            income.bookingId ? this.getBooking(income.bookingId) : Promise.resolve(undefined),
            income.promoCodeId ? this.getPromoCode(income.promoCodeId) : Promise.resolve(undefined),
            this.getIncomeWorkerShares(id),
            this.getIncomeServices(id),
            this.getIncomeProducts(id)
        ]);

        // Get workers for shares
        const workers = await Promise.all(
            workerShares.map(async (share) => {
                const worker = await this.getWorker(share.workerId);
                return { worker: worker!, share };
            })
        );

        return {
            ...income,
            client: client || undefined,
            booking: booking || undefined,
            promoCode: promoCode || undefined,
            workers,
            services,
            products
        };
    }

    async getIncomesByClient(clientId: number): Promise<Income[]> {
        const { data, error } = await supabase
            .from('incomes')
            .select('*')
            .eq('client_id', clientId)
            .order('date', { ascending: false });

        if (error) throw new Error(`Failed to fetch incomes by client: ${error.message}`);
        return (data || []).map(this.mapIncomeFromDB);
    }

    async getIncomesByWorker(workerId: number): Promise<Income[]> {
        const { data, error } = await supabase
            .from('income_workers')
            .select('income_id')
            .eq('worker_id', workerId);

        if (error) throw new Error(`Failed to fetch incomes by worker: ${error.message}`);

        const incomeIds = (data || []).map((row: any) => row.income_id);
        if (incomeIds.length === 0) return [];

        const incomes: Income[] = [];
        for (const id of incomeIds) {
            const income = await this.getIncome(id);
            if (income) incomes.push(income);
        }

        return incomes;
    }

    async createIncome(data: IncomeCreateData): Promise<Income> {
        const finalAmount = data.amount - (data.discountAmount || 0);

        const { data: created, error } = await supabase
            .from('incomes')
            .insert([{
                salon_id: data.salonId,
                booking_id: data.bookingId,
                client_id: data.clientId,
                amount: data.amount,
                discount_amount: data.discountAmount || 0,
                final_amount: finalAmount,
                date: data.date,
                payment_method: data.paymentMethod,
                status: data.status || 'Draft',
                promo_code_id: data.promoCodeId,
                has_invoice: false
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create income: ${error.message}`);

        const income = this.mapIncomeFromDB(created);

        // Add worker shares
        for (const share of data.workerShares) {
            await this.addWorkerToIncome(income.id, share.workerId, finalAmount * share.percentage / 100, share.percentage);
        }

        // Add services
        if (data.serviceIds) {
            for (const serviceId of data.serviceIds) {
                await this.addServiceToIncome(income.id, serviceId);
            }
        }

        // Add products
        if (data.products) {
            for (const product of data.products) {
                await this.addProductToIncome(income.id, product.productId, product.quantity);
            }
        }

        return income;
    }

    async updateIncome(id: number, data: Partial<Income>): Promise<Income> {
        const { data: updated, error } = await supabase
            .from('incomes')
            .update(this.mapIncomeToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update income: ${error.message}`);
        return this.mapIncomeFromDB(updated);
    }

    async deleteIncome(id: number): Promise<void> {
        const { error } = await supabase
            .from('incomes')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete income: ${error.message}`);
    }

    // Income-Worker Junction
    async addWorkerToIncome(incomeId: number, workerId: number, amount: number, percentage: number): Promise<IncomeWorkerShare> {
        const { data, error } = await supabase
            .from('income_workers')
            .insert([{
                income_id: incomeId,
                worker_id: workerId,
                amount,
                percentage
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to add worker to income: ${error.message}`);
        return this.mapIncomeWorkerShareFromDB(data);
    }

    async removeWorkerFromIncome(incomeId: number, workerId: number): Promise<void> {
        const { error } = await supabase
            .from('income_workers')
            .delete()
            .eq('income_id', incomeId)
            .eq('worker_id', workerId);

        if (error) throw new Error(`Failed to remove worker from income: ${error.message}`);
    }

    async getIncomeWorkerShares(incomeId: number): Promise<IncomeWorkerShare[]> {
        const { data, error } = await supabase
            .from('income_workers')
            .select('*')
            .eq('income_id', incomeId);

        if (error) throw new Error(`Failed to fetch income worker shares: ${error.message}`);
        return (data || []).map(this.mapIncomeWorkerShareFromDB);
    }

    // Income-Service Junction
    async addServiceToIncome(incomeId: number, serviceId: number): Promise<void> {
        const { error } = await supabase
            .from('income_services')
            .insert([{ income_id: incomeId, service_id: serviceId }]);

        if (error) throw new Error(`Failed to add service to income: ${error.message}`);
    }

    async removeServiceFromIncome(incomeId: number, serviceId: number): Promise<void> {
        const { error } = await supabase
            .from('income_services')
            .delete()
            .eq('income_id', incomeId)
            .eq('service_id', serviceId);

        if (error) throw new Error(`Failed to remove service from income: ${error.message}`);
    }

    async getIncomeServices(incomeId: number): Promise<Service[]> {
        const { data, error } = await supabase
            .from('income_services')
            .select('service_id')
            .eq('income_id', incomeId);

        if (error) throw new Error(`Failed to fetch income services: ${error.message}`);

        const serviceIds = (data || []).map((row: any) => row.service_id);
        if (serviceIds.length === 0) return [];

        const services: Service[] = [];
        for (const id of serviceIds) {
            const service = await this.getService(id);
            if (service) services.push(service);
        }

        return services;
    }

    // Income-Product Junction
    async addProductToIncome(incomeId: number, productId: number, quantity: number): Promise<void> {
        const { error } = await supabase
            .from('income_products')
            .insert([{
                income_id: incomeId,
                product_id: productId,
                quantity
            }]);

        if (error) throw new Error(`Failed to add product to income: ${error.message}`);
    }

    async removeProductFromIncome(incomeId: number, productId: number): Promise<void> {
        const { error } = await supabase
            .from('income_products')
            .delete()
            .eq('income_id', incomeId)
            .eq('product_id', productId);

        if (error) throw new Error(`Failed to remove product from income: ${error.message}`);
    }

    async getIncomeProducts(incomeId: number): Promise<Array<{ product: Product; quantity: number }>> {
        const { data, error } = await supabase
            .from('income_products')
            .select('*')
            .eq('income_id', incomeId);

        if (error) throw new Error(`Failed to fetch income products: ${error.message}`);

        const result: Array<{ product: Product; quantity: number }> = [];

        for (const row of data || []) {
            const product = await this.getProduct(row.product_id);
            if (product) {
                result.push({ product, quantity: row.quantity });
            }
        }

        return result;
    }

    // ============================================
    // EXPENSES
    // ============================================

    async getExpenseCategories(salonId: number): Promise<ExpenseCategory[]> {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            .eq('salon_id', salonId)
            .eq('is_active', true);

        if (error) throw new Error(`Failed to fetch expense categories: ${error.message}`);
        return (data || []).map(this.mapExpenseCategoryFromDB);
    }

    async getExpenseCategory(id: number): Promise<ExpenseCategory | null> {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapExpenseCategoryFromDB(data) : null;
    }

    async createExpenseCategory(data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseCategory> {
        const { data: created, error } = await supabase
            .from('expense_categories')
            .insert([this.mapExpenseCategoryToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create expense category: ${error.message}`);
        return this.mapExpenseCategoryFromDB(created);
    }

    async updateExpenseCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
        const { data: updated, error } = await supabase
            .from('expense_categories')
            .update(this.mapExpenseCategoryToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update expense category: ${error.message}`);
        return this.mapExpenseCategoryFromDB(updated);
    }

    async deleteExpenseCategory(id: number): Promise<void> {
        const { error } = await supabase
            .from('expense_categories')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete expense category: ${error.message}`);
    }

    async getExpenses(
        salonId: number,
        filters?: ExpenseFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Expense>> {
        let query = supabase
            .from('expenses')
            .select('*', { count: 'exact' })
            .eq('salon_id', salonId)
            .eq('is_active', true);

        // Apply filters
        if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
        if (filters?.startDate) query = query.gte('date', filters.startDate);
        if (filters?.endDate) query = query.lte('date', filters.endDate);

        // Apply pagination
        const page = pagination?.page || 1;
        const perPage = pagination?.perPage || 50;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        query = query.range(from, to).order('date', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);

        return {
            data: (data || []).map(this.mapExpenseFromDB),
            total: count || 0,
            page,
            perPage,
            totalPages: Math.ceil((count || 0) / perPage)
        };
    }

    async getExpense(id: number): Promise<Expense | null> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapExpenseFromDB(data) : null;
    }

    async getExpensesByCategory(categoryId: number): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('date', { ascending: false });

        if (error) throw new Error(`Failed to fetch expenses by category: ${error.message}`);
        return (data || []).map(this.mapExpenseFromDB);
    }

    async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        const dbExpense = {
            salon_id: data.salonId,
            category_id: data.categoryId,
            amount: data.amount,
            date: data.date,
            description: data.description,
            receipt_url: data.receiptUrl,
            is_active: data.isActive ?? true
        };

        const { data: created, error } = await supabase
            .from('expenses')
            .insert([dbExpense])
            .select()
            .single();

        if (error) throw new Error(`Failed to create expense: ${error.message}`);
        return this.mapExpenseFromDB(created);
    }

    async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
        const dbExpense: any = {};
        if (data.salonId !== undefined) dbExpense.salon_id = data.salonId;
        if (data.categoryId !== undefined) dbExpense.category_id = data.categoryId;
        if (data.amount !== undefined) dbExpense.amount = data.amount;
        if (data.date !== undefined) dbExpense.date = data.date;
        if (data.description !== undefined) dbExpense.description = data.description;
        if (data.receiptUrl !== undefined) dbExpense.receipt_url = data.receiptUrl;
        if (data.isActive !== undefined) dbExpense.is_active = data.isActive;

        const { data: updated, error } = await supabase
            .from('expenses')
            .update(dbExpense)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update expense: ${error.message}`);
        return this.mapExpenseFromDB(updated);
    }

    async deleteExpense(id: number): Promise<void> {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete expense: ${error.message}`);
    }

    // ============================================
    // REVIEWS
    // ============================================

    async getReviews(salonId: number, filters?: ReviewFilters): Promise<Review[]> {
        let query = supabase
            .from('reviews')
            .select('*')
            .eq('salon_id', salonId);

        if (filters?.workerId) query = query.eq('worker_id', filters.workerId);
        if (filters?.clientId) query = query.eq('client_id', filters.clientId);
        if (filters?.bookingId) query = query.eq('booking_id', filters.bookingId);
        if (filters?.isApproved !== undefined) query = query.eq('is_approved', filters.isApproved);
        if (filters?.isPublic !== undefined) query = query.eq('is_public', filters.isPublic);
        if (filters?.minRating) query = query.gte('rating', filters.minRating);
        if (filters?.maxRating) query = query.lte('rating', filters.maxRating);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
        return (data || []).map(this.mapReviewFromDB);
    }

    async getReview(id: number): Promise<Review | null> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapReviewFromDB(data) : null;
    }

    async getReviewsByWorker(workerId: number): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('worker_id', workerId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch reviews by worker: ${error.message}`);
        return (data || []).map(this.mapReviewFromDB);
    }

    async getReviewsByClient(clientId: number): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch reviews by client: ${error.message}`);
        return (data || []).map(this.mapReviewFromDB);
    }

    async createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
        const { data: created, error } = await supabase
            .from('reviews')
            .insert([this.mapReviewToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create review: ${error.message}`);
        return this.mapReviewFromDB(created);
    }

    async updateReview(id: number, data: Partial<Review>): Promise<Review> {
        const { data: updated, error } = await supabase
            .from('reviews')
            .update(this.mapReviewToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update review: ${error.message}`);
        return this.mapReviewFromDB(updated);
    }

    async deleteReview(id: number): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete review: ${error.message}`);
    }

    async approveReview(id: number): Promise<Review> {
        return this.updateReview(id, { isApproved: true });
    }

    // ============================================
    // PROMO CODES
    // ============================================

    async getPromoCodes(salonId: number): Promise<PromoCode[]> {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('salon_id', salonId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch promo codes: ${error.message}`);
        return (data || []).map(this.mapPromoCodeFromDB);
    }

    async getPromoCode(id: number): Promise<PromoCode | null> {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapPromoCodeFromDB(data) : null;
    }

    async getPromoCodeByCode(salonId: number, code: string): Promise<PromoCode | null> {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('salon_id', salonId)
            .eq('code', code)
            .single();

        if (error) return null;
        return data ? this.mapPromoCodeFromDB(data) : null;
    }

    async createPromoCode(data: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromoCode> {
        const { data: created, error } = await supabase
            .from('promo_codes')
            .insert([this.mapPromoCodeToDB(data)])
            .select()
            .single();

        if (error) throw new Error(`Failed to create promo code: ${error.message}`);
        return this.mapPromoCodeFromDB(created);
    }

    async updatePromoCode(id: number, data: Partial<PromoCode>): Promise<PromoCode> {
        const { data: updated, error } = await supabase
            .from('promo_codes')
            .update(this.mapPromoCodeToDB(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update promo code: ${error.message}`);
        return this.mapPromoCodeFromDB(updated);
    }

    async deletePromoCode(id: number): Promise<void> {
        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete promo code: ${error.message}`);
    }

    async incrementPromoCodeUsage(id: number): Promise<void> {
        const promoCode = await this.getPromoCode(id);
        if (!promoCode) return;

        await this.updatePromoCode(id, { usageCount: promoCode.usageCount + 1 });
    }

    // ============================================
    // AUDIT & HISTORY
    // ============================================

    async getInteractionHistory(entityType: string, entityId: number): Promise<InteractionHistory[]> {
        const { data, error } = await supabase
            .from('interaction_history')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('timestamp', { ascending: false });

        if (error) throw new Error(`Failed to fetch interaction history: ${error.message}`);
        return (data || []).map(this.mapInteractionHistoryFromDB);
    }

    async createInteractionHistory(data: Omit<InteractionHistory, 'id' | 'timestamp'>): Promise<InteractionHistory> {
        const { data: created, error } = await supabase
            .from('interaction_history')
            .insert([{
                entity_type: data.entityType,
                entity_id: data.entityId,
                user_code: data.userCode,
                action: data.action,
                comment: data.comment
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create interaction history: ${error.message}`);
        return this.mapInteractionHistoryFromDB(created);
    }

    async getComments(entityType: string, entityId: number): Promise<SalonComment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('timestamp', { ascending: false });

        if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
        return (data || []).map(this.mapCommentFromDB);
    }

    async createComment(data: Omit<SalonComment, 'id' | 'timestamp'>): Promise<SalonComment> {
        const { data: created, error } = await supabase
            .from('comments')
            .insert([{
                entity_type: data.entityType,
                entity_id: data.entityId,
                user_code: data.userCode,
                text: data.text
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create comment: ${error.message}`);
        return this.mapCommentFromDB(created);
    }

    async deleteComment(id: number): Promise<void> {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete comment: ${error.message}`);
    }

    // ============================================
    // MAPPERS - Part 3
    // ============================================

    private mapIncomeFromDB(db: any): Income {
        return {
            id: db.id,
            salonId: db.salon_id,
            bookingId: db.booking_id,
            bookingIds: db.booking_id ? [db.booking_id] : [],
            clientId: db.client_id,
            clientName: db.client?.name || 'Unknown',
            amount: db.amount,
            discountAmount: db.discount_amount || 0,
            finalAmount: db.final_amount || db.amount,
            date: db.date,
            paymentMethod: db.payment_method || 'Card',
            status: db.status,
            hasInvoice: db.has_invoice || false,
            invoiceUrl: db.invoice_url,
            promoCodeId: db.promo_code_id,
            serviceIds: [],
            workerIds: [],
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapIncomeToDB(income: Partial<Income>): any {
        const db: any = {};
        if (income.bookingId !== undefined) db.booking_id = income.bookingId;
        if (income.clientId !== undefined) db.client_id = income.clientId;
        if (income.amount !== undefined) db.amount = income.amount;
        if (income.discountAmount !== undefined) db.discount_amount = income.discountAmount;
        if (income.finalAmount !== undefined) db.final_amount = income.finalAmount;
        if (income.date !== undefined) db.date = income.date;
        if (income.paymentMethod !== undefined) db.payment_method = income.paymentMethod;
        if (income.status !== undefined) db.status = income.status;
        if (income.hasInvoice !== undefined) db.has_invoice = income.hasInvoice;
        if (income.invoiceUrl !== undefined) db.invoice_url = income.invoiceUrl;
        if (income.promoCodeId !== undefined) db.promo_code_id = income.promoCodeId;
        if (income.createdBy !== undefined) db.created_by = income.createdBy;
        if (income.updatedBy !== undefined) db.updated_by = income.updatedBy;
        return db;
    }

    private mapIncomeWorkerShareFromDB(db: any): IncomeWorkerShare {
        return {
            id: db.id,
            incomeId: db.income_id,
            workerId: db.worker_id,
            amount: db.amount,
            percentage: db.percentage,
            createdAt: new Date(db.created_at)
        };
    }

    private mapExpenseCategoryFromDB(db: any): ExpenseCategory {
        return {
            id: db.id,
            salonId: db.salon_id,
            name: db.name,
            description: db.description,
            color: db.color,
            icon: db.icon,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapExpenseCategoryToDB(cat: Partial<ExpenseCategory>): any {
        const db: any = {};
        if (cat.name !== undefined) db.name = cat.name;
        if (cat.description !== undefined) db.description = cat.description;
        if (cat.color !== undefined) db.color = cat.color;
        if (cat.icon !== undefined) db.icon = cat.icon;
        if (cat.isActive !== undefined) db.is_active = cat.isActive;
        if (cat.createdBy !== undefined) db.created_by = cat.createdBy;
        if (cat.updatedBy !== undefined) db.updated_by = cat.updatedBy;
        return db;
    }

    private mapExpenseFromDB(db: any): Expense {
        return {
            id: db.id,
            salonId: db.salon_id,
            categoryId: db.category_id,
            amount: db.amount,
            date: db.date,
            description: db.description,
            receiptUrl: db.receipt_url,
            isActive: db.is_active,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapExpenseToDB(expense: Partial<Expense>): any {
        const db: any = {};
        if (expense.categoryId !== undefined) db.category_id = expense.categoryId;
        if (expense.amount !== undefined) db.amount = expense.amount;
        if (expense.date !== undefined) db.date = expense.date;
        if (expense.description !== undefined) db.description = expense.description;
        if (expense.receiptUrl !== undefined) db.receipt_url = expense.receiptUrl;
        if (expense.isActive !== undefined) db.is_active = expense.isActive;
        if (expense.createdBy !== undefined) db.created_by = expense.createdBy;
        if (expense.updatedBy !== undefined) db.updated_by = expense.updatedBy;
        return db;
    }

    private mapReviewFromDB(db: any): Review {
        return {
            id: db.id,
            salonId: db.salon_id,
            clientId: db.client_id,
            workerId: db.worker_id,
            bookingId: db.booking_id,
            rating: db.rating,
            comment: db.comment,
            isPublic: db.is_public,
            isApproved: db.is_approved,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at)
        };
    }

    private mapReviewToDB(review: Partial<Review>): any {
        const db: any = {};
        if (review.clientId !== undefined) db.client_id = review.clientId;
        if (review.workerId !== undefined) db.worker_id = review.workerId;
        if (review.bookingId !== undefined) db.booking_id = review.bookingId;
        if (review.rating !== undefined) db.rating = review.rating;
        if (review.comment !== undefined) db.comment = review.comment;
        if (review.isPublic !== undefined) db.is_public = review.isPublic;
        if (review.isApproved !== undefined) db.is_approved = review.isApproved;
        return db;
    }

    private mapPromoCodeFromDB(db: any): PromoCode {
        return {
            id: db.id,
            salonId: db.salon_id,
            code: db.code,
            description: db.description,
            type: db.type,
            value: db.value,
            startDate: db.start_date,
            endDate: db.end_date,
            maxUsage: db.max_usage,
            usageCount: db.usage_count || 0,
            isActive: db.is_active || false,
            affectWorkerShare: db.affect_worker_share || false,
            createdAt: new Date(db.created_at),
            updatedAt: new Date(db.updated_at),
            createdBy: db.created_by,
            updatedBy: db.updated_by
        };
    }

    private mapPromoCodeToDB(code: Partial<PromoCode>): any {
        const db: any = {};
        if (code.code !== undefined) db.code = code.code;
        if (code.description !== undefined) db.description = code.description;
        if (code.type !== undefined) db.type = code.type;
        if (code.value !== undefined) db.value = code.value;
        if (code.startDate !== undefined) db.start_date = code.startDate;
        if (code.endDate !== undefined) db.end_date = code.endDate;
        if (code.maxUsage !== undefined) db.max_usage = code.maxUsage;
        if (code.usageCount !== undefined) db.usage_count = code.usageCount;
        if (code.isActive !== undefined) db.is_active = code.isActive;
        if (code.createdBy !== undefined) db.created_by = code.createdBy;
        if (code.updatedBy !== undefined) db.updated_by = code.updatedBy;
        return db;
    }

    private mapInteractionHistoryFromDB(db: any): InteractionHistory {
        return {
            id: db.id,
            entityType: db.entity_type,
            entityId: db.entity_id,
            userCode: db.user_code,
            action: db.action,
            comment: db.comment,
            timestamp: new Date(db.timestamp)
        };
    }

    private mapCommentFromDB(db: any): SalonComment {
        return {
            id: db.id,
            entityType: db.entity_type,
            entityId: db.entity_id,
            userCode: db.user_code,
            text: db.text,
            timestamp: new Date(db.timestamp)
        };
    }
}
