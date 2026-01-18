/**
 * Auth Provider Component
 *
 * Provider d'authentification qui combine NextAuth avec le contexte RBAC.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AuthProvider } from '@/components/auth';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

// ============================================================================
// TYPES
// ============================================================================

export type Permission = `${string}:${string}`;

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  roles: string[];
  permissions: Permission[];
}

export interface AuthContextValue {
  /** Utilisateur connecté */
  user: User | null;
  /** Session NextAuth */
  session: Session | null;
  /** Access token pour les API calls */
  accessToken: string | null;
  /** Est authentifié */
  isAuthenticated: boolean;
  /** En cours de chargement */
  isLoading: boolean;
  /** Erreur de session (ex: token expiré) */
  error: string | null;
  /** Connexion */
  login: (provider?: string, callbackUrl?: string) => Promise<void>;
  /** Déconnexion */
  logout: (callbackUrl?: string) => Promise<void>;
  /** Vérifier si l'utilisateur a une permission */
  hasPermission: (permission: Permission) => boolean;
  /** Vérifier si l'utilisateur a au moins une des permissions */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** Vérifier si l'utilisateur a toutes les permissions */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** Vérifier si l'utilisateur a un rôle */
  hasRole: (role: string) => boolean;
  /** Vérifier si l'utilisateur a au moins un des rôles */
  hasAnyRole: (roles: string[]) => boolean;
  /** Vérifier si l'utilisateur a tous les rôles */
  hasAllRoles: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================================
// INTERNAL PROVIDER (avec useSession)
// ============================================================================

interface InternalAuthProviderProps {
  children: ReactNode;
}

function InternalAuthProvider({ children }: InternalAuthProviderProps) {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const error = (session as any)?.error ?? null;

  // Construire l'objet user
  const user = useMemo<User | null>(() => {
    if (!session?.user) return null;

    return {
      id: (session.user as any).id ?? '',
      email: session.user.email ?? '',
      name: session.user.name,
      image: session.user.image,
      roles: (session.user as any).roles ?? [],
      permissions: (session.user as any).permissions ?? [],
    };
  }, [session?.user]);

  const accessToken = (session as any)?.accessToken ?? null;

  // Vérification des permissions
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return user?.permissions.includes(permission) ?? false;
    },
    [user?.permissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  // Vérification des rôles
  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },
    [user?.roles]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some((r) => hasRole(r));
    },
    [hasRole]
  );

  const hasAllRoles = useCallback(
    (roles: string[]): boolean => {
      return roles.every((r) => hasRole(r));
    },
    [hasRole]
  );

  // Actions
  const login = useCallback(
    async (provider: string = 'keycloak', callbackUrl?: string) => {
      await signIn(provider, { callbackUrl: callbackUrl ?? '/' });
    },
    []
  );

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl ?? '/' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      accessToken,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      hasAllRoles,
    }),
    [
      user,
      session,
      accessToken,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      hasAllRoles,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// AUTH PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
  /** Intervalle de rafraîchissement de la session (secondes) */
  refetchInterval?: number;
  /** Rafraîchir au focus de la fenêtre */
  refetchOnWindowFocus?: boolean;
}

export function AuthProvider({
  children,
  refetchInterval = 4 * 60, // 4 minutes
  refetchOnWindowFocus = true,
}: AuthProviderProps) {
  return (
    <SessionProvider
      refetchInterval={refetchInterval}
      refetchOnWindowFocus={refetchOnWindowFocus}
    >
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </SessionProvider>
  );
}

// ============================================================================
// HOOK: useAuth
// ============================================================================

/**
 * Hook pour accéder au contexte d'authentification
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout, hasRole } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login()}>Se connecter</button>;
 *   }
 *
 *   return (
 *     <div>
 *       Bienvenue, {user.name}
 *       {hasRole('admin') && <AdminPanel />}
 *       <button onClick={() => logout()}>Se déconnecter</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ============================================================================
// HOOKS UTILITAIRES
// ============================================================================

/**
 * Hook pour vérifier une permission
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission, isLoading } = useAuth();
  return !isLoading && hasPermission(permission);
}

/**
 * Hook pour vérifier un rôle
 */
export function useRole(role: string): boolean {
  const { hasRole, isLoading } = useAuth();
  return !isLoading && hasRole(role);
}

/**
 * Hook pour l'utilisateur courant
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook pour l'access token (pour les API calls)
 */
export function useAccessToken(): string | null {
  const { accessToken } = useAuth();
  return accessToken;
}

export default AuthProvider;
