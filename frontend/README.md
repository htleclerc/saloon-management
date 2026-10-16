# Saloon Management - Frontend

Application Next.js 16 (App Router) de gestion de salons de coiffure / tressage, multi-tenant, adossée à Supabase.

Pour le contexte complet (architecture, modes de données, rôles, avancement), lire [../CONTEXT.md](../CONTEXT.md). Pour les conventions de code, lire [../AGENT.md](../AGENT.md).

## Prérequis

- Node.js 20+
- Un projet Supabase (ou le mode `demo-local` qui fonctionne sans backend)

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase navigateur |
| `SUPABASE_SERVICE_ROLE_KEY` | Client admin côté serveur (routes API) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE` | Abonnements Stripe |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO`, `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE` | Identifiants de prix exposés au client |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Paiement PayPal |
| `MOBILEMONEY_API_KEY` | Paiement Mobile Money |
| `PAYMENT_PROVIDERS` | Liste des fournisseurs activés |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | Emails transactionnels |

Sans variables Supabase, utiliser le mode `demo-local` (ModeSwitcher dans l'interface ou cookie `workshop-demo-active`).

## Scripts

```bash
npm run dev            # Serveur de développement
npm run build          # Build production
npm run start          # Serveur production
npm run lint           # ESLint
npm run lint:fix       # ESLint avec correction
npm run type-check     # Vérification TypeScript
npm run format         # Prettier
npm run test           # Tests unitaires (Vitest)
npm run test:watch     # Tests en mode watch
npm run test:coverage  # Couverture
npm run test:e2e       # Tests E2E (Playwright, nécessite le serveur sur :3000)
npm run test:e2e:ui    # Playwright en mode UI
```

## Structure

```
app/          Pages et routes API (App Router)
components/   Composants UI, layouts, gardes RBAC
context/      Providers React (Auth, Theme, DataMode, Booking, Notification, ...)
hooks/        Hooks personnalisés
i18n/         Traductions EN / FR / ES
lib/          Services métier, providers de données, permissions, paiement, email
supabase/     Schéma SQL, policies RLS, vues, seeds, migrations
types/        Types TypeScript centralisés
e2e/          Tests Playwright
middleware.ts Protection des routes
```

## Base de données

Le schéma de référence est `supabase/schema_v2.sql`, complété par `policies_v2.sql`, `views_v2.sql` et les fichiers datés de `supabase/migrations/`. Les seeds `seed_v2.sql` et `seed_lyon.sql` fournissent des données de démonstration. Le script `cleanup_script.sql` purge les données démo de plus de 7 jours.

## Modes de données

| Mode | Stockage | Usage |
|------|----------|-------|
| `demo-local` | localStorage | Développement sans backend |
| `demo-supabase` | Supabase, données purgées après 7 jours | Démos publiques |
| `normal` | Supabase avec authentification | Production |

Le mode est géré par `context/DataModeProvider.tsx` et `lib/providers/StorageProviderFactory.ts`.
