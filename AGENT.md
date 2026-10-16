# AGENT.md - Instructions pour l'Agent de Développement

> Ce fichier définit les conventions et les patterns de code du projet.
> L'agent DOIT lire [CLAUDE.md](CLAUDE.md) puis [CONTEXT.md](CONTEXT.md) avant ce fichier.

---

## 📋 Informations Projet

### Projet
- **Nom** : Saloon Management System
- **Type** : Web Application SaaS multi-tenant (Next.js + Supabase)
- **Stack** : Next.js 16 (App Router) / React 19 / TypeScript strict / Tailwind CSS 4 / Supabase / Zod 4
- **Version** : 1.2.0
- **Statut** : Produit fonctionnel en consolidation

---

## 📚 Documentation de Référence

**TOUJOURS consulter ces fichiers avant de faire des modifications :**

1. **[CONTEXT.md](CONTEXT.md)** - État réel du projet et architecture
2. **[docs/PROCESS_QUALITY.md](docs/PROCESS_QUALITY.md)** - Questionnaire RG et canevas feature
3. **[startup-package/README.md](startup-package/README.md)** - Bonnes pratiques génériques
4. **[startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise

---

## 🎯 Règles Impératives

### TOUJOURS ✅
1. Utiliser TypeScript strict mode
2. Valider les inputs avec Zod (schémas dans `lib/validators/`)
3. Écrire des tests pour le nouveau code (services, règles, composants critiques)
4. Utiliser `TodoWrite` pour les tâches complexes (> 3 étapes)
5. Faire des commits atomiques avec messages conventionnels
6. Lire le code existant avant de créer du nouveau
7. Code, variables, fichiers et commits en anglais ; textes affichés via i18n

### JAMAIS ❌
1. Utiliser `any` en TypeScript
2. Committer des secrets
3. Ignorer les erreurs TypeScript ou ESLint
4. Push sur main/master directement
5. Appeler Supabase directement depuis une page ou un composant
6. Mettre du texte, des couleurs ou des données en dur dans les pages

---

## 🛠️ Conventions de Code

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `API_URL` |
| Classes/Types | PascalCase | `UserService` |
| Fichiers composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase + use | `useAuth()` |
| Services | PascalCase + Service | `WorkerService.ts` |
| Schémas Zod | camelCase + Schema | `workerSchema` |

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, supabase, infra, docs, ou le module (team, income, billing...)
```

---

## 🔧 Commandes Disponibles (dans `frontend/`)

```bash
npm run dev          # Développement (port 3000)
npm run build        # Build production
npm run lint         # ESLint
npm run lint:fix     # ESLint avec auto-fix
npm run type-check   # Vérification TypeScript
npm run format       # Prettier
npm run test         # Vitest (unitaires)
npm run test:e2e     # Playwright (E2E)
```

---

## 🏗️ Architecture et Patterns

### Stack Technique Complète
- **Frontend** : Next.js 16.1 (App Router), React 19.2
- **Langage** : TypeScript 5 (strict mode)
- **Styling** : Tailwind CSS 4
- **Données** : Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Validation** : Zod 4
- **Icons** : Lucide React
- **Charts** : Recharts 3
- **Date** : date-fns 4
- **Export** : jsPDF, PapaParse
- **Paiement** : Stripe SDK, PayPal, Mobile Money
- **Emails** : Brevo
- **État** : Context API (pas de Redux/Zustand)
- **Tests** : Vitest, Testing Library, Playwright

### Architecture Actuelle
```
frontend/
├── app/                 # Pages App Router + routes API (app/api/)
├── components/
│   ├── layout/          # Header, Sidebar, MainLayout, TeamLayout, SettingsLayout,
│   │                    # ConfigurationLayout, OnboardingLayout, ReadOnlyBanner
│   ├── ui/              # Button, Card, StatCard, ConfirmModal, Toast, ModeSwitcher...
│   ├── guards/          # OnboardingGuard, ReadOnlyGuard
│   └── <domaine>/       # booking, dashboard, services, admin, superadmin, ai, auth
├── context/             # AuthProvider, ThemeProvider, DataModeProvider, BookingProvider,
│                        # NotificationProvider, OnboardingProvider, AIProvider,
│                        # ToastProvider, ConfirmProvider
├── hooks/               # useCurrency, usePayment, useReadOnlyMode, useServices, useKpiCardStyle
├── i18n/                # useTranslation + translations/{en,fr,es}.json
├── lib/
│   ├── providers/       # IDataProvider, StorageProviderFactory, LocalStorageProvider, SupabaseProvider
│   ├── services/        # BaseService, ServiceFactory, XxxService (+ tests)
│   ├── domain/rules/    # bookingRules, incomeRules
│   ├── permissions.ts   # RBAC par action et statut
│   ├── validators/      # Schémas Zod par entité
│   ├── payment/         # service + providers stripe/paypal/mobilemoney
│   ├── email/           # config, service, templates
│   ├── supabase/        # client, server, admin, middleware
│   └── utils/           # currency, csvParser, userCode, subscriptionHelpers...
├── supabase/            # SQL : schéma, policies, vues, seeds, migrations
├── types/               # index.ts, payment.ts, email.ts
└── middleware.ts        # Protection des routes
```

### Patterns Importants

#### 1. Flux de données : Page → Service → Provider
Les pages n'accèdent jamais directement à Supabase ou au localStorage.
```typescript
import { ServiceFactory } from '@/lib/services';

const workerService = ServiceFactory.getWorkerService();
const workers = await workerService.getAll();
```
`BaseService` résout le provider selon le `DataMode` actif (`demo-local`, `demo-supabase`, `normal`). Un nouveau service hérite de `BaseService` et est exposé par `ServiceFactory`.

#### 2. Permissions : `lib/permissions.ts`
Chaque action (booking, income, service, expense) est déclarée avec ses rôles et statuts autorisés. Utiliser les helpers de ce fichier plutôt que des `if (role === ...)` dans les composants.
- Rôles : `'super_admin' | 'owner' | 'manager' | 'worker' | 'client'`
- Hiérarchie : super_admin > owner > manager > worker > client
- Mode lecture seule : `useReadOnlyMode()` + `ReadOnlyGuard`

#### 3. Validation : `lib/validators/`
Un schéma Zod par entité (`worker.schemas.ts`, `booking.schemas.ts`...). Les formulaires valident avec ces schémas avant d'appeler un service. Ne pas dupliquer les règles dans les composants.

#### 4. Règles métier : `lib/domain/rules/`
Les transitions de statut et les invariants (booking, income) sont centralisés ici et testés.

#### 5. "use client" Directive
Tous les composants interactifs (state, effects, handlers) commencent par `"use client"`. Les routes API et les clients Supabase serveur restent côté serveur.

#### 6. Context Providers et hooks
| Provider | Hook | Rôle |
|----------|------|------|
| AuthProvider | `useAuth()` | Utilisateur, rôle, salon courant, mode démo |
| ThemeProvider | `useTheme()`, `useResponsive()` | Dark mode, breakpoints |
| DataModeProvider | `useDataMode()` | Mode de données actif |
| BookingProvider | `useBooking()`, `useBookings()` | Panier de réservation |
| NotificationProvider | `useNotifications()` | Notifications in-app |
| OnboardingProvider | `useOnboarding()` | Étapes d'inscription salon |
| AIProvider | `useAI()` | Config IA (stub) |
| ToastProvider | `useToast()` | Feedback utilisateur |
| ConfirmProvider | `useConfirm()` | Modales de confirmation |

#### 7. i18n Pattern
```typescript
import { useTranslation } from '@/i18n';
const { t } = useTranslation();
// t('nav.dashboard'), t('workers.add')
```
Toute nouvelle clé est ajoutée dans les trois fichiers `en.json`, `fr.json`, `es.json`.

#### 8. Component Props Pattern
```typescript
interface Props {
  children: ReactNode;
  className?: string;
}

export default function Component({ children, className }: Props) {
  // ...
}
```

#### 9. Layouts
- `MainLayout` : Header + Sidebar (défaut)
- `TeamLayout`, `SettingsLayout`, `ConfigurationLayout` : sous-navigation par module
- `OnboardingLayout` : parcours d'inscription

#### 10. Thème et couleurs
Les couleurs passent par les tokens Tailwind et `useKpiCardStyle()` pour les cartes KPI. Pas de couleur en dur dans les pages.

#### 11. Routes API (`app/api/`)
Réservées à ce qui nécessite des secrets serveur : paiement (Stripe/PayPal webhooks, checkout, portail), emails (Brevo), invitations, téléchargement sécurisé. Elles utilisent `lib/supabase/admin.ts` et gèrent leur propre auth (le middleware les ignore).

### Conventions Spécifiques

#### Types Centralisés (`types/index.ts`)
`Worker`, `Client`, `Service`, `Product`, `Booking`, `Income`, `Expense`, `Salon`, `UserRole`, `SubscriptionPlan`, etc. Importer depuis `@/types`. Les types paiement et email sont dans `types/payment.ts` et `types/email.ts`.

#### Exports
CSV via PapaParse, PDF via jsPDF. Utiliser les utilitaires existants plutôt que d'en créer de nouveaux.

#### Responsive Design
- Mobile-first ; breakpoints `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Sidebar : menu burger sur mobile
- Tableaux : scroll horizontal sur mobile
- `useResponsive()` pour la logique conditionnelle

#### Supabase
- Schéma de référence : `supabase/schema_v2.sql` + `policies_v2.sql`
- Toute modification de schéma = nouveau fichier daté dans `supabase/migrations/` (`YYYYMMDD_description.sql`)
- Ne jamais modifier une migration déjà appliquée

---

## ⚠️ Points d'Attention Spécifiques

### Modes de données
- `demo-local` : localStorage, désactivé en production
- `demo-supabase` : tables partagées, purge automatique après 7 jours
- `normal` : Supabase avec auth, données réelles
- Tester toute fonctionnalité de données au moins en `demo-local` et `demo-supabase`

### RBAC et multi-tenant
- Chaque requête de données est scopée au salon courant (`salon_id`)
- Les workers ne voient que leurs propres montants
- Les policies RLS Supabase sont la dernière ligne de défense : ne pas s'appuyer uniquement sur le front

### i18n
- Toutes les chaînes visibles passent par `t()`
- Langues : EN (défaut), FR, ES

### Tests
- Un nouveau service = un fichier `XxxService.test.ts` à côté
- Les tests de composants utilisent Testing Library (voir `components/ui/*.test.tsx`)
- Les E2E vivent dans `e2e/` et ne doivent contenir aucun chemin local

### Performance
- Pagination manuelle sur grandes listes (workers, income)
- Recharts peut être lent avec beaucoup de données : agréger avant d'afficher

### Dette connue
- `AIProvider` et `/api/ai/command` sont des stubs avec des `any` à typer
- Migrations correctives successives sur `payment_history` à consolider
- Fichiers à retirer du dépôt : `debug_output.txt`, `playwright-report/`, `test-results/`, `components/guards/ReadOnlyGuard.tsx.bak`

---

**Dernière mise à jour** : 2026-10-16
**Version** : 2.0
