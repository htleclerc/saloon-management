import React, { ReactNode } from 'react';

interface OnboardingLayoutProps {
    children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
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

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
