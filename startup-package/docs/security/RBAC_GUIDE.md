# Guide RBAC - Role-Based Access Control

> Guide complet pour implémenter un système de contrôle d'accès basé sur les rôles

---

## Table des Matières

1. [Introduction au RBAC](#introduction-au-rbac)
2. [Modèle de Données](#modèle-de-données)
3. [Architecture RBAC](#architecture-rbac)
4. [Implémentation Next.js](#implémentation-nextjs)
5. [Protection des Routes](#protection-des-routes)
6. [Protection des API](#protection-des-api)
7. [UI Conditionnelle](#ui-conditionnelle)
8. [ABAC - Attribute-Based Access Control](#abac---attribute-based-access-control)
9. [Audit et Logging](#audit-et-logging)
10. [Bonnes Pratiques](#bonnes-pratiques)

---

## Introduction au RBAC

### Qu'est-ce que le RBAC ?

Le **Role-Based Access Control** est un modèle de sécurité où les permissions sont assignées à des rôles, et les utilisateurs reçoivent des rôles.

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Users   │────▶│  Roles   │────▶│ Permissions  │
└──────────┘     └──────────┘     └──────────────┘
     │                │                   │
     │                │                   │
   John ──────▶   Admin   ──────▶  users:create
   Jane ──────▶   Manager ──────▶  users:read
   Bob  ──────▶   User    ──────▶  users:update
```

### Terminologie

| Terme | Description | Exemple |
|-------|-------------|---------|
| **User** | Entité qui effectue des actions | john@example.com |
| **Role** | Ensemble de permissions | admin, manager, user |
| **Permission** | Action autorisée sur une ressource | users:create, posts:delete |
| **Resource** | Objet protégé | users, posts, settings |
| **Action** | Opération sur une ressource | create, read, update, delete |

### RBAC vs ABAC

| RBAC | ABAC |
|------|------|
| Basé sur les rôles | Basé sur les attributs |
| Simple à implémenter | Plus flexible |
| Moins granulaire | Très granulaire |
| `role === 'admin'` | `user.department === resource.department && user.level >= 3` |

---

## Modèle de Données

### Schéma Prisma

```prisma
// prisma/schema.prisma

// Utilisateur
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  password      String
  roles         UserRole[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Pour ABAC
  department    String?
  level         Int            @default(1)

  // Audit
  auditLogs     AuditLog[]
}

// Rôle
model Role {
  id            String         @id @default(cuid())
  name          String         @unique
  description   String?
  permissions   RolePermission[]
  users         UserRole[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Hiérarchie (optionnel)
  parentId      String?
  parent        Role?          @relation("RoleHierarchy", fields: [parentId], references: [id])
  children      Role[]         @relation("RoleHierarchy")
}

// Permission
model Permission {
  id            String         @id @default(cuid())
  name          String         @unique  // format: resource:action
  description   String?
  resource      String                  // users, posts, settings
  action        String                  // create, read, update, delete
  roles         RolePermission[]
  createdAt     DateTime       @default(now())
}

// Relation User-Role (many-to-many)
model UserRole {
  userId        String
  roleId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  role          Role           @relation(fields: [roleId], references: [id], onDelete: Cascade)
  assignedAt    DateTime       @default(now())
  assignedBy    String?

  @@id([userId, roleId])
}

// Relation Role-Permission (many-to-many)
model RolePermission {
  roleId        String
  permissionId  String
  role          Role           @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission    Permission     @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

// Audit Log
model AuditLog {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  action        String         // LOGIN, LOGOUT, CREATE, UPDATE, DELETE
  resource      String         // users, posts, settings
  resourceId    String?
  details       Json?
  ip            String?
  userAgent     String?
  createdAt     DateTime       @default(now())

  @@index([userId, createdAt])
  @@index([resource, action])
}
```

### Seed Initial

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Users
  { name: 'users:create', resource: 'users', action: 'create', description: 'Créer des utilisateurs' },
  { name: 'users:read', resource: 'users', action: 'read', description: 'Voir les utilisateurs' },
  { name: 'users:update', resource: 'users', action: 'update', description: 'Modifier les utilisateurs' },
  { name: 'users:delete', resource: 'users', action: 'delete', description: 'Supprimer des utilisateurs' },

  // Roles
  { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Gérer les rôles' },

  // Appointments
  { name: 'appointments:create', resource: 'appointments', action: 'create', description: 'Créer des rendez-vous' },
  { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'Voir les rendez-vous' },
  { name: 'appointments:read:own', resource: 'appointments', action: 'read:own', description: 'Voir ses rendez-vous' },
  { name: 'appointments:update', resource: 'appointments', action: 'update', description: 'Modifier les rendez-vous' },
  { name: 'appointments:delete', resource: 'appointments', action: 'delete', description: 'Supprimer des rendez-vous' },

  // Reports
  { name: 'reports:view', resource: 'reports', action: 'view', description: 'Voir les rapports' },
  { name: 'reports:export', resource: 'reports', action: 'export', description: 'Exporter les rapports' },

  // Settings
  { name: 'settings:manage', resource: 'settings', action: 'manage', description: 'Gérer les paramètres' },
];

const ROLES = [
  {
    name: 'super_admin',
    description: 'Accès total au système',
    permissions: PERMISSIONS.map(p => p.name), // Toutes les permissions
  },
  {
    name: 'admin',
    description: 'Administration générale',
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'appointments:create', 'appointments:read', 'appointments:update', 'appointments:delete',
      'reports:view', 'reports:export',
      'settings:manage',
    ],
  },
  {
    name: 'manager',
    description: 'Gestion des opérations',
    permissions: [
      'users:read',
      'appointments:create', 'appointments:read', 'appointments:update',
      'reports:view',
    ],
  },
  {
    name: 'employee',
    description: 'Employé standard',
    permissions: [
      'appointments:create', 'appointments:read:own', 'appointments:update',
    ],
  },
  {
    name: 'client',
    description: 'Client',
    permissions: [
      'appointments:read:own',
    ],
  },
];

async function main() {
  console.log('Seeding permissions...');

  // Créer les permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log('Seeding roles...');

  // Créer les rôles avec leurs permissions
  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });

    // Assigner les permissions
    for (const permName of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log('Creating admin user...');

  // Créer un utilisateur admin
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
    },
  });

  // Assigner le rôle super_admin
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Architecture RBAC

### Service de Permissions

```typescript
// lib/rbac/permission-service.ts
import { prisma } from '@/lib/prisma';

export type Permission = `${string}:${string}`;

export interface UserWithPermissions {
  id: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

/**
 * Service de gestion des permissions
 */
export class PermissionService {
  /**
   * Récupère toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
                // Inclure les permissions héritées (hiérarchie)
                parent: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const permissions = new Set<Permission>();

    for (const userRole of user.roles) {
      // Permissions directes du rôle
      for (const rp of userRole.role.permissions) {
        permissions.add(rp.permission.name as Permission);
      }

      // Permissions héritées du rôle parent
      if (userRole.role.parent) {
        for (const rp of userRole.role.parent.permissions) {
          permissions.add(rp.permission.name as Permission);
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Récupère les rôles d'un utilisateur
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return userRoles.map((ur) => ur.role.name);
  }

  /**
   * Vérifie si un utilisateur a une permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * Vérifie si un utilisateur a au moins une des permissions
   */
  async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Vérifie si un utilisateur a toutes les permissions
   */
  async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((p) => userPermissions.includes(p));
  }

  /**
   * Vérifie si un utilisateur a un rôle
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(roleName);
  }

  /**
   * Récupère l'utilisateur avec ses permissions (pour le contexte)
   */
  async getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) return null;

    const [roles, permissions] = await Promise.all([
      this.getUserRoles(userId),
      this.getUserPermissions(userId),
    ]);

    return {
      ...user,
      roles,
      permissions,
    };
  }

  /**
   * Assigne un rôle à un utilisateur
   */
  async assignRole(userId: string, roleName: string, assignedBy?: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role "${roleName}" not found`);

    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      update: { assignedBy },
      create: {
        userId,
        roleId: role.id,
        assignedBy,
      },
    });
  }

  /**
   * Retire un rôle à un utilisateur
   */
  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role "${roleName}" not found`);

    await prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
    });
  }
}

// Singleton
export const permissionService = new PermissionService();
```

### Cache des Permissions

```typescript
// lib/rbac/permission-cache.ts
import { Permission, permissionService } from './permission-service';

interface CachedPermissions {
  permissions: Permission[];
  roles: string[];
  cachedAt: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const permissionCache = new Map<string, CachedPermissions>();

export async function getCachedPermissions(userId: string): Promise<CachedPermissions> {
  const cached = permissionCache.get(userId);

  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached;
  }

  const [permissions, roles] = await Promise.all([
    permissionService.getUserPermissions(userId),
    permissionService.getUserRoles(userId),
  ]);

  const data: CachedPermissions = {
    permissions,
    roles,
    cachedAt: Date.now(),
  };

  permissionCache.set(userId, data);

  return data;
}

export function invalidatePermissionCache(userId: string): void {
  permissionCache.delete(userId);
}

export function invalidateAllPermissionCache(): void {
  permissionCache.clear();
}
```

---

## Implémentation Next.js

### Context RBAC

```typescript
// lib/rbac/context.ts
import { createContext, useContext } from 'react';
import type { Permission } from './permission-service';

export interface RBACContextValue {
  permissions: Permission[];
  roles: string[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isLoading: boolean;
}

export const RBACContext = createContext<RBACContextValue | null>(null);

export function useRBAC(): RBACContextValue {
  const context = useContext(RBACContext);

  if (!context) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }

  return context;
}
```

### Provider RBAC

```tsx
// components/providers/RBACProvider.tsx
'use client';

import { ReactNode, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { RBACContext, type RBACContextValue } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

interface RBACProviderProps {
  children: ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { data: session, status } = useSession();

  // Extraire les permissions et rôles de la session
  const permissions = useMemo<Permission[]>(() => {
    return (session?.user?.permissions as Permission[]) || [];
  }, [session?.user?.permissions]);

  const roles = useMemo<string[]>(() => {
    return session?.user?.roles || [];
  }, [session?.user?.roles]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: Permission[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (r: string[]): boolean => {
      return r.some((role) => roles.includes(role));
    },
    [roles]
  );

  const value: RBACContextValue = useMemo(
    () => ({
      permissions,
      roles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      isLoading: status === 'loading',
    }),
    [permissions, roles, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, status]
  );

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}
```

### Hooks RBAC

```typescript
// hooks/usePermission.ts
'use client';

import { useRBAC } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

/**
 * Hook pour vérifier une permission spécifique
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission, isLoading } = useRBAC();

  if (isLoading) return false;

  return hasPermission(permission);
}

/**
 * Hook pour vérifier plusieurs permissions (OR)
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission, isLoading } = useRBAC();

  if (isLoading) return false;

  return hasAnyPermission(permissions);
}

/**
 * Hook pour vérifier plusieurs permissions (AND)
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions, isLoading } = useRBAC();

  if (isLoading) return false;

  return hasAllPermissions(permissions);
}

/**
 * Hook pour vérifier un rôle
 */
export function useRole(role: string): boolean {
  const { hasRole, isLoading } = useRBAC();

  if (isLoading) return false;

  return hasRole(role);
}

/**
 * Hook pour vérifier plusieurs rôles (OR)
 */
export function useAnyRole(roles: string[]): boolean {
  const { hasAnyRole, isLoading } = useRBAC();

  if (isLoading) return false;

  return hasAnyRole(roles);
}
```

---

## Protection des Routes

### Middleware de Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configuration des routes protégées
const protectedRoutes: Record<string, { permissions?: string[]; roles?: string[] }> = {
  '/admin': { roles: ['super_admin', 'admin'] },
  '/admin/users': { permissions: ['users:read'] },
  '/admin/settings': { permissions: ['settings:manage'] },
  '/dashboard': { roles: ['admin', 'manager', 'employee'] },
  '/reports': { permissions: ['reports:view'] },
};

// Routes publiques (bypass)
const publicRoutes = ['/auth', '/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les routes publiques
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Récupérer le token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Rediriger vers login si non authentifié
  if (!token) {
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier les permissions pour les routes protégées
  for (const [route, config] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRoles = (token.roles as string[]) || [];
      const userPermissions = (token.permissions as string[]) || [];

      // Vérifier les rôles requis
      if (config.roles && config.roles.length > 0) {
        const hasRequiredRole = config.roles.some((role) => userRoles.includes(role));
        if (!hasRequiredRole) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Vérifier les permissions requises
      if (config.permissions && config.permissions.length > 0) {
        const hasRequiredPermission = config.permissions.some((perm) =>
          userPermissions.includes(perm)
        );
        if (!hasRequiredPermission) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### HOC de Protection (Client)

```tsx
// components/auth/withPermission.tsx
'use client';

import { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

interface WithPermissionOptions {
  permissions?: Permission[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPermissionOptions
) {
  const {
    permissions = [],
    roles = [],
    requireAll = false,
    fallback = null,
    redirectTo,
  } = options;

  return function WithPermissionWrapper(props: P) {
    const router = useRouter();
    const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole, hasAnyRole, isLoading } = useRBAC();

    if (isLoading) {
      return <div>Chargement...</div>;
    }

    let hasAccess = true;

    // Vérifier les permissions
    if (permissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // Vérifier les rôles
    if (hasAccess && roles.length > 0) {
      hasAccess = requireAll
        ? roles.every((role) => hasRole(role))
        : hasAnyRole(roles);
    }

    if (!hasAccess) {
      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }
      return <>{fallback}</>;
    }

    return <WrappedComponent {...props} />;
  };
}

// Usage:
// const ProtectedComponent = withPermission(MyComponent, {
//   permissions: ['users:read'],
//   redirectTo: '/unauthorized',
// });
```

### Composant de Protection Déclaratif

```tsx
// components/auth/ProtectedRoute.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = <UnauthorizedMessage />,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isLoading,
  } = useRBAC();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  let hasAccess = true;

  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (hasAccess && roles.length > 0) {
    hasAccess = requireAll
      ? roles.every((r) => hasRole(r))
      : hasAnyRole(roles);
  }

  if (!hasAccess) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

function UnauthorizedMessage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Accès non autorisé
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
    </div>
  );
}
```

**Usage:**

```tsx
// app/admin/users/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserList } from '@/components/admin/UserList';

export default function UsersPage() {
  return (
    <ProtectedRoute
      permissions={['users:read']}
      redirectTo="/unauthorized"
    >
      <UserList />
    </ProtectedRoute>
  );
}
```

---

## Protection des API

### Middleware API

```typescript
// lib/rbac/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { permissionService, type Permission } from './permission-service';
import { auditLogger } from './audit-logger';

interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

type ApiHandler = (
  request: NextRequest,
  context: { auth: AuthContext; params?: Record<string, string> }
) => Promise<NextResponse>;

interface ProtectOptions {
  permissions?: Permission[];
  roles?: string[];
  requireAll?: boolean;
  auditAction?: string;
}

/**
 * Wrapper pour protéger les routes API
 */
export function withAuth(handler: ApiHandler, options: ProtectOptions = {}) {
  return async (request: NextRequest, { params }: { params?: Record<string, string> } = {}) => {
    const {
      permissions = [],
      roles = [],
      requireAll = false,
      auditAction,
    } = options;

    try {
      // Récupérer la session
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      // Récupérer les permissions et rôles de l'utilisateur
      const [userPermissions, userRoles] = await Promise.all([
        permissionService.getUserPermissions(userId),
        permissionService.getUserRoles(userId),
      ]);

      // Vérifier les permissions
      if (permissions.length > 0) {
        const hasRequired = requireAll
          ? permissions.every((p) => userPermissions.includes(p))
          : permissions.some((p) => userPermissions.includes(p));

        if (!hasRequired) {
          await auditLogger.log({
            userId,
            action: 'ACCESS_DENIED',
            resource: request.nextUrl.pathname,
            details: { requiredPermissions: permissions },
            ip: request.ip,
            userAgent: request.headers.get('user-agent'),
          });

          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          );
        }
      }

      // Vérifier les rôles
      if (roles.length > 0) {
        const hasRequired = requireAll
          ? roles.every((r) => userRoles.includes(r))
          : roles.some((r) => userRoles.includes(r));

        if (!hasRequired) {
          await auditLogger.log({
            userId,
            action: 'ACCESS_DENIED',
            resource: request.nextUrl.pathname,
            details: { requiredRoles: roles },
            ip: request.ip,
            userAgent: request.headers.get('user-agent'),
          });

          return NextResponse.json(
            { error: 'Rôle insuffisant' },
            { status: 403 }
          );
        }
      }

      // Contexte d'authentification
      const authContext: AuthContext = {
        userId,
        email: session.user.email!,
        roles: userRoles,
        permissions: userPermissions,
      };

      // Logger l'action si spécifiée
      if (auditAction) {
        await auditLogger.log({
          userId,
          action: auditAction,
          resource: request.nextUrl.pathname,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
        });
      }

      // Exécuter le handler
      return await handler(request, { auth: authContext, params });

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  };
}
```

### Usage dans les API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac/api-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/users - Liste des utilisateurs
export const GET = withAuth(
  async (request, { auth }) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: {
          include: { role: true },
        },
      },
    });

    return NextResponse.json(users);
  },
  {
    permissions: ['users:read'],
    auditAction: 'USERS_LIST',
  }
);

// POST /api/users - Créer un utilisateur
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  roles: z.array(z.string()).optional(),
});

export const POST = withAuth(
  async (request, { auth }) => {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Vérifier si l'utilisateur peut assigner des rôles
    if (data.roles && data.roles.length > 0) {
      const canManageRoles = auth.permissions.includes('roles:manage');
      if (!canManageRoles) {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas assigner de rôles' },
          { status: 403 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: await hashPassword(data.password),
      },
    });

    return NextResponse.json(user, { status: 201 });
  },
  {
    permissions: ['users:create'],
    auditAction: 'USER_CREATE',
  }
);
```

---

## UI Conditionnelle

### Composant Can (Affichage conditionnel)

```tsx
// components/auth/Can.tsx
'use client';

import { ReactNode } from 'react';
import { useRBAC } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

interface CanProps {
  children: ReactNode;
  /** Permission requise */
  permission?: Permission;
  /** Permissions requises (OR par défaut) */
  permissions?: Permission[];
  /** Rôle requis */
  role?: string;
  /** Rôles requis (OR par défaut) */
  roles?: string[];
  /** Exiger toutes les permissions/rôles (AND) */
  requireAll?: boolean;
  /** Inverser la condition */
  not?: boolean;
  /** Contenu à afficher si non autorisé */
  fallback?: ReactNode;
}

export function Can({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  not = false,
  fallback = null,
}: CanProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isLoading,
  } = useRBAC();

  if (isLoading) {
    return null;
  }

  // Fusionner permission unique avec le tableau
  const allPermissions = permission ? [permission, ...permissions] : permissions;
  const allRoles = role ? [role, ...roles] : roles;

  let hasAccess = true;

  // Vérifier les permissions
  if (allPermissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions);
  }

  // Vérifier les rôles
  if (hasAccess && allRoles.length > 0) {
    hasAccess = requireAll
      ? allRoles.every((r) => hasRole(r))
      : hasAnyRole(allRoles);
  }

  // Inverser si 'not' est true
  if (not) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
```

**Usage:**

```tsx
// Afficher un bouton uniquement si l'utilisateur peut créer des utilisateurs
<Can permission="users:create">
  <Button onClick={handleCreate}>Nouvel utilisateur</Button>
</Can>

// Afficher un menu admin
<Can roles={['admin', 'super_admin']}>
  <AdminMenu />
</Can>

// Afficher un message si l'utilisateur N'A PAS la permission
<Can permission="premium:access" not fallback={<UpgradePrompt />}>
  <PremiumContent />
</Can>

// Exiger plusieurs permissions
<Can permissions={['reports:view', 'reports:export']} requireAll>
  <ExportButton />
</Can>
```

### Hook useCanAccess

```typescript
// hooks/useCanAccess.ts
'use client';

import { useMemo } from 'react';
import { useRBAC } from '@/lib/rbac/context';
import type { Permission } from '@/lib/rbac/permission-service';

interface UseCanAccessOptions {
  permissions?: Permission[];
  roles?: string[];
  requireAll?: boolean;
}

export function useCanAccess(options: UseCanAccessOptions): boolean {
  const { hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading } = useRBAC();

  return useMemo(() => {
    if (isLoading) return false;

    const { permissions = [], roles = [], requireAll = false } = options;

    let hasAccess = true;

    if (permissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    if (hasAccess && roles.length > 0) {
      hasAccess = requireAll
        ? roles.every((r) => hasRole(r))
        : hasAnyRole(roles);
    }

    return hasAccess;
  }, [options, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading]);
}
```

**Usage:**

```tsx
function UserActions({ userId }: { userId: string }) {
  const canEdit = useCanAccess({ permissions: ['users:update'] });
  const canDelete = useCanAccess({ permissions: ['users:delete'] });

  return (
    <div className="flex gap-2">
      {canEdit && <Button onClick={() => editUser(userId)}>Modifier</Button>}
      {canDelete && <Button variant="danger" onClick={() => deleteUser(userId)}>Supprimer</Button>}
    </div>
  );
}
```

---

## ABAC - Attribute-Based Access Control

### Extension du RBAC avec ABAC

```typescript
// lib/rbac/abac-service.ts
import type { Permission } from './permission-service';

interface ABACContext {
  user: {
    id: string;
    roles: string[];
    permissions: Permission[];
    department?: string;
    level?: number;
  };
  resource?: {
    id?: string;
    type: string;
    ownerId?: string;
    department?: string;
  };
  action: string;
  environment?: {
    ip?: string;
    time?: Date;
    location?: string;
  };
}

type ABACRule = (context: ABACContext) => boolean;

/**
 * Règles ABAC personnalisées
 */
const abacRules: Record<string, ABACRule> = {
  // L'utilisateur peut voir ses propres ressources
  'own_resource': (ctx) => {
    return ctx.resource?.ownerId === ctx.user.id;
  },

  // L'utilisateur peut voir les ressources de son département
  'same_department': (ctx) => {
    return ctx.user.department === ctx.resource?.department;
  },

  // L'utilisateur de niveau >= 3 peut approuver
  'can_approve': (ctx) => {
    return (ctx.user.level ?? 0) >= 3;
  },

  // Accès uniquement pendant les heures de bureau
  'business_hours': (ctx) => {
    const hour = (ctx.environment?.time ?? new Date()).getHours();
    return hour >= 9 && hour <= 18;
  },

  // Manager peut gérer les utilisateurs de son département
  'department_manager': (ctx) => {
    const isManager = ctx.user.roles.includes('manager');
    const sameDept = ctx.user.department === ctx.resource?.department;
    return isManager && sameDept;
  },
};

export class ABACService {
  /**
   * Vérifie si l'accès est autorisé selon les règles ABAC
   */
  evaluate(context: ABACContext, rules: string[]): boolean {
    return rules.every((ruleName) => {
      const rule = abacRules[ruleName];
      if (!rule) {
        console.warn(`ABAC rule "${ruleName}" not found`);
        return false;
      }
      return rule(context);
    });
  }

  /**
   * Vérifie l'accès combiné RBAC + ABAC
   */
  checkAccess(
    context: ABACContext,
    options: {
      permissions?: Permission[];
      roles?: string[];
      abacRules?: string[];
      requireAll?: boolean;
    }
  ): boolean {
    const { permissions = [], roles = [], abacRules: rules = [], requireAll = false } = options;

    // Vérifier RBAC (permissions)
    let rbacAccess = true;
    if (permissions.length > 0) {
      rbacAccess = requireAll
        ? permissions.every((p) => context.user.permissions.includes(p))
        : permissions.some((p) => context.user.permissions.includes(p));
    }

    // Vérifier RBAC (rôles)
    if (rbacAccess && roles.length > 0) {
      rbacAccess = requireAll
        ? roles.every((r) => context.user.roles.includes(r))
        : roles.some((r) => context.user.roles.includes(r));
    }

    // Vérifier ABAC
    let abacAccess = true;
    if (rules.length > 0) {
      abacAccess = this.evaluate(context, rules);
    }

    return rbacAccess && abacAccess;
  }
}

export const abacService = new ABACService();
```

**Usage:**

```typescript
// Vérifier si un utilisateur peut modifier un document
const canEdit = abacService.checkAccess(
  {
    user: {
      id: currentUser.id,
      roles: currentUser.roles,
      permissions: currentUser.permissions,
      department: currentUser.department,
    },
    resource: {
      type: 'document',
      ownerId: document.authorId,
      department: document.department,
    },
    action: 'update',
  },
  {
    permissions: ['documents:update'],
    abacRules: ['own_resource', 'same_department'], // OU propriétaire OU même département
  }
);
```

---

## Audit et Logging

### Service d'Audit

```typescript
// lib/rbac/audit-logger.ts
import { prisma } from '@/lib/prisma';

interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string | null;
  userAgent?: string | null;
}

class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details ?? undefined,
          ip: entry.ip ?? undefined,
          userAgent: entry.userAgent ?? undefined,
        },
      });
    } catch (error) {
      // Ne pas faire échouer l'opération principale si le log échoue
      console.error('Audit log failed:', error);
    }
  }

  async getLogsForUser(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      action?: string;
      limit?: number;
    }
  ) {
    const { startDate, endDate, action, limit = 100 } = options ?? {};

    return prisma.auditLog.findMany({
      where: {
        userId,
        ...(action && { action }),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLogsForResource(
    resource: string,
    resourceId?: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ) {
    const { startDate, endDate, limit = 100 } = options ?? {};

    return prisma.auditLog.findMany({
      where: {
        resource,
        ...(resourceId && { resourceId }),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }
}

export const auditLogger = new AuditLogger();
```

---

## Bonnes Pratiques

### Checklist RBAC

- [ ] Principe du moindre privilège (permissions minimales nécessaires)
- [ ] Séparation des devoirs (pas de rôle tout-puissant)
- [ ] Rôles basés sur les fonctions métier (pas sur les personnes)
- [ ] Permissions granulaires (resource:action)
- [ ] Audit de toutes les actions sensibles
- [ ] Cache des permissions avec invalidation
- [ ] Tests de sécurité pour chaque route
- [ ] Documentation des rôles et permissions
- [ ] Revue régulière des accès
- [ ] Processus de demande/approbation de rôles

### Patterns Recommandés

```typescript
// ✅ BON : Permissions granulaires
'users:create'
'users:read'
'users:update'
'users:delete'

// ❌ MAUVAIS : Permissions trop larges
'users:admin'
'full_access'

// ✅ BON : Vérification côté serveur ET client
// Server
export const GET = withAuth(handler, { permissions: ['users:read'] });

// Client
<Can permission="users:read">
  <UserList />
</Can>

// ❌ MAUVAIS : Vérification uniquement côté client
// (l'API est accessible directement)
```

### Hiérarchie des Rôles

```
super_admin
    │
    ├── admin
    │      │
    │      ├── manager
    │      │      │
    │      │      └── employee
    │      │
    │      └── support
    │
    └── auditor (lecture seule)
```

---

## Ressources

- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [Casbin](https://casbin.org/) - Bibliothèque d'autorisation
- [CASL](https://casl.js.org/) - Bibliothèque ABAC pour JavaScript

---

**Dernière mise à jour** : 2026-01-17
