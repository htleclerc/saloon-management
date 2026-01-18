# 🏢 Guide SaaS Multi-Tenant

> Guide complet pour concevoir et implémenter une plateforme SaaS multi-tenant robuste et scalable

---

## 📋 Table des Matières

1. [Introduction au Multi-Tenancy](#introduction-au-multi-tenancy)
2. [Stratégies d'Isolation des Données](#stratégies-disolation-des-données)
3. [Architecture Recommandée](#architecture-recommandée)
4. [Authentification et Autorisation](#authentification-et-autorisation)
5. [Gestion des Tenants](#gestion-des-tenants)
6. [Base de Données Multi-Tenant](#base-de-données-multi-tenant)
7. [Facturation et Abonnements](#facturation-et-abonnements)
8. [Performance et Scalabilité](#performance-et-scalabilité)
9. [Sécurité Multi-Tenant](#sécurité-multi-tenant)
10. [Monitoring et Analytics](#monitoring-et-analytics)
11. [Checklist de Mise en Production](#checklist-de-mise-en-production)

---

## Introduction au Multi-Tenancy

### Qu'est-ce que le Multi-Tenancy ?

Le **multi-tenancy** est une architecture où une seule instance d'application sert plusieurs clients (tenants), chacun ayant ses propres données isolées.

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SAAS                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│   │ Tenant A │    │ Tenant B │    │ Tenant C │              │
│   │ (Salon1) │    │ (Salon2) │    │ (Salon3) │              │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│        │               │               │                     │
│        ▼               ▼               ▼                     │
│   ┌─────────────────────────────────────────────┐           │
│   │           COUCHE D'ISOLATION                 │           │
│   │    (Données, Configuration, Ressources)      │           │
│   └─────────────────────────────────────────────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Avantages du Multi-Tenancy

| Avantage | Description |
|----------|-------------|
| **Économies d'échelle** | Infrastructure partagée = coûts réduits |
| **Maintenance simplifiée** | Une seule codebase à maintenir |
| **Déploiement unifié** | Mise à jour simultanée pour tous |
| **Onboarding rapide** | Nouveau tenant en quelques minutes |

### Défis à Adresser

| Défi | Solution |
|------|----------|
| **Isolation des données** | Stratégie de partitionnement robuste |
| **Performance** | Fair use, rate limiting, resource quotas |
| **Sécurité** | Row-level security, encryption par tenant |
| **Personnalisation** | Configuration flexible par tenant |
| **Scalabilité** | Architecture horizontale, sharding |

---

## Stratégies d'Isolation des Données

### 1. Base de Données par Tenant (Silo)

```
┌─────────────────────────────────────────────────────────┐
│                      APPLICATION                         │
├─────────────────────────────────────────────────────────┤
│   ┌─────────┐     ┌─────────┐     ┌─────────┐          │
│   │  DB A   │     │  DB B   │     │  DB C   │          │
│   │(Tenant A│     │(Tenant B│     │(Tenant C│          │
│   └─────────┘     └─────────┘     └─────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Avantages** :
- Isolation maximale
- Restauration facile par tenant
- Performance dédiée

**Inconvénients** :
- Coût élevé (une DB par tenant)
- Maintenance complexe
- Scalabilité limitée (nombre de connexions)

**Recommandé pour** : Grandes entreprises, données très sensibles, conformité stricte

### 2. Schéma par Tenant (Bridge)

```
┌─────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                       │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │ Schema: A   │  │ Schema: B   │  │ Schema: C   │    │
│   │ - users     │  │ - users     │  │ - users     │    │
│   │ - products  │  │ - products  │  │ - products  │    │
│   └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Avantages** :
- Bonne isolation
- Une seule connexion DB
- Migrations par tenant possibles

**Inconvénients** :
- Limite de schémas (PostgreSQL ~1000)
- Complexité de gestion
- Backups plus difficiles

**Recommandé pour** : Moyennes entreprises, quelques centaines de tenants

### 3. Colonne Tenant ID (Pool) ⭐ RECOMMANDÉ

```
┌─────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                       │
├─────────────────────────────────────────────────────────┤
│   Table: users                                           │
│   ┌────────────┬───────────┬────────────────┬─────────┐ │
│   │ tenant_id  │ id        │ name           │ email   │ │
│   ├────────────┼───────────┼────────────────┼─────────┤ │
│   │ tenant_a   │ 1         │ John           │ j@a.com │ │
│   │ tenant_a   │ 2         │ Jane           │ k@a.com │ │
│   │ tenant_b   │ 1         │ Bob            │ b@b.com │ │
│   │ tenant_c   │ 1         │ Alice          │ a@c.com │ │
│   └────────────┴───────────┴────────────────┴─────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Avantages** :
- Scalabilité maximale
- Coût minimal
- Simple à implémenter
- Queries cross-tenant possibles (analytics)

**Inconvénients** :
- Risque de data leak si mal implémenté
- Performance peut dégrader sans index
- Pas d'isolation native

**Recommandé pour** : Startups, SaaS à grande échelle, données peu sensibles

### Comparaison des Stratégies

| Critère | Silo (DB/tenant) | Bridge (Schema) | Pool (tenant_id) |
|---------|------------------|-----------------|------------------|
| **Isolation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Coût** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalabilité** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Onboarding** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Architecture Recommandée

### Architecture Hexagonale Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │  Admin App  │  │  Mobile App │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                       │
├─────────────────────────────────────────────────────────────────┤
│                    TENANT CONTEXT                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TenantMiddleware → TenantContext → TenantProvider      │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Use Cases  │  │   Services  │  │    DTOs     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Entities   │  │   Repos     │  │   Events    │             │
│  │  (+ Tenant) │  │ (Interface) │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TENANT-AWARE REPOSITORIES                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   Prisma    │  │    Redis    │  │     S3      │      │   │
│  │  │ + RLS/Filter│  │ + Namespace │  │ + Prefix    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Structure de Dossiers

```
src/
├── domain/
│   ├── entities/
│   │   ├── Tenant.ts              # Entité Tenant
│   │   ├── User.ts                # User avec tenantId
│   │   └── BaseEntity.ts          # Classe de base avec tenantId
│   ├── repositories/
│   │   ├── ITenantRepository.ts
│   │   └── IUserRepository.ts
│   └── services/
│       └── TenantService.ts
│
├── application/
│   ├── use-cases/
│   │   ├── tenant/
│   │   │   ├── CreateTenant.ts
│   │   │   ├── UpdateTenant.ts
│   │   │   └── GetTenantBySlug.ts
│   │   └── user/
│   │       └── CreateUser.ts      # Avec context tenant
│   └── middleware/
│       └── TenantMiddleware.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── TenantPrismaClient.ts
│   │   └── repositories/
│   │       ├── PrismaTenantRepository.ts
│   │       └── PrismaUserRepository.ts
│   ├── cache/
│   │   └── TenantRedisClient.ts
│   └── storage/
│       └── TenantS3Client.ts
│
├── presentation/
│   ├── api/
│   │   └── middleware.ts          # Extraction tenant
│   └── contexts/
│       └── TenantContext.tsx
│
└── shared/
    ├── types/
    │   └── tenant.types.ts
    └── utils/
        └── tenant.utils.ts
```

---

## Authentification et Autorisation

### Identification du Tenant

#### Option 1 : Sous-domaine (Recommandé)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // salon1.app.com → tenant = "salon1"
  // app.com → tenant = null (landing page)
  const subdomain = hostname.split('.')[0];

  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    const tenant = await getTenantBySlug(subdomain);

    if (!tenant) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // Injecter le tenant dans les headers
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenant.id);
    response.headers.set('x-tenant-slug', tenant.slug);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### Option 2 : Path-based

```typescript
// /[tenant]/dashboard → tenant extrait du path
// app/[tenant]/layout.tsx

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const tenant = await getTenantBySlug(params.tenant);

  if (!tenant) {
    notFound();
  }

  return (
    <TenantProvider tenant={tenant}>
      {children}
    </TenantProvider>
  );
}
```

#### Option 3 : Header/Token

```typescript
// Pour les APIs
// Authorization: Bearer <jwt with tenant_id claim>

import { jwtVerify } from 'jose';

export async function extractTenantFromToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload.tenant_id as string;
}
```

### Structure JWT Multi-Tenant

```typescript
// Payload JWT enrichi
interface JWTPayload {
  sub: string;          // User ID
  email: string;
  tenant_id: string;    // Tenant actuel
  tenant_role: string;  // Role dans ce tenant
  tenants: {            // Tous les tenants de l'utilisateur
    id: string;
    slug: string;
    role: string;
  }[];
  iat: number;
  exp: number;
}
```

### RBAC Multi-Tenant

```typescript
// domain/entities/Permission.ts
export enum TenantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

export const ROLE_PERMISSIONS: Record<TenantRole, string[]> = {
  [TenantRole.OWNER]: ['*'], // Tout
  [TenantRole.ADMIN]: [
    'users:*',
    'settings:*',
    'billing:read',
    'reports:*',
  ],
  [TenantRole.MANAGER]: [
    'users:read',
    'appointments:*',
    'clients:*',
    'services:*',
  ],
  [TenantRole.EMPLOYEE]: [
    'appointments:read',
    'appointments:update:own',
    'clients:read',
  ],
  [TenantRole.VIEWER]: [
    'appointments:read',
    'clients:read',
  ],
};
```

```typescript
// application/middleware/AuthorizationMiddleware.ts
export function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req);
    const tenantId = req.headers.get('x-tenant-id');

    const membership = user.memberships.find(
      m => m.tenantId === tenantId
    );

    if (!membership) {
      throw new UnauthorizedError('Not a member of this tenant');
    }

    const permissions = ROLE_PERMISSIONS[membership.role];

    if (!hasPermission(permissions, permission)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    return membership;
  };
}

function hasPermission(permissions: string[], required: string): boolean {
  return permissions.some(p => {
    if (p === '*') return true;
    if (p === required) return true;

    // Wildcard matching: "users:*" matches "users:read"
    const [resource, action] = p.split(':');
    const [reqResource, reqAction] = required.split(':');

    return resource === reqResource && action === '*';
  });
}
```

---

## Gestion des Tenants

### Entité Tenant

```typescript
// domain/entities/Tenant.ts
export interface Tenant {
  id: string;
  slug: string;              // URL-friendly identifier
  name: string;

  // Plan et facturation
  plan: TenantPlan;
  billingEmail: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;

  // Limites selon le plan
  limits: TenantLimits;

  // Configuration
  settings: TenantSettings;
  features: TenantFeatures;

  // Branding
  branding: TenantBranding;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TenantLimits {
  maxUsers: number;
  maxStorage: number;        // En bytes
  maxApiCalls: number;       // Par mois
  maxClients: number;
  maxAppointmentsPerMonth: number;
}

export interface TenantSettings {
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  weekStartsOn: 0 | 1;       // 0 = Sunday, 1 = Monday
}

export interface TenantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
}

export enum TenantPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}
```

### Plans et Limites

```typescript
// domain/services/PlanService.ts
export const PLAN_LIMITS: Record<TenantPlan, TenantLimits> = {
  [TenantPlan.FREE]: {
    maxUsers: 1,
    maxStorage: 100 * 1024 * 1024,      // 100 MB
    maxApiCalls: 1000,
    maxClients: 50,
    maxAppointmentsPerMonth: 100,
  },
  [TenantPlan.STARTER]: {
    maxUsers: 5,
    maxStorage: 1 * 1024 * 1024 * 1024, // 1 GB
    maxApiCalls: 10000,
    maxClients: 500,
    maxAppointmentsPerMonth: 1000,
  },
  [TenantPlan.PROFESSIONAL]: {
    maxUsers: 25,
    maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
    maxApiCalls: 100000,
    maxClients: 5000,
    maxAppointmentsPerMonth: 10000,
  },
  [TenantPlan.ENTERPRISE]: {
    maxUsers: -1,            // Illimité
    maxStorage: -1,
    maxApiCalls: -1,
    maxClients: -1,
    maxAppointmentsPerMonth: -1,
  },
};
```

### Vérification des Limites

```typescript
// application/services/LimitService.ts
export class LimitService {
  constructor(
    private tenantRepo: ITenantRepository,
    private usageRepo: IUsageRepository,
  ) {}

  async checkLimit(
    tenantId: string,
    limitType: keyof TenantLimits,
    increment: number = 1
  ): Promise<void> {
    const tenant = await this.tenantRepo.findById(tenantId);
    const limit = tenant.limits[limitType];

    // -1 = illimité
    if (limit === -1) return;

    const currentUsage = await this.usageRepo.getCurrentUsage(
      tenantId,
      limitType
    );

    if (currentUsage + increment > limit) {
      throw new LimitExceededError(
        `${limitType} limit exceeded. Current: ${currentUsage}, Limit: ${limit}`
      );
    }
  }

  async incrementUsage(
    tenantId: string,
    limitType: keyof TenantLimits,
    amount: number = 1
  ): Promise<void> {
    await this.checkLimit(tenantId, limitType, amount);
    await this.usageRepo.increment(tenantId, limitType, amount);
  }
}
```

---

## Base de Données Multi-Tenant

### Schéma Prisma

```prisma
// prisma/schema.prisma

// ============================================
// TENANT
// ============================================
model Tenant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String

  // Plan
  plan              TenantPlan @default(FREE)
  stripeCustomerId  String?
  subscriptionId    String?
  subscriptionStatus SubscriptionStatus @default(TRIALING)

  // Settings (JSON)
  settings  Json     @default("{}")
  branding  Json     @default("{}")
  features  Json     @default("{}")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relations
  memberships TenantMembership[]
  users       User[]
  clients     Client[]
  appointments Appointment[]
  services    Service[]

  @@index([slug])
  @@index([stripeCustomerId])
}

enum TenantPlan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

// ============================================
// USER & MEMBERSHIP
// ============================================
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Un user peut appartenir à plusieurs tenants
  memberships TenantMembership[]

  @@index([email])
}

model TenantMembership {
  id        String     @id @default(cuid())

  userId    String
  user      User       @relation(fields: [userId], references: [id])

  tenantId  String
  tenant    Tenant     @relation(fields: [tenantId], references: [id])

  role      TenantRole @default(EMPLOYEE)

  invitedAt DateTime   @default(now())
  joinedAt  DateTime?

  @@unique([userId, tenantId])
  @@index([tenantId])
}

enum TenantRole {
  OWNER
  ADMIN
  MANAGER
  EMPLOYEE
  VIEWER
}

// ============================================
// TENANT-SCOPED ENTITIES
// ============================================
model Client {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  name      String
  email     String?
  phone     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]

  // Index composite pour queries tenant-scoped
  @@index([tenantId])
  @@index([tenantId, email])
}

model Service {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  name      String
  duration  Int      // minutes
  price     Decimal  @db.Decimal(10, 2)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]

  @@index([tenantId])
}

model Appointment {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])

  serviceId String
  service   Service  @relation(fields: [serviceId], references: [id])

  startTime DateTime
  endTime   DateTime
  status    AppointmentStatus @default(SCHEDULED)
  notes     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@index([tenantId, startTime])
  @@index([tenantId, clientId])
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Row-Level Security avec Prisma

```typescript
// infrastructure/database/TenantPrismaClient.ts
import { PrismaClient } from '@prisma/client';
import { ITenantContext } from '@/domain/contexts/TenantContext';

export function createTenantPrismaClient(
  context: ITenantContext
): PrismaClient {
  const prisma = new PrismaClient();

  // Extension pour ajouter automatiquement le tenantId
  return prisma.$extends({
    query: {
      // Pour toutes les tables avec tenantId
      $allModels: {
        async findMany({ model, operation, args, query }) {
          if (hastenantId(model)) {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }
          return query(args);
        },

        async findFirst({ model, operation, args, query }) {
          if (hasTenantId(model)) {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }
          return query(args);
        },

        async findUnique({ model, operation, args, query }) {
          const result = await query(args);
          if (result && hasTenantId(model)) {
            // Vérifier que le résultat appartient au tenant
            if ((result as any).tenantId !== context.tenantId) {
              return null;
            }
          }
          return result;
        },

        async create({ model, operation, args, query }) {
          if (hasTenantId(model)) {
            args.data = {
              ...args.data,
              tenantId: context.tenantId,
            };
          }
          return query(args);
        },

        async update({ model, operation, args, query }) {
          if (hasTenantId(model)) {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }
          return query(args);
        },

        async delete({ model, operation, args, query }) {
          if (hasTenantId(model)) {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }
          return query(args);
        },
      },
    },
  });
}

// Liste des modèles avec tenantId
const TENANT_SCOPED_MODELS = [
  'Client',
  'Service',
  'Appointment',
];

function hasTenantId(model: string): boolean {
  return TENANT_SCOPED_MODELS.includes(model);
}
```

### Repository Pattern avec Tenant

```typescript
// infrastructure/repositories/PrismaClientRepository.ts
import { IClientRepository } from '@/domain/repositories/IClientRepository';
import { Client } from '@/domain/entities/Client';
import { PrismaClient } from '@prisma/client';

export class PrismaClientRepository implements IClientRepository {
  constructor(private prisma: PrismaClient) {}

  // Le tenantId est automatiquement ajouté par l'extension
  async findAll(): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return clients.map(this.toDomain);
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    return client ? this.toDomain(client) : null;
  }

  async create(data: CreateClientDTO): Promise<Client> {
    // tenantId automatiquement ajouté
    const client = await this.prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
    return this.toDomain(client);
  }

  private toDomain(data: any): Client {
    return new Client(
      data.id,
      data.tenantId,
      data.name,
      data.email,
      data.phone,
      data.createdAt,
    );
  }
}
```

---

## Facturation et Abonnements

### Intégration Stripe

```typescript
// infrastructure/billing/StripeService.ts
import Stripe from 'stripe';
import { ITenantRepository } from '@/domain/repositories/ITenantRepository';

export class StripeService {
  private stripe: Stripe;

  constructor(
    private tenantRepo: ITenantRepository,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  // Créer un customer Stripe pour un nouveau tenant
  async createCustomer(tenant: Tenant): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: tenant.billingEmail,
      name: tenant.name,
      metadata: {
        tenant_id: tenant.id,
        tenant_slug: tenant.slug,
      },
    });

    await this.tenantRepo.update(tenant.id, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  // Créer un abonnement
  async createSubscription(
    tenantId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    const tenant = await this.tenantRepo.findById(tenantId);

    if (!tenant.stripeCustomerId) {
      throw new Error('No Stripe customer for this tenant');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: tenant.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        tenant_id: tenant.id,
      },
    });

    await this.tenantRepo.update(tenant.id, {
      subscriptionId: subscription.id,
      subscriptionStatus: this.mapStatus(subscription.status),
    });

    return subscription;
  }

  // Webhook handler
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSuccess(
          event.data.object as Stripe.Invoice
        );
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(
          event.data.object as Stripe.Invoice
        );
        break;
    }
  }

  private async handleSubscriptionChange(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const tenantId = subscription.metadata.tenant_id;

    await this.tenantRepo.update(tenantId, {
      subscriptionStatus: this.mapStatus(subscription.status),
      plan: this.mapPlanFromPrice(subscription.items.data[0].price.id),
    });
  }

  private mapStatus(status: string): SubscriptionStatus {
    const mapping: Record<string, SubscriptionStatus> = {
      'trialing': 'TRIALING',
      'active': 'ACTIVE',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELED',
      'unpaid': 'UNPAID',
    };
    return mapping[status] || 'ACTIVE';
  }

  private mapPlanFromPrice(priceId: string): TenantPlan {
    const mapping: Record<string, TenantPlan> = {
      [process.env.STRIPE_PRICE_STARTER!]: TenantPlan.STARTER,
      [process.env.STRIPE_PRICE_PRO!]: TenantPlan.PROFESSIONAL,
      [process.env.STRIPE_PRICE_ENTERPRISE!]: TenantPlan.ENTERPRISE,
    };
    return mapping[priceId] || TenantPlan.FREE;
  }
}
```

### Pricing Table

```typescript
// Prix Stripe (à configurer dans Stripe Dashboard)
export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '1 utilisateur',
      '50 clients',
      '100 RDV/mois',
      'Support email',
    ],
  },
  starter: {
    name: 'Starter',
    price: 19,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      '5 utilisateurs',
      '500 clients',
      '1000 RDV/mois',
      'Support prioritaire',
      'Rappels SMS',
    ],
  },
  professional: {
    name: 'Professional',
    price: 49,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      '25 utilisateurs',
      '5000 clients',
      'RDV illimités',
      'Support téléphone',
      'API access',
      'Analytics avancés',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Sur devis
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      'Utilisateurs illimités',
      'Clients illimités',
      'SLA garanti',
      'Support dédié',
      'Custom integrations',
      'On-premise option',
    ],
  },
};
```

---

## Performance et Scalabilité

### Caching Multi-Tenant

```typescript
// infrastructure/cache/TenantCacheService.ts
import Redis from 'ioredis';

export class TenantCacheService {
  constructor(private redis: Redis) {}

  // Clé avec namespace tenant
  private key(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  async get<T>(tenantId: string, key: string): Promise<T | null> {
    const data = await this.redis.get(this.key(tenantId, key));
    return data ? JSON.parse(data) : null;
  }

  async set(
    tenantId: string,
    key: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    await this.redis.setex(
      this.key(tenantId, key),
      ttlSeconds,
      JSON.stringify(value)
    );
  }

  async invalidate(tenantId: string, pattern: string): Promise<void> {
    const keys = await this.redis.keys(
      this.key(tenantId, pattern)
    );
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Invalider tout le cache d'un tenant
  async invalidateTenant(tenantId: string): Promise<void> {
    await this.invalidate(tenantId, '*');
  }
}
```

### Rate Limiting par Tenant

```typescript
// infrastructure/rateLimit/TenantRateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export class TenantRateLimiter {
  private limiters: Map<TenantPlan, Ratelimit> = new Map();
  private redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
    this.initLimiters();
  }

  private initLimiters(): void {
    // Limites par plan (requêtes par minute)
    this.limiters.set(
      TenantPlan.FREE,
      new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'ratelimit:free',
      })
    );

    this.limiters.set(
      TenantPlan.STARTER,
      new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        prefix: 'ratelimit:starter',
      })
    );

    this.limiters.set(
      TenantPlan.PROFESSIONAL,
      new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(500, '1 m'),
        prefix: 'ratelimit:pro',
      })
    );

    this.limiters.set(
      TenantPlan.ENTERPRISE,
      new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(2000, '1 m'),
        prefix: 'ratelimit:enterprise',
      })
    );
  }

  async checkLimit(
    tenantId: string,
    plan: TenantPlan
  ): Promise<{ success: boolean; remaining: number }> {
    const limiter = this.limiters.get(plan);
    if (!limiter) {
      throw new Error(`No limiter for plan: ${plan}`);
    }

    const { success, remaining } = await limiter.limit(tenantId);
    return { success, remaining };
  }
}
```

### Queue Processing Multi-Tenant

```typescript
// infrastructure/queue/TenantJobQueue.ts
import { Queue, Worker, Job } from 'bullmq';

export class TenantJobQueue {
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue('tenant-jobs', {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.worker = new Worker(
      'tenant-jobs',
      async (job: Job) => {
        const { tenantId, type, data } = job.data;

        // Contexte tenant pour le job
        const context = await createTenantContext(tenantId);

        switch (type) {
          case 'send-reminders':
            await this.processReminders(context, data);
            break;
          case 'generate-report':
            await this.generateReport(context, data);
            break;
          case 'sync-calendar':
            await this.syncCalendar(context, data);
            break;
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        concurrency: 5,
      }
    );
  }

  async addJob(
    tenantId: string,
    type: string,
    data: any,
    options?: { delay?: number; priority?: number }
  ): Promise<void> {
    await this.queue.add(
      type,
      { tenantId, type, data },
      {
        delay: options?.delay,
        priority: options?.priority,
        removeOnComplete: true,
        removeOnFail: 1000,
      }
    );
  }

  // Job quotidien pour chaque tenant
  async scheduleDaily(type: string, data: any): Promise<void> {
    const tenants = await getAllActiveTenants();

    for (const tenant of tenants) {
      await this.addJob(tenant.id, type, data);
    }
  }
}
```

---

## Sécurité Multi-Tenant

### Validation des Accès

```typescript
// application/guards/TenantAccessGuard.ts
export class TenantAccessGuard {
  constructor(
    private tenantRepo: ITenantRepository,
    private membershipRepo: IMembershipRepository,
  ) {}

  async validateAccess(
    userId: string,
    tenantId: string,
    requiredPermission?: string
  ): Promise<TenantMembership> {
    // Vérifier que le tenant existe et est actif
    const tenant = await this.tenantRepo.findById(tenantId);

    if (!tenant) {
      throw new TenantNotFoundError(tenantId);
    }

    if (tenant.subscriptionStatus === 'CANCELED') {
      throw new TenantSuspendedError(
        'Tenant subscription has been canceled'
      );
    }

    // Vérifier l'appartenance
    const membership = await this.membershipRepo.findByUserAndTenant(
      userId,
      tenantId
    );

    if (!membership) {
      throw new TenantAccessDeniedError(
        'User is not a member of this tenant'
      );
    }

    // Vérifier la permission si requise
    if (requiredPermission) {
      const hasPermission = this.checkPermission(
        membership.role,
        requiredPermission
      );

      if (!hasPermission) {
        throw new PermissionDeniedError(
          `Missing permission: ${requiredPermission}`
        );
      }
    }

    return membership;
  }

  private checkPermission(
    role: TenantRole,
    permission: string
  ): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
  }
}
```

### Audit Logging

```typescript
// infrastructure/audit/AuditLogger.ts
export class AuditLogger {
  constructor(private db: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLog.create({
      data: {
        tenantId: event.tenantId,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        oldValue: event.oldValue ? JSON.stringify(event.oldValue) : null,
        newValue: event.newValue ? JSON.stringify(event.newValue) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date(),
      },
    });
  }

  async getAuditTrail(
    tenantId: string,
    filters: AuditFilters
  ): Promise<AuditLog[]> {
    return this.db.auditLog.findMany({
      where: {
        tenantId,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.from && { timestamp: { gte: filters.from } }),
        ...(filters.to && { timestamp: { lte: filters.to } }),
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
    });
  }
}

interface AuditEvent {
  tenantId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}
```

### Data Encryption par Tenant

```typescript
// infrastructure/encryption/TenantEncryption.ts
import crypto from 'crypto';

export class TenantEncryption {
  private masterKey: Buffer;

  constructor() {
    this.masterKey = Buffer.from(
      process.env.MASTER_ENCRYPTION_KEY!,
      'hex'
    );
  }

  // Dériver une clé unique par tenant
  private deriveKey(tenantId: string): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      tenantId, // Salt = tenant ID
      100000,
      32,
      'sha256'
    );
  }

  encrypt(tenantId: string, plaintext: string): string {
    const key = this.deriveKey(tenantId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(tenantId: string, ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

    const key = this.deriveKey(tenantId);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

---

## Monitoring et Analytics

### Métriques par Tenant

```typescript
// infrastructure/metrics/TenantMetrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export class TenantMetrics {
  // Requêtes API par tenant
  private apiRequests = new Counter({
    name: 'api_requests_total',
    help: 'Total API requests',
    labelNames: ['tenant_id', 'method', 'path', 'status'],
  });

  // Latence par tenant
  private apiLatency = new Histogram({
    name: 'api_request_duration_seconds',
    help: 'API request duration',
    labelNames: ['tenant_id', 'method', 'path'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  // Utilisateurs actifs par tenant
  private activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['tenant_id'],
  });

  // Usage storage par tenant
  private storageUsage = new Gauge({
    name: 'storage_usage_bytes',
    help: 'Storage usage in bytes',
    labelNames: ['tenant_id'],
  });

  recordRequest(
    tenantId: string,
    method: string,
    path: string,
    status: number,
    duration: number
  ): void {
    this.apiRequests.inc({
      tenant_id: tenantId,
      method,
      path: this.normalizePath(path),
      status: String(status),
    });

    this.apiLatency.observe(
      { tenant_id: tenantId, method, path: this.normalizePath(path) },
      duration
    );
  }

  setActiveUsers(tenantId: string, count: number): void {
    this.activeUsers.set({ tenant_id: tenantId }, count);
  }

  setStorageUsage(tenantId: string, bytes: number): void {
    this.storageUsage.set({ tenant_id: tenantId }, bytes);
  }

  private normalizePath(path: string): string {
    // Normaliser les IDs dans les paths
    return path.replace(/\/[a-z0-9]{24,}/gi, '/:id');
  }
}
```

### Analytics Dashboard

```typescript
// application/services/TenantAnalyticsService.ts
export class TenantAnalyticsService {
  constructor(
    private db: PrismaClient,
    private cache: TenantCacheService,
  ) {}

  async getDashboardMetrics(
    tenantId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:${period}`;
    const cached = await this.cache.get<DashboardMetrics>(
      tenantId,
      cacheKey
    );

    if (cached) return cached;

    const { start, end } = this.getPeriodRange(period);

    const [
      appointments,
      revenue,
      newClients,
      topServices,
    ] = await Promise.all([
      this.getAppointmentStats(tenantId, start, end),
      this.getRevenueStats(tenantId, start, end),
      this.getNewClientsCount(tenantId, start, end),
      this.getTopServices(tenantId, start, end),
    ]);

    const metrics = {
      appointments,
      revenue,
      newClients,
      topServices,
      period: { start, end },
    };

    // Cache pour 5 minutes
    await this.cache.set(tenantId, cacheKey, metrics, 300);

    return metrics;
  }

  private async getAppointmentStats(
    tenantId: string,
    start: Date,
    end: Date
  ): Promise<AppointmentStats> {
    const appointments = await this.db.appointment.groupBy({
      by: ['status'],
      where: {
        tenantId,
        startTime: { gte: start, lte: end },
      },
      _count: true,
    });

    const total = appointments.reduce((sum, a) => sum + a._count, 0);
    const completed = appointments.find(
      a => a.status === 'COMPLETED'
    )?._count || 0;
    const cancelled = appointments.find(
      a => a.status === 'CANCELLED'
    )?._count || 0;

    return {
      total,
      completed,
      cancelled,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  private async getRevenueStats(
    tenantId: string,
    start: Date,
    end: Date
  ): Promise<RevenueStats> {
    const result = await this.db.appointment.aggregate({
      where: {
        tenantId,
        status: 'COMPLETED',
        startTime: { gte: start, lte: end },
      },
      _sum: {
        totalPrice: true,
      },
      _count: true,
    });

    return {
      total: result._sum.totalPrice || 0,
      transactionCount: result._count,
      averageTicket: result._count > 0
        ? (result._sum.totalPrice || 0) / result._count
        : 0,
    };
  }
}
```

---

## Checklist de Mise en Production

### Infrastructure

- [ ] Stratégie d'isolation choisie (Pool recommandé)
- [ ] Schéma DB avec tenant_id sur toutes les tables
- [ ] Index composites (tenant_id, ...) créés
- [ ] Row-Level Security ou middleware de filtrage
- [ ] Backups avec isolation par tenant possible
- [ ] Disaster Recovery plan multi-tenant

### Authentification & Autorisation

- [ ] Identification tenant (subdomain/path/header)
- [ ] JWT avec tenant_id et rôle
- [ ] RBAC implémenté et testé
- [ ] Multi-tenant membership pour utilisateurs
- [ ] Isolation vérifiée (tests cross-tenant)

### Performance

- [ ] Cache avec namespace tenant
- [ ] Rate limiting par tenant et plan
- [ ] Quotas et limites par plan
- [ ] Monitoring par tenant (métriques, logs)
- [ ] Connection pooling optimisé

### Facturation

- [ ] Plans définis (Free, Starter, Pro, Enterprise)
- [ ] Stripe intégré (customers, subscriptions)
- [ ] Webhooks Stripe configurés
- [ ] Limites par plan implémentées
- [ ] Upgrade/Downgrade fonctionnel
- [ ] Emails de facturation configurés

### Sécurité

- [ ] Audit logging actif
- [ ] Encryption des données sensibles
- [ ] Tests de pénétration cross-tenant
- [ ] RGPD : export et suppression par tenant
- [ ] Isolation réseau si nécessaire (Enterprise)

### Onboarding

- [ ] Création de tenant automatisée
- [ ] Configuration initiale (settings, branding)
- [ ] Invitation du premier utilisateur
- [ ] Email de bienvenue
- [ ] Guide de démarrage in-app

### Monitoring

- [ ] Dashboards par tenant
- [ ] Alertes sur limites
- [ ] Health checks par tenant
- [ ] SLA monitoring (Enterprise)

---

## Ressources

### Liens Utiles

- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/other/multi-tenancy)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Stripe Billing Documentation](https://stripe.com/docs/billing)
- [Multi-tenant SaaS Architecture](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

### Templates Disponibles

- `templates/saas/prisma-schema.prisma` - Schéma complet multi-tenant
- `templates/saas/tenant-middleware.ts` - Middleware d'identification
- `templates/saas/stripe-service.ts` - Service Stripe complet
- `templates/saas/rbac-config.ts` - Configuration RBAC

---

**Dernière mise à jour** : 2026-01-18
**Version** : 1.0
