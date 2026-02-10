import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Shield, Ban, RotateCcw } from 'lucide-react';
import { PaymentStatus } from '@/lib/services/PayrollService';
import { useTranslation } from '@/i18n';

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

export default function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig: Record<
        PaymentStatus,
        {
            labelKey: string;
            defaultLabel: string;
            color: string;
            bgColor: string;
            borderColor: string;
            icon: React.ComponentType<{ className?: string }>;
        }
    > = {
        pending: {
            labelKey: 'team.paymentStatuses.pending',
            defaultLabel: 'Pending',
            color: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            icon: Clock,
        },
        approved: {
            labelKey: 'team.paymentStatuses.approved',
            defaultLabel: 'Validated',
            color: 'text-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            icon: CheckCircle2,
        },
        rejected: {
            labelKey: 'team.paymentStatuses.rejected',
            defaultLabel: 'Rejected',
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: XCircle,
        },
        disputed: {
            labelKey: 'team.paymentStatuses.disputed',
            defaultLabel: 'Disputed',
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            icon: AlertCircle,
        },
        auto_approved: {
            labelKey: 'team.paymentStatuses.auto_approved',
            defaultLabel: 'Auto-Approved',
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: Shield,
        },
        cancelled: {
            labelKey: 'team.paymentStatuses.cancelled',
            defaultLabel: 'Cancelled',
            color: 'text-gray-700',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: Ban,
        },
        refunded: {
            labelKey: 'team.paymentStatuses.refunded',
            defaultLabel: 'Refunded',
            color: 'text-purple-700',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            icon: RotateCcw,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color} ${config.bgColor} ${config.borderColor} ${className}`}
        >
            <Icon className="w-3.5 h-3.5" />
            {t(config.labelKey) || config.defaultLabel}
        </span>
    );
}
