import { describe, it, expect } from 'vitest';
import { canPerformBookingAction, canPerformIncomeAction, useActionPermissions } from './permissions';
import { BookingStatus, IncomeStatus } from '@/types';

describe('Permissions Logic', () => {
    describe('Booking Permissions', () => {
        it('should allow anyone to view bookings in any status', () => {
            const statuses: BookingStatus[] = ["Created", "Pending", "Confirmed", "Cancelled", "Started", "Finished", "Closed"];
            statuses.forEach(status => {
                const booking = { status };
                expect(canPerformBookingAction(booking as any, 'view', 'client')).toBe(true);
                expect(canPerformBookingAction(booking as any, 'view', 'worker')).toBe(true);
                expect(canPerformBookingAction(booking as any, 'view', 'owner')).toBe(true);
            });
        });

        it('should allow client to cancel booking in Created/Pending/Confirmed status', () => {
            expect(canPerformBookingAction({ status: 'Created' }, 'cancel', 'client')).toBe(true);
            expect(canPerformBookingAction({ status: 'Pending' }, 'cancel', 'client')).toBe(true);
            expect(canPerformBookingAction({ status: 'Confirmed' }, 'cancel', 'client')).toBe(true);
        });

        it('should NOT allow client to cancel booking once started or finished', () => {
            expect(canPerformBookingAction({ status: 'Started' }, 'cancel', 'client')).toBe(false);
            expect(canPerformBookingAction({ status: 'Finished' }, 'cancel', 'client')).toBe(false);
        });

        it('should NOT allow client to edit bookings', () => {
            const booking = { status: 'Created' as BookingStatus };
            expect(canPerformBookingAction(booking, 'edit', 'client')).toBe(false);
        });

        it('should allow worker to start confirmed booking', () => {
            const booking = { status: 'Confirmed' as BookingStatus };
            expect(canPerformBookingAction(booking, 'start', 'worker')).toBe(true);
        });

        it('should NOT allow worker to delete bookings', () => {
            const booking = { status: 'Cancelled' as BookingStatus };
            expect(canPerformBookingAction(booking, 'delete', 'worker')).toBe(false);
        });

        it('should allow manager to delete cancelled bookings', () => {
            const booking = { status: 'Cancelled' as BookingStatus };
            expect(canPerformBookingAction(booking, 'delete', 'manager')).toBe(true);
        });
    });

    describe('Income Permissions', () => {
        it('should allow ONLY owner/manager/super_admin to validate income', () => {
            const income = { status: 'Draft' as IncomeStatus };
            expect(canPerformIncomeAction(income, 'validate', 'super_admin')).toBe(true);
            expect(canPerformIncomeAction(income, 'validate', 'owner')).toBe(true);
            expect(canPerformIncomeAction(income, 'validate', 'manager')).toBe(true);
            expect(canPerformIncomeAction(income, 'validate', 'worker')).toBe(false);
            expect(canPerformIncomeAction(income, 'validate', 'client')).toBe(false);
        });

        it('should allow worker to edit draft income but not validate it', () => {
            const income = { status: 'Draft' as IncomeStatus };
            expect(canPerformIncomeAction(income, 'edit', 'worker')).toBe(true);
            expect(canPerformIncomeAction(income, 'validate', 'worker')).toBe(false);
        });
        describe('Sensitive Financial Permissions', () => {
            const mockAuth = (role: any, workerId?: string) => ({
                user: { role },
                canModify: true,
                getWorkerId: () => workerId
            });

            it('should allow manager/owner to view any worker financials', () => {
                const rules = useActionPermissions(mockAuth('manager') as any);
                expect(rules.canViewSensitiveWorkerFinancials(1)).toBe(true);
                expect(rules.canViewSensitiveWorkerFinancials('worker_demo_1')).toBe(true);

                const ownerRules = useActionPermissions(mockAuth('owner') as any);
                expect(ownerRules.canViewSensitiveWorkerFinancials(5)).toBe(true);
            });

            it('should allow worker to view ONLY their own financials', () => {
                const rules = useActionPermissions(mockAuth('worker', '1') as any);
                expect(rules.canViewSensitiveWorkerFinancials(1)).toBe(true);
                expect(rules.canViewSensitiveWorkerFinancials('1')).toBe(true);
                expect(rules.canViewSensitiveWorkerFinancials(2)).toBe(false);
            });

            it('should handle demo worker ID normalization correctly', () => {
                const rules = useActionPermissions(mockAuth('worker', 'worker_demo_1') as any);
                expect(rules.canViewSensitiveWorkerFinancials('1')).toBe(true);
                expect(rules.canViewSensitiveWorkerFinancials(1)).toBe(true);
            });
        });
    });
});
