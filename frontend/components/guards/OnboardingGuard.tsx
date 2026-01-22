"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

/**
 * Route guard that redirects users to onboarding if they haven't completed it
 * Wraps protected routes to ensure onboarding is complete before access
 */
export default function OnboardingGuard({ children }: OnboardingGuardProps) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            // Check if onboarding is not completed
            if (user.onboardingCompleted === false) {
                router.replace("/onboarding/setup");
            }
        }
    }, [user, isLoading, router]);

    // Show nothing while checking or redirecting
    if (isLoading || (user && user.onboardingCompleted === false)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    // User has completed onboarding or doesn't need it
    return <>{children}</>;
}
