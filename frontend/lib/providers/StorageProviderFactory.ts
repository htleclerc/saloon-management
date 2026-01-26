/**
 * Storage Provider Factory
 */

import { IStorageProvider, StorageMode } from './storage-types';
import { SupabaseStorageProvider } from './supabase/SupabaseStorageProvider';
import { LocalStorageProvider } from './local/LocalStorageProvider';

export class StorageProviderFactory {
    private static instance: IStorageProvider | null = null;

    static create(mode: StorageMode): IStorageProvider {
        // Singleton pattern
        if (this.instance && this.instance.mode === mode) {
            return this.instance;
        }

        switch (mode) {
            case 'demo-local': {
                this.instance = new LocalStorageProvider();
                return this.instance!;
            }

            case 'demo-supabase': {
                this.instance = new SupabaseStorageProvider();
                return this.instance!;
            }

            case 'normal': {
                throw new Error('APIStorageProvider not yet implemented');
            }

            default:
                throw new Error(`Unknown storage mode: ${mode}`);
        }
    }

    static reset(): void {
        this.instance = null;
    }
}
