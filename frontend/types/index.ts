/**
 * SALOON MANAGEMENT - TYPES
 * 
 * Aligned with MCD V2 and SQL Schema V2
 * Multi-tenant architecture with normalized relations
 */

// ============================================================
// CORE - USERS & AUTHENTICATION
// ============================================================

export type UserRole = 'super_admin' | 'owner' | 'manager' | 'worker' | 'client';

export interface User {
    id: number;
    userCode: string;  // 12-char code with check digit
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSalon {
    id: number;
    userId: number;
    salonId: number;
    roleInSalon: 'Manager' | 'Worker';
    isActive: boolean;
    joinedAt: Date;
    createdAt: Date;
}

// ============================================================
// CORE - SALONS
// ============================================================

export interface Salon {
    id: number;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    timezone: string;
    currency: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionEndsAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface SalonSettings {
    id: number;
    salonId: number;
    allowOnlineBooking: boolean;
    bookingAdvanceDays: number;
    bookingSlotDuration: number;
    requireClientApproval: boolean;
    sendEmailConfirmations: boolean;
    sendSmsReminders: boolean;
    tipsEnabled: boolean;
    tipsDistributionRule: TipsDistributionRule;
    defaultWorkerSharePct: number;
    openingHours: OpeningHours[];
    createdAt: Date;
    updatedAt: Date;
}

export type TipsDistributionRule = 'EQUAL_ALL' | 'EQUAL_WORKERS' | 'SALON_KEY' | 'POOL' | 'CUSTOM_PERCENTAGE';

export interface TipsConfiguration {
    rule: TipsDistributionRule;
    salonPercentage: number;
    isActive: boolean;
}

// ============================================================
// WORKFORCE - WORKERS
// ============================================================

export interface SalonWorker {
    id: number;
    salonId: number;
    userId?: number;  // Link to users table
    name: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    color: string;
    status: WorkerStatus;
    sharingKey: number;
    bio?: string;
    specialties?: string[];  // Array OK - small list, no stats
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export type WorkerStatus = 'Active' | 'Inactive' | 'OnLeave';

// Calculated stats (from worker_stats view)
export interface WorkerStats {
    workerId: number;
    salonId: number;
    name: string;
    totalBookings: number;
    totalClients: number;
    completedBookings: number;
    totalRevenue: number;
    monthRevenue: number;
    yearRevenue: number;
    avgRating: number;
    totalReviews: number;
}

// ============================================================
// CLIENTS
// ============================================================

export interface Client {
    id: number;
    salonId: number;
    userId?: number;  // If client has account
    name: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
    birthDate?: string;  // ISO date
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// Calculated stats (from client_stats view)
export interface ClientStats {
    clientId: number;
    salonId: number;
    name: string;
    totalBookings: number;
    completedBookings: number;
    totalSpent: number;
    lastBookingDate?: Date;
    avgRatingGiven: number;
}

// ============================================================
// SERVICES & PRODUCTS
// ============================================================

export interface ServiceCategory {
    id: number;
    salonId: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface Service {
    id: number;
    salonId: number;
    categoryId?: number;
    name: string;
    description?: string;
    price: number;
    duration: number;  // minutes
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface Product {
    id: number;
    salonId: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    sku?: string;
    isLinkedToService: boolean;
    linkedServiceId?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// ============================================================
// BOOKINGS
// ============================================================

export type BookingStatus =
    | 'Created'
    | 'Pending'
    | 'Confirmed'
    | 'Started'
    | 'Finished'
    | 'Cancelled'
    | 'PendingApproval'
    | 'Rescheduled'
    | 'Closed';

export interface Booking {
    id: number;
    salonId: number;
    clientId: number;
    date: string;  // YYYY-MM-DD
    time: string;  // HH:mm
    endTime: string;  // HH:mm
    duration: number;  // minutes
    status: BookingStatus;
    notes?: string;
    incomeId?: number;
    isSensitive: boolean;  // Conflict warning
    clientName?: string;   // Joined field
    clientPhone?: string;  // Joined field from Client
    clientEmail?: string;  // Joined field from Client
    serviceIds?: number[]; // Junction field ids
    workerIds?: number[];  // Junction field ids
    interactionHistory?: BookingInteraction[];  // Audit trail
    comments?: BookingComment[];  // Internal staff comments
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// Supporting types for Booking
export interface BookingInteraction {
    id: number;
    timestamp: Date;
    action: string;
    user: string;
}

export interface BookingComment {
    id: number;
    timestamp: Date;
    user: string;
    text: string;
}

// Booking with full relations loaded
export interface BookingWithRelations extends Booking {
    client: Client;
    workers: SalonWorker[];
    services: Service[];
}

// For creating bookings
export interface BookingCreateData {
    salonId: number;
    clientId: number;
    date: string;
    time: string;
    duration: number;
    status?: BookingStatus;
    notes?: string;
    workerIds: number[];  // Will create junction records
    serviceIds: number[];  // Will create junction records
}

export interface DayCapacity {
    date: string;
    maxSlots: number;
    closedSlots: string[];
    isClosed: boolean;
    allowOverbooking: boolean;
}

// ============================================================
// INCOMES & PAYMENTS
// ============================================================

export type IncomeStatus = 'Draft' | 'Pending' | 'Validated' | 'Refused' | 'Closed' | 'Cancelled';

export interface Income {
    id: number;
    salonId: number;
    bookingId?: number;
    clientId?: number;
    amount: number;
    discountAmount: number;
    finalAmount: number;  // Auto-calculated
    date: string;  // YYYY-MM-DD
    paymentMethod?: string;
    status: IncomeStatus;
    hasInvoice: boolean;
    invoiceUrl?: string;
    promoCodeId?: number;
    clientName?: string;   // Joined field
    bookingIds?: number[]; // Support for multiple bookings (from Junction)
    serviceIds?: number[]; // From Junction
    workerIds?: number[];  // From Junction
    comments?: BookingComment[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// Worker share in income
export interface IncomeWorkerShare {
    id: number;
    incomeId: number;
    workerId: number;
    amount: number;
    percentage: number;
    createdAt: Date;
}

// Income with full relations
export interface IncomeWithRelations extends Income {
    client?: Client;
    booking?: Booking;
    promoCode?: PromoCode;
    workers: Array<{
        worker: SalonWorker;
        share: IncomeWorkerShare;
    }>;
    services: Service[];
    products: Array<{
        product: Product;
        quantity: number;
    }>;
}

// For creating incomes
export interface IncomeCreateData {
    salonId: number;
    bookingId?: number;
    bookingIds?: number[]; // Support for multiple bookings
    clientId?: number;
    clientName?: string; // For anonymous or new clients
    amount: number;
    discountAmount?: number;
    date: string;
    paymentMethod?: string;
    status?: IncomeStatus;
    promoCodeId?: number;
    workerShares: Array<{
        workerId: number;
        percentage: number;
    }>;
    serviceIds: number[];
    products?: Array<{
        productId: number;
        quantity: number;
    }>;
}

// ============================================================
// EXPENSES
// ============================================================

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ExpenseCategory {
    id: number;
    salonId: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface Expense {
    id: number;
    salonId: number;
    categoryId: number;
    amount: number;
    date: string;  // YYYY-MM-DD
    description?: string;
    paymentMethod?: string;
    receiptUrl?: string;
    status: ExpenseStatus;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// ============================================================
// REVIEWS & RATINGS
// ============================================================

export interface Review {
    id: number;
    salonId: number;
    bookingId?: number;
    clientId?: number;
    workerId?: number;
    rating: number;  // 1-5
    comment?: string;
    isApproved: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// PROMO CODES
// ============================================================

export interface PromoCode {
    id: number;
    salonId: number;
    code: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
    usageCount: number;
    maxUsage?: number;
    startDate?: string;
    endDate?: string;
    affectWorkerShare: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

// ============================================================
// AUDIT & HISTORY
// ============================================================

export interface InteractionHistory {
    id: number;
    entityType: string;  // 'booking', 'income', 'worker', etc.
    entityId: number;
    userCode: string;
    action: string;
    comment?: string;
    timestamp: Date;
}

export interface SalonComment {
    id: number;
    entityType: string;
    entityId: number;
    userCode: string;
    text: string;
    timestamp: Date;
}

// ============================================================
// STATISTICS & ANALYTICS
// ============================================================

export interface SalonStats {
    salonId: number;
    salonName: string;
    totalWorkers: number;
    totalClients: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
}

export interface ClientRegistrationTrend {
    name?: string;
    clients: number;
    key: string;
}

export interface ClientDistribution {
    name?: string;
    value: number;
    color: string;
    key: string;
}

export interface ClientActivity {
    id: number;
    type: string;
    titleKey: string;
    descKey: string;
    params?: Record<string, string | number>;
    timeKey: string;
    icon: string;
    color: string;
}

export interface ClientAnalytics {
    trend: ClientRegistrationTrend[];
    distribution: ClientDistribution[];
    recentActivity: ClientActivity[];
}

export interface RevenueTrendPoint {
    name: string;
    value: number;
}

export interface ExpenseDistributionPoint {
    name?: string;
    key: string;
    value: number;
    color: string;
}

export interface TopPerformer {
    name: string;
    role: string;
    revenue: number;
    clients: number;
    rating: number;
    avatar: string;
    bg: string;
    text: string;
}

export interface DashboardAnalytics {
    revenueTrend: RevenueTrendPoint[];
    expenseDistribution: ExpenseDistributionPoint[];
    topPerformers?: TopPerformer[];
}

// ============================================================
// FILTERS & QUERY PARAMS
// ============================================================

export interface BookingFilters {
    salonId?: number;
    clientId?: number;
    workerId?: number;
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
    isSensitive?: boolean;
}

export interface IncomeFilters {
    salonId?: number;
    clientId?: number;
    workerId?: number;
    status?: IncomeStatus;
    startDate?: string;
    endDate?: string;
    hasInvoice?: boolean;
}

export interface ExpenseFilters {
    salonId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    status?: ExpenseStatus;
}

export interface ReviewFilters {
    salonId?: number;
    workerId?: number;
    clientId?: number;
    bookingId?: number;
    isApproved?: boolean;
    isPublic?: boolean;
    minRating?: number;
    maxRating?: number;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
    key: string;
    direction: SortDirection;
}

export interface PaginationParams {
    page: number;
    perPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

// ============================================================
// ONBOARDING (Keep existing for compatibility)
// ============================================================

export interface OnboardingConfig {
    salonType: string | null;
    salonDetails: SalonDetails | null;
    services: Service[];
    products: Product[];
    expenseCategories: ExpenseCategory[];
    clients: Client[];
    workers: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[];
    currentStep: number;
    isComplete: boolean;
}

export interface SalonDetails {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
    openingHours: OpeningHours[];
    timezone: string;
}

export interface OpeningHours {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export type OnboardingStep =
    | 'salon-type'
    | 'salon-details'
    | 'services'
    | 'products'
    | 'clients'
    | 'team'
    | 'review'
    | 'success';

// ============================================================
// SUBSCRIPTION & PLANS
// ============================================================

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';

export interface SubscriptionLimits {
    maxSalons: number;
    maxWorkers: number;
    maxBookingsPerMonth: number;
    hasAdvancedReports: boolean;
    hasAPIAccess: boolean;
}

export interface PlanConfig {
    id: string;
    name: string;
    price: number;
    currency: string;
    limits: SubscriptionLimits;
    features: string[];
    isActive: boolean;
    isDefault: boolean;
    displayOrder: number;
}

// ============================================================
// NOTIFICATIONS (Keep existing)
// ============================================================

export type NotificationType = 'validation' | 'booking' | 'success' | 'warning' | 'error' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actions?: {
        onView?: () => void;
        onApprove?: () => void;
        onReject?: () => void;
    };
}

// ============================================================
// CSV IMPORT (Keep existing)
// ============================================================

export interface CSVImportResult<T> {
    data: T[];
    errors: CSVImportError[];
    validCount: number;
    errorCount: number;
}

export interface CSVImportError {
    row: number;
    field: string;
    error: string;
    value: unknown;
}

export interface ExportColumn<TData = unknown> {
    key: string;
    header: string;
    formatter?: (value: TData) => string;
}
