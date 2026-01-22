import { useAuth } from '@/context/AuthProvider';

/**
 * Hook for managing read-only mode behavior
 * Used to disable actions when super admin is viewing a salon in read-only mode
 */
export function useReadOnlyMode() {
    const { isReadOnlyMode, isSuperAdmin } = useAuth();

    /**
     * Wraps a callback to prevent execution in read-only mode
     * Shows alert if user tries to perform action in read-only mode
     */
    const disableAction = (callback: () => void) => {
        if (isReadOnlyMode) {
            alert('❌ Action non autorisée en mode lecture seule.\n\nVous consultez ce salon en tant que Super Admin. Pour effectuer des modifications, demandez au propriétaire de vous ajouter comme administrateur.');
            return;
        }
        callback();
    };

    /**
     * Returns true if actions should be disabled (read-only mode active)
     */
    const isActionDisabled = isReadOnlyMode;

    /**
     * Returns true if buttons should be visually disabled
     */
    const getDisabledClass = (baseClass: string = '') => {
        return isReadOnlyMode
            ? `${baseClass} opacity-50 cursor-not-allowed`
            : baseClass;
    };

    return {
        isReadOnlyMode,
        disableAction,
        isActionDisabled,
        getDisabledClass,
    };
}
