# Phase 1 : Planification et Architecture 🎯

> "Une heure de planification économise dix heures de développement"

## Objectifs de cette phase

- ✅ Définir clairement les besoins et objectifs
- ✅ Concevoir l'architecture technique
- ✅ Choisir la stack technologique appropriée
- ✅ Planifier l'approche de développement
- ✅ Créer la structure de base du projet

---

## Étape 1.1 : Questionnaire de Planification

Avant d'écrire une seule ligne de code, répondez à ces questions. Sauvegardez vos réponses dans `PROJECT_PLAN.md` à la racine de votre projet.

### 📝 Template : PROJECT_PLAN.md

Copiez le fichier `templates/checklists/PROJECT_PLAN_TEMPLATE.md` et remplissez-le.

### Questions Essentielles

#### 1. Vision et Objectifs

```markdown
## Vision du Projet

### Quel problème résolvez-vous ?
[Réponse ici]

### Pour qui ? (Public cible)
[Réponse ici]

### Quelle est la valeur unique apportée ?
[Réponse ici]

### Objectifs mesurables (3-6 mois)
- [ ] Objectif 1
- [ ] Objectif 2
- [ ] Objectif 3
```

#### 2. Fonctionnalités Core (MVP)

```markdown
## Fonctionnalités Essentielles (MVP)

Listez UNIQUEMENT les fonctionnalités absolument nécessaires pour la première version.

### Must-Have (Indispensables)
1. [Fonctionnalité 1]
2. [Fonctionnalité 2]
3. [Fonctionnalité 3]

### Should-Have (Importantes mais pas critiques)
1. [Fonctionnalité 4]
2. [Fonctionnalité 5]

### Could-Have (Nice to have - Version 2)
1. [Fonctionnalité 6]
2. [Fonctionnalité 7]
```

#### 3. Contraintes et Exigences

```markdown
## Contraintes Techniques

### Performance
- Temps de chargement max : [ex: 2 secondes]
- Nombre d'utilisateurs simultanés : [ex: 100, 1000, 10000]
- Taille max des données : [ex: 10GB, 100GB]

### Sécurité
- [ ] Données sensibles (RGPD/GDPR)
- [ ] Authentification requise
- [ ] Paiements en ligne
- [ ] API publique

### Compatibilité
- [ ] Desktop
- [ ] Mobile (responsive)
- [ ] Application mobile native
- [ ] Offline-first (PWA)

### Budget et Timeline
- Budget : [Si applicable]
- Deadline MVP : [Date]
- Ressources : [Équipe, solo, etc.]
```

---

## Étape 1.2 : Architecture Technique

### Avec Claude Code : Utiliser EnterPlanMode

Lorsque vous commencez l'architecture avec Claude Code :

```
Prompt recommandé :
"Je démarre un nouveau projet [TYPE]. Utilise EnterPlanMode pour :
1. Explorer les options d'architecture
2. Recommander une stack technique adaptée
3. Proposer une structure de projet scalable

Contexte : [Résumé de votre PROJECT_PLAN.md]"
```

### Décisions Architecturales

Documentez vos choix dans `ARCHITECTURE.md` :

```markdown
## Stack Technique Choisie

### Frontend
- **Framework** : [Next.js 14 / React / Vue / etc.]
- **Langage** : [TypeScript]
- **Styling** : [Tailwind CSS / CSS Modules / etc.]
- **State Management** : [Context / Zustand / Redux / etc.]

### Backend
- **API** : [Next.js API Routes / Express / FastAPI / etc.]
- **Base de données** : [PostgreSQL / MongoDB / etc.]
- **ORM** : [Prisma / TypeORM / etc.]
- **Auth** : [NextAuth / Clerk / Auth0 / etc.]

### Infrastructure
- **Hosting** : [Vercel / AWS / Railway / etc.]
- **Database Hosting** : [Supabase / PlanetScale / etc.]
- **CDN** : [Cloudflare / etc.]
- **Monitoring** : [Sentry / LogRocket / etc.]

### Justifications
[Expliquez pourquoi ces choix sont adaptés à votre projet]
```

### Patterns et Principes

```markdown
## Architecture Patterns

### Structure de l'application
- [ ] Monolithique
- [ ] Microservices
- [ ] Serverless
- [ ] Jamstack

### Patterns de code
- [ ] MVC (Model-View-Controller)
- [ ] Repository Pattern
- [ ] Service Layer
- [ ] Domain-Driven Design

### Principes appliqués
- [x] SOLID
- [x] DRY (Don't Repeat Yourself)
- [x] KISS (Keep It Simple, Stupid)
- [x] YAGNI (You Aren't Gonna Need It)
```

---

## Étape 1.3 : Structure de Projet

### Structure Recommandée Next.js 14 (App Router)

Copiez la structure depuis `templates/project-structure/nextjs-14/` :

```
my-project/
├── app/                              # Next.js App Router
│   ├── (auth)/                      # Route group - Auth
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/                 # Route group - Dashboard
│   │   ├── layout.tsx               # Layout partagé
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/                         # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── users/
│   │       └── route.ts
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Styles globaux
│
├── components/                       # Composants React
│   ├── ui/                          # Composants UI réutilisables
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── features/                    # Composants métier
│   │   ├── user-profile/
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   └── dashboard/
│   │       └── DashboardStats.tsx
│   └── layout/                      # Composants de layout
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/                             # Logique métier
│   ├── services/                    # Services (API calls, etc.)
│   │   ├── user.service.ts
│   │   ├── auth.service.ts
│   │   └── api.service.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── useUser.ts
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   ├── utils/                       # Fonctions utilitaires
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── date.ts
│   ├── constants/                   # Constantes
│   │   └── index.ts
│   └── db/                          # Database (Prisma)
│       ├── prisma.ts
│       └── schema.prisma
│
├── types/                           # Types TypeScript
│   ├── index.ts                     # Types globaux
│   ├── models.ts                    # Types de modèles
│   └── api.ts                       # Types API
│
├── config/                          # Configuration
│   ├── site.ts                      # Config du site
│   └── env.ts                       # Validation env vars
│
├── public/                          # Assets statiques
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── tests/                           # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                            # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .env.local                       # Variables d'environnement (local)
├── .env.example                     # Template env vars
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── PROJECT_PLAN.md                  # Votre plan de projet
└── README.md
```

### Règles de Structure

#### 1. Organisation par feature (pas par type)

❌ **Mauvais** :
```
components/
  - UserCard.tsx
  - UserList.tsx
  - ProductCard.tsx
  - ProductList.tsx
```

✅ **Bon** :
```
components/
  features/
    user/
      - UserCard.tsx
      - UserList.tsx
    product/
      - ProductCard.tsx
      - ProductList.tsx
```

#### 2. Séparation claire UI / Logique

- `components/ui/` : Composants visuels purs (buttons, inputs, etc.)
- `components/features/` : Composants métier avec logique
- `lib/` : Toute la logique métier (pas de JSX)

#### 3. Colocation des fichiers liés

```
features/
  user-profile/
    UserProfile.tsx
    UserProfile.test.tsx
    UserProfile.module.css
    useUserProfile.ts
    user-profile.utils.ts
```

---

## Étape 1.4 : Fichiers de Configuration

### Checklist des fichiers à créer

Copiez depuis `templates/configs/` :

- [ ] `package.json` avec les dépendances
- [ ] `tsconfig.json` (TypeScript strict)
- [ ] `.eslintrc.json` (Linting)
- [ ] `.prettierrc` (Formatting)
- [ ] `.env.example` (Template variables d'environnement)
- [ ] `.gitignore`
- [ ] `next.config.js` (ou config framework)
- [ ] `tailwind.config.js` (si Tailwind)

### Configuration TypeScript Stricte

Utilisez toujours ce `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",

    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/types/*": ["types/*"]
    },

    /* Other */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Étape 1.5 : Initialisation du Projet

### Script d'initialisation automatique

Utilisez le script `scripts/init-project.sh` :

```bash
# Depuis la racine de votre nouveau projet
bash ../startup-package/scripts/init-project.sh
```

Ou manuellement :

```bash
# 1. Initialiser npm
npm init -y

# 2. Installer Next.js + TypeScript + Tailwind
npx create-next-app@latest . --typescript --tailwind --app --use-npm

# 3. Installer les dépendances essentielles
npm install zod react-hook-form @hookform/resolvers
npm install -D @types/node @types/react @types/react-dom

# 4. Installer les outils de développement
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 5. Initialiser Git
git init
git add .
git commit -m "chore: initial commit with project structure"
```

---

## Étape 1.6 : Validation de la Phase

### Checklist de fin de phase

Avant de passer à la Phase 2, vérifiez :

- [ ] `PROJECT_PLAN.md` complété avec vision claire
- [ ] `ARCHITECTURE.md` avec stack et justifications
- [ ] Structure de dossiers créée selon le template
- [ ] Tous les fichiers de config en place
- [ ] TypeScript en mode strict
- [ ] Git initialisé avec premier commit
- [ ] `.env.example` avec toutes les variables nécessaires
- [ ] README.md avec instructions de base
- [ ] Tests de build réussis (`npm run build`)

### Commande de validation

```bash
# Vérifier que tout compile
npm run build

# Vérifier le linting
npm run lint

# Vérifier les types
npx tsc --noEmit
```

---

## Prompts Recommandés avec Claude Code

### Pour démarrer la planification

```
Je démarre un nouveau projet [TYPE DE PROJET].

Utilise EnterPlanMode pour m'aider à :
1. Affiner ma vision et mes objectifs
2. Définir le MVP (fonctionnalités essentielles)
3. Choisir la stack technique appropriée
4. Concevoir l'architecture

Contexte :
- Public cible : [VOTRE PUBLIC]
- Problème résolu : [VOTRE PROBLÈME]
- Contraintes : [VOS CONTRAINTES]
```

### Pour la structure du projet

```
J'ai terminé la planification. Voici mon PROJECT_PLAN.md :
[Coller votre plan]

Aide-moi à :
1. Créer la structure de dossiers optimale
2. Configurer TypeScript, ESLint, Prettier
3. Initialiser le projet avec les bonnes dépendances

Suis les bonnes pratiques du startup-package/docs/01-PLANNING.md
```

---

## Outils et Templates

### Dans ce package

- `templates/checklists/PROJECT_PLAN_TEMPLATE.md` : Template à remplir
- `templates/project-structure/` : Structures complètes par framework
- `templates/configs/` : Fichiers de configuration prêts à l'emploi
- `scripts/init-project.sh` : Script d'initialisation automatique

---

## Prochaine Phase

Une fois cette phase complétée, passez à [Phase 2 : Développement Itératif](02-DEVELOPMENT.md)

---

## Ressources Complémentaires

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [12 Factor App](https://12factor.net/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**✨ Conseil** : Ne sautez JAMAIS cette phase. Un bon plan = 50% du succès du projet.
