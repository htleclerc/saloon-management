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
}

export interface UsedProduct {
    productId: number;
    quantity: number;
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
    | 'Closed';

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
