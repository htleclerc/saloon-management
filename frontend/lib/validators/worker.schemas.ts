/**
 * Worker Zod Schemas
 */

import { z } from 'zod';
import { nameSchema, salonIdSchema, percentageSchema, optionalEmailSchema, optionalPhoneSchema } from './base.schemas';

/** Weekly schedule day entry */
export const ScheduleDaySchema = z.object({
    active: z.boolean(),
    start: z.string(),
    end: z.string(),
});

/** Weekly schedule (typed replacement for `any`) */
export const WeeklyScheduleSchema = z.record(
    z.string(),
    ScheduleDaySchema
).optional();

/** Worker create */
export const WorkerCreateSchema = z.object({
    salonId: salonIdSchema,
    name: nameSchema,
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    color: z.string().min(1, 'Color is required'),
    sharingKey: percentageSchema,
    bio: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    employeeRole: z.string().optional(),
    contractType: z.string().optional(),
    hireDate: z.string().optional(),
    contractEndDate: z.string().optional(),
    baseSalary: z.number().min(0).optional(),
    experienceLevel: z.string().optional(),
    weeklySchedule: WeeklyScheduleSchema,
    isActive: z.boolean().default(true),
});

/** Worker update */
export const WorkerUpdateSchema = WorkerCreateSchema.partial();

export type WorkerCreateInput = z.infer<typeof WorkerCreateSchema>;
export type WeeklySchedule = z.infer<typeof WeeklyScheduleSchema>;
