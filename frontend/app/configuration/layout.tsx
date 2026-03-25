"use client";

import ConfigurationLayout from "@/components/layout/ConfigurationLayout";
import { useTranslation } from "@/i18n";

export default function ConfLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    return (
        <ConfigurationLayout
            title={t("configuration.title")}
            description={t("configuration.description")}
        >
            {children}
        </ConfigurationLayout>
    );
}
