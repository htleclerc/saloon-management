"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plug, Check, ExternalLink, Calendar, CreditCard, MessageSquare, Cloud } from "lucide-react";

const integrations = [
    {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Synchronisez vos rendez-vous avec Google Calendar",
        icon: Calendar,
        color: "from-red-500 to-red-600",
        connected: true,
        account: "admin@workshopmanager.com",
    },
    {
        id: "stripe",
        name: "Stripe",
        description: "Acceptez les paiements en ligne",
        icon: CreditCard,
        color: "from-purple-500 to-purple-600",
        connected: true,
        account: "Workshop Pro Account",
    },
    {
        id: "whatsapp",
        name: "WhatsApp Business",
        description: "Envoyez des notifications par WhatsApp",
        icon: MessageSquare,
        color: "from-green-500 to-green-600",
        connected: false,
        account: null,
    },
    {
        id: "google-drive",
        name: "Google Drive",
        description: "Sauvegardez vos données sur Google Drive",
        icon: Cloud,
        color: "from-blue-500 to-blue-600",
        connected: false,
        account: null,
    },
];

export default function IntegrationsSettingsPage() {
    return (
        <SettingsLayout
            title="Integrations"
            description="Connectez des services tiers pour étendre les fonctionnalités"
        >
            {/* Connected Integrations */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Plug className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Intégrations disponibles</h3>
                        <p className="text-xs text-gray-500">Connectez vos outils préférés</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((integration) => {
                        const Icon = integration.icon;
                        return (
                            <div
                                key={integration.id}
                                className={`p-4 rounded-xl border-2 ${integration.connected
                                    ? "border-green-200 bg-green-50"
                                    : "border-gray-200 bg-white"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${integration.color} rounded-xl flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 text-sm">{integration.name}</h4>
                                                {integration.connected && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                        <Check className="w-3 h-3" /> Connecté
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{integration.description}</p>
                                        </div>
                                    </div>
                                </div>
                                {integration.connected ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600">{integration.account}</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="text-xs">Configurer</Button>
                                            <Button variant="danger" size="sm" className="text-xs">Déconnecter</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="success" size="sm" className="w-full">
                                        <Plug className="w-4 h-4" />
                                        Connecter
                                    </Button>
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
                        <h3 className="font-semibold text-gray-900 text-lg">Accès API</h3>
                        <p className="text-xs text-gray-500">Gérez vos clés API pour les intégrations personnalisées</p>
                    </div>
                    <Button variant="outline" size="sm">
                        Générer une clé
                    </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Production Key</p>
                            <p className="text-xs text-gray-500">Créée le 01/01/2026</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">Copier</Button>
                            <Button variant="danger" size="sm" className="text-xs">Révoquer</Button>
                        </div>
                    </div>
                    <code className="block p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono">
                        sk_live_••••••••••••••••••••••••••••
                    </code>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        <strong>Documentation API:</strong> Consultez notre
                        <a href="#" className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1">
                            documentation complète <ExternalLink className="w-3 h-3" />
                        </a>
                    </p>
                </div>
            </Card>
        </SettingsLayout>
    );
}
