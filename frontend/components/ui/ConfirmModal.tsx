"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import Button from './Button';
import { ConfirmType } from '@/context/ConfirmProvider';
import { useTranslation } from '@/i18n';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const typeConfigs = {
    warning: {
        icon: AlertTriangle,
        color: 'var(--color-warning)',
        lightBg: 'var(--color-warning-light)',
        btnVariant: 'primary' as const,
    },
    error: {
        icon: AlertCircle,
        color: 'var(--color-error)',
        lightBg: 'var(--color-error-light)',
        btnVariant: 'danger' as const,
    },
    info: {
        icon: Info,
        color: 'var(--color-primary)',
        lightBg: 'var(--color-primary-light)',
        btnVariant: 'primary' as const,
    },
    success: {
        icon: CheckCircle,
        color: 'var(--color-success)',
        lightBg: 'var(--color-success-light)',
        btnVariant: 'success' as const,
    },
};

export default function ConfirmModal({
    isOpen,
    title,
    message,
    type,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animate, setAnimate] = useState(false);
    const [isColorsSame, setIsColorsSame] = useState(false);
    const config = typeConfigs[type];
    const Icon = config.icon;
    const { t } = useTranslation();

    // Use translation defaults if not provided
    const finalConfirmText = confirmText || t("common.confirm");
    const finalCancelText = cancelText || t("common.cancel");

    useEffect(() => {
        // Check if brand colors are identical
        if (typeof window !== 'undefined') {
            const rootStyle = getComputedStyle(document.documentElement);
            const primary = rootStyle.getPropertyValue('--color-primary').trim();
            const secondary = rootStyle.getPropertyValue('--color-secondary').trim();
            setIsColorsSame(primary === secondary);
        }

        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => setAnimate(true), 10);
            document.body.style.overflow = 'hidden';
        } else {
            setAnimate(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with blur and fade */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                onClick={onCancel}
            />

            {/* Modal Content with scale and fade */}
            <div
                className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
                    }`}
            >
                <div className="p-6 sm:p-8">
                    {/* Header with Icon */}
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: config.lightBg }}
                        >
                            <Icon className="w-6 h-6" style={{ color: config.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant={(type === 'warning' && !isColorsSame) ? 'secondary' : 'outline'}
                            onClick={onCancel}
                            className={`flex-1 font-bold ${type !== 'warning' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-none' : ''}`}
                        >
                            {finalCancelText}
                        </Button>
                        <Button
                            variant={config.btnVariant}
                            onClick={onConfirm}
                            className="flex-1 shadow-lg"
                        >
                            {finalConfirmText}
                        </Button>
                    </div>
                </div>

                {/* Decorative brand strip */}
                <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: config.color }}
                />
            </div>
        </div>
    );
}
