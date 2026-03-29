"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { Gift, Users, CheckCircle, Clock, Trophy, Copy, Check, Settings2 } from "lucide-react";
import { referralService } from "@/lib/services";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import FeatureGated from "@/components/ui/FeatureGated";
import type { ReferralSettings, ReferralWithRelations, ReferralStats } from "@/types";

export default function ReferralsPage() {
    const { isFeatureAvailable } = useFeatureFlag();

    if (!isFeatureAvailable('referral_system')) {
        return <FeatureGated featureId="referral_system" />;
    }

    return <ReferralsPageContent />;
}

function ReferralsPageContent() {
    const { t } = useTranslation();
    const { symbol } = useCurrency();
    const { canModify, activeSalonId } = useAuth();

    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [referrals, setReferrals] = useState<ReferralWithRelations[]>([]);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'settings' | 'dashboard'>('settings');

    // Settings form state
    const [isActive, setIsActive] = useState(false);
    const [referrerRewardType, setReferrerRewardType] = useState<'percentage' | 'fixed'>('percentage');
    const [referrerRewardValue, setReferrerRewardValue] = useState(10);
    const [referredRewardType, setReferredRewardType] = useState<'percentage' | 'fixed'>('percentage');
    const [referredRewardValue, setReferredRewardValue] = useState(10);
    const [maxReferralsPerClient, setMaxReferralsPerClient] = useState<string>('');
    const [rewardExpiryDays, setRewardExpiryDays] = useState(90);

    const salonId = activeSalonId ? Number(activeSalonId) : 0;

    const loadData = async () => {
        if (!salonId) return;
        setLoading(true);
        try {
            const s = await referralService.getSettings(salonId).catch(() => null);
            setSettings(s);

            if (s) {
                setIsActive(s.isActive);
                setReferrerRewardType(s.referrerRewardType);
                setReferrerRewardValue(s.referrerRewardValue);
                setReferredRewardType(s.referredRewardType);
                setReferredRewardValue(s.referredRewardValue);
                setMaxReferralsPerClient(s.maxReferralsPerClient?.toString() || '');
                setRewardExpiryDays(s.rewardExpiryDays);
            }

            // These may fail if migration hasn't been applied yet
            try {
                const [refs, st] = await Promise.all([
                    referralService.getReferralsBySalon(salonId),
                    referralService.getReferralStats(salonId),
                ]);
                setReferrals(refs);
                setStats(st);
            } catch {
                // Tables not yet created — use empty defaults
                setReferrals([]);
                setStats({ totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0, totalRewardsGiven: 0, topReferrers: [] });
            }
        } catch (e) {
            console.error('Failed to load referral data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [salonId]);

    const handleSaveSettings = async () => {
        if (!salonId) return;
        setSaving(true);
        try {
            await referralService.updateSettings(salonId, {
                isActive,
                referrerRewardType,
                referrerRewardValue,
                referredRewardType,
                referredRewardValue,
                maxReferralsPerClient: maxReferralsPerClient ? parseInt(maxReferralsPerClient) : null,
                rewardExpiryDays,
            });
            await loadData();
        } catch (e) {
            console.error('Failed to save settings:', e);
        } finally {
            setSaving(false);
        }
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        expired: 'bg-gray-100 text-gray-500',
        cancelled: 'bg-red-100 text-red-600',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("configuration.referrals.title")}</h1>
                    <p className="text-gray-500 text-sm">{t("configuration.referrals.subtitle")}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {isActive ? t("configuration.referrals.enabled") : t("configuration.referrals.disabled")}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'settings' ? 'bg-primary-light text-color-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Settings2 className="w-4 h-4" />
                    {t("configuration.referrals.settingsTab")}
                </button>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary-light text-color-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Trophy className="w-4 h-4" />
                    {t("configuration.referrals.dashboard")}
                </button>
            </div>

            {activeTab === 'settings' && (
                <Card className="p-6 space-y-6">
                    {/* Enable toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("configuration.referrals.toggleProgram")}</h3>
                            <p className="text-sm text-gray-500">{t("configuration.referrals.toggleProgramDesc")}</p>
                        </div>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            disabled={!canModify}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Referrer reward */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t("configuration.referrals.referrerReward")}</h3>
                        <p className="text-sm text-gray-500 mb-3">{t("configuration.referrals.referrerRewardDesc")}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.rewardType")}</label>
                                <select
                                    value={referrerRewardType}
                                    onChange={(e) => setReferrerRewardType(e.target.value as 'percentage' | 'fixed')}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                >
                                    <option value="percentage">{t("configuration.promos.typePercentage")}</option>
                                    <option value="fixed">{t("configuration.promos.typeFixed", { currency: symbol() })}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.rewardValue")}</label>
                                <input
                                    type="number"
                                    value={referrerRewardValue}
                                    onChange={(e) => setReferrerRewardValue(Number(e.target.value))}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Referred reward */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t("configuration.referrals.referredReward")}</h3>
                        <p className="text-sm text-gray-500 mb-3">{t("configuration.referrals.referredRewardDesc")}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.rewardType")}</label>
                                <select
                                    value={referredRewardType}
                                    onChange={(e) => setReferredRewardType(e.target.value as 'percentage' | 'fixed')}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                >
                                    <option value="percentage">{t("configuration.promos.typePercentage")}</option>
                                    <option value="fixed">{t("configuration.promos.typeFixed", { currency: symbol() })}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.rewardValue")}</label>
                                <input
                                    type="number"
                                    value={referredRewardValue}
                                    onChange={(e) => setReferredRewardValue(Number(e.target.value))}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.maxReferrals")}</label>
                            <input
                                type="number"
                                value={maxReferralsPerClient}
                                onChange={(e) => setMaxReferralsPerClient(e.target.value)}
                                disabled={!canModify}
                                placeholder={t("configuration.referrals.maxReferralsHelp")}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                min={0}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("configuration.referrals.expiryDays")}</label>
                            <input
                                type="number"
                                value={rewardExpiryDays}
                                onChange={(e) => setRewardExpiryDays(Number(e.target.value))}
                                disabled={!canModify}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold disabled:opacity-50"
                                min={1}
                            />
                        </div>
                    </div>

                    {/* Save */}
                    <div className="pt-4 flex justify-end">
                        <Button
                            variant="primary"
                            onClick={handleSaveSettings}
                            disabled={!canModify || saving}
                        >
                            {saving ? t("common.saving") : t("configuration.referrals.saveSettings")}
                        </Button>
                    </div>
                </Card>
            )}

            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Stats cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                                <p className="text-xs text-gray-500">{t("configuration.referrals.totalReferrals")}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedReferrals}</p>
                                <p className="text-xs text-gray-500">{t("configuration.referrals.completedReferrals")}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-2">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingReferrals}</p>
                                <p className="text-xs text-gray-500">{t("configuration.referrals.pendingReferrals")}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalRewardsGiven}</p>
                                <p className="text-xs text-gray-500">{t("configuration.referrals.totalRewardsGiven")}</p>
                            </Card>
                        </div>
                    )}

                    {/* Top Referrers */}
                    {stats && stats.topReferrers.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                {t("configuration.referrals.topReferrers")}
                            </h3>
                            <div className="space-y-3">
                                {stats.topReferrers.map((referrer, index) => (
                                    <div key={referrer.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-gray-900">{referrer.clientName}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-color-primary">
                                            {t("configuration.referrals.referralCount", { count: referrer.referralCount })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Referral list */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">{t("configuration.referrals.referralHistory")}</h3>
                        {referrals.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Gift className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t("configuration.referrals.noReferrals")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-2 font-medium text-gray-500">{t("configuration.referrals.referrer")}</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-500">{t("configuration.referrals.referred")}</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-500">{t("configuration.referrals.status")}</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-500">{t("common.date")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referrals.map((ref) => (
                                            <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="py-3 px-2 font-medium text-gray-900">{ref.referrerClient?.name || '-'}</td>
                                                <td className="py-3 px-2 text-gray-700">{ref.referredClient?.name || '-'}</td>
                                                <td className="py-3 px-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[ref.status] || 'bg-gray-100 text-gray-500'}`}>
                                                        {t(`configuration.referrals.status${ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}`)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-gray-500">
                                                    {new Date(ref.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
