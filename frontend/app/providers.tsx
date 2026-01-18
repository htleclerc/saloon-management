"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { I18nProvider } from "@/i18n";
import { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <I18nProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </I18nProvider>
        </AuthProvider>
    );
}
