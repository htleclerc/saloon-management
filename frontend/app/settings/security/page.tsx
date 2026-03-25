"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Save, Lock, Shield, Smartphone, Monitor, MapPin, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { getLocalSettings, saveLocalSettings } from "@/lib/utils/localSettingsStorage";

function detectBrowser(): string {
    if (typeof navigator === 'undefined') return "Unknown Browser";
    const ua = navigator.userAgent;
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome on " + detectOS(ua);
    if (ua.includes("Edg")) return "Edge on " + detectOS(ua);
    if (ua.includes("Firefox")) return "Firefox on " + detectOS(ua);
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari on " + detectOS(ua);
    return "Unknown Browser";
}

function detectOS(ua: string): string {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android";
    return "Unknown";
}

export default function SecuritySettingsPage() {
    const { t } = useTranslation();
    const { canModify, activeSalonId } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentBrowser, setCurrentBrowser] = useState("Chrome on Windows");

    useEffect(() => {
        setCurrentBrowser(detectBrowser());
    }, []);

    useEffect(() => {
        if (activeSalonId) {
            const saved = getLocalSettings(activeSalonId, 'security', { twoFactorEnabled: false });
            setTwoFactorEnabled(saved.twoFactorEnabled);
        }
    }, [activeSalonId]);

    const activeSessions = [
        { id: 1, device: currentBrowser, location: t("settings.securityPage.currentDevice"), lastActive: t("settings.securityPage.activeNow"), current: true },
    ];

    const handlePasswordChange = () => {
        if (handleReadOnlyClick()) return;
        if (newPassword.length < 8) {
            showToast(t("common.error"), t("settings.securityPage.passwordTooShort"), "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(t("common.error"), t("settings.securityPage.passwordMismatch"), "error");
            return;
        }
        showToast(t("common.success"), t("settings.securityPage.passwordChanged"), "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleToggle2FA = (checked: boolean) => {
        if (!canModify) return;
        setTwoFactorEnabled(checked);
        if (activeSalonId) {
            saveLocalSettings(activeSalonId, 'security', { twoFactorEnabled: checked });
        }
        showToast(t("common.info"), checked ? t("settings.securityPage.twoFactorEnabled") : t("settings.securityPage.twoFactorDisabledMsg"), "info");
    };

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        try {
            setIsLoading(true);
            if (activeSalonId) {
                saveLocalSettings(activeSalonId, 'security', { twoFactorEnabled });
            }
            showToast(t("common.success"), t("settings.securityPage.settingsSaved"), "success");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingsLayout
            title={t("settings.securityPage.title")}
            description={t("settings.securityPage.description")}
        >
            {/* Change Password */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.securityPage.changePassword")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.securityPage.changePasswordDesc")}</p>
                    </div>
                </div>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.securityPage.currentPassword")}</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.securityPage.newPassword")}</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t("settings.securityPage.passwordHint")}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.securityPage.confirmPassword")}</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="primary" size="md" onClick={handlePasswordChange}>
                            <Lock className="w-4 h-4" />
                            {t("settings.securityPage.updatePassword")}
                        </Button>
                    </ReadOnlyGuard>
                </div>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.securityPage.twoFactor")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.securityPage.twoFactorDesc")}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => handleToggle2FA(e.target.checked)}
                            disabled={!canModify}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-800 mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">{t("settings.securityPage.twoFactorEnabled")}</span>
                        </div>
                        <p className="text-sm text-green-700">
                            {t("settings.securityPage.twoFactorProtected")}
                        </p>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm" className="mt-3">
                                {t("settings.securityPage.reconfigure2FA")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                )}
            </Card>

            {/* Active Sessions */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.securityPage.activeSessions")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.securityPage.activeSessionsDesc")}</p>
                        </div>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            {t("settings.securityPage.disconnectAll")}
                        </Button>
                    </ReadOnlyGuard>
                </div>
                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-3 rounded-xl ${session.current ? "bg-primary-light border border-color-primary/30" : "bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.device.includes("iPhone") || session.device.includes("Android")
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {session.device.includes("iPhone") || session.device.includes("Android") ? (
                                        <Smartphone className="w-5 h-5" />
                                    ) : (
                                        <Monitor className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 text-sm">{session.device}</p>
                                        {session.current && (
                                            <span className="px-2 py-0.5 bg-primary-light text-color-primary text-xs rounded-full font-medium">
                                                {t("settings.securityPage.currentSession")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span>{session.location}</span>
                                        <span>•</span>
                                        <span>{session.lastActive}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.current && (
                                <ReadOnlyGuard>
                                    <button className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </ReadOnlyGuard>
                            )}
                        </div>
                    ))}
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
