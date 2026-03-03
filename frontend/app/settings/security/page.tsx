"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Save, Lock, Shield, Smartphone, Monitor, MapPin, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const activeSessions = [
    { id: 1, device: "Chrome on Windows", location: "Paris, France", ip: "192.168.1.xxx", lastActive: "Active now", current: true },
    { id: 2, device: "Safari on iPhone", location: "Paris, France", ip: "192.168.1.xxx", lastActive: "2 hours ago", current: false },
    { id: 3, device: "Firefox on MacOS", location: "Lyon, France", ip: "176.xxx.xxx.xxx", lastActive: "3 days ago", current: false },
];

export default function SecuritySettingsPage() {
    const { canModify } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <SettingsLayout
            title="Security Settings"
            description="Gérez la sécurité de votre compte et vos sessions actives"
        >
            {/* Change Password */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Changer le mot de passe</h3>
                        <p className="text-xs text-gray-500">Mettez à jour votre mot de passe régulièrement</p>
                    </div>
                </div>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm pr-10"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères, incluant un chiffre et un caractère spécial</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="primary" size="md">
                            <Lock className="w-4 h-4" />
                            Mettre à jour le mot de passe
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
                            <h3 className="font-semibold text-gray-900">Authentification à deux facteurs</h3>
                            <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            disabled={!canModify}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-800 mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">2FA activée</span>
                        </div>
                        <p className="text-sm text-green-700">
                            Votre compte est protégé par l'authentification à deux facteurs via Google Authenticator.
                        </p>
                        <ReadOnlyGuard>
                            <Button variant="outline" size="sm" className="mt-3">
                                Reconfigurer 2FA
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
                            <h3 className="font-semibold text-gray-900">Sessions actives</h3>
                            <p className="text-xs text-gray-500">Appareils connectés à votre compte</p>
                        </div>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            Déconnecter tout
                        </Button>
                    </ReadOnlyGuard>
                </div>
                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-3 rounded-xl ${session.current ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
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
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                                Session actuelle
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
