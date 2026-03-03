/**
 * Local Actions - Client-Side Operations
 * 
 * Provides convenient action functions for common operations
 * that work seamlessly with the service layer.
 */

import { workerService, clientService, bookingService } from '@/lib/services';
import { SalonWorker, Client, Booking } from '@/types';

/**
 * Worker Actions
 */
export const workerActions = {
    /**
     * Create a new worker with validation
     */
    async createWorker(data: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        sharingKey: number;
        status?: 'Active' | 'Inactive';
    }): Promise<SalonWorker> {
        const fullName = `${data.firstName} ${data.lastName}`.trim();

        return await workerService.create({
            salonId: 1,
            userId: undefined,
            name: fullName,
            email: data.email || undefined,
            phone: data.phone || undefined,
            sharingKey: data.sharingKey,
            status: (data.status || 'Active') as any,
            avatarUrl: '',
            color: this.generateRandomColor(),
            isActive: true,
            bio: undefined,
            specialties: []
        });
    },

    /**
     * Toggle worker status (Active/Inactive)
     */
    async toggleStatus(workerId: number): Promise<SalonWorker> {
        const worker = await workerService.getById(workerId);
        if (!worker) {
            throw new Error(`Worker ${workerId} not found`);
        }

        const newStatus = worker.status === 'Active' ? 'Inactive' : 'Active';
        return await workerService.update(workerId, { status: newStatus });
    },

    /**
     * Update worker sharing key
     */
    async updateSharingKey(workerId: number, sharingKey: number): Promise<SalonWorker> {
        if (sharingKey < 0 || sharingKey > 100) {
            throw new Error('Sharing key must be between 0 and 100');
        }
        return await workerService.update(workerId, { sharingKey });
    },

    /**
     * Generate random color for worker avatar
     */
    generateRandomColor(): string {
        const colors = [
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#EF4444', // Red
            '#F59E0B', // Orange
            '#10B981', // Green
            '#3B82F6', // Blue
            '#6366F1', // Indigo
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

/**
 * Client Actions
 */
export const clientActions = {
    /**
     * Create a new client with validation
     */
    async createClient(data: {
        name: string;
        email: string;
        phone: string;
    }): Promise<Client> {
        return await clientService.create({
            ...data,
            salonId: 1,
            userId: undefined,
            isActive: true,
            address: "",
            city: "",
            postalCode: "",
            birthDate: undefined,
            notes: ""
        });
    },

    /**
     * Quick client lookup by email
     */
    async findByEmail(email: string): Promise<Client | null> {
        const clients = await clientService.getAll(1);
        return clients.find(c => (c.email || "").toLowerCase() === email.toLowerCase()) || null;
    },
    /**
     * Quick client lookup by phone
     */
    async findByPhone(phone: string): Promise<Client | null> {
        const clients = await clientService.getAll(1);
        const cleanPhone = phone.replace(/\D/g, '');
        return clients.find(c => (c.phone || "").replace(/\D/g, '') === cleanPhone) || null;
    },

    /**
     * Get or create client (upsert logic)
     */
    async getOrCreate(data: {
        name: string;
        email: string;
        phone: string;
    }): Promise<{ client: Client; isNew: boolean }> {
        // Try to find existing client by email
        const existing = await this.findByEmail(data.email);

        if (existing) {
            return { client: existing, isNew: false };
        }

        // Create new client
        const newClient = await clientService.create({
            ...data,
            salonId: 1,
            userId: undefined,
            isActive: true,
            address: "",
            city: "",
            postalCode: "",
            birthDate: undefined,
            notes: ""
        });
        return { client: newClient, isNew: true };
    }
};

/**
 * Booking Actions
 */
export const bookingActions = {
    /**
     * Create a quick booking
     */
    async createQuickBooking(data: {
        clientId: number;
        serviceIds: number[];
        workerIds: number[];
        date: string;
        time: string;
        notes?: string;
    }): Promise<Booking> {
        return await bookingService.create({
            clientId: data.clientId,
            serviceIds: data.serviceIds,
            workerIds: data.workerIds,
            date: data.date,
            time: data.time,
            status: 'Pending',
            notes: data.notes || undefined,
            salonId: 1,
            duration: 60, // Added default duration
        });
    },

    /**
     * Confirm a booking
     */
    async confirm(bookingId: number, userName: string = 'User'): Promise<Booking> {
        return await bookingService.updateStatus(
            bookingId,
            'Confirmed'
        );
    },

    /**
     * Cancel a booking
     */
    async cancel(bookingId: number, reason: string, userName: string = 'User'): Promise<Booking> {
        return await bookingService.updateStatus(
            bookingId,
            'Cancelled'
        );
    },

    /**
     * Complete a booking
     */
    async complete(bookingId: number, userName: string = 'User'): Promise<Booking> {
        return await bookingService.updateStatus(
            bookingId,
            'Finished'
        );
    },

    /**
     * Get today's bookings
     */
    async getToday(): Promise<Booking[]> {
        const today = new Date().toISOString().split('T')[0];
        return await bookingService.getByDate(1, today);
    },

    /**
     * Get this week's bookings
     */
    async getThisWeek(): Promise<Booking[]> {
        const response = await bookingService.getAll(1);
        const bookings = response.data;
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];

        return bookings.filter((b: any) => b.date >= startDate && b.date <= endDate);
    },

    /**
     * Check worker availability
     */
    async isWorkerAvailable(workerId: number, date: string, time: string): Promise<boolean> {
        // Simplified check using getByDate if public conflict check is missing
        const dayBookings = await bookingService.getByDate(1, date);
        const [hours, minutes] = time.split(':').map(Number);
        const start = hours * 60 + minutes;
        const end = start + 60; // Assume 60m default

        const hasConflict = dayBookings.some(b => {
            if (b.status === 'Cancelled') return false;
            const [bHours, bMinutes] = b.time.split(':').map(Number);
            const bStart = bHours * 60 + bMinutes;
            const bEnd = bStart + b.duration;
            return (b.workerIds || []).includes(workerId) &&
                ((start >= bStart && start < bEnd) || (end > bStart && end <= bEnd));
        });
        return !hasConflict;
    }
};

/**
 * Export all actions
 */
export const actions = {
    worker: workerActions,
    client: clientActions,
    booking: bookingActions
};
