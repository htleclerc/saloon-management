"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Save, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { useNotifications } from "@/context/NotificationProvider";
import { NotificationChannelPref, DigestFrequency } from "@/types";

const DEFAULT_CHANNEL_PREFS: NotificationChannelPref[] = [
    { id: "revenue", email: true, push: true, sms: false },
    { id: "expense", email: true, push: false, sms: false },
    { id: "validation", email: true, push: true, sms: true },
    { id: "client", email: true, push: true, sms: false },
    { id: "worker", email: false, push: true, sms: false },
    { id: "report", email: true, push: false, sms: false },
];

export default function NotificationsSettingsPage() {
    const { t } = useTranslation();
    const { canModify, activeSalonId, user } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const { preferences, savePreferences } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const categoryMeta: Record<string, { name: string; description: string }> = {
        revenue: { name: t("settings.notificationsPage.catIncome"), description: t("settings.notificationsPage.catIncomeDesc") },
        expense: { name: t("settings.notificationsPage.catExpenses"), description: t("settings.notificationsPage.catExpensesDesc") },
        validation: { name: t("settings.notificationsPage.catValidation"), description: t("settings.notificationsPage.catValidationDesc") },
        client: { name: t("settings.notificationsPage.catClients"), description: t("settings.notificationsPage.catClientsDesc") },
        worker: { name: t("settings.notificationsPage.catWorkers"), description: t("settings.notificationsPage.catWorkersDesc") },
        report: { name: t("settings.notificationsPage.catReports"), description: t("settings.notificationsPage.catReportsDesc") },
    };

    // Local state (synced from context preferences)
    const [notifications, setNotifications] = useState<NotificationChannelPref[]>(DEFAULT_CHANNEL_PREFS);
    const [digestFrequency, setDigestFrequency] = useState<DigestFrequency>("daily");
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
    const [quietHoursStart, setQuietHoursStart] = useState("22:00");
    const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

    // Sync from DB preferences when they load
    useEffect(() => {
        if (preferences) {
            setNotifications(preferences.channelPreferences.length > 0 ? preferences.channelPreferences : DEFAULT_CHANNEL_PREFS);
            setDigestFrequency(preferences.digestFrequency);
            setQuietHoursEnabled(preferences.quietHoursEnabled);
            setQuietHoursStart(preferences.quietHoursStart);
            setQuietHoursEnd(preferences.quietHoursEnd);
            setIsLoading(false);
        }
    }, [preferences]);

    // Show loading state while preferences are loading
    useEffect(() => {
        if (!preferences && activeSalonId) {
            setIsLoading(true);
        }
    }, [activeSalonId, preferences]);

    const toggleNotification = (categoryId: string, type: "email" | "push" | "sms") => {
        if (!canModify) return;
        setNotifications(prev => prev.map(n =>
            n.id === categoryId ? { ...n, [type]: !n[type] } : n
        ));
        setHasChanges(true);
    };

    const handleDigestChange = (freq: DigestFrequency) => {
        if (!canModify) return;
        setDigestFrequency(freq);
        setHasChanges(true);
    };

    const handleQuietHoursToggle = (enabled: boolean) => {
        if (!canModify) return;
        setQuietHoursEnabled(enabled);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        if (!activeSalonId || !user) {
            showToast(t("common.error"), t("settings.notificationsPage.saved"), "error");
            return;
        }

        try {
            setIsSaving(true);
            const userCode = (user as unknown as Record<string, unknown>).userCode as string || "ADM-000";
            await savePreferences({
                salonId: Number(activeSalonId),
                userCode,
                channelPreferences: notifications,
                digestFrequency,
                quietHoursEnabled,
                quietHoursStart,
                quietHoursEnd,
            });
            setHasChanges(false);
            showToast(t("common.success"), t("settings.notificationsPage.saved"), "success");
        } catch (error) {
            console.error("Failed to save notification preferences:", error);
            showToast(t("common.error"), t("settings.notificationsPage.saveError"), "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to DB state
        if (preferences) {
            setNotifications(preferences.channelPreferences.length > 0 ? preferences.channelPreferences : DEFAULT_CHANNEL_PREFS);
            setDigestFrequency(preferences.digestFrequency);
            setQuietHoursEnabled(preferences.quietHoursEnabled);
            setQuietHoursStart(preferences.quietHoursStart);
            setQuietHoursEnd(preferences.quietHoursEnd);
        }
        setHasChanges(false);
    };

    if (isLoading) {
        return (
            <SettingsLayout
                title={t("settings.notificationsPage.title")}
                description={t("settings.notificationsPage.description")}
            >
                <Card>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-gray-500">{t("common.loading")}...</span>
                    </div>
                </Card>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout
            title={t("settings.notificationsPage.title")}
            description={t("settings.notificationsPage.description")}
        >
            {/* Notification Channels */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.notificationsPage.channels")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.notificationsPage.channelsDesc")}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.notificationsPage.type")}</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1"><Mail className="w-4 h-4" /><span>Email</span></div>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1"><Smartphone className="w-4 h-4" /><span>Push</span></div>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1"><MessageSquare className="w-4 h-4" /><span>SMS</span></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((notif) => {
                                const meta = categoryMeta[notif.id];
                                return (
                                    <tr key={notif.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2">
                                            <p className="font-medium text-gray-900 text-sm">{meta?.name || notif.id}</p>
                                            <p className="text-xs text-gray-500">{meta?.description}</p>
                                        </td>
                                        {(["email", "push", "sms"] as const).map((type) => (
                                            <td key={type} className="text-center py-3 px-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notif[type]}
                                                        onChange={() => toggleNotification(notif.id, type)}
                                                        disabled={!canModify}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Email Digest */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">{t("settings.notificationsPage.emailDigest")}</h3>
                <p className="text-sm text-gray-500 mb-4">{t("settings.notificationsPage.emailDigestDesc")}</p>
                <div className="flex flex-wrap gap-2">
                    {([
                        { id: "off" as DigestFrequency, name: t("settings.notificationsPage.disabled") },
                        { id: "daily" as DigestFrequency, name: t("settings.notificationsPage.daily") },
                        { id: "weekly" as DigestFrequency, name: t("settings.notificationsPage.weekly") },
                        { id: "monthly" as DigestFrequency, name: t("settings.notificationsPage.monthly") },
                    ]).map((freq) => (
                        <button
                            key={freq.id}
                            onClick={() => handleDigestChange(freq.id)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${digestFrequency === freq.id
                                ? "border-color-primary bg-primary-light text-color-primary"
                                : "border-gray-200 text-gray-600 hover:border-color-primary/30"
                                } ${!canModify ? "cursor-not-allowed opacity-80" : ""}`}
                            disabled={!canModify}
                        >
                            {freq.name}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("settings.notificationsPage.quietHours")}</h3>
                        <p className="text-sm text-gray-500">{t("settings.notificationsPage.quietHoursDesc")}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quietHoursEnabled}
                            onChange={(e) => handleQuietHoursToggle(e.target.checked)}
                            disabled={!canModify}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.notificationsPage.start")}</label>
                            <input
                                type="time"
                                value={quietHoursStart}
                                onChange={(e) => { setQuietHoursStart(e.target.value); setHasChanges(true); }}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.notificationsPage.end")}</label>
                            <input
                                type="time"
                                value={quietHoursEnd}
                                onChange={(e) => { setQuietHoursEnd(e.target.value); setHasChanges(true); }}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md" onClick={handleCancel} disabled={!hasChanges}>
                    {t("common.cancel")}
                </Button>
                <ReadOnlyGuard>
                    <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving || !hasChanges}>
                        <Save className="w-4 h-4" />
                        {isSaving ? t("common.saving") : t("common.save")}
                    </Button>
                </ReadOnlyGuard>
            </div>
        </SettingsLayout>
    );
}
