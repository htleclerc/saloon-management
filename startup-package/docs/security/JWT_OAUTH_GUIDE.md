# Guide JWT & OAuth 2.0 - Authentification Sécurisée

> Guide complet pour implémenter une authentification JWT/OAuth 2.0 sécurisée

---

## Table des Matières

1. [Introduction](#introduction)
2. [OAuth 2.0 Flows](#oauth-20-flows)
3. [JWT en Détail](#jwt-en-détail)
4. [Implémentation Sécurisée](#implémentation-sécurisée)
5. [Stockage des Tokens](#stockage-des-tokens)
6. [Refresh Token Rotation](#refresh-token-rotation)
7. [Validation des Tokens](#validation-des-tokens)
8. [Révocation des Tokens](#révocation-des-tokens)
9. [Bonnes Pratiques de Sécurité](#bonnes-pratiques-de-sécurité)
10. [Vulnérabilités et Contre-mesures](#vulnérabilités-et-contre-mesures)

---

## Introduction

### OAuth 2.0 vs OpenID Connect vs JWT

| Protocole | Rôle | Usage |
|-----------|------|-------|
| **OAuth 2.0** | Autorisation | Déléguer l'accès à des ressources |
| **OpenID Connect** | Authentification | Vérifier l'identité de l'utilisateur |
| **JWT** | Format de token | Transporter des claims de manière sécurisée |

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenID Connect (OIDC)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    OAuth 2.0                         │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │                   JWT                        │    │   │
│  │  │  (Format de token utilisé par les deux)     │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Terminologie

| Terme | Description |
|-------|-------------|
| **Resource Owner** | L'utilisateur qui possède les données |
| **Client** | L'application qui demande l'accès |
| **Authorization Server** | Serveur qui émet les tokens (Keycloak) |
| **Resource Server** | API qui protège les ressources |
| **Access Token** | Token court pour accéder aux ressources |
| **Refresh Token** | Token long pour obtenir de nouveaux access tokens |
| **ID Token** | Token OIDC avec les infos d'identité |

---

## OAuth 2.0 Flows

### 1. Authorization Code Flow (Recommandé)

Le flow le plus sécurisé, utilisé pour les applications web avec backend.

```
┌──────────┐                               ┌──────────────────┐
│  User    │                               │  Authorization   │
│ (Browser)│                               │     Server       │
└────┬─────┘                               └────────┬─────────┘
     │                                              │
     │  1. Clic "Se connecter"                      │
     │  ─────────────────────────────────────────▶  │
     │                                              │
     │  2. Redirect to /authorize                   │
     │  ◀─────────────────────────────────────────  │
     │                                              │
     │  3. Login + Consent                          │
     │  ─────────────────────────────────────────▶  │
     │                                              │
     │  4. Redirect avec ?code=xxx                  │
     │  ◀─────────────────────────────────────────  │
     │                                              │
┌────┴─────┐                               ┌────────┴─────────┐
│  Client  │  5. POST /token (code+secret) │  Authorization   │
│ (Backend)│  ─────────────────────────────▶     Server       │
└────┬─────┘                               └────────┬─────────┘
     │  6. Access Token + Refresh Token             │
     │  ◀─────────────────────────────────────────  │
     │                                              │
```

### 2. Authorization Code Flow + PKCE (SPA/Mobile)

Pour les applications sans backend sécurisé (SPA, mobile).

```typescript
// lib/auth/pkce.ts

/**
 * Génère un code verifier aléatoire
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Génère le code challenge à partir du verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Usage
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Stocker le verifier en session (sessionStorage)
sessionStorage.setItem('pkce_verifier', codeVerifier);

// URL d'autorisation
const authUrl = new URL('https://auth.example.com/authorize');
authUrl.searchParams.set('client_id', 'my-app');
authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', generateState()); // CSRF protection
```

### 3. Client Credentials Flow (Machine-to-Machine)

Pour les communications serveur-à-serveur.

```typescript
// lib/auth/client-credentials.ts

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getM2MToken(): Promise<string> {
  // Vérifier le cache
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const response = await fetch(`${process.env.AUTH_SERVER_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.M2M_CLIENT_ID!,
      client_secret: process.env.M2M_CLIENT_SECRET!,
      scope: 'api:read api:write',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get M2M token');
  }

  const data: TokenResponse = await response.json();

  // Mettre en cache
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}
```

### Comparaison des Flows

| Flow | Use Case | Sécurité |
|------|----------|----------|
| **Authorization Code** | Web apps avec backend | ⭐⭐⭐⭐⭐ |
| **Authorization Code + PKCE** | SPA, Mobile | ⭐⭐⭐⭐ |
| **Client Credentials** | M2M, Backend services | ⭐⭐⭐⭐⭐ |
| **Implicit** (déprécié) | - | ❌ Ne pas utiliser |
| **Resource Owner Password** | Legacy uniquement | ⭐⭐ |

---

## JWT en Détail

### Structure d'un JWT

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.
POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA

┌─────────────────┬─────────────────────────┬─────────────────┐
│     HEADER      │        PAYLOAD          │    SIGNATURE    │
│   (Algorithm)   │       (Claims)          │   (Vérification)│
└─────────────────┴─────────────────────────┴─────────────────┘
```

### Header

```json
{
  "alg": "RS256",    // Algorithme de signature
  "typ": "JWT",      // Type de token
  "kid": "key-id-1"  // ID de la clé (pour la rotation)
}
```

### Payload (Claims)

```json
{
  // Claims standards (RFC 7519)
  "iss": "https://auth.example.com",     // Issuer
  "sub": "user-uuid-123",                // Subject (user ID)
  "aud": ["my-api", "other-api"],        // Audience
  "exp": 1735689600,                     // Expiration (Unix timestamp)
  "nbf": 1735686000,                     // Not Before
  "iat": 1735686000,                     // Issued At
  "jti": "unique-token-id",              // JWT ID (pour révocation)

  // Claims OIDC
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true,

  // Claims personnalisés
  "roles": ["admin", "user"],
  "permissions": ["users:read", "users:create"],
  "tenant_id": "tenant-123"
}
```

### Algorithmes de Signature

| Algorithme | Type | Recommandation |
|------------|------|----------------|
| **RS256** | Asymétrique (RSA) | ⭐ Recommandé pour production |
| **RS384** | Asymétrique (RSA) | ⭐ Plus sécurisé |
| **RS512** | Asymétrique (RSA) | ⭐ Maximum sécurité |
| **ES256** | Asymétrique (ECDSA) | ⭐ Recommandé (plus compact) |
| **HS256** | Symétrique (HMAC) | ⚠️ Uniquement si secret partagé sécurisé |
| **none** | Aucune | ❌ JAMAIS en production |

---

## Implémentation Sécurisée

### Configuration NextAuth.js avec JWT Sécurisé

```typescript
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

// Durées de vie des tokens
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: 'openid email profile roles',
          // Forcer le prompt de login pour les sessions sensibles
          // prompt: 'login',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  },

  jwt: {
    maxAge: ACCESS_TOKEN_MAX_AGE,
  },

  callbacks: {
    async jwt({ token, account, user, trigger }) {
      // Première connexion
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          idToken: account.id_token,
          // Claims personnalisés
          roles: extractRoles(account.access_token!),
          permissions: extractPermissions(account.access_token!),
        };
      }

      // Token encore valide (avec marge de 60 secondes)
      if (Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token;
      }

      // Rafraîchir le token
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Ne pas exposer le refresh token au client
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;

      if (session.user) {
        session.user.id = token.sub!;
        session.user.roles = token.roles as string[];
        session.user.permissions = token.permissions as string[];
      }

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Révoquer le token côté Keycloak
      await revokeToken(token as JWT);
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken as string,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
      roles: extractRoles(data.access_token),
      permissions: extractPermissions(data.access_token),
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

async function revokeToken(token: JWT): Promise<void> {
  try {
    await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/revoke`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          token: token.refreshToken as string,
          token_type_hint: 'refresh_token',
        }),
      }
    );
  } catch (error) {
    console.error('Token revocation failed:', error);
  }
}

function extractRoles(accessToken: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString()
    );
    return [
      ...(payload.realm_access?.roles || []),
      ...Object.values(payload.resource_access || {}).flatMap(
        (client: any) => client.roles || []
      ),
    ];
  } catch {
    return [];
  }
}

function extractPermissions(accessToken: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString()
    );
    return payload.permissions || [];
  } catch {
    return [];
  }
}
```

---

## Stockage des Tokens

### Comparaison des Options

| Storage | XSS | CSRF | Recommandation |
|---------|-----|------|----------------|
| **localStorage** | ❌ Vulnérable | ✅ Safe | ❌ Éviter pour les tokens |
| **sessionStorage** | ❌ Vulnérable | ✅ Safe | ⚠️ Uniquement code PKCE |
| **Cookie httpOnly** | ✅ Safe | ❌ Vulnérable | ⭐ Avec CSRF token |
| **Cookie httpOnly + SameSite** | ✅ Safe | ✅ Safe | ⭐⭐ Recommandé |
| **Memory (variable JS)** | ✅ Safe | ✅ Safe | ⭐⭐ Pour SPA |

### Configuration Sécurisée des Cookies

```typescript
// lib/auth/cookies.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface SessionData {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Créer un cookie de session sécurisé
 */
export async function createSessionCookie(data: SessionData): Promise<void> {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(crypto.randomUUID()) // ID unique pour révocation
    .sign(JWT_SECRET);

  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,          // Inaccessible au JavaScript
    secure: process.env.NODE_ENV === 'production',  // HTTPS uniquement
    sameSite: 'lax',         // Protection CSRF
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  });
}

/**
 * Lire et valider le cookie de session
 */
export async function getSessionFromCookie(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      roles: payload.roles as string[],
    };
  } catch (error) {
    // Token invalide ou expiré
    return null;
  }
}

/**
 * Supprimer le cookie de session
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
```

### Stockage en Mémoire pour SPA

```typescript
// lib/auth/token-manager.ts

interface TokenStore {
  accessToken: string | null;
  expiresAt: number | null;
}

// Stockage en closure (pas accessible depuis window/globalThis)
const tokenStore: TokenStore = {
  accessToken: null,
  expiresAt: null,
};

export const tokenManager = {
  setToken(token: string, expiresIn: number): void {
    tokenStore.accessToken = token;
    tokenStore.expiresAt = Date.now() + expiresIn * 1000;
  },

  getToken(): string | null {
    // Vérifier l'expiration
    if (tokenStore.expiresAt && Date.now() > tokenStore.expiresAt - 30000) {
      return null; // Token expiré ou proche de l'expiration
    }
    return tokenStore.accessToken;
  },

  clearToken(): void {
    tokenStore.accessToken = null;
    tokenStore.expiresAt = null;
  },

  isValid(): boolean {
    return (
      tokenStore.accessToken !== null &&
      tokenStore.expiresAt !== null &&
      Date.now() < tokenStore.expiresAt - 30000
    );
  },
};
```

---

## Refresh Token Rotation

### Principe

Chaque fois qu'un refresh token est utilisé, un nouveau est émis et l'ancien est invalidé.

```
┌──────────────────────────────────────────────────────────────┐
│                    Refresh Token Rotation                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Client envoie Refresh Token A                            │
│      ─────────────────────────────────────────────▶         │
│                                                              │
│  2. Server vérifie et invalide Refresh Token A               │
│                                                              │
│  3. Server génère nouveaux Access Token + Refresh Token B    │
│      ◀─────────────────────────────────────────────         │
│                                                              │
│  4. Si Refresh Token A est réutilisé :                       │
│     → ALERTE : Token compromis                               │
│     → Invalider TOUS les tokens de l'utilisateur             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Implémentation

```typescript
// lib/auth/refresh-token-service.ts
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface RefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
  family: string; // Pour détecter la réutilisation
}

/**
 * Génère un nouveau refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('base64url');
  const family = crypto.randomUUID();

  await prisma.refreshToken.create({
    data: {
      token: hashToken(token),
      userId,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    },
  });

  return token;
}

/**
 * Utilise un refresh token et en génère un nouveau
 */
export async function useRefreshToken(
  oldToken: string
): Promise<{ newToken: string; userId: string } | null> {
  const hashedOldToken = hashToken(oldToken);

  // Trouver le token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedOldToken },
  });

  if (!storedToken) {
    return null;
  }

  // Vérifier si déjà utilisé (réutilisation = compromission)
  if (storedToken.usedAt) {
    console.error('Refresh token reuse detected!', {
      family: storedToken.family,
      userId: storedToken.userId,
    });

    // Invalider TOUTE la famille de tokens
    await prisma.refreshToken.deleteMany({
      where: { family: storedToken.family },
    });

    // Alerter (logging, notification, etc.)
    await alertSecurityTeam({
      type: 'TOKEN_REUSE',
      userId: storedToken.userId,
      family: storedToken.family,
    });

    return null;
  }

  // Vérifier l'expiration
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    return null;
  }

  // Marquer comme utilisé
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { usedAt: new Date() },
  });

  // Créer un nouveau token dans la même famille
  const newToken = crypto.randomBytes(64).toString('base64url');

  await prisma.refreshToken.create({
    data: {
      token: hashToken(newToken),
      userId: storedToken.userId,
      family: storedToken.family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    newToken,
    userId: storedToken.userId,
  };
}

/**
 * Révoque tous les tokens d'un utilisateur
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

/**
 * Hash un token pour stockage sécurisé
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function alertSecurityTeam(alert: any): Promise<void> {
  // Implémenter l'alerte (email, Slack, etc.)
  console.error('SECURITY ALERT:', alert);
}
```

### Schéma Prisma pour Refresh Tokens

```prisma
model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique  // Hash du token
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  family    String    // Pour la rotation
  expiresAt DateTime
  usedAt    DateTime? // Pour détecter la réutilisation
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([family])
}
```

---

## Validation des Tokens

### Validation Côté Serveur

```typescript
// lib/auth/jwt-validator.ts
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

// Cache du JWKS
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`)
    );
  }
  return jwks;
}

interface ValidatedToken extends JWTPayload {
  sub: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Valide un JWT avec vérification complète
 */
export async function validateToken(token: string): Promise<ValidatedToken> {
  const { payload } = await jwtVerify(token, getJWKS(), {
    // Vérifications de sécurité
    issuer: process.env.KEYCLOAK_ISSUER,
    audience: process.env.KEYCLOAK_CLIENT_ID,
    algorithms: ['RS256', 'RS384', 'RS512'],
    clockTolerance: 60, // 60 secondes de tolérance pour le décalage d'horloge
  });

  // Vérifications supplémentaires
  if (!payload.sub) {
    throw new Error('Token missing subject');
  }

  return payload as ValidatedToken;
}

/**
 * Middleware de validation pour API routes
 */
export async function validateRequest(
  request: Request
): Promise<ValidatedToken | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    return await validateToken(token);
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}
```

### Points de Validation Critiques

```typescript
// Checklist de validation JWT
const validationChecks = {
  // 1. Signature valide
  signature: 'Vérifiée avec la clé publique (JWKS)',

  // 2. Algorithme autorisé
  algorithm: ['RS256', 'RS384', 'RS512', 'ES256'],

  // 3. Issuer correct
  issuer: process.env.KEYCLOAK_ISSUER,

  // 4. Audience correcte
  audience: process.env.KEYCLOAK_CLIENT_ID,

  // 5. Token non expiré
  expiration: 'payload.exp > Date.now()',

  // 6. Token pas utilisé avant nbf
  notBefore: 'payload.nbf <= Date.now()',

  // 7. Subject présent
  subject: 'payload.sub existe',

  // 8. Token pas révoqué (si liste de révocation)
  revocation: 'jti pas dans la blacklist',
};
```

---

## Révocation des Tokens

### Liste de Révocation (Token Blacklist)

```typescript
// lib/auth/token-blacklist.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);
const BLACKLIST_PREFIX = 'token:revoked:';

/**
 * Révoquer un token (par son JTI)
 */
export async function revokeToken(jti: string, expiresAt: number): Promise<void> {
  const ttl = Math.ceil((expiresAt - Date.now()) / 1000);

  if (ttl > 0) {
    await redis.setex(`${BLACKLIST_PREFIX}${jti}`, ttl, '1');
  }
}

/**
 * Vérifier si un token est révoqué
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  const result = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
  return result !== null;
}

/**
 * Révoquer tous les tokens d'un utilisateur
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  // Stocker un timestamp de révocation par utilisateur
  const revokedAt = Date.now();
  await redis.set(`token:user:${userId}:revoked_at`, revokedAt.toString());
}

/**
 * Vérifier si les tokens de l'utilisateur sont révoqués
 */
export async function areUserTokensRevoked(
  userId: string,
  tokenIssuedAt: number
): Promise<boolean> {
  const revokedAt = await redis.get(`token:user:${userId}:revoked_at`);

  if (revokedAt) {
    return tokenIssuedAt < parseInt(revokedAt, 10);
  }

  return false;
}
```

### Intégration dans la Validation

```typescript
// lib/auth/jwt-validator.ts (mis à jour)
export async function validateToken(token: string): Promise<ValidatedToken> {
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer: process.env.KEYCLOAK_ISSUER,
    audience: process.env.KEYCLOAK_CLIENT_ID,
    algorithms: ['RS256'],
  });

  // Vérifier la révocation par JTI
  if (payload.jti) {
    const revoked = await isTokenRevoked(payload.jti);
    if (revoked) {
      throw new Error('Token has been revoked');
    }
  }

  // Vérifier la révocation par utilisateur
  if (payload.sub && payload.iat) {
    const userRevoked = await areUserTokensRevoked(
      payload.sub,
      payload.iat * 1000
    );
    if (userRevoked) {
      throw new Error('All user tokens have been revoked');
    }
  }

  return payload as ValidatedToken;
}
```

---

## Bonnes Pratiques de Sécurité

### Checklist JWT/OAuth

- [ ] **Algorithmes sécurisés** : RS256, RS384, RS512, ES256 (pas HS256 si possible)
- [ ] **Durée de vie courte** : Access token 5-15 minutes
- [ ] **Refresh token rotation** : Nouveau refresh token à chaque utilisation
- [ ] **Stockage sécurisé** : httpOnly cookie avec SameSite
- [ ] **Validation complète** : Issuer, audience, expiration, signature
- [ ] **Révocation possible** : Blacklist ou révocation par utilisateur
- [ ] **HTTPS obligatoire** : Jamais de tokens sur HTTP
- [ ] **PKCE pour SPA/Mobile** : Protection contre l'interception
- [ ] **State parameter** : Protection CSRF sur le flow OAuth
- [ ] **Scope minimal** : Demander uniquement les permissions nécessaires
- [ ] **Logout complet** : Révoquer les tokens côté serveur d'auth
- [ ] **Monitoring** : Détecter les anomalies (réutilisation, etc.)

### Configuration Sécurisée

```typescript
// Configuration recommandée
const securityConfig = {
  // Tokens
  accessTokenMaxAge: 15 * 60,           // 15 minutes
  refreshTokenMaxAge: 7 * 24 * 60 * 60, // 7 jours
  idTokenMaxAge: 60 * 60,               // 1 heure

  // Cookies
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
  },

  // JWT
  jwt: {
    algorithms: ['RS256', 'ES256'],
    clockTolerance: 60, // secondes
  },

  // OAuth
  oauth: {
    pkceRequired: true,
    stateRequired: true,
    nonceRequired: true, // OIDC
  },
};
```

---

## Vulnérabilités et Contre-mesures

### 1. Token Leakage

**Risque** : Token exposé dans les logs, URL, ou localStorage.

**Contre-mesures** :
```typescript
// ❌ MAUVAIS : Token dans l'URL
const url = `/api/data?token=${accessToken}`;

// ✅ BON : Token dans le header
fetch('/api/data', {
  headers: { Authorization: `Bearer ${accessToken}` }
});

// ❌ MAUVAIS : Logger le token
console.log('Token:', accessToken);

// ✅ BON : Logger un hash ou les premières lettres
console.log('Token hash:', hashToken(accessToken).slice(0, 8));
```

### 2. JWT Algorithm Confusion

**Risque** : L'attaquant force l'algorithme `none` ou `HS256` avec la clé publique.

**Contre-mesures** :
```typescript
// ✅ Toujours spécifier les algorithmes autorisés
await jwtVerify(token, jwks, {
  algorithms: ['RS256'], // Liste blanche explicite
});
```

### 3. Replay Attack

**Risque** : Un token intercepté est réutilisé.

**Contre-mesures** :
- Durée de vie courte
- JTI unique + blacklist
- Binding au client (fingerprint)

```typescript
// Ajouter un fingerprint au token
const fingerprint = {
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
};

// Vérifier à chaque requête
if (token.fingerprint.ip !== currentRequest.ip) {
  throw new Error('Token binding mismatch');
}
```

### 4. Session Fixation

**Risque** : L'attaquant fixe un ID de session avant l'authentification.

**Contre-mesures** :
```typescript
// Régénérer la session après login
async function onSuccessfulLogin(user: User) {
  // Détruire l'ancienne session
  await destroySession();

  // Créer une nouvelle session
  await createSession(user);
}
```

---

## Ressources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Dernière mise à jour** : 2026-01-17
