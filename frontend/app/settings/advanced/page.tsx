"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Settings, Database, Code, AlertTriangle, Download, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { getLocalSettings, saveLocalSettings, clearAllLocalSettings, getLocalStorageSize } from "@/lib/utils/localSettingsStorage";

export default function AdvancedSettingsPage() {
    const { t } = useTranslation();
    const { activeSalonId, canModify } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [debugMode, setDebugMode] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [cacheSize, setCacheSize] = useState("0 KB");
    const [lastBackup, setLastBackup] = useState("");

    useEffect(() => {
        if (activeSalonId) {
            const saved = getLocalSettings(activeSalonId, 'advanced', { debugMode: false, maintenanceMode: false });
            setDebugMode(saved.debugMode);
            setMaintenanceMode(saved.maintenanceMode);
        }
        setCacheSize(getLocalStorageSize());
        const storedBackup = localStorage.getItem('workshop-last-backup');
        setLastBackup(storedBackup || new Date().toLocaleDateString());
    }, [activeSalonId]);

    const handleToggleDebug = (value: boolean) => {
        if (!canModify) return;
        setDebugMode(value);
        if (activeSalonId) saveLocalSettings(activeSalonId, 'advanced', { debugMode: value, maintenanceMode });
        showToast(t("common.info"), value ? t("settings.advancedPage.debugEnabled") : t("settings.advancedPage.debugDisabled"), "info");
    };

    const handleToggleMaintenance = (value: boolean) => {
        if (!canModify) return;
        setMaintenanceMode(value);
        if (activeSalonId) saveLocalSettings(activeSalonId, 'advanced', { debugMode, maintenanceMode: value });
        showToast(t("common.warning"), value ? t("settings.advancedPage.maintenanceEnabled") : t("settings.advancedPage.maintenanceDisabled"), "warning");
    };

    const handleClearCache = () => {
        if (handleReadOnlyClick()) return;
        clearAllLocalSettings();
        setCacheSize(getLocalStorageSize());
        showToast(t("common.success"), t("settings.advancedPage.cacheCleared"), "success");
    };

    const handleBackupNow = () => {
        if (handleReadOnlyClick()) return;
        const now = new Date().toLocaleDateString();
        localStorage.setItem('workshop-last-backup', now);
        setLastBackup(now);
        showToast(t("common.success"), t("settings.advancedPage.backupCreated"), "success");
    };

    return (
        <SettingsLayout
            title={t("settings.advancedPage.title")}
            description={t("settings.advancedPage.description")}
        >
            {/* Warning Banner */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-yellow-800 text-sm">{t("settings.advancedPage.sensitiveZone")}</p>
                    <p className="text-xs text-yellow-700">{t("settings.advancedPage.sensitiveWarning")}</p>
                </div>
            </div>

            {/* Developer Options */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.advancedPage.devOptions")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.advancedPage.devOptionsDesc")}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{t("settings.advancedPage.debugMode")}</p>
                            <p className="text-xs text-gray-500">{t("settings.advancedPage.debugModeDesc")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={debugMode} onChange={(e) => handleToggleDebug(e.target.checked)} disabled={!canModify} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{t("settings.advancedPage.maintenanceMode")}</p>
                            <p className="text-xs text-gray-500">{t("settings.advancedPage.maintenanceModeDesc")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={maintenanceMode} onChange={(e) => handleToggleMaintenance(e.target.checked)} disabled={!canModify} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Database & Backup */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.advancedPage.databaseBackup")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.advancedPage.databaseBackupDesc")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">{t("settings.advancedPage.exportData")}</h4>
                        <p className="text-xs text-gray-500 mb-3">{t("settings.advancedPage.exportDataDesc")}</p>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                                {t("settings.advancedPage.exportJSON")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">{t("settings.advancedPage.lastBackup")}</h4>
                        <p className="text-xs text-gray-500 mb-3">{lastBackup}</p>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm" onClick={handleBackupNow}>
                                <RefreshCw className="w-4 h-4" />
                                {t("settings.advancedPage.backupNow")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </div>
            </Card>

            {/* Cache */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.advancedPage.cachePerformance")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.advancedPage.cachePerformanceDesc")}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{t("settings.advancedPage.appCache")}</p>
                        <p className="text-xs text-gray-500">{t("settings.advancedPage.cacheSize", { size: cacheSize })}</p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm" onClick={handleClearCache}>
                            <Trash2 className="w-4 h-4" />
                            {t("settings.advancedPage.clearCache")}
                        </Button>
                    </ReadOnlyGuard>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-2 border-red-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-700">{t("settings.advancedPage.dangerZone")}</h3>
                        <p className="text-xs text-red-600">{t("settings.advancedPage.dangerZoneDesc")}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium text-red-900 text-sm">{t("settings.advancedPage.resetData")}</p>
                            <p className="text-xs text-red-700">{t("settings.advancedPage.resetDataDesc")}</p>
                        </div>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                                {t("settings.advancedPage.reset")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium text-red-900 text-sm">{t("settings.advancedPage.deleteAccount")}</p>
                            <p className="text-xs text-red-700">{t("settings.advancedPage.deleteAccountDesc")}</p>
                        </div>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                                {t("settings.advancedPage.delete")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
