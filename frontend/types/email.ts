import { z } from "zod";

// Supported email template identifiers
export type EmailTemplateId =
    | "team-invitation"
    | "notification-digest"
    | "welcome-client"
    | "appointment-reminder"
    | "service-complete"
    | "invoice"
    | "test";

export type EmailLocale = "en" | "fr" | "es";

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailSendRequest {
    to: EmailRecipient[];
    templateId: EmailTemplateId;
    locale?: EmailLocale;
    params: Record<string, string | number | boolean>;
    replyTo?: EmailRecipient;
    senderName?: string;
}

export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Zod schema for API route validation
export const EmailSendRequestSchema = z.object({
    to: z.array(
        z.object({
            email: z.string().email(),
            name: z.string().optional(),
        })
    ).min(1),
    templateId: z.enum([
        "team-invitation",
        "notification-digest",
        "welcome-client",
        "appointment-reminder",
        "service-complete",
        "invoice",
        "test",
    ]),
    locale: z.enum(["en", "fr", "es"]).default("en"),
    params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    replyTo: z.object({
        email: z.string().email(),
        name: z.string().optional(),
    }).optional(),
    senderName: z.string().optional(),
});
