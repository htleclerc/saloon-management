/**
 * Validators — centralized Zod schema exports
 */

// Base field schemas
export {
    emailSchema,
    optionalEmailSchema,
    phoneSchema,
    optionalPhoneSchema,
    positiveNumberSchema,
    nonNegativeNumberSchema,
    isoDateSchema,
    timeSchema,
    percentageSchema,
    positiveIntSchema,
    nameSchema,
    salonIdSchema,
    entityIdSchema,
    optionalUrlSchema,
} from './base.schemas';

// Entity schemas
export {
    SalonDetailsSchema,
    SalonCreateSchema,
    SalonUpdateSchema,
    type SalonDetailsInput,
    type SalonCreateInput,
} from './salon.schemas';

export {
    ClientCreateSchema,
    ClientUpdateSchema,
    type ClientCreateInput,
    type ClientUpdateInput,
} from './client.schemas';

export {
    WorkerCreateSchema,
    WorkerUpdateSchema,
    WeeklyScheduleSchema,
    ScheduleDaySchema,
    type WorkerCreateInput,
    type WeeklySchedule,
} from './worker.schemas';

export {
    ServiceCreateSchema,
    ServiceUpdateSchema,
    ProductCreateSchema,
    ProductUpdateSchema,
    type ServiceCreateInput,
    type ProductCreateInput,
} from './service.schemas';

export {
    BookingCreateSchema,
    BookingUpdateSchema,
    BookingStatusSchema,
    type BookingCreateInput,
} from './booking.schemas';

export {
    IncomeCreateSchema,
    IncomeUpdateSchema,
    IncomeStatusSchema,
    WorkerShareSchema,
    IncomeProductSchema,
    type IncomeCreateInput,
} from './income.schemas';

export {
    ExpenseCreateSchema,
    ExpenseUpdateSchema,
    ExpenseStatusSchema,
    ExpenseCategoryCreateSchema,
    type ExpenseCreateInput,
} from './expense.schemas';

export {
    PaymentRecordSchema,
    PaymentUpdateSchema,
    PaymentStatusSchema,
    PaymentStatusUpdateSchema,
    PaymentRejectionSchema,
    PaymentDisputeSchema,
    type PaymentRecordInput,
    type PaymentStatusUpdateInput,
} from './payroll.schemas';
