/**
 * Storage Service
 * 
 * Handles file uploads and storage operations
 */

import { BaseService } from './BaseService';
import { StorageProviderFactory } from '../providers/StorageProviderFactory';
import { IStorageProvider } from '../providers/storage-types';

export class StorageService extends BaseService {
    private getStorageProvider(): IStorageProvider {
        const mode = (typeof window !== 'undefined' ? localStorage.getItem('saloon-data-mode') : 'demo-local') as any;
        return StorageProviderFactory.create(mode || 'demo-local');
    }

    async uploadImage(file: File, bucket: string = 'images', folder: string = 'uploads'): Promise<string> {
        const provider = this.getStorageProvider();

        // Generate a unique filename using crypto UUID
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().substring(0, 8)
            : `${timestamp}-${Math.floor(Math.random() * 10000)}`; // Fallback for older browsers
        const filename = `${folder}/${timestamp}-${uniqueId}.${extension}`;

        return provider.uploadFile(bucket, filename, file);
    }

    async deleteImage(path: string, bucket: string = 'images'): Promise<void> {
        const provider = this.getStorageProvider();
        return provider.deleteFile(bucket, path);
    }

    getPublicUrl(path: string, bucket: string = 'images'): string {
        const provider = this.getStorageProvider();
        return provider.getPublicUrl(bucket, path);
    }
}

export const storageService = new StorageService();
