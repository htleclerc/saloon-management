/**
 * Worker Service
 * 
 * Business logic for worker management
 */

import { BaseService } from './BaseService';
import type { SalonWorker, WorkerStats } from '@/types';
import { WorkerCreateSchema, WorkerUpdateSchema } from '@/lib/validators';

export class WorkerService extends BaseService {
    /**
     * Get all workers for a salon
     */
    async getAll(salonId: number): Promise<SalonWorker[]> {
        return this.provider.getWorkers(salonId);
    }

    /**
     * Get worker by ID
     */
    async getById(id: number): Promise<SalonWorker | null> {
        return this.provider.getWorker(id);
    }

    /**
     * Get worker statistics
     */
    async getStats(id: number): Promise<WorkerStats | null> {
        return this.provider.getWorkerStats(id);
    }

    /**
     * Create a new worker
     */
    async create(data: Omit<SalonWorker, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<SalonWorker> {
        // Zod validation (covers required fields, email/phone format, sharingKey range 0-100)
        WorkerCreateSchema.parse(data);

        // Create worker
        const worker = await this.provider.createWorker({
            ...data,
            createdBy: this.getCurrentUser(),
            updatedBy: this.getCurrentUser()
        });

        // Log action
        await this.logInteraction('worker', worker.id, 'created', `Worker ${worker.name} created`);

        return worker;
    }

    /**
     * Update worker
     */
    async update(id: number, data: Partial<SalonWorker>): Promise<SalonWorker> {
        // Zod validation (covers email/phone format, sharingKey range when present)
        WorkerUpdateSchema.parse(data);

        // Update
        const worker = await this.provider.updateWorker(id, {
            ...data,
            updatedBy: this.getCurrentUser()
        });

        // Log action
        await this.logInteraction('worker', id, 'updated', 'Worker updated');

        return worker;
    }

    /**
     * Delete worker (soft delete via isActive)
     */
    async delete(id: number): Promise<void> {
        await this.provider.deleteWorker(id);
        await this.logInteraction('worker', id, 'deleted', 'Worker deleted');
    }

    /**
     * Activate/deactivate worker
     */
    async setActive(id: number, isActive: boolean): Promise<SalonWorker> {
        const worker = await this.provider.updateWorker(id, {
            isActive,
            updatedBy: this.getCurrentUser()
        });

        await this.logInteraction('worker', id, isActive ? 'activated' : 'deactivated');

        return worker;
    }

    /**
     * Get all worker stats for a salon
     */
    async getStatsBySalon(salonId: number): Promise<WorkerStats[]> {
        const workers = await this.getAll(salonId);
        const stats: WorkerStats[] = [];

        for (const worker of workers) {
            const workerStats = await this.getStats(worker.id);
            if (workerStats) {
                stats.push(workerStats);
            }
        }

        return stats;
    }

    /**
     * Get UserCode for a worker
     */
    async getUserCode(workerId: number): Promise<string | null> {
        const worker = await this.getById(workerId);
        if (!worker || !worker.userId) return null;

        const user = await this.provider.getUser(worker.userId);
        return user ? user.userCode : null;
    }
}

// Export singleton instance
export const workerService = new WorkerService();
