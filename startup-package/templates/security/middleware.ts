/**
 * Security Middleware Templates
 *
 * Middlewares de sécurité pour Next.js.
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { securityMiddleware } from '@/lib/security/middleware';
 *
 * export default securityMiddleware;
 *
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
 * };
 * ```
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ============================================================================
// TYPES
// ============================================================================

interface RouteConfig {
  /** Permissions requises */
  permissions?: string[];
  /** Rôles requis */
  roles?: string[];
  /** Exiger tous (AND) ou au moins un (OR) */
  requireAll?: boolean;
  /** Rate limiting (requêtes par minute) */
  rateLimit?: number;
}

interface MiddlewareConfig {
  /** Routes protégées avec leur configuration */
  protectedRoutes?: Record<string, RouteConfig>;
  /** Routes publiques (bypass complet) */
  publicRoutes?: string[];
  /** URL de connexion */
  loginUrl?: string;
  /** URL pour accès non autorisé */
  unauthorizedUrl?: string;
  /** Activer les headers de sécurité */
  securityHeaders?: boolean;
  /** Configuration CSP */
  csp?: string;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const defaultConfig: MiddlewareConfig = {
  protectedRoutes: {
    '/admin': { roles: ['admin', 'super_admin'] },
    '/dashboard': { roles: ['user', 'admin', 'super_admin'] },
    '/api/admin': { roles: ['admin', 'super_admin'] },
  },
  publicRoutes: [
    '/',
    '/auth',
    '/login',
    '/register',
    '/api/auth',
    '/api/health',
  ],
  loginUrl: '/auth/signin',
  unauthorizedUrl: '/unauthorized',
  securityHeaders: true,
};

// ============================================================================
// RATE LIMITING (Simple in-memory)
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

function addSecurityHeaders(response: NextResponse, csp?: string): void {
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // HSTS (uniquement en production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // CSP
  if (csp) {
    response.headers.set('Content-Security-Policy', csp);
  }
}

// ============================================================================
// CSRF TOKEN
// ============================================================================

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

// ============================================================================
// MIDDLEWARE FACTORY
// ============================================================================

/**
 * Crée un middleware de sécurité configuré
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { createSecurityMiddleware } from '@/lib/security/middleware';
 *
 * export default createSecurityMiddleware({
 *   protectedRoutes: {
 *     '/admin': { roles: ['admin'] },
 *     '/api/users': { permissions: ['users:read'], rateLimit: 100 },
 *   },
 *   publicRoutes: ['/', '/auth', '/api/auth'],
 * });
 * ```
 */
export function createSecurityMiddleware(config: MiddlewareConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };

  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    // Créer la réponse
    let response = NextResponse.next();

    // Ajouter un nonce pour CSP
    const nonce = generateNonce();
    response.headers.set('x-nonce', nonce);

    // Ajouter les headers de sécurité
    if (mergedConfig.securityHeaders) {
      addSecurityHeaders(response, mergedConfig.csp);
    }

    // Vérifier si c'est une route publique
    const isPublicRoute = mergedConfig.publicRoutes?.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      return response;
    }

    // Trouver la configuration de la route
    let routeConfig: RouteConfig | undefined;

    for (const [route, config] of Object.entries(mergedConfig.protectedRoutes || {})) {
      if (pathname === route || pathname.startsWith(`${route}/`)) {
        routeConfig = config;
        break;
      }
    }

    // Si pas de configuration spécifique, laisser passer
    if (!routeConfig) {
      return response;
    }

    // Vérifier le rate limiting
    if (routeConfig.rateLimit) {
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
      const key = `${ip}:${pathname}`;

      if (!checkRateLimit(key, routeConfig.rateLimit)) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
    }

    // Récupérer le token JWT
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Non authentifié
    if (!token) {
      // API : retourner 401
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Page : rediriger vers login
      const loginUrl = new URL(mergedConfig.loginUrl!, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier les permissions
    const userRoles = (token.roles as string[]) || [];
    const userPermissions = (token.permissions as string[]) || [];

    let isAuthorized = true;

    // Vérifier les rôles requis
    if (routeConfig.roles && routeConfig.roles.length > 0) {
      isAuthorized = routeConfig.requireAll
        ? routeConfig.roles.every((r) => userRoles.includes(r))
        : routeConfig.roles.some((r) => userRoles.includes(r));
    }

    // Vérifier les permissions requises
    if (isAuthorized && routeConfig.permissions && routeConfig.permissions.length > 0) {
      isAuthorized = routeConfig.requireAll
        ? routeConfig.permissions.every((p) => userPermissions.includes(p))
        : routeConfig.permissions.some((p) => userPermissions.includes(p));
    }

    // Non autorisé
    if (!isAuthorized) {
      // API : retourner 403
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Page : rediriger vers unauthorized
      return NextResponse.redirect(new URL(mergedConfig.unauthorizedUrl!, request.url));
    }

    return response;
  };
}

// ============================================================================
// API ROUTE PROTECTION
// ============================================================================

type ApiHandler = (
  request: NextRequest,
  context: { user: { id: string; roles: string[]; permissions: string[] }; params?: any }
) => Promise<NextResponse>;

interface ProtectApiOptions {
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  rateLimit?: number;
}

/**
 * Wrapper pour protéger les API routes
 *
 * @example
 * ```typescript
 * // app/api/users/route.ts
 * import { protectApi } from '@/lib/security/middleware';
 *
 * export const GET = protectApi(
 *   async (request, { user }) => {
 *     const users = await getUsers();
 *     return NextResponse.json(users);
 *   },
 *   { permissions: ['users:read'] }
 * );
 *
 * export const POST = protectApi(
 *   async (request, { user }) => {
 *     const data = await request.json();
 *     const newUser = await createUser(data);
 *     return NextResponse.json(newUser, { status: 201 });
 *   },
 *   { permissions: ['users:create'], rateLimit: 10 }
 * );
 * ```
 */
export function protectApi(handler: ApiHandler, options: ProtectApiOptions = {}) {
  return async (request: NextRequest, context?: { params?: any }): Promise<NextResponse> => {
    const { permissions = [], roles = [], requireAll = false, rateLimit } = options;

    // Rate limiting
    if (rateLimit) {
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
      const key = `api:${ip}:${request.nextUrl.pathname}`;

      if (!checkRateLimit(key, rateLimit)) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
          }
        );
      }
    }

    // Vérifier l'authentification
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userRoles = (token.roles as string[]) || [];
    const userPermissions = (token.permissions as string[]) || [];

    // Vérifier les autorisations
    let isAuthorized = true;

    if (roles.length > 0) {
      isAuthorized = requireAll
        ? roles.every((r) => userRoles.includes(r))
        : roles.some((r) => userRoles.includes(r));
    }

    if (isAuthorized && permissions.length > 0) {
      isAuthorized = requireAll
        ? permissions.every((p) => userPermissions.includes(p))
        : permissions.some((p) => userPermissions.includes(p));
    }

    if (!isAuthorized) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Appeler le handler avec le contexte utilisateur
    return handler(request, {
      user: {
        id: token.sub,
        roles: userRoles,
        permissions: userPermissions,
      },
      params: context?.params,
    });
  };
}

// ============================================================================
// CSRF MIDDLEWARE
// ============================================================================

/**
 * Vérifie le token CSRF pour les mutations
 */
export async function csrfCheck(request: NextRequest): Promise<NextResponse | null> {
  // Ignorer les méthodes safe
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method)) {
    return null;
  }

  // Récupérer les tokens
  const headerToken = request.headers.get('X-CSRF-Token');
  const cookieToken = request.cookies.get('csrf_token')?.value;

  // Vérifier que les deux correspondent
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null; // OK
}

// ============================================================================
// EXPORTS
// ============================================================================

export { addSecurityHeaders, generateNonce, checkRateLimit };

export default createSecurityMiddleware();
