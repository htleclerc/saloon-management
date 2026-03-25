"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Plus, MoreHorizontal, Mail, Shield, Crown, UserMinus, ArrowUpDown, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { workerService } from "@/lib/services/WorkerService";
import type { SalonWorker } from "@/types";

function getInitials(name: string): string {
    return name.split(" ").map(p => p.charAt(0)).join("").toUpperCase().slice(0, 2) || "??";
}

const roleColors: Record<string, string> = {
    owner: "bg-primary-light text-color-primary",
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    worker: "bg-green-100 text-green-700",
};

const roleGradients: Record<string, string> = {
    owner: "bg-gradient-to-br from-primary to-[var(--color-primary)]",
    admin: "bg-gradient-to-br from-red-500 to-red-600",
    manager: "bg-gradient-to-br from-blue-500 to-blue-600",
    worker: "bg-gradient-to-br from-green-500 to-green-600",
};

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    status: string;
}

export default function UsersSettingsPage() {
    const { canModify, activeSalonId, user } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("worker");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteLoading, setInviteLoading] = useState(false);

    // Dropdown menu state
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const roleLabels: Record<string, string> = {
        owner: t("settings.usersPage.roleOwner"),
        admin: t("settings.usersPage.roleAdmin"),
        manager: t("settings.usersPage.roleManager"),
        worker: t("settings.usersPage.roleWorker"),
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeSalonId) {
            loadTeam();
        }
    }, [activeSalonId]);

    const loadTeam = async () => {
        try {
            setIsLoading(true);
            const workers = await workerService.getAll(Number(activeSalonId));

            const ownerEntry: TeamMember = {
                id: 0,
                name: user?.name || "Owner",
                email: user?.email || "",
                role: "owner",
                avatar: getInitials(user?.name || "Owner"),
                status: "active",
            };

            const workerEntries: TeamMember[] = workers.map((w: SalonWorker) => ({
                id: w.id,
                name: w.name,
                email: w.email || "",
                role: (w.employeeRole || "worker").toLowerCase(),
                avatar: getInitials(w.name),
                status: w.status === "Active" ? "active" : "pending",
            }));

            setTeamMembers([ownerEntry, ...workerEntries]);
        } catch (error) {
            console.error("Failed to load team:", error);
            showToast(t("common.error"), t("settings.usersPage.loadError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const pendingCount = teamMembers.filter(m => m.status === "pending").length;

    const handleInvite = async () => {
        if (handleReadOnlyClick()) return;
        if (!inviteEmail) {
            showToast(t("common.error"), t("settings.usersPage.emailRequired"), "error");
            return;
        }

        if (!activeSalonId) return;

        setInviteLoading(true);
        try {
            const emailParts = inviteEmail.split('@')[0].split('.');
            const firstName = emailParts[0] || 'Team';
            const lastName = emailParts.slice(1).join(' ') || 'Member';

            const res = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    firstName,
                    lastName,
                    salonId: parseInt(activeSalonId),
                    role: inviteRole === 'manager' ? 'Manager' : 'Worker',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(t("common.error"), data.error || t("errors.generic"), "error");
                return;
            }

            showToast(t("common.success"), t("settings.usersPage.inviteSent"), "success");
            setInviteEmail("");
            setInviteRole("worker");
            setShowInviteModal(false);
            loadTeam();
        } catch (error) {
            console.error('Invite failed:', error);
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleChangeRole = async (member: TeamMember, newRole: string) => {
        if (handleReadOnlyClick()) return;
        setActiveDropdownId(null);

        try {
            await workerService.update(member.id, {
                employeeRole: newRole.charAt(0).toUpperCase() + newRole.slice(1),
            });
            showToast(t("common.success"), t("settings.usersPage.roleChanged"), "success");
            loadTeam();
        } catch (error) {
            console.error("Failed to change role:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        }
    };

    const handleRemoveMember = async (member: TeamMember) => {
        setActiveDropdownId(null);

        const confirmed = await confirm({
            title: t("settings.usersPage.removeMember"),
            message: t("settings.usersPage.removeMemberConfirm", { name: member.name }),
            type: "error",
        });

        if (!confirmed) return;

        try {
            await workerService.setActive(member.id, false);
            showToast(t("common.success"), t("settings.usersPage.memberRemoved"), "success");
            loadTeam();
        } catch (error) {
            console.error("Failed to remove member:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        }
    };

    return (
        <SettingsLayout
            title={t("settings.usersPage.title")}
            description={t("settings.usersPage.description")}
        >
            {/* Team Members */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("settings.usersPage.teamMembers")}</h3>
                        <p className="text-xs text-gray-500">
                            {teamMembers.length} {t("settings.usersPage.teamMembers").toLowerCase()} &bull; {t("settings.usersPage.pendingInvitation", { count: pendingCount })}
                        </p>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                            <Plus className="w-4 h-4" />
                            {t("settings.usersPage.invite")}
                        </Button>
                    </ReadOnlyGuard>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${member.status === "pending" ? "bg-orange-50 border border-orange-200" : "bg-gray-50 hover:bg-gray-100"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${roleGradients[member.role] || roleGradients.worker}`}>
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
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || roleColors.worker}`}>
                                        {roleLabels[member.role] || member.role}
                                    </span>
                                    <span className={`text-xs hidden sm:inline ${member.status === "pending" ? "text-orange-600" : "text-gray-500"}`}>
                                        {member.status === "active" ? t("settings.usersPage.online") : t("settings.usersPage.pendingInvitation", { count: 1 })}
                                    </span>
                                    {member.role !== "owner" && (
                                        <div className="relative" ref={activeDropdownId === member.id ? dropdownRef : undefined}>
                                            <ReadOnlyGuard>
                                                <button
                                                    onClick={() => setActiveDropdownId(activeDropdownId === member.id ? null : member.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </ReadOnlyGuard>

                                            {activeDropdownId === member.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px] z-50">
                                                    {/* Change role options */}
                                                    {member.role !== "manager" && (
                                                        <button
                                                            onClick={() => handleChangeRole(member, "manager")}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <ArrowUpDown className="w-4 h-4 text-blue-500" />
                                                            {t("settings.usersPage.changeToManager")}
                                                        </button>
                                                    )}
                                                    {member.role !== "worker" && (
                                                        <button
                                                            onClick={() => handleChangeRole(member, "worker")}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <ArrowUpDown className="w-4 h-4 text-green-500" />
                                                            {t("settings.usersPage.changeToWorker")}
                                                        </button>
                                                    )}
                                                    {/* Divider */}
                                                    <div className="border-t border-gray-100 my-1" />
                                                    {/* Remove */}
                                                    <button
                                                        onClick={() => handleRemoveMember(member)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                        {t("settings.usersPage.removeMember")}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Invite Modal Overlay */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t("settings.usersPage.inviteNew")}</h3>
                                    <p className="text-xs text-gray-500">{t("settings.usersPage.inviteDesc")}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.email")}</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder={t("settings.usersPage.emailPlaceholder")}
                                    autoFocus
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !inviteLoading) handleInvite(); }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.usersPage.role")}</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="manager">{t("settings.usersPage.roleManager")}</option>
                                    <option value="worker">{t("settings.usersPage.roleWorker")}</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>
                                {inviteLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4" />
                                )}
                                {inviteLoading ? t("common.loading") : t("settings.usersPage.sendInvitation")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles & Permissions */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.usersPage.rolesPermissions")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.usersPage.rolesPermissionsDesc")}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.usersPage.permission")}</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">{t("settings.usersPage.roleAdmin")}</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">{t("settings.usersPage.roleManager")}</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-24">{t("settings.usersPage.roleWorker")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: t("settings.usersPage.permViewDashboard"), admin: true, manager: true, worker: true },
                                { name: t("settings.usersPage.permManageIncome"), admin: true, manager: true, worker: true },
                                { name: t("settings.usersPage.permManageExpenses"), admin: true, manager: true, worker: false },
                                { name: t("settings.usersPage.permManageClients"), admin: true, manager: true, worker: false },
                                { name: t("settings.usersPage.permManageTeam"), admin: true, manager: false, worker: false },
                                { name: t("settings.usersPage.permViewReports"), admin: true, manager: true, worker: false },
                                { name: t("settings.usersPage.permManageSettings"), admin: true, manager: false, worker: false },
                            ].map((perm, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-2 font-medium text-gray-900">{perm.name}</td>
                                    {(["admin", "manager", "worker"] as const).map(role => (
                                        <td key={role} className="text-center py-3 px-2">
                                            <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full text-xs ${perm[role] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                                {perm[role] ? "\u2713" : "\u00d7"}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </SettingsLayout>
    );
}
