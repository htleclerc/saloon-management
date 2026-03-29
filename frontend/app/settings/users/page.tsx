"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Plus, MoreHorizontal, Mail, Shield, Crown, UserMinus, X, Loader2, Check, RotateCcw, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { workerService } from "@/lib/services/WorkerService";
import { salonService } from "@/lib/services/SalonService";
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
    specialty?: string;
    avatar: string;
    status: string;
}

interface PermissionRow {
    key: string;
    nameKey: string;
    admin: boolean;
    manager: boolean;
    worker: boolean;
}

const DEFAULT_PERMISSIONS: PermissionRow[] = [
    { key: "viewDashboard", nameKey: "settings.usersPage.permViewDashboard", admin: true, manager: true, worker: true },
    { key: "manageIncome", nameKey: "settings.usersPage.permManageIncome", admin: true, manager: true, worker: true },
    { key: "manageExpenses", nameKey: "settings.usersPage.permManageExpenses", admin: true, manager: true, worker: false },
    { key: "manageClients", nameKey: "settings.usersPage.permManageClients", admin: true, manager: true, worker: false },
    { key: "manageTeam", nameKey: "settings.usersPage.permManageTeam", admin: true, manager: false, worker: false },
    { key: "viewReports", nameKey: "settings.usersPage.permViewReports", admin: true, manager: true, worker: false },
    { key: "manageSettings", nameKey: "settings.usersPage.permManageSettings", admin: true, manager: false, worker: false },
];

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
    const [changingRoleId, setChangingRoleId] = useState<number | null>(null);

    // Role dropdown state
    const [openRoleDropdownId, setOpenRoleDropdownId] = useState<number | null>(null);
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    // Dropdown menu state (for remove action)
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Permissions state
    const [permissions, setPermissions] = useState<PermissionRow[]>(DEFAULT_PERMISSIONS);
    const [permissionsChanged, setPermissionsChanged] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);

    const isOwner = user?.role === 'owner' || user?.role === 'super_admin';

    const roleLabels: Record<string, string> = {
        owner: t("settings.usersPage.roleOwner"),
        admin: t("settings.usersPage.roleAdmin"),
        manager: t("settings.usersPage.roleManager"),
        worker: t("settings.usersPage.roleWorker"),
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setActiveDropdownId(null);
            }
            // Close role dropdown only if click is outside ALL role dropdown containers
            if (openRoleDropdownId !== null) {
                const roleContainer = document.querySelector(`[data-role-dropdown="${openRoleDropdownId}"]`);
                if (roleContainer && !roleContainer.contains(target)) {
                    setOpenRoleDropdownId(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openRoleDropdownId]);

    useEffect(() => {
        if (activeSalonId) {
            loadTeam();
            loadPermissions();
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

            const workerEntries: TeamMember[] = workers.map((w: SalonWorker) => {
                // Determine system role: "Manager" or "Worker" (employeeRole may contain a specialty like "barber")
                const rawRole = (w.employeeRole || "worker").toLowerCase();
                const systemRole = rawRole === "manager" ? "manager" : "worker";
                const specialty = rawRole !== "manager" && rawRole !== "worker" ? w.employeeRole : undefined;

                return {
                    id: w.id,
                    name: w.name,
                    email: w.email || "",
                    role: systemRole,
                    specialty,
                    avatar: getInitials(w.name),
                    status: w.status === "Active" ? "active" : "pending",
                };
            });

            setTeamMembers([ownerEntry, ...workerEntries]);
        } catch (error) {
            console.error("Failed to load team:", error);
            showToast(t("common.error"), t("settings.usersPage.loadError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPermissions = async () => {
        try {
            const settings = await salonService.getSettings(Number(activeSalonId));
            if (settings?.customPermissions) {
                const saved = settings.customPermissions as Record<string, Record<string, boolean>>;
                setPermissions(DEFAULT_PERMISSIONS.map(p => ({
                    ...p,
                    manager: saved[p.key]?.manager ?? p.manager,
                    worker: saved[p.key]?.worker ?? p.worker,
                })));
            }
        } catch {
            // Use defaults silently
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
        setOpenRoleDropdownId(null);

        if (member.role === newRole) return;

        try {
            setChangingRoleId(member.id);

            // Use the API route that syncs both workers AND user_salons
            const res = await fetch('/api/team/change-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: member.id,
                    salonId: Number(activeSalonId),
                    newRole: newRole.charAt(0).toUpperCase() + newRole.slice(1),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(t("common.error"), data.error || t("errors.generic"), "error");
                return;
            }

            showToast(t("common.success"), t("settings.usersPage.roleChanged"), "success");
            loadTeam();
        } catch (error) {
            console.error("Failed to change role:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setChangingRoleId(null);
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

    const togglePermission = (permKey: string, role: 'manager' | 'worker') => {
        if (!isOwner || !canModify) return;
        // Admin column is always locked (owner always has full access)
        setPermissions(prev => prev.map(p =>
            p.key === permKey ? { ...p, [role]: !p[role] } : p
        ));
        setPermissionsChanged(true);
    };

    const resetPermissions = () => {
        setPermissions(DEFAULT_PERMISSIONS);
        setPermissionsChanged(true);
    };

    const savePermissions = async () => {
        if (!activeSalonId) return;
        try {
            setSavingPermissions(true);
            const customPerms: Record<string, Record<string, boolean>> = {};
            permissions.forEach(p => {
                customPerms[p.key] = { manager: p.manager, worker: p.worker };
            });

            await salonService.updateSettings(Number(activeSalonId), {
                customPermissions: customPerms,
            });

            showToast(t("common.success"), t("settings.usersPage.permissionsSaved"), "success");
            setPermissionsChanged(false);
        } catch (error) {
            console.error("Failed to save permissions:", error);
            showToast(t("common.error"), t("errors.generic"), "error");
        } finally {
            setSavingPermissions(false);
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
                                            {member.specialty && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 capitalize">
                                                    {member.specialty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Role selector — inline dropdown for non-owners */}
                                    {member.role === "owner" ? (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors.owner}`}>
                                            {roleLabels.owner}
                                        </span>
                                    ) : isOwner && canModify ? (
                                        <div className="relative" data-role-dropdown={member.id}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenRoleDropdownId(openRoleDropdownId === member.id ? null : member.id); }}
                                                disabled={changingRoleId === member.id}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer hover:shadow-sm ${roleColors[member.role] || roleColors.worker} ${changingRoleId === member.id ? 'opacity-50' : ''}`}
                                            >
                                                {changingRoleId === member.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : null}
                                                {roleLabels[member.role] || member.role}
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                            {openRoleDropdownId === member.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
                                                    <button
                                                        onClick={() => handleChangeRole(member, "manager")}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${member.role === 'manager' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                        {roleLabels.manager}
                                                        {member.role === 'manager' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleChangeRole(member, "worker")}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${member.role === 'worker' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                        {roleLabels.worker}
                                                        {member.role === 'worker' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || roleColors.worker}`}>
                                            {roleLabels[member.role] || member.role}
                                        </span>
                                    )}

                                    <span className={`text-xs hidden sm:inline ${member.status === "pending" ? "text-orange-600" : "text-gray-500"}`}>
                                        {member.status === "active" ? t("settings.usersPage.online") : t("settings.usersPage.pendingInvitation", { count: 1 })}
                                    </span>

                                    {/* Remove action — only for non-owners */}
                                    {member.role !== "owner" && isOwner && (
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

            {/* Roles & Permissions — Editable by Owner */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.usersPage.rolesPermissions")}</h3>
                            <p className="text-xs text-gray-500">
                                {isOwner ? t("settings.usersPage.rolesPermissionsEditDesc") : t("settings.usersPage.rolesPermissionsDesc")}
                            </p>
                        </div>
                    </div>
                    {isOwner && permissionsChanged && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={resetPermissions}>
                                <RotateCcw className="w-3.5 h-3.5" />
                                {t("settings.usersPage.resetDefaults")}
                            </Button>
                            <Button variant="primary" size="sm" onClick={savePermissions} disabled={savingPermissions}>
                                {savingPermissions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                {t("common.save")}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.usersPage.permission")}</th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-28">
                                    <span className="flex items-center justify-center gap-1">
                                        <Crown className="w-3 h-3 text-yellow-500" />
                                        {t("settings.usersPage.roleAdmin")}
                                    </span>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-28">
                                    <span className="flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        {t("settings.usersPage.roleManager")}
                                    </span>
                                </th>
                                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase w-28">
                                    <span className="flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        {t("settings.usersPage.roleWorker")}
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((perm) => (
                                <tr key={perm.key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-2 font-medium text-gray-900">{t(perm.nameKey)}</td>
                                    {/* Admin column — always locked (full access) */}
                                    <td className="text-center py-3 px-2">
                                        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
                                            ✓
                                        </span>
                                    </td>
                                    {/* Manager column — editable by owner */}
                                    <td className="text-center py-3 px-2">
                                        {isOwner && canModify ? (
                                            <button
                                                onClick={() => togglePermission(perm.key, 'manager')}
                                                className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs transition-all hover:scale-110 ${
                                                    perm.manager ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                                }`}
                                            >
                                                {perm.manager ? "✓" : "×"}
                                            </button>
                                        ) : (
                                            <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${
                                                perm.manager ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                            }`}>
                                                {perm.manager ? "✓" : "×"}
                                            </span>
                                        )}
                                    </td>
                                    {/* Worker column — editable by owner */}
                                    <td className="text-center py-3 px-2">
                                        {isOwner && canModify ? (
                                            <button
                                                onClick={() => togglePermission(perm.key, 'worker')}
                                                className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs transition-all hover:scale-110 ${
                                                    perm.worker ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                                }`}
                                            >
                                                {perm.worker ? "✓" : "×"}
                                            </button>
                                        ) : (
                                            <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${
                                                perm.worker ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                            }`}>
                                                {perm.worker ? "✓" : "×"}
                                            </span>
                                        )}
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
