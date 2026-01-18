/**
 * PWA Components - Index
 *
 * Composants et hooks pour les Progressive Web Apps.
 *
 * @example
 * ```tsx
 * // Utilisation complète avec PWAProvider
 * import { PWAProvider, usePWA, PWASettings } from '@/components/pwa';
 *
 * // Dans app/layout.tsx
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
 *
 * // Dans un composant
 * function MyComponent() {
 *   const { isOnline, isInstalled, promptInstall } = usePWA();
 *   // ...
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Utilisation individuelle des composants
 * import {
 *   InstallPrompt,
 *   OfflineIndicator,
 *   UpdatePrompt,
 *   ServiceWorkerRegistration,
 * } from '@/components/pwa';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <ServiceWorkerRegistration />
 *       <OfflineIndicator position="top" />
 *       {children}
 *       <InstallPrompt delay={30000} />
 *       <UpdatePrompt />
 *     </>
 *   );
 * }
 * ```
 */

// Provider et hook principal
export {
  PWAProvider,
  usePWA,
  PWASettings,
} from './PWAProvider';

// Service Worker
export {
  ServiceWorkerRegistration,
  useServiceWorker,
} from './ServiceWorkerRegistration';

// Installation
export {
  InstallPrompt,
  useInstallPrompt,
} from './InstallPrompt';

// Hors-ligne
export {
  OfflineIndicator,
  OfflineFallback,
  useOnlineStatus,
} from './OfflineIndicator';

// Mise à jour
export {
  UpdatePrompt,
  useServiceWorkerUpdate,
} from './UpdatePrompt';

// Types (re-export pour utilisation externe)
export type { } from './PWAProvider';
