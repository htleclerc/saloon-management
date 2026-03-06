'use client';

import { useDataMode } from '@/context/DataModeProvider';
import { useConfirm } from '@/context/ConfirmProvider';
import { DataMode } from '@/lib/providers/types';

export function ModeSwitcher() {
    const { mode, switchMode, isDemo } = useDataMode();
    const { confirm } = useConfirm();

    const handleModeChange = async (newMode: DataMode) => {
        if (newMode === mode) return;

        const isConfirmed = await confirm({
            title: 'Change Data Mode',
            message: `Switch to ${newMode} mode? The data source will change.`,
            confirmText: 'Yes, Switch',
            cancelText: 'Cancel',
            type: 'warning'
        });

        if (isConfirmed) {
            switchMode(newMode);
        }
    };

    return (
        <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium">Mode:</span>

            <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
            >
                {process.env.NODE_ENV !== 'production' && (
                    <option value="demo-local">Démo Local (Dev)</option>
                )}
                <option value="demo-supabase">Démo Cloud</option>
                <option value="normal">Mode Normal</option>
            </select>

            {isDemo && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                    🧪 Mode Démo Actif
                </span>
            )}
        </div>
    );
}
