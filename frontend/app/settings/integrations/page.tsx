"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plug, Check, ExternalLink, Calendar, CreditCard, MessageSquare, Cloud, Mail, Eye, EyeOff, Save, Loader2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { getLocalSettings, saveLocalSettings } from "@/lib/utils/localSettingsStorage";
import { salonService } from "@/lib/services/SalonService";

interface IntegrationState {
    connected: boolean;
    account: string | null;
}

export default function IntegrationsSettingsPage() {
    const { t } = useTranslation();
    const { user, activeSalonId, currentTenant, canModify } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const integrationDefs = [
        { id: "google-calendar", name: t("settings.integrationsPage.googleCalendar"), description: t("settings.integrationsPage.googleCalendarDesc"), icon: Calendar, color: "from-red-500 to-red-600" },
        { id: "stripe", name: t("settings.integrationsPage.stripe"), description: t("settings.integrationsPage.stripeDesc"), icon: CreditCard, color: "from-primary to-[var(--color-primary)]" },
        { id: "whatsapp", name: t("settings.integrationsPage.whatsapp"), description: t("settings.integrationsPage.whatsappDesc"), icon: MessageSquare, color: "from-green-500 to-green-600" },
        { id: "google-drive", name: t("settings.integrationsPage.googleDrive"), description: t("settings.integrationsPage.googleDriveDesc"), icon: Cloud, color: "from-blue-500 to-blue-600" },
    ];

    const defaultStates: Record<string, IntegrationState> = {
        "google-calendar": { connected: true, account: user?.email || "" },
        "stripe": { connected: true, account: currentTenant?.name || "" },
        "whatsapp": { connected: false, account: null },
        "google-drive": { connected: false, account: null },
    };

    const [states, setStates] = useState<Record<string, IntegrationState>>(defaultStates);

    // Brevo email config
    const [brevoApiKey, setBrevoApiKey] = useState("");
    const [brevoSenderEmail, setBrevoSenderEmail] = useState("");
    const [brevoSenderName, setBrevoSenderName] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailConfigLoaded, setEmailConfigLoaded] = useState(false);

    useEffect(() => {
        if (activeSalonId) {
            const saved = getLocalSettings<Record<string, IntegrationState>>(activeSalonId, 'integrations', defaultStates);
            setStates(saved);
            loadEmailConfig();
        }
    }, [activeSalonId]);

    const loadEmailConfig = async () => {
        try {
            const settings = await salonService.getSettings(Number(activeSalonId));
            if (settings?.emailConfig) {
                setBrevoApiKey(settings.emailConfig.brevoApiKey || "");
                setBrevoSenderEmail(settings.emailConfig.senderEmail || "");
                setBrevoSenderName(settings.emailConfig.senderName || "");
            }
            setEmailConfigLoaded(true);
        } catch {
            setEmailConfigLoaded(true);
        }
    };

    const handleToggle = (id: string) => {
        if (handleReadOnlyClick()) return;
        const current = states[id];
        const newStates = {
            ...states,
            [id]: {
                connected: !current.connected,
                account: !current.connected ? (user?.email || "Connected") : null,
            },
        };
        setStates(newStates);
        if (activeSalonId) saveLocalSettings(activeSalonId, 'integrations', newStates);
        showToast(
            t("common.success"),
            current.connected ? t("settings.integrationsPage.disconnectedMsg") : t("settings.integrationsPage.connectedMsg"),
            "success"
        );
    };

    const handleSaveEmailConfig = async () => {
        if (handleReadOnlyClick()) return;
        if (!activeSalonId) return;

        try {
            setSavingEmail(true);
            await salonService.updateSettings(Number(activeSalonId), {
                emailConfig: brevoApiKey ? {
                    brevoApiKey,
                    senderEmail: brevoSenderEmail || undefined,
                    senderName: brevoSenderName || undefined,
                } : null,
            });
            showToast(t("common.success"), t("settings.integrationsPage.emailConfigSaved"), "success");
        } catch (error) {
            console.error("Failed to save email config:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setSavingEmail(false);
        }
    };

    const handleTestEmail = async () => {
        if (!user?.email) return;
        try {
            setTestingEmail(true);
            const res = await fetch('/api/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    salonId: Number(activeSalonId),
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(t("common.success"), t("settings.integrationsPage.testEmailSent"), "success");
            } else {
                showToast(t("common.error"), data.error || t("errors.generic"), "error");
            }
        } catch {
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setTestingEmail(false);
        }
    };

    const hasCustomEmailConfig = !!brevoApiKey;

    return (
        <SettingsLayout
            title={t("settings.integrationsPage.title")}
            description={t("settings.integrationsPage.description")}
        >
            {/* Email Provider (Brevo) */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.integrationsPage.emailProvider")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.integrationsPage.emailProviderDesc")}</p>
                    </div>
                    {hasCustomEmailConfig ? (
                        <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            <Check className="w-3 h-3" /> {t("settings.integrationsPage.customConfig")}
                        </span>
                    ) : (
                        <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {t("settings.integrationsPage.usingDefault")}
                        </span>
                    )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <p className="text-sm text-blue-800">
                        {t("settings.integrationsPage.emailProviderInfo")}
                    </p>
                </div>

                {emailConfigLoaded && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Brevo API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={brevoApiKey}
                                    onChange={(e) => setBrevoApiKey(e.target.value)}
                                    readOnly={!canModify}
                                    placeholder={t("settings.integrationsPage.apiKeyPlaceholder")}
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("settings.integrationsPage.senderEmail")}
                                </label>
                                <input
                                    type="email"
                                    value={brevoSenderEmail}
                                    onChange={(e) => setBrevoSenderEmail(e.target.value)}
                                    readOnly={!canModify}
                                    placeholder="noreply@yoursalon.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("settings.integrationsPage.senderName")}
                                </label>
                                <input
                                    type="text"
                                    value={brevoSenderName}
                                    onChange={(e) => setBrevoSenderName(e.target.value)}
                                    readOnly={!canModify}
                                    placeholder={currentTenant?.name || "Your Salon"}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <ReadOnlyGuard>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestEmail}
                                    disabled={testingEmail}
                                >
                                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {t("settings.integrationsPage.sendTestEmail")}
                                </Button>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveEmailConfig}
                                    disabled={savingEmail}
                                >
                                    {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {t("common.save")}
                                </Button>
                            </ReadOnlyGuard>
                        </div>
                    </div>
                )}
            </Card>

            {/* Connected Integrations */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Plug className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.integrationsPage.available")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.integrationsPage.availableDesc")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrationDefs.map((integration) => {
                        const Icon = integration.icon;
                        const state = states[integration.id] || { connected: false, account: null };
                        return (
                            <div
                                key={integration.id}
                                className={`p-4 rounded-xl border-2 ${state.connected ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${integration.color} rounded-xl flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 text-sm">{integration.name}</h4>
                                                {state.connected && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                        <Check className="w-3 h-3" /> {t("settings.integrationsPage.connected")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{integration.description}</p>
                                        </div>
                                    </div>
                                </div>
                                {state.connected ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600">{state.account}</p>
                                        <div className="flex gap-2">
                                            <ReadOnlyGuard>
                                                <Button variant="outline" size="sm" className="text-xs">{t("settings.integrationsPage.configure")}</Button>
                                            </ReadOnlyGuard>
                                            <ReadOnlyGuard>
                                                <Button variant="danger" size="sm" className="text-xs" onClick={() => handleToggle(integration.id)}>
                                                    {t("settings.integrationsPage.disconnect")}
                                                </Button>
                                            </ReadOnlyGuard>
                                        </div>
                                    </div>
                                ) : (
                                    <ReadOnlyGuard>
                                        <Button variant="success" size="sm" className="w-full" onClick={() => handleToggle(integration.id)}>
                                            <Plug className="w-4 h-4" />
                                            {t("settings.integrationsPage.connect")}
                                        </Button>
                                    </ReadOnlyGuard>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* API Access */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("settings.integrationsPage.apiAccess")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.integrationsPage.apiAccessDesc")}</p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm">
                            {t("settings.integrationsPage.generateKey")}
                        </Button>
                    </ReadOnlyGuard>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Production Key</p>
                            <p className="text-xs text-gray-500">{t("settings.integrationsPage.createdOn", { date: new Date().toLocaleDateString() })}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">{t("settings.integrationsPage.copy")}</Button>
                            <ReadOnlyGuard>
                                <Button variant="danger" size="sm" className="text-xs">{t("settings.integrationsPage.revoke")}</Button>
                            </ReadOnlyGuard>
                        </div>
                    </div>
                    <code className="block p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono">
                        sk_live_••••••••••••••••••••••••••••
                    </code>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        <strong>{t("settings.integrationsPage.apiDocs")}</strong>
                        <a href="#" className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1">
                            {t("settings.integrationsPage.fullDocs")} <ExternalLink className="w-3 h-3" />
                        </a>
                    </p>
                </div>
            </Card>
        </SettingsLayout>
    );
}
