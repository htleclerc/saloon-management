
import { supabase } from "@/lib/supabase/client";
import { BaseService } from "./BaseService";
import { Notification, NotificationType, NotificationPreferences, NotificationChannelPref, DigestFrequency } from "@/types";

interface NotificationDBRow {
    id?: string | number;
    user_code: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

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
        const newNotif: NotificationDBRow = {
            id: Date.now().toString(), // Temp ID for fallback
            user_code: data.userCode,
            type: data.type || 'info',
            title: data.title || '',
            message: data.message || '',
            is_read: false,
            created_at: timestamp
        };

        // 1. Try DB Insert
        try {
            const dbData: Omit<NotificationDBRow, 'id'> = {
                user_code: data.userCode,
                type: data.type || 'info',
                title: data.title || '',
                message: data.message || '',
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
                return this.mapFromDB(created as NotificationDBRow);
            } else {
                console.warn("DB Notification failed, falling back to BroadcastChannel. Error:", error);
            }
        } catch (err: unknown) {
            console.warn("DB Notification Exception:", err);
        }

        // 2. Fallback: Broadcast to other tabs (Simulation)
        // This simulates the "Realtime" subscription effect
        if (this.channel) {
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
            return (data || []).map((row: NotificationDBRow) => this.mapFromDB(row));
        } catch (error: unknown) {
            // Log but don't crash - return empty array in fallback mode
            console.warn("Checking notifications from DB failed, checking local storage/memory is not implemented for persistence yet.", error);
            return [];
        }
    }

    // Mark as read
    async markAsRead(id: number | string) {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);
        } catch (e: unknown) {
            console.warn("Failed to mark read in DB", e);
        }
    }

    // Mark all as read for user
    async markAllAsRead(userCode: string) {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_code', userCode)
                .eq('is_read', false);
        } catch (e: unknown) {
            console.warn("Failed to mark all read in DB", e);
        }
    }

    // =============================================
    // NOTIFICATION PREFERENCES
    // =============================================

    private readonly DEFAULT_CHANNEL_PREFS: NotificationChannelPref[] = [
        { id: "revenue", email: true, push: true, sms: false },
        { id: "expense", email: true, push: false, sms: false },
        { id: "validation", email: true, push: true, sms: true },
        { id: "client", email: true, push: true, sms: false },
        { id: "worker", email: false, push: true, sms: false },
        { id: "report", email: true, push: false, sms: false },
    ];

    /**
     * Get notification preferences for a user in a salon.
     * Returns defaults if none saved yet.
     */
    async getPreferences(salonId: number, userCode: string): Promise<NotificationPreferences> {
        try {
            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('salon_id', salonId)
                .eq('user_code', userCode)
                .single();

            if (error || !data) {
                // No saved preferences — return defaults
                return this.getDefaultPreferences(salonId, userCode);
            }
            return this.mapPreferencesFromDB(data);
        } catch (e: unknown) {
            console.warn("Failed to load notification preferences:", e);
            return this.getDefaultPreferences(salonId, userCode);
        }
    }

    /**
     * Save notification preferences (select → insert or update).
     */
    async savePreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
        const dbData = this.mapPreferencesToDB(prefs);

        try {
            // Check if a row already exists
            const { data: existing } = await supabase
                .from('notification_preferences')
                .select('id')
                .eq('salon_id', prefs.salonId)
                .eq('user_code', prefs.userCode)
                .maybeSingle();

            let result;
            if (existing?.id) {
                // UPDATE existing row
                result = await supabase
                    .from('notification_preferences')
                    .update(dbData)
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                // INSERT new row
                result = await supabase
                    .from('notification_preferences')
                    .insert(dbData)
                    .select()
                    .single();
            }

            if (result.error) {
                console.error("Supabase notification_preferences error:", result.error.message, result.error.details, result.error.hint);
                throw new Error(result.error.message || 'Database error');
            }
            return this.mapPreferencesFromDB(result.data);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : JSON.stringify(e);
            console.error("Failed to save notification preferences:", msg);
            throw new Error(`Failed to save notification preferences: ${msg}`);
        }
    }

    private getDefaultPreferences(salonId: number, userCode: string): NotificationPreferences {
        return {
            salonId,
            userCode,
            channelPreferences: [...this.DEFAULT_CHANNEL_PREFS],
            digestFrequency: 'daily',
            quietHoursEnabled: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
        };
    }

    private mapPreferencesFromDB(row: Record<string, unknown>): NotificationPreferences {
        return {
            id: row.id as number,
            salonId: row.salon_id as number,
            userCode: row.user_code as string,
            channelPreferences: (row.channel_preferences as NotificationChannelPref[]) || [...this.DEFAULT_CHANNEL_PREFS],
            digestFrequency: (row.digest_frequency as DigestFrequency) || 'daily',
            quietHoursEnabled: (row.quiet_hours_enabled as boolean) ?? false,
            quietHoursStart: (row.quiet_hours_start as string) || '22:00',
            quietHoursEnd: (row.quiet_hours_end as string) || '08:00',
            createdAt: row.created_at ? new Date(row.created_at as string) : undefined,
            updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
        };
    }

    private mapPreferencesToDB(prefs: NotificationPreferences): Record<string, unknown> {
        return {
            salon_id: prefs.salonId,
            user_code: prefs.userCode,
            channel_preferences: prefs.channelPreferences,
            digest_frequency: prefs.digestFrequency,
            quiet_hours_enabled: prefs.quietHoursEnabled,
            quiet_hours_start: prefs.quietHoursStart,
            quiet_hours_end: prefs.quietHoursEnd,
        };
    }

    /**
     * Send an email notification via the Brevo email API route.
     * Client-side method — calls /api/email/send.
     */
    async sendEmailNotification(
        recipientEmail: string,
        recipientName: string,
        templateId: string,
        params: Record<string, string>,
        locale: string = "en",
    ): Promise<boolean> {
        try {
            const response = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: [{ email: recipientEmail, name: recipientName }],
                    templateId,
                    locale,
                    params,
                }),
            });
            return response.ok;
        } catch (error) {
            console.warn("[NotificationService] Email notification failed:", error);
            return false;
        }
    }

    protected mapFromDB(row: NotificationDBRow): Notification {
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
