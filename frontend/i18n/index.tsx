"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Import translations
import en from "./translations/en.json";
import fr from "./translations/fr.json";
import es from "./translations/es.json";

export type Language = "en" | "fr" | "es";

const translations: Record<Language, any> = { en, fr, es };

export const languageNames: Record<Language, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
};

export const languageFlags: Record<Language, string> = {
    en: "🇬🇧",
    fr: "🇫🇷",
    es: "🇪🇸",
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, "dashboard.title") returns obj.dashboard.title
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let current: unknown = obj;

    for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return path; // Return key as fallback
        }
    }

    return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Load language preference from localStorage
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem("workshop-language") as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    // Save language preference
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (mounted) {
            localStorage.setItem("workshop-language", lang);
            document.documentElement.lang = lang;
        }
    };

    // Translation function
    const t = (key: string, params?: Record<string, string | number>): string => {
        let text = getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            });
        }
        return text;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
}

// Export available languages for components
export const availableLanguages: Language[] = ["en", "fr", "es"];
