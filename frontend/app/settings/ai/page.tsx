"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAI } from "@/context/AIProvider";
import { Sparkles, Zap, Brain, DollarSign, Settings as SettingsIcon, AlertCircle } from "lucide-react";

export default function AISettingsPage() {
    const { config, updateConfig, isAvailable, stats } = useAI();

    const toggleFeature = (feature: keyof typeof config.features) => {
        updateConfig({
            features: {
                ...config.features,
                [feature]: !config.features[feature]
            }
        });
    };

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Intelligence Artificielle</h1>
                <p className="text-gray-600 mt-2">Configurez les fonctionnalités IA pour améliorer votre productivité</p>
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Status Card */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-color-primary" />
                                Assistant IA
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {isAvailable
                                    ? "🟢 Fonctionnel - Toutes les fonctionnalités sont disponibles"
                                    : "🔴 Désactivé - L'application fonctionne en mode manuel"}
                            </p>
                        </div>

                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${config.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                            }`}>
                            {config.enabled ? "Activé" : "Désactivé"}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => updateConfig({ enabled: e.target.checked })}
                                className="w-5 h-5 text-color-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Activer l'Intelligence Artificielle</span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Permet d'utiliser des fonctionnalités intelligentes pour automatiser certaines tâches
                                </p>
                            </div>
                        </label>
                    </div>

                    {config.enabled && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provider IA
                            </label>
                            <select
                                value={config.provider}
                                onChange={(e) => updateConfig({ provider: e.target.value as any })}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="gemini">Google Gemini (Rapide, économique)</option>
                                <option value="gpt-4">OpenAI GPT-4 (Précis, plus cher)</option>
                                <option value="none">Aucun (Désactivé)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Chaque provider a ses avantages. Gemini est recommandé pour un usage quotidien.
                            </p>
                        </div>
                    )}
                </Card>

                {/* Features Card */}
                {config.enabled && (
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Fonctionnalités
                        </h3>

                        <div className="space-y-4">
                            {/* Command Assistant */}
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.features.commandAssistant}
                                    onChange={() => toggleFeature('commandAssistant')}
                                    className="mt-1 w-5 h-5 text-color-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">Assistant de commande</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary-light text-color-primary rounded-full">
                                            Cmd+K
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Créez des réservations, consultez des statistiques en langage naturel
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Exemple: "Créer un rdv pour Sophie demain à 14h avec Orphelia"
                                    </p>
                                </div>
                            </label>

                            {/* Smart Suggestions */}
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.features.suggestions}
                                    onChange={() => toggleFeature('suggestions')}
                                    className="mt-1 w-5 h-5 text-color-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900">Suggestions intelligentes</span>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Détection automatique de conflits, recommandations de prix
                                    </p>
                                </div>
                            </label>

                            {/* Auto-Complete */}
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.features.autoComplete}
                                    onChange={() => toggleFeature('autoComplete')}
                                    className="mt-1 w-5 h-5 text-color-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">Auto-complétion</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                                            ⚠️ Coûteux
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Suggestions de clients, services pendant la saisie
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        Cette fonctionnalité peut augmenter significativement les coûts
                                    </p>
                                </div>
                            </label>

                            {/* Analytics */}
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.features.analytics}
                                    onChange={() => toggleFeature('analytics')}
                                    className="mt-1 w-5 h-5 text-color-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900">Insights & Analytics</span>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Analyses prédictives, recommandations basées sur l'historique
                                    </p>
                                </div>
                            </label>
                        </div>
                    </Card>
                )}

                {/* Stats Card */}
                {config.enabled && (
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            Statistiques d'Utilisation
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                    <Zap className="w-4 h-4" />
                                    Requêtes ce mois
                                </div>
                                <p className="text-2xl font-bold text-blue-900 mt-2">{stats.requests}</p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 font-semibold">
                                    <DollarSign className="w-4 h-4" />
                                    Coût estimé
                                </div>
                                <p className="text-2xl font-bold text-green-900 mt-2">
                                    ${stats.cost.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                                if (confirm('Réinitialiser les statistiques ?')) {
                                    localStorage.setItem('saloon-ai-stats', JSON.stringify({ requests: 0, cost: 0 }));
                                    window.location.reload();
                                }
                            }}
                        >
                            Réinitialiser les statistiques
                        </Button>
                    </Card>
                )}

                {/* Info Card */}
                <Card>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">À propos de l'IA</h4>
                            <p className="text-sm text-gray-600 mt-2">
                                L'intelligence artificielle est une fonctionnalité <strong>optionnelle</strong>.
                                L'application fonctionne parfaitement sans l'IA activée.
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                En cas d'indisponibilité du service IA, l'application bascule automatiquement
                                sur les fonctionnalités manuelles classiques.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
