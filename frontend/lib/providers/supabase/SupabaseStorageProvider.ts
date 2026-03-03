/**
 * SUPABASE STORAGE PROVIDER
 * 
 * Implementation of IStorageProvider for Supabase Storage
 */

import { IStorageProvider } from '../storage-types';
import { supabase } from '@/lib/supabase/client';

export class SupabaseStorageProvider implements IStorageProvider {
    readonly mode = 'demo-supabase' as const;

    async uploadFile(bucket: string, path: string, file: File): Promise<string> {
        // Clean path to remove any leading slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(cleanPath, file, {
                upsert: true,
                contentType: file.type
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        return this.getPublicUrl(bucket, cleanPath);
    }

    async deleteFile(bucket: string, path: string): Promise<void> {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }

    getPublicUrl(bucket: string, path: string): string {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
}
