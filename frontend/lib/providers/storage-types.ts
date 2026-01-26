/**
 * STORAGE PROVIDER ABSTRACTION LAYER
 * 
 * Interface for file storage operations
 */

export type StorageMode = 'demo-local' | 'demo-supabase' | 'normal';

export interface IStorageProvider {
    readonly mode: StorageMode;

    /**
     * Upload a file to storage
     * @param bucket - The storage bucket name (e.g., 'avatars', 'images')
     * @param path - The file path/name within the bucket
     * @param file - The file object to upload
     * @returns Promise resolving to the public URL of the uploaded file
     */
    uploadFile(bucket: string, path: string, file: File): Promise<string>;

    /**
     * Delete a file from storage
     * @param bucket - The storage bucket name
     * @param path - The file path/name within the bucket
     */
    deleteFile(bucket: string, path: string): Promise<void>;

    /**
     * Get the public URL for a file
     * @param bucket - The storage bucket name
     * @param path - The file path/name within the bucket
     */
    getPublicUrl(bucket: string, path: string): string;
}
