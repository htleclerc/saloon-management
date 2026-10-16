/**
 * Booking Service
 * 
 * Business logic for booking management with conflict detection
 */

import { BaseService } from './BaseService';
import type { Booking, BookingWithRelations, BookingCreateData, BookingFilters, BookingTotals, SalonWorker, Service, ServiceAddon, PaginatedResponse } from '@/types';
import { BookingCreateSchema } from '@/lib/validators';
import { calculateBookingTotals, buildAddonSnapshots, calculateDeposit } from '@/lib/domain/rules/pricingRules';

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
        // Zod validation (covers required fields + serviceIds min(1))
        BookingCreateSchema.parse(data);

        // Check for duplicates (same client, same time)
        const dayBookings = await this.provider.getBookingsByDate(data.salonId, data.date);
        const isDuplicate = dayBookings.some((b: Booking) =>
            b.clientId === data.clientId &&
            b.time?.slice(0, 5) === data.time.slice(0, 5) &&
            b.status !== 'Cancelled'
        );

        if (isDuplicate) {
            throw new Error('A booking for this client at this time already exists.');
        }

        // Check for conflicts (worker overlap)
        const hasConflict = await this.checkConflicts(
            data.salonId,
            data.workerIds,
            data.date,
            data.time,
            data.duration
        );

        // Price snapshot and deposit rule (online booking by a client)
        let totalPrice = data.totalPrice;
        let depositAmount = 0;
        if (data.collectDeposit) {
            if (totalPrice === undefined) {
                totalPrice = (await this.computeTotals(data.serviceIds, data.addonIds || [])).totalPrice;
            }
            const settings = await this.provider.getSalonSettings(data.salonId);
            depositAmount = calculateDeposit(totalPrice, settings);
        }
        const depositStatus = depositAmount > 0 ? 'pending' : 'none';

        // Create booking
        const booking = await this.provider.createBooking({
            ...data,
            status: data.status || 'Pending',
            isSensitive: hasConflict,
            totalPrice,
            depositAmount,
            depositStatus
        });

        // Add workers (the first one is the primary stylist, the others assist)
        booking.workerIds = [];
        if (data.workerIds && data.workerIds.length > 0) {
            const uniqueWorkerIds = Array.from(new Set(data.workerIds));
            for (const [index, workerId] of uniqueWorkerIds.entries()) {
                await this.provider.addWorkerToBooking(booking.id, workerId, index === 0);
                booking.workerIds.push(workerId);
            }
            booking.primaryWorkerId = uniqueWorkerIds[0];
        }

        // Add services
        booking.serviceIds = [];
        for (const serviceId of data.serviceIds) {
            await this.provider.addServiceToBooking(booking.id, serviceId);
            booking.serviceIds.push(serviceId);
        }

        // Add-ons: freeze name, price and duration at booking time
        if (data.addonIds && data.addonIds.length > 0) {
            const addons = await this.resolveAddons(data.addonIds);
            const snapshots = buildAddonSnapshots(booking.id, addons);
            await this.provider.setBookingAddons(booking.id, snapshots);
            booking.addonIds = snapshots.map(s => s.addonId);
            booking.addons = snapshots;
        }

        // Log action
        await this.logInteraction('booking', booking.id, 'created', `Booking for ${booking.date} at ${booking.time}`);

        return booking;
    }

    /**
     * Update booking. When `addonIds` is provided the add-on snapshots are rebuilt.
     */
    async update(id: number, data: Partial<Booking>): Promise<Booking> {
        const { addonIds, addons: _ignoredSnapshots, workerIds, primaryWorkerId, serviceIds, ...rest } = data;
        void _ignoredSnapshots;

        const booking = await this.provider.updateBooking(id, {
            ...rest,
            updatedBy: this.getCurrentUser()
        });

        // Team and services live in junction tables: sync them explicitly
        if (workerIds !== undefined) {
            await this.provider.setBookingWorkers(id, workerIds, primaryWorkerId);
            booking.workerIds = Array.from(new Set(workerIds));
            booking.primaryWorkerId = primaryWorkerId && booking.workerIds.includes(primaryWorkerId) ? primaryWorkerId : booking.workerIds[0];
        }
        if (serviceIds !== undefined) {
            await this.syncServices(id, serviceIds);
            booking.serviceIds = Array.from(new Set(serviceIds));
        }

        if (addonIds !== undefined) {
            const resolved = await this.resolveAddons(addonIds);
            const snapshots = buildAddonSnapshots(id, resolved);
            await this.provider.setBookingAddons(id, snapshots);
            booking.addonIds = snapshots.map(s => s.addonId);
            booking.addons = snapshots;
        }

        await this.logInteraction('booking', id, 'updated');

        return booking;
    }

    /**
     * Compute price and duration totals for services and add-ons (by id)
     */
    async computeTotals(serviceIds: number[], addonIds: number[] = []): Promise<BookingTotals> {
        const services: Service[] = [];
        for (const serviceId of Array.from(new Set(serviceIds))) {
            const service = await this.provider.getService(serviceId);
            if (service) services.push(service);
        }
        const addons = await this.resolveAddons(addonIds);
        return calculateBookingTotals(services, addons);
    }

    /**
     * Add-on snapshots stored on a booking
     */
    async getAddons(bookingId: number) {
        return this.provider.getBookingAddons(bookingId);
    }

    /**
     * Replace the team of a booking (shared services). The stylist booked first stays primary
     * unless another primary is given. Newly added stylists must be free on that slot.
     */
    async setWorkers(bookingId: number, workerIds: number[], primaryWorkerId?: number): Promise<Booking> {
        const booking = await this.provider.getBooking(bookingId);
        if (!booking) throw new Error(`Booking ${bookingId} not found`);

        const unique = Array.from(new Set(workerIds));
        const currentIds = booking.workerIds || [];
        const addedIds = unique.filter(id => !currentIds.includes(id));

        if (addedIds.length > 0) {
            const busy = await this.findBusyWorkers(booking.salonId, addedIds, booking.date, booking.time, booking.duration, bookingId);
            if (busy.length > 0) {
                const names = busy.map(w => w.name).join(', ');
                throw new Error(`Already booked at this time: ${names}`);
            }
        }

        const primary = primaryWorkerId && unique.includes(primaryWorkerId)
            ? primaryWorkerId
            : (booking.primaryWorkerId && unique.includes(booking.primaryWorkerId) ? booking.primaryWorkerId : unique[0]);

        await this.provider.setBookingWorkers(bookingId, unique, primary);

        const removedIds = currentIds.filter(id => !unique.includes(id));
        if (addedIds.length > 0) {
            await this.logInteraction('booking', bookingId, 'worker_added', `Workers ${addedIds.join(', ')} added`);
        }
        if (removedIds.length > 0) {
            await this.logInteraction('booking', bookingId, 'worker_removed', `Workers ${removedIds.join(', ')} removed`);
        }

        const updated = await this.provider.getBooking(bookingId);
        return updated ? { ...updated, workerIds: unique, primaryWorkerId: primary } : { ...booking, workerIds: unique, primaryWorkerId: primary };
    }

    /**
     * Workers among `workerIds` who already have an overlapping booking on that slot
     */
    private async findBusyWorkers(
        salonId: number,
        workerIds: number[],
        date: string,
        time: string,
        duration: number,
        excludeBookingId?: number
    ): Promise<SalonWorker[]> {
        const dayBookings = await this.provider.getBookingsByDate(salonId, date);
        const [hours, minutes] = time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const busy = new Map<number, SalonWorker>();

        for (const other of dayBookings) {
            if (other.id === excludeBookingId) continue;
            if (other.status === 'Cancelled' || other.status === 'Closed') continue;

            const [bHours, bMinutes] = other.time.split(':').map(Number);
            const bStart = bHours * 60 + bMinutes;
            const bEnd = bStart + other.duration;
            const overlap = startMinutes < bEnd && endMinutes > bStart;
            if (!overlap) continue;

            const otherWorkers = await this.provider.getBookingWorkers(other.id);
            for (const w of otherWorkers) {
                if (workerIds.includes(w.id)) busy.set(w.id, w);
            }
        }

        return Array.from(busy.values());
    }

    /**
     * Make the booking_services junction match `serviceIds`
     */
    private async syncServices(bookingId: number, serviceIds: number[]): Promise<void> {
        const unique = Array.from(new Set(serviceIds));
        const current = (await this.provider.getBookingServices(bookingId)).map(s => s.id);
        for (const id of current.filter(id => !unique.includes(id))) {
            await this.provider.removeServiceFromBooking(bookingId, id);
        }
        for (const id of unique.filter(id => !current.includes(id))) {
            await this.provider.addServiceToBooking(bookingId, id);
        }
    }

    /**
     * Record the deposit outcome. A paid deposit confirms a pending booking.
     */
    async markDeposit(id: number, status: 'paid' | 'failed' | 'refunded', reference?: string): Promise<Booking> {
        const current = await this.provider.getBooking(id);
        const updates: Partial<Booking> = {
            depositStatus: status,
            depositReference: reference ?? current?.depositReference,
            updatedBy: this.getCurrentUser()
        };
        if (status === 'paid' && current && (current.status === 'Pending' || current.status === 'Created')) {
            updates.status = 'Confirmed';
        }
        const booking = await this.provider.updateBooking(id, updates);
        await this.logInteraction('booking', id, `deposit_${status}`, reference ? `Reference ${reference}` : undefined);
        return booking;
    }

    /**
     * Load catalog add-ons by id, rejecting unknown or inactive ones
     */
    private async resolveAddons(addonIds: number[]): Promise<ServiceAddon[]> {
        const addons: ServiceAddon[] = [];
        for (const addonId of Array.from(new Set(addonIds))) {
            const addon = await this.provider.getServiceAddon(addonId);
            if (!addon) throw new Error(`Add-on ${addonId} not found`);
            if (!addon.isActive) throw new Error(`Add-on "${addon.name}" is no longer available`);
            addons.push(addon);
        }
        return addons;
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
