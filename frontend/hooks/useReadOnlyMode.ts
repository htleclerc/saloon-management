import { useAuth } from '@/context/AuthProvider';
import { useTranslation } from '@/i18n';
import { useToast } from '@/context/ToastProvider';

/**
 * Hook for managing read-only mode behavior
 * Used to disable actions when super admin is viewing a salon in read-only mode
 */
export function useReadOnlyMode() {
    const { isReadOnlyMode, isSuperAdmin } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();

    /**
     * Wraps a callback to prevent execution in read-only mode
     * Shows alert if user tries to perform action in read-only mode
     */
    const disableAction = (callback: () => void) => {
        if (isReadOnlyMode) {
            showToast(t("common.readOnlyTitle"), t("common.readOnlyMessage"), 'warning');
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
