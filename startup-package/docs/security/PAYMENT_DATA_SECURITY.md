# Sécurité des Données de Paiement 💳

> Guide complet pour la protection des cartes de crédit, IBAN et données financières (PCI-DSS)

---

## Table des Matières

1. [Introduction PCI-DSS](#introduction-pci-dss)
2. [Règle d'Or : Ne JAMAIS Stocker](#règle-dor--ne-jamais-stocker)
3. [Intégration Stripe (Recommandé)](#intégration-stripe-recommandé)
4. [Gestion des IBAN](#gestion-des-iban)
5. [Tokenisation](#tokenisation)
6. [Chiffrement des Données Financières](#chiffrement-des-données-financières)
7. [Conformité et Audit](#conformité-et-audit)
8. [Checklist de Sécurité](#checklist-de-sécurité)

---

## Introduction PCI-DSS

### Qu'est-ce que PCI-DSS ?

**PCI-DSS** (Payment Card Industry Data Security Standard) est un standard de sécurité obligatoire pour toute entreprise qui traite, stocke ou transmet des données de cartes de paiement.

### Niveaux de Conformité

| Niveau | Volume de Transactions | Exigences |
|--------|------------------------|-----------|
| **Niveau 1** | > 6 millions/an | Audit annuel par QSA |
| **Niveau 2** | 1-6 millions/an | SAQ + Scan trimestriel |
| **Niveau 3** | 20k-1 million/an | SAQ + Scan trimestriel |
| **Niveau 4** | < 20k/an | SAQ recommandé |

### Les 12 Exigences PCI-DSS

```
1. Installer et maintenir un pare-feu
2. Ne pas utiliser les paramètres par défaut des fournisseurs
3. Protéger les données de titulaires de carte stockées
4. Chiffrer la transmission des données sur les réseaux publics
5. Utiliser et mettre à jour régulièrement un antivirus
6. Développer et maintenir des systèmes sécurisés
7. Restreindre l'accès aux données (besoin d'en connaître)
8. Attribuer un ID unique à chaque utilisateur
9. Restreindre l'accès physique aux données
10. Suivre et surveiller tous les accès aux ressources
11. Tester régulièrement les systèmes de sécurité
12. Maintenir une politique de sécurité de l'information
```

---

## Règle d'Or : Ne JAMAIS Stocker

### Ce que vous ne devez JAMAIS stocker

```
❌ INTERDIT DE STOCKER :

┌─────────────────────────────────────────────────────────┐
│  Numéro de carte complet (PAN)                          │
│  Ex: 4532 0150 1234 5678                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CVV / CVC / CVV2                                       │
│  Ex: 123                                                │
│  ⚠️ JAMAIS, même chiffré !                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Code PIN                                               │
│  ⚠️ JAMAIS, même chiffré !                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Données de bande magnétique / Puce                     │
└─────────────────────────────────────────────────────────┘
```

### Ce que vous POUVEZ stocker (avec précautions)

```
✅ AUTORISÉ AVEC PRÉCAUTIONS :

┌─────────────────────────────────────────────────────────┐
│  4 derniers chiffres                                    │
│  Ex: **** **** **** 5678                                │
│  → Pour affichage uniquement                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Type de carte                                          │
│  Ex: Visa, Mastercard                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Date d'expiration                                      │
│  Ex: 12/25                                              │
│  → Avec chiffrement                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Token de paiement (Stripe, etc.)                       │
│  Ex: pm_1234567890                                      │
│  → C'est la méthode recommandée                         │
└─────────────────────────────────────────────────────────┘
```

---

## Intégration Stripe (Recommandé)

### Pourquoi Stripe ?

- ✅ **Conformité PCI-DSS niveau 1** (le plus élevé)
- ✅ Vous n'avez **jamais** accès aux données de carte
- ✅ Tokenisation automatique
- ✅ Interface sécurisée (Stripe Elements)
- ✅ Gestion des disputes et remboursements
- ✅ Support 3D Secure / SCA

### Architecture Sécurisée

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│  ┌─────────────────────────────────────────────────────┐│
│  │     Stripe Elements (iframe sécurisée)              ││
│  │     Les données de carte ne touchent JAMAIS         ││
│  │     votre code JavaScript                           ││
│  └─────────────────────────────────────────────────────┘│
│                         │                                │
│                         ▼                                │
│              PaymentMethod ID (token)                    │
│                   pm_1234567890                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Reçoit uniquement le token (pm_xxx)                ││
│  │  Appelle l'API Stripe pour créer le paiement        ││
│  │  Stocke : payment_intent_id, last4, brand           ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     STRIPE                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Stocke les données de carte                        ││
│  │  Traite le paiement                                 ││
│  │  Gère la conformité PCI-DSS                         ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Implémentation Frontend (React)

```typescript
// components/payment/CheckoutForm.tsx

'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Charger Stripe (clé publique uniquement !)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function CheckoutFormInner({ clientSecret, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Confirmer le paiement - Stripe gère tout
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Une erreur est survenue');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* PaymentElement = iframe sécurisée Stripe */}
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {isProcessing ? 'Traitement...' : 'Payer'}
      </button>
    </form>
  );
}

export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0066cc',
          },
        },
      }}
    >
      <CheckoutFormInner {...props} />
    </Elements>
  );
}
```

### Implémentation Backend

```typescript
// app/api/payments/create-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const createPaymentSchema = z.object({
  amount: z.number().positive().int(), // En centimes
  currency: z.string().length(3).default('eur'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, currency, description } = createPaymentSchema.parse(body);

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        userId: session.user.id,
      },
      // Activer 3D Secure automatiquement si requis
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Enregistrer la tentative de paiement (sans données sensibles !)
    await prisma.paymentAttempt.create({
      data: {
        userId: session.user.id,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
      },
    });

    // Log pour audit (sans données sensibles)
    console.log({
      action: 'PAYMENT_INTENT_CREATED',
      userId: session.user.id,
      paymentIntentId: paymentIntent.id,
      amount,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
```

### Webhook Stripe

```typescript
// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Vérifier la signature (CRITIQUE pour la sécurité)
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Traiter l'événement
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Mettre à jour le statut
      await prisma.paymentAttempt.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'succeeded',
          // Stocker uniquement les 4 derniers chiffres et le type
          cardLast4: paymentIntent.payment_method_types[0] === 'card'
            ? (paymentIntent as any).charges?.data[0]?.payment_method_details?.card?.last4
            : null,
          cardBrand: (paymentIntent as any).charges?.data[0]?.payment_method_details?.card?.brand,
        },
      });

      // Déclencher les actions post-paiement
      // await activateSubscription(paymentIntent.metadata.userId);

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.paymentAttempt.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'failed',
          errorMessage: paymentIntent.last_payment_error?.message,
        },
      });

      break;
    }

    // Ajouter d'autres événements selon vos besoins
    // 'customer.subscription.created'
    // 'invoice.payment_failed'
    // etc.
  }

  return NextResponse.json({ received: true });
}

// Désactiver le parsing du body par Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Schéma de Base de Données

```prisma
// prisma/schema.prisma

model PaymentAttempt {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  // IDs Stripe (pas de données sensibles)
  stripePaymentIntentId String   @unique
  stripeCustomerId      String?

  // Montant
  amount                Int      // En centimes
  currency              String   @default("eur")

  // Statut
  status                PaymentStatus @default(PENDING)
  errorMessage          String?

  // Données de carte NON-SENSIBLES uniquement
  cardLast4             String?  // "4242"
  cardBrand             String?  // "visa"

  // Dates
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
  @@index([stripePaymentIntentId])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
}

model Subscription {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])

  stripeSubscriptionId  String   @unique
  stripeCustomerId      String
  stripePriceId         String

  status                SubscriptionStatus
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean  @default(false)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  INCOMPLETE
  TRIALING
}
```

---

## Gestion des IBAN

### Règles de Base

```
✅ AUTORISÉ :
- Stocker l'IBAN chiffré en base de données
- Afficher les 4 derniers caractères à l'utilisateur

⚠️ ATTENTION :
- Toujours chiffrer (AES-256-GCM minimum)
- Logs sans IBAN complet
- Accès restreint

❌ INTERDIT :
- IBAN en clair en base de données
- IBAN dans les logs
- IBAN dans les URLs
```

### Structure de Stockage

```typescript
// Types pour les données bancaires

interface BankAccountSecure {
  id: string;
  userId: string;

  // Données chiffrées
  encryptedIBAN: string;          // IBAN chiffré avec AES-256-GCM
  ibanLast4: string;              // "3456" pour affichage
  ibanCountry: string;            // "FR" pour validation

  // Métadonnées (non sensibles)
  bankName?: string;
  bic?: string;                   // BIC/SWIFT
  accountHolderName: string;      // Peut être affiché

  // Statut
  isVerified: boolean;
  verifiedAt?: Date;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}
```

### Service IBAN Sécurisé

```typescript
// lib/services/bank-account.service.ts

import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from '@/lib/crypto/encryption';
import { validateIBAN, formatIBAN, getBankFromIBAN } from '@/lib/utils/iban';

interface CreateBankAccountInput {
  userId: string;
  iban: string;
  accountHolderName: string;
}

class BankAccountService {
  /**
   * Créer un compte bancaire avec IBAN chiffré
   */
  async create(input: CreateBankAccountInput): Promise<{ id: string; ibanLast4: string }> {
    const { userId, iban, accountHolderName } = input;

    // 1. Valider le format IBAN
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    if (!validateIBAN(cleanIBAN)) {
      throw new Error('Invalid IBAN format');
    }

    // 2. Extraire les informations non-sensibles
    const ibanLast4 = cleanIBAN.slice(-4);
    const ibanCountry = cleanIBAN.slice(0, 2);
    const bankInfo = getBankFromIBAN(cleanIBAN);

    // 3. Chiffrer l'IBAN
    const encryptedIBAN = encrypt(cleanIBAN);

    // 4. Stocker
    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId,
        encryptedIBAN,
        ibanLast4,
        ibanCountry,
        bankName: bankInfo?.name,
        bic: bankInfo?.bic,
        accountHolderName,
        isVerified: false,
      },
    });

    // 5. Log d'audit (sans IBAN complet !)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BANK_ACCOUNT_ADDED',
        details: {
          bankAccountId: bankAccount.id,
          ibanCountry,
          ibanLast4, // Uniquement les 4 derniers
        },
      },
    });

    return {
      id: bankAccount.id,
      ibanLast4,
    };
  }

  /**
   * Récupérer l'IBAN déchiffré (usage interne uniquement !)
   */
  async getDecryptedIBAN(bankAccountId: string, userId: string): Promise<string> {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // Log l'accès pour audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BANK_ACCOUNT_ACCESSED',
        details: {
          bankAccountId,
          purpose: 'payout', // Indiquer la raison
        },
      },
    });

    return decrypt(bankAccount.encryptedIBAN);
  }

  /**
   * Afficher les comptes bancaires (données masquées)
   */
  async listForUser(userId: string): Promise<Array<{
    id: string;
    displayName: string;
    ibanLast4: string;
    bankName: string | null;
    isVerified: boolean;
  }>> {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId },
      select: {
        id: true,
        accountHolderName: true,
        ibanLast4: true,
        ibanCountry: true,
        bankName: true,
        isVerified: true,
      },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      displayName: `${acc.ibanCountry}** **** **** ${acc.ibanLast4}`,
      ibanLast4: acc.ibanLast4,
      bankName: acc.bankName,
      isVerified: acc.isVerified,
    }));
  }

  /**
   * Supprimer un compte bancaire
   */
  async delete(bankAccountId: string, userId: string): Promise<void> {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    await prisma.bankAccount.delete({
      where: { id: bankAccountId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BANK_ACCOUNT_DELETED',
        details: {
          bankAccountId,
          ibanLast4: bankAccount.ibanLast4,
        },
      },
    });
  }
}

export const bankAccountService = new BankAccountService();
```

### Validation IBAN

```typescript
// lib/utils/iban.ts

/**
 * Valider un IBAN selon la norme ISO 13616
 */
export function validateIBAN(iban: string): boolean {
  // Nettoyer l'IBAN
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

  // Vérifier la longueur (15-34 caractères selon le pays)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return false;
  }

  // Vérifier le format (2 lettres + 2 chiffres + reste alphanumérique)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN)) {
    return false;
  }

  // Réorganiser pour le calcul de checksum
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);

  // Convertir les lettres en chiffres (A=10, B=11, etc.)
  const numericString = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : char;
    })
    .join('');

  // Calculer le modulo 97
  const checksum = mod97(numericString);

  return checksum === 1;
}

/**
 * Calculer modulo 97 pour grands nombres
 */
function mod97(numericString: string): number {
  let remainder = 0;
  for (const char of numericString) {
    remainder = (remainder * 10 + parseInt(char)) % 97;
  }
  return remainder;
}

/**
 * Formater un IBAN pour l'affichage
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

/**
 * Masquer un IBAN pour l'affichage sécurisé
 */
export function maskIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, '');
  const country = clean.slice(0, 2);
  const last4 = clean.slice(-4);
  return `${country}** **** **** ${last4}`;
}

/**
 * Longueurs d'IBAN par pays
 */
const IBAN_LENGTHS: Record<string, number> = {
  FR: 27, // France
  DE: 22, // Allemagne
  ES: 24, // Espagne
  IT: 27, // Italie
  BE: 16, // Belgique
  NL: 18, // Pays-Bas
  LU: 20, // Luxembourg
  CH: 21, // Suisse
  GB: 22, // Royaume-Uni
  // Ajouter d'autres pays selon vos besoins
};

/**
 * Vérifier la longueur IBAN pour un pays
 */
export function validateIBANLength(iban: string): boolean {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  const country = clean.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];

  if (!expectedLength) {
    // Pays non connu, vérification basique
    return clean.length >= 15 && clean.length <= 34;
  }

  return clean.length === expectedLength;
}

/**
 * Extraire les informations bancaires de l'IBAN
 */
export function getBankFromIBAN(iban: string): { name?: string; bic?: string } | null {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  const country = clean.slice(0, 2);

  // Pour la France, les positions 5-9 contiennent le code banque
  if (country === 'FR') {
    const bankCode = clean.slice(4, 9);
    // Vous pouvez maintenir une base de données des codes banques
    // ou utiliser une API comme OpenIBAN
    return { name: undefined, bic: undefined };
  }

  return null;
}
```

---

## Tokenisation

### Principe de la Tokenisation

```
┌──────────────────────────────────────────────────────────┐
│                    TOKENISATION                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Donnée Sensible          Token                         │
│   ────────────────  →  ──────────────                    │
│   4532015012345678     tok_1234abcd                      │
│                                                           │
│   ✅ Token stocké dans votre base de données             │
│   ✅ Donnée réelle stockée chez le fournisseur (Stripe)  │
│   ✅ Token inutilisable seul                              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Avantages

```
1. 🔒 Réduction du périmètre PCI-DSS
   → Vous ne stockez plus de données de carte

2. 🔄 Réutilisation pour paiements récurrents
   → Le token permet de facturer sans redemander la carte

3. 📊 Conformité simplifiée
   → Le fournisseur gère la conformité

4. 🛡️ Sécurité renforcée
   → En cas de fuite, les tokens sont inutilisables
```

### Implémentation avec Stripe

```typescript
// lib/services/payment-method.service.ts

import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class PaymentMethodService {
  /**
   * Sauvegarder une méthode de paiement (token)
   */
  async savePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    // 1. Récupérer ou créer le customer Stripe
    let stripeCustomerId = await this.getOrCreateCustomer(userId);

    // 2. Attacher la méthode de paiement au customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // 3. Récupérer les détails (non-sensibles)
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // 4. Stocker en base (uniquement le token et infos non-sensibles)
    await prisma.savedPaymentMethod.create({
      data: {
        userId,
        stripePaymentMethodId: paymentMethodId,
        type: paymentMethod.type,
        // Pour les cartes
        cardBrand: paymentMethod.card?.brand,
        cardLast4: paymentMethod.card?.last4,
        cardExpMonth: paymentMethod.card?.exp_month,
        cardExpYear: paymentMethod.card?.exp_year,
        // Pour SEPA
        sepaLast4: paymentMethod.sepa_debit?.last4,
      },
    });

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_METHOD_SAVED',
        details: {
          type: paymentMethod.type,
          last4: paymentMethod.card?.last4 || paymentMethod.sepa_debit?.last4,
        },
      },
    });
  }

  /**
   * Lister les méthodes de paiement sauvegardées
   */
  async listSavedMethods(userId: string) {
    return prisma.savedPaymentMethod.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        type: true,
        cardBrand: true,
        cardLast4: true,
        cardExpMonth: true,
        cardExpYear: true,
        sepaLast4: true,
        isDefault: true,
      },
    });
  }

  /**
   * Utiliser une méthode sauvegardée pour un paiement
   */
  async chargeWithSavedMethod(
    userId: string,
    savedMethodId: string,
    amount: number
  ): Promise<string> {
    const savedMethod = await prisma.savedPaymentMethod.findFirst({
      where: { id: savedMethodId, userId },
    });

    if (!savedMethod) {
      throw new Error('Payment method not found');
    }

    const customer = await this.getOrCreateCustomer(userId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer,
      payment_method: savedMethod.stripePaymentMethodId,
      confirm: true,
      off_session: true, // Paiement sans interaction utilisateur
    });

    return paymentIntent.id;
  }

  private async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user?.email,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
}

export const paymentMethodService = new PaymentMethodService();
```

---

## Chiffrement des Données Financières

### Utilitaire de Chiffrement

```typescript
// lib/crypto/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Récupérer la clé de chiffrement
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set');
  }

  // La clé doit être exactement 32 bytes (256 bits)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Chiffrer une donnée sensible
 *
 * Format de sortie: salt:iv:authTag:encryptedData (tout en base64)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Dériver une clé unique avec le salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combiner tous les éléments
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Déchiffrer une donnée
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();

  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const [saltB64, ivB64, authTagB64, encrypted] = parts;

  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  // Dériver la même clé
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Générer une clé de chiffrement
 * Utiliser pour créer ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hacher une donnée (pour comparaison sans déchiffrement)
 */
export function hashSensitiveData(data: string): string {
  const key = getEncryptionKey();
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}
```

### Schéma Prisma avec Champs Chiffrés

```prisma
// prisma/schema.prisma

model BankAccount {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id])

  // IBAN chiffré
  encryptedIBAN       String   // Chiffré avec AES-256-GCM
  ibanHash            String?  // Hash pour vérification de doublon
  ibanLast4           String   // Pour affichage
  ibanCountry         String   // Code pays

  // BIC (peut être stocké en clair ou chiffré selon votre politique)
  bic                 String?

  // Informations non sensibles
  accountHolderName   String
  bankName            String?

  // Statut
  isVerified          Boolean  @default(false)
  verifiedAt          DateTime?
  isDefault           Boolean  @default(false)
  isDeleted           Boolean  @default(false)

  // Metadata chiffrement
  encryptionKeyVersion Int     @default(1)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([userId, ibanHash])
  @@index([userId])
}

model SavedPaymentMethod {
  id                      String   @id @default(cuid())
  userId                  String
  user                    User     @relation(fields: [userId], references: [id])

  // Token Stripe (pas sensible - inutilisable seul)
  stripePaymentMethodId   String   @unique

  // Type
  type                    String   // "card", "sepa_debit", etc.

  // Détails carte (non sensibles)
  cardBrand               String?  // "visa", "mastercard"
  cardLast4               String?  // "4242"
  cardExpMonth            Int?
  cardExpYear             Int?

  // Détails SEPA (non sensibles)
  sepaLast4               String?  // "3456"

  // Statut
  isDefault               Boolean  @default(false)
  isDeleted               Boolean  @default(false)

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@index([userId])
}
```

---

## Conformité et Audit

### Logs d'Audit

```typescript
// lib/services/audit.service.ts

import { prisma } from '@/lib/db/prisma';

type AuditAction =
  | 'PAYMENT_CREATED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_METHOD_SAVED'
  | 'PAYMENT_METHOD_DELETED'
  | 'BANK_ACCOUNT_ADDED'
  | 'BANK_ACCOUNT_ACCESSED'
  | 'BANK_ACCOUNT_DELETED'
  | 'SENSITIVE_DATA_ACCESSED'
  | 'SUSPICIOUS_ACTIVITY';

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warning' | 'critical';
}

class AuditService {
  async log(input: AuditLogInput): Promise<void> {
    // Nettoyer les détails pour ne JAMAIS logger de données sensibles
    const safeDetails = this.sanitizeDetails(input.details);

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        details: safeDetails,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        severity: input.severity || 'info',
      },
    });

    // Alerter en cas d'activité critique
    if (input.severity === 'critical') {
      await this.alertSecurityTeam(input);
    }
  }

  /**
   * Supprimer les données sensibles des logs
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'iban',
      'cardNumber',
      'cvv',
      'password',
      'secret',
      'token',
      'encryptedIBAN',
    ];

    const sanitized = { ...details };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Alerter l'équipe de sécurité
   */
  private async alertSecurityTeam(input: AuditLogInput): Promise<void> {
    // Envoyer une alerte (email, Slack, PagerDuty, etc.)
    console.error('CRITICAL SECURITY EVENT:', {
      action: input.action,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Détecter les activités suspectes
   */
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    const recentFailures = await prisma.auditLog.count({
      where: {
        userId,
        action: 'PAYMENT_FAILED',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
    });

    // Plus de 5 échecs en 1 heure = suspect
    if (recentFailures > 5) {
      await this.log({
        userId,
        action: 'SUSPICIOUS_ACTIVITY',
        details: {
          reason: 'Multiple payment failures',
          count: recentFailures,
        },
        severity: 'critical',
      });
      return true;
    }

    return false;
  }
}

export const auditService = new AuditService();
```

### Rapport de Conformité

```typescript
// scripts/generate-compliance-report.ts

import { prisma } from '@/lib/db/prisma';
import { writeFileSync } from 'fs';

async function generateComplianceReport() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Statistiques des paiements
  const paymentStats = await prisma.paymentAttempt.groupBy({
    by: ['status'],
    _count: true,
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Accès aux données sensibles
  const sensitiveAccess = await prisma.auditLog.count({
    where: {
      action: { in: ['SENSITIVE_DATA_ACCESSED', 'BANK_ACCOUNT_ACCESSED'] },
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Activités suspectes
  const suspiciousActivities = await prisma.auditLog.findMany({
    where: {
      action: 'SUSPICIOUS_ACTIVITY',
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      userId: true,
      details: true,
      createdAt: true,
    },
  });

  const report = {
    generatedAt: now.toISOString(),
    period: {
      from: thirtyDaysAgo.toISOString(),
      to: now.toISOString(),
    },
    payments: paymentStats,
    sensitiveDataAccess: sensitiveAccess,
    suspiciousActivities: suspiciousActivities.length,
    details: suspiciousActivities,
  };

  writeFileSync(
    `compliance-report-${now.toISOString().split('T')[0]}.json`,
    JSON.stringify(report, null, 2)
  );

  console.log('Compliance report generated');
}

generateComplianceReport();
```

---

## Checklist de Sécurité

### Cartes de Crédit

- [ ] **Jamais** stocker le numéro complet (PAN)
- [ ] **Jamais** stocker le CVV/CVC
- [ ] Utiliser Stripe Elements ou équivalent
- [ ] Stocker uniquement les tokens
- [ ] Stocker les 4 derniers chiffres pour affichage
- [ ] Webhooks sécurisés avec vérification de signature
- [ ] 3D Secure / SCA activé

### IBAN

- [ ] Chiffrement AES-256-GCM
- [ ] Clé de chiffrement dans les secrets
- [ ] Stocker les 4 derniers caractères pour affichage
- [ ] Validation du format avant stockage
- [ ] Logs sans IBAN complet

### Général

- [ ] Logs d'audit pour tous les accès sensibles
- [ ] Pas de données sensibles dans les logs
- [ ] Accès restreint aux données (principe du moindre privilège)
- [ ] Rotation des clés de chiffrement documentée
- [ ] Tests de sécurité réguliers
- [ ] Plan de réponse aux incidents

### Infrastructure

- [ ] HTTPS obligatoire (TLS 1.2+)
- [ ] Certificats SSL valides
- [ ] Headers de sécurité (CSP, HSTS, etc.)
- [ ] Pare-feu configuré
- [ ] Monitoring des accès

---

**Ressources** :
- [PCI DSS Quick Reference Guide](https://www.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf)
- [Stripe Security Documentation](https://stripe.com/docs/security)
- [OWASP Payment Security](https://owasp.org/www-project-secure-headers/)

---

**Dernière mise à jour** : 2024
