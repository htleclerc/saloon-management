/**
 * PWA Install Prompt Component
 *
 * Affiche un prompt pour installer l'application comme PWA.
 * Gère automatiquement les différences entre Android, iOS et Desktop.
 *
 * @example
 * ```tsx
 * // app/layout.tsx ou composant principal
 * import { InstallPrompt } from '@/components/pwa';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <InstallPrompt
 *         delay={30000}
 *         onInstall={() => console.log('Installé !')}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  /** Délai avant affichage en ms (défaut: 30000 = 30s) */
  delay?: number;
  /** Jours avant de réafficher après rejet (défaut: 7) */
  dismissDuration?: number;
  /** Callback après installation réussie */
  onInstall?: () => void;
  /** Callback après fermeture/rejet */
  onDismiss?: () => void;
  /** Texte personnalisé */
  texts?: {
    title?: string;
    description?: string;
    installButton?: string;
    iosTitle?: string;
    iosStep1?: string;
    iosStep2?: string;
  };
  /** Classes CSS personnalisées */
  className?: string;
}

// ============================================================================
// HOOK: useInstallPrompt
// ============================================================================

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en mode standalone (installé)
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;

    if (isInStandalone) {
      setIsInstalled(true);
      setIsStandalone(true);
      return;
    }

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
      && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Sur iOS, on peut toujours proposer l'installation manuelle
    if (isIOSDevice) {
      setIsInstallable(true);
    }

    // Écouter l'événement beforeinstallprompt (Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Installation error:', error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isStandalone,
    promptInstall,
    canPrompt: deferredPrompt !== null,
  };
}

// ============================================================================
// COMPONENT: InstallPrompt
// ============================================================================

export function InstallPrompt({
  delay = 30000,
  dismissDuration = 7,
  onInstall,
  onDismiss,
  texts = {},
  className = '',
}: InstallPromptProps) {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
    canPrompt,
  } = useInstallPrompt();

  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    title = 'Installer l\'application',
    description = 'Accédez plus rapidement depuis votre écran d\'accueil',
    installButton = 'Installer',
    iosTitle = 'Installer l\'application',
    iosStep1 = 'Appuyez sur',
    iosStep2 = 'puis "Sur l\'écran d\'accueil"',
  } = texts;

  useEffect(() => {
    // Ne pas afficher si déjà installé ou déjà rejeté dans cette session
    if (isInstalled || dismissed) return;

    // Vérifier si déjà rejeté précédemment (localStorage)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = Date.now();
      const dismissMs = dismissDuration * 24 * 60 * 60 * 1000;

      if (now - dismissedTime < dismissMs) {
        return;
      }
    }

    // Afficher après le délai si installable
    const timer = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, delay, dismissed, dismissDuration]);

  const handleInstall = async () => {
    if (isIOS) {
      // Sur iOS, on ne peut que fermer le prompt
      handleDismiss();
      return;
    }

    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  // Ne rien afficher si pas nécessaire
  if (!showPrompt || isInstalled) return null;

  // Prompt iOS (instructions manuelles)
  if (isIOS) {
    return (
      <div
        className={`fixed bottom-0 inset-x-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 ${className}`}
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-labelledby="pwa-install-title"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="pwa-install-title"
              className="font-semibold text-gray-900 dark:text-white"
            >
              {iosTitle}
            </h3>

            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
                  1
                </span>
                {iosStep1}{' '}
                <Share className="w-5 h-5 text-blue-500 inline" aria-hidden="true" />
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
                  2
                </span>
                {iosStep2}{' '}
                <PlusSquare className="w-5 h-5 text-blue-500 inline" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prompt standard (Android/Desktop)
  return (
    <div
      className={`fixed bottom-0 inset-x-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 ${className}`}
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      role="dialog"
      aria-labelledby="pwa-install-title"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 pr-8">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id="pwa-install-title"
            className="font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {description}
          </p>
        </div>

        <button
          onClick={handleInstall}
          disabled={!canPrompt}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors touch-manipulation"
        >
          {installButton}
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
