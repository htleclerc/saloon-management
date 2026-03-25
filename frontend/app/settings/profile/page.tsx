"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, Camera, Globe, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation, languageNames, availableLanguages, Language } from "@/i18n";
import FlagIcon from "@/components/ui/FlagIcon";
import { useToast } from "@/context/ToastProvider";
import { salonService } from "@/lib/services/SalonService";
import { storageService } from "@/lib/services/StorageService";
import { supabase } from "@/lib/supabase/client";

export default function ProfileSettingsPage() {
    const { t, language: globalLanguage, setLanguage: setGlobalLanguage } = useTranslation();
    const { user, canModify, activeSalonId, updateUser } = useAuth();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const { showToast } = useToast();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [timezone, setTimezone] = useState("Europe/London");
    const [isLoading, setIsLoading] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    // Close language dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load user and salon data on mount
    useEffect(() => {
        if (user) {
            const nameParts = (user.name || "").split(" ");
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(" ") || "");
            setEmail(user.email || "");
        }
    }, [user?.id]);

    useEffect(() => {
        if (activeSalonId) {
            loadSalonData();
        }
    }, [activeSalonId]);

    const loadSalonData = async () => {
        try {
            const salon = await salonService.getById(Number(activeSalonId));
            if (salon) {
                setPhone(salon.phone || "");
                setTimezone(salon.timezone || "Europe/London");
            }
        } catch (error) {
            console.error("Failed to load salon data:", error);
        }
    };

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";

    const handleSave = async () => {
        if (handleReadOnlyClick()) return;
        if (!activeSalonId) {
            showToast(t("common.error"), t("settings.profilePage.saveError"), "error");
            return;
        }

        try {
            setIsLoading(true);
            const fullName = `${firstName} ${lastName}`.trim();
            updateUser({ name: fullName, email });

            await salonService.update(Number(activeSalonId), {
                phone,
                timezone,
            });

            showToast(t("common.success"), t("settings.profilePage.saved"), "success");
        } catch (error) {
            console.error("Failed to save profile:", error);
            showToast(t("common.error"), t("settings.profilePage.saveError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const acceptedTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!acceptedTypes.includes(file.type)) {
            showToast(t("common.error"), t("settings.profilePage.invalidFileType"), "error");
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            showToast(t("common.error"), t("settings.profilePage.fileTooLarge"), "error");
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const folder = `users/${user?.id || 'default'}`;
            const url = await storageService.uploadImage(file, 'avatars', folder);

            // Persist avatar URL to Supabase users table
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                await supabase
                    .from('users')
                    .update({ avatar_url: url })
                    .eq('auth_id', authUser.id);
            }

            updateUser({ avatar: url });
            showToast(t("common.success"), t("settings.profilePage.photoUpdated"), "success");
        } catch (err) {
            console.error("Avatar upload failed:", err);
            showToast(t("common.error"), t("settings.profilePage.saveError"), "error");
        } finally {
            setIsUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        // Persist removal to Supabase
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            await supabase
                .from('users')
                .update({ avatar_url: null })
                .eq('auth_id', authUser.id);
        }

        updateUser({ avatar: '' });
        showToast(t("common.success"), t("settings.profilePage.photoRemoved"), "success");
    };

    return (
        <SettingsLayout
            title={t("settings.profilePage.title")}
            description={t("settings.profilePage.description")}
        >
            {/* Profile Photo */}
            <Card>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div
                            onClick={() => canModify && avatarInputRef.current?.click()}
                            className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold overflow-hidden ${canModify ? 'cursor-pointer' : ''}`}
                        >
                            {isUploadingAvatar ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : user?.avatar && !user.avatar.includes('dicebear') && !user.avatar.includes('ui-avatars') ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <ReadOnlyGuard>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </ReadOnlyGuard>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("settings.profilePage.profilePhoto")}</h3>
                        <p className="text-sm text-gray-500 mb-3">{t("settings.profilePage.photoHint")}</p>
                        <div className="flex gap-2">
                            <ReadOnlyGuard>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                >
                                    {t("settings.profilePage.changePhoto")}
                                </Button>
                            </ReadOnlyGuard>
                            {user?.avatar && !user.avatar.includes('dicebear') && !user.avatar.includes('ui-avatars') && (
                                <ReadOnlyGuard>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={handleRemoveAvatar}
                                    >
                                        {t("settings.profilePage.deletePhoto")}
                                    </Button>
                                </ReadOnlyGuard>
                            )}
                        </div>
                    </div>
                </div>
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                />
            </Card>

            {/* Personal Information */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">{t("settings.profilePage.personalInfo")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("settings.profilePage.firstName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("settings.profilePage.lastName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("settings.profilePage.email")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.profilePage.phone")}</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            readOnly={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                        <h3 className="font-semibold text-gray-900">{t("settings.profilePage.regionalSettings")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.profilePage.languageAndTimezone")}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.language")}</label>
                        <div className="relative" ref={langDropdownRef}>
                            <button
                                type="button"
                                onClick={() => canModify && setLangDropdownOpen(!langDropdownOpen)}
                                disabled={!canModify}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-left disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <FlagIcon lang={globalLanguage} />
                                <span className="flex-1">{languageNames[globalLanguage]}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {langDropdownOpen && (
                                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
                                    {availableLanguages.map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => {
                                                setGlobalLanguage(lang);
                                                setLangDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-gray-50 ${
                                                globalLanguage === lang ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium" : "text-gray-700"
                                            }`}
                                        >
                                            <FlagIcon lang={lang} />
                                            <span>{languageNames[lang]}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.profilePage.timezone")}</label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            disabled={!canModify}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                <Button variant="outline" size="md">{t("common.cancel")}</Button>
                <ReadOnlyGuard>
                    <Button variant="primary" size="md" onClick={handleSave} disabled={isLoading}>
                        <Save className="w-4 h-4" />
                        {isLoading ? t("common.saving") : t("common.save")}
                    </Button>
                </ReadOnlyGuard>
            </div>
        </SettingsLayout>
    );
}
