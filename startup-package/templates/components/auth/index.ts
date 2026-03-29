/**
 * Auth Components - Index
 *
 * Composants d'authentification et d'autorisation.
 *
 * @example
 * ```tsx
 * // Setup dans app/layout.tsx
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
 *
 * @example
 * ```tsx
 * // Utilisation dans un composant
 * import {
 *   useAuth,
 *   ProtectedRoute,
 *   RequireAuth,
 *   Can,
 *   Cannot,
 * } from '@/components/auth';
 *
 * function MyComponent() {
 *   const { user, isAuthenticated, hasRole, login, logout } = useAuth();
 *
 *   return (
 *     <div>
 *       <Can permission="users:create">
 *         <CreateButton />
 *       </Can>
 *
 *       <Cannot role="guest">
 *         <PremiumContent />
 *       </Cannot>
 *     </div>
 *   );
 * }
 * ```
 */

// Provider et hooks
export {
  AuthProvider,
  useAuth,
  usePermission,
  useRole,
  useCurrentUser,
  useAccessToken,
  type Permission,
  type User,
  type AuthContextValue,
} from './AuthProvider';

// Composants de protection
export {
  ProtectedRoute,
  RequireAuth,
  Can,
  Cannot,
} from './ProtectedRoute';
