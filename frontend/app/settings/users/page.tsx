"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Plus, MoreHorizontal, Mail, Shield, User, Crown, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const teamMembers = [
    { id: 1, name: "Admin User", email: "admin@workshopmanager.com", role: "owner", avatar: "AU", status: "active", lastActive: "En ligne" },
    { id: 2, name: "Marie Dupont", email: "marie@workshopmanager.com", role: "admin", avatar: "MD", status: "active", lastActive: "Il y a 2h" },
    { id: 3, name: "Jean Martin", email: "jean@workshopmanager.com", role: "manager", avatar: "JM", status: "active", lastActive: "Il y a 1 jour" },
    { id: 4, name: "Sophie Laurent", email: "sophie@workshopmanager.com", role: "worker", avatar: "SL", status: "pending", lastActive: "Invitation en attente" },
];

const roleColors: Record<string, string> = {
    owner: "bg-purple-100 text-purple-700",
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    worker: "bg-green-100 text-green-700",
};

const roleLabels: Record<string, string> = {
    owner: "Propriétaire",
    admin: "Administrateur",
    manager: "Manager",
    worker: "Travailleur",
};

export default function UsersSettingsPage() {
    const { canModify } = useAuth();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("worker");

    return (
        <SettingsLayout
            title="User Management"
            description="Gérez les membres de votre équipe et leurs permissions"
        >
            {/* Team Members */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Membres de l'équipe</h3>
                        <p className="text-xs text-gray-500">{teamMembers.length} membres • {teamMembers.filter(m => m.status === "pending").length} invitation en attente</p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                            <Plus className="w-4 h-4" />
                            Inviter
                        </Button>
                    </ReadOnlyGuard>
                </div>

                <div className="space-y-3">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className={`flex items-center justify-between p-4 rounded-xl ${member.status === "pending" ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${member.role === "owner" ? "bg-gradient-to-br from-purple-500 to-purple-700" :
                                    member.role === "admin" ? "bg-gradient-to-br from-red-500 to-red-600" :
                                        member.role === "manager" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                                            "bg-gradient-to-br from-green-500 to-green-600"
                                    }`}>
                                    {member.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                                        {member.role === "owner" && <Crown className="w-4 h-4 text-yellow-500" />}
                                    </div>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                                    {roleLabels[member.role]}
                                </span>
                                <span className={`text-xs ${member.status === "pending" ? "text-orange-600" : "text-gray-500"}`}>
                                    {member.lastActive}
                                </span>
                                {member.role !== "owner" && (
                                    <ReadOnlyGuard>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </ReadOnlyGuard>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Invite Modal */}
            {showInviteModal && (
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Inviter un nouveau membre</h3>
                            <p className="text-xs text-gray-500">Envoyez une invitation par email</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@exemple.com"
                                readOnly={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                disabled={!canModify}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="admin">Administrateur</option>
                                <option value="manager">Manager</option>
                                <option value="worker">Travailleur</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Annuler</Button>
                        <ReadOnlyGuard>
                            <Button variant="primary" size="sm">
                                <Mail className="w-4 h-4" />
                                Envoyer l'invitation
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </Card>
            )}

            {/* Roles & Permissions */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Rôles et permissions</h3>
                        <p className="text-xs text-gray-500">Définissez les accès pour chaque rôle</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Permission</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">Admin</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">Manager</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">Worker</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: "Voir les revenus", admin: true, manager: true, worker: true },
                                { name: "Ajouter des revenus", admin: true, manager: true, worker: true },
                                { name: "Voir les dépenses", admin: true, manager: true, worker: false },
                                { name: "Ajouter des dépenses", admin: true, manager: true, worker: false },
                                { name: "Gérer les travailleurs", admin: true, manager: false, worker: false },
                                { name: "Voir les rapports", admin: true, manager: true, worker: false },
                                { name: "Paramètres entreprise", admin: true, manager: false, worker: false },
                            ].map((perm, idx) => (
                                <tr key={idx} className="border-b border-gray-50">
                                    <td className="py-3 px-2 font-medium text-gray-900">{perm.name}</td>
                                    <td className="text-center py-3 px-2">
                                        <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full ${perm.admin ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                            {perm.admin ? "✓" : "×"}
                                        </span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full ${perm.manager ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                            {perm.manager ? "✓" : "×"}
                                        </span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full ${perm.worker ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                            {perm.worker ? "✓" : "×"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </SettingsLayout>
    );
}
