'use client';

import ComingSoon from '@/components/superadmin/ComingSoon';
import { useTranslation } from '@/i18n';

export default function SuperAdminSupportPage() {
    const { t } = useTranslation();
    return <ComingSoon title={t("superadmin.supportTickets")} />;
}
