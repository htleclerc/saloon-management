"use client";

import { useState, useEffect } from "react";
import { Scissors } from "lucide-react";
import Skeleton from "./Skeleton";
import { useTranslation } from "@/i18n";

const MESSAGES_KEYS = [
    "common.loadingWorkspace",
    "common.settingUpDashboard",
    "common.almostReady",
];

export default function LoadingScreen() {
    const { t } = useTranslation();
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES_KEYS.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-r-full"
                    style={{
                        animation: 'loading-progress 2.5s ease-in-out infinite',
                    }}
                />
            </div>

            {/* Skeleton layout */}
            <div className="flex flex-1">
                {/* Sidebar skeleton */}
                <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 p-4 gap-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton variant="rectangular" className="w-9 h-9 !bg-[var(--color-primary)]/20" />
                        <Skeleton variant="text" className="w-24 h-4 !bg-[var(--color-primary)]/15" />
                    </div>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton variant="rectangular" className="w-8 h-8 !bg-[var(--color-primary)]/10" />
                            <Skeleton variant="text" className={`h-3 !bg-[var(--color-primary)]/10 ${i % 3 === 0 ? 'w-20' : i % 3 === 1 ? 'w-28' : 'w-16'}`} />
                        </div>
                    ))}
                </div>

                {/* Main content area */}
                <div className="flex-1 flex flex-col">
                    {/* Header skeleton */}
                    <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
                        <Skeleton variant="text" className="w-32 h-5" />
                        <div className="flex items-center gap-3">
                            <Skeleton variant="circular" className="w-8 h-8" />
                            <Skeleton variant="circular" className="w-8 h-8" />
                            <Skeleton variant="rectangular" className="w-24 h-8" />
                        </div>
                    </div>

                    {/* Content skeleton with brand center */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
                        {/* Brand */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[color:var(--color-primary)]/20">
                                <Scissors className="w-8 h-8 text-white animate-pulse" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                Workshop Manager
                            </h1>
                        </div>

                        {/* Loading indicator */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium animate-pulse transition-all">
                                {t(MESSAGES_KEYS[messageIndex])}
                            </p>
                        </div>

                        {/* Dashboard skeleton cards */}
                        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <Skeleton variant="text" className="w-16 h-3 mb-3" />
                                    <Skeleton variant="text" className="w-20 h-6 mb-2" />
                                    <Skeleton variant="text" className="w-24 h-3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS animation for progress bar */}
            <style jsx>{`
                @keyframes loading-progress {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 60%; margin-left: 20%; }
                    100% { width: 0%; margin-left: 100%; }
                }
            `}</style>
        </div>
    );
}
