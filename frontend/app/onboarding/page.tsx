'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

/**
 * Onboarding entry point
 * Redirects to the first step of the onboarding process
 */
export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        // Clear any existing onboarding data to start fresh
        localStorage.removeItem('onboarding_data');
        localStorage.removeItem('onboarding_step');

        // Redirect to first step: salon setup
        router.push('/onboarding/setup');
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initialisation de l'onboarding...</p>
            </div>
        </div>
    );
}
