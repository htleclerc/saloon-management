/**
 * PWA Update Prompt Component
 *
 * Affiche un prompt quand une nouvelle version de l'application est disponible.
 * Permet à l'utilisateur de mettre à jour immédiatement ou plus tard.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { UpdatePrompt } from '@/components/pwa';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <UpdatePrompt />
 *     </>
 *   );
 * }
 * ```
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface UpdatePromptProps {
  /** Callback après mise à jour */
  onUpdate?: () => void;
  /** Callback après rejet */
  onDismiss?: () => void;
  /** Textes personnalisés */
  texts?: {
    title?: string;
    description?: string;
    updateButton?: string;
    laterButton?: string;
  };
  /** Position (défaut: 'bottom') */
  position?: 'top' | 'bottom';
  /** Auto-update après X secondes (0 = désactivé) */
  autoUpdateDelay?: number;
  /** Classes CSS personnalisées */
  className?: string;
}

// ============================================================================
// HOOK: useServiceWorkerUpdate
// ============================================================================

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Récupérer l'enregistrement existant
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);

        // Vérifier si une mise à jour est en attente
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Écouter les nouvelles mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      }
    });

    // Écouter l'événement global de mise à jour
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    // Écouter quand le nouveau SW prend le contrôle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!registration?.waiting) return false;

    setIsUpdating(true);

    try {
      // Demander au SW en attente de prendre le contrôle
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      setIsUpdating(false);
      return false;
    }
  }, [registration]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
    dismissUpdate,
  };
}

// ============================================================================
// COMPONENT: UpdatePrompt
// ============================================================================

export function UpdatePrompt({
  onUpdate,
  onDismiss,
  texts = {},
  position = 'bottom',
  autoUpdateDelay = 0,
  className = '',
}: UpdatePromptProps) {
  const {
    updateAvailable,
    isUpdating,
    applyUpdate,
    dismissUpdate,
  } = useServiceWorkerUpdate();

  const {
    title = 'Mise à jour disponible',
    description = 'Une nouvelle version de l\'application est disponible.',
    updateButton = 'Mettre à jour',
    laterButton = 'Plus tard',
  } = texts;

  // Auto-update après délai si configuré
  useEffect(() => {
    if (!updateAvailable || autoUpdateDelay <= 0) return;

    const timer = setTimeout(() => {
      handleUpdate();
    }, autoUpdateDelay * 1000);

    return () => clearTimeout(timer);
  }, [updateAvailable, autoUpdateDelay]);

  const handleUpdate = async () => {
    const success = await applyUpdate();
    if (success) {
      onUpdate?.();
    }
  };

  const handleDismiss = () => {
    dismissUpdate();
    onDismiss?.();
  };

  if (!updateAvailable) return null;

  const positionClasses = position === 'top'
    ? 'top-4 left-4 right-4 md:left-auto md:right-4 md:w-96'
    : 'bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96';

  return (
    <div
      className={`fixed ${positionClasses} z-50 ${className}`}
      role="alertdialog"
      aria-labelledby="update-prompt-title"
      aria-describedby="update-prompt-description"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header avec icône */}
        <div className="flex items-start gap-3 p-4 pb-2">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="update-prompt-title"
              className="font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            <p
              id="update-prompt-description"
              className="text-sm text-gray-600 dark:text-gray-400 mt-0.5"
            >
              {description}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {laterButton}
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                Mise à jour...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                {updateButton}
              </>
            )}
          </button>
        </div>

        {/* Barre de progression pour auto-update */}
        {autoUpdateDelay > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all ease-linear"
              style={{
                animation: `shrink ${autoUpdateDelay}s linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* Animation CSS pour la barre de progression */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export default UpdatePrompt;
