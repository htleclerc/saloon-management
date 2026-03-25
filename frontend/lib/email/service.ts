/**
 * EmailService — Brevo transactional email sender
 *
 * Server-side only. Uses @getbrevo/brevo SDK v5.
 * Gracefully degrades when BREVO_API_KEY is not configured.
 */

import { BrevoClient } from "@getbrevo/brevo";
import { getBrevoConfig, isEmailConfigured } from "./config";
import { getTemplate } from "./templates";
import type { EmailSendRequest, EmailSendResult, EmailLocale } from "@/types/email";

export class EmailService {
    private client: BrevoClient;
    private senderEmail: string;
    private senderName: string;

    constructor() {
        const config = getBrevoConfig();
        this.senderEmail = config.senderEmail;
        this.senderName = config.senderName;

        this.client = new BrevoClient({
            apiKey: config.apiKey,
        });
    }

    async send(request: EmailSendRequest): Promise<EmailSendResult> {
        if (!isEmailConfigured()) {
            console.warn("[EmailService] Brevo not configured (BREVO_API_KEY missing), skipping email send");
            return { success: false, error: "Email provider not configured" };
        }

        try {
            const locale: EmailLocale = request.locale || "en";
            const { subject, htmlContent } = getTemplate(request.templateId, request.params, locale);

            const response = await this.client.transactionalEmails.sendTransacEmail({
                sender: {
                    email: this.senderEmail,
                    name: request.senderName || this.senderName,
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

// Singleton
let instance: EmailService | null = null;

export function getEmailService(): EmailService {
    if (!instance) {
        instance = new EmailService();
    }
    return instance;
}
