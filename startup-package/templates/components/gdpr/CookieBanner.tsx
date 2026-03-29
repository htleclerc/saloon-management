'use client';

import { useState, useEffect } from 'react';

/**
 * Types de cookies supportés
 */
export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

/**
 * État des consentements
 */
export interface CookieConsent {
  essential: boolean;      // Toujours true (non désactivable)
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;       // ISO date du consentement
  version: string;         // Version de la politique de cookies
}

/**
 * Configuration de la bannière
 */
interface CookieBannerConfig {
  policyVersion: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  cookieName?: string;
  cookieExpiry?: number;   // Jours (défaut: 365)
  onAccept?: (consent: CookieConsent) => void;
  onReject?: (consent: CookieConsent) => void;
  onCustomize?: (consent: CookieConsent) => void;
}

/**
 * Descriptions des catégories de cookies
 */
const COOKIE_DESCRIPTIONS: Record<CookieCategory, { title: string; description: string }> = {
  essential: {
    title: 'Cookies Essentiels',
    description: 'Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. Ils permettent des fonctions de base comme la navigation et l\'accès aux zones sécurisées.',
  },
  functional: {
    title: 'Cookies Fonctionnels',
    description: 'Ces cookies permettent de mémoriser vos préférences (langue, région, thème) pour améliorer votre expérience.',
  },
  analytics: {
    title: 'Cookies Analytiques',
    description: 'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site en collectant des informations anonymes sur les pages visitées.',
  },
  marketing: {
    title: 'Cookies Marketing',
    description: 'Ces cookies sont utilisés pour vous proposer des publicités adaptées à vos centres d\'intérêt.',
  },
};

/**
 * Utilitaire pour gérer les cookies
 */
const cookieUtils = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  set(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax;Secure`;
  },

  delete(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
  },
};

/**
 * Valeurs par défaut du consentement
 */
const getDefaultConsent = (version: string): CookieConsent => ({
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
  version,
});

/**
 * Composant de bannière de cookies RGPD
 *
 * @example
 * ```tsx
 * <CookieBanner
 *   policyVersion="1.0"
 *   privacyPolicyUrl="/privacy"
 *   cookiePolicyUrl="/cookies"
 *   onAccept={(consent) => {
 *     // Initialiser les services analytics si accepté
 *     if (consent.analytics) initAnalytics();
 *   }}
 * />
 * ```
 */
export function CookieBanner({
  policyVersion,
  privacyPolicyUrl,
  cookiePolicyUrl,
  cookieName = 'cookie_consent',
  cookieExpiry = 365,
  onAccept,
  onReject,
  onCustomize,
}: CookieBannerConfig) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(getDefaultConsent(policyVersion));

  // Vérifier le consentement existant au chargement
  useEffect(() => {
    const existingConsent = cookieUtils.get(cookieName);

    if (existingConsent) {
      try {
        const parsed = JSON.parse(existingConsent) as CookieConsent;

        // Vérifier si la version de la politique a changé
        if (parsed.version !== policyVersion) {
          // Nouvelle version = redemander le consentement
          setIsVisible(true);
        } else {
          // Consentement valide existant
          setConsent(parsed);
          setIsVisible(false);
        }
      } catch {
        // Cookie invalide
        setIsVisible(true);
      }
    } else {
      // Pas de consentement = afficher la bannière
      setIsVisible(true);
    }
  }, [cookieName, policyVersion]);

  /**
   * Sauvegarder le consentement
   */
  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithMeta: CookieConsent = {
      ...newConsent,
      timestamp: new Date().toISOString(),
      version: policyVersion,
    };

    cookieUtils.set(cookieName, JSON.stringify(consentWithMeta), cookieExpiry);
    setConsent(consentWithMeta);
    setIsVisible(false);

    return consentWithMeta;
  };

  /**
   * Accepter tous les cookies
   */
  const acceptAll = () => {
    const newConsent = saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: '',
      version: policyVersion,
    });
    onAccept?.(newConsent);
  };

  /**
   * Refuser tous les cookies non-essentiels
   */
  const rejectAll = () => {
    const newConsent = saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: '',
      version: policyVersion,
    });
    onReject?.(newConsent);
  };

  /**
   * Sauvegarder les préférences personnalisées
   */
  const savePreferences = () => {
    const newConsent = saveConsent(consent);
    onCustomize?.(newConsent);
  };

  /**
   * Modifier une catégorie
   */
  const toggleCategory = (category: CookieCategory) => {
    if (category === 'essential') return; // Non modifiable

    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Ne pas afficher si pas visible
  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg dark:bg-gray-900 dark:border-gray-700"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      <div className="max-w-6xl mx-auto">
        {/* Vue simple */}
        {!showDetails && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 id="cookie-banner-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                🍪 Nous utilisons des cookies
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
                <a href={cookiePolicyUrl} className="text-blue-600 underline hover:text-blue-800">
                  politique de cookies
                </a>{' '}
                et notre{' '}
                <a href={privacyPolicyUrl} className="text-blue-600 underline hover:text-blue-800">
                  politique de confidentialité
                </a>.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Personnaliser
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Refuser tout
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Accepter tout
              </button>
            </div>
          </div>
        )}

        {/* Vue détaillée */}
        {showDetails && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="cookie-banner-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Paramètres des cookies
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Fermer les détails"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(COOKIE_DESCRIPTIONS) as CookieCategory[]).map((category) => (
                <div
                  key={category}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {COOKIE_DESCRIPTIONS[category].title}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent[category]}
                        onChange={() => toggleCategory(category)}
                        disabled={category === 'essential'}
                        className="sr-only peer"
                      />
                      <div className={`
                        w-11 h-6 rounded-full peer
                        ${category === 'essential'
                          ? 'bg-green-600 cursor-not-allowed'
                          : 'bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300'
                        }
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:after:translate-x-full
                      `} />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {COOKIE_DESCRIPTIONS[category].description}
                  </p>
                  {category === 'essential' && (
                    <span className="inline-block mt-2 text-xs text-green-600 dark:text-green-400">
                      Toujours actif
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t dark:border-gray-700">
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Refuser les optionnels
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder mes préférences
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Accepter tout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook pour accéder au consentement actuel
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { consent, hasConsent } = useCookieConsent();
 *
 *   if (hasConsent('analytics')) {
 *     // Initialiser analytics
 *   }
 * }
 * ```
 */
export function useCookieConsent(cookieName = 'cookie_consent') {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const stored = cookieUtils.get(cookieName);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, [cookieName]);

  const hasConsent = (category: CookieCategory): boolean => {
    if (!consent) return false;
    return consent[category] === true;
  };

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    if (!consent) return;

    const updated: CookieConsent = {
      ...consent,
      ...newConsent,
      timestamp: new Date().toISOString(),
    };

    cookieUtils.set(cookieName, JSON.stringify(updated), 365);
    setConsent(updated);
  };

  const revokeConsent = () => {
    cookieUtils.delete(cookieName);
    setConsent(null);
    // Recharger la page pour réafficher la bannière
    window.location.reload();
  };

  return {
    consent,
    hasConsent,
    updateConsent,
    revokeConsent,
  };
}

export default CookieBanner;
