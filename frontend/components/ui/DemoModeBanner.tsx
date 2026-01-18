"use client";

import { useAuth } from "@/context/AuthProvider";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function DemoModeBanner() {
    const { isDemoMode, user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);

    if (!isDemoMode || !isVisible) return null;

    // Calculate remaining hours
    const getRemainingTime = () => {
        if (!user?.demoCreatedAt) return "72 hours";
        const createdAt = new Date(user.demoCreatedAt);
        const now = new Date();
        const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const hoursRemaining = Math.max(0, 72 - hoursPassed);
        return `${Math.floor(hoursRemaining)} hours`;
    };

    return (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <div>
                    <p className="font-bold text-sm">Demo Mode Active</p>
                    <p className="text-xs opacity-90">
                        This is a demo account. All data will be deleted in {getRemainingTime()}.
                    </p>
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
