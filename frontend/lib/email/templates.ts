/**
 * Email Templates with i18n support
 *
 * Each template is a function that receives params and locale,
 * returning { subject, htmlContent }.
 * Templates are code-based (not in Brevo dashboard) for version control + i18n.
 */

import type { EmailTemplateId, EmailLocale } from "@/types/email";

interface TemplateOutput {
    subject: string;
    htmlContent: string;
}

type TemplateRenderer = (params: Record<string, string | number | boolean>, locale: EmailLocale) => TemplateOutput;

// ─── i18n Strings ───────────────────────────────────────────────────────────

const i18n: Record<EmailLocale, Record<string, string>> = {
    en: {
        teamInviteSubject: "You're invited to join {{salonName}}",
        teamInviteTitle: "Team Invitation",
        teamInviteBody: "Hi {{firstName}},<br><br>You've been invited to join <strong>{{salonName}}</strong> as a <strong>{{role}}</strong>.",
        teamInviteCta: "Accept Invitation",
        teamInviteFooter: "If you didn't expect this invitation, you can safely ignore this email.",

        digestSubject: "Your {{frequency}} notification digest",
        digestTitle: "Notification Digest",
        digestBody: "Here's your {{frequency}} summary for <strong>{{salonName}}</strong>:",
        digestFooter: "Manage your notification preferences in Settings.",

        testSubject: "Test email from Saloon Management",
        testTitle: "Email Configuration Test",
        testBody: "If you're reading this, your Brevo email integration is working correctly! 🎉",
        testCta: "Go to Dashboard",

        footer: "Sent by {{salonName}} via Saloon Management",
        unsubscribe: "Manage preferences",
    },
    fr: {
        teamInviteSubject: "Vous êtes invité(e) à rejoindre {{salonName}}",
        teamInviteTitle: "Invitation à l'équipe",
        teamInviteBody: "Bonjour {{firstName}},<br><br>Vous avez été invité(e) à rejoindre <strong>{{salonName}}</strong> en tant que <strong>{{role}}</strong>.",
        teamInviteCta: "Accepter l'invitation",
        teamInviteFooter: "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.",

        digestSubject: "Votre résumé de notifications {{frequency}}",
        digestTitle: "Résumé des notifications",
        digestBody: "Voici votre résumé {{frequency}} pour <strong>{{salonName}}</strong> :",
        digestFooter: "Gérez vos préférences de notification dans les Paramètres.",

        testSubject: "Email de test — Saloon Management",
        testTitle: "Test de configuration email",
        testBody: "Si vous lisez ceci, votre intégration Brevo fonctionne correctement ! 🎉",
        testCta: "Aller au tableau de bord",

        footer: "Envoyé par {{salonName}} via Saloon Management",
        unsubscribe: "Gérer les préférences",
    },
    es: {
        teamInviteSubject: "Estás invitado/a a unirte a {{salonName}}",
        teamInviteTitle: "Invitación al equipo",
        teamInviteBody: "Hola {{firstName}},<br><br>Has sido invitado/a a unirte a <strong>{{salonName}}</strong> como <strong>{{role}}</strong>.",
        teamInviteCta: "Aceptar invitación",
        teamInviteFooter: "Si no esperabas esta invitación, puedes ignorar este correo.",

        digestSubject: "Tu resumen de notificaciones {{frequency}}",
        digestTitle: "Resumen de notificaciones",
        digestBody: "Aquí tienes tu resumen {{frequency}} de <strong>{{salonName}}</strong>:",
        digestFooter: "Gestiona tus preferencias de notificación en Configuración.",

        testSubject: "Email de prueba — Saloon Management",
        testTitle: "Prueba de configuración de email",
        testBody: "Si estás leyendo esto, ¡tu integración con Brevo funciona correctamente! 🎉",
        testCta: "Ir al panel",

        footer: "Enviado por {{salonName}} via Saloon Management",
        unsubscribe: "Gestionar preferencias",
    },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function t(locale: EmailLocale, key: string, params: Record<string, string | number | boolean> = {}): string {
    let str = i18n[locale]?.[key] || i18n.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`{{${k}}}`, "g"), String(v));
    }
    return str;
}

function wrapInLayout(title: string, body: string, cta?: { text: string; url: string }, footerText?: string): string {
    const ctaHtml = cta
        ? `<div style="text-align:center;margin:32px 0;">
            <a href="${cta.url}" style="display:inline-block;padding:14px 32px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">${cta.text}</a>
           </div>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#7C3AED,#9333EA);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">${title}</h1>
      </div>
      <!-- Body -->
      <div style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
        ${body}
        ${ctaHtml}
      </div>
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#9CA3AF;font-size:12px;">
      ${footerText || ""}
    </div>
  </div>
</body>
</html>`;
}

// ─── Template Renderers ─────────────────────────────────────────────────────

function renderTeamInvitation(params: Record<string, string | number | boolean>, locale: EmailLocale): TemplateOutput {
    const subject = t(locale, "teamInviteSubject", params);
    const body = t(locale, "teamInviteBody", params);
    const footer = t(locale, "teamInviteFooter", params);
    const footerLine = t(locale, "footer", params);

    const htmlContent = wrapInLayout(
        t(locale, "teamInviteTitle"),
        `${body}<p style="color:#6B7280;font-size:13px;margin-top:24px;">${footer}</p>`,
        params.inviteUrl ? { text: t(locale, "teamInviteCta"), url: String(params.inviteUrl) } : undefined,
        footerLine,
    );

    return { subject, htmlContent };
}

function renderNotificationDigest(params: Record<string, string | number | boolean>, locale: EmailLocale): TemplateOutput {
    const subject = t(locale, "digestSubject", params);
    const body = t(locale, "digestBody", params);
    const summaryHtml = params.summaryHtml ? `<div style="margin-top:16px;padding:16px;background:#F9FAFB;border-radius:8px;">${String(params.summaryHtml)}</div>` : "";
    const footer = t(locale, "digestFooter", params);
    const footerLine = t(locale, "footer", params);

    const htmlContent = wrapInLayout(
        t(locale, "digestTitle"),
        `${body}${summaryHtml}<p style="color:#6B7280;font-size:13px;margin-top:24px;">${footer}</p>`,
        params.dashboardUrl ? { text: t(locale, "testCta"), url: String(params.dashboardUrl) } : undefined,
        footerLine,
    );

    return { subject, htmlContent };
}

function renderTestEmail(params: Record<string, string | number | boolean>, locale: EmailLocale): TemplateOutput {
    const subject = t(locale, "testSubject", params);
    const body = t(locale, "testBody", params);
    const footerLine = t(locale, "footer", params);

    const htmlContent = wrapInLayout(
        t(locale, "testTitle"),
        body,
        params.dashboardUrl ? { text: t(locale, "testCta"), url: String(params.dashboardUrl) } : undefined,
        footerLine,
    );

    return { subject, htmlContent };
}

function renderGenericEmail(params: Record<string, string | number | boolean>, locale: EmailLocale): TemplateOutput {
    const subject = String(params.subject || "Notification");
    const body = String(params.body || "");
    const footerLine = t(locale, "footer", params);

    const htmlContent = wrapInLayout(
        subject,
        body,
        params.ctaUrl ? { text: String(params.ctaText || "Open"), url: String(params.ctaUrl) } : undefined,
        footerLine,
    );

    return { subject, htmlContent };
}

// ─── Registry ───────────────────────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateRenderer> = {
    "team-invitation": renderTeamInvitation,
    "notification-digest": renderNotificationDigest,
    "test": renderTestEmail,
    "welcome-client": renderGenericEmail,
    "appointment-reminder": renderGenericEmail,
    "service-complete": renderGenericEmail,
    "invoice": renderGenericEmail,
};

export function getTemplate(
    templateId: string,
    params: Record<string, string | number | boolean>,
    locale: EmailLocale = "en",
): TemplateOutput {
    const renderer = TEMPLATES[templateId] || renderGenericEmail;
    return renderer(params, locale);
}
