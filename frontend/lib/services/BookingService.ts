/**
 * Booking Service
 * 
 * Business logic for booking management with conflict detection
 */

import { BaseService } from './BaseService';
import type { Booking, BookingWithRelations, BookingCreateData, BookingFilters, SalonWorker, Service, PaginatedResponse } from '@/types';

export class BookingService extends BaseService {
    /**
     * Get all bookings for a salon (Paginated)
     */
    async getAll(salonId: number, filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
        return this.provider.getBookings(salonId, filters);
    }

    /**
     * Get booking by ID
     */
    async getById(id: number): Promise<Booking | null> {
        return this.provider.getBooking(id);
    }

    /**
     * Get booking with all relations loaded
     */
    async getWithRelations(id: number): Promise<BookingWithRelations | null> {
        return this.provider.getBookingWithRelations(id);
    }

    /**
     * Get bookings by date
     */
    async getByDate(salonId: number, date: string): Promise<Booking[]> {
        return this.provider.getBookingsByDate(salonId, date);
    }

    /**
     * Get bookings by client
     */
    async getByClient(clientId: number): Promise<Booking[]> {
        return this.provider.getBookingsByClient(clientId);
    }

    /**
     * Get bookings by worker
     */
    async getByWorker(workerId: number): Promise<Booking[]> {
        return this.provider.getBookingsByWorker(workerId);
    }

    /**
     * Create a new booking
     */
    async create(data: BookingCreateData): Promise<Booking> {
        // Validation
        this.validateRequired(data, ['salonId', 'clientId', 'date', 'time', 'duration']);

        if (!data.workerIds || data.workerIds.length === 0) {
            throw new Error('At least one worker must be assigned');
        }

        if (!data.serviceIds || data.serviceIds.length === 0) {
            throw new Error('At least one service must be selected');
        }

        // Check for conflicts
        const hasConflict = await this.checkConflicts(
            data.salonId,
            data.workerIds,
            data.date,
            data.time,
            data.duration
        );

        // Create booking
        const booking = await this.provider.createBooking({
            ...data,
            status: data.status || 'Pending',
            isSensitive: hasConflict
        });

        // Add workers
        for (const workerId of data.workerIds) {
            await this.provider.addWorkerToBooking(booking.id, workerId);
        }

        // Add services
        for (const serviceId of data.serviceIds) {
            await this.provider.addServiceToBooking(booking.id, serviceId);
        }

        // Log action
        await this.logInteraction('booking', booking.id, 'created', `Booking for ${booking.date} at ${booking.time}`);

        return booking;
    }

    /**
     * Update booking
     */
    async update(id: number, data: Partial<Booking>): Promise<Booking> {
        const booking = await this.provider.updateBooking(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('booking', id, 'updated');

        return booking;
    }

    /**
     * Delete booking
     */
    async delete(id: number): Promise<void> {
        await this.provider.deleteBooking(id);
        await this.logInteraction('booking', id, 'deleted');
    }

    /**
     * Change booking status
     */
    async updateStatus(id: number, status: Booking['status']): Promise<Booking> {
        const booking = await this.provider.updateBooking(id, {
            status,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('booking', id, `status_changed_to_${status}`);

        return booking;
    }

    /**
     * Add worker to booking
     */
    async addWorker(bookingId: number, workerId: number): Promise<void> {
        await this.provider.addWorkerToBooking(bookingId, workerId);
        await this.logInteraction('booking', bookingId, 'worker_added', `Worker ${workerId} added`);
    }

    /**
     * Remove worker from booking
     */
    async removeWorker(bookingId: number, workerId: number): Promise<void> {
        await this.provider.removeWorkerFromBooking(bookingId, workerId);
        await this.logInteraction('booking', bookingId, 'worker_removed', `Worker ${workerId} removed`);
    }

    /**
     * Get workers assigned to booking
     */
    async getWorkers(bookingId: number): Promise<SalonWorker[]> {
        return this.provider.getBookingWorkers(bookingId);
    }

    /**
     * Get services in booking
     */
    async getServices(bookingId: number): Promise<Service[]> {
        return this.provider.getBookingServices(bookingId);
    }

    /**
     * Get booking history
     */
    async getHistory(bookingId: number) {
        return this.provider.getInteractionHistory('booking', bookingId);
    }

    /**
     * Get booking comments
     */
    async getComments(bookingId: number) {
        return this.provider.getComments('booking', bookingId);
    }

    /**
     * Check for booking conflicts
     */
    private async checkConflicts(
        salonId: number,
        workerIds: number[],
        date: string,
        time: string,
        duration: number
    ): Promise<boolean> {
        // Get all bookings for that date
        const dayBookings = await this.provider.getBookingsByDate(salonId, date);

        // Calculate end time
        const [hours, minutes] = time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;

        // Check each existing booking
        for (const booking of dayBookings) {
            if (booking.status === 'Cancelled' || booking.status === 'Closed') {
                continue;
            }

            // Get workers for this booking
            const bookingWorkers = await this.provider.getBookingWorkers(booking.id);
            const bookingWorkerIds = bookingWorkers.map((w: SalonWorker) => w.id);

            // Check if any worker overlaps
            const hasOverlap = workerIds.some(wId => bookingWorkerIds.includes(wId));
            if (!hasOverlap) continue;

            // Check time overlap
            const [bHours, bMinutes] = booking.time.split(':').map(Number);
            const bStartMinutes = bHours * 60 + bMinutes;
            const bEndMinutes = bStartMinutes + booking.duration;

            const timeOverlap =
                (startMinutes >= bStartMinutes && startMinutes < bEndMinutes) ||
                (endMinutes > bStartMinutes && endMinutes <= bEndMinutes) ||
                (startMinutes <= bStartMinutes && endMinutes >= bEndMinutes);

            if (timeOverlap) {
                return true; // Conflict found
            }
        }

        return false;
    }
}

// Export singleton instance
export const bookingService = new BookingService();
