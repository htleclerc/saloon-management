/**
 * Offline Indicator Component
 *
 * Affiche un indicateur quand l'utilisateur est hors-ligne
 * et un message de reconnexion quand il revient en ligne.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { OfflineIndicator } from '@/components/pwa';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <OfflineIndicator />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface OfflineIndicatorProps {
  /** Durée d'affichage du message de reconnexion en ms (défaut: 3000) */
  reconnectedDuration?: number;
  /** Afficher le bouton de rechargement (défaut: true) */
  showReloadButton?: boolean;
  /** Textes personnalisés */
  texts?: {
    offline?: string;
    reconnected?: string;
    reload?: string;
  };
  /** Position (défaut: 'top') */
  position?: 'top' | 'bottom';
  /** Classes CSS personnalisées */
  className?: string;
}

interface OnlineStatusOptions {
  /** URL pour vérifier la vraie connectivité */
  pingUrl?: string;
  /** Intervalle de vérification en ms */
  pingInterval?: number;
}

// ============================================================================
// HOOK: useOnlineStatus
// ============================================================================

export function useOnlineStatus(options: OnlineStatusOptions = {}) {
  const {
    pingUrl,
    pingInterval = 30000,
  } = options;

  const [isOnline, setIsOnline] = useState(true);
  const [isActuallyOnline, setIsActuallyOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  // Vérifier la vraie connectivité (pas seulement navigator.onLine)
  const checkConnectivity = useCallback(async () => {
    if (!pingUrl) {
      setIsActuallyOnline(navigator.onLine);
      return navigator.onLine;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsActuallyOnline(response.ok);
      return response.ok;
    } catch {
      setIsActuallyOnline(false);
      return false;
    }
  }, [pingUrl]);

  useEffect(() => {
    // État initial
    setIsOnline(navigator.onLine);
    setIsActuallyOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      checkConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsActuallyOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérification périodique si pingUrl fourni
    let interval: NodeJS.Timeout | null = null;
    if (pingUrl) {
      checkConnectivity();
      interval = setInterval(checkConnectivity, pingInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (interval) clearInterval(interval);
    };
  }, [checkConnectivity, pingInterval, pingUrl]);

  const clearWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  return {
    /** État basé sur navigator.onLine */
    isOnline,
    /** État basé sur le ping réel (si pingUrl fourni) */
    isActuallyOnline,
    /** L'utilisateur était hors-ligne et vient de revenir */
    wasOffline,
    /** Réinitialiser wasOffline */
    clearWasOffline,
    /** Forcer une vérification */
    checkConnectivity,
  };
}

// ============================================================================
// COMPONENT: OfflineIndicator
// ============================================================================

export function OfflineIndicator({
  reconnectedDuration = 3000,
  showReloadButton = true,
  texts = {},
  position = 'top',
  className = '',
}: OfflineIndicatorProps) {
  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  const {
    offline = 'Vous êtes hors-ligne',
    reconnected = 'Connexion rétablie',
    reload = 'Recharger',
  } = texts;

  // Gérer l'affichage du message de reconnexion
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);

      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, reconnectedDuration);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, reconnectedDuration, clearWasOffline]);

  // Ne rien afficher si en ligne et pas de message de reconnexion
  if (isOnline && !showReconnected) return null;

  const positionClasses = position === 'top'
    ? 'top-0 safe-area-inset-top'
    : 'bottom-0 safe-area-inset-bottom';

  return (
    <div
      className={`fixed inset-x-0 z-50 ${positionClasses} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center justify-center gap-2 py-2 px-4 text-white text-sm font-medium transition-colors ${
          isOnline
            ? 'bg-green-500 dark:bg-green-600'
            : 'bg-amber-500 dark:bg-amber-600'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" aria-hidden="true" />
            <span>{reconnected}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" aria-hidden="true" />
            <span>{offline}</span>
            {showReloadButton && (
              <button
                onClick={() => window.location.reload()}
                className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                {reload}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: OfflineFallback
// ============================================================================

interface OfflineFallbackProps {
  /** Contenu à afficher quand en ligne */
  children: React.ReactNode;
  /** Contenu de fallback quand hors-ligne */
  fallback?: React.ReactNode;
}

/**
 * Composant qui affiche un fallback quand l'utilisateur est hors-ligne
 */
export function OfflineFallback({ children, fallback }: OfflineFallbackProps) {
  const { isOnline } = useOnlineStatus();

  if (!isOnline && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default OfflineIndicator;
