/**
 * Brevo Email Configuration
 *
 * Server-side only — reads from environment variables.
 * If BREVO_API_KEY is not set, email sending is disabled gracefully.
 */

export interface BrevoConfig {
    apiKey: string;
    senderEmail: string;
    senderName: string;
}

export function getBrevoConfig(): BrevoConfig {
    return {
        apiKey: process.env.BREVO_API_KEY || "",
        senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@yoursalon.com",
        senderName: process.env.BREVO_SENDER_NAME || "Saloon Management",
    };
}

export function isEmailConfigured(): boolean {
    return !!process.env.BREVO_API_KEY;
}
