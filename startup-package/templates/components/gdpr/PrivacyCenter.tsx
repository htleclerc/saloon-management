'use client';

import { useState } from 'react';
import { useCookieConsent, CookieCategory } from './CookieBanner';

/**
 * Types de demandes GDPR
 */
type GDPRRequestType =
  | 'access'           // Droit d'accès
  | 'rectification'    // Droit de rectification
  | 'erasure'          // Droit à l'effacement
  | 'portability'      // Droit à la portabilité
  | 'restriction'      // Droit à la limitation
  | 'objection';       // Droit d'opposition

/**
 * Formulaire de demande GDPR
 */
interface GDPRRequest {
  type: GDPRRequestType;
  email: string;
  details: string;
}

/**
 * Configuration du centre de confidentialité
 */
interface PrivacyCenterConfig {
  userEmail?: string;
  companyName: string;
  companyEmail: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  onRequestSubmit?: (request: GDPRRequest) => Promise<void>;
  onDataExport?: () => Promise<void>;
  onDataDelete?: () => Promise<void>;
}

/**
 * Descriptions des droits GDPR
 */
const GDPR_RIGHTS: Record<GDPRRequestType, { title: string; description: string; icon: string }> = {
  access: {
    title: 'Droit d\'accès',
    description: 'Obtenir une copie de toutes les données personnelles que nous détenons sur vous.',
    icon: '👁️',
  },
  rectification: {
    title: 'Droit de rectification',
    description: 'Demander la correction de données personnelles inexactes ou incomplètes.',
    icon: '✏️',
  },
  erasure: {
    title: 'Droit à l\'effacement',
    description: 'Demander la suppression de vos données personnelles (droit à l\'oubli).',
    icon: '🗑️',
  },
  portability: {
    title: 'Droit à la portabilité',
    description: 'Recevoir vos données dans un format structuré et lisible par machine.',
    icon: '📦',
  },
  restriction: {
    title: 'Droit à la limitation',
    description: 'Demander la suspension du traitement de vos données.',
    icon: '⏸️',
  },
  objection: {
    title: 'Droit d\'opposition',
    description: 'Vous opposer au traitement de vos données pour certaines finalités.',
    icon: '🛑',
  },
};

/**
 * Centre de confidentialité RGPD
 *
 * Permet aux utilisateurs de :
 * - Gérer leurs préférences de cookies
 * - Exercer leurs droits RGPD
 * - Exporter leurs données
 * - Demander la suppression de leur compte
 *
 * @example
 * ```tsx
 * <PrivacyCenter
 *   userEmail={user.email}
 *   companyName="Ma Société"
 *   companyEmail="privacy@masociete.com"
 *   privacyPolicyUrl="/privacy"
 *   cookiePolicyUrl="/cookies"
 *   onRequestSubmit={async (request) => {
 *     await api.submitGDPRRequest(request);
 *   }}
 *   onDataExport={async () => {
 *     const data = await api.exportUserData();
 *     downloadJSON(data);
 *   }}
 * />
 * ```
 */
export function PrivacyCenter({
  userEmail,
  companyName,
  companyEmail,
  privacyPolicyUrl,
  cookiePolicyUrl,
  onRequestSubmit,
  onDataExport,
  onDataDelete,
}: PrivacyCenterConfig) {
  const [activeTab, setActiveTab] = useState<'cookies' | 'rights' | 'data'>('cookies');
  const [selectedRight, setSelectedRight] = useState<GDPRRequestType | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { consent, updateConsent, revokeConsent, hasConsent } = useCookieConsent();

  /**
   * Soumettre une demande GDPR
   */
  const handleSubmitRequest = async () => {
    if (!selectedRight || !userEmail) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onRequestSubmit?.({
        type: selectedRight,
        email: userEmail,
        details: requestDetails,
      });

      setMessage({
        type: 'success',
        text: 'Votre demande a été envoyée. Nous vous répondrons sous 30 jours maximum.',
      });
      setSelectedRight(null);
      setRequestDetails('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Exporter les données
   */
  const handleExportData = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await onDataExport?.();
      setMessage({
        type: 'success',
        text: 'Vos données ont été exportées avec succès.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue lors de l\'export.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Supprimer le compte
   */
  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte et toutes vos données ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onDataDelete?.();
      setMessage({
        type: 'success',
        text: 'Votre demande de suppression a été enregistrée.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue. Veuillez nous contacter directement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Basculer un consentement
   */
  const toggleConsent = (category: CookieCategory) => {
    if (category === 'essential') return;
    updateConsent({ [category]: !hasConsent(category) });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🔒 Centre de Confidentialité
      </h1>

      {/* Message de feedback */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Onglets */}
      <div className="flex border-b dark:border-gray-700 mb-6">
        {[
          { id: 'cookies', label: '🍪 Cookies' },
          { id: 'rights', label: '⚖️ Mes Droits' },
          { id: 'data', label: '📊 Mes Données' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}

      {/* Onglet Cookies */}
      {activeTab === 'cookies' && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos préférences de cookies. Pour plus d'informations, consultez notre{' '}
            <a href={cookiePolicyUrl} className="text-blue-600 underline">
              politique de cookies
            </a>.
          </p>

          <div className="space-y-4">
            {/* Cookies essentiels */}
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Cookies Essentiels
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nécessaires au fonctionnement du site
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                  Toujours actif
                </span>
              </div>
            </div>

            {/* Cookies fonctionnels */}
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Cookies Fonctionnels
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mémorisent vos préférences (langue, thème)
                  </p>
                </div>
                <ToggleSwitch
                  checked={hasConsent('functional')}
                  onChange={() => toggleConsent('functional')}
                />
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Cookies Analytiques
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nous aident à améliorer le site
                  </p>
                </div>
                <ToggleSwitch
                  checked={hasConsent('analytics')}
                  onChange={() => toggleConsent('analytics')}
                />
              </div>
            </div>

            {/* Cookies marketing */}
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Cookies Marketing
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Publicités personnalisées
                  </p>
                </div>
                <ToggleSwitch
                  checked={hasConsent('marketing')}
                  onChange={() => toggleConsent('marketing')}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={revokeConsent}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
            >
              Révoquer tous les consentements
            </button>
          </div>

          {consent && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Consentement enregistré le {new Date(consent.timestamp).toLocaleDateString('fr-FR')}
              {' '}(version {consent.version})
            </p>
          )}
        </div>
      )}

      {/* Onglet Droits */}
      {activeTab === 'rights' && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles.
            Pour plus d'informations, consultez notre{' '}
            <a href={privacyPolicyUrl} className="text-blue-600 underline">
              politique de confidentialité
            </a>.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(GDPR_RIGHTS) as GDPRRequestType[]).map((right) => (
              <button
                key={right}
                onClick={() => setSelectedRight(selectedRight === right ? null : right)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  selectedRight === right
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{GDPR_RIGHTS[right].icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {GDPR_RIGHTS[right].title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {GDPR_RIGHTS[right].description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Formulaire de demande */}
          {selectedRight && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Soumettre une demande : {GDPR_RIGHTS[selectedRight].title}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={userEmail || ''}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Détails de votre demande (optionnel)
                  </label>
                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Précisez votre demande si nécessaire..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={isSubmitting || !userEmail}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                  <button
                    onClick={() => setSelectedRight(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Nous répondrons à votre demande dans un délai maximum de 30 jours.
                En cas de non-réponse, vous pouvez contacter la CNIL.
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Contact direct
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Vous pouvez également exercer vos droits en nous contactant directement :
              <br />
              <a href={`mailto:${companyEmail}`} className="underline">
                {companyEmail}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Onglet Données */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos données personnelles stockées chez {companyName}.
          </p>

          {/* Export des données */}
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              📦 Exporter mes données
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Téléchargez une copie de toutes vos données personnelles au format JSON.
            </p>
            <button
              onClick={handleExportData}
              disabled={isSubmitting || !onDataExport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Export en cours...' : 'Télécharger mes données'}
            </button>
          </div>

          {/* Suppression du compte */}
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900 dark:border-red-800">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
              🗑️ Supprimer mon compte
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Cette action supprimera définitivement votre compte et toutes vos données.
              Certaines données peuvent être conservées pour des raisons légales.
            </p>
            <button
              onClick={handleDeleteData}
              disabled={isSubmitting || !onDataDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Supprimer mon compte
            </button>
          </div>

          {/* Informations sur la conservation */}
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              📅 Durées de conservation
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Données de compte : durée de la relation + 3 ans</li>
              <li>• Données de facturation : 10 ans (obligation légale)</li>
              <li>• Logs de connexion : 1 an</li>
              <li>• Cookies : 13 mois maximum</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {companyName} s'engage à protéger vos données personnelles conformément au RGPD.
          Pour toute question, contactez-nous à{' '}
          <a href={`mailto:${companyEmail}`} className="text-blue-600 underline">
            {companyEmail}
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Composant Switch Toggle réutilisable
 */
function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

export default PrivacyCenter;
