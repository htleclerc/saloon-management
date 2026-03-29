/**
 * EmailService — Brevo transactional email sender
 *
 * Server-side only. Uses @getbrevo/brevo SDK v5.
 * Supports per-salon custom Brevo API keys (from salon_settings.email_config).
 * Falls back to the platform default (env vars) when no custom config is provided.
 * Gracefully degrades when no API key is configured at all.
 */

import { BrevoClient } from "@getbrevo/brevo";
import { getBrevoConfig, isEmailConfigured } from "./config";
import { getTemplate } from "./templates";
import type { EmailSendRequest, EmailSendResult, EmailLocale } from "@/types/email";

export interface SalonEmailConfig {
    brevoApiKey?: string;
    senderEmail?: string;
    senderName?: string;
}

export class EmailService {
    private client: BrevoClient;
    private senderEmail: string;
    private senderName: string;

    constructor(customConfig?: SalonEmailConfig) {
        const defaultConfig = getBrevoConfig();

        const apiKey = customConfig?.brevoApiKey || defaultConfig.apiKey;
        this.senderEmail = customConfig?.senderEmail || defaultConfig.senderEmail;
        this.senderName = customConfig?.senderName || defaultConfig.senderName;

        this.client = new BrevoClient({
            apiKey,
        });
    }

    isConfigured(): boolean {
        return isEmailConfigured();
    }

    async send(request: EmailSendRequest): Promise<EmailSendResult> {
        if (!isEmailConfigured() && !request.salonEmailConfig?.brevoApiKey) {
            console.warn("[EmailService] Brevo not configured (no API key), skipping email send");
            return { success: false, error: "Email provider not configured" };
        }

        try {
            const locale: EmailLocale = request.locale || "en";
            const { subject, htmlContent } = getTemplate(request.templateId, request.params, locale);

            // Use salon-specific client if custom config provided
            let client = this.client;
            let senderEmail = this.senderEmail;
            let senderName = this.senderName;

            if (request.salonEmailConfig?.brevoApiKey) {
                client = new BrevoClient({ apiKey: request.salonEmailConfig.brevoApiKey });
                senderEmail = request.salonEmailConfig.senderEmail || senderEmail;
                senderName = request.salonEmailConfig.senderName || senderName;
            }

            const response = await client.transactionalEmails.sendTransacEmail({
                sender: {
                    email: senderEmail,
                    name: request.senderName || senderName,
                },
                to: request.to.map((r) => ({
                    email: r.email,
                    name: r.name,
                })),
                subject,
                htmlContent,
                replyTo: request.replyTo
                    ? { email: request.replyTo.email, name: request.replyTo.name }
                    : undefined,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messageId = (response as any)?.messageId as string | undefined;
            console.log(`[EmailService] Email sent: template=${request.templateId}, to=${request.to[0]?.email}, messageId=${messageId}`);

            return { success: true, messageId };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : JSON.stringify(error);
            console.error("[EmailService] Send failed:", msg);
            return { success: false, error: msg };
        }
    }
}

// Singleton for default (platform) config
let instance: EmailService | null = null;

export function getEmailService(): EmailService {
    if (!instance) {
        instance = new EmailService();
    }
    return instance;
}
