"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Mail, Edit3, Eye, Send, Calendar, UserCheck, CheckCircle, Save, Wifi, WifiOff, Loader2, SendHorizonal } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { salonService } from "@/lib/services/SalonService";
import { getLocalSettings, saveLocalSettings } from "@/lib/utils/localSettingsStorage";

interface EmailPrefs {
    senderName: string;
    replyEmail: string;
    templateStates: Record<string, boolean>;
}

interface EmailStatus {
    configured: boolean;
    senderEmail: string | null;
    senderName: string | null;
}

export default function EmailsSettingsPage() {
    const { t, language } = useTranslation();
    const { user, activeSalonId, canModify, currentTenant } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [senderName, setSenderName] = useState("");
    const [replyEmail, setReplyEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [templateStates, setTemplateStates] = useState<Record<string, boolean>>({
        welcome: true, "appointment-reminder": true, "service-complete": true, invoice: true,
    });

    // Brevo status
    const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [testSending, setTestSending] = useState(false);

    useEffect(() => {
        if (activeSalonId) {
            loadEmailConfig();
            checkEmailStatus();
        }
    }, [activeSalonId]);

    const checkEmailStatus = async () => {
        try {
            setStatusLoading(true);
            const res = await fetch("/api/email/status");
            if (res.ok) {
                const data = await res.json();
                setEmailStatus(data);
            }
        } catch (error) {
            console.error("Failed to check email status:", error);
        } finally {
            setStatusLoading(false);
        }
    };

    const loadEmailConfig = async () => {
        try {
            const salon = await salonService.getById(Number(activeSalonId));
            const defaults: EmailPrefs = {
                senderName: salon?.name || currentTenant?.name || "",
                replyEmail: salon?.email || user?.email || "",
                templateStates: { welcome: true, "appointment-reminder": true, "service-complete": true, invoice: true },
            };
            const saved = getLocalSettings<EmailPrefs>(activeSalonId!, "emails", defaults);
            setSenderName(saved.senderName || defaults.senderName);
            setReplyEmail(saved.replyEmail || defaults.replyEmail);
            setTemplateStates(saved.templateStates);
        } catch (error) {
            console.error("Failed to load email config:", error);
        }
    };

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        try {
            setIsLoading(true);
            if (activeSalonId) {
                saveLocalSettings<EmailPrefs>(activeSalonId, "emails", { senderName, replyEmail, templateStates });
            }
            showToast(t("common.success"), t("settings.emailsPage.saved"), "success");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!user?.email) {
            showToast(t("common.error"), t("settings.emailsPage.noEmail"), "error");
            return;
        }

        setTestSending(true);
        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: [{ email: user.email, name: user.name || "User" }],
                    templateId: "test",
                    locale: language,
                    params: {
                        salonName: senderName || currentTenant?.name || "Your Salon",
                        dashboardUrl: window.location.origin,
                    },
                }),
            });

            if (res.ok) {
                showToast(t("common.success"), t("settings.emailsPage.testSent"), "success");
            } else {
                const data = await res.json();
                showToast(t("common.error"), data.error || t("errors.generic"), "error");
            }
        } catch (error) {
            console.error("Test email failed:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setTestSending(false);
        }
    };

    const emailTemplates = [
        { id: "welcome", name: t("settings.emailsPage.welcomeClient"), description: t("settings.emailsPage.welcomeClientDesc"), icon: UserCheck, color: "from-primary to-[var(--color-primary)]" },
        { id: "appointment-reminder", name: t("settings.emailsPage.appointmentReminder"), description: t("settings.emailsPage.appointmentReminderDesc"), icon: Calendar, color: "from-blue-500 to-blue-600" },
        { id: "service-complete", name: t("settings.emailsPage.serviceCompleted"), description: t("settings.emailsPage.serviceCompletedDesc"), icon: CheckCircle, color: "from-green-500 to-green-600" },
        { id: "invoice", name: t("settings.emailsPage.invoiceEmail"), description: t("settings.emailsPage.invoiceEmailDesc"), icon: Mail, color: "from-orange-500 to-orange-600" },
    ];

    return (
        <SettingsLayout
            title={t("settings.emailsPage.title")}
            description={t("settings.emailsPage.description")}
        >
            {/* Connection Status */}
            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {statusLoading ? (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                        ) : emailStatus?.configured ? (
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <Wifi className="w-5 h-5 text-white" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                                <WifiOff className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.emailsPage.connectionStatus")}</h3>
                            {statusLoading ? (
                                <p className="text-xs text-gray-500">{t("common.loading")}...</p>
                            ) : emailStatus?.configured ? (
                                <p className="text-xs text-green-600">
                                    {t("settings.emailsPage.connected")} — Brevo ({emailStatus.senderEmail})
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    {t("settings.emailsPage.notConnected")}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {emailStatus?.configured && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSendTestEmail}
                                disabled={testSending}
                            >
                                {testSending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <SendHorizonal className="w-4 h-4" />
                                )}
                                {testSending ? t("common.loading") : t("settings.emailsPage.sendTest")}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Sender Configuration */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.emailsPage.senderConfig")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.emailsPage.senderConfigDesc")}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.emailsPage.senderName")}</label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.emailsPage.replyEmail")}</label>
                        <input
                            type="email"
                            value={replyEmail}
                            onChange={(e) => setReplyEmail(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Email Templates */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-secondary)] to-secondary rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.emailsPage.templates")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.emailsPage.templatesDesc")}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {emailTemplates.map((template) => {
                        const Icon = template.icon;
                        const enabled = templateStates[template.id] !== false;
                        return (
                            <div
                                key={template.id}
                                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${enabled ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-50/50 opacity-60"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                                        <p className="text-xs text-gray-500">{template.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={(e) => setTemplateStates({ ...templateStates, [template.id]: e.target.checked })}
                                            disabled={!canModify}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Eye className="w-3 h-3" />
                                            {t("settings.emailsPage.preview")}
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Edit3 className="w-3 h-3" />
                                            {t("settings.emailsPage.editTemplate")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Email Preview */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">{t("settings.emailsPage.templatePreview")}</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">De:</span>
                            <span>{senderName} &lt;{replyEmail}&gt;</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Objet:</span>
                            <span>Bienvenue chez {senderName}!</span>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="max-w-lg mx-auto">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">{senderName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Bienvenue!</h2>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Bonjour <span className="font-semibold text-color-primary">{"{{client_name}}"}</span>,
                            </p>
                            <p className="text-gray-600 text-sm mb-4">
                                Nous sommes ravis de vous compter parmi nos clients. Votre compte a été créé avec succès.
                            </p>
                            <div className="text-center">
                                <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                                    {t("settings.emailsPage.bookAppointment")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md">{t("common.cancel")}</Button>
                <ReadOnlyGuard>
                    <Button variant="primary" size="md" onClick={handleSave} disabled={isLoading}>
                        <Save className="w-4 h-4" />
                        {isLoading ? t("common.saving") : t("common.save")}
                    </Button>
                </ReadOnlyGuard>
            </div>
        </SettingsLayout>
    );
}
