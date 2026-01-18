# Guide des Environnements

> Configuration et gestion des environnements de développement à production

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Multi-Environnement](#architecture-multi-environnement)
3. [Configuration par Environnement](#configuration-par-environnement)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Base de Données](#base-de-données)
6. [Preview Deployments](#preview-deployments)
7. [Feature Flags](#feature-flags)
8. [Best Practices](#best-practices)

---

## Vue d'Ensemble

### Les 4 Environnements Standard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Environnements                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LOCAL          PREVIEW         STAGING         PRODUCTION                  │
│  ┌──────┐      ┌──────┐        ┌──────┐        ┌──────┐                    │
│  │ Dev  │ ───▶ │  PR  │ ────▶  │ Test │ ────▶  │ Prod │                    │
│  └──────┘      └──────┘        └──────┘        └──────┘                    │
│                                                                              │
│  localhost     pr-123.app     staging.app     app.com                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Caractéristiques                                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  LOCAL                                                                │   │
│  │  • SQLite ou Docker PostgreSQL                                       │   │
│  │  • Hot reload                                                         │   │
│  │  • Debug mode                                                         │   │
│  │  • Mocks possibles                                                    │   │
│  │                                                                       │   │
│  │  PREVIEW (par PR)                                                     │   │
│  │  • Base de données isolée ou partagée                                │   │
│  │  • URL unique par PR                                                  │   │
│  │  • Automatiquement supprimé après merge                              │   │
│  │                                                                       │   │
│  │  STAGING                                                              │   │
│  │  • Copie de production                                               │   │
│  │  • Données de test                                                    │   │
│  │  • Tests E2E automatisés                                             │   │
│  │                                                                       │   │
│  │  PRODUCTION                                                           │   │
│  │  • Haute disponibilité                                               │   │
│  │  • Monitoring complet                                                │   │
│  │  • Données réelles                                                    │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flux de Déploiement

```
                    ┌─────────────┐
                    │   Commit    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ Feature │  │ Develop │  │  Main   │
        │ Branch  │  │ Branch  │  │ Branch  │
        └────┬────┘  └────┬────┘  └────┬────┘
             │            │            │
             ▼            │            │
        ┌─────────┐       │            │
        │ Preview │       │            │
        │ Deploy  │       │            │
        └────┬────┘       │            │
             │            │            │
             └─────┬──────┘            │
                   │                   │
                   ▼                   │
             ┌─────────┐               │
             │ Staging │               │
             │ Deploy  │               │
             └────┬────┘               │
                  │                    │
                  └────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Production  │
                    │   Deploy    │
                    └─────────────┘
```

---

## Architecture Multi-Environnement

### Infrastructure Vercel

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Project                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Production Branch: main                                        │
│  └── example.com                                                │
│                                                                  │
│  Preview Branches: *                                            │
│  ├── feature-*.vercel.app                                       │
│  ├── pr-123.vercel.app                                          │
│  └── staging.example.com (develop branch)                       │
│                                                                  │
│  Environment Variables:                                         │
│  ├── Production: DATABASE_URL, API_KEY, ...                     │
│  ├── Preview: DATABASE_URL_PREVIEW, ...                         │
│  └── Development: (for local `vercel dev`)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Infrastructure Kubernetes

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp-staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: myapp-production

# k8s/overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: myapp-staging
bases:
  - ../../base
patchesStrategicMerge:
  - replica-count.yaml
  - resources.yaml
configMapGenerator:
  - name: app-config
    literals:
      - NODE_ENV=staging
      - LOG_LEVEL=debug

# k8s/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: myapp-production
bases:
  - ../../base
patchesStrategicMerge:
  - replica-count.yaml
  - resources.yaml
  - hpa.yaml
configMapGenerator:
  - name: app-config
    literals:
      - NODE_ENV=production
      - LOG_LEVEL=warn
```

### Infrastructure Docker Compose (Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev:dev@postgres:5432/myapp_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: myapp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Services de test
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

volumes:
  postgres_data:
```

---

## Configuration par Environnement

### Structure de Configuration

```typescript
// config/index.ts

import { z } from 'zod';

// Schéma de validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'preview', 'staging', 'production']),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // External Services
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_ID: z.string().optional(),

  // Feature Flags
  FEATURE_NEW_DASHBOARD: z.coerce.boolean().default(false),
  FEATURE_BETA_SEARCH: z.coerce.boolean().default(false),
});

// Parse et valide
const env = envSchema.parse(process.env);

// Configuration par environnement
const configs = {
  development: {
    debug: true,
    logLevel: 'debug',
    apiRateLimit: 1000,
    cacheEnabled: false,
    mockExternalServices: true,
  },
  preview: {
    debug: true,
    logLevel: 'debug',
    apiRateLimit: 500,
    cacheEnabled: true,
    mockExternalServices: false,
  },
  staging: {
    debug: true,
    logLevel: 'info',
    apiRateLimit: 200,
    cacheEnabled: true,
    mockExternalServices: false,
  },
  production: {
    debug: false,
    logLevel: 'warn',
    apiRateLimit: 100,
    cacheEnabled: true,
    mockExternalServices: false,
  },
} as const;

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isStaging: env.NODE_ENV === 'staging',
  isDevelopment: env.NODE_ENV === 'development',
  isPreview: env.NODE_ENV === 'preview',

  database: {
    url: env.DATABASE_URL,
    poolSize: env.DATABASE_POOL_SIZE,
  },

  redis: {
    url: env.REDIS_URL,
  },

  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
  },

  services: {
    sentryDsn: env.SENTRY_DSN,
    analyticsId: env.ANALYTICS_ID,
  },

  features: {
    newDashboard: env.FEATURE_NEW_DASHBOARD,
    betaSearch: env.FEATURE_BETA_SEARCH,
  },

  ...configs[env.NODE_ENV],
};

export type Config = typeof config;
```

### Fichiers .env par Environnement

```bash
# .env.local (développement local - NE PAS COMMITER)
NODE_ENV=development
DATABASE_URL=postgresql://dev:dev@localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-at-least-32-characters-long
FEATURE_NEW_DASHBOARD=true
FEATURE_BETA_SEARCH=true

# .env.preview (template pour preview deployments)
NODE_ENV=preview
# DATABASE_URL défini dans Vercel
# NEXTAUTH_URL défini dynamiquement
FEATURE_NEW_DASHBOARD=true
FEATURE_BETA_SEARCH=true

# .env.staging (staging environment)
NODE_ENV=staging
SENTRY_DSN=https://xxx@sentry.io/staging
ANALYTICS_ID=UA-STAGING-1
FEATURE_NEW_DASHBOARD=true
FEATURE_BETA_SEARCH=true

# .env.production (production environment)
NODE_ENV=production
SENTRY_DSN=https://xxx@sentry.io/production
ANALYTICS_ID=UA-PROD-1
FEATURE_NEW_DASHBOARD=false
FEATURE_BETA_SEARCH=true
```

### Next.js Configuration

```typescript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base
  reactStrictMode: true,
  poweredByHeader: false,

  // Variables publiques
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV,
  },

  // Redirections par environnement
  async redirects() {
    const redirects = [];

    // Staging: Rediriger vers login si pas authentifié
    if (process.env.NODE_ENV === 'staging') {
      redirects.push({
        source: '/admin/:path*',
        has: [{ type: 'cookie', key: 'staging_auth', value: undefined }],
        destination: '/staging-login',
        permanent: false,
      });
    }

    return redirects;
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Environment',
            value: process.env.NODE_ENV || 'development',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // HSTS uniquement en production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
        ],
      },
    ];
  },

  // Optimisations par environnement
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

module.exports = nextConfig;
```

---

## Variables d'Environnement

### Gestion Sécurisée

```typescript
// lib/env.ts

import { z } from 'zod';

// Variables côté serveur (sensibles)
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  ENCRYPTION_KEY: z.string().length(64),
});

// Variables côté client (publiques)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

// Validation au démarrage
function validateEnv() {
  const serverEnv = serverEnvSchema.safeParse(process.env);
  const clientEnv = clientEnvSchema.safeParse(process.env);

  if (!serverEnv.success) {
    console.error('❌ Invalid server environment variables:');
    console.error(serverEnv.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables');
  }

  if (!clientEnv.success) {
    console.error('❌ Invalid client environment variables:');
    console.error(clientEnv.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }

  return {
    server: serverEnv.data,
    client: clientEnv.data,
  };
}

export const env = validateEnv();

// Type-safe access
export const serverEnv = env.server;
export const clientEnv = env.client;
```

### Vercel Environment Variables

```bash
# Configuration via CLI Vercel

# Production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production

# Preview (toutes les branches de preview)
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_SECRET preview

# Development (pour `vercel dev`)
vercel env add DATABASE_URL development

# Télécharger les variables localement
vercel env pull .env.local

# Lister les variables
vercel env ls
```

### GitHub Secrets

```yaml
# Configuration des secrets par environment

# Repository Settings > Secrets and variables > Actions

# Repository secrets (tous les environnements)
VERCEL_TOKEN: xxx
VERCEL_ORG_ID: xxx
VERCEL_PROJECT_ID: xxx
CODECOV_TOKEN: xxx

# Environment: staging
# Settings > Environments > staging > Secrets
DATABASE_URL: postgresql://staging:xxx@host/db
NEXTAUTH_SECRET: staging-secret

# Environment: production
# Settings > Environments > production > Secrets
DATABASE_URL: postgresql://prod:xxx@host/db
NEXTAUTH_SECRET: production-secret
SENTRY_AUTH_TOKEN: xxx
```

---

## Base de Données

### Stratégie par Environnement

```
┌─────────────────────────────────────────────────────────────────┐
│                 Database Strategy                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DEVELOPMENT                                                     │
│  ├── Option A: Docker PostgreSQL local                          │
│  ├── Option B: SQLite pour simplicité                           │
│  └── Option C: Base Supabase de dev partagée                    │
│                                                                  │
│  PREVIEW                                                         │
│  ├── Option A: Base partagée avec préfixe                       │
│  ├── Option B: Base éphémère par PR (Neon branching)            │
│  └── Option C: Base staging (données de test)                   │
│                                                                  │
│  STAGING                                                         │
│  ├── Copie de la structure production                           │
│  ├── Données anonymisées ou synthétiques                        │
│  └── Reset périodique possible                                  │
│                                                                  │
│  PRODUCTION                                                      │
│  ├── Base haute disponibilité                                   │
│  ├── Backups automatiques                                       │
│  ├── Read replicas pour scaling                                 │
│  └── Monitoring et alertes                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Migrations par Environnement

```bash
# prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# Scripts de migration

# Development
npm run db:push  # Sync schema sans migration

# Preview/Staging
npm run db:migrate:deploy  # Appliquer les migrations

# Production
npm run db:migrate:deploy  # Avec backup préalable
```

```yaml
# GitHub Actions - Migration
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4

      - run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Seeding par Environnement

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.NODE_ENV || 'development';

  console.log(`Seeding database for ${env}...`);

  switch (env) {
    case 'development':
      await seedDevelopment();
      break;
    case 'staging':
      await seedStaging();
      break;
    case 'production':
      // Pas de seeding en production
      console.log('Skipping seed in production');
      break;
  }
}

async function seedDevelopment() {
  // Utilisateurs de test
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin Test',
      role: 'ADMIN',
    },
  });

  // Données de test complètes
  // ...
}

async function seedStaging() {
  // Données anonymisées similaires à la production
  // ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### Neon Database Branching

```yaml
# Preview avec Neon branching
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Create Neon branch
        id: neon
        uses: neondatabase/create-branch-action@v4
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          branch_name: pr-${{ github.event.pull_request.number }}
          api_key: ${{ secrets.NEON_API_KEY }}

      - name: Deploy with branch database
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
        env:
          DATABASE_URL: ${{ steps.neon.outputs.db_url }}

      - name: Run migrations on branch
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ steps.neon.outputs.db_url }}
```

---

## Preview Deployments

### Configuration Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "github": {
    "silent": true,
    "autoAlias": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex"
        }
      ]
    }
  ]
}
```

### Protection des Previews

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isProtected = request.nextUrl.pathname.startsWith('/api') === false;

  if (isPreview && isProtected) {
    // Vérifier l'authentification pour les previews
    const authCookie = request.cookies.get('preview_auth');

    if (!authCookie && request.nextUrl.pathname !== '/preview-login') {
      return NextResponse.redirect(new URL('/preview-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Commentaires de PR Automatiques

```yaml
# .github/workflows/preview-comment.yml
name: Preview Comment

on:
  deployment_status:

jobs:
  comment:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: Find PR
        id: pr
        uses: actions/github-script@v7
        with:
          script: |
            const { data: prs } = await github.rest.pulls.list({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              head: `${context.repo.owner}:${context.payload.deployment.ref}`,
            });
            return prs[0]?.number;

      - name: Comment on PR
        if: steps.pr.outputs.result
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ github.event.deployment_status.target_url }}';
            const body = `## 🚀 Preview Deployment Ready!

            | | |
            |---|---|
            | **URL** | ${url} |
            | **Commit** | \`${{ github.event.deployment.sha.substring(0, 7) }}\` |
            | **Branch** | \`${{ github.event.deployment.ref }}\` |

            ### Quick Links
            - [Open Preview](${url})
            - [Open Preview (Mobile)](${url}?viewport=mobile)
            `;

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{ steps.pr.outputs.result }},
              body: body,
            });
```

---

## Feature Flags

### Implémentation Complète

```typescript
// lib/feature-flags/index.ts

import { z } from 'zod';

// Définition des flags
export const featureFlagsSchema = z.object({
  // UI Features
  newDashboard: z.boolean().default(false),
  betaSearch: z.boolean().default(false),
  darkModeV2: z.boolean().default(false),

  // Backend Features
  newApiVersion: z.boolean().default(false),
  asyncProcessing: z.boolean().default(false),

  // Experiments
  pricingExperiment: z.enum(['control', 'variant_a', 'variant_b']).default('control'),
});

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

// Configuration par environnement
const flagsByEnvironment: Record<string, Partial<FeatureFlags>> = {
  development: {
    newDashboard: true,
    betaSearch: true,
    darkModeV2: true,
    newApiVersion: true,
    asyncProcessing: true,
  },
  preview: {
    newDashboard: true,
    betaSearch: true,
    darkModeV2: true,
  },
  staging: {
    newDashboard: true,
    betaSearch: true,
    darkModeV2: false,
  },
  production: {
    newDashboard: false,
    betaSearch: true,  // Progressif
    darkModeV2: false,
  },
};

// Overrides dynamiques (depuis base de données ou service externe)
async function getDynamicOverrides(userId?: string): Promise<Partial<FeatureFlags>> {
  // Exemple: vérifier si l'utilisateur est dans un groupe de beta
  if (userId) {
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (user?.isBetaTester) {
    //   return { newDashboard: true, darkModeV2: true };
    // }
  }
  return {};
}

export async function getFeatureFlags(userId?: string): Promise<FeatureFlags> {
  const env = process.env.NODE_ENV || 'development';
  const baseFlags = flagsByEnvironment[env] || {};
  const dynamicFlags = await getDynamicOverrides(userId);

  return featureFlagsSchema.parse({
    ...baseFlags,
    ...dynamicFlags,
  });
}

// Hook React
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlags() {
      const response = await fetch('/api/feature-flags');
      const data = await response.json();
      setFlags(data);
      setLoading(false);
    }
    loadFlags();
  }, []);

  return { flags, loading };
}

// Composant Feature
export function Feature({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { flags, loading } = useFeatureFlags();

  if (loading || !flags) return null;

  return flags[flag] ? <>{children}</> : <>{fallback}</>;
}
```

### API Route Feature Flags

```typescript
// app/api/feature-flags/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getFeatureFlags } from '@/lib/feature-flags';

export async function GET() {
  const session = await getServerSession();
  const flags = await getFeatureFlags(session?.user?.id);

  return NextResponse.json(flags);
}
```

### Rollout Progressif

```typescript
// lib/feature-flags/rollout.ts

import { createHash } from 'crypto';

interface RolloutConfig {
  percentage: number;  // 0-100
  startDate?: Date;
  endDate?: Date;
  allowList?: string[];  // User IDs always included
  denyList?: string[];   // User IDs always excluded
}

export function isInRollout(
  userId: string,
  featureName: string,
  config: RolloutConfig
): boolean {
  // Check deny list
  if (config.denyList?.includes(userId)) {
    return false;
  }

  // Check allow list
  if (config.allowList?.includes(userId)) {
    return true;
  }

  // Check date range
  const now = new Date();
  if (config.startDate && now < config.startDate) return false;
  if (config.endDate && now > config.endDate) return false;

  // Percentage rollout (deterministic based on user ID)
  const hash = createHash('sha256')
    .update(`${userId}-${featureName}`)
    .digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;

  return bucket < config.percentage;
}

// Exemple d'utilisation
const newDashboardRollout: RolloutConfig = {
  percentage: 25,  // 25% des utilisateurs
  allowList: ['admin-id', 'beta-tester-id'],
  startDate: new Date('2024-01-01'),
};

function shouldShowNewDashboard(userId: string): boolean {
  return isInRollout(userId, 'new-dashboard', newDashboardRollout);
}
```

---

## Best Practices

### Checklist par Environnement

```markdown
## Development
- [ ] Docker Compose pour les services
- [ ] Hot reload configuré
- [ ] Debug mode activé
- [ ] Seed data disponible
- [ ] Mocks pour services externes
- [ ] Variables .env.local

## Preview
- [ ] URL unique par PR
- [ ] Protection par auth (optionnel)
- [ ] Base de données isolée ou branchée
- [ ] Commentaire automatique sur PR
- [ ] Cleanup après merge

## Staging
- [ ] Infrastructure identique à production
- [ ] Données de test réalistes
- [ ] Tests E2E automatisés
- [ ] Monitoring actif
- [ ] Reset périodique planifié

## Production
- [ ] Haute disponibilité
- [ ] Backups automatiques
- [ ] Monitoring et alertes
- [ ] Logs centralisés
- [ ] Rate limiting
- [ ] CDN configuré
- [ ] SSL/TLS
- [ ] HSTS activé
```

### Parité Dev/Prod

```yaml
# Principes de parité
1. Même base de données (PostgreSQL partout)
2. Même versions des services
3. Même configuration (via variables d'environnement)
4. Même process de build
5. Même infrastructure (containers)

# Différences acceptables
- Ressources (CPU, RAM) réduites en dev/staging
- Données de test vs production
- SSL self-signed en local
- Services externes mockés en local
```

### Troubleshooting

```typescript
// lib/debug.ts

export function logEnvironmentInfo() {
  console.log('='.repeat(50));
  console.log('Environment Information');
  console.log('='.repeat(50));
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);
  console.log(`VERCEL_URL: ${process.env.VERCEL_URL}`);
  console.log(`DATABASE_URL: ${maskString(process.env.DATABASE_URL)}`);
  console.log(`Build Time: ${process.env.NEXT_PUBLIC_BUILD_TIME}`);
  console.log(`Version: ${process.env.NEXT_PUBLIC_APP_VERSION}`);
  console.log('='.repeat(50));
}

function maskString(str?: string): string {
  if (!str) return 'undefined';
  if (str.length <= 10) return '***';
  return str.slice(0, 10) + '...' + str.slice(-5);
}

// Endpoint de debug (uniquement en non-production)
// app/api/debug/env/route.ts
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Forbidden', { status: 403 });
  }

  return Response.json({
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME,
  });
}
```

---

## Conclusion

Une bonne gestion des environnements permet :

1. **Isolation** : Chaque environnement est indépendant
2. **Parité** : Configuration identique dev/prod
3. **Sécurité** : Secrets bien gérés
4. **Agilité** : Preview par PR
5. **Fiabilité** : Tests en staging avant production

**Prochaines étapes** :
1. Configurer Docker Compose pour le développement local
2. Mettre en place les preview deployments
3. Configurer les variables d'environnement Vercel
4. Implémenter les feature flags
5. Documenter les procédures de chaque environnement
