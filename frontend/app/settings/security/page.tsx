"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Lock, Shield, Smartphone, Monitor, MapPin, Eye, EyeOff, LogOut, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { supabase } from "@/lib/supabase/client";

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
    const { canModify, user } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [currentBrowser, setCurrentBrowser] = useState("Chrome on Windows");
    const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null);

    useEffect(() => {
        setCurrentBrowser(detectBrowser());
        // Get real session info
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionCreatedAt(session.expires_at ? new Date(session.expires_at * 1000).toLocaleDateString() : null);
            }
        });
    }, []);

    const handlePasswordChange = async () => {
        if (handleReadOnlyClick()) return;

        if (!newPassword || newPassword.length < 8) {
            showToast(t("common.error"), t("settings.securityPage.passwordTooShort"), "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(t("common.error"), t("settings.securityPage.passwordMismatch"), "error");
            return;
        }

        try {
            setIsChangingPassword(true);

            // Supabase Auth: update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                // Handle specific errors
                if (error.message.includes('same_password')) {
                    showToast(t("common.error"), t("settings.securityPage.samePassword"), "error");
                } else if (error.message.includes('weak_password')) {
                    showToast(t("common.error"), t("settings.securityPage.weakPassword"), "error");
                } else {
                    showToast(t("common.error"), error.message, "error");
                }
                return;
            }

            showToast(t("common.success"), t("settings.securityPage.passwordChanged"), "success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Password change failed:", err);
            showToast(t("common.error"), t("settings.securityPage.passwordChangeError"), "error");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDisconnectAll = async () => {
        if (handleReadOnlyClick()) return;

        try {
            setIsDisconnecting(true);

            // Supabase Auth: sign out from all sessions globally
            const { error } = await supabase.auth.signOut({ scope: 'global' });

            if (error) {
                showToast(t("common.error"), error.message, "error");
                return;
            }

            // Redirect to login since all sessions are now invalidated
            window.location.href = '/login';
        } catch (err) {
            console.error("Disconnect all failed:", err);
            showToast(t("common.error"), t("settings.securityPage.disconnectError"), "error");
        } finally {
            setIsDisconnecting(false);
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

                {user?.isDemo ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                        {t("settings.securityPage.demoPasswordNote")}
                    </div>
                ) : (
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
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword || !newPassword || !confirmPassword}
                            >
                                {isChangingPassword ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Lock className="w-4 h-4" />
                                )}
                                {isChangingPassword ? t("common.loading") : t("settings.securityPage.updatePassword")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                )}
            </Card>

            {/* Two-Factor Authentication — Coming Soon */}
            <Card className="relative overflow-hidden">
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
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {t("common.comingSoon")}
                    </span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-600">
                        {t("settings.securityPage.twoFactorComingSoon")}
                    </p>
                </div>
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
                    {!user?.isDemo && (
                        <ReadOnlyGuard>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={handleDisconnectAll}
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                                {t("settings.securityPage.disconnectAll")}
                            </Button>
                        </ReadOnlyGuard>
                    )}
                </div>
                <div className="space-y-3">
                    {/* Current session — real data */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary-light border border-color-primary/30">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                currentBrowser.includes("iPhone") || currentBrowser.includes("Android")
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                            }`}>
                                {currentBrowser.includes("iPhone") || currentBrowser.includes("Android") ? (
                                    <Smartphone className="w-5 h-5" />
                                ) : (
                                    <Monitor className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 text-sm">{currentBrowser}</p>
                                    <span className="px-2 py-0.5 bg-primary-light text-color-primary text-xs rounded-full font-medium">
                                        {t("settings.securityPage.currentSession")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{t("settings.securityPage.currentDevice")}</span>
                                    <span>•</span>
                                    <span>{t("settings.securityPage.activeNow")}</span>
                                    {sessionCreatedAt && (
                                        <>
                                            <span>•</span>
                                            <Clock className="w-3 h-3" />
                                            <span>{t("settings.securityPage.sessionExpires")} {sessionCreatedAt}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
