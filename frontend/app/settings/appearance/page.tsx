"use client";

import { useState, useEffect } from "react";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme, DesignType, SubmenuLayout, FontSize, colorPalettes } from "@/context/ThemeProvider";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";
import {
    Palette,
    Sun,
    Moon,
    LayoutGrid,
    LayoutList,
    Sparkles,
    Minus,
    Square,
    Maximize2,
    RotateCcw,
    Check,
    Type,
    Layers,
} from "lucide-react";

const fonts = [
    { id: "Open Sans", name: "Open Sans", sample: "Aa" },
    { id: "Inter", name: "Inter", sample: "Aa" },
    { id: "Roboto", name: "Roboto", sample: "Aa" },
    { id: "Poppins", name: "Poppins", sample: "Aa" },
];

const fontSizes: { id: FontSize; name: string; scale: string }[] = [
    { id: "small", name: "Small", scale: "90%" },
    { id: "normal", name: "Normal", scale: "100%" },
    { id: "large", name: "Large", scale: "110%" },
];

const designTypes: { id: DesignType; name: string; description: string; icon: React.ElementType }[] = [
    { id: "modern", name: "Modern", description: "Gradients, shadows, rounded corners", icon: Sparkles },
    { id: "minimal", name: "Minimal", description: "Flat, clean, no gradients", icon: Minus },
    { id: "glassmorphism", name: "Glass", description: "Transparency, blur effects", icon: Square },
    { id: "gradient", name: "Gradient", description: "Colorful gradient backgrounds", icon: Layers },
];

const submenuLayouts: { id: SubmenuLayout; name: string; description: string; icon: React.ElementType }[] = [
    { id: "vertical", name: "Vertical", description: "Left sidebar", icon: LayoutList },
    { id: "horizontal", name: "Horizontal", description: "Top tabs", icon: LayoutGrid },
];

export default function AppearanceSettingsPage() {
    const { theme, updateTheme } = useTheme();
    const { t } = useTranslation();
    const { currentTenant, updateTenantColors } = useAuth();
    const [localTheme, setLocalTheme] = useState(theme);
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>("");
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>("");
    const [useCustomOverride, setUseCustomOverride] = useState<boolean>(false);

    useEffect(() => {
        setLocalTheme(theme);
        // Initialize custom colors from current tenant
        if (currentTenant) {
            setCustomPrimaryColor(currentTenant.customPrimaryColor || "");
            setCustomSecondaryColor(currentTenant.customSecondaryColor || "");
            setUseCustomOverride(currentTenant.useCustomColorOverride ?? false);
        }
    }, [theme, currentTenant]);

    const handleApply = () => {
        updateTheme(localTheme);
        // Save custom colors to tenant only if override is enabled
        if (useCustomOverride) {
            updateTenantColors(customPrimaryColor || undefined, customSecondaryColor || undefined, useCustomOverride);
        } else {
            updateTenantColors(undefined, undefined, false);
        }
    };

    const handleReset = () => {
        const defaultSettings = {
            submenuLayout: "vertical" as SubmenuLayout,
            designType: "modern" as DesignType,
            colorPaletteId: "purple-pink",
            fontFamily: "Open Sans",
            fontSize: "normal" as FontSize,
            darkMode: false,
            compactMode: false,
            animations: true,
            transparency: 0.95,
        };
        setLocalTheme({ ...theme, ...defaultSettings });
        updateTheme(defaultSettings);
    };

    const selectedPalette = colorPalettes.find(p => p.id === localTheme.colorPaletteId) || colorPalettes[0];

    return (
        <SettingsLayout
            title={t("settings.appearance")}
            description={t("settings.title")}
        >
            {/* Color Palette - Primary & Secondary */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${selectedPalette.primary} 0%, ${selectedPalette.secondary} 100%)` }}>
                        <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Color Palette</h3>
                        <p className="text-xs text-gray-500">Choose primary & secondary colors</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorPalettes.map((palette) => {
                        const isSelected = localTheme.colorPaletteId === palette.id;
                        return (
                            <button
                                key={palette.id}
                                onClick={() => setLocalTheme({ ...localTheme, colorPaletteId: palette.id })}
                                className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? "border-gray-900 shadow-lg ring-1 ring-gray-900"
                                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                    }`}
                            >
                                {/* Color preview circles */}
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <div
                                        className="w-8 h-8 rounded-full shadow-md"
                                        style={{ backgroundColor: palette.primary }}
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full shadow-md -ml-2"
                                        style={{ backgroundColor: palette.secondary }}
                                    />
                                </div>
                                {/* Gradient bar preview */}
                                <div
                                    className="h-2 rounded-full mb-2"
                                    style={{ background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.secondary} 100%)` }}
                                />
                                <p className="text-xs font-medium text-gray-700 text-center">{palette.name}</p>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Custom Colors Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">Custom Brand Colors</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Override default logo-based colors</p>
                        </div>
                    </div>

                    {/* Override Checkbox */}
                    <label className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useCustomOverride}
                            onChange={(e) => setUseCustomOverride(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Override palette colors</p>
                            <p className="text-xs text-gray-500">Use custom colors instead of selected palette</p>
                        </div>
                    </label>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Primary Color Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Primary Color</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={customPrimaryColor || selectedPalette.primary}
                                    onChange={(e) => setCustomPrimaryColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="h-10 rounded-lg border-2 border-gray-200 flex items-center gap-2 px-3 cursor-pointer hover:border-purple-300 transition">
                                    <div
                                        className="w-6 h-6 rounded border border-gray-300"
                                        style={{ backgroundColor: customPrimaryColor || selectedPalette.primary }}
                                    />
                                    <span className="text-sm font-mono text-gray-600">
                                        {customPrimaryColor || selectedPalette.primary}
                                    </span>
                                </div>
                            </div>
                            {customPrimaryColor && (
                                <button
                                    onClick={() => setCustomPrimaryColor("")}
                                    className="text-xs text-purple-600 hover:text-purple-700"
                                >
                                    Reset to default
                                </button>
                            )}
                        </div>

                        {/* Secondary Color Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Secondary Color</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={customSecondaryColor || selectedPalette.secondary}
                                    onChange={(e) => setCustomSecondaryColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="h-10 rounded-lg border-2 border-gray-200 flex items-center gap-2 px-3 cursor-pointer hover:border-purple-300 transition">
                                    <div
                                        className="w-6 h-6 rounded border border-gray-300"
                                        style={{ backgroundColor: customSecondaryColor || selectedPalette.secondary }}
                                    />
                                    <span className="text-sm font-mono text-gray-600">
                                        {customSecondaryColor || selectedPalette.secondary}
                                    </span>
                                </div>
                            </div>
                            {customSecondaryColor && (
                                <button
                                    onClick={() => setCustomSecondaryColor("")}
                                    className="text-xs text-purple-600 hover:text-purple-700"
                                >
                                    Reset to default
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Live Preview</p>
                        <div
                            className="h-12 rounded-lg shadow-sm"
                            style={{ background: `linear-gradient(90deg, ${customPrimaryColor || selectedPalette.primary} 0%, ${customSecondaryColor || selectedPalette.secondary} 100%)` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Design Type */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.designType")}</h3>
                        <p className="text-xs text-gray-500">Choose the visual style</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {designTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = localTheme.designType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setLocalTheme({ ...localTheme, designType: type.id })}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-md"
                                    : "border-gray-200 hover:border-purple-200 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`w-5 h-5 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
                                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                                </div>
                                <p className="font-medium text-gray-900 text-sm">{type.name}</p>
                                <p className="text-xs text-gray-500">{type.description}</p>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Submenu Layout */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.submenuLayout")}</h3>
                        <p className="text-xs text-gray-500">Workers & Settings menu position</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {submenuLayouts.map((layout) => {
                        const Icon = layout.icon;
                        const isSelected = localTheme.submenuLayout === layout.id;
                        return (
                            <button
                                key={layout.id}
                                onClick={() => setLocalTheme({ ...localTheme, submenuLayout: layout.id })}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-md"
                                    : "border-gray-200 hover:border-purple-200 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`w-5 h-5 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
                                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                                </div>
                                <p className="font-medium text-gray-900 text-sm">{layout.name}</p>
                                <p className="text-xs text-gray-500">{layout.description}</p>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Theme Mode */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.themeMode")}</h3>
                        <p className="text-xs text-gray-500">Light or dark appearance</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {[
                        { id: false, name: t("settings.lightMode"), icon: Sun },
                        { id: true, name: t("settings.darkMode"), icon: Moon },
                    ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = localTheme.darkMode === mode.id;
                        return (
                            <button
                                key={mode.name}
                                onClick={() => setLocalTheme({ ...localTheme, darkMode: mode.id })}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                                    : "border-gray-200 hover:border-purple-200 text-gray-600 hover:shadow-md"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{mode.name}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Font Family */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Type className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.fontFamily")}</h3>
                        <p className="text-xs text-gray-500">Choose your preferred font</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fonts.map((font) => {
                        const isSelected = localTheme.fontFamily === font.id;
                        return (
                            <button
                                key={font.id}
                                onClick={() => setLocalTheme({ ...localTheme, fontFamily: font.id })}
                                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-md"
                                    : "border-gray-200 hover:border-purple-200 hover:shadow-md"
                                    }`}
                            >
                                <span
                                    className="text-2xl font-medium text-gray-900 block mb-1"
                                    style={{ fontFamily: font.id }}
                                >
                                    {font.sample}
                                </span>
                                <span className="text-xs text-gray-600">{font.name}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Font Size */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{t("settings.fontSize")}</h3>
                        <p className="text-xs text-gray-500">Adjust text size</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {fontSizes.map((size) => {
                        const isSelected = localTheme.fontSize === size.id;
                        return (
                            <button
                                key={size.id}
                                onClick={() => setLocalTheme({ ...localTheme, fontSize: size.id })}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-md"
                                    : "border-gray-200 hover:border-purple-200 hover:shadow-md"
                                    }`}
                            >
                                <span className="font-medium text-gray-900 text-sm">{size.name}</span>
                                <span className="text-xs text-gray-500">{size.scale}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Additional Options */}
            <Card>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Transparency & Effects</h3>
                        <p className="text-xs text-gray-500">Adjust visual depth</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-900">Card Opacity</label>
                            <span className="text-sm text-gray-500">{Math.round(localTheme.transparency * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="1"
                            step="0.05"
                            value={localTheme.transparency || 0.95}
                            onChange={(e) => setLocalTheme({ ...localTheme, transparency: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Adjust the transparency level of cards (glass effect)</p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Compact Mode</p>
                                <p className="text-xs text-gray-500">Reduce spacing</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localTheme.compactMode}
                                onChange={(e) => setLocalTheme({ ...localTheme, compactMode: e.target.checked })}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Animations</p>
                                <p className="text-xs text-gray-500">Enable transitions and animations</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localTheme.animations}
                                onChange={(e) => setLocalTheme({ ...localTheme, animations: e.target.checked })}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                        </label>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <Button variant="outline" size="md" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </Button>
                <Button variant="primary" size="md" onClick={handleApply}>
                    <Check className="w-4 h-4" />
                    {t("common.apply")}
                </Button>
            </div>
        </SettingsLayout>
    );
}
