/**
 * Service Worker Registration Component
 *
 * Enregistre le Service Worker et gère les mises à jour.
 * À inclure dans le layout principal de l'application.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { ServiceWorkerRegistration } from '@/components/pwa';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ServiceWorkerRegistration />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationProps {
  /** Chemin vers le Service Worker */
  swPath?: string;
  /** Callback quand une mise à jour est disponible */
  onUpdateAvailable?: () => void;
  /** Callback quand le SW est enregistré avec succès */
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  /** Callback en cas d'erreur */
  onError?: (error: Error) => void;
}

export function ServiceWorkerRegistration({
  swPath = '/sw.js',
  onUpdateAvailable,
  onRegistered,
  onError,
}: ServiceWorkerRegistrationProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Vérifier si PWA est activé
    const isPWAEnabled = process.env.NEXT_PUBLIC_PWA_ENABLED !== 'false';
    if (!isPWAEnabled) return;

    // Vérifier le support Service Worker
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swPath, {
          scope: '/',
        });

        console.log('[SW] Registered with scope:', registration.scope);
        onRegistered?.(registration);

        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Nouvelle version disponible
              console.log('[SW] Update available');
              setUpdateAvailable(true);
              onUpdateAvailable?.();

              // Émettre un événement global
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        });

        // Vérifier périodiquement les mises à jour (toutes les heures)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[SW] Registration failed:', error);
        onError?.(error as Error);
      }
    };

    // Enregistrer après le chargement complet
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, [swPath, onUpdateAvailable, onRegistered, onError]);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Hook pour vérifier l'état du Service Worker
 */
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Récupérer l'enregistrement existant
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setIsRegistered(true);
        setRegistration(reg);
      }
    });

    // Écouter les événements de mise à jour
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const skipWaiting = async () => {
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  const unregister = async () => {
    if (!registration) return false;

    const success = await registration.unregister();
    if (success) {
      setIsRegistered(false);
      setRegistration(null);
    }
    return success;
  };

  return {
    isRegistered,
    registration,
    updateAvailable,
    skipWaiting,
    unregister,
  };
}

export default ServiceWorkerRegistration;
