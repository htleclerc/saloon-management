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
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'validation':
                return <CheckCircle className="w-5 h-5 text-purple-500" />;
            case 'booking':
                return <Calendar className="w-5 h-5 text-blue-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
        if (isRead) return 'bg-white hover:bg-gray-50';

        switch (type) {
            case 'validation':
                return 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-500';
            case 'success':
                return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500';
            case 'warning':
                return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
            case 'booking':
                return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
            default:
                return 'bg-gray-50 hover:bg-gray-100';
        }
    };

    return (
        <div className="fixed top-16 left-4 right-4 mx-auto w-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-none max-w-[28rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-2.5 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
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
            <div className="max-h-[350px] sm:max-h-[450px] overflow-y-auto">
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
                                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1"></span>
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
                                                        className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[9px] sm:text-xs font-medium rounded-md sm:rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm"
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

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs font-medium text-purple-600 hover:text-purple-700 transition"
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
