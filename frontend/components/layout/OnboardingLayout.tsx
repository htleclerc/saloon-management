'use client';

import React, { ReactNode, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useTranslation } from '@/i18n';

interface OnboardingLayoutProps {
    children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { t } = useTranslation();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            // OnboardingProvider already saves to localStorage automatically,
            // so the progress will be preserved when the user logs back in
            await Promise.race([
                logout(),
                new Promise(resolve => setTimeout(resolve, 3000)) // Timeout after 3s (rate limiting)
            ]);
        } catch {
            // Ignore errors (rate limiting, network issues)
        }
        // Force full-page navigation to clear all state
        window.location.replace('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header with logo + logout */}
                <div className="flex items-center justify-between mb-8">
                    {/* Left spacer for centering */}
                    <div className="w-32" />

                    {/* Logo/Branding - centered */}
                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-2xl flex items-center justify-center">
                                <span className="text-white font-black text-xl">S</span>
                            </div>
                            <h1 className="text-3xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                                Saloon Management
                            </h1>
                        </div>
                        <p className="text-gray-600">Configurez votre salon en quelques étapes</p>
                    </div>

                    {/* Logout button */}
                    <div className="w-32 flex justify-end">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
