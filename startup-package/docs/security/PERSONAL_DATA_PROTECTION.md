# Protection des Données Personnelles 🛡️

> Guide complet pour sécuriser les données personnelles (PII) dans votre application

---

## Table des Matières

1. [Classification des Données](#classification-des-données)
2. [Chiffrement et Stockage](#chiffrement-et-stockage)
3. [Transmission Sécurisée](#transmission-sécurisée)
4. [Contrôle d'Accès](#contrôle-daccès)
5. [Anonymisation et Pseudonymisation](#anonymisation-et-pseudonymisation)
6. [Logging Sécurisé](#logging-sécurisé)
7. [Sécurité Applicative](#sécurité-applicative)
8. [Checklist de Protection](#checklist-de-protection)

---

## Classification des Données

### Niveaux de Sensibilité

```
┌─────────────────────────────────────────────────────────────┐
│                    🔴 CRITIQUE                               │
├─────────────────────────────────────────────────────────────┤
│  • Mots de passe                                             │
│  • Numéros de carte bancaire                                 │
│  • CVV/CVC                                                   │
│  • Clés de chiffrement                                       │
│  • Tokens d'authentification                                 │
│  → JAMAIS stocké en clair, accès ultra-restreint            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    🟠 TRÈS SENSIBLE                          │
├─────────────────────────────────────────────────────────────┤
│  • IBAN / Coordonnées bancaires                              │
│  • Numéro de sécurité sociale                               │
│  • Documents d'identité                                      │
│  • Données de santé                                          │
│  • Données biométriques                                      │
│  → Chiffrement obligatoire, audit des accès                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    🟡 SENSIBLE                               │
├─────────────────────────────────────────────────────────────┤
│  • Adresse email                                             │
│  • Numéro de téléphone                                       │
│  • Adresse postale                                           │
│  • Date de naissance                                         │
│  • Nom et prénom                                             │
│  → Protection standard, minimisation des accès              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    🟢 STANDARD                               │
├─────────────────────────────────────────────────────────────┤
│  • Préférences utilisateur                                   │
│  • Historique de navigation (interne)                        │
│  • Données d'usage anonymisées                              │
│  → Protection de base                                        │
└─────────────────────────────────────────────────────────────┘
```

### Matrice de Protection

| Donnée | Chiffrement | Masquage | Audit | Rétention Max |
|--------|-------------|----------|-------|---------------|
| Mot de passe | Hash (bcrypt) | N/A | ✅ | Durée compte |
| IBAN | AES-256-GCM | Oui (last4) | ✅ | 10 ans |
| N° SS | AES-256-GCM | Oui (last4) | ✅ | Selon usage |
| Email | Optionnel | Partiel | ⚠️ | 3 ans inactif |
| Téléphone | Optionnel | last2 | ⚠️ | 3 ans inactif |
| Adresse | Optionnel | Non | ❌ | 3 ans inactif |
| Nom | Non | Non | ❌ | 3 ans inactif |

---

## Chiffrement et Stockage

### Architecture de Protection

```
┌──────────────────────────────────────────────────────────────┐
│                      APPLICATION                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Donnée en clair                                            │
│        │                                                      │
│        ▼                                                      │
│   ┌─────────────────────────────────────────┐                │
│   │      Service de Chiffrement             │                │
│   │  • Validation format                     │                │
│   │  • Chiffrement (AES-256-GCM)            │                │
│   │  • Génération hash (pour index)          │                │
│   │  • Masquage (pour affichage)             │                │
│   └─────────────────────────────────────────┘                │
│        │                                                      │
│        ▼                                                      │
│   Données chiffrées + Hash + Masqué                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      BASE DE DONNÉES                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────────────────────────────────┐                │
│   │ Table: users                            │                │
│   ├─────────────────────────────────────────┤                │
│   │ id: "usr_123"                           │                │
│   │ email: "john@example.com"               │                │
│   │ name: "John Doe"                        │                │
│   │ encrypted_ssn: "v1:salt:iv:tag:cipher"  │ ← Chiffré     │
│   │ ssn_hash: "a1b2c3..."                   │ ← Pour index  │
│   │ ssn_last4: "5678"                       │ ← Affichage   │
│   └─────────────────────────────────────────┘                │
│                                                               │
│   Chiffrement au repos (TDE) ✅                              │
│   Connexions chiffrées (SSL) ✅                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Schéma Prisma Sécurisé

```prisma
// prisma/schema.prisma

model User {
  id                    String    @id @default(cuid())

  // Données standard
  email                 String    @unique
  name                  String?
  phone                 String?

  // Mot de passe HASHÉ (jamais chiffré, jamais en clair)
  passwordHash          String    // bcrypt hash

  // Données sensibles CHIFFRÉES
  // Format: version:salt:iv:authTag:ciphertext
  encryptedSSN          String?   // Numéro de sécurité sociale
  ssnHash               String?   // Hash pour détection doublons
  ssnLast4              String?   // Pour affichage

  encryptedDateOfBirth  String?   // Date de naissance (si sensible)
  dateOfBirthHash       String?

  // Documents
  identityDocuments     IdentityDocument[]

  // Métadonnées chiffrement
  encryptionKeyVersion  Int       @default(1)

  // Audit
  lastLoginAt           DateTime?
  lastLoginIp           String?
  failedLoginAttempts   Int       @default(0)
  lockedUntil           DateTime?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([email])
  @@index([ssnHash])
}

model IdentityDocument {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])

  // Type de document
  type                  DocumentType
  documentNumber        String?   // Masqué/chiffré selon le type

  // Fichier chiffré
  encryptedFileUrl      String    // URL du fichier chiffré
  fileHash              String    // Hash pour intégrité
  mimeType              String

  // Validation
  status                DocumentStatus @default(PENDING)
  verifiedAt            DateTime?
  verifiedBy            String?
  expiresAt             DateTime?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
}

enum DocumentType {
  PASSPORT
  ID_CARD
  DRIVERS_LICENSE
  PROOF_OF_ADDRESS
  BANK_STATEMENT
}

enum DocumentStatus {
  PENDING
  VERIFIED
  REJECTED
  EXPIRED
}
```

### Service de Données Personnelles

```typescript
// lib/services/personal-data.service.ts

import { prisma } from '@/lib/db/prisma';
import {
  encrypt,
  decrypt,
  hashData,
  maskData,
  maskEmail,
  maskPhone,
} from '@/lib/crypto/encryption';
import { auditService } from './audit.service';

interface PersonalDataInput {
  ssn?: string;
  dateOfBirth?: string;
  // Autres données sensibles
}

interface PersonalDataDisplay {
  ssnMasked: string | null;
  dateOfBirth: string | null;
  // Versions masquées pour affichage
}

class PersonalDataService {
  /**
   * Stocker des données personnelles sensibles
   */
  async storePersonalData(
    userId: string,
    data: PersonalDataInput,
    metadata: { ipAddress?: string; reason: string }
  ): Promise<void> {
    const updates: Record<string, any> = {};

    // Traiter le SSN
    if (data.ssn) {
      const cleanSSN = data.ssn.replace(/\s/g, '');
      updates.encryptedSSN = encrypt(cleanSSN);
      updates.ssnHash = hashData(cleanSSN);
      updates.ssnLast4 = cleanSSN.slice(-4);
    }

    // Traiter la date de naissance
    if (data.dateOfBirth) {
      updates.encryptedDateOfBirth = encrypt(data.dateOfBirth);
      updates.dateOfBirthHash = hashData(data.dateOfBirth);
    }

    // Mettre à jour
    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    // Audit
    await auditService.log({
      userId,
      action: 'PERSONAL_DATA_UPDATED',
      details: {
        fields: Object.keys(data),
        reason: metadata.reason,
      },
      ipAddress: metadata.ipAddress,
      severity: 'info',
    });
  }

  /**
   * Récupérer les données personnelles (déchiffrées)
   * ATTENTION: Usage restreint !
   */
  async getPersonalData(
    userId: string,
    requesterId: string,
    reason: string
  ): Promise<{ ssn?: string; dateOfBirth?: string }> {
    // Vérifier les permissions
    const hasAccess = await this.checkAccess(requesterId, userId, 'read_pii');
    if (!hasAccess) {
      await auditService.log({
        userId: requesterId,
        action: 'UNAUTHORIZED_PII_ACCESS_ATTEMPT',
        details: { targetUserId: userId, reason },
        severity: 'critical',
      });
      throw new Error('Unauthorized access to personal data');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        encryptedSSN: true,
        encryptedDateOfBirth: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Audit de l'accès
    await auditService.log({
      userId: requesterId,
      action: 'PERSONAL_DATA_ACCESSED',
      details: {
        targetUserId: userId,
        reason,
        fields: ['ssn', 'dateOfBirth'],
      },
      severity: 'warning',
    });

    return {
      ssn: user.encryptedSSN ? decrypt(user.encryptedSSN) : undefined,
      dateOfBirth: user.encryptedDateOfBirth
        ? decrypt(user.encryptedDateOfBirth)
        : undefined,
    };
  }

  /**
   * Récupérer les données pour affichage (masquées)
   */
  async getPersonalDataDisplay(userId: string): Promise<PersonalDataDisplay> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ssnLast4: true,
        encryptedDateOfBirth: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ssnMasked: user.ssnLast4 ? `*** ** ${user.ssnLast4}` : null,
      dateOfBirth: user.encryptedDateOfBirth
        ? decrypt(user.encryptedDateOfBirth)
        : null,
    };
  }

  /**
   * Vérifier les permissions d'accès
   */
  private async checkAccess(
    requesterId: string,
    targetUserId: string,
    permission: string
  ): Promise<boolean> {
    // L'utilisateur peut accéder à ses propres données
    if (requesterId === targetUserId) {
      return true;
    }

    // Vérifier les rôles/permissions
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      include: { roles: true },
    });

    // Implémenter votre logique de permissions
    // Exemple: seuls les admins peuvent voir les données des autres
    return requester?.roles?.some((r) => r.name === 'ADMIN') ?? false;
  }

  /**
   * Supprimer les données personnelles
   */
  async deletePersonalData(
    userId: string,
    requesterId: string,
    reason: string
  ): Promise<void> {
    // Vérifier les permissions
    const hasAccess = await this.checkAccess(requesterId, userId, 'delete_pii');
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        encryptedSSN: null,
        ssnHash: null,
        ssnLast4: null,
        encryptedDateOfBirth: null,
        dateOfBirthHash: null,
      },
    });

    // Audit
    await auditService.log({
      userId: requesterId,
      action: 'PERSONAL_DATA_DELETED',
      details: {
        targetUserId: userId,
        reason,
      },
      severity: 'warning',
    });
  }
}

export const personalDataService = new PersonalDataService();
```

---

## Transmission Sécurisée

### HTTPS Obligatoire

```typescript
// middleware.ts (Next.js)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Forcer HTTPS en production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }

  // Headers de sécurité
  const response = NextResponse.next();

  // HSTS - Forcer HTTPS pendant 1 an
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Empêcher l'embedding
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // CSP - Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "frame-src https://js.stripe.com; " +
    "connect-src 'self' https://api.stripe.com;"
  );

  return response;
}
```

### Validation des Entrées

```typescript
// lib/validations/personal-data.schema.ts

import { z } from 'zod';

/**
 * Schéma de validation pour les données personnelles
 */
export const personalDataSchema = z.object({
  // Email
  email: z
    .string()
    .email('Email invalide')
    .max(255)
    .transform((v) => v.toLowerCase().trim()),

  // Nom
  name: z
    .string()
    .min(2, 'Nom trop court')
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, 'Caractères non autorisés')
    .transform((v) => v.trim()),

  // Téléphone (format international)
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Format de téléphone invalide'
    )
    .optional(),

  // Date de naissance
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD')
    .refine(
      (date) => {
        const parsed = new Date(date);
        const now = new Date();
        const minAge = new Date(now.setFullYear(now.getFullYear() - 120));
        return parsed > minAge && parsed < new Date();
      },
      'Date de naissance invalide'
    )
    .optional(),

  // Numéro de sécurité sociale (France)
  ssn: z
    .string()
    .regex(
      /^[12][0-9]{2}(0[1-9]|1[0-2])[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{2}$/,
      'Numéro de sécurité sociale invalide'
    )
    .optional(),

  // Adresse
  address: z
    .object({
      street: z.string().max(200),
      city: z.string().max(100),
      postalCode: z.string().regex(/^[0-9]{5}$/, 'Code postal invalide'),
      country: z.string().length(2).default('FR'),
    })
    .optional(),
});

export type PersonalDataInput = z.infer<typeof personalDataSchema>;

/**
 * Schéma pour l'IBAN
 */
export const ibanSchema = z
  .string()
  .transform((v) => v.replace(/\s/g, '').toUpperCase())
  .refine(
    (iban) => {
      // Validation basique du format
      if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;
      if (iban.length < 15 || iban.length > 34) return false;

      // Validation du checksum (modulo 97)
      const rearranged = iban.slice(4) + iban.slice(0, 4);
      const numericString = rearranged
        .split('')
        .map((c) => (c >= 'A' ? (c.charCodeAt(0) - 55).toString() : c))
        .join('');

      let remainder = 0;
      for (const char of numericString) {
        remainder = (remainder * 10 + parseInt(char)) % 97;
      }

      return remainder === 1;
    },
    'IBAN invalide'
  );
```

### Sanitisation des Données

```typescript
// lib/utils/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

/**
 * Nettoyer une chaîne pour éviter les injections
 */
export function sanitizeString(input: string): string {
  // Supprimer les caractères de contrôle
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Supprimer les caractères potentiellement dangereux
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // Aucune balise HTML
    ALLOWED_ATTR: [],
  });

  // Trim
  return sanitized.trim();
}

/**
 * Nettoyer un objet récursivement
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Valider et nettoyer une adresse email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[<>]/g, '');
}

/**
 * Nettoyer un numéro de téléphone
 */
export function sanitizePhone(phone: string): string {
  // Garder uniquement les chiffres et le +
  return phone.replace(/[^\d+]/g, '');
}
```

---

## Contrôle d'Accès

### RBAC (Role-Based Access Control)

```typescript
// lib/auth/permissions.ts

/**
 * Définition des rôles et permissions
 */
export const ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = keyof typeof ROLES;

/**
 * Permissions par ressource
 */
export const PERMISSIONS = {
  // Données personnelles
  'pii:read:own': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'pii:read:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'pii:update:own': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'pii:update:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'pii:delete:own': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'pii:delete:any': [ROLES.SUPER_ADMIN],

  // Données financières
  'financial:read:own': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'financial:read:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'financial:update:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],

  // Audit
  'audit:read': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'audit:export': [ROLES.SUPER_ADMIN],

  // Administration
  'users:manage': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  'roles:manage': [ROLES.SUPER_ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(role as any);
}

/**
 * Vérifier l'accès à une ressource spécifique
 */
export function canAccessResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string,
  action: 'read' | 'update' | 'delete',
  resourceType: 'pii' | 'financial'
): boolean {
  // Accès à ses propres données
  if (userId === resourceOwnerId) {
    const ownPermission = `${resourceType}:${action}:own` as Permission;
    return hasPermission(userRole, ownPermission);
  }

  // Accès aux données des autres
  const anyPermission = `${resourceType}:${action}:any` as Permission;
  return hasPermission(userRole, anyPermission);
}
```

### Middleware d'Autorisation

```typescript
// lib/middleware/authorize.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hasPermission, Permission } from '@/lib/auth/permissions';
import { auditService } from '@/lib/services/audit.service';

/**
 * Middleware d'autorisation pour les API routes
 */
export function withAuthorization(
  permission: Permission,
  handler: (
    request: NextRequest,
    context: { user: { id: string; role: string } }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as any;

    if (!hasPermission(userRole, permission)) {
      // Log la tentative d'accès non autorisée
      await auditService.log({
        userId: session.user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: {
          permission,
          path: request.nextUrl.pathname,
        },
        severity: 'warning',
      });

      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(request, { user: session.user as any });
  };
}

// Utilisation:
// export const GET = withAuthorization('pii:read:any', async (request, { user }) => {
//   // Handler sécurisé
// });
```

---

## Anonymisation et Pseudonymisation

### Différences

```
┌────────────────────────────────────────────────────────────────┐
│                    PSEUDONYMISATION                             │
├────────────────────────────────────────────────────────────────┤
│  • Remplace les identifiants par des pseudonymes               │
│  • RÉVERSIBLE avec la clé appropriée                           │
│  • Les données restent des "données personnelles" au sens RGPD │
│  • Exemple: john.doe@email.com → usr_123abc                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    ANONYMISATION                                │
├────────────────────────────────────────────────────────────────┤
│  • Supprime définitivement les identifiants                    │
│  • IRRÉVERSIBLE                                                │
│  • N'est plus considéré comme "données personnelles"           │
│  • Exemple: Statistiques agrégées sans identifiants            │
└────────────────────────────────────────────────────────────────┘
```

### Service d'Anonymisation

```typescript
// lib/services/anonymization.service.ts

import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

class AnonymizationService {
  /**
   * Pseudonymiser un utilisateur (réversible)
   */
  async pseudonymizeUser(userId: string): Promise<string> {
    const pseudonym = `anon_${crypto.randomBytes(8).toString('hex')}`;

    await prisma.$transaction([
      // Sauvegarder le mapping (dans une table sécurisée)
      prisma.pseudonymMapping.create({
        data: {
          originalId: userId,
          pseudonym,
        },
      }),

      // Mettre à jour les références
      prisma.user.update({
        where: { id: userId },
        data: {
          pseudonymId: pseudonym,
        },
      }),
    ]);

    return pseudonym;
  }

  /**
   * Dé-pseudonymiser (retrouver l'utilisateur original)
   */
  async depseudonymize(pseudonym: string): Promise<string | null> {
    const mapping = await prisma.pseudonymMapping.findUnique({
      where: { pseudonym },
    });

    return mapping?.originalId ?? null;
  }

  /**
   * Anonymiser complètement un utilisateur (irréversible)
   * À utiliser pour la suppression RGPD
   */
  async anonymizeUser(userId: string): Promise<void> {
    const anonymousId = `deleted_${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      // Supprimer les données sensibles
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `${anonymousId}@anonymous.deleted`,
          name: 'Utilisateur supprimé',
          phone: null,
          encryptedSSN: null,
          ssnHash: null,
          ssnLast4: null,
          encryptedDateOfBirth: null,
          dateOfBirthHash: null,
          passwordHash: 'DELETED',
          isAnonymized: true,
          anonymizedAt: new Date(),
        },
      });

      // Supprimer les documents d'identité
      await tx.identityDocument.deleteMany({
        where: { userId },
      });

      // Supprimer les mappings de pseudonymes
      await tx.pseudonymMapping.deleteMany({
        where: { originalId: userId },
      });

      // Garder les données non-personnelles pour les stats
      // (commandes, transactions avec userId anonymisé)
    });
  }

  /**
   * Anonymiser les données pour export statistique
   */
  async exportAnonymizedData(
    startDate: Date,
    endDate: Date
  ): Promise<AnonymizedStats> {
    // Agrégations sans données personnelles
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Données démographiques agrégées
    const demographics = await prisma.$queryRaw`
      SELECT
        DATE_PART('year', AGE(NOW(), date_of_birth)) / 10 * 10 AS age_group,
        COUNT(*) as count
      FROM users
      WHERE date_of_birth IS NOT NULL
        AND is_anonymized = false
      GROUP BY age_group
    `;

    return {
      period: { startDate, endDate },
      orderStats: stats,
      demographics,
      // Aucune donnée personnelle incluse
    };
  }
}

interface AnonymizedStats {
  period: { startDate: Date; endDate: Date };
  orderStats: any[];
  demographics: any[];
}

export const anonymizationService = new AnonymizationService();
```

---

## Logging Sécurisé

### Règles de Logging

```typescript
// lib/logger/secure-logger.ts

import pino from 'pino';

/**
 * Champs à ne JAMAIS logger
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'ssn',
  'socialSecurityNumber',
  'encryptedSSN',
  'iban',
  'encryptedIBAN',
  'cardNumber',
  'cvv',
  'creditCard',
  'bankAccount',
];

/**
 * Champs à masquer partiellement
 */
const PARTIAL_MASK_FIELDS = {
  email: (v: string) => maskEmail(v),
  phone: (v: string) => maskPhone(v),
  ip: (v: string) => maskIP(v),
};

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return '****';
  return `***${phone.slice(-4)}`;
}

function maskIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return 'xxx.xxx.xxx.xxx';
  return `${parts[0]}.${parts[1]}.xxx.xxx`;
}

/**
 * Nettoyer un objet pour le logging
 */
function sanitizeForLogging(obj: any, depth = 0): any {
  if (depth > 10) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj.length > 1000 ? obj.slice(0, 1000) + '...[TRUNCATED]' : obj;
  }

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map((item) => sanitizeForLogging(item, depth + 1));
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Supprimer les champs sensibles
    if (SENSITIVE_FIELDS.some((f) => lowerKey.includes(f.toLowerCase()))) {
      result[key] = '[REDACTED]';
      continue;
    }

    // Masquer partiellement certains champs
    if (lowerKey in PARTIAL_MASK_FIELDS && typeof value === 'string') {
      result[key] = PARTIAL_MASK_FIELDS[lowerKey as keyof typeof PARTIAL_MASK_FIELDS](value);
      continue;
    }

    // Récursion pour les objets imbriqués
    if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForLogging(value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Logger sécurisé
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  hooks: {
    logMethod(inputArgs, method) {
      // Sanitiser tous les arguments
      const sanitizedArgs = inputArgs.map((arg) =>
        typeof arg === 'object' ? sanitizeForLogging(arg) : arg
      );
      return method.apply(this, sanitizedArgs as any);
    },
  },
});

/**
 * Logger pour les événements de sécurité
 */
export const securityLogger = logger.child({ component: 'security' });

/**
 * Logger pour les accès aux données
 */
export const dataAccessLogger = logger.child({ component: 'data-access' });

// Exemples d'utilisation:
//
// logger.info({ userId: 'usr_123', email: 'john@example.com' }, 'User logged in');
// → { userId: 'usr_123', email: 'jo***@example.com', msg: 'User logged in' }
//
// logger.error({ password: 'secret123', error: 'Failed' }, 'Auth failed');
// → { password: '[REDACTED]', error: 'Failed', msg: 'Auth failed' }
```

---

## Sécurité Applicative

### Protection XSS

```typescript
// lib/utils/xss-protection.ts

import DOMPurify from 'isomorphic-dompurify';

/**
 * Nettoyer le HTML pour éviter XSS
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ADD_ATTR: ['target'], // Forcer target="_blank"
  });
}

/**
 * Échapper le HTML (pour affichage brut)
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Composant React sécurisé pour afficher du HTML
 */
export function SafeHTML({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizeHTML(html),
      }}
    />
  );
}
```

### Protection CSRF

```typescript
// lib/auth/csrf.ts

import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_SECRET = process.env.CSRF_SECRET!;

/**
 * Générer un token CSRF
 */
export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');

  return `${token}.${signature}`;
}

/**
 * Valider un token CSRF
 */
export function validateCSRFToken(token: string): boolean {
  const [tokenValue, signature] = token.split('.');

  if (!tokenValue || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(tokenValue)
    .digest('hex');

  // Comparaison en temps constant
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Middleware CSRF pour API routes
 */
export async function csrfProtection(request: Request): Promise<boolean> {
  // Ignorer les requêtes GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const token = request.headers.get('x-csrf-token');

  if (!token) {
    return false;
  }

  return validateCSRFToken(token);
}
```

### Rate Limiting

```typescript
// lib/middleware/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Configurer Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiters par type d'opération
const rateLimiters = {
  // API générale: 100 requêtes par minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'rl:api',
  }),

  // Authentification: 5 tentatives par minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:auth',
  }),

  // Données sensibles: 10 accès par minute
  sensitiveData: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:sensitive',
  }),

  // Export de données: 1 par heure
  dataExport: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 h'),
    prefix: 'rl:export',
  }),
};

type RateLimitType = keyof typeof rateLimiters;

/**
 * Appliquer le rate limiting
 */
export async function applyRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<{ success: boolean; remaining: number }> {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const identifier = `${type}:${ip}`;

  const { success, remaining, limit, reset } = await rateLimiters[type].limit(
    identifier
  );

  if (!success) {
    // Log la tentative de dépassement
    console.warn({
      event: 'RATE_LIMIT_EXCEEDED',
      type,
      ip,
      remaining,
      limit,
      reset,
    });
  }

  return { success, remaining };
}

/**
 * Wrapper pour les API routes
 */
export function withRateLimit(
  type: RateLimitType,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { success, remaining } = await applyRateLimit(request, type);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': '60',
          },
        }
      );
    }

    const response = await handler(request);
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    return response;
  };
}
```

---

## Checklist de Protection

### Données Personnelles (PII)

- [ ] Classification des données par sensibilité
- [ ] Chiffrement AES-256-GCM pour données très sensibles
- [ ] Hash pour détection de doublons (sans déchiffrement)
- [ ] Masquage pour affichage (last4, email partiel)
- [ ] Validation stricte des entrées (Zod)
- [ ] Sanitisation contre XSS/injection

### Contrôle d'Accès

- [ ] RBAC implémenté
- [ ] Vérification "own" vs "any" pour chaque ressource
- [ ] Audit des accès aux données sensibles
- [ ] Rate limiting par type d'opération
- [ ] Protection CSRF sur les mutations

### Transmission

- [ ] HTTPS obligatoire (HSTS)
- [ ] TLS 1.2+ minimum
- [ ] Headers de sécurité (CSP, X-Frame-Options, etc.)
- [ ] Certificats valides et renouvelés

### Stockage

- [ ] Chiffrement au repos (base de données)
- [ ] Clés de chiffrement dans des secrets sécurisés
- [ ] Rotation des clés documentée
- [ ] Backups chiffrés

### Logging

- [ ] Jamais de données sensibles dans les logs
- [ ] Masquage des emails, téléphones, IPs
- [ ] Logs d'audit pour accès aux données sensibles
- [ ] Rétention des logs limitée

### RGPD

- [ ] Droit d'accès implémenté
- [ ] Droit de rectification implémenté
- [ ] Droit à l'effacement implémenté
- [ ] Droit à la portabilité implémenté
- [ ] Anonymisation irréversible pour suppression
- [ ] Durées de rétention définies et appliquées

---

**Ressources** :
- [OWASP Data Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Data_Protection_Cheat_Sheet.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/publications/fips)
- [Guide CNIL sur la sécurité des données](https://www.cnil.fr/fr/la-securite-des-donnees)

---

**Dernière mise à jour** : 2024
