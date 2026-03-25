"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, BarChart3, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { getLocalSettings, saveLocalSettings } from "@/lib/utils/localSettingsStorage";

interface AnalyticsPrefs {
    defaultPeriod: string;
    autoExport: boolean;
    exportFormat: string;
    includeCharts: boolean;
    exportFrequency: string;
    exportRecipients: string;
    widgetStates: Record<string, boolean>;
}

const WIDGET_KEYS = ["revenue", "expenses", "workers", "clients", "bookings", "trends"];

export default function AnalyticsSettingsPage() {
    const { t } = useTranslation();
    const { activeSalonId, canModify, user } = useAuth();
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [isLoading, setIsLoading] = useState(false);
    const [defaultPeriod, setDefaultPeriod] = useState("month");
    const [autoExport, setAutoExport] = useState(false);
    const [exportFormat, setExportFormat] = useState("pdf");
    const [includeCharts, setIncludeCharts] = useState(true);
    const [exportFrequency, setExportFrequency] = useState("weekly");
    const [exportRecipients, setExportRecipients] = useState("");
    const [widgetStates, setWidgetStates] = useState<Record<string, boolean>>({
        revenue: true, expenses: true, workers: true, clients: true, bookings: true, trends: false,
    });

    const widgetLabels: Record<string, string> = {
        revenue: t("settings.analyticsPage.widgetRevenue"),
        expenses: t("settings.analyticsPage.widgetExpenses"),
        workers: t("settings.analyticsPage.widgetWorkers"),
        clients: t("settings.analyticsPage.widgetClients"),
        bookings: t("settings.analyticsPage.widgetBookings"),
        trends: t("settings.analyticsPage.widgetTrends"),
    };

    useEffect(() => {
        if (activeSalonId) {
            const defaults: AnalyticsPrefs = {
                defaultPeriod: "month", autoExport: false, exportFormat: "pdf",
                includeCharts: true, exportFrequency: "weekly",
                exportRecipients: user?.email || "",
                widgetStates: { revenue: true, expenses: true, workers: true, clients: true, bookings: true, trends: false },
            };
            const saved = getLocalSettings<AnalyticsPrefs>(activeSalonId, 'analytics', defaults);
            setDefaultPeriod(saved.defaultPeriod);
            setAutoExport(saved.autoExport);
            setExportFormat(saved.exportFormat);
            setIncludeCharts(saved.includeCharts);
            setExportFrequency(saved.exportFrequency);
            setExportRecipients(saved.exportRecipients || user?.email || "");
            setWidgetStates(saved.widgetStates);
        }
    }, [activeSalonId]);

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        try {
            setIsLoading(true);
            if (activeSalonId) {
                saveLocalSettings<AnalyticsPrefs>(activeSalonId, 'analytics', {
                    defaultPeriod, autoExport, exportFormat, includeCharts,
                    exportFrequency, exportRecipients, widgetStates,
                });
            }
            showToast(t("common.success"), t("settings.analyticsPage.saved"), "success");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingsLayout
            title={t("settings.analyticsPage.title")}
            description={t("settings.analyticsPage.description")}
        >
            {/* Report Preferences */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.analyticsPage.reportPreferences")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.analyticsPage.reportPreferencesDesc")}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.analyticsPage.defaultPeriod")}</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "week", name: t("settings.analyticsPage.week") },
                                { id: "month", name: t("settings.analyticsPage.month") },
                                { id: "quarter", name: t("settings.analyticsPage.quarter") },
                                { id: "year", name: t("settings.analyticsPage.year") },
                            ].map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setDefaultPeriod(period.id)}
                                    disabled={!canModify}
                                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${defaultPeriod === period.id
                                        ? "border-color-primary bg-primary-light text-color-primary"
                                        : "border-gray-200 text-gray-600 hover:border-color-primary/30"
                                    } ${!canModify ? "cursor-not-allowed opacity-80" : ""}`}
                                >
                                    {period.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{t("settings.analyticsPage.includeCharts")}</p>
                            <p className="text-xs text-gray-500">{t("settings.analyticsPage.includeChartsDesc")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} disabled={!canModify} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Auto Export */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Download className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.analyticsPage.autoExport")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.analyticsPage.autoExportDesc")}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoExport} onChange={(e) => setAutoExport(e.target.checked)} disabled={!canModify} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {autoExport && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.notificationsPage.frequency")}</label>
                                <select value={exportFrequency} onChange={(e) => setExportFrequency(e.target.value)} disabled={!canModify}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                                    <option value="weekly">{t("settings.notificationsPage.weekly")}</option>
                                    <option value="monthly">{t("settings.notificationsPage.monthly")}</option>
                                    <option value="quarterly">{t("settings.analyticsPage.quarter")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.notificationsPage.format")}</label>
                                <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} disabled={!canModify}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.notificationsPage.recipients")}</label>
                            <input
                                type="text"
                                value={exportRecipients}
                                onChange={(e) => setExportRecipients(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                placeholder={t("settings.notificationsPage.recipientsPlaceholder")}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Dashboard Customization */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-[var(--color-primary)] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.analyticsPage.dashboardWidgets")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.analyticsPage.dashboardWidgetsDesc")}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {WIDGET_KEYS.map((key) => (
                        <label
                            key={key}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${widgetStates[key] ? "border-color-primary/30 bg-primary-light" : "border-gray-200"
                            } ${!canModify ? "cursor-not-allowed opacity-80" : ""}`}
                        >
                            <input
                                type="checkbox"
                                checked={widgetStates[key] || false}
                                onChange={(e) => setWidgetStates({ ...widgetStates, [key]: e.target.checked })}
                                disabled={!canModify}
                                className="w-4 h-4 text-color-primary rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">{widgetLabels[key]}</span>
                        </label>
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
