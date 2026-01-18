# Guide PWA (Progressive Web App)

> Guide complet pour transformer votre application en PWA installable et fonctionnelle hors-ligne

---

## Table des Matières

1. [Introduction aux PWA](#introduction-aux-pwa)
2. [Configuration Next.js](#configuration-nextjs)
3. [Manifest.json](#manifestjson)
4. [Service Worker](#service-worker)
5. [Stratégies de Cache](#stratégies-de-cache)
6. [Installation (A2HS)](#installation-a2hs)
7. [Mode Hors-ligne](#mode-hors-ligne)
8. [Notifications Push](#notifications-push)
9. [Synchronisation en Arrière-plan](#synchronisation-en-arrière-plan)
10. [Configuration Activable/Désactivable](#configuration-activabledésactivable)
11. [Icônes et Splash Screens](#icônes-et-splash-screens)
12. [Debug et Testing](#debug-et-testing)
13. [Checklist PWA](#checklist-pwa)

---

## Introduction aux PWA

### Qu'est-ce qu'une PWA ?

Une Progressive Web App est une application web qui :
- **S'installe** sur l'écran d'accueil comme une app native
- **Fonctionne hors-ligne** grâce au Service Worker
- **Se met à jour** automatiquement
- **Envoie des notifications** push
- **Est sécurisée** (HTTPS obligatoire)

### Critères PWA (Lighthouse)

| Critère | Requis |
|---------|--------|
| HTTPS | Oui |
| Manifest valide | Oui |
| Service Worker | Oui |
| Icône 192x192 | Oui |
| Icône 512x512 | Oui |
| Start URL | Oui |
| Splash screen | Recommandé |
| Orientation | Recommandé |

### Statistiques

- **68%** des utilisateurs installent une PWA s'ils l'utilisent régulièrement
- **3x** plus de conversions avec une PWA installée
- **50%** de réduction du taux de rebond

---

## Configuration Next.js

### Installation

```bash
# Package recommandé pour Next.js 14+
npm install @ducanh2912/next-pwa

# Ou avec next-pwa classique (moins maintenu)
npm install next-pwa
```

### Configuration next.config.js

```javascript
// next.config.js
const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vos configurations Next.js existantes
  reactStrictMode: true,
};

// Configuration PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactivé en dev par défaut

  // Stratégies de cache personnalisées
  runtimeCaching: [
    {
      // Cache API calls
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 heures
        },
      },
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Cache fonts
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
        },
      },
    },
    {
      // Cache CSS/JS
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
  ],
};

module.exports = withPWA(pwaConfig)(nextConfig);
```

### Configuration avec Variable d'Environnement

```javascript
// next.config.js - PWA activable/désactivable
const withPWA = require('@ducanh2912/next-pwa').default;

const isPWAEnabled = process.env.NEXT_PUBLIC_PWA_ENABLED === 'true';
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
};

const pwaConfig = {
  dest: 'public',
  register: isPWAEnabled,
  skipWaiting: true,
  disable: isDev || !isPWAEnabled,
  // ... reste de la config
};

module.exports = isPWAEnabled
  ? withPWA(pwaConfig)(nextConfig)
  : nextConfig;
```

```env
# .env.local
NEXT_PUBLIC_PWA_ENABLED=true
```

---

## Manifest.json

### Configuration Complète

```json
// public/manifest.json
{
  "name": "Mon Application",
  "short_name": "MonApp",
  "description": "Description de mon application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "fr-FR",
  "dir": "ltr",
  "categories": ["business", "productivity"],

  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],

  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Écran d'accueil"
    },
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Écran d'accueil desktop"
    }
  ],

  "shortcuts": [
    {
      "name": "Nouveau Rendez-vous",
      "short_name": "Nouveau RDV",
      "description": "Créer un nouveau rendez-vous",
      "url": "/appointments/new",
      "icons": [
        {
          "src": "/icons/shortcut-appointment.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Voir le tableau de bord",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/icons/shortcut-dashboard.png",
          "sizes": "192x192"
        }
      ]
    }
  ],

  "related_applications": [],
  "prefer_related_applications": false
}
```

### Lien dans le HTML

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Mon Application',
  description: 'Description de mon application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MonApp',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Pour un comportement plus app-like
  viewportFit: 'cover', // Pour les écrans avec encoche
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* Apple Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        {/* Ajoutez d'autres tailles selon les appareils cibles */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Service Worker

### Service Worker Personnalisé

```typescript
// public/sw.js (généré automatiquement par next-pwa)
// Mais vous pouvez le personnaliser :

// sw-custom.js - à merger avec le SW généré
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(clients.claim());
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Récupérer les données en attente depuis IndexedDB
  // et les envoyer au serveur
  const pendingData = await getPendingData();

  for (const item of pendingData) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      await removePendingData(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

### Enregistrement du Service Worker

```tsx
// components/pwa/ServiceWorkerRegistration.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NEXT_PUBLIC_PWA_ENABLED === 'true'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  dispatchEvent(new CustomEvent('sw-update-available'));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

---

## Stratégies de Cache

### Les 5 Stratégies Principales

```typescript
// lib/pwa/cache-strategies.ts

/**
 * 1. Cache First (Cache, falling back to Network)
 * - Idéal pour : Assets statiques (images, fonts, CSS)
 * - Avantage : Très rapide
 * - Inconvénient : Peut servir du contenu obsolète
 */
export const cacheFirst = {
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'static-assets',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
    },
  },
};

/**
 * 2. Network First (Network, falling back to Cache)
 * - Idéal pour : Données API, contenu dynamique
 * - Avantage : Toujours à jour si réseau disponible
 * - Inconvénient : Plus lent si réseau lent
 */
export const networkFirst = {
  urlPattern: /^https:\/\/api\./,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10, // Fallback sur cache si > 10s
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24, // 24 heures
    },
  },
};

/**
 * 3. Stale While Revalidate
 * - Idéal pour : Ressources qui changent peu souvent
 * - Avantage : Rapide + mise à jour en arrière-plan
 * - Inconvénient : Peut montrer du contenu légèrement obsolète
 */
export const staleWhileRevalidate = {
  urlPattern: /\.(?:js|css)$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'runtime-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
    },
  },
};

/**
 * 4. Network Only
 * - Idéal pour : Données sensibles, analytics
 * - Avantage : Toujours frais
 * - Inconvénient : Ne fonctionne pas hors-ligne
 */
export const networkOnly = {
  urlPattern: /\/api\/(auth|payment)/,
  handler: 'NetworkOnly',
};

/**
 * 5. Cache Only
 * - Idéal pour : Assets précachés qui ne changent jamais
 * - Avantage : Très rapide
 * - Inconvénient : Doit être mis à jour via le SW
 */
export const cacheOnly = {
  urlPattern: /\/precached\//,
  handler: 'CacheOnly',
};
```

### Configuration Complète des Stratégies

```javascript
// next.config.js
const runtimeCaching = [
  // Pages HTML - Network First
  {
    urlPattern: /^https:\/\/.*\.html$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'html-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24h
      },
    },
  },

  // API calls - Network First avec timeout
  {
    urlPattern: /\/api\//,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1h
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  // Images - Cache First
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
      },
    },
  },

  // Fonts - Cache First (longue durée)
  {
    urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'font-cache',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
      },
    },
  },

  // JS/CSS - Stale While Revalidate
  {
    urlPattern: /\.(?:js|css)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
      },
    },
  },

  // Google Fonts - Stale While Revalidate
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
      },
    },
  },
];
```

---

## Installation (A2HS)

### Hook d'Installation

```tsx
// hooks/pwa/useInstallPrompt.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
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

  const promptInstall = useCallback(async () => {
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
      console.error('Installation error:', error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
```

### Composant de Prompt d'Installation

```tsx
// components/pwa/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { useInstallPrompt } from '@/hooks/pwa/useInstallPrompt';
import { X, Download, Share, PlusSquare } from 'lucide-react';

interface InstallPromptProps {
  /** Délai avant affichage (ms) */
  delay?: number;
  /** Callback après installation */
  onInstall?: () => void;
  /** Callback après fermeture */
  onDismiss?: () => void;
}

export function InstallPrompt({
  delay = 30000, // 30 secondes par défaut
  onInstall,
  onDismiss,
}: InstallPromptProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé ou déjà rejeté
    if (isInstalled || dismissed) return;

    // Vérifier si déjà rejeté précédemment
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = Date.now();
      // Ne pas réafficher pendant 7 jours
      if (now - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Afficher après le délai si installable
    const timer = setTimeout(() => {
      if (isInstallable || isIOS) {
        setShowPrompt(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS, delay, dismissed]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  if (!showPrompt || isInstalled) return null;

  // Instructions spécifiques iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white dark:bg-gray-900 border-t shadow-lg z-50 safe-area-inset-bottom">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Installer l'application
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pour installer sur iOS :
            </p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li className="flex items-center gap-2">
                <span className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">1</span>
                Appuyez sur <Share className="w-4 h-4 inline" />
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">2</span>
                Sélectionnez "Sur l'écran d'accueil" <PlusSquare className="w-4 h-4 inline" />
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Prompt standard Android/Desktop
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-white dark:bg-gray-900 border-t shadow-lg z-50 safe-area-inset-bottom">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Installer l'application
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accédez plus rapidement depuis votre écran d'accueil
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
```

---

## Mode Hors-ligne

### Composant Indicateur Hors-ligne

```tsx
// components/pwa/OfflineIndicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // État initial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Cacher le message après 3 secondes
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 safe-area-inset-top ${
        isOnline
          ? 'bg-green-500'
          : 'bg-amber-500'
      }`}
    >
      <div className="flex items-center justify-center gap-2 py-2 px-4 text-white text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connexion rétablie</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Mode hors-ligne - Certaines fonctionnalités peuvent être limitées</span>
          </>
        )}
      </div>
    </div>
  );
}
```

### Hook de Détection Hors-ligne

```tsx
// hooks/pwa/useOnlineStatus.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnlineStatusOptions {
  /** URL de ping pour vérifier la vraie connectivité */
  pingUrl?: string;
  /** Intervalle de ping en ms */
  pingInterval?: number;
}

export function useOnlineStatus(options: OnlineStatusOptions = {}) {
  const {
    pingUrl = '/api/health',
    pingInterval = 30000,
  } = options;

  const [isOnline, setIsOnline] = useState(true);
  const [isActuallyOnline, setIsActuallyOnline] = useState(true);

  // Vérifier la vraie connectivité (pas juste navigator.onLine)
  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
      });
      setIsActuallyOnline(response.ok);
    } catch {
      setIsActuallyOnline(false);
    }
  }, [pingUrl]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      checkConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsActuallyOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ping périodique
    const interval = setInterval(checkConnectivity, pingInterval);

    // Vérification initiale
    checkConnectivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnectivity, pingInterval]);

  return {
    isOnline,
    isActuallyOnline,
    checkConnectivity,
  };
}
```

### Page Hors-ligne

```tsx
// app/offline/page.tsx
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vous êtes hors-ligne
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vérifiez votre connexion internet et réessayez.
          Certaines fonctionnalités sont disponibles hors-ligne.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            Disponible hors-ligne :
          </h2>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Consulter vos rendez-vous récents</li>
            <li>• Voir les informations clients en cache</li>
            <li>• Accéder au tableau de bord</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## Notifications Push

### Service de Notifications

```typescript
// lib/pwa/notifications.ts

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

/**
 * Demander la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * S'abonner aux notifications push
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    // Vérifier si déjà abonné
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Créer un nouvel abonnement
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Envoyer l'abonnement au serveur
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    }

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Se désabonner des notifications push
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Supprimer du serveur
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      // Se désabonner localement
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    return false;
  }
}

/**
 * Envoyer une notification locale
 */
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options,
    });
  }
}

// Utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
```

### Hook de Notifications

```tsx
// hooks/pwa/usePushNotifications.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/pwa/notifications';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier le support
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Récupérer l'abonnement existant
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const sub = await subscribeToPush();
      setSubscription(sub);
      if (sub) {
        setPermission('granted');
      }
      return sub !== null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setSubscription(null);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    return perm;
  }, []);

  return {
    permission,
    subscription,
    isSupported,
    isSubscribed: subscription !== null,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}
```

### API Route pour les Notifications

```typescript
// app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configurer web-push
webpush.setVapidDetails(
  'mailto:contact@votre-app.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Stocker l'abonnement en base de données
    // await prisma.pushSubscription.create({ data: { ... } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, url } = await request.json();

    // Récupérer les abonnements de l'utilisateur
    // const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

    const payload = JSON.stringify({
      title,
      body,
      url,
      timestamp: Date.now(),
    });

    // Envoyer à tous les appareils
    // for (const sub of subscriptions) {
    //   await webpush.sendNotification(sub.subscription, payload);
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
```

---

## Synchronisation en Arrière-plan

### Service de Synchronisation

```typescript
// lib/pwa/background-sync.ts

const PENDING_REQUESTS_KEY = 'pending-sync-requests';

interface PendingRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

/**
 * Ajouter une requête en attente de sync
 */
export async function queueRequest(
  url: string,
  method: string,
  body?: any
): Promise<void> {
  const pending = getPendingRequests();

  const request: PendingRequest = {
    id: crypto.randomUUID(),
    url,
    method,
    body,
    timestamp: Date.now(),
  };

  pending.push(request);
  localStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pending));

  // Demander une sync en arrière-plan
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-data');
  }
}

/**
 * Récupérer les requêtes en attente
 */
export function getPendingRequests(): PendingRequest[] {
  const data = localStorage.getItem(PENDING_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Supprimer une requête après sync réussie
 */
export function removePendingRequest(id: string): void {
  const pending = getPendingRequests().filter((r) => r.id !== id);
  localStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pending));
}

/**
 * Synchroniser toutes les requêtes en attente
 */
export async function syncPendingRequests(): Promise<void> {
  const pending = getPendingRequests();

  for (const request of pending) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      removePendingRequest(request.id);
    } catch (error) {
      console.error('Sync failed for request:', request.id, error);
      // Garder la requête pour une prochaine tentative
    }
  }
}
```

### Hook de Synchronisation

```tsx
// hooks/pwa/useBackgroundSync.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  queueRequest,
  getPendingRequests,
  syncPendingRequests,
} from '@/lib/pwa/background-sync';
import { useOnlineStatus } from './useOnlineStatus';

export function useBackgroundSync() {
  const { isOnline, isActuallyOnline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mettre à jour le compteur
  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingRequests().length);
    };

    updateCount();
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  // Synchroniser automatiquement quand on revient en ligne
  useEffect(() => {
    if (isActuallyOnline && pendingCount > 0) {
      sync();
    }
  }, [isActuallyOnline, pendingCount]);

  const queue = useCallback(
    async (url: string, method: string, body?: any) => {
      await queueRequest(url, method, body);
      setPendingCount((c) => c + 1);
    },
    []
  );

  const sync = useCallback(async () => {
    if (isSyncing || !isActuallyOnline) return;

    setIsSyncing(true);
    try {
      await syncPendingRequests();
      setPendingCount(getPendingRequests().length);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isActuallyOnline]);

  return {
    queue,
    sync,
    pendingCount,
    isSyncing,
    isOnline: isActuallyOnline,
  };
}
```

---

## Configuration Activable/Désactivable

### Service de Configuration PWA

```typescript
// lib/pwa/config.ts

export interface PWAConfig {
  enabled: boolean;
  installPromptEnabled: boolean;
  offlinePageEnabled: boolean;
  pushNotificationsEnabled: boolean;
  backgroundSyncEnabled: boolean;
}

const DEFAULT_CONFIG: PWAConfig = {
  enabled: true,
  installPromptEnabled: true,
  offlinePageEnabled: true,
  pushNotificationsEnabled: true,
  backgroundSyncEnabled: true,
};

const CONFIG_KEY = 'pwa-config';

/**
 * Récupérer la configuration PWA
 */
export function getPWAConfig(): PWAConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return DEFAULT_CONFIG;

  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Mettre à jour la configuration PWA
 */
export function updatePWAConfig(config: Partial<PWAConfig>): PWAConfig {
  const current = getPWAConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));

  // Émettre un événement pour les composants qui écoutent
  window.dispatchEvent(new CustomEvent('pwa-config-change', { detail: updated }));

  return updated;
}

/**
 * Réinitialiser la configuration PWA
 */
export function resetPWAConfig(): PWAConfig {
  localStorage.removeItem(CONFIG_KEY);
  window.dispatchEvent(new CustomEvent('pwa-config-change', { detail: DEFAULT_CONFIG }));
  return DEFAULT_CONFIG;
}
```

### Hook de Configuration

```tsx
// hooks/pwa/usePWAConfig.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPWAConfig,
  updatePWAConfig,
  resetPWAConfig,
  type PWAConfig,
} from '@/lib/pwa/config';

export function usePWAConfig() {
  const [config, setConfig] = useState<PWAConfig>(getPWAConfig);

  useEffect(() => {
    const handleChange = (event: CustomEvent<PWAConfig>) => {
      setConfig(event.detail);
    };

    window.addEventListener('pwa-config-change', handleChange as EventListener);

    return () => {
      window.removeEventListener('pwa-config-change', handleChange as EventListener);
    };
  }, []);

  const update = useCallback((updates: Partial<PWAConfig>) => {
    const updated = updatePWAConfig(updates);
    setConfig(updated);
    return updated;
  }, []);

  const reset = useCallback(() => {
    const defaultConfig = resetPWAConfig();
    setConfig(defaultConfig);
    return defaultConfig;
  }, []);

  return {
    config,
    update,
    reset,
    isEnabled: config.enabled,
  };
}
```

### Composant de Paramètres PWA

```tsx
// components/pwa/PWASettings.tsx
'use client';

import { usePWAConfig } from '@/hooks/pwa/usePWAConfig';
import { usePushNotifications } from '@/hooks/pwa/usePushNotifications';
import { Switch } from '@/components/ui/Switch';
import {
  Smartphone,
  Bell,
  WifiOff,
  RefreshCw,
  Download,
  RotateCcw
} from 'lucide-react';

export function PWASettings() {
  const { config, update, reset } = usePWAConfig();
  const { isSupported: pushSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
    update({ pushNotificationsEnabled: enabled });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Paramètres PWA</h2>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="space-y-4">
        {/* Mode PWA global */}
        <SettingRow
          icon={<Smartphone className="w-5 h-5" />}
          title="Mode Application"
          description="Activer les fonctionnalités PWA"
          checked={config.enabled}
          onChange={(enabled) => update({ enabled })}
        />

        {/* Prompt d'installation */}
        <SettingRow
          icon={<Download className="w-5 h-5" />}
          title="Prompt d'installation"
          description="Proposer l'installation de l'application"
          checked={config.installPromptEnabled}
          onChange={(enabled) => update({ installPromptEnabled: enabled })}
          disabled={!config.enabled}
        />

        {/* Mode hors-ligne */}
        <SettingRow
          icon={<WifiOff className="w-5 h-5" />}
          title="Mode hors-ligne"
          description="Permettre l'utilisation sans connexion"
          checked={config.offlinePageEnabled}
          onChange={(enabled) => update({ offlinePageEnabled: enabled })}
          disabled={!config.enabled}
        />

        {/* Notifications push */}
        <SettingRow
          icon={<Bell className="w-5 h-5" />}
          title="Notifications push"
          description={
            pushSupported
              ? isSubscribed
                ? 'Notifications activées'
                : 'Recevoir des notifications'
              : 'Non supporté sur cet appareil'
          }
          checked={config.pushNotificationsEnabled && isSubscribed}
          onChange={handleNotificationToggle}
          disabled={!config.enabled || !pushSupported}
        />

        {/* Synchronisation en arrière-plan */}
        <SettingRow
          icon={<RefreshCw className="w-5 h-5" />}
          title="Sync en arrière-plan"
          description="Synchroniser les données automatiquement"
          checked={config.backgroundSyncEnabled}
          onChange={(enabled) => update({ backgroundSyncEnabled: enabled })}
          disabled={!config.enabled}
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Les fonctionnalités PWA permettent d'utiliser l'application comme une
          application native. Vous pouvez l'installer sur votre écran d'accueil
          et l'utiliser même sans connexion internet.
        </p>
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingRow({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      disabled ? 'opacity-50' : ''
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
```

---

## Icônes et Splash Screens

### Script de Génération d'Icônes

```javascript
// scripts/generate-pwa-assets.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const SOURCE_ICON = 'public/icon-source.png'; // Icône source 1024x1024 minimum
const OUTPUT_DIR = 'public/icons';

// Splash screens pour iOS (iPhone et iPad)
const SPLASH_SCREENS = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' }, // iPad Pro 11"
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' }, // iPad Mini/Air
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' }, // iPhone XS Max
  { width: 828, height: 1792, name: 'apple-splash-828-1792' },   // iPhone XR
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' }, // iPhone 12/13
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' }, // iPhone 12/13 Pro Max
];

async function generateIcons() {
  // Créer le dossier si nécessaire
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Génération des icônes PWA...');

  for (const size of ICON_SIZES) {
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));

    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Badge pour notifications
  await sharp(SOURCE_ICON)
    .resize(72, 72)
    .png()
    .toFile(path.join(OUTPUT_DIR, 'badge-72x72.png'));

  console.log('✓ badge-72x72.png');
}

async function generateSplashScreens() {
  const splashDir = path.join('public', 'splash');

  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  console.log('\nGénération des splash screens...');

  for (const screen of SPLASH_SCREENS) {
    // Créer un fond blanc avec l'icône centrée
    const iconSize = Math.min(screen.width, screen.height) * 0.3;

    await sharp({
      create: {
        width: screen.width,
        height: screen.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: await sharp(SOURCE_ICON)
            .resize(Math.round(iconSize), Math.round(iconSize))
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toFile(path.join(splashDir, `${screen.name}.png`));

    console.log(`✓ ${screen.name}.png`);
  }
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    console.log('\n✅ Génération terminée !');
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

main();
```

```json
// package.json
{
  "scripts": {
    "generate:pwa-assets": "node scripts/generate-pwa-assets.js"
  }
}
```

### Structure des Fichiers

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-180x180.png    # Apple touch icon
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── badge-72x72.png     # Notification badge
│   ├── shortcut-appointment.png
│   └── shortcut-dashboard.png
├── splash/
│   ├── apple-splash-2048-2732.png
│   ├── apple-splash-1668-2388.png
│   └── ...
├── screenshots/
│   ├── mobile-home.png
│   └── desktop-home.png
├── manifest.json
├── sw.js                    # Généré par next-pwa
└── icon-source.png          # Source pour génération
```

---

## Debug et Testing

### Outils de Debug

```tsx
// components/pwa/PWADebugPanel.tsx (uniquement en développement)
'use client';

import { useState, useEffect } from 'react';
import { usePWAConfig } from '@/hooks/pwa/usePWAConfig';
import { useOnlineStatus } from '@/hooks/pwa/useOnlineStatus';
import { useInstallPrompt } from '@/hooks/pwa/useInstallPrompt';
import { usePushNotifications } from '@/hooks/pwa/usePushNotifications';
import { useBackgroundSync } from '@/hooks/pwa/useBackgroundSync';

export function PWADebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = usePWAConfig();
  const { isOnline, isActuallyOnline } = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS } = useInstallPrompt();
  const { permission, isSubscribed, isSupported } = usePushNotifications();
  const { pendingCount, isSyncing } = useBackgroundSync();
  const [swStatus, setSWStatus] = useState<string>('checking...');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSWStatus(reg ? 'registered' : 'not registered');
      });
    } else {
      setSWStatus('not supported');
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-full shadow-lg"
      >
        PWA
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-80 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border">
          <h3 className="font-bold mb-3">PWA Debug Panel</h3>

          <div className="space-y-2 text-sm">
            <Row label="Service Worker" value={swStatus} />
            <Row label="PWA Enabled" value={config.enabled ? 'Yes' : 'No'} />
            <Row label="Online (navigator)" value={isOnline ? 'Yes' : 'No'} />
            <Row label="Actually Online" value={isActuallyOnline ? 'Yes' : 'No'} />
            <Row label="Installable" value={isInstallable ? 'Yes' : 'No'} />
            <Row label="Installed" value={isInstalled ? 'Yes' : 'No'} />
            <Row label="iOS" value={isIOS ? 'Yes' : 'No'} />
            <Row label="Push Supported" value={isSupported ? 'Yes' : 'No'} />
            <Row label="Push Permission" value={permission} />
            <Row label="Push Subscribed" value={isSubscribed ? 'Yes' : 'No'} />
            <Row label="Pending Syncs" value={String(pendingCount)} />
            <Row label="Is Syncing" value={isSyncing ? 'Yes' : 'No'} />
          </div>

          <div className="mt-3 pt-3 border-t">
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-blue-600 hover:underline"
            >
              Reload Page
            </button>
            {' | '}
            <button
              onClick={async () => {
                const reg = await navigator.serviceWorker.getRegistration();
                if (reg) {
                  await reg.unregister();
                  window.location.reload();
                }
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Unregister SW
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const color = value === 'Yes' || value === 'granted' || value === 'registered'
    ? 'text-green-600'
    : value === 'No' || value === 'denied' || value === 'not supported'
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
```

### Tests avec Lighthouse

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Auditer votre PWA
lighthouse https://votre-app.com --only-categories=pwa --output=html --output-path=./lighthouse-pwa.html
```

### Checklist de Test Manuel

1. **Service Worker**
   - [ ] Se charge correctement
   - [ ] Cache les ressources
   - [ ] Se met à jour

2. **Installation**
   - [ ] Prompt apparaît sur Chrome Android
   - [ ] Prompt apparaît sur Chrome Desktop
   - [ ] Instructions iOS s'affichent sur Safari

3. **Hors-ligne**
   - [ ] L'app charge sans réseau
   - [ ] Les données en cache sont accessibles
   - [ ] La page offline s'affiche

4. **Notifications**
   - [ ] Permission demandée correctement
   - [ ] Notifications reçues
   - [ ] Clic sur notification fonctionne

5. **Sync**
   - [ ] Requêtes mises en queue hors-ligne
   - [ ] Sync au retour en ligne

---

## Checklist PWA

### Configuration de Base

- [ ] `manifest.json` configuré avec toutes les propriétés
- [ ] Service Worker enregistré et fonctionnel
- [ ] Icônes générées (72 à 512px)
- [ ] Meta tags PWA dans `<head>`
- [ ] HTTPS activé (obligatoire)

### Manifest.json

- [ ] `name` et `short_name` définis
- [ ] `start_url` configuré
- [ ] `display` défini (standalone recommandé)
- [ ] `theme_color` et `background_color` définis
- [ ] Icônes 192x192 et 512x512 minimum
- [ ] `orientation` définie (portrait/landscape)
- [ ] `scope` défini
- [ ] `shortcuts` configurés (optionnel)
- [ ] `screenshots` ajoutées (optionnel)

### Service Worker

- [ ] Stratégies de cache définies
- [ ] Cache des assets statiques
- [ ] Cache des API calls
- [ ] Gestion du mode hors-ligne
- [ ] Mise à jour automatique

### Installation (A2HS)

- [ ] Prompt d'installation implémenté
- [ ] Instructions iOS affichées
- [ ] Détection si déjà installé
- [ ] Gestion du rejet du prompt

### Mode Hors-ligne

- [ ] Page offline créée
- [ ] Indicateur de statut réseau
- [ ] Données critiques en cache
- [ ] Messages utilisateur clairs

### Notifications Push (optionnel)

- [ ] Clés VAPID générées
- [ ] Demande de permission
- [ ] Abonnement fonctionnel
- [ ] Réception des notifications
- [ ] Gestion du clic

### Synchronisation (optionnel)

- [ ] Queue des requêtes hors-ligne
- [ ] Sync au retour en ligne
- [ ] Gestion des conflits

### Configuration

- [ ] PWA activable/désactivable
- [ ] Paramètres accessibles
- [ ] Préférences persistées

### Performance

- [ ] Score Lighthouse PWA > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s

### Tests

- [ ] Testé sur Chrome Android
- [ ] Testé sur Safari iOS
- [ ] Testé sur Chrome Desktop
- [ ] Testé en mode avion
- [ ] Lighthouse PWA audit passé

---

## Ressources

### Documentation Officielle

- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Next.js PWA (next-pwa)](https://github.com/shadowwalker/next-pwa)

### Outils

- [PWABuilder](https://www.pwabuilder.com/) - Générateur d'assets
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit PWA
- [Maskable.app](https://maskable.app/) - Éditeur d'icônes maskable

### Générateurs de Clés VAPID

```bash
# Avec web-push
npx web-push generate-vapid-keys
```

---

**Dernière mise à jour** : 2026-01-17
