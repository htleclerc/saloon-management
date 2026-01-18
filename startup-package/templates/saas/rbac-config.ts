// =============================================================================
// RBAC Configuration - Multi-Tenant SaaS
// =============================================================================
// Configuration complète pour Role-Based Access Control multi-tenant
//
// Features :
// - Rôles prédéfinis par tenant
// - Permissions granulaires
// - Helpers de vérification
// - Composants React pour l'UI
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

/**
 * Rôles disponibles dans un tenant
 */
export enum TenantRole {
  OWNER = 'owner',       // Propriétaire du tenant (1 seul)
  ADMIN = 'admin',       // Administrateur complet
  MANAGER = 'manager',   // Gestionnaire (RH, planning)
  EMPLOYEE = 'employee', // Employé standard
  VIEWER = 'viewer',     // Lecture seule
}

/**
 * Ressources du système
 */
export type Resource =
  | 'tenant'
  | 'users'
  | 'clients'
  | 'services'
  | 'appointments'
  | 'invoices'
  | 'reports'
  | 'settings'
  | 'billing'
  | 'integrations';

/**
 * Actions possibles sur une ressource
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';

/**
 * Format d'une permission : "resource:action" ou "resource:*"
 */
export type Permission = `${Resource}:${Action}` | `${Resource}:*` | '*';

/**
 * Contexte d'une permission (pour restrictions supplémentaires)
 */
export interface PermissionContext {
  // Restreindre à ses propres ressources
  own?: boolean;
  // Restreindre à un sous-ensemble
  subset?: string[];
}

// =============================================================================
// CONFIGURATION DES PERMISSIONS
// =============================================================================

/**
 * Mapping rôle → permissions
 */
export const ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  [TenantRole.OWNER]: [
    '*', // Accès complet à tout
  ],

  [TenantRole.ADMIN]: [
    'users:*',
    'clients:*',
    'services:*',
    'appointments:*',
    'invoices:*',
    'reports:*',
    'settings:*',
    'billing:read',
    'integrations:*',
  ],

  [TenantRole.MANAGER]: [
    'users:read',
    'clients:*',
    'services:read',
    'services:update',
    'appointments:*',
    'invoices:read',
    'invoices:create',
    'reports:read',
    'settings:read',
  ],

  [TenantRole.EMPLOYEE]: [
    'clients:read',
    'clients:create',
    'clients:update',
    'services:read',
    'appointments:read',
    'appointments:create',
    'appointments:update',
  ],

  [TenantRole.VIEWER]: [
    'clients:read',
    'services:read',
    'appointments:read',
    'reports:read',
  ],
};

/**
 * Permissions avec contexte (restrictions supplémentaires)
 */
export const ROLE_PERMISSION_CONTEXTS: Partial<
  Record<TenantRole, Record<Permission, PermissionContext>>
> = {
  [TenantRole.EMPLOYEE]: {
    'appointments:update': { own: true }, // Ne peut modifier que ses propres RDV
    'appointments:delete': { own: true },
  },
};

/**
 * Description des rôles (pour l'UI)
 */
export const ROLE_DESCRIPTIONS: Record<TenantRole, { label: string; description: string }> = {
  [TenantRole.OWNER]: {
    label: 'Propriétaire',
    description: 'Accès complet incluant facturation et suppression du compte',
  },
  [TenantRole.ADMIN]: {
    label: 'Administrateur',
    description: 'Gestion complète sauf facturation et suppression',
  },
  [TenantRole.MANAGER]: {
    label: 'Manager',
    description: 'Gestion des clients, RDV et consultation des rapports',
  },
  [TenantRole.EMPLOYEE]: {
    label: 'Employé',
    description: 'Création et gestion de ses propres RDV',
  },
  [TenantRole.VIEWER]: {
    label: 'Observateur',
    description: 'Consultation uniquement, aucune modification',
  },
};

/**
 * Hiérarchie des rôles (un rôle inclut les permissions des rôles inférieurs)
 */
export const ROLE_HIERARCHY: Record<TenantRole, TenantRole[]> = {
  [TenantRole.OWNER]: [TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.EMPLOYEE, TenantRole.VIEWER],
  [TenantRole.ADMIN]: [TenantRole.MANAGER, TenantRole.EMPLOYEE, TenantRole.VIEWER],
  [TenantRole.MANAGER]: [TenantRole.EMPLOYEE, TenantRole.VIEWER],
  [TenantRole.EMPLOYEE]: [TenantRole.VIEWER],
  [TenantRole.VIEWER]: [],
};

// =============================================================================
// HELPERS DE VÉRIFICATION
// =============================================================================

/**
 * Vérifie si un rôle a une permission spécifique
 */
export function hasPermission(
  role: TenantRole,
  permission: Permission,
  context?: PermissionContext
): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  // Wildcard global
  if (permissions.includes('*')) {
    return true;
  }

  // Vérification directe
  if (permissions.includes(permission)) {
    // Vérifier le contexte si présent
    if (context) {
      const roleContexts = ROLE_PERMISSION_CONTEXTS[role];
      if (roleContexts && roleContexts[permission]) {
        const permContext = roleContexts[permission];
        // Si la permission requiert "own" et le contexte aussi
        if (permContext.own && !context.own) {
          return false;
        }
      }
    }
    return true;
  }

  // Vérification wildcard sur la ressource
  const [resource] = permission.split(':') as [Resource, Action];
  const wildcardPermission = `${resource}:*` as Permission;
  if (permissions.includes(wildcardPermission)) {
    return true;
  }

  return false;
}

/**
 * Vérifie si un rôle a au moins une des permissions
 */
export function hasAnyPermission(
  role: TenantRole,
  permissions: Permission[]
): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Vérifie si un rôle a toutes les permissions
 */
export function hasAllPermissions(
  role: TenantRole,
  permissions: Permission[]
): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Récupère toutes les permissions effectives d'un rôle
 */
export function getEffectivePermissions(role: TenantRole): Permission[] {
  const permissions = new Set<Permission>();

  // Permissions directes
  ROLE_PERMISSIONS[role].forEach(p => permissions.add(p));

  // Permissions héritées de la hiérarchie
  const inheritedRoles = ROLE_HIERARCHY[role];
  for (const inheritedRole of inheritedRoles) {
    ROLE_PERMISSIONS[inheritedRole].forEach(p => permissions.add(p));
  }

  return Array.from(permissions);
}

/**
 * Vérifie si un rôle peut assigner un autre rôle
 */
export function canAssignRole(
  assignerRole: TenantRole,
  targetRole: TenantRole
): boolean {
  // Seul le owner peut assigner admin
  if (targetRole === TenantRole.ADMIN && assignerRole !== TenantRole.OWNER) {
    return false;
  }

  // Un rôle peut assigner les rôles inférieurs
  const canAssign = ROLE_HIERARCHY[assignerRole];
  return canAssign.includes(targetRole);
}

/**
 * Récupère les rôles qu'un utilisateur peut assigner
 */
export function getAssignableRoles(role: TenantRole): TenantRole[] {
  if (role === TenantRole.OWNER) {
    return [TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.EMPLOYEE, TenantRole.VIEWER];
  }
  return ROLE_HIERARCHY[role];
}

// =============================================================================
// MIDDLEWARE / GUARD
// =============================================================================

/**
 * Interface pour le contexte utilisateur
 */
export interface UserContext {
  userId: string;
  tenantId: string;
  role: TenantRole;
}

/**
 * Vérifie l'autorisation et throw une erreur si non autorisé
 */
export function requirePermission(
  userContext: UserContext,
  permission: Permission,
  options?: {
    resourceOwnerId?: string;
    throwOnFail?: boolean;
  }
): boolean {
  const { resourceOwnerId, throwOnFail = true } = options || {};

  // Vérifier le contexte "own" si le resource owner est fourni
  const context: PermissionContext | undefined = resourceOwnerId
    ? { own: resourceOwnerId === userContext.userId }
    : undefined;

  const authorized = hasPermission(userContext.role, permission, context);

  if (!authorized && throwOnFail) {
    throw new PermissionDeniedError(
      `Permission denied: ${permission}`,
      permission,
      userContext.role
    );
  }

  return authorized;
}

/**
 * Erreur personnalisée pour les permissions refusées
 */
export class PermissionDeniedError extends Error {
  public readonly permission: Permission;
  public readonly role: TenantRole;

  constructor(message: string, permission: Permission, role: TenantRole) {
    super(message);
    this.name = 'PermissionDeniedError';
    this.permission = permission;
    this.role = role;
  }
}

// =============================================================================
// COMPOSANTS REACT
// =============================================================================

// Note: Ces composants sont des exemples, à adapter selon votre setup React

/**
 * Props pour le composant Can
 */
interface CanProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: TenantRole;
  roles?: TenantRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Exemple de composant Can pour affichage conditionnel
 *
 * Usage:
 * <Can permission="users:create">
 *   <CreateUserButton />
 * </Can>
 *
 * <Can roles={['admin', 'manager']}>
 *   <AdminPanel />
 * </Can>
 */
// export function Can({
//   permission,
//   permissions,
//   role,
//   roles,
//   requireAll = false,
//   fallback = null,
//   children,
// }: CanProps): React.ReactNode {
//   const { user } = useAuth(); // Votre hook d'auth
//
//   if (!user) return fallback;
//
//   // Vérification par rôle
//   if (role && user.role !== role) return fallback;
//   if (roles && !roles.includes(user.role)) return fallback;
//
//   // Vérification par permission
//   if (permission && !hasPermission(user.role, permission)) {
//     return fallback;
//   }
//
//   if (permissions) {
//     const hasAccess = requireAll
//       ? hasAllPermissions(user.role, permissions)
//       : hasAnyPermission(user.role, permissions);
//     if (!hasAccess) return fallback;
//   }
//
//   return children;
// }

// =============================================================================
// HOOK REACT
// =============================================================================

/**
 * Exemple de hook usePermissions
 *
 * Usage:
 * const { can, canAll, canAny, role } = usePermissions();
 *
 * if (can('users:create')) { ... }
 */
// export function usePermissions() {
//   const { user } = useAuth();
//
//   const can = useCallback(
//     (permission: Permission, context?: PermissionContext) => {
//       if (!user) return false;
//       return hasPermission(user.role, permission, context);
//     },
//     [user]
//   );
//
//   const canAll = useCallback(
//     (permissions: Permission[]) => {
//       if (!user) return false;
//       return hasAllPermissions(user.role, permissions);
//     },
//     [user]
//   );
//
//   const canAny = useCallback(
//     (permissions: Permission[]) => {
//       if (!user) return false;
//       return hasAnyPermission(user.role, permissions);
//     },
//     [user]
//   );
//
//   return {
//     can,
//     canAll,
//     canAny,
//     role: user?.role,
//     isOwner: user?.role === TenantRole.OWNER,
//     isAdmin: user?.role === TenantRole.ADMIN || user?.role === TenantRole.OWNER,
//   };
// }

// =============================================================================
// API ROUTE DECORATOR
// =============================================================================

/**
 * Décorateur pour protéger les API routes
 *
 * Usage:
 * export const POST = withPermission('users:create', async (req, context) => {
 *   // La permission a été vérifiée
 *   const { user, tenant } = context;
 *   ...
 * });
 */
// export function withPermission(
//   permission: Permission,
//   handler: (req: NextRequest, context: AuthContext) => Promise<Response>
// ) {
//   return async (req: NextRequest) => {
//     const context = await getAuthContext(req);
//
//     if (!context) {
//       return Response.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//
//     if (!hasPermission(context.role, permission)) {
//       return Response.json(
//         { error: 'Permission denied', required: permission },
//         { status: 403 }
//       );
//     }
//
//     return handler(req, context);
//   };
// }

// =============================================================================
// EXPORTS
// =============================================================================

export {
  // Types déjà exportés via déclaration

  // Config
  ROLE_PERMISSIONS,
  ROLE_PERMISSION_CONTEXTS,
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,

  // Helpers
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getEffectivePermissions,
  canAssignRole,
  getAssignableRoles,
  requirePermission,
};
