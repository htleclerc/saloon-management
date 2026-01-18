# Structure de Projet Next.js 14 (App Router)

> Cette structure est optimisée pour la scalabilité, la maintenabilité et les bonnes pratiques

## Vue d'ensemble

```
project-root/
├── app/                              # Next.js 14 App Router
│   ├── (public)/                    # Route group - Pages publiques
│   │   ├── page.tsx                # Homepage (/)
│   │   ├── about/
│   │   │   └── page.tsx           # /about
│   │   └── contact/
│   │       └── page.tsx           # /contact
│   │
│   ├── (auth)/                      # Route group - Authentification
│   │   ├── login/
│   │   │   └── page.tsx           # /login
│   │   ├── register/
│   │   │   └── page.tsx           # /register
│   │   └── forgot-password/
│   │       └── page.tsx           # /forgot-password
│   │
│   ├── (protected)/                 # Route group - Pages protégées
│   │   ├── layout.tsx              # Layout avec middleware auth
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # /dashboard
│   │   │   └── loading.tsx        # Loading state
│   │   ├── profile/
│   │   │   ├── page.tsx           # /profile
│   │   │   └── edit/
│   │   │       └── page.tsx       # /profile/edit
│   │   └── settings/
│   │       ├── page.tsx           # /settings
│   │       ├── account/
│   │       │   └── page.tsx       # /settings/account
│   │       └── security/
│   │           └── page.tsx       # /settings/security
│   │
│   ├── api/                         # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts       # NextAuth handler
│   │   ├── users/
│   │   │   ├── route.ts           # GET /api/users, POST /api/users
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET/PUT/DELETE /api/users/:id
│   │   └── health/
│   │       └── route.ts           # Health check endpoint
│   │
│   ├── layout.tsx                   # Root layout (global)
│   ├── error.tsx                    # Global error boundary
│   ├── not-found.tsx                # 404 page
│   ├── loading.tsx                  # Global loading
│   └── globals.css                  # Global styles
│
├── components/                       # Composants React
│   ├── ui/                          # Composants UI réutilisables
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── index.ts               # Barrel export
│   │
│   ├── features/                    # Composants métier par feature
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordReset.tsx
│   │   ├── user/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserList.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   └── dashboard/
│   │       ├── DashboardStats.tsx
│   │       ├── DashboardChart.tsx
│   │       └── RecentActivity.tsx
│   │
│   ├── layout/                      # Composants de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   │   └── Container.tsx
│   │
│   └── providers/                   # React Context Providers
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       └── QueryProvider.tsx       # React Query
│
├── lib/                             # Logique métier et utilitaires
│   ├── db/                          # Database
│   │   ├── prisma.ts              # Prisma client instance
│   │   └── seed.ts                # Seed data
│   │
│   ├── services/                    # Business logic services
│   │   ├── user.service.ts
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── index.ts
│   │
│   ├── api/                         # API client utilities
│   │   ├── client.ts              # Fetch wrapper / Axios config
│   │   └── endpoints.ts           # API endpoints constants
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useUser.ts
│   │   ├── useAuth.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── utils/                       # Fonctions utilitaires
│   │   ├── format.ts              # Formatting (dates, currency, etc.)
│   │   ├── validation.ts          # Validation helpers
│   │   ├── cn.ts                  # classnames utility
│   │   └── index.ts
│   │
│   ├── validations/                 # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   └── index.ts
│   │
│   └── constants/                   # Constantes
│       ├── routes.ts              # Route paths
│       ├── roles.ts               # User roles
│       └── index.ts
│
├── types/                           # Types TypeScript
│   ├── index.ts                    # Types globaux
│   ├── models.ts                   # Types de modèles (User, etc.)
│   ├── api.ts                      # Types API requests/responses
│   └── next-auth.d.ts             # NextAuth type augmentation
│
├── config/                          # Configuration
│   ├── site.ts                     # Site metadata, navigation
│   ├── auth.ts                     # Auth config (NextAuth)
│   └── env.ts                      # Environment variables validation
│
├── prisma/                          # Prisma ORM
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed script
│
├── public/                          # Assets statiques
│   ├── images/
│   │   ├── logo.svg
│   │   └── hero.jpg
│   ├── icons/
│   │   └── favicon.ico
│   └── manifest.json              # PWA manifest (optionnel)
│
├── tests/                           # Tests
│   ├── unit/                       # Tests unitaires
│   │   ├── components/
│   │   ├── lib/
│   │   └── utils/
│   ├── integration/                # Tests d'intégration
│   │   └── api/
│   └── e2e/                        # Tests end-to-end
│       └── flows/
│
├── docs/                            # Documentation projet
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
├── scripts/                         # Scripts utilitaires
│   ├── setup-db.sh
│   └── generate-types.sh
│
├── .github/                         # GitHub config
│   ├── workflows/
│   │   ├── ci.yml                 # CI pipeline
│   │   └── deploy.yml             # Deployment
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.local                       # Env vars local (gitignored)
├── .env.example                     # Template env vars
├── .env.test                        # Env vars pour tests
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .prettierignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── jest.config.js                   # Jest config
├── playwright.config.ts             # Playwright config (E2E)
├── PROJECT_PLAN.md                  # Plan de projet
├── ARCHITECTURE.md                  # Documentation architecture
└── README.md
```

---

## Explications Détaillées

### 📁 `app/` - Next.js App Router

#### Route Groups

Les parenthèses `()` créent des groupes de routes sans affecter l'URL :

- `(public)/` : Pages publiques accessibles sans auth
- `(auth)/` : Pages d'authentification
- `(protected)/` : Pages nécessitant authentification

**Avantage** : Layouts différents par groupe, middleware spécifiques

#### Fichiers Spéciaux Next.js

- `layout.tsx` : Layout partagé par toutes les routes enfants
- `page.tsx` : Composant de page (route)
- `loading.tsx` : UI de chargement (Suspense automatique)
- `error.tsx` : Gestion d'erreurs (Error Boundary)
- `not-found.tsx` : Page 404 personnalisée
- `route.ts` : API Route handler

---

### 🧩 `components/`

#### Organisation par type et feature

1. **`ui/`** : Composants visuels purs
   - Pas de logique métier
   - Réutilisables partout
   - Props bien typées
   - Exemples : Button, Input, Card

2. **`features/`** : Composants métier
   - Organisés par fonctionnalité
   - Peuvent contenir de la logique
   - Utilisent les composants UI
   - Exemples : UserProfile, LoginForm

3. **`layout/`** : Composants de structure
   - Header, Footer, Sidebar
   - Navigation
   - Containers

4. **`providers/`** : Context Providers
   - Auth state
   - Theme state
   - React Query

---

### 📚 `lib/` - Logique Métier

**Règle** : Aucun JSX dans `lib/` - seulement de la logique pure

#### `services/`
Logique métier et appels externes :
```typescript
// lib/services/user.service.ts
export const userService = {
  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  },

  async create(data: CreateUserInput) {
    // Business logic
    return await prisma.user.create({ data });
  }
}
```

#### `hooks/`
Custom React hooks :
```typescript
// lib/hooks/useUser.ts
export function useUser(userId: string) {
  return useQuery(['user', userId], () =>
    fetch(`/api/users/${userId}`).then(r => r.json())
  );
}
```

#### `validations/`
Schémas Zod partagés :
```typescript
// lib/validations/user.schema.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['USER', 'ADMIN'])
});
```

---

### 🎨 `types/`

Types TypeScript centralisés :

```typescript
// types/models.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
}

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

---

### ⚙️ `config/`

Configuration centralisée :

```typescript
// config/site.ts
export const siteConfig = {
  name: "My App",
  description: "Description",
  url: "https://myapp.com",
  ogImage: "https://myapp.com/og.jpg",
  links: {
    twitter: "https://twitter.com/myapp",
    github: "https://github.com/user/repo"
  }
}
```

---

## Conventions de Nommage

### Fichiers

- **Composants** : `PascalCase.tsx` (UserProfile.tsx)
- **Utilities** : `camelCase.ts` (formatDate.ts)
- **Constants** : `UPPER_SNAKE_CASE.ts` ou `camelCase.ts`
- **Types** : `camelCase.ts` ou `PascalCase.ts`

### Dossiers

- **Features** : `kebab-case` (user-profile/)
- **Routes** : `kebab-case` (forgot-password/)

### Code

- **Variables** : `camelCase`
- **Constantes** : `UPPER_SNAKE_CASE`
- **Types/Interfaces** : `PascalCase`
- **Functions** : `camelCase`
- **Components** : `PascalCase`

---

## Règles de Colocation

**Principe** : Gardez les fichiers liés ensemble

### Bon ✅
```
features/
  user-profile/
    UserProfile.tsx
    UserProfile.test.tsx
    UserProfile.module.css (si CSS Modules)
    useUserProfile.ts (hook spécifique)
    userProfile.utils.ts (utils spécifiques)
```

### Mauvais ❌
```
components/
  UserProfile.tsx
tests/
  UserProfile.test.tsx
hooks/
  useUserProfile.ts
```

---

## Scripts NPM Recommandés

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

---

## Comment Utiliser Cette Structure

### Pour un nouveau projet

1. **Copiez la structure** :
   ```bash
   cp -r startup-package/templates/project-structure/nextjs-14/* /chemin/nouveau-projet/
   ```

2. **Initialisez le projet** :
   ```bash
   cd /chemin/nouveau-projet
   npm init -y
   npx create-next-app@latest . --typescript --tailwind --app
   ```

3. **Créez les dossiers manquants** :
   ```bash
   mkdir -p lib/{services,hooks,utils,validations,constants}
   mkdir -p components/{ui,features,layout,providers}
   mkdir -p types config tests/{unit,integration,e2e}
   ```

4. **Copiez les configs** depuis `templates/configs/`

---

## Évolution de la Structure

Cette structure est évolutive. Ajoutez au fur et à mesure :

### Quand ajouter un nouveau dossier

- **`lib/middleware/`** : Si vous avez des middlewares personnalisés
- **`lib/errors/`** : Si vous avez des classes d'erreur personnalisées
- **`components/charts/`** : Si vous avez beaucoup de graphiques
- **`workers/`** : Si vous utilisez Web Workers

### Quand créer une sous-feature

Quand une feature a plus de 5-6 composants :

```
features/
  dashboard/
    index.ts
    components/        # Composants spécifiques dashboard
    hooks/            # Hooks spécifiques
    utils/            # Utils spécifiques
```

---

## Ressources

- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Cette structure est un point de départ. Adaptez-la à vos besoins !**
