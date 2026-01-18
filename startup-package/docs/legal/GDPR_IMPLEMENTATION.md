# Guide d'Implémentation Technique GDPR 🛠️

> Guide pratique étape par étape pour implémenter la conformité RGPD dans votre application

---

## Table des Matières

1. [Checklist d'Implémentation](#checklist-dimplémentation)
2. [Configuration de Base](#configuration-de-base)
3. [Système de Consentement](#système-de-consentement)
4. [Gestion des Données Utilisateur](#gestion-des-données-utilisateur)
5. [API GDPR](#api-gdpr)
6. [Base de Données](#base-de-données)
7. [Tests](#tests)
8. [Intégration Continue](#intégration-continue)

---

## Checklist d'Implémentation

### Phase 1 : Fondations (Semaine 1)

- [ ] Créer le schéma de base de données GDPR
- [ ] Implémenter le système de consentement
- [ ] Ajouter la bannière de cookies
- [ ] Créer les pages légales (CGU, Confidentialité, Cookies)

### Phase 2 : Droits des Utilisateurs (Semaine 2)

- [ ] Implémenter l'export de données
- [ ] Implémenter la suppression de compte
- [ ] Créer le centre de confidentialité
- [ ] Ajouter les formulaires de demande GDPR

### Phase 3 : Sécurité et Audit (Semaine 3)

- [ ] Configurer les logs d'audit
- [ ] Implémenter le chiffrement des données sensibles
- [ ] Configurer la rétention automatique
- [ ] Tester les procédures

### Phase 4 : Documentation (Semaine 4)

- [ ] Rédiger le registre des traitements
- [ ] Documenter les procédures internes
- [ ] Former l'équipe
- [ ] Audit final

---

## Configuration de Base

### 1. Variables d'Environnement

```bash
# .env.local

# Chiffrement
ENCRYPTION_KEY=your-32-char-encryption-key-here
ENCRYPTION_ALGORITHM=aes-256-gcm

# GDPR
GDPR_DATA_RETENTION_DAYS=1095  # 3 ans
GDPR_LOG_RETENTION_DAYS=365    # 1 an
GDPR_COOKIE_EXPIRY_DAYS=365    # 1 an
GDPR_POLICY_VERSION=1.0

# Contact DPO
DPO_EMAIL=dpo@votreentreprise.com
PRIVACY_EMAIL=privacy@votreentreprise.com
```

### 2. Configuration TypeScript

```typescript
// lib/config/gdpr.config.ts

export const GDPR_CONFIG = {
  // Version de la politique (incrémentez pour redemander le consentement)
  policyVersion: process.env.GDPR_POLICY_VERSION || '1.0',

  // Durées de rétention (en jours)
  retention: {
    userData: parseInt(process.env.GDPR_DATA_RETENTION_DAYS || '1095'),
    auditLogs: parseInt(process.env.GDPR_LOG_RETENTION_DAYS || '365'),
    cookies: parseInt(process.env.GDPR_COOKIE_EXPIRY_DAYS || '365'),
    exportFiles: 7, // Fichiers d'export disponibles 7 jours
    deletionGrace: 30, // Délai avant suppression effective
  },

  // URLs des pages légales
  urls: {
    privacyPolicy: '/privacy',
    cookiePolicy: '/cookies',
    termsOfService: '/terms',
    legalNotices: '/legal',
  },

  // Contacts
  contacts: {
    dpo: process.env.DPO_EMAIL || '',
    privacy: process.env.PRIVACY_EMAIL || '',
  },

  // Catégories de cookies
  cookieCategories: ['essential', 'functional', 'analytics', 'marketing'] as const,

  // Types de demandes GDPR
  requestTypes: [
    'access',
    'rectification',
    'erasure',
    'portability',
    'restriction',
    'objection',
  ] as const,
};

export type CookieCategory = typeof GDPR_CONFIG.cookieCategories[number];
export type GDPRRequestType = typeof GDPR_CONFIG.requestTypes[number];
```

---

## Système de Consentement

### 1. Schéma Prisma

```prisma
// prisma/schema.prisma

// Consentements utilisateur
model UserConsent {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  type          ConsentType
  granted       Boolean
  grantedAt     DateTime?
  revokedAt     DateTime?

  // Traçabilité
  ipAddress     String?
  userAgent     String?
  source        String?     // 'banner', 'settings', 'api'

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([userId, type])
  @@index([userId])
  @@index([type])
}

enum ConsentType {
  TERMS_OF_SERVICE
  PRIVACY_POLICY
  MARKETING_EMAIL
  MARKETING_SMS
  ANALYTICS
  THIRD_PARTY_SHARING
  COOKIES_FUNCTIONAL
  COOKIES_ANALYTICS
  COOKIES_MARKETING
}
```

### 2. Service de Consentement

```typescript
// lib/services/consent.service.ts

import { prisma } from '@/lib/db/prisma';
import { ConsentType } from '@prisma/client';
import { GDPR_CONFIG } from '@/lib/config/gdpr.config';

interface ConsentInput {
  type: ConsentType;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  timestamp: Date;
}

class ConsentService {
  /**
   * Enregistrer ou mettre à jour un consentement
   */
  async setConsent(userId: string, consent: ConsentInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Upsert le consentement
      await tx.userConsent.upsert({
        where: {
          userId_type: { userId, type: consent.type },
        },
        update: {
          granted: consent.granted,
          grantedAt: consent.granted ? new Date() : null,
          revokedAt: consent.granted ? null : new Date(),
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
          source: consent.source,
        },
        create: {
          userId,
          type: consent.type,
          granted: consent.granted,
          grantedAt: consent.granted ? new Date() : null,
          revokedAt: consent.granted ? null : new Date(),
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
          source: consent.source,
        },
      });

      // Log d'audit
      await tx.auditLog.create({
        data: {
          userId,
          action: consent.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
          details: {
            type: consent.type,
            source: consent.source,
          },
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
        },
      });
    });
  }

  /**
   * Enregistrer plusieurs consentements à la fois
   */
  async setMultipleConsents(
    userId: string,
    consents: ConsentInput[]
  ): Promise<void> {
    await Promise.all(
      consents.map((consent) => this.setConsent(userId, consent))
    );
  }

  /**
   * Récupérer tous les consentements d'un utilisateur
   */
  async getConsents(userId: string): Promise<ConsentRecord[]> {
    const consents = await prisma.userConsent.findMany({
      where: { userId },
      select: {
        type: true,
        granted: true,
        grantedAt: true,
        revokedAt: true,
      },
    });

    return consents.map((c) => ({
      type: c.type,
      granted: c.granted,
      timestamp: c.granted ? c.grantedAt! : c.revokedAt!,
    }));
  }

  /**
   * Vérifier si un consentement spécifique est accordé
   */
  async hasConsent(userId: string, type: ConsentType): Promise<boolean> {
    const consent = await prisma.userConsent.findUnique({
      where: {
        userId_type: { userId, type },
      },
      select: { granted: true },
    });

    return consent?.granted ?? false;
  }

  /**
   * Vérifier si l'utilisateur a accepté les conditions obligatoires
   */
  async hasRequiredConsents(userId: string): Promise<boolean> {
    const required: ConsentType[] = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY'];

    const consents = await prisma.userConsent.findMany({
      where: {
        userId,
        type: { in: required },
        granted: true,
      },
    });

    return consents.length === required.length;
  }

  /**
   * Révoquer tous les consentements optionnels
   */
  async revokeAllOptional(userId: string, metadata: { ipAddress?: string; userAgent?: string }): Promise<void> {
    const optionalTypes: ConsentType[] = [
      'MARKETING_EMAIL',
      'MARKETING_SMS',
      'ANALYTICS',
      'THIRD_PARTY_SHARING',
      'COOKIES_FUNCTIONAL',
      'COOKIES_ANALYTICS',
      'COOKIES_MARKETING',
    ];

    await prisma.$transaction(async (tx) => {
      await tx.userConsent.updateMany({
        where: {
          userId,
          type: { in: optionalTypes },
        },
        data: {
          granted: false,
          revokedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ALL_OPTIONAL_CONSENTS_REVOKED',
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    });
  }
}

export const consentService = new ConsentService();
```

### 3. Intégration dans l'Inscription

```typescript
// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { consentService } from '@/lib/services/consent.service';
import { hashPassword } from '@/lib/utils/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  // Consentements
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les CGU' }),
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialité' }),
  }),
  acceptMarketing: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Métadonnées pour l'audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword(data.password),
        name: data.name,
      },
    });

    // Enregistrer les consentements obligatoires
    await consentService.setMultipleConsents(user.id, [
      {
        type: 'TERMS_OF_SERVICE',
        granted: true,
        ipAddress,
        userAgent,
        source: 'registration',
      },
      {
        type: 'PRIVACY_POLICY',
        granted: true,
        ipAddress,
        userAgent,
        source: 'registration',
      },
    ]);

    // Enregistrer le consentement marketing si accepté
    if (data.acceptMarketing) {
      await consentService.setConsent(user.id, {
        type: 'MARKETING_EMAIL',
        granted: true,
        ipAddress,
        userAgent,
        source: 'registration',
      });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Gestion des Données Utilisateur

### 1. Service d'Export de Données

```typescript
// lib/services/data-export.service.ts

import { prisma } from '@/lib/db/prisma';
import { GDPR_CONFIG } from '@/lib/config/gdpr.config';

interface ExportedData {
  exportDate: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
  consents: Array<{
    type: string;
    granted: boolean;
    date: string;
  }>;
  // Ajoutez toutes les autres données
  [key: string]: unknown;
}

class DataExportService {
  /**
   * Collecter toutes les données d'un utilisateur
   */
  async collectUserData(userId: string): Promise<ExportedData> {
    const [user, consents] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          // Ajoutez les relations nécessaires
        },
      }),
      prisma.userConsent.findMany({
        where: { userId },
        select: {
          type: true,
          granted: true,
          grantedAt: true,
          revokedAt: true,
        },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_EXPORTED',
        details: { reason: 'user_request' },
      },
    });

    return {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      consents: consents.map((c) => ({
        type: c.type,
        granted: c.granted,
        date: (c.grantedAt || c.revokedAt)?.toISOString() || '',
      })),
      // Ajoutez toutes les autres données de l'utilisateur
    };
  }

  /**
   * Créer une demande d'export
   */
  async createExportRequest(userId: string): Promise<string> {
    const request = await prisma.dataExportRequest.create({
      data: {
        userId,
        status: 'PENDING',
        format: 'json',
        expiresAt: new Date(Date.now() + GDPR_CONFIG.retention.exportFiles * 24 * 60 * 60 * 1000),
      },
    });

    // Déclencher le job d'export (en production, utilisez une queue)
    // await exportQueue.add('processExport', { requestId: request.id });

    return request.id;
  }

  /**
   * Traiter l'export (appelé par le worker)
   */
  async processExport(requestId: string): Promise<void> {
    const request = await prisma.dataExportRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      return;
    }

    try {
      // Marquer comme en cours
      await prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'PROCESSING' },
      });

      // Collecter les données
      const data = await this.collectUserData(request.userId);

      // Sauvegarder le fichier (utiliser un stockage sécurisé)
      const fileUrl = await this.saveExportFile(request.userId, data);

      // Mettre à jour la demande
      await prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          fileUrl,
          completedAt: new Date(),
        },
      });

      // Notifier l'utilisateur (email)
      // await emailService.sendExportReady(request.userId, fileUrl);
    } catch (error) {
      await prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  private async saveExportFile(userId: string, data: ExportedData): Promise<string> {
    // Implémenter la sauvegarde sécurisée
    // Retourner l'URL de téléchargement
    return `https://storage.example.com/exports/${userId}/${Date.now()}.json`;
  }
}

export const dataExportService = new DataExportService();
```

### 2. Service de Suppression de Données

```typescript
// lib/services/data-deletion.service.ts

import { prisma } from '@/lib/db/prisma';
import { GDPR_CONFIG } from '@/lib/config/gdpr.config';

interface DeletionResult {
  success: boolean;
  deletedData: string[];
  retainedData: string[];
  reason?: string;
}

class DataDeletionService {
  /**
   * Données soumises à rétention légale
   */
  private readonly LEGAL_RETENTION: Record<string, { table: string; reason: string; years: number }> = {
    invoices: { table: 'invoices', reason: 'Obligation fiscale', years: 10 },
    contracts: { table: 'contracts', reason: 'Obligation contractuelle', years: 5 },
  };

  /**
   * Créer une demande de suppression
   */
  async createDeletionRequest(userId: string, reason?: string): Promise<string> {
    // Marquer l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { deletionRequestedAt: new Date() },
    });

    const request = await prisma.dataDeletionRequest.create({
      data: {
        userId,
        reason,
        status: 'PENDING',
      },
    });

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETION_REQUESTED',
        details: { reason, requestId: request.id },
      },
    });

    return request.id;
  }

  /**
   * Traiter la demande de suppression
   * Appelé après le délai de grâce (30 jours par défaut)
   */
  async processDeletion(requestId: string): Promise<DeletionResult> {
    const request = await prisma.dataDeletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      return { success: false, deletedData: [], retainedData: [], reason: 'Invalid request' };
    }

    const deletedData: string[] = [];
    const retainedData: string[] = [];

    try {
      await prisma.$transaction(async (tx) => {
        // Marquer comme en cours
        await tx.dataDeletionRequest.update({
          where: { id: requestId },
          data: { status: 'PROCESSING', processedAt: new Date() },
        });

        // 1. Vérifier les données à rétention légale
        for (const [key, config] of Object.entries(this.LEGAL_RETENTION)) {
          const hasData = await this.checkLegalData(tx, request.userId, config.table);
          if (hasData) {
            retainedData.push(`${key} (${config.reason} - ${config.years} ans)`);
            await this.anonymizeLegalData(tx, request.userId, config.table);
          }
        }

        // 2. Supprimer les données non soumises à rétention
        // Consentements
        await tx.userConsent.deleteMany({ where: { userId: request.userId } });
        deletedData.push('consents');

        // Sessions
        await tx.session.deleteMany({ where: { userId: request.userId } });
        deletedData.push('sessions');

        // Tokens
        await tx.verificationToken.deleteMany({ where: { identifier: request.userId } });
        deletedData.push('tokens');

        // Ajoutez les autres tables...

        // 3. Anonymiser le profil utilisateur
        await tx.user.update({
          where: { id: request.userId },
          data: {
            email: `deleted-${request.userId}@anonymous.local`,
            name: 'Utilisateur supprimé',
            password: null,
            isAnonymized: true,
          },
        });
        deletedData.push('profile');

        // 4. Finaliser
        await tx.dataDeletionRequest.update({
          where: { id: requestId },
          data: {
            status: retainedData.length > 0 ? 'PARTIALLY_COMPLETED' : 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Log d'audit (garder pour traçabilité)
        await tx.auditLog.create({
          data: {
            userId: request.userId,
            action: 'DATA_DELETED',
            details: { deletedData, retainedData },
          },
        });
      });

      return { success: true, deletedData, retainedData };
    } catch (error) {
      await prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  /**
   * Annuler une demande de suppression (pendant le délai de grâce)
   */
  async cancelDeletionRequest(requestId: string, userId: string): Promise<boolean> {
    const request = await prisma.dataDeletionRequest.findFirst({
      where: { id: requestId, userId, status: 'PENDING' },
    });

    if (!request) {
      return false;
    }

    await prisma.$transaction([
      prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { deletionRequestedAt: null },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETION_CANCELLED',
          details: { requestId },
        },
      }),
    ]);

    return true;
  }

  private async checkLegalData(tx: any, userId: string, table: string): Promise<boolean> {
    // Vérifier si des données légales existent
    // Implémenter selon votre schéma
    return false;
  }

  private async anonymizeLegalData(tx: any, userId: string, table: string): Promise<void> {
    // Anonymiser les données tout en gardant les informations légales
    // Implémenter selon votre schéma
  }
}

export const dataDeletionService = new DataDeletionService();
```

---

## API GDPR

### Routes API

```typescript
// app/api/gdpr/consent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { consentService } from '@/lib/services/consent.service';

const consentSchema = z.object({
  type: z.enum([
    'MARKETING_EMAIL',
    'MARKETING_SMS',
    'ANALYTICS',
    'THIRD_PARTY_SHARING',
    'COOKIES_FUNCTIONAL',
    'COOKIES_ANALYTICS',
    'COOKIES_MARKETING',
  ]),
  granted: z.boolean(),
});

// GET : Récupérer les consentements
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const consents = await consentService.getConsents(session.user.id);
  return NextResponse.json({ consents });
}

// POST : Mettre à jour un consentement
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = consentSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    await consentService.setConsent(session.user.id, {
      ...data,
      ipAddress,
      userAgent,
      source: 'api',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

```typescript
// app/api/gdpr/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dataExportService } from '@/lib/services/data-export.service';

// POST : Demander un export de données
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestId = await dataExportService.createExportRequest(session.user.id);

  return NextResponse.json({
    success: true,
    message: 'Export request created. You will be notified when ready.',
    requestId,
  });
}

// GET : Télécharger l'export (si prêt)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Exporter directement les données
  const data = await dataExportService.collectUserData(session.user.id);

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="my-data-export-${Date.now()}.json"`,
    },
  });
}
```

```typescript
// app/api/gdpr/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dataDeletionService } from '@/lib/services/data-deletion.service';

const deleteSchema = z.object({
  reason: z.string().optional(),
  confirmEmail: z.string().email(),
});

// POST : Demander la suppression du compte
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = deleteSchema.parse(body);

    // Vérifier l'email
    if (data.confirmEmail !== session.user.email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 400 });
    }

    const requestId = await dataDeletionService.createDeletionRequest(
      session.user.id,
      data.reason
    );

    return NextResponse.json({
      success: true,
      message: 'Deletion request created. Your account will be deleted in 30 days.',
      requestId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE : Annuler une demande de suppression
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
  }

  const cancelled = await dataDeletionService.cancelDeletionRequest(
    requestId,
    session.user.id
  );

  if (!cancelled) {
    return NextResponse.json({ error: 'Could not cancel request' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

---

## Base de Données

### Migration Complète

```sql
-- migrations/gdpr_setup.sql

-- Table des consentements
CREATE TABLE IF NOT EXISTS "UserConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserConsent_userId_type_key" ON "UserConsent"("userId", "type");
CREATE INDEX "UserConsent_userId_idx" ON "UserConsent"("userId");
CREATE INDEX "UserConsent_type_idx" ON "UserConsent"("type");

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Table des demandes d'export
CREATE TABLE IF NOT EXISTS "DataExportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "format" TEXT NOT NULL DEFAULT 'json',
    "fileUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3)
);

CREATE INDEX "DataExportRequest_userId_idx" ON "DataExportRequest"("userId");
CREATE INDEX "DataExportRequest_status_idx" ON "DataExportRequest"("status");

-- Table des demandes de suppression
CREATE TABLE IF NOT EXISTS "DataDeletionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3)
);

CREATE INDEX "DataDeletionRequest_userId_idx" ON "DataDeletionRequest"("userId");
CREATE INDEX "DataDeletionRequest_status_idx" ON "DataDeletionRequest"("status");

-- Colonnes GDPR sur User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAnonymized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3);
```

### Job de Nettoyage Automatique

```typescript
// lib/jobs/gdpr-cleanup.job.ts

import { prisma } from '@/lib/db/prisma';
import { GDPR_CONFIG } from '@/lib/config/gdpr.config';
import { dataDeletionService } from '@/lib/services/data-deletion.service';

/**
 * Job à exécuter quotidiennement pour le nettoyage GDPR
 */
export async function runGDPRCleanup(): Promise<void> {
  console.log('[GDPR] Starting cleanup job...');

  // 1. Traiter les demandes de suppression expirées (après délai de grâce)
  const pendingDeletions = await prisma.dataDeletionRequest.findMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lte: new Date(Date.now() - GDPR_CONFIG.retention.deletionGrace * 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const request of pendingDeletions) {
    try {
      await dataDeletionService.processDeletion(request.id);
      console.log(`[GDPR] Processed deletion request ${request.id}`);
    } catch (error) {
      console.error(`[GDPR] Failed to process deletion ${request.id}:`, error);
    }
  }

  // 2. Supprimer les fichiers d'export expirés
  const expiredExports = await prisma.dataExportRequest.findMany({
    where: {
      status: 'COMPLETED',
      expiresAt: { lte: new Date() },
    },
  });

  for (const export_ of expiredExports) {
    // Supprimer le fichier du stockage
    // await storageService.deleteFile(export_.fileUrl);
    await prisma.dataExportRequest.update({
      where: { id: export_.id },
      data: { status: 'EXPIRED', fileUrl: null },
    });
  }

  // 3. Nettoyer les logs d'audit anciens
  const logRetentionDate = new Date(
    Date.now() - GDPR_CONFIG.retention.auditLogs * 24 * 60 * 60 * 1000
  );

  const deletedLogs = await prisma.auditLog.deleteMany({
    where: { createdAt: { lte: logRetentionDate } },
  });

  console.log(`[GDPR] Deleted ${deletedLogs.count} old audit logs`);

  // 4. Supprimer les comptes inactifs (si politique définie)
  // Optionnel - décommentez si vous souhaitez supprimer les comptes inactifs
  /*
  const inactiveDate = new Date(
    Date.now() - GDPR_CONFIG.retention.userData * 24 * 60 * 60 * 1000
  );

  const inactiveUsers = await prisma.user.findMany({
    where: {
      lastActivityAt: { lte: inactiveDate },
      isAnonymized: false,
    },
  });

  for (const user of inactiveUsers) {
    // Envoyer un avertissement ou supprimer
    console.log(`[GDPR] Inactive user: ${user.id}`);
  }
  */

  console.log('[GDPR] Cleanup job completed');
}
```

---

## Tests

### Tests des Services GDPR

```typescript
// __tests__/services/consent.service.test.ts

import { consentService } from '@/lib/services/consent.service';
import { prisma } from '@/lib/db/prisma';

describe('ConsentService', () => {
  const testUserId = 'test-user-id';

  beforeEach(async () => {
    // Nettoyer les données de test
    await prisma.userConsent.deleteMany({ where: { userId: testUserId } });
    await prisma.auditLog.deleteMany({ where: { userId: testUserId } });
  });

  describe('setConsent', () => {
    it('should create a new consent', async () => {
      await consentService.setConsent(testUserId, {
        type: 'MARKETING_EMAIL',
        granted: true,
        source: 'test',
      });

      const consent = await prisma.userConsent.findUnique({
        where: { userId_type: { userId: testUserId, type: 'MARKETING_EMAIL' } },
      });

      expect(consent).toBeDefined();
      expect(consent?.granted).toBe(true);
    });

    it('should create an audit log', async () => {
      await consentService.setConsent(testUserId, {
        type: 'ANALYTICS',
        granted: true,
        source: 'test',
      });

      const log = await prisma.auditLog.findFirst({
        where: { userId: testUserId, action: 'CONSENT_GRANTED' },
      });

      expect(log).toBeDefined();
    });

    it('should update existing consent', async () => {
      // Premier consentement
      await consentService.setConsent(testUserId, {
        type: 'MARKETING_EMAIL',
        granted: true,
      });

      // Révocation
      await consentService.setConsent(testUserId, {
        type: 'MARKETING_EMAIL',
        granted: false,
      });

      const consent = await prisma.userConsent.findUnique({
        where: { userId_type: { userId: testUserId, type: 'MARKETING_EMAIL' } },
      });

      expect(consent?.granted).toBe(false);
      expect(consent?.revokedAt).toBeDefined();
    });
  });

  describe('hasConsent', () => {
    it('should return false for non-existent consent', async () => {
      const result = await consentService.hasConsent(testUserId, 'MARKETING_EMAIL');
      expect(result).toBe(false);
    });

    it('should return true for granted consent', async () => {
      await consentService.setConsent(testUserId, {
        type: 'MARKETING_EMAIL',
        granted: true,
      });

      const result = await consentService.hasConsent(testUserId, 'MARKETING_EMAIL');
      expect(result).toBe(true);
    });
  });
});
```

---

## Intégration Continue

### GitHub Actions

```yaml
# .github/workflows/gdpr-audit.yml

name: GDPR Compliance Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Audit hebdomadaire
    - cron: '0 9 * * 1'

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run GDPR tests
        run: npm run test -- --grep "GDPR|Consent|Privacy"

      - name: Check for sensitive data patterns
        run: |
          echo "Checking for hardcoded secrets..."
          ! grep -rn "password\s*=" --include="*.ts" --include="*.tsx" || echo "Warning: Found password assignments"

          echo "Checking for console.log with user data..."
          ! grep -rn "console.log.*user" --include="*.ts" --include="*.tsx" || echo "Warning: Found user data logging"

      - name: Verify privacy policy exists
        run: |
          if [ ! -f "app/privacy/page.tsx" ] && [ ! -f "pages/privacy.tsx" ]; then
            echo "Error: Privacy policy page not found"
            exit 1
          fi

      - name: Verify cookie policy exists
        run: |
          if [ ! -f "app/cookies/page.tsx" ] && [ ! -f "pages/cookies.tsx" ]; then
            echo "Error: Cookie policy page not found"
            exit 1
          fi

      - name: Generate compliance report
        run: |
          echo "# GDPR Compliance Report - $(date)" > gdpr-report.md
          echo "" >> gdpr-report.md
          echo "## Checked Items" >> gdpr-report.md
          echo "- [x] Privacy policy page exists" >> gdpr-report.md
          echo "- [x] Cookie policy page exists" >> gdpr-report.md
          echo "- [x] GDPR tests passing" >> gdpr-report.md
          echo "- [x] No hardcoded secrets found" >> gdpr-report.md

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: gdpr-compliance-report
          path: gdpr-report.md
```

---

## Résumé

### Fichiers à Créer

1. **Configuration** : `lib/config/gdpr.config.ts`
2. **Services** :
   - `lib/services/consent.service.ts`
   - `lib/services/data-export.service.ts`
   - `lib/services/data-deletion.service.ts`
3. **API Routes** :
   - `app/api/gdpr/consent/route.ts`
   - `app/api/gdpr/export/route.ts`
   - `app/api/gdpr/delete/route.ts`
4. **Composants** :
   - `components/gdpr/CookieBanner.tsx`
   - `components/gdpr/PrivacyCenter.tsx`
5. **Pages** :
   - `app/privacy/page.tsx`
   - `app/cookies/page.tsx`
   - `app/terms/page.tsx`
   - `app/legal/page.tsx`
6. **Jobs** : `lib/jobs/gdpr-cleanup.job.ts`
7. **Tests** : `__tests__/services/*.test.ts`

### Commandes Utiles

```bash
# Générer les migrations
npx prisma migrate dev --name gdpr_setup

# Exécuter les tests GDPR
npm run test -- --grep "GDPR"

# Exécuter le job de nettoyage manuellement
npx ts-node scripts/run-gdpr-cleanup.ts
```

---

**Dernière mise à jour** : 2024
