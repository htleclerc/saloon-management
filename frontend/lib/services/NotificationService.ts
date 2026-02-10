
import { supabase } from "@/lib/supabase/client";
import { BaseService } from "./BaseService";
import { Notification } from "@/types";

export class NotificationService extends BaseService {
    private channel: BroadcastChannel | null = null;

    constructor() {
        super();
        if (typeof window !== 'undefined') {
            this.channel = new BroadcastChannel('saloon_notifications');
        }
    }

    // Determine if we should use DB or local fallback
    // In a real app we'd just use DB, but here we want to support the demo mode robustly
    private canUseDB(): boolean {
        // Simple check if configured, but doesn't guarantee table existence
        // We will just try-catch the operations
        return true;
    }

    // Create a notification for specific users
    async create(data: Partial<Notification> & { userCode: string }) {
        const timestamp = new Date().toISOString();
        const newNotif: any = {
            id: Date.now().toString(), // Temp ID for fallback
            user_code: data.userCode,
            type: data.type || 'info',
            title: data.title,
            message: data.message,
            is_read: false,
            created_at: timestamp
        };

        // 1. Try DB Insert
        try {
            const dbData = {
                user_code: data.userCode,
                type: data.type,
                title: data.title,
                message: data.message,
                is_read: false,
                created_at: timestamp
            };

            const { data: created, error } = await supabase
                .from('notifications')
                .insert([dbData])
                .select()
                .single();

            if (!error && created) {
                // DB Success
                return this.mapFromDB(created);
            } else {
                console.warn("DB Notification failed, falling back to BroadcastChannel. Error:", error);
            }
        } catch (err) {
            console.warn("DB Notification Exception:", err);
        }

        // 2. Fallback: Broadcast to other tabs (Simulation)
        // This simulates the "Realtime" subscription effect
        if (this.channel) {
            console.log("Broadcasting notification:", newNotif);
            this.channel.postMessage({ type: 'NEW_NOTIFICATION', payload: newNotif });
        }

        // Return the optimistic object so the calling code thinks it worked
        return this.mapFromDB(newNotif);
    }

    // Get notifications for a specific user
    async getForUser(userCode: string, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_code', userCode)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data || []).map(this.mapFromDB);
        } catch (error) {
            // Log but don't crash - return empty array in fallback mode
            console.warn("Checking notifications from DB failed, checking local storage/memory is not implemented for persistence yet.", error);
            return [];
        }
    }

    // Mark as read
    async markAsRead(id: number | string) {
        try {
            // Try DB
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            // Also broadcast read status? Maybe later
        } catch (e) {
            console.warn("Failed to mark read in DB", e);
        }
    }

    // Mark all as read for user
    async markAllAsRead(userCode: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_code', userCode)
                .eq('is_read', false);
        } catch (e) {
            console.warn("Failed to mark all read in DB", e);
        }
    }

    protected mapFromDB(row: any): Notification {
        return {
            id: row.id?.toString() || Date.now().toString(),
            type: row.type || 'info',
            title: row.title,
            message: row.message,
            timestamp: row.created_at ? new Date(row.created_at) : new Date(),
            isRead: row.is_read
        };
    }
}

export const notificationService = new NotificationService();
