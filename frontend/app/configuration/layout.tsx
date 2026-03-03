"use client";

import ConfigurationLayout from "@/components/layout/ConfigurationLayout";

export default function ConfLayout({ children }: { children: React.ReactNode }) {
    return (
        <ConfigurationLayout
            title="Configuration"
            description="Manage your workshop settings, inventory, promos, and tips."
        >
            {children}
        </ConfigurationLayout>
    );
}
