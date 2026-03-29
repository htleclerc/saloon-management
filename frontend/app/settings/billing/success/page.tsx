'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState(5);

    const planId = searchParams.get('plan') || '';

    // Auto-redirect after 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/settings/billing');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <SettingsLayout
            title={t('settings.billing.paymentSuccess')}
            description=""
        >
            <Card className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('settings.billing.paymentSuccess')}
                    </h2>

                    <p className="text-gray-600 max-w-md">
                        {t('settings.billing.paymentSuccessDesc', { plan: planId || 'Pro' })}
                    </p>

                    <p className="text-sm text-gray-400">
                        {t('settings.billing.redirectingIn', { seconds: countdown })}
                    </p>

                    <Button
                        variant="primary"
                        onClick={() => router.push('/settings/billing')}
                        className="mt-4"
                    >
                        <span>{t('settings.billing.goToBilling')}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </SettingsLayout>
    );
}
