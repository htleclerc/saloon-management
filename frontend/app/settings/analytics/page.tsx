"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, BarChart3, FileText, Download, Calendar } from "lucide-react";
import { useState } from "react";

export default function AnalyticsSettingsPage() {
    const [defaultPeriod, setDefaultPeriod] = useState("month");
    const [autoExport, setAutoExport] = useState(false);
    const [exportFormat, setExportFormat] = useState("pdf");
    const [includeCharts, setIncludeCharts] = useState(true);

    return (
        <SettingsLayout
            title="Business & Analytics"
            description="Configurez vos préférences de rapports et d'analyse"
        >
            {/* Report Preferences */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Préférences des rapports</h3>
                        <p className="text-xs text-gray-500">Personnalisez l'affichage de vos analyses</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Période par défaut</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "week", name: "Semaine" },
                                { id: "month", name: "Mois" },
                                { id: "quarter", name: "Trimestre" },
                                { id: "year", name: "Année" },
                            ].map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setDefaultPeriod(period.id)}
                                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${defaultPeriod === period.id
                                            ? "border-purple-500 bg-purple-50 text-purple-700"
                                            : "border-gray-200 text-gray-600 hover:border-purple-300"
                                        }`}
                                >
                                    {period.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Inclure les graphiques</p>
                            <p className="text-xs text-gray-500">Afficher les visualisations dans les rapports exportés</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeCharts}
                                onChange={(e) => setIncludeCharts(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
                            <h3 className="font-semibold text-gray-900">Export automatique</h3>
                            <p className="text-xs text-gray-500">Recevez vos rapports automatiquement</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoExport}
                            onChange={(e) => setAutoExport(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                {autoExport && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                    <option>Hebdomadaire</option>
                                    <option>Mensuel</option>
                                    <option>Trimestriel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
                            <input
                                type="text"
                                defaultValue="admin@workshopmanager.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="email1@exemple.com, email2@exemple.com"
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Dashboard Customization */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Widgets du tableau de bord</h3>
                        <p className="text-xs text-gray-500">Choisissez les éléments à afficher</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { name: "Revenus du jour", enabled: true },
                        { name: "Dépenses du mois", enabled: true },
                        { name: "Top travailleurs", enabled: true },
                        { name: "Activité récente", enabled: true },
                        { name: "Graphique mensuel", enabled: true },
                        { name: "Répartition services", enabled: false },
                    ].map((widget, idx) => (
                        <label
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${widget.enabled ? "border-purple-200 bg-purple-50" : "border-gray-200"
                                }`}
                        >
                            <input
                                type="checkbox"
                                defaultChecked={widget.enabled}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{widget.name}</span>
                        </label>
                    ))}
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md">Annuler</Button>
                <Button variant="primary" size="md">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                </Button>
            </div>
        </SettingsLayout>
    );
}
