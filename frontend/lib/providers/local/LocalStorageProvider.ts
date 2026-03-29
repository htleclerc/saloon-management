/**
 * LOCAL STORAGE PROVIDER
 * 
 * Mock implementation of IStorageProvider for local demo mode
 * Uses Data URIs for ephemeral persistence
 */

import { IStorageProvider } from '../storage-types';

export class LocalStorageProvider implements IStorageProvider {
    readonly mode = 'demo-local' as const;

    async uploadFile(bucket: string, path: string, file: File): Promise<string> {
        console.warn('LocalStorageProvider: File upload is simulated using Data URIs.');

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async deleteFile(bucket: string, path: string): Promise<void> {
        console.log(`LocalStorageProvider: Simulated delete for ${bucket}/${path}`);
    }

    getPublicUrl(bucket: string, path: string): string {
        // If it's already a full URL (data: or http:), return it
        if (path.startsWith('data:') || path.startsWith('http')) {
            return path;
        }

        // Otherwise, return a placeholder or the path itself
        return path;
    }
}
