import { UserRole, AuthContextType } from "@/context/AuthProvider";
import { Booking, BookingStatus, Income, IncomeStatus } from "@/types";

export type BookingAction = "view" | "edit" | "cancel" | "start" | "confirm" | "approve_reschedule" | "reject_reschedule" | "manage_team" | "view_invoice" | "delete";
export type IncomeAction = "view" | "edit" | "validate" | "print" | "view_invoice" | "delete";
export type ServiceAction = "view" | "add" | "edit" | "archive" | "delete";
export type ServiceManageAction = "add_category" | "edit_category" | "delete_category";
export type ExpenseAction = "view" | "add" | "edit" | "delete";

interface ActionRule<TStatus, TAction extends string> {
    allowedStatuses?: TStatus[];
    allowedRoles: UserRole[];
    requiresInvoiceId?: boolean;
}

const bookingRules: Record<BookingAction, ActionRule<BookingStatus, BookingAction>> = {
    view: {
        allowedStatuses: ["Created", "Pending", "Confirmed", "Cancelled", "Started", "Finished", "Closed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
    },
    edit: {
        allowedStatuses: ["Created", "Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    cancel: {
        allowedStatuses: ["Created", "Pending", "Confirmed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
    },
    start: {
        allowedStatuses: ["Confirmed", "Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    confirm: {
        allowedStatuses: ["Created", "Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    approve_reschedule: {
        allowedStatuses: ["Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    reject_reschedule: {
        allowedStatuses: ["Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    manage_team: {
        allowedStatuses: ["Created", "Pending", "Confirmed", "Started", "Finished"],
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    view_invoice: {
        allowedStatuses: ["Finished", "Closed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
        requiresInvoiceId: true,
    },
    delete: {
        allowedStatuses: ["Cancelled", "Created"],
        allowedRoles: ["super_admin", "owner", "manager"],
    },
};

const incomeRules: Record<IncomeAction, ActionRule<IncomeStatus, IncomeAction>> = {
    view: {
        allowedStatuses: ["Draft", "Pending", "Validated", "Cancelled", "Refused", "Closed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
    },
    edit: {
        allowedStatuses: ["Draft", "Pending"],
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    validate: {
        allowedStatuses: ["Draft", "Pending"],
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    print: {
        allowedStatuses: ["Validated", "Draft", "Pending", "Closed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
    },
    view_invoice: {
        allowedStatuses: ["Validated", "Closed"],
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
        requiresInvoiceId: true,
    },
    delete: {
        allowedStatuses: ["Draft", "Cancelled"],
        allowedRoles: ["super_admin", "owner", "manager"],
    },
};

const serviceRules: Record<ServiceAction, ActionRule<string, ServiceAction>> = {
    view: {
        allowedRoles: ["super_admin", "owner", "manager", "worker", "client"],
    },
    add: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    edit: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    archive: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    delete: {
        allowedRoles: ["super_admin", "owner"],
    },
};

const expenseRules: Record<ExpenseAction, ActionRule<string, ExpenseAction>> = {
    view: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    add: {
        allowedRoles: ["super_admin", "owner", "manager", "worker"],
    },
    edit: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
    delete: {
        allowedRoles: ["super_admin", "owner", "manager"],
    },
};

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
    const invoiceRequirementMet = rule.requiresInvoiceId ? hasInvoiceId : true;
    return statusMatches && roleMatches && invoiceRequirementMet;
}

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

export function canPerformServiceAction(action: ServiceAction, userRole: UserRole): boolean {
    const rule = serviceRules[action];
    if (!rule) return false;
    return rule.allowedRoles.includes(userRole);
}

export function canPerformExpenseAction(action: ExpenseAction, userRole: UserRole): boolean {
    const rule = expenseRules[action];
    if (!rule) return false;
    return rule.allowedRoles.includes(userRole);
}

export function useActionPermissions(auth: AuthContextType) {
    const userRole = auth.user?.role as UserRole;
    const canModify = auth.canModify;
    const isMutationAction = (action: string) => !["view", "print", "view_invoice"].includes(action);

    return {
        booking: (booking: Partial<Booking> & { status: BookingStatus }, action: BookingAction, hasInvoiceId: boolean = false) => {
            if (!canModify && isMutationAction(action)) return false;
            return canPerformBookingAction(booking, action, userRole, hasInvoiceId);
        },
        income: (income: Partial<Income> & { status: IncomeStatus }, action: IncomeAction) => {
            if (!canModify && isMutationAction(action)) return false;
            return canPerformIncomeAction(income, action, userRole);
        },
        service: (action: ServiceAction) => {
            if (!canModify && isMutationAction(action)) return false;
            return canPerformServiceAction(action, userRole);
        },
        expense: (action: ExpenseAction) => {
            if (!canModify && isMutationAction(action)) return false;
            return canPerformExpenseAction(action, userRole);
        },
        isSuperAdmin: ["super_admin"].includes(userRole),
        isOwner: ["super_admin", "owner"].includes(userRole),
        isManager: ["super_admin", "owner", "manager"].includes(userRole),
        canViewFinancialDashboard: !["worker", "client"].includes(userRole),
        canViewSensitiveWorkerFinancials: (targetWorkerId: number | string) => {
            if (["SuperAdmin", "Owner", "Manager"].includes(userRole)) return true;
            const currentWorkerId = auth.getWorkerId();
            if (!currentWorkerId) return false;
            const normalizeId = (id: number | string) => String(id) === 'worker_demo_1' ? '1' : String(id);
            return normalizeId(targetWorkerId) === normalizeId(currentWorkerId);
        }
    };
}
