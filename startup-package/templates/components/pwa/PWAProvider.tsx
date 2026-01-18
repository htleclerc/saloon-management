/**
 * PWA Provider Component
 *
 * Provider central qui gère toutes les fonctionnalités PWA.
 * Inclut automatiquement tous les composants PWA nécessaires.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { PWAProvider } from '@/components/pwa';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PWAProvider
 *           installPromptDelay={30000}
 *           showUpdatePrompt
 *           showOfflineIndicator
 *         >
 *           {children}
 *         </PWAProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServiceWorkerRegistration, useServiceWorker } from './ServiceWorkerRegistration';
import { InstallPrompt, useInstallPrompt } from './InstallPrompt';
import { OfflineIndicator, useOnlineStatus } from './OfflineIndicator';
import { UpdatePrompt, useServiceWorkerUpdate } from './UpdatePrompt';

// ============================================================================
// TYPES
// ============================================================================

interface PWAConfig {
  /** PWA globalement activé */
  enabled: boolean;
  /** Prompt d'installation activé */
  installPromptEnabled: boolean;
  /** Indicateur hors-ligne activé */
  offlineIndicatorEnabled: boolean;
  /** Prompt de mise à jour activé */
  updatePromptEnabled: boolean;
}

interface PWAContextValue {
  /** Configuration PWA */
  config: PWAConfig;
  /** Mettre à jour la configuration */
  updateConfig: (updates: Partial<PWAConfig>) => void;
  /** État en ligne */
  isOnline: boolean;
  /** Application installée */
  isInstalled: boolean;
  /** Application installable */
  isInstallable: boolean;
  /** Mise à jour disponible */
  updateAvailable: boolean;
  /** Service Worker enregistré */
  isServiceWorkerRegistered: boolean;
  /** Déclencher l'installation */
  promptInstall: () => Promise<boolean>;
  /** Appliquer la mise à jour */
  applyUpdate: () => Promise<boolean>;
}

const defaultConfig: PWAConfig = {
  enabled: true,
  installPromptEnabled: true,
  offlineIndicatorEnabled: true,
  updatePromptEnabled: true,
};

const PWAContext = createContext<PWAContextValue | null>(null);

// ============================================================================
// STORAGE
// ============================================================================

const CONFIG_STORAGE_KEY = 'pwa-config';

function loadConfig(): PWAConfig {
  if (typeof window === 'undefined') return defaultConfig;

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch {
    // Ignorer les erreurs de parsing
  }

  return defaultConfig;
}

function saveConfig(config: PWAConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignorer les erreurs de stockage
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface PWAProviderProps {
  children: React.ReactNode;
  /** Configuration initiale */
  initialConfig?: Partial<PWAConfig>;
  /** Délai avant affichage du prompt d'installation (ms) */
  installPromptDelay?: number;
  /** Afficher l'indicateur hors-ligne */
  showOfflineIndicator?: boolean;
  /** Afficher le prompt de mise à jour */
  showUpdatePrompt?: boolean;
  /** Afficher le prompt d'installation */
  showInstallPrompt?: boolean;
  /** Position de l'indicateur hors-ligne */
  offlineIndicatorPosition?: 'top' | 'bottom';
  /** Callback après installation */
  onInstall?: () => void;
  /** Callback après mise à jour */
  onUpdate?: () => void;
}

export function PWAProvider({
  children,
  initialConfig,
  installPromptDelay = 30000,
  showOfflineIndicator = true,
  showUpdatePrompt = true,
  showInstallPrompt = true,
  offlineIndicatorPosition = 'top',
  onInstall,
  onUpdate,
}: PWAProviderProps) {
  // État de la configuration
  const [config, setConfig] = useState<PWAConfig>(() => ({
    ...loadConfig(),
    ...initialConfig,
  }));

  // Hooks PWA
  const { isOnline } = useOnlineStatus();
  const { isInstalled, isInstallable, promptInstall } = useInstallPrompt();
  const { isRegistered } = useServiceWorker();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  // Persister la configuration
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((updates: Partial<PWAConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Valeur du contexte
  const contextValue: PWAContextValue = {
    config,
    updateConfig,
    isOnline,
    isInstalled,
    isInstallable,
    updateAvailable,
    isServiceWorkerRegistered: isRegistered,
    promptInstall,
    applyUpdate,
  };

  // Vérifier si PWA est activé
  const isPWAEnabled = config.enabled &&
    process.env.NEXT_PUBLIC_PWA_ENABLED !== 'false';

  return (
    <PWAContext.Provider value={contextValue}>
      {children}

      {/* Service Worker Registration */}
      {isPWAEnabled && <ServiceWorkerRegistration />}

      {/* Offline Indicator */}
      {isPWAEnabled && showOfflineIndicator && config.offlineIndicatorEnabled && (
        <OfflineIndicator position={offlineIndicatorPosition} />
      )}

      {/* Install Prompt */}
      {isPWAEnabled && showInstallPrompt && config.installPromptEnabled && (
        <InstallPrompt
          delay={installPromptDelay}
          onInstall={onInstall}
        />
      )}

      {/* Update Prompt */}
      {isPWAEnabled && showUpdatePrompt && config.updatePromptEnabled && (
        <UpdatePrompt onUpdate={onUpdate} />
      )}
    </PWAContext.Provider>
  );
}

// ============================================================================
// HOOK: usePWA
// ============================================================================

/**
 * Hook pour accéder au contexte PWA
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, isInstalled, promptInstall } = usePWA();
 *
 *   return (
 *     <div>
 *       {isOnline ? 'En ligne' : 'Hors ligne'}
 *       {!isInstalled && (
 *         <button onClick={promptInstall}>Installer</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePWA(): PWAContextValue {
  const context = useContext(PWAContext);

  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }

  return context;
}

// ============================================================================
// COMPONENT: PWASettings
// ============================================================================

interface PWASettingsProps {
  className?: string;
}

/**
 * Composant de paramètres PWA prêt à l'emploi
 */
export function PWASettings({ className = '' }: PWASettingsProps) {
  const {
    config,
    updateConfig,
    isOnline,
    isInstalled,
    isInstallable,
    updateAvailable,
    isServiceWorkerRegistered,
    promptInstall,
    applyUpdate,
  } = usePWA();

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Paramètres PWA</h3>

      {/* État */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Connexion</span>
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Service Worker</span>
          <span className={isServiceWorkerRegistered ? 'text-green-600' : 'text-amber-600'}>
            {isServiceWorkerRegistered ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Installation</span>
          <span className={isInstalled ? 'text-green-600' : 'text-gray-600'}>
            {isInstalled ? 'Installée' : isInstallable ? 'Disponible' : 'Non disponible'}
          </span>
        </div>
        {updateAvailable && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Mise à jour</span>
            <button
              onClick={applyUpdate}
              className="text-blue-600 hover:underline"
            >
              Disponible - Mettre à jour
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <ToggleOption
          label="Mode PWA"
          description="Activer les fonctionnalités PWA"
          checked={config.enabled}
          onChange={(enabled) => updateConfig({ enabled })}
        />
        <ToggleOption
          label="Prompt d'installation"
          description="Proposer l'installation de l'application"
          checked={config.installPromptEnabled}
          onChange={(enabled) => updateConfig({ installPromptEnabled: enabled })}
          disabled={!config.enabled}
        />
        <ToggleOption
          label="Indicateur hors-ligne"
          description="Afficher l'état de connexion"
          checked={config.offlineIndicatorEnabled}
          onChange={(enabled) => updateConfig({ offlineIndicatorEnabled: enabled })}
          disabled={!config.enabled}
        />
        <ToggleOption
          label="Notifications de mise à jour"
          description="Afficher les mises à jour disponibles"
          checked={config.updatePromptEnabled}
          onChange={(enabled) => updateConfig({ updatePromptEnabled: enabled })}
          disabled={!config.enabled}
        />
      </div>

      {/* Actions */}
      {isInstallable && !isInstalled && (
        <button
          onClick={promptInstall}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Installer l'application
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleOptionProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked
            ? 'bg-blue-600'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default PWAProvider;
