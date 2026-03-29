/**
 * Income Domain Rules
 * 
 * Centralized business logic for incomes
 */

import { Income, IncomeStatus } from '@/types';

/**
 * Validates income amounts
 */
export const validateIncomeAmount = (amount: number, discount: number): { isValid: boolean; finalAmount: number; error?: string } => {
    if (amount < 0) return { isValid: false, finalAmount: 0, error: 'Amount must be positive' };

    const finalAmount = amount - discount;
    if (finalAmount < 0) return { isValid: false, finalAmount: 0, error: 'Discount cannot exceed amount' };

    return { isValid: true, finalAmount };
};

/**
 * Validates worker shares sum to 100%
 */
export const validateWorkerShares = (shares: { percentage: number }[]): boolean => {
    const total = shares.reduce((sum, s) => sum + s.percentage, 0);
    return Math.abs(total - 100) < 0.01;
};

/**
 * Rules for status transitions
 */
export const canTransitionIncomeStatus = (current: IncomeStatus, next: IncomeStatus): boolean => {
    const transitions: Record<IncomeStatus, IncomeStatus[]> = {
        'Draft': ['Pending', 'Cancelled'],
        'Pending': ['Validated', 'Refused', 'Cancelled'],
        'Validated': ['Closed'],
        'Cancelled': [],
        'Refused': ['Draft', 'Cancelled'],
        'Closed': []
    };
    return transitions[current]?.includes(next) ?? false;
};
