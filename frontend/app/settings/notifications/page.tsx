"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Save, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const notificationCategories = [
    {
        id: "revenue",
        name: "Revenus",
        description: "Notifications sur les nouvelles prestations",
        email: true,
        push: true,
        sms: false,
    },
    {
        id: "expense",
        name: "Dépenses",
        description: "Alertes sur les nouvelles dépenses",
        email: true,
        push: false,
        sms: false,
    },
    {
        id: "validation",
        name: "Validation requise",
        description: "Quand une action nécessite votre approbation",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "client",
        name: "Clients",
        description: "Nouveaux clients et rendez-vous",
        email: true,
        push: true,
        sms: false,
    },
    {
        id: "worker",
        name: "Travailleurs",
        description: "Activité et performance des travailleurs",
        email: false,
        push: true,
        sms: false,
    },
    {
        id: "report",
        name: "Rapports",
        description: "Rapports hebdomadaires et mensuels",
        email: true,
        push: false,
        sms: false,
    },
];

export default function NotificationsSettingsPage() {
    const { canModify } = useAuth();
    const [notifications, setNotifications] = useState(notificationCategories);
    const [digestFrequency, setDigestFrequency] = useState("daily");
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
    const [quietHoursStart, setQuietHoursStart] = useState("22:00");
    const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

    const toggleNotification = (categoryId: string, type: "email" | "push" | "sms") => {
        if (!canModify) return;
        setNotifications(notifications.map(n =>
            n.id === categoryId ? { ...n, [type]: !n[type] } : n
        ));
    };

    return (
        <SettingsLayout
            title="Notification Settings"
            description="Gérez vos préférences de notifications et alertes"
        >
            {/* Notification Channels */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Canaux de notification</h3>
                        <p className="text-xs text-gray-500">Choisissez comment recevoir chaque type de notification</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </div>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1">
                                        <Smartphone className="w-4 h-4" />
                                        <span>Push</span>
                                    </div>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-20">
                                    <div className="flex flex-col items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>SMS</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((category) => (
                                <tr key={category.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2">
                                        <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                                        <p className="text-xs text-gray-500">{category.description}</p>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={category.email}
                                                onChange={() => toggleNotification(category.id, "email")}
                                                disabled={!canModify}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={category.push}
                                                onChange={() => toggleNotification(category.id, "push")}
                                                disabled={!canModify}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={category.sms}
                                                onChange={() => toggleNotification(category.id, "sms")}
                                                disabled={!canModify}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Email Digest */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Résumé par email</h3>
                <p className="text-sm text-gray-500 mb-4">Recevez un résumé consolidé de vos notifications</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "off", name: "Désactivé" },
                        { id: "daily", name: "Quotidien" },
                        { id: "weekly", name: "Hebdomadaire" },
                        { id: "monthly", name: "Mensuel" },
                    ].map((freq) => (
                        <button
                            key={freq.id}
                            onClick={() => setDigestFrequency(freq.id)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${digestFrequency === freq.id
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 text-gray-600 hover:border-purple-300"
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
                        <h3 className="font-semibold text-gray-900 text-lg">Heures calmes</h3>
                        <p className="text-sm text-gray-500">Suspendre les notifications pendant certaines heures</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={quietHoursEnabled}
                            onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                            disabled={!canModify}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                {quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Début</label>
                            <input
                                type="time"
                                value={quietHoursStart}
                                onChange={(e) => setQuietHoursStart(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fin</label>
                            <input
                                type="time"
                                value={quietHoursEnd}
                                onChange={(e) => setQuietHoursEnd(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md">Annuler</Button>
                <ReadOnlyGuard>
                    <Button variant="primary" size="md">
                        <Save className="w-4 h-4" />
                        Sauvegarder
                    </Button>
                </ReadOnlyGuard>
            </div>
        </SettingsLayout>
    );
}
