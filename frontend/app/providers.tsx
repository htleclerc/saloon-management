"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { BookingProvider } from "@/context/BookingProvider";
import { IncomeProvider } from "@/context/IncomeProvider";
import { I18nProvider } from "@/i18n";
import { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
}

import { ToastProvider } from "@/context/ToastProvider";
import { ConfirmProvider } from "@/context/ConfirmProvider";
import { ProductProvider } from "@/context/ProductProvider";
import { PromoCodeProvider } from "@/context/PromoCodeProvider";
import { ServiceProvider } from "@/context/ServiceProvider";
import { TipsProvider } from "@/context/TipsProvider";
import { OnboardingProvider } from "@/context/OnboardingProvider";
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
        <AuthProvider>
            <OnboardingProvider>
                <I18nProvider>
                    <IncomeProvider>
                        <ProductProvider>
                            <PromoCodeProvider>
                                <TipsProvider>
                                    <ServiceProvider>
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
                                    </ServiceProvider>
                                </TipsProvider>
                            </PromoCodeProvider>
                        </ProductProvider>
                    </IncomeProvider>
                </I18nProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}

