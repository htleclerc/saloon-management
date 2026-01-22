'use client';

import { Shield, Eye, Settings, X, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme, useResponsive } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthProvider';

interface ReadOnlyBannerProps {
    salonName: string;
    ownerName: string;
}

export default function ReadOnlyBanner({ salonName, ownerName }: ReadOnlyBannerProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { isMobile, isTablet } = useResponsive();

    const {
        isReadOnlyMode,
        exitReadOnlyMode,
        readOnlySalonInfo,
        canManageSalon,
        enterManageMode,
        toggleReadOnlyMode
    } = useAuth();

    const handleExit = () => {
        exitReadOnlyMode();
        router.push('/superadmin/salons');
    };

    // Calculate left margin based on sidebar state
    const getLeftPosition = () => {
        if (isMobile) return "left-0";
        if (theme.sidebarCollapsed || isTablet) return "left-[72px]";
        return "left-64";
    };

    return (
        <div className={`fixed top-0 ${getLeftPosition()} right-0 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 flex items-center justify-between z-50 shadow-lg transition-all duration-300 border-b border-white/10`}>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-white/20 px-3 py-1.5 rounded-lg border border-white/20">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <div className="flex items-center gap-2 border-l border-white/10 pl-2.5">
                        {isReadOnlyMode ? (
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-200" />
                                {readOnlySalonInfo && canManageSalon(readOnlySalonInfo.id) && (
                                    <button
                                        onClick={() => enterManageMode(readOnlySalonInfo.id, readOnlySalonInfo.name, readOnlySalonInfo.ownerName)}
                                        className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 hover:bg-white/30 rounded-md transition-all group"
                                        title="Switch to Manage Mode"
                                    >
                                        <SquarePen className="w-3.5 h-3.5 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Manage</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-purple-200 animate-[spin_4s_linear_infinite]" />
                                <button
                                    onClick={toggleReadOnlyMode}
                                    className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 hover:bg-white/30 rounded-md transition-all"
                                    title="Switch to View Only"
                                >
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">View</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm md:text-base">
                        <span className="font-bold tracking-tight">
                            {isReadOnlyMode ? 'READ-ONLY MODE' : 'MANAGE MODE'}
                        </span>
                        <span className="hidden sm:inline opacity-40">|</span>
                        <span className="hidden sm:inline font-bold text-purple-200">SUPER ADMIN</span>
                        <span className="hidden sm:inline opacity-40">|</span>
                        <span className="hidden sm:inline">Salon: <strong>{salonName}</strong></span>
                        <span className="hidden md:inline opacity-40">|</span>
                        <span className="hidden md:inline text-purple-100 uppercase text-xs">Owner: {ownerName}</span>
                    </div>
                    <p className="text-xs text-purple-100 mt-0.5 hidden sm:block">
                        {isReadOnlyMode
                            ? 'Browsing salon state - No modifications allowed'
                            : 'Full administrative access - Modifications enabled'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleExit}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0 border border-white/20"
            >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-sm">Exit</span>
            </button>
        </div>
    );
}
