import { UserRole, AuthContextType } from "@/context/AuthProvider";
import { Booking, BookingStatus, Income, IncomeStatus } from "@/types";

export type BookingAction = "view" | "edit" | "cancel" | "start" | "confirm" | "approve_reschedule" | "reject_reschedule" | "manage_team" | "view_invoice" | "delete";
export type IncomeAction = "view" | "edit" | "validate" | "print" | "view_invoice" | "delete";
export type ServiceAction = "view" | "add" | "edit" | "archive" | "delete";
export type ExpenseAction = "view" | "add" | "edit" | "delete";

interface ActionRule<TStatus, TAction extends string> {
    allowedStatuses?: TStatus[];
    allowedRoles: UserRole[];
    requiresInvoiceId?: boolean;
}

const bookingRules: Record<BookingAction, ActionRule<BookingStatus, BookingAction>> = {
    view: {
        allowedStatuses: ["Created", "Pending", "Confirmed", "Cancelled", "Started", "Waiting", "Finished", "Validated", "PendingApproval", "Rescheduled", "Closed"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
    },
    edit: {
        allowedStatuses: ["Created", "Pending", "PendingApproval", "Rescheduled"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    cancel: {
        allowedStatuses: ["Created", "Pending", "Confirmed", "PendingApproval", "Rescheduled"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
    },
    start: {
        allowedStatuses: ["Confirmed", "Pending"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    confirm: {
        allowedStatuses: ["Created", "Pending", "PendingApproval"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    approve_reschedule: {
        allowedStatuses: ["PendingApproval"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    reject_reschedule: {
        allowedStatuses: ["PendingApproval"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    manage_team: {
        allowedStatuses: ["Created", "Pending", "Confirmed", "Started", "Waiting", "Finished", "Validated", "PendingApproval", "Rescheduled"],
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    view_invoice: {
        allowedStatuses: ["Finished", "Validated", "Closed"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
        requiresInvoiceId: true,
    },
    delete: {
        allowedStatuses: ["Cancelled", "Created"],
        allowedRoles: ["super_admin", "owner", "admin"],
    },
};

const incomeRules: Record<IncomeAction, ActionRule<IncomeStatus, IncomeAction>> = {
    view: {
        allowedStatuses: ["Draft", "Pending", "Validated", "Cancelled", "Refused"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
    },
    edit: {
        allowedStatuses: ["Draft", "Pending"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    validate: {
        allowedStatuses: ["Draft", "Pending"],
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    print: {
        allowedStatuses: ["Validated", "Draft", "Pending"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
    },
    view_invoice: {
        allowedStatuses: ["Validated"],
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
        requiresInvoiceId: true,
    },
    delete: {
        allowedStatuses: ["Draft", "Cancelled"],
        allowedRoles: ["super_admin", "owner", "admin"],
    },
};

const serviceRules: Record<ServiceAction, ActionRule<string, ServiceAction>> = {
    view: {
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker", "client"],
    },
    add: {
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    edit: {
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    archive: {
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    delete: {
        allowedRoles: ["super_admin", "owner"],
    },
};

const expenseRules: Record<ExpenseAction, ActionRule<string, ExpenseAction>> = {
    view: {
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    add: {
        allowedRoles: ["super_admin", "owner", "admin", "manager", "worker"],
    },
    edit: {
        allowedRoles: ["super_admin", "owner", "admin", "manager"],
    },
    delete: {
        allowedRoles: ["super_admin", "owner", "admin"],
    },
};

/**
 * Check if a user can perform a specific action on a booking.
 */
export function canPerformBookingAction(
    booking: Partial<Booking> & { status: BookingStatus },
    action: BookingAction,
    userRole: UserRole,
    hasInvoiceId: boolean = false
): boolean {
    const rule = bookingRules[action];
    if (!rule) return false;

    const statusMatches = rule.allowedStatuses ? rule.allowedStatuses.includes(booking.status) : true;
    const roleMatches = rule.allowedRoles.includes(userRole);
    const invoiceRequirementMet = rule.requiresInvoiceId ? hasInvoiceId || !!booking.incomeId : true;

    return statusMatches && roleMatches && invoiceRequirementMet;
}

/**
 * Check if a user can perform a specific action on an income record.
 */
export function canPerformIncomeAction(
    income: Partial<Income> & { status: IncomeStatus },
    action: IncomeAction,
    userRole: UserRole
): boolean {
    const rule = incomeRules[action];
    if (!rule) return false;

    const statusMatches = rule.allowedStatuses ? rule.allowedStatuses.includes(income.status) : true;
    const roleMatches = rule.allowedRoles.includes(userRole);
    const invoiceRequirementMet = rule.requiresInvoiceId ? income.hasInvoice || !!income.invoiceUrl : true;

    return statusMatches && roleMatches && invoiceRequirementMet;
}

/**
 * Check if a user can perform a specific action on a service.
 */
export function canPerformServiceAction(
    action: ServiceAction,
    userRole: UserRole
): boolean {
    const rule = serviceRules[action];
    if (!rule) return false;
    return rule.allowedRoles.includes(userRole);
}

/**
 * Check if a user can perform a specific action on an expense.
 */
export function canPerformExpenseAction(
    action: ExpenseAction,
    userRole: UserRole
): boolean {
    const rule = expenseRules[action];
    if (!rule) return false;
    return rule.allowedRoles.includes(userRole);
}

/**
 * React hook for checking permissions in components.
 */
export function useActionPermissions(auth: AuthContextType) {
    const userRole = auth.user?.role as UserRole;

    return {
        booking: (booking: Partial<Booking> & { status: BookingStatus }, action: BookingAction, hasInvoiceId: boolean = false) =>
            canPerformBookingAction(booking, action, userRole, hasInvoiceId),
        income: (income: Partial<Income> & { status: IncomeStatus }, action: IncomeAction) =>
            canPerformIncomeAction(income, action, userRole),
        service: (action: ServiceAction) => canPerformServiceAction(action, userRole),
        expense: (action: ExpenseAction) => canPerformExpenseAction(action, userRole),
        isAdmin: ["super_admin", "owner", "admin"].includes(userRole),
        isManager: ["super_admin", "owner", "admin", "manager"].includes(userRole),
        canViewFinancialDashboard: !["worker"].includes(userRole),
        canViewSensitiveWorkerFinancials: (targetWorkerId: number | string) => {
            // Admin/Owners/Managers can see everyone
            if (["super_admin", "owner", "admin", "manager"].includes(userRole)) return true;

            // Workers can only see themselves
            // Robust ID handling: 
            // 1. Get current worker ID from auth context
            // 2. Normalize both IDs to strings for comparison
            // 3. Handle specific demo case ('worker_demo_1' == '1')
            const currentWorkerId = auth.getWorkerId();

            if (!currentWorkerId) return false;

            const normalizeId = (id: number | string) => String(id) === 'worker_demo_1' ? '1' : String(id);

            return normalizeId(targetWorkerId) === normalizeId(currentWorkerId);
        }
    };
}
