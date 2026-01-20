"use client";

import { Check, X, AlertCircle, CheckCircle, Info, Calendar, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export type NotificationType = 'info' | 'warning' | 'success' | 'validation' | 'booking';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actions?: {
        onApprove?: () => void;
        onReject?: () => void;
        onView?: () => void;
    };
}

interface NotificationsPanelProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClose?: () => void;
}

export default function NotificationsPanel({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose
}: NotificationsPanelProps) {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />;
            case 'validation':
                return <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />;
            case 'booking':
                return <Calendar className="w-5 h-5 text-[var(--color-info)]" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
        if (isRead) return 'bg-white hover:bg-gray-50';

        switch (type) {
            case 'validation':
                return 'bg-[var(--color-primary-light)] hover:opacity-90 border-l-4 border-[var(--color-primary)]';
            case 'success':
                return 'bg-[var(--color-success-light)] hover:opacity-90 border-l-4 border-[var(--color-success)]';
            case 'warning':
                return 'bg-[var(--color-warning-light)] hover:opacity-90 border-l-4 border-[var(--color-warning)]';
            case 'booking':
                return 'bg-[var(--color-info-light)] hover:opacity-90 border-l-4 border-[var(--color-info)]';
            default:
                return 'bg-gray-50 hover:bg-gray-100';
        }
    };

    return (
        <div className="fixed top-16 left-4 right-4 mx-auto w-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 sm:max-w-none max-w-[28rem] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_20px_rgba(147,51,234,0.1)] border border-gray-100 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-2.5 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-lg font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-medium text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="relative">
                <div className="max-h-[350px] sm:max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 hover:scrollbar-thumb-purple-300 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Aucune notification</p>
                            <p className="text-gray-400 text-xs mt-1">Vous êtes à jour !</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-2.5 sm:p-4 transition-all cursor-pointer ${getNotificationBgColor(notification.type, notification.isRead)}`}
                                    onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-2 sm:gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1">
                                                <h4 className={`text-[11px] sm:text-sm font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className={`text-[10px] sm:text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} mb-1 sm:mb-2 line-clamp-2`}>
                                                {notification.message}
                                            </p>

                                            {/* Timestamp */}
                                            <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                <span>
                                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>

                                            {/* Action Buttons for Validation */}
                                            {notification.type === 'validation' && notification.actions && (
                                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5 sm:mt-3">
                                                    {notification.actions.onView && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                notification.actions!.onView!();
                                                                onMarkAsRead(notification.id);
                                                            }}
                                                            className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 text-[9px] sm:text-xs font-medium rounded-md sm:rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                                                        >
                                                            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            Voir
                                                        </button>
                                                    )}
                                                    {notification.actions.onApprove && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                notification.actions!.onApprove!();
                                                                onMarkAsRead(notification.id);
                                                            }}
                                                            className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white text-[9px] sm:text-xs font-medium rounded-md sm:rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary-dark)] transition-all shadow-sm"
                                                        >
                                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            Approuver
                                                        </button>
                                                    )}
                                                    {notification.actions.onReject && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                notification.actions!.onReject!();
                                                                onMarkAsRead(notification.id);
                                                            }}
                                                            className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-gray-100 text-gray-700 text-[9px] sm:text-xs font-medium rounded-md sm:rounded-lg hover:bg-gray-200 transition-all"
                                                        >
                                                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            Rejeter
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Edge Fades for Premium Look */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 opacity-60"></div>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition"
                        >
                            Tout marquer comme lu
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto text-xs font-medium text-gray-600 hover:text-gray-700 transition"
                    >
                        Fermer
                    </button>
                </div>
            )}
        </div>
    );
}
