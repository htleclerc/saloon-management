/**
 * Composants GDPR/RGPD
 *
 * Ce module exporte tous les composants nécessaires pour la conformité RGPD :
 * - CookieBanner : Bannière de consentement aux cookies
 * - PrivacyCenter : Centre de gestion de la vie privée
 * - useCookieConsent : Hook pour accéder au consentement
 *
 * @example
 * ```tsx
 * // Dans votre layout principal
 * import { CookieBanner } from '@/components/gdpr';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <CookieBanner
 *           policyVersion="1.0"
 *           privacyPolicyUrl="/privacy"
 *           cookiePolicyUrl="/cookies"
 *         />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Page de confidentialité
 * import { PrivacyCenter } from '@/components/gdpr';
 *
 * export default function PrivacyPage() {
 *   return (
 *     <PrivacyCenter
 *       userEmail={user.email}
 *       companyName="Ma Société"
 *       companyEmail="privacy@masociete.com"
 *       privacyPolicyUrl="/privacy"
 *       cookiePolicyUrl="/cookies"
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Vérifier le consentement avant d'initialiser analytics
 * import { useCookieConsent } from '@/components/gdpr';
 *
 * function AnalyticsProvider({ children }) {
 *   const { hasConsent } = useCookieConsent();
 *
 *   useEffect(() => {
 *     if (hasConsent('analytics')) {
 *       initializeGoogleAnalytics();
 *     }
 *   }, [hasConsent]);
 *
 *   return children;
 * }
 * ```
 */

export { CookieBanner, useCookieConsent } from './CookieBanner';
export type { CookieConsent, CookieCategory } from './CookieBanner';

export { PrivacyCenter } from './PrivacyCenter';
