'use client';

import { useRouter } from 'next/navigation';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function PaymentCancelPage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <SettingsLayout
            title={t('settings.billing.paymentCancelled')}
            description=""
        >
            <Card className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-orange-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('settings.billing.paymentCancelled')}
                    </h2>

                    <p className="text-gray-600 max-w-md">
                        {t('settings.billing.paymentCancelledDesc')}
                    </p>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/settings/billing')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span>{t('settings.billing.goToBilling')}</span>
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() => router.push('/settings/billing/upgrade')}
                        >
                            <span>{t('settings.billing.tryAgain')}</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </SettingsLayout>
    );
}
