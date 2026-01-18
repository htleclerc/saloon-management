/**
 * Protected Route Components
 *
 * Composants pour protéger les routes et afficher du contenu conditionnel
 * basé sur l'authentification et les permissions.
 *
 * @example
 * ```tsx
 * // Protection d'une page entière
 * import { ProtectedRoute } from '@/components/auth';
 *
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute
 *       roles={['admin']}
 *       redirectTo="/unauthorized"
 *     >
 *       <AdminContent />
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // Affichage conditionnel
 * import { Can } from '@/components/auth';
 *
 * function UserActions() {
 *   return (
 *     <>
 *       <Can permission="users:read">
 *         <ViewButton />
 *       </Can>
 *       <Can permission="users:delete" fallback={<DisabledButton />}>
 *         <DeleteButton />
 *       </Can>
 *     </>
 *   );
 * }
 * ```
 */
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type Permission } from './AuthProvider';

// ============================================================================
// PROTECTED ROUTE
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  /** Permissions requises */
  permissions?: Permission[];
  /** Rôles requis */
  roles?: string[];
  /** Exiger toutes les permissions/rôles (AND) ou au moins un (OR) */
  requireAll?: boolean;
  /** Composant à afficher pendant le chargement */
  loadingComponent?: ReactNode;
  /** Composant à afficher si non autorisé */
  fallback?: ReactNode;
  /** URL de redirection si non autorisé */
  redirectTo?: string;
  /** Callback si non autorisé */
  onUnauthorized?: () => void;
}

/**
 * Composant de protection de route
 *
 * @example
 * ```tsx
 * // Requiert une permission
 * <ProtectedRoute permissions={['dashboard:view']}>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // Requiert un rôle avec redirection
 * <ProtectedRoute roles={['admin']} redirectTo="/unauthorized">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Requiert plusieurs permissions (AND)
 * <ProtectedRoute
 *   permissions={['reports:view', 'reports:export']}
 *   requireAll
 * >
 *   <ExportableReports />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  loadingComponent = <DefaultLoading />,
  fallback = <DefaultUnauthorized />,
  redirectTo,
  onUnauthorized,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  } = useAuth();

  // Vérifier les autorisations
  let isAuthorized = isAuthenticated;

  if (isAuthorized && permissions.length > 0) {
    isAuthorized = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (isAuthorized && roles.length > 0) {
    isAuthorized = requireAll
      ? hasAllRoles(roles)
      : hasAnyRole(roles);
  }

  // Gérer la redirection
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      onUnauthorized?.();

      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthorized, redirectTo, router, onUnauthorized]);

  // Loading
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // Non autorisé
  if (!isAuthorized) {
    if (redirectTo) {
      return <>{loadingComponent}</>; // Pendant la redirection
    }
    return <>{fallback}</>;
  }

  // Autorisé
  return <>{children}</>;
}

// ============================================================================
// REQUIRE AUTH (Composant simplifié)
// ============================================================================

interface RequireAuthProps {
  children: ReactNode;
  /** Composant à afficher pendant le chargement */
  loadingComponent?: ReactNode;
  /** URL de redirection si non connecté */
  loginUrl?: string;
}

/**
 * Composant simple pour exiger une authentification
 *
 * @example
 * ```tsx
 * <RequireAuth loginUrl="/login">
 *   <ProtectedContent />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({
  children,
  loadingComponent = <DefaultLoading />,
  loginUrl = '/auth/signin',
}: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`${loginUrl}?callbackUrl=${callbackUrl}`);
    }
  }, [isLoading, isAuthenticated, loginUrl, router]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!isAuthenticated) {
    return <>{loadingComponent}</>; // Pendant la redirection
  }

  return <>{children}</>;
}

// ============================================================================
// CAN (Affichage conditionnel)
// ============================================================================

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
  /** Exiger tout (AND) au lieu d'au moins un (OR) */
  requireAll?: boolean;
  /** Inverser la condition */
  not?: boolean;
  /** Contenu si non autorisé */
  fallback?: ReactNode;
}

/**
 * Composant d'affichage conditionnel basé sur les permissions
 *
 * @example
 * ```tsx
 * // Afficher si l'utilisateur a la permission
 * <Can permission="users:create">
 *   <CreateUserButton />
 * </Can>
 *
 * // Afficher si l'utilisateur a l'un des rôles
 * <Can roles={['admin', 'manager']}>
 *   <AdminMenu />
 * </Can>
 *
 * // Afficher si l'utilisateur N'A PAS la permission
 * <Can permission="premium:access" not fallback={<PremiumContent />}>
 *   <UpgradePrompt />
 * </Can>
 *
 * // Exiger plusieurs permissions (AND)
 * <Can permissions={['reports:view', 'reports:export']} requireAll>
 *   <ExportButton />
 * </Can>
 * ```
 */
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
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  } = useAuth();

  // Pendant le chargement, ne rien afficher
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
      ? hasAllRoles(allRoles)
      : hasAnyRole(allRoles);
  }

  // Inverser si 'not'
  if (not) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ============================================================================
// CANNOT (Inverse de Can)
// ============================================================================

interface CannotProps extends Omit<CanProps, 'not'> {}

/**
 * Affiche le contenu si l'utilisateur N'A PAS les permissions/rôles
 *
 * @example
 * ```tsx
 * <Cannot permission="premium:access">
 *   <UpgradePrompt />
 * </Cannot>
 * ```
 */
export function Cannot(props: CannotProps) {
  return <Can {...props} not />;
}

// ============================================================================
// DEFAULT COMPONENTS
// ============================================================================

function DefaultLoading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    </div>
  );
}

function DefaultUnauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="w-16 h-16 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Accès non autorisé
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
        Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
    </div>
  );
}

export default ProtectedRoute;
