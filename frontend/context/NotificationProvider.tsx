"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Notification, NotificationType } from '@/types';
import { useToast } from './ToastProvider';
import { notificationService } from '@/lib/services';
import { useAuth } from './AuthProvider';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'> & { targetUserCode?: string }) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const POLLING_INTERVAL = 10000; // 10 seconds

    // POLLING: Load notifications from DB
    const loadNotifications = useCallback(async () => {
        if (!isAuthenticated || !(user as any)?.userCode) return;

        try {
            // Need to cast user to access userCode if it's not in the base type yet, 
            // but checked types and it SHOULD be there. If types/index.ts has userCode, good.
            // Using as any based on previous files usage pattern just in case
            const userCode = (user as any).userCode || "ADM-000";
            const data = await notificationService.getForUser(userCode);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    }, [user, isAuthenticated]);

    // POLLING & BROADCAST LISTENER
    useEffect(() => {
        // 1. Initial Load
        loadNotifications();

        // 2. Polling (Keep this for DB sync if it works)
        const intervalId = setInterval(loadNotifications, POLLING_INTERVAL);

        // 3. Broadcast Channel Listener (For robust Cross-Tab/Simulated Realtime)
        const channel = new BroadcastChannel('saloon_notifications');
        channel.onmessage = (event) => {
            if (event.data && event.data.type === 'NEW_NOTIFICATION') {
                const notif = event.data.payload;
                const currentUserCode = (user as any)?.userCode || "ADM-000";

                // Check if this notification is for us
                // NOTE: We permit string 'ADM-000' matches or general broadcasts if we ever need them
                if (notif.user_code === currentUserCode) {
                    console.log("Received broadcast notification:", notif);

                    // Add to state
                    const mappedNotif: Notification = {
                        id: notif.id,
                        type: notif.type,
                        title: notif.title,
                        message: notif.message,
                        timestamp: new Date(notif.created_at),
                        isRead: false
                    };

                    setNotifications(prev => [mappedNotif, ...prev]);
                    // setUnreadCount is derived, no need to set it manually

                    // Show toast for immediate feedback
                    addToast(notif.message, notif.type);
                }
            }
        };

        return () => {
            clearInterval(intervalId);
            channel.close();
        };
    }, [loadNotifications, user]); // Dependencies


    // Create Notification (Send to DB)
    const addNotification = useCallback(async (data: Omit<Notification, 'id' | 'timestamp' | 'isRead'> & { targetUserCode?: string }) => {
        // If targetUserCode is provided, we send to DB.
        // If NOT provided, we assume "local simulation" for self (or we could default to self).
        // BUT logic requested is: Sender triggers notification for OTHERS.

        if (data.targetUserCode) {
            try {
                await notificationService.create({
                    ...data,
                    userCode: data.targetUserCode
                });
                // We do NOT add to local state immediately because it's for ANOTHER user.
                // Unless we are notifying ourselves?
            } catch (e) {
                console.error("Failed to create notification", e);
            }
        } else {
            // Fallback for local-only visual feedback (like currently implemented) 
            // OR error? For now, let's keep local behavior for self-feedback if needed,
            // but effectively we want "Real Notification System".
            // Let's assume if no target, it's for ME (local toast + DB for me).
            const myUserCode = (user as any)?.userCode || "ADM-000";
            try {
                await notificationService.create({
                    ...data,
                    userCode: myUserCode
                });
                // Optimistic update
                const newNotification: Notification = {
                    id: Math.random().toString(36).substring(2, 9),
                    timestamp: new Date(),
                    isRead: false,
                    ...data
                } as Notification;
                setNotifications((prev) => [newNotification, ...prev]);
            } catch (e) {
                console.error(e);
            }
        }

        // Trigger Toast regardless for immediate feedback if it's relevant to current user action context
        // Actually, if I notify someone else, *I* don't need a toast Notification, 
        // I might need a "Success" toast from the action itself (handled in page.tsx).
        // So we might remove the auto-toast here if we want strict separation, 
        // but let's leave it for "Self" notifications.

    }, [user]);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await notificationService.markAsRead(id);
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        // Optimistic
        setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
        try {
            const userCode = (user as any)?.userCode || "ADM-000";
            await notificationService.markAllAsRead(userCode);
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    }, [user]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
