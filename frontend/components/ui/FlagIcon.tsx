"use client";

import { Language } from "@/i18n";

interface FlagIconProps {
    lang: Language;
    className?: string;
}

function GBFlag({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <clipPath id="gb-clip"><rect width="60" height="30" /></clipPath>
            <g clipPath="url(#gb-clip)">
                <rect width="60" height="30" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#gb-clip)" />
                <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
            </g>
        </svg>
    );
}

function FRFlag({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="40" fill="#002395" />
            <rect x="20" width="20" height="40" fill="#fff" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
    );
}

function ESFlag({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="40" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
        </svg>
    );
}

const flagComponents: Record<Language, React.FC<{ className?: string }>> = {
    en: GBFlag,
    fr: FRFlag,
    es: ESFlag,
};

export default function FlagIcon({ lang, className = "w-5 h-3.5" }: FlagIconProps) {
    const Flag = flagComponents[lang];
    return (
        <span className="inline-flex items-center justify-center shrink-0 rounded-sm overflow-hidden shadow-sm border border-gray-200">
            <Flag className={className} />
        </span>
    );
}
