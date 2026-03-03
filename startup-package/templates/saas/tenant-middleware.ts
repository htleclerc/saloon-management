// =============================================================================
// Tenant Middleware - Multi-Tenant SaaS
// =============================================================================
// Middleware pour identifier et valider le tenant sur chaque requête
//
// Stratégies supportées :
// 1. Subdomain: salon1.app.com → tenant = "salon1"
// 2. Path: app.com/salon1/... → tenant = "salon1"
// 3. Header: X-Tenant-ID header
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// =============================================================================
// TYPES
// =============================================================================

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string;
}

export interface TenantContext {
  tenant: TenantInfo;
  userId?: string;
  role?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  // Stratégie d'identification du tenant
  strategy: process.env.TENANT_STRATEGY || 'subdomain', // 'subdomain' | 'path' | 'header'

  // Domaine principal (pour extraction subdomain)
  baseDomain: process.env.BASE_DOMAIN || 'localhost:3000',

  // Subdomains à ignorer (pas des tenants)
  ignoredSubdomains: ['www', 'app', 'api', 'admin', 'docs'],

  // Routes publiques (pas de tenant requis)
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
  ],

  // Routes d'API qui nécessitent un tenant
  apiRoutes: ['/api/v1'],
};

// =============================================================================
// TENANT EXTRACTION
// =============================================================================

/**
 * Extrait le slug du tenant selon la stratégie configurée
 */
function extractTenantSlug(request: NextRequest): string | null {
  switch (config.strategy) {
    case 'subdomain':
      return extractFromSubdomain(request);
    case 'path':
      return extractFromPath(request);
    case 'header':
      return extractFromHeader(request);
    default:
      return null;
  }
}

/**
 * Extraction depuis le subdomain
 * salon1.app.com → "salon1"
 */
function extractFromSubdomain(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || '';

  // En développement, utiliser un header custom
  if (hostname.includes('localhost')) {
    return request.headers.get('x-tenant-slug');
  }

  const subdomain = hostname.split('.')[0];

  if (config.ignoredSubdomains.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Extraction depuis le path
 * /salon1/dashboard → "salon1"
 */
function extractFromPath(request: NextRequest): string | null {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const potentialTenant = parts[0];

  // Vérifier que ce n'est pas une route système
  const systemPaths = ['api', '_next', 'login', 'register', 'admin'];
  if (systemPaths.includes(potentialTenant)) {
    return null;
  }

  return potentialTenant;
}

/**
 * Extraction depuis le header
 * X-Tenant-ID: tenant_123
 */
function extractFromHeader(request: NextRequest): string | null {
  return request.headers.get('x-tenant-id');
}

// =============================================================================
// TENANT RESOLUTION
// =============================================================================

/**
 * Cache des tenants (TTL: 5 minutes)
 */
const tenantCache = new Map<string, { tenant: TenantInfo; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Résout un tenant depuis son slug
 */
async function resolveTenant(slug: string): Promise<TenantInfo | null> {
  // Vérifier le cache
  const cached = tenantCache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return cached.tenant;
  }

  try {
    // Appeler l'API interne pour résoudre le tenant
    const response = await fetch(
      `${process.env.INTERNAL_API_URL}/api/internal/tenants/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const tenant = await response.json();

    // Mettre en cache
    tenantCache.set(slug, {
      tenant,
      expires: Date.now() + CACHE_TTL,
    });

    return tenant;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Vérifie si le tenant est actif et autorisé
 */
function validateTenant(tenant: TenantInfo): { valid: boolean; reason?: string } {
  // Vérifier le statut de l'abonnement
  const invalidStatuses = ['CANCELED', 'UNPAID'];
  if (invalidStatuses.includes(tenant.status)) {
    return {
      valid: false,
      reason: `Subscription ${tenant.status.toLowerCase()}`,
    };
  }

  return { valid: true };
}

/**
 * Vérifie si la route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return config.publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si c'est une route API
 */
function isApiRoute(pathname: string): boolean {
  return config.apiRoutes.some(route => pathname.startsWith(route));
}

// =============================================================================
// MIDDLEWARE PRINCIPAL
// =============================================================================

export async function tenantMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Routes publiques - pas de tenant requis
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Extraire le slug du tenant
  const tenantSlug = extractTenantSlug(request);

  if (!tenantSlug) {
    // Rediriger vers la page d'accueil ou login
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: 'Tenant not specified' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Résoudre le tenant
  const tenant = await resolveTenant(tenantSlug);

  if (!tenant) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Valider le tenant
  const validation = validateTenant(tenant);
  if (!validation.valid) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/subscription-required', request.url));
  }

  // Créer la réponse avec les headers de contexte
  const response = NextResponse.next();

  // Injecter les informations du tenant dans les headers
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-tenant-slug', tenant.slug);
  response.headers.set('x-tenant-plan', tenant.plan);

  return response;
}

// =============================================================================
// MIDDLEWARE EXPORT
// =============================================================================

export async function middleware(request: NextRequest) {
  return tenantMiddleware(request);
}

export const middlewareConfig = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// =============================================================================
// HELPER: Get Tenant from Request (pour les API routes)
// =============================================================================

/**
 * Récupère le contexte tenant depuis une requête
 * À utiliser dans les API routes
 */
export function getTenantFromRequest(request: NextRequest): TenantContext | null {
  const tenantId = request.headers.get('x-tenant-id');
  const tenantSlug = request.headers.get('x-tenant-slug');
  const tenantPlan = request.headers.get('x-tenant-plan');

  if (!tenantId || !tenantSlug) {
    return null;
  }

  return {
    tenant: {
      id: tenantId,
      slug: tenantSlug,
      name: '', // Non disponible dans le header
      plan: tenantPlan || 'FREE',
      status: 'ACTIVE',
    },
  };
}

// =============================================================================
// HELPER: Protect API Route
// =============================================================================

type ApiHandler = (
  request: NextRequest,
  context: TenantContext
) => Promise<NextResponse>;

/**
 * HOF pour protéger une route API avec validation tenant
 */
export function withTenant(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = getTenantFromRequest(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Tenant context required' },
        { status: 401 }
      );
    }

    return handler(request, context);
  };
}

// =============================================================================
// HELPER: Rate Limiting per Tenant
// =============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, number> = {
  FREE: 100,
  STARTER: 500,
  PROFESSIONAL: 2000,
  ENTERPRISE: 10000,
};

/**
 * Middleware de rate limiting par tenant
 */
export function checkRateLimit(
  tenantId: string,
  plan: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = RATE_LIMITS[plan] || RATE_LIMITS.FREE;

  const key = `rate:${tenantId}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt < now) {
    // Nouvelle fenêtre
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

/**
 * Middleware combinant tenant + rate limit
 */
export function withTenantAndRateLimit(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = getTenantFromRequest(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Tenant context required' },
        { status: 401 }
      );
    }

    const rateLimit = checkRateLimit(context.tenant.id, context.tenant.plan);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = await handler(request, context);

    // Ajouter les headers de rate limit
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));

    return response;
  };
}
