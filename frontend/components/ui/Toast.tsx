"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastType } from '@/context/ToastProvider';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: () => void;
}

const toastConfigs = {
    success: {
        icon: CheckCircle,
        color: 'var(--color-success)',
        bgColor: 'var(--color-success-light)',
        borderColor: 'rgba(34, 197, 94, 0.2)', // Subdued green border
        iconColor: 'var(--color-success)',
    },
    error: {
        icon: AlertCircle,
        color: 'var(--color-error)',
        bgColor: 'var(--color-error-light)',
        borderColor: 'rgba(239, 68, 68, 0.2)', // Subdued red border
        iconColor: 'var(--color-error)',
    },
    warning: {
        icon: AlertTriangle,
        color: 'var(--color-warning)',
        bgColor: 'var(--color-warning-light)',
        borderColor: 'rgba(245, 158, 11, 0.2)', // Subdued amber border
        iconColor: 'var(--color-warning)',
    },
    info: {
        icon: Info,
        color: 'var(--color-primary)',
        bgColor: 'var(--color-primary-light)',
        borderColor: 'rgba(147, 51, 234, 0.1)', // Subdued primary border
        iconColor: 'var(--color-primary)',
    },
};

export default function Toast({ message, type, onClose }: ToastProps) {
    const config = toastConfigs[type];
    const Icon = config.icon;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform ${isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-2 opacity-0 scale-95'
                }`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for glass effect
                borderColor: config.borderColor,
            }}
            role="alert"
        >
            <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.bgColor }}
            >
                <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-tight">
                    {message}
                </p>
            </div>

            <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar for auto-dismissal feedback */}
            <div
                className="absolute bottom-0 left-0 h-1 rounded-b-xl opacity-20"
                style={{
                    backgroundColor: config.color,
                    width: '100%',
                    animation: 'shrink linear forwards 5s'
                }}
            />

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
