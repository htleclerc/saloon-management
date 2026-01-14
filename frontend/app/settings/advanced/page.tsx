"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Settings, Database, Code, AlertTriangle, Download, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AdvancedSettingsPage() {
    const [debugMode, setDebugMode] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    return (
        <SettingsLayout
            title="Advanced Settings"
            description="Paramètres avancés pour les développeurs et administrateurs"
        >
            {/* Warning Banner */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-yellow-800 text-sm">Zone sensible</p>
                    <p className="text-xs text-yellow-700">
                        Les paramètres de cette page peuvent affecter le fonctionnement de votre application. Modifiez-les avec précaution.
                    </p>
                </div>
            </div>

            {/* Developer Options */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Options développeur</h3>
                        <p className="text-xs text-gray-500">Fonctionnalités avancées pour le débogage</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Mode debug</p>
                            <p className="text-xs text-gray-500">Afficher les logs détaillés dans la console</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={debugMode}
                                onChange={(e) => setDebugMode(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Mode maintenance</p>
                            <p className="text-xs text-gray-500">Bloquer l'accès aux utilisateurs pendant les mises à jour</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={maintenanceMode}
                                onChange={(e) => setMaintenanceMode(e.target.checked)}
                                className="sr-only peer"
                            />
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
                        <h3 className="font-semibold text-gray-900">Base de données & Sauvegarde</h3>
                        <p className="text-xs text-gray-500">Gérez vos données et sauvegardes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Exporter les données</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Téléchargez une copie complète de vos données
                        </p>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                            Exporter (JSON)
                        </Button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Dernière sauvegarde</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            13 janvier 2026 à 08:00
                        </p>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                            Sauvegarder maintenant
                        </Button>
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
                            <h3 className="font-semibold text-gray-900">Cache & Performance</h3>
                            <p className="text-xs text-gray-500">Optimisez les performances de l'application</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="font-medium text-gray-900 text-sm">Cache applicatif</p>
                        <p className="text-xs text-gray-500">Taille actuelle: 24.5 MB</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                        Vider le cache
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-2 border-red-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-700">Zone de danger</h3>
                        <p className="text-xs text-red-600">Actions irréversibles</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium text-red-900 text-sm">Réinitialiser les données</p>
                            <p className="text-xs text-red-700">Supprimer toutes les données de test</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                            Réinitialiser
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium text-red-900 text-sm">Supprimer le compte</p>
                            <p className="text-xs text-red-700">Cette action est permanente et irréversible</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
