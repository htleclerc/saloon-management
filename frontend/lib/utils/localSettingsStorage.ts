/**
 * Local Settings Storage
 *
 * Persists settings to localStorage keyed by salonId for multi-tenant isolation.
 * Used for settings that don't have a backend table (notifications, integrations, etc.)
 */

const PREFIX = 'workshop-settings';

export function getLocalSettings<T>(salonId: string, section: string, defaults: T): T {
    if (typeof window === 'undefined') return defaults;
    try {
        const stored = localStorage.getItem(`${PREFIX}-${salonId}-${section}`);
        if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch { /* ignore parse errors */ }
    return defaults;
}

export function saveLocalSettings<T>(salonId: string, section: string, data: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${PREFIX}-${salonId}-${section}`, JSON.stringify(data));
}

export function clearAllLocalSettings(): void {
    if (typeof window === 'undefined') return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${PREFIX}-`)) {
            localStorage.removeItem(key);
        }
    }
}

export function getLocalStorageSize(): string {
    if (typeof window === 'undefined') return '0 KB';
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) total += (key.length + (localStorage.getItem(key) || '').length) * 2; // UTF-16
    }
    if (total > 1024 * 1024) return `${(total / (1024 * 1024)).toFixed(1)} MB`;
    return `${(total / 1024).toFixed(1)} KB`;
}
