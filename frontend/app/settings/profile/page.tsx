"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, Camera, Globe } from "lucide-react";
import { useState } from "react";

export default function ProfileSettingsPage() {
    const [firstName, setFirstName] = useState("Admin");
    const [lastName, setLastName] = useState("User");
    const [email, setEmail] = useState("admin@workshopmanager.com");
    const [phone, setPhone] = useState("+33 6 12 34 56 78");
    const [language, setLanguage] = useState("fr");
    const [timezone, setTimezone] = useState("Europe/Paris");

    return (
        <SettingsLayout
            title="Profile Settings"
            description="Gérez vos informations personnelles et préférences de compte"
        >
            {/* Profile Photo */}
            <Card>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold">
                            AU
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Photo de profil</h3>
                        <p className="text-sm text-gray-500 mb-3">JPG, PNG ou GIF. 1MB max.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Changer la photo</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">Supprimer</Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Personal Information */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Regional Settings */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Paramètres régionaux</h3>
                        <p className="text-xs text-gray-500">Langue et fuseau horaire</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="md">Annuler</Button>
                <Button variant="primary" size="md">
                    <Save className="w-4 h-4" />
                    Sauvegarder les modifications
                </Button>
            </div>
        </SettingsLayout>
    );
}
