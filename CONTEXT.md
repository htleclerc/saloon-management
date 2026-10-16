# CONTEXT.md - Contexte Global du Projet

> **Fichier de référence centrale** : À lire au début de chaque session agent, quelle que soit la tâche.
> Ce document décrit l'état **réel** du code, pas le plan initial. Les fichiers `PHASE_*.md` sont conservés comme historique.

---

## 📋 Informations Projet

### Identité
- **Nom** : Saloon Management System (nom d'affichage : Workshop Manager / BraidHub)
- **Type** : Application Web SaaS multi-tenant de gestion de salons (coiffure, tressage, ateliers)
- **Version Actuelle** : 1.2.0
- **Statut** : Produit fonctionnel en consolidation (qualité, tests, documentation)

### Stack Technique (réelle)

#### Frontend
- **Framework** : Next.js 16.1 (App Router) + React 19.2
- **Langage** : TypeScript 5 (strict mode)
- **Styling** : Tailwind CSS 4
- **État** : React Context API (9 providers, pas de Redux/Zustand)
- **Validation** : Zod 4
- **UI** : Lucide React (icônes), Recharts 3 (graphiques)
- **Utilitaires** : date-fns 4, jsPDF (PDF), PapaParse (CSV), qrcode.react
- **i18n** : maison, 3 langues (EN par défaut, FR, ES), ~2 300 clés par langue

#### Backend / Données
- **Supabase** : PostgreSQL + Auth + Storage + RLS. C'est le backend de production.
  - Client navigateur, client serveur et client admin dans `frontend/lib/supabase/`
  - Session gérée par `@supabase/ssr` dans `frontend/middleware.ts`
- **API Routes Next.js** (`frontend/app/api/`) : paiement, emails, invitations, IA (stub)
- **Paiement** : Stripe (abonnements, webhooks, portail), PayPal, Mobile Money
- **Emails** : Brevo (transactionnels, templates dans `frontend/lib/email/`)

#### Infrastructure
- **Dev** : Docker Compose (`docker-compose.dev.yml`) avec PostgreSQL 16, Redis 7, Keycloak 24, Mailpit
  - ⚠️ Keycloak et Redis sont provisionnés mais **non utilisés** par le frontend actuel (auth = Supabase)
- **Prod** : à définir (Vercel ou VPS + Docker)
- **CI/CD, Monitoring, Logging** : non mis en place

#### Tests
- **Unitaires** : Vitest + Testing Library + jsdom (`npm run test`)
- **E2E** : Playwright (`npm run test:e2e`), 1 test smoke

---

## 🎯 Architecture Multi-Mode

### Modes de Données (3 modes)

Le type `DataMode` (`frontend/lib/providers/types.ts`) définit :

| Mode | Stockage | Usage | Auth |
|------|----------|-------|------|
| `demo-local` | localStorage navigateur | Dev local, démo hors-ligne | Cookie `workshop-demo-active` |
| `demo-supabase` | Supabase (tables partagées) | Démos publiques, cleanup auto 7 jours (`supabase/cleanup_script.sql`) | Cookie démo |
| `normal` | Supabase (données réelles) | Clients réels | Supabase Auth obligatoire |

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  DataModeProvider (Context) → ServiceFactory       │ │
│  └──────────────┬─────────────────────────────────────┘ │
│                 │                                        │
│     ┌───────────┴───────────┐                            │
│     │                       │                            │
│ ┌───▼──────────┐    ┌───────▼────────┐                   │
│ │ LocalStorage │    │   Supabase     │                   │
│ │  Provider    │    │   Provider     │                   │
│ └──────────────┘    └───────┬────────┘                   │
└─────────────────────────────┼────────────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Supabase Cloud     │
                   │  PostgreSQL + RLS   │
                   │  Auth + Storage     │
                   └─────────────────────┘
```

Le backend Go/Gin prévu initialement (Phase 5) **n'a pas été développé**. Supabase tient lieu de backend. Voir « Décisions Architecturales ».

---

## 🏗️ Architecture Frontend

```
frontend/
├── app/                      # Next.js App Router (~80 pages)
│   ├── api/                  # Routes API (payment, email, team/invite, ai, download)
│   ├── auth/                 # callback, logout, reset-password
│   ├── login/, onboarding/   # Authentification et inscription salon
│   ├── dashboard/, daily/    # Tableaux de bord
│   ├── team/                 # Workers : liste, ajout, détail, paie, planning, performance
│   ├── clients/, services/   # CRUD clients et prestations
│   ├── appointments/, calendar/, approvals/   # Rendez-vous
│   ├── income/, expenses/, reports/           # Finances et rapports
│   ├── configuration/        # Atelier, inventaire, promos, pourboires
│   ├── settings/             # Profil, sécurité, users, billing, IA, intégrations...
│   ├── superadmin/, admin/   # Pilotage multi-salons et plans
│   └── salons/, client/      # Espace client (découverte, favoris, factures)
├── components/
│   ├── layout/               # Header, Sidebar, layouts
│   ├── ui/                   # Button, Card, StatCard, modales, Toast, ModeSwitcher
│   ├── guards/               # RequirePermission et gardes de rôle
│   ├── booking/, dashboard/, services/, admin/, superadmin/, onboarding/, ai/, auth/
├── context/                  # Auth, Theme, DataMode, Booking, Notification,
│                             # Onboarding, AI, Toast, Confirm
├── hooks/                    # useCurrency, usePayment, useReadOnlyMode, useServices...
├── i18n/                     # index.tsx + translations/{en,fr,es}.json
├── lib/
│   ├── providers/            # StorageProviderFactory, LocalStorageProvider, SupabaseProvider
│   ├── services/             # ~20 services métier + ServiceFactory + tests
│   ├── domain/rules/         # Règles de gestion centralisées
│   ├── permissions.ts        # RBAC par action et par statut
│   ├── payment/              # Stripe, PayPal, MobileMoney
│   ├── email/                # Brevo + templates
│   ├── supabase/             # Clients Supabase (client, server, admin, middleware)
│   ├── validators/, utils/, constants/, mock/
├── supabase/                 # schema_v2.sql, policies_v2.sql, views_v2.sql, seeds, migrations/
├── e2e/                      # Tests Playwright
├── middleware.ts             # Protection des routes (session Supabase ou cookie démo)
└── types/                    # Types centralisés (index.ts, payment.ts, email.ts)
```

### Modèle de Données (Supabase, `schema_v2.sql`)
22 tables : `users`, `salons`, `user_salons`, `salon_settings`, `workers`, `clients`,
`service_categories`, `services`, `products`, `promo_codes`, `bookings`, `booking_services`,
`booking_workers`, `incomes`, `income_worker_shares`, `income_services`, `income_products`,
`expense_categories`, `expenses`, `reviews`, `interaction_history`, `salon_comments`.
Migrations complémentaires dans `frontend/supabase/migrations/` (notifications, paie, historique de paiements, préférences de notification, auth_id).

---

## 🔐 Sécurité & Authentification

- **Auth** : Supabase Auth (email/mot de passe, reset, callback OAuth). Keycloak n'est pas utilisé.
- **Protection des routes** : `frontend/middleware.ts`. Routes publiques : `/login`, `/auth/*`, `/onboarding`, `/downloads/invoice`, `/salons/discover`.
- **Rôles** (`UserRole` dans `frontend/types/index.ts`) :
  ```
  super_admin > owner > manager > worker > client
  ```
  Il n'y a **pas** de rôle `admin` dans le code.
- **RBAC** : `frontend/lib/permissions.ts` définit, par domaine (booking, income, service, expense), les rôles et statuts autorisés pour chaque action. Toujours passer par ces règles, jamais par des conditions en dur.
- **Mode lecture seule** : hook `useReadOnlyMode`.
- **Abonnements** (`SubscriptionPlan`) : `free`, `starter`, `pro`, `enterprise`, `custom`.

---

## 🎯 Fonctionnalités Implémentées

- ✅ Dashboard KPI, vue journalière, dashboard avancé
- ✅ Équipe : CRUD workers (simple et avancé), détail, planning, performance, feedback, paie, revenus
- ✅ Clients : CRUD, fiche client
- ✅ Prestations : CRUD, catégories, historique
- ✅ Rendez-vous : réservation, calendrier, approbations, statuts (Created → Closed)
- ✅ Revenus : saisie, parts worker, pourboires, factures, notes
- ✅ Dépenses : CRUD par catégorie
- ✅ Rapports : filtres de période, exports CSV/PDF
- ✅ Configuration : atelier, inventaire, codes promo, pourboires
- ✅ Paramètres : profil, sécurité, users, apparence, notifications, emails, intégrations, analytics, IA, billing
- ✅ Abonnements : checkout Stripe/PayPal, portail, webhooks, factures
- ✅ Super-admin : salons, users, plans, billing, analytics, support
- ✅ Onboarding salon, invitations d'équipe par email (Brevo)
- ✅ i18n EN/FR/ES, dark mode, responsive, multi-devise
- ✅ 3 modes de données avec ModeSwitcher et bannière démo

### Partiel / À faire
- ⚠️ IA : `AIProvider` et route `/api/ai/command` existent mais sont des **stubs** (aucun LLM branché)
- ⚠️ Tests E2E : un seul test smoke, avec un chemin local en dur à corriger
- ⚠️ Couverture unitaire : services bien couverts, pages et composants peu couverts
- [ ] Déploiement production documenté
- [ ] CI/CD (lint + type-check + tests sur PR)
- [ ] Monitoring / logging
- [ ] Consolidation des policies RLS (plusieurs migrations correctives successives sur `payment_history`)

---

## 📐 Standards de Développement

### Règles Impératives

✅ **TOUJOURS**
- TypeScript strict mode (pas d'`any`)
- Validation des inputs avec Zod
- Passer par les services (`lib/services`) et les règles (`lib/permissions.ts`, `lib/domain/rules`)
- Tests pour tout nouveau service ou règle métier
- Commits atomiques (Conventional Commits)
- Lire le code existant avant d'écrire
- Code, variables, fichiers et commits **en anglais** ; textes affichés via i18n (jamais en dur)

❌ **JAMAIS**
- Utiliser `any` en TypeScript
- Committer des secrets (`.env*` est ignoré)
- Ignorer les erreurs TypeScript/ESLint
- Push direct sur main
- Appeler Supabase directement depuis une page (passer par un service)
- Coder des couleurs ou des données en dur dans les pages

### Conventions Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `API_URL` |
| Classes/Types | PascalCase | `UserService` |
| Composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase + use | `useAuth()` |
| Services | PascalCase + Service | `WorkerService.ts` |

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, supabase, infra, docs, <module> (team, income, billing...)
```

---

## 🔧 Commandes (dans `frontend/`)

```bash
npm run dev            # Développement (port 3000)
npm run build          # Build production
npm run lint           # ESLint
npm run type-check     # tsc --noEmit
npm run test           # Vitest
npm run test:coverage  # Vitest + couverture
npm run test:e2e       # Playwright
```

Infra locale (racine) : `docker-compose -f docker-compose.dev.yml --env-file .env.docker up -d`

### Variables d'environnement attendues
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`,
`NEXT_PUBLIC_STRIPE_PRICE_PRO`, `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`,
`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `MOBILEMONEY_API_KEY`, `PAYMENT_PROVIDERS`,
`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`.

---

## 📚 Documentation de Référence

1. **[AGENT.md](AGENT.md)** - Conventions et patterns de code
2. **[CLAUDE.md](CLAUDE.md)** - Résumé des règles pour l'agent
3. **[docs/PROCESS_QUALITY.md](docs/PROCESS_QUALITY.md)** - Questionnaire RG et canevas feature
4. **[docs/adr/](docs/adr/)** - Décisions d'architecture
5. **[README_INFRA.md](README_INFRA.md)** - Infra Docker locale
6. **[DOCUMENTATION.md](DOCUMENTATION.md)** - Formation Build in Public
7. **[startup-package/](startup-package/README.md)** - Bonnes pratiques génériques
8. **`PHASE_0.md` → `PHASE_6.md`, `PHASE_IA.md`** - Historique du plan MVP

---

## 🚀 Avancement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 0 | Mockup fonctionnel | ✅ Terminée |
| 1 | Architecture providers / services | ✅ Terminée |
| 2 | Mode démo localStorage | ✅ Terminée |
| 3 | Infra Docker locale | ✅ Livrée (Keycloak/Redis non branchés) |
| 4 | Mode démo Supabase | ✅ Terminée |
| IA | Booster intelligence | ⚠️ Stubs uniquement |
| 5 | Backend Go API | ❌ Abandonnée au profit de Supabase |
| 6 | Tests E2E et intégration | ⏳ Démarrée (smoke test) |
| Hors plan | Paiement, emails, paie, super-admin, onboarding | ✅ Livrées (v1.0 → v1.2) |

### Prochaines étapes recommandées
1. Tests E2E des parcours critiques (login, booking, income, billing)
2. CI (GitHub Actions) : lint, type-check, test
3. Consolidation RLS et nettoyage des migrations correctives
4. Guide de déploiement production
5. Branchement d'un vrai LLM derrière `/api/ai/command` (optionnel)

---

## 💡 Décisions Architecturales

1. **Supabase comme backend** : le backend Go/Gin + Keycloak + Redis prévu en Phase 5 a été abandonné. Supabase couvre auth, base, storage et RLS avec un coût de maintenance bien plus faible. Un backend dédié ne sera envisagé que si Supabase devient limitant (logique métier lourde, intégrations serveur).
2. **Pas de Kubernetes** : Docker Compose suffit.
3. **Context API pour l'état** : pas de Redux/Zustand tant que ce n'est pas nécessaire.
4. **Services + Providers** : toute la logique de données passe par `lib/services`, qui s'appuie sur le provider du mode actif. Les pages ne connaissent pas Supabase.
5. **IA optionnelle** : le produit doit fonctionner à 100 % sans IA (Null Object / feature toggles).
6. **Agent IA de développement** : voir `docs/adr/001-agent-integration.md`.

### Points d'Attention
- Le mode `demo-local` doit rester désactivé en production.
- Le cleanup Supabase démo nécessite un cron externe (Supabase cron ou GitHub Actions).
- Le fichier `README_INFRA.md` décrit une infra Docker partiellement utilisée.

---

## 📞 Utilisation de ce Fichier

### Pour un Agent Démarrant une Tâche
1. **TOUJOURS** lire ce fichier en premier, puis `AGENT.md`
2. Lire `docs/PROCESS_QUALITY.md` avant toute nouvelle fonctionnalité
3. Rester cohérent avec les services et règles existants

### Mise à Jour de ce Fichier
⚠️ **Mettre à jour** quand : décision architecturale, dépendance majeure ajoutée/supprimée, nouveau module fonctionnel, changement de statut d'une phase.
✅ **Ne PAS mettre à jour** pour : détails d'implémentation, bug fixes, features mineures.

---

**Dernière mise à jour** : 2026-10-16
**Version applicative** : 1.2.0
**Statut** : Consolidation (tests, CI, déploiement)
