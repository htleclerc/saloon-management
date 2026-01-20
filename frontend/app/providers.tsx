"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
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

export default function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <I18nProvider>
                <IncomeProvider>
                    <ProductProvider>
                        <BookingProvider>
                            <ThemeProvider>
                                <ConfirmProvider>
                                    <ToastProvider>
                                        {children}
                                    </ToastProvider>
                                </ConfirmProvider>
                            </ThemeProvider>
                        </BookingProvider>
                    </ProductProvider>
                </IncomeProvider>
            </I18nProvider>
        </AuthProvider>
    );
}
