"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { BookingProvider } from "@/context/BookingProvider";
import { I18nProvider } from "@/i18n";
import { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
}

import { ToastProvider } from "@/context/ToastProvider";
import { ConfirmProvider } from "@/context/ConfirmProvider";
import { OnboardingProvider } from "@/context/OnboardingProvider";
import { DataModeProvider } from "@/context/DataModeProvider";
import { AIProvider } from "@/context/AIProvider";
import ReadOnlyBanner from "@/components/layout/ReadOnlyBanner";

function ReadOnlyBannerWrapper({ children }: { children: ReactNode }) {
    const { isReadOnlyMode, readOnlySalonInfo } = useAuth();

    return (
        <>
            {isReadOnlyMode && readOnlySalonInfo && (
                <ReadOnlyBanner
                    salonName={readOnlySalonInfo.name}
                    ownerName={readOnlySalonInfo.ownerName}
                />
            )}
            {children}
        </>
    );
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <DataModeProvider>
            <AIProvider>
                <AuthProvider>
                    <OnboardingProvider>
                        <I18nProvider>
                            <BookingProvider>
                                <ThemeProvider>
                                    <ConfirmProvider>
                                        <ToastProvider>
                                            <ReadOnlyBannerWrapper>
                                                {children}
                                            </ReadOnlyBannerWrapper>
                                        </ToastProvider>
                                    </ConfirmProvider>
                                </ThemeProvider>
                            </BookingProvider>
                        </I18nProvider>
                    </OnboardingProvider>
                </AuthProvider>
            </AIProvider>
        </DataModeProvider>
    );
}
