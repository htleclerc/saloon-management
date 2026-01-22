import { useAuth } from '@/context/AuthProvider';
import { ReactNode, MouseEvent } from 'react';

/**
 * HOC Component that wraps children and blocks all interactions in read-only mode
 * Use this to wrap forms, buttons, or any interactive elements
 */
interface ReadOnlyGuardProps {
    children: ReactNode;
    showOverlay?: boolean;
}

export function ReadOnlyGuard({ children, showOverlay = true }: ReadOnlyGuardProps) {
    const { isReadOnlyMode } = useAuth();

    const handleClick = (e: MouseEvent) => {
        if (isReadOnlyMode) {
            e.preventDefault();
            e.stopPropagation();
            alert('❌ Action non autorisée en mode lecture seule.\n\nVous consultez ce salon en tant que Super Admin sans droits de modification. Pour effectuer des actions, demandez au propriétaire de vous ajouter comme administrateur.');
        }
    };

    if (isReadOnlyMode) {
        return (
            <div className="relative">
                {/* Overlay that blocks all interactions */}
                {showOverlay && (
                    <div
                        className="absolute inset-0 bg-gray-100/50 z-10 cursor-not-allowed"
                        onClick={handleClick}
                        title="Action non autorisée en mode lecture seule"
                    />
                )}
                {/* Content with pointer-events disabled */}
                <div className="pointer-events-none opacity-60">
                    {children}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Hook version for conditional rendering
 */
export function useReadOnlyGuard() {
    const { isReadOnlyMode } = useAuth();

    const blockAction = (callback: () => void) => {
        if (isReadOnlyMode) {
            alert('❌ Action non autorisée en mode lecture seule.\n\nVous consultez ce salon en tant que Super Admin sans droits de modification. Pour effectuer des actions, demandez au propriétaire de vous ajouter comme administrateur.');
            return;
        }
        callback();
    };

    const handleReadOnlyClick = () => {
        if (isReadOnlyMode) {
            alert('❌ Action non autorisée en mode lecture seule.\n\nVous consultez ce salon en tant que Super Admin sans droits de modification. Pour effectuer des actions, demandez au propriétaire de vous ajouter comme administrateur.');
            return true;
        }
        return false;
    };

    const getButtonProps = () => {
        if (isReadOnlyMode) {
            return {
                disabled: true,
                className: 'cursor-not-allowed opacity-50',
                title: 'Action non autorisée en mode lecture seule'
            };
        }
        return {};
    };

    return {
        isReadOnly: isReadOnlyMode,
        blockAction,
        handleReadOnlyClick,
        getButtonProps,
    };
}
