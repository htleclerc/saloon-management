# Guide Keycloak - Authentification et Gestion des Identités

> Guide complet pour intégrer Keycloak comme Identity Provider (IdP) dans votre application

---

## Table des Matières

1. [Introduction à Keycloak](#introduction-à-keycloak)
2. [Installation et Configuration](#installation-et-configuration)
3. [Concepts Fondamentaux](#concepts-fondamentaux)
4. [Configuration du Realm](#configuration-du-realm)
5. [Intégration Next.js](#intégration-nextjs)
6. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
7. [Social Login (IdPs)](#social-login-idps)
8. [Multi-Tenancy](#multi-tenancy)
9. [Haute Disponibilité](#haute-disponibilité)
10. [Troubleshooting](#troubleshooting)

---

## Introduction à Keycloak

### Qu'est-ce que Keycloak ?

Keycloak est une solution open-source de gestion des identités et des accès (IAM) développée par Red Hat. Elle fournit :

- **Single Sign-On (SSO)** : Connexion unique pour toutes vos applications
- **Identity Brokering** : Connexion via des IdPs externes (Google, Facebook, SAML, OIDC)
- **User Federation** : Synchronisation avec LDAP/Active Directory
- **Fine-grained Authorization** : Contrôle d'accès avancé (RBAC, ABAC)
- **Standard Protocols** : OAuth 2.0, OpenID Connect, SAML 2.0

### Pourquoi Keycloak ?

| Avantage | Description |
|----------|-------------|
| **Open Source** | Gratuit, communauté active, pas de vendor lock-in |
| **Complet** | SSO, MFA, Social Login, User Management intégrés |
| **Standards** | OAuth 2.0, OIDC, SAML 2.0 |
| **Extensible** | Thèmes, SPIs, extensions personnalisées |
| **Enterprise-Ready** | Clustering, HA, audit logs |

### Architecture Typique

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Keycloak      │────▶│   LDAP/AD       │
│   (Next.js)     │     │   (IdP)         │     │   (Optional)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Backend API   │     │   Social IdPs   │
│   (Next.js API) │     │   (Google, etc) │
└─────────────────┘     └─────────────────┘
```

---

## Installation et Configuration

### Option 1 : Docker (Développement)

```yaml
# docker-compose.yml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
      KC_HOSTNAME: localhost
      KC_HOSTNAME_PORT: 8080
      KC_HTTP_ENABLED: "true"
      KC_HEALTH_ENABLED: "true"
    command:
      - start-dev
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - keycloak-network

  postgres:
    image: postgres:15-alpine
    container_name: keycloak-postgres
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak-network

networks:
  keycloak-network:
    driver: bridge

volumes:
  postgres_data:
```

```bash
# Lancer Keycloak
docker-compose up -d

# Accéder à la console admin
# http://localhost:8080/admin
# Login: admin / admin
```

### Option 2 : Production (Kubernetes)

```yaml
# keycloak-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak
  labels:
    app: keycloak
spec:
  replicas: 2
  selector:
    matchLabels:
      app: keycloak
  template:
    metadata:
      labels:
        app: keycloak
    spec:
      containers:
        - name: keycloak
          image: quay.io/keycloak/keycloak:23.0
          args:
            - start
            - --hostname=auth.yourdomain.com
            - --https-certificate-file=/etc/x509/https/tls.crt
            - --https-certificate-key-file=/etc/x509/https/tls.key
          env:
            - name: KEYCLOAK_ADMIN
              valueFrom:
                secretKeyRef:
                  name: keycloak-secrets
                  key: admin-username
            - name: KEYCLOAK_ADMIN_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: keycloak-secrets
                  key: admin-password
            - name: KC_DB
              value: postgres
            - name: KC_DB_URL
              valueFrom:
                secretKeyRef:
                  name: keycloak-secrets
                  key: db-url
            - name: KC_PROXY
              value: edge
          ports:
            - containerPort: 8443
          volumeMounts:
            - name: tls-certs
              mountPath: /etc/x509/https
              readOnly: true
      volumes:
        - name: tls-certs
          secret:
            secretName: keycloak-tls
```

### Option 3 : Service Managé

- **Red Hat SSO** : Version enterprise de Keycloak
- **Keycloak Cloud** : SaaS officiel (en développement)
- **AWS Cognito** : Alternative compatible OIDC
- **Auth0** : Alternative SaaS

---

## Concepts Fondamentaux

### Realm

Un **Realm** est un espace isolé contenant utilisateurs, rôles, clients et configurations.

```
Keycloak Instance
├── master (realm admin)
├── production (realm)
│   ├── Users
│   ├── Roles
│   ├── Clients
│   └── Identity Providers
└── staging (realm)
    ├── Users
    ├── Roles
    └── ...
```

### Client

Un **Client** représente une application qui peut demander une authentification.

| Type | Description | Exemple |
|------|-------------|---------|
| **public** | Pas de secret, pour SPA/mobile | Frontend React/Next.js |
| **confidential** | Avec secret, pour backend | API Node.js |
| **bearer-only** | Uniquement validation de tokens | Microservices |

### Tokens

```
┌─────────────────────────────────────────────────────────────┐
│                      Access Token (JWT)                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "exp": 1234567890,           // Expiration                │
│   "iat": 1234567800,           // Issued at                 │
│   "sub": "user-uuid",          // Subject (user ID)         │
│   "realm_access": {            // Roles au niveau realm     │
│     "roles": ["user", "admin"] //                           │
│   },                                                        │
│   "resource_access": {         // Roles par client          │
│     "my-app": {                //                           │
│       "roles": ["editor"]      //                           │
│     }                                                       │
│   },                                                        │
│   "email": "user@example.com", // Claims personnalisés      │
│   "name": "John Doe"           //                           │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Refresh Token                            │
├─────────────────────────────────────────────────────────────┤
│ Opaque token pour obtenir un nouveau Access Token           │
│ Durée de vie plus longue (jours/semaines)                   │
│ Stocké de manière sécurisée (httpOnly cookie)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       ID Token (JWT)                         │
├─────────────────────────────────────────────────────────────┤
│ Informations d'identité de l'utilisateur (OIDC)             │
│ Utilisé côté client pour afficher les infos user            │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration du Realm

### Création du Realm

1. Connectez-vous à la console admin : `http://localhost:8080/admin`
2. Hover sur "master" → "Create Realm"
3. Nom : `my-app` → Create

### Configuration du Client (Next.js)

```json
// Configuration Client dans Keycloak
{
  "clientId": "my-nextjs-app",
  "name": "My Next.js Application",
  "rootUrl": "http://localhost:3000",
  "adminUrl": "http://localhost:3000",
  "baseUrl": "/",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "redirectUris": [
    "http://localhost:3000/*",
    "https://my-app.com/*"
  ],
  "webOrigins": [
    "http://localhost:3000",
    "https://my-app.com"
  ],
  "publicClient": false,
  "protocol": "openid-connect",
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "post.logout.redirect.uris": "http://localhost:3000/*"
  },
  "defaultClientScopes": [
    "web-origins",
    "profile",
    "roles",
    "email"
  ]
}
```

### Configuration via CLI (kcadm)

```bash
# Créer un realm
kcadm.sh create realms -s realm=my-app -s enabled=true

# Créer un client
kcadm.sh create clients -r my-app \
  -s clientId=my-nextjs-app \
  -s enabled=true \
  -s publicClient=false \
  -s 'redirectUris=["http://localhost:3000/*"]' \
  -s 'webOrigins=["http://localhost:3000"]'

# Créer des rôles
kcadm.sh create roles -r my-app -s name=admin
kcadm.sh create roles -r my-app -s name=user
kcadm.sh create roles -r my-app -s name=manager

# Créer un utilisateur
kcadm.sh create users -r my-app \
  -s username=john \
  -s email=john@example.com \
  -s enabled=true \
  -s emailVerified=true

# Définir le mot de passe
kcadm.sh set-password -r my-app --username john --new-password password123

# Assigner un rôle
kcadm.sh add-roles -r my-app --uusername john --rolename admin
```

### Export/Import de Configuration

```bash
# Export
docker exec keycloak /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export \
  --realm my-app

# Import au démarrage
docker run -v /path/to/import:/opt/keycloak/data/import \
  quay.io/keycloak/keycloak:23.0 \
  start-dev --import-realm
```

---

## Intégration Next.js

### Installation des Dépendances

```bash
npm install next-auth @auth/core
npm install jose  # Pour la validation JWT côté serveur
```

### Configuration NextAuth.js avec Keycloak

```typescript
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

// Types étendus pour inclure les rôles
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
      realmRoles: string[];
      clientRoles: Record<string, string[]>;
    };
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    roles?: string[];
    realmRoles?: string[];
    clientRoles?: Record<string, string[]>;
    error?: string;
  }
}

// Fonction pour décoder le JWT et extraire les rôles
function extractRoles(accessToken: string): {
  realmRoles: string[];
  clientRoles: Record<string, string[]>;
} {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString()
    );

    return {
      realmRoles: payload.realm_access?.roles || [],
      clientRoles: payload.resource_access || {},
    };
  } catch {
    return { realmRoles: [], clientRoles: {} };
  }
}

// Fonction pour rafraîchir le token
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const { realmRoles, clientRoles } = extractRoles(refreshedTokens.access_token);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      realmRoles,
      clientRoles,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: 'openid email profile roles',
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      // Première connexion
      if (account && user) {
        const { realmRoles, clientRoles } = extractRoles(account.access_token!);

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: account.expires_at! * 1000,
          realmRoles,
          clientRoles,
        };
      }

      // Token encore valide
      if (Date.now() < (token.expiresAt as number) - 60000) {
        return token;
      }

      // Token expiré, rafraîchir
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.idToken as string;
      session.error = token.error as string | undefined;

      if (session.user) {
        session.user.id = token.sub!;
        session.user.roles = [
          ...(token.realmRoles as string[] || []),
          ...Object.values(token.clientRoles as Record<string, string[]> || {}).flat(),
        ];
        session.user.realmRoles = token.realmRoles as string[];
        session.user.clientRoles = token.clientRoles as Record<string, string[]>;
      }

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Logout côté Keycloak (End Session Endpoint)
      if (token?.idToken) {
        const logoutUrl = new URL(
          `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
        );
        logoutUrl.searchParams.set('id_token_hint', token.idToken as string);
        logoutUrl.searchParams.set(
          'post_logout_redirect_uri',
          process.env.NEXTAUTH_URL!
        );

        await fetch(logoutUrl.toString());
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
};
```

### Route Handler NextAuth

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Variables d'Environnement

```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Keycloak
KEYCLOAK_CLIENT_ID=my-nextjs-app
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=http://localhost:8080/realms/my-app
```

### Hook d'Authentification

```typescript
// hooks/useAuth.ts
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;
  const accessToken = session?.accessToken;

  // Vérifier si l'utilisateur a un rôle
  const hasRole = useCallback(
    (role: string) => {
      return user?.roles?.includes(role) ?? false;
    },
    [user?.roles]
  );

  // Vérifier si l'utilisateur a au moins un des rôles
  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return roles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  // Vérifier si l'utilisateur a tous les rôles
  const hasAllRoles = useCallback(
    (roles: string[]) => {
      return roles.every((role) => hasRole(role));
    },
    [hasRole]
  );

  const login = useCallback(async (callbackUrl?: string) => {
    await signIn('keycloak', { callbackUrl: callbackUrl || '/' });
  }, []);

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/' });
  }, []);

  return {
    user,
    session,
    accessToken,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    login,
    logout,
  };
}
```

### Provider d'Authentification

```tsx
// components/providers/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      refetchInterval={4 * 60} // Rafraîchir toutes les 4 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
```

```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Gestion des Utilisateurs

### API Admin Keycloak

```typescript
// lib/keycloak/admin.ts
import KcAdminClient from '@keycloak/keycloak-admin-client';

let adminClient: KcAdminClient | null = null;

async function getAdminClient(): Promise<KcAdminClient> {
  if (!adminClient) {
    adminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_ADMIN_URL!,
      realmName: 'master',
    });

    await adminClient.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    });
  }

  return adminClient;
}

// Créer un utilisateur
export async function createUser(userData: {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  roles?: string[];
}) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  // Créer l'utilisateur
  const user = await client.users.create({
    username: userData.username,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    enabled: true,
    emailVerified: false,
  });

  // Définir le mot de passe
  await client.users.resetPassword({
    id: user.id!,
    credential: {
      type: 'password',
      value: userData.password,
      temporary: false,
    },
  });

  // Assigner les rôles
  if (userData.roles?.length) {
    const realmRoles = await client.roles.find();
    const rolesToAssign = realmRoles.filter((r) =>
      userData.roles!.includes(r.name!)
    );

    await client.users.addRealmRoleMappings({
      id: user.id!,
      roles: rolesToAssign.map((r) => ({
        id: r.id!,
        name: r.name!,
      })),
    });
  }

  return user;
}

// Récupérer un utilisateur
export async function getUser(userId: string) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  return await client.users.findOne({ id: userId });
}

// Mettre à jour un utilisateur
export async function updateUser(
  userId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  return await client.users.update({ id: userId }, userData);
}

// Supprimer un utilisateur
export async function deleteUser(userId: string) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  await client.users.del({ id: userId });
}

// Récupérer les rôles d'un utilisateur
export async function getUserRoles(userId: string) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  return await client.users.listRealmRoleMappings({ id: userId });
}

// Assigner des rôles
export async function assignRoles(userId: string, roleNames: string[]) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  const realmRoles = await client.roles.find();
  const rolesToAssign = realmRoles.filter((r) => roleNames.includes(r.name!));

  await client.users.addRealmRoleMappings({
    id: userId,
    roles: rolesToAssign.map((r) => ({
      id: r.id!,
      name: r.name!,
    })),
  });
}

// Retirer des rôles
export async function removeRoles(userId: string, roleNames: string[]) {
  const client = await getAdminClient();
  client.setConfig({ realmName: process.env.KEYCLOAK_REALM! });

  const userRoles = await client.users.listRealmRoleMappings({ id: userId });
  const rolesToRemove = userRoles.filter((r) => roleNames.includes(r.name!));

  await client.users.delRealmRoleMappings({
    id: userId,
    roles: rolesToRemove.map((r) => ({
      id: r.id!,
      name: r.name!,
    })),
  });
}
```

### Enregistrement Self-Service

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/keycloak/admin';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  ),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const user = await createUser({
      ...data,
      roles: ['user'], // Rôle par défaut
    });

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
```

---

## Social Login (IdPs)

### Configuration Google

1. **Console Google Cloud** :
   - Créer un projet
   - Activer Google+ API
   - Créer des identifiants OAuth 2.0
   - URI de redirection : `https://your-keycloak/realms/my-app/broker/google/endpoint`

2. **Configuration Keycloak** :

```json
// Identity Provider Google
{
  "alias": "google",
  "providerId": "google",
  "enabled": true,
  "config": {
    "clientId": "your-google-client-id",
    "clientSecret": "your-google-client-secret",
    "defaultScope": "openid email profile",
    "syncMode": "IMPORT"
  }
}
```

### Configuration Microsoft/Azure AD

```json
// Identity Provider Azure AD
{
  "alias": "microsoft",
  "providerId": "microsoft",
  "enabled": true,
  "config": {
    "clientId": "your-azure-client-id",
    "clientSecret": "your-azure-client-secret",
    "defaultScope": "openid email profile",
    "tenant": "your-tenant-id"
  }
}
```

### Configuration SAML (Enterprise)

```json
// Identity Provider SAML
{
  "alias": "corporate-saml",
  "providerId": "saml",
  "enabled": true,
  "config": {
    "singleSignOnServiceUrl": "https://idp.company.com/sso",
    "singleLogoutServiceUrl": "https://idp.company.com/slo",
    "signingCertificate": "MIIDd...",
    "postBindingResponse": "true",
    "postBindingAuthnRequest": "true",
    "wantAssertionsSigned": "true"
  }
}
```

### Mappage des Attributs (Identity Brokering)

```json
// Mapper pour synchroniser les attributs
{
  "name": "email",
  "identityProviderMapper": "hardcoded-attribute-idp-mapper",
  "identityProviderAlias": "google",
  "config": {
    "syncMode": "INHERIT",
    "attribute": "email"
  }
}
```

---

## Multi-Tenancy

### Stratégie 1 : Un Realm par Tenant

```
Keycloak
├── tenant-a (realm)
│   ├── Users
│   └── Clients
├── tenant-b (realm)
│   ├── Users
│   └── Clients
└── tenant-c (realm)
```

**Avantages** : Isolation totale
**Inconvénients** : Plus de ressources, gestion complexe

### Stratégie 2 : Groupes/Attributs dans un seul Realm

```typescript
// Déterminer le tenant depuis le token
function getTenantFromToken(accessToken: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString()
    );
    return payload.tenant_id || payload.groups?.[0] || null;
  } catch {
    return null;
  }
}

// Middleware de vérification du tenant
export function withTenant(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = getTenantFromToken(token);
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    // Ajouter le tenant au contexte
    return handler(request, { tenantId });
  };
}
```

---

## Haute Disponibilité

### Configuration Cluster

```yaml
# docker-compose-ha.yml
version: '3.8'

services:
  keycloak-1:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_CACHE: ispn
      KC_CACHE_STACK: kubernetes
      JAVA_OPTS_APPEND: -Djgroups.dns.query=keycloak
    # ...

  keycloak-2:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_CACHE: ispn
      KC_CACHE_STACK: kubernetes
      JAVA_OPTS_APPEND: -Djgroups.dns.query=keycloak
    # ...

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

```nginx
# nginx.conf - Load Balancer
upstream keycloak {
    least_conn;
    server keycloak-1:8080;
    server keycloak-2:8080;
}

server {
    listen 80;

    location / {
        proxy_pass http://keycloak;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Troubleshooting

### Problèmes Courants

#### 1. Token Expired / Invalid

```typescript
// Vérifier l'expiration côté client
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

#### 2. CORS Errors

```json
// Configuration Client Keycloak
{
  "webOrigins": [
    "http://localhost:3000",
    "https://my-app.com",
    "+"  // Permet toutes les origins des redirectUris
  ]
}
```

#### 3. Redirect URI Mismatch

```
// Vérifier que l'URI correspond exactement
// ✅ http://localhost:3000/api/auth/callback/keycloak
// ❌ http://localhost:3000/api/auth/callback/keycloak/
```

#### 4. Logs de Debug

```bash
# Docker logs
docker logs keycloak -f

# Activer les logs détaillés
KC_LOG_LEVEL=DEBUG
```

### Checklist de Dépannage

- [ ] URLs correctes (issuer, callback)
- [ ] Client secret valide
- [ ] Redirect URIs configurées
- [ ] Web Origins configurées
- [ ] Certificats SSL valides
- [ ] Ports ouverts
- [ ] DNS résolu correctement

---

## Ressources

- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/23.0/rest-api/)
- [NextAuth.js Keycloak Provider](https://next-auth.js.org/providers/keycloak)
- [Keycloak GitHub](https://github.com/keycloak/keycloak)

---

**Dernière mise à jour** : 2026-01-17
