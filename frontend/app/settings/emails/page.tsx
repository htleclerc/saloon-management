"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Mail, Edit3, Eye, Send, Calendar, UserCheck, CheckCircle } from "lucide-react";

const emailTemplates = [
    {
        id: "welcome",
        name: "Bienvenue client",
        description: "Envoyé à chaque nouveau client",
        lastEdited: "Il y a 2 jours",
        icon: UserCheck,
        color: "from-purple-500 to-purple-600",
    },
    {
        id: "appointment-reminder",
        name: "Rappel de rendez-vous",
        description: "Envoyé 24h avant le rendez-vous",
        lastEdited: "Il y a 1 semaine",
        icon: Calendar,
        color: "from-blue-500 to-blue-600",
    },
    {
        id: "service-complete",
        name: "Prestation terminée",
        description: "Envoyé après chaque prestation",
        lastEdited: "Il y a 3 jours",
        icon: CheckCircle,
        color: "from-green-500 to-green-600",
    },
    {
        id: "invoice",
        name: "Facture",
        description: "Envoyé avec chaque facture",
        lastEdited: "Il y a 1 mois",
        icon: Mail,
        color: "from-orange-500 to-orange-600",
    },
];

export default function EmailsSettingsPage() {
    return (
        <SettingsLayout
            title="Email Templates"
            description="Personnalisez vos modèles de communication"
        >
            {/* Sender Configuration */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Configuration de l'expéditeur</h3>
                        <p className="text-xs text-gray-500">Personnalisez les informations de l'expéditeur</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'expéditeur</label>
                        <input
                            type="text"
                            defaultValue="Premium Workshop"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de réponse</label>
                        <input
                            type="email"
                            defaultValue="contact@workshopmanager.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Email Templates */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Modèles d'email</h3>
                            <p className="text-xs text-gray-500">Personnalisez le contenu de vos emails automatiques</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        Créer un modèle
                    </Button>
                </div>

                <div className="space-y-3">
                    {emailTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <div
                                key={template.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                                        <p className="text-xs text-gray-500">{template.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">Modifié {template.lastEdited}</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Eye className="w-3 h-3" />
                                            Aperçu
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Edit3 className="w-3 h-3" />
                                            Modifier
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Email Preview */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Aperçu du modèle</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">De:</span>
                            <span>Premium Workshop &lt;contact@workshopmanager.com&gt;</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Objet:</span>
                            <span>Bienvenue chez Premium Workshop!</span>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="max-w-lg mx-auto">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">PW</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Bienvenue!</h2>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Bonjour <span className="font-semibold text-purple-600">{"{{client_name}}"}</span>,
                            </p>
                            <p className="text-gray-600 text-sm mb-4">
                                Nous sommes ravis de vous compter parmi nos clients. Votre compte a été créé avec succès.
                            </p>
                            <div className="text-center">
                                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                                    Prendre rendez-vous
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
