/**
 * Common types used across the Saloon Management application
 * Centralized type definitions for better type safety and reusability
 */

// ============================================================
// Worker / Team Member Types
// ============================================================

export interface Worker {
    id: number;
    name: string;
    email?: string; // Optional email for worker contact
    avatar: string;
    status: 'Active' | 'Inactive';
    sharingKey: number;
    totalRevenue: string;
    totalSalary: string;
    clients: number;
    rating: number;
    services: number;
    color: string;
    monthRevenue?: string;
    monthSalary?: string;
    yearRevenue?: string;
    yearSalary?: string;
}

export interface WorkerAssignment {
    workerId: number;
    percentage: number;
}

export interface WorkerShare extends WorkerAssignment {
    worker: Worker | undefined;
    incomeShare: number;
    workerAmount: number;
    salonAmount: number;
}

// ============================================================
// Client Types
// ============================================================

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

// ============================================================
// Service Types
// ============================================================

export interface Service {
    id: number;
    name: string;
    price: number;
    duration: string;
    category?: string; // Optional category for service organization (e.g., 'Hair', 'Nails', 'Personnalisé')
    icon?: string; // Optional icon name for UI display
}

// ============================================================
// Export / Data Export Types
// ============================================================

export interface ExportColumn<TData = unknown> {
    key: string;
    header: string;
    formatter?: (value: TData) => string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
    key: string;
    direction: SortDirection;
}

// ============================================================
// Product Types
// ============================================================

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    description?: string;
    category?: string;
    image?: string;
    isLinkedToService?: boolean;
    serviceId?: number;
}

export interface UsedProduct {
    productId: number;
    quantity: number;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    color: string;
    icon?: string;
}

// ============================================================
// Notification Types
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
// Booking Types
// ============================================================

export type BookingStatus =
    | 'Created'
    | 'Pending'
    | 'Confirmed'
    | 'Cancelled'
    | 'Started'
    | 'Waiting'
    | 'Finished'
    | 'Validated'
    | 'PendingApproval'
    | 'Rescheduled'
    | 'Closed'
    | 'Started';

export interface BookingInteraction {
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    comment?: string;
}

export interface BookingComment {
    id: string;
    timestamp: Date;
    user: string;
    text: string;
}

export interface Booking {
    id: number;
    salonId: string;
    clientId: number | 'anonymous' | 'new';
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    serviceIds: number[];
    customServiceDetails?: string;
    workerIds: number[];
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    endTime: string; // HH:mm (automatically calculated)
    duration: number; // in minutes
    status: BookingStatus;
    isSensitive?: boolean; // If overlaps with another booking
    incomeId?: number;
    interactionHistory: BookingInteraction[];
    comments: BookingComment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DayCapacity {
    date: string;
    maxSlots: number;
    closedSlots: string[]; // List of times like ["09:00", "09:30"]
    isClosed: boolean;
    allowOverbooking: boolean;
}

// ============================================================
// Income & Invoice Types
// ============================================================

export type IncomeStatus = 'Draft' | 'Pending' | 'Validated' | 'Refused' | 'Closed' | 'Cancelled';

export interface IncomeHistoryEvent {
    date: string;
    action: string;
    user: string;
    comment?: string;
}

export interface IncomeComment {
    date: string;
    user: string;
    text: string;
}

export interface Income {
    id: number;
    date: string;
    clientId: number | 'anonymous';
    clientName: string;
    serviceIds: number[];
    workerIds: number[];
    amount: number;
    status: IncomeStatus;
    createdBy: string;
    bookingIds: number[];
    history: IncomeHistoryEvent[];
    comments: IncomeComment[];
    hasInvoice: boolean;
    invoiceUrl?: string;
    paymentMethod?: string;
    promoCodeId?: number;
    discountAmount?: number;
    usedProducts?: UsedProduct[];
}

// ============================================================
// Configuration Types
// ============================================================

export interface PromoCode {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
    usageCount: number;
    endDate?: string;
    affectWorkerShare?: boolean; // If true, discount reduces worker commission basis
}

export type TipsDistributionRule = 'EQUAL_ALL' | 'EQUAL_WORKERS' | 'SALON_KEY' | 'POOL' | 'CUSTOM_PERCENTAGE';

export interface TipsConfiguration {
    rule: TipsDistributionRule;
    salonPercentage?: number; // Used if rule is CUSTOM_PERCENTAGE or SALON_KEY context
    isActive: boolean;
}

// ============================================================
// Onboarding Types
// ============================================================

export interface OnboardingConfig {
    salonType: string | null;
    salonDetails: SalonDetails | null;
    services: Service[];
    products: Product[];
    expenseCategories: ExpenseCategory[]; // New for 8-step onboarding
    clients: Client[];
    workers: Omit<Worker, 'id' | 'totalRevenue' | 'totalSalary' | 'clients' | 'rating' | 'services' | 'monthRevenue' | 'monthSalary' | 'yearRevenue' | 'yearSalary'>[];
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
    openTime: string; // HH:mm format
    closeTime: string; // HH:mm format
}

// CSV Import types
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
// Subscription & Plan Types
// ============================================================

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';

export interface SubscriptionLimits {
    maxSalons: number; // Maximum number of salons allowed
    maxWorkers: number; // Maximum workers per salon
    maxBookingsPerMonth: number; // Monthly booking limit
    hasAdvancedReports: boolean; // Access to advanced reporting
    hasAPIAccess: boolean; // Access to API integration
}

// Super admin configurable plan definition
export interface PlanConfig {
    id: string; // 'free' | 'starter' | 'pro' | 'enterprise'
    name: string; // Display name
    price: number; // Monthly price in euros
    currency: string; // 'EUR'
    limits: SubscriptionLimits;
    features: string[]; // List of feature descriptions
    isActive: boolean; // Can be purchased/assigned
    isDefault: boolean; // Default for new users
    displayOrder: number; // Order in pricing page
}

