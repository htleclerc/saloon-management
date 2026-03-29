# Gestion des Secrets et Variables Sensibles 🔐

> Guide complet pour protéger vos clés API, tokens, mots de passe et configurations sensibles

---

## Table des Matières

1. [Principes Fondamentaux](#principes-fondamentaux)
2. [Variables d'Environnement](#variables-denvironnement)
3. [Stockage Sécurisé des Secrets](#stockage-sécurisé-des-secrets)
4. [Rotation des Secrets](#rotation-des-secrets)
5. [Détection de Fuites](#détection-de-fuites)
6. [Bonnes Pratiques par Environnement](#bonnes-pratiques-par-environnement)
7. [Outils et Services](#outils-et-services)
8. [Checklist de Sécurité](#checklist-de-sécurité)

---

## Principes Fondamentaux

### Les 5 Règles d'Or

```
1. ❌ JAMAIS de secrets en dur dans le code
2. ❌ JAMAIS de secrets dans les commits Git
3. ❌ JAMAIS de secrets dans les logs
4. ✅ TOUJOURS utiliser des variables d'environnement
5. ✅ TOUJOURS chiffrer les secrets au repos
```

### Types de Secrets

| Type | Exemples | Niveau de Risque |
|------|----------|------------------|
| **Clés API** | Stripe, SendGrid, Google Maps | 🔴 Critique |
| **Tokens d'authentification** | JWT secret, OAuth secrets | 🔴 Critique |
| **Identifiants base de données** | DATABASE_URL, Redis password | 🔴 Critique |
| **Clés de chiffrement** | ENCRYPTION_KEY, HMAC secrets | 🔴 Critique |
| **Webhooks secrets** | Stripe webhooks, GitHub webhooks | 🟠 Élevé |
| **Clés tierces** | Analytics, monitoring | 🟡 Moyen |

### Ce qui arrive si un secret fuite

```
🔴 Clé Stripe fuitée :
   → Transactions frauduleuses
   → Vol de données de paiement
   → Amendes PCI-DSS
   → Poursuites légales

🔴 DATABASE_URL fuitée :
   → Accès total à vos données
   → Vol de données utilisateurs
   → Suppression de données
   → Ransomware

🔴 JWT_SECRET fuité :
   → Usurpation d'identité
   → Accès administrateur
   → Compromission totale
```

---

## Variables d'Environnement

### Structure Recommandée

```bash
# .env.example (À COMMITTER - sans valeurs réelles)

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
APP_URL=http://localhost:3000
APP_NAME="Mon Application"

# ===========================================
# BASE DE DONNÉES
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DATABASE_POOL_SIZE=10

# ===========================================
# AUTHENTIFICATION
# ===========================================
# Générer avec: openssl rand -base64 32
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ===========================================
# CHIFFREMENT
# ===========================================
# Générer avec: openssl rand -hex 32
ENCRYPTION_KEY=""
ENCRYPTION_ALGORITHM="aes-256-gcm"

# ===========================================
# PAIEMENTS (Stripe)
# ===========================================
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ===========================================
# EMAIL
# ===========================================
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM="noreply@example.com"

# ===========================================
# STOCKAGE
# ===========================================
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION="eu-west-1"

# ===========================================
# MONITORING
# ===========================================
SENTRY_DSN=""
LOG_LEVEL="info"

# ===========================================
# FEATURE FLAGS
# ===========================================
FEATURE_NEW_DASHBOARD=false
FEATURE_BETA_FEATURES=false
```

### Fichiers d'Environnement

```
project/
├── .env                    # ❌ NE PAS COMMITTER (local uniquement)
├── .env.local              # ❌ NE PAS COMMITTER (surcharge local)
├── .env.example            # ✅ À COMMITTER (template sans valeurs)
├── .env.development        # ⚠️ Uniquement valeurs non-sensibles
├── .env.production         # ❌ NE PAS COMMITTER
└── .env.test               # ⚠️ Uniquement valeurs de test
```

### .gitignore Obligatoire

```gitignore
# Secrets et environnement
.env
.env.local
.env.*.local
.env.production
.env.staging

# Clés et certificats
*.pem
*.key
*.p12
*.pfx
*.crt
*.cer
private/
secrets/

# IDE et configurations locales
.idea/
.vscode/settings.json
*.local

# Fichiers sensibles spécifiques
credentials.json
service-account.json
firebase-adminsdk*.json
google-credentials.json
```

### Validation des Variables d'Environnement

```typescript
// lib/config/env.ts

import { z } from 'zod';

/**
 * Schéma de validation des variables d'environnement
 * Échoue au démarrage si une variable requise est manquante
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url(),

  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url(),

  // Chiffrement
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),

  // Stripe (optionnel en dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email (optionnel en dev)
  SMTP_HOST: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

// Type inféré
export type Env = z.infer<typeof envSchema>;

// Validation au démarrage
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Exporter les variables validées
export const env = validateEnv();

// Vérification de sécurité en production
if (env.NODE_ENV === 'production') {
  const requiredInProd = [
    'ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SMTP_HOST',
  ];

  for (const key of requiredInProd) {
    if (!process.env[key]) {
      throw new Error(`${key} is required in production`);
    }
  }
}
```

### Utilisation Sécurisée

```typescript
// ✅ BON - Import centralisé
import { env } from '@/lib/config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ❌ MAUVAIS - Accès direct sans validation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ❌ TRÈS MAUVAIS - Secret en dur
const stripe = new Stripe('sk_live_xxxxx');
```

---

## Stockage Sécurisé des Secrets

### Niveaux de Stockage

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├─────────────────────────────────────────────────────────┤
│  🥇 Vault (HashiCorp Vault, AWS Secrets Manager)        │
│     → Chiffrement, rotation automatique, audit          │
├─────────────────────────────────────────────────────────┤
│  🥈 Variables d'environnement plateforme                │
│     → Vercel, Railway, Heroku (chiffrées au repos)      │
├─────────────────────────────────────────────────────────┤
│  🥉 Fichiers .env chiffrés                              │
│     → dotenv-vault, SOPS                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DÉVELOPPEMENT                         │
├─────────────────────────────────────────────────────────┤
│  ✅ Fichiers .env locaux (non committés)                │
│  ✅ Gestionnaire de mots de passe (1Password, Bitwarden)│
│  ❌ Jamais dans le code ou les notes                    │
└─────────────────────────────────────────────────────────┘
```

### Solution 1 : Vercel (Recommandé pour Next.js)

```bash
# Installer la CLI Vercel
npm i -g vercel

# Lier le projet
vercel link

# Ajouter des secrets
vercel env add STRIPE_SECRET_KEY production
vercel env add DATABASE_URL production

# Lister les secrets
vercel env ls

# Télécharger les secrets en local (dev)
vercel env pull .env.local
```

**Configuration Vercel** :
1. Dashboard → Settings → Environment Variables
2. Sélectionner l'environnement (Production, Preview, Development)
3. Les variables sont automatiquement injectées au build

### Solution 2 : dotenv-vault (Multi-environnement)

```bash
# Installer
npm install dotenv-vault --save-dev

# Initialiser
npx dotenv-vault new

# Pousser les secrets (chiffrés)
npx dotenv-vault push

# Tirer les secrets
npx dotenv-vault pull

# Générer les clés pour CI/CD
npx dotenv-vault keys
```

```typescript
// Chargement automatique
require('dotenv-vault').config();
```

### Solution 3 : AWS Secrets Manager

```typescript
// lib/secrets/aws-secrets.ts

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'eu-west-1' });

interface AppSecrets {
  DATABASE_URL: string;
  STRIPE_SECRET_KEY: string;
  ENCRYPTION_KEY: string;
}

let cachedSecrets: AppSecrets | null = null;

export async function getSecrets(): Promise<AppSecrets> {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  const command = new GetSecretValueCommand({
    SecretId: 'prod/myapp/secrets',
  });

  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error('No secret string found');
  }

  cachedSecrets = JSON.parse(response.SecretString);
  return cachedSecrets!;
}

// Utilisation
const secrets = await getSecrets();
const stripe = new Stripe(secrets.STRIPE_SECRET_KEY);
```

### Solution 4 : HashiCorp Vault

```typescript
// lib/secrets/vault.ts

import Vault from 'node-vault';

const vault = Vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function getSecret(path: string): Promise<string> {
  const result = await vault.read(`secret/data/${path}`);
  return result.data.data.value;
}

// Utilisation
const stripeKey = await getSecret('stripe/secret_key');
```

---

## Rotation des Secrets

### Politique de Rotation

| Type de Secret | Fréquence | Automatisable |
|----------------|-----------|---------------|
| Clés API tierces | 90 jours | ⚠️ Selon le service |
| JWT_SECRET | 30-90 jours | ✅ Oui |
| ENCRYPTION_KEY | Annuel | ⚠️ Migration requise |
| Database password | 90 jours | ✅ Oui |
| OAuth secrets | Annuel | ⚠️ Reconfiguration |

### Rotation Sans Downtime (JWT)

```typescript
// lib/auth/jwt-rotation.ts

import jwt from 'jsonwebtoken';
import { env } from '@/lib/config/env';

interface JWTConfig {
  currentKey: string;
  previousKey?: string; // Pour la transition
  keyRotatedAt: Date;
}

// Récupérer la config (depuis Vault ou DB)
async function getJWTConfig(): Promise<JWTConfig> {
  // En production, récupérer depuis un stockage sécurisé
  return {
    currentKey: env.JWT_SECRET_CURRENT,
    previousKey: env.JWT_SECRET_PREVIOUS,
    keyRotatedAt: new Date(env.JWT_KEY_ROTATED_AT),
  };
}

/**
 * Signer avec la clé actuelle
 */
export async function signToken(payload: object): Promise<string> {
  const config = await getJWTConfig();
  return jwt.sign(payload, config.currentKey, { expiresIn: '7d' });
}

/**
 * Vérifier avec la clé actuelle, fallback sur l'ancienne
 */
export async function verifyToken(token: string): Promise<any> {
  const config = await getJWTConfig();

  try {
    // Essayer avec la clé actuelle
    return jwt.verify(token, config.currentKey);
  } catch (error) {
    // Si échec et qu'il y a une ancienne clé, essayer avec
    if (config.previousKey) {
      try {
        const decoded = jwt.verify(token, config.previousKey);
        // Token valide avec ancienne clé - le renouveler automatiquement
        console.log('Token verified with previous key, should be renewed');
        return decoded;
      } catch {
        throw new Error('Invalid token');
      }
    }
    throw error;
  }
}

/**
 * Processus de rotation
 */
export async function rotateJWTSecret(): Promise<void> {
  // 1. Générer nouvelle clé
  const newSecret = crypto.randomBytes(32).toString('base64');

  // 2. L'ancienne clé actuelle devient la clé précédente
  const currentConfig = await getJWTConfig();

  // 3. Mettre à jour la configuration
  await updateJWTConfig({
    currentKey: newSecret,
    previousKey: currentConfig.currentKey,
    keyRotatedAt: new Date(),
  });

  // 4. Log pour audit
  console.log('JWT secret rotated at', new Date().toISOString());

  // 5. Après X jours, supprimer l'ancienne clé
  // (Les tokens signés avec l'ancienne clé auront expiré)
}
```

### Rotation des Clés de Chiffrement

```typescript
// lib/crypto/key-rotation.ts

import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

interface EncryptionKeyVersion {
  version: number;
  key: string;
  createdAt: Date;
  status: 'active' | 'deprecated' | 'retired';
}

/**
 * Rechiffrer les données avec la nouvelle clé
 * À exécuter en batch pendant la maintenance
 */
export async function reencryptUserData(
  oldKey: string,
  newKey: string,
  batchSize = 100
): Promise<void> {
  let processed = 0;
  let hasMore = true;

  while (hasMore) {
    // Récupérer un batch
    const users = await prisma.user.findMany({
      where: {
        encryptionKeyVersion: { lt: CURRENT_KEY_VERSION },
      },
      take: batchSize,
    });

    if (users.length === 0) {
      hasMore = false;
      break;
    }

    // Rechiffrer chaque utilisateur
    for (const user of users) {
      // Déchiffrer avec l'ancienne clé
      const decryptedSSN = decrypt(user.encryptedSSN, oldKey);
      const decryptedIBAN = decrypt(user.encryptedIBAN, oldKey);

      // Rechiffrer avec la nouvelle clé
      const newEncryptedSSN = encrypt(decryptedSSN, newKey);
      const newEncryptedIBAN = encrypt(decryptedIBAN, newKey);

      // Mettre à jour
      await prisma.user.update({
        where: { id: user.id },
        data: {
          encryptedSSN: newEncryptedSSN,
          encryptedIBAN: newEncryptedIBAN,
          encryptionKeyVersion: CURRENT_KEY_VERSION,
        },
      });

      processed++;
    }

    console.log(`Processed ${processed} users`);
  }

  console.log(`Key rotation complete. Total: ${processed} users`);
}
```

---

## Détection de Fuites

### Git Hooks (Pré-commit)

```bash
# Installer git-secrets
brew install git-secrets  # macOS
# ou
pip install git-secrets   # Python

# Configurer pour le repo
cd your-project
git secrets --install
git secrets --register-aws

# Ajouter des patterns personnalisés
git secrets --add 'sk_live_[a-zA-Z0-9]+'          # Stripe live key
git secrets --add 'sk_test_[a-zA-Z0-9]+'          # Stripe test key
git secrets --add 'AKIA[0-9A-Z]{16}'              # AWS Access Key
git secrets --add 'ghp_[a-zA-Z0-9]{36}'           # GitHub token
git secrets --add 'xox[baprs]-[a-zA-Z0-9-]+'     # Slack token
git secrets --add '[a-zA-Z0-9+/]{40,}'            # Generic base64 secret

# Scanner l'historique
git secrets --scan-history
```

### Husky + lint-staged

```bash
# Installer
npm install husky lint-staged --save-dev

# Configurer husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "npm run lint:secrets",
      "eslint --fix"
    ]
  },
  "scripts": {
    "lint:secrets": "node scripts/check-secrets.js"
  }
}
```

```javascript
// scripts/check-secrets.js

const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  // Clés API
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe Live Key' },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/, name: 'Stripe Test Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Token' },
  { pattern: /xox[baprs]-[a-zA-Z0-9-]+/, name: 'Slack Token' },

  // Mots de passe
  { pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/, name: 'Hardcoded Password' },
  { pattern: /secret\s*[:=]\s*['"][^'"]{8,}['"]/, name: 'Hardcoded Secret' },

  // URLs avec credentials
  { pattern: /[a-z]+:\/\/[^:]+:[^@]+@/, name: 'URL with credentials' },

  // Private keys
  { pattern: /-----BEGIN (RSA |EC |)PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /-----BEGIN CERTIFICATE-----/, name: 'Certificate' },
];

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env.example',
  '*.md',
  'check-secrets.js', // Ce fichier
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  for (const { pattern, name } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`⚠️  Potential ${name} found in ${filePath}`);
    }
  }

  return issues;
}

function scanDirectory(dir) {
  const issues = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip ignored paths
    if (IGNORED_PATHS.some(ignored => filePath.includes(ignored))) {
      continue;
    }

    if (stat.isDirectory()) {
      issues.push(...scanDirectory(filePath));
    } else if (stat.isFile() && /\.(js|ts|tsx|json|yaml|yml)$/.test(file)) {
      issues.push(...checkFile(filePath));
    }
  }

  return issues;
}

// Run
const issues = scanDirectory('.');

if (issues.length > 0) {
  console.error('\n🚨 SECURITY ALERT: Potential secrets detected!\n');
  issues.forEach(issue => console.error(issue));
  console.error('\nCommit blocked. Please remove secrets before committing.\n');
  process.exit(1);
} else {
  console.log('✅ No secrets detected');
  process.exit(0);
}
```

### GitHub Secret Scanning

GitHub scanne automatiquement les repos pour les secrets connus. Pour les repos privés :

1. Settings → Security → Secret scanning
2. Activer "Secret scanning"
3. Activer "Push protection" (bloque les pushes avec secrets)

### Trufflehog (Scan approfondi)

```bash
# Installer
brew install trufflehog  # ou pip install trufflehog

# Scanner le repo actuel
trufflehog git file://. --only-verified

# Scanner un repo distant
trufflehog git https://github.com/user/repo.git

# Scanner avec historique complet
trufflehog git file://. --since-commit HEAD~100
```

---

## Bonnes Pratiques par Environnement

### Développement Local

```typescript
// ✅ Utiliser des valeurs de test/dev
STRIPE_SECRET_KEY="sk_test_..." // Jamais sk_live_ en dev
DATABASE_URL="postgresql://localhost/myapp_dev"

// ✅ Fichier .env.local ignoré par git
// ✅ Partager les secrets via gestionnaire de mots de passe (1Password, Bitwarden)

// ❌ Ne jamais partager .env par email, Slack, etc.
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy
        env:
          # Secrets GitHub (Repository → Settings → Secrets)
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        run: |
          npm run build
          npm run deploy

      # ❌ JAMAIS afficher les secrets dans les logs
      - name: Debug (MAUVAIS)
        run: echo $DATABASE_URL  # ❌ JAMAIS FAIRE ÇA

      # ✅ Masquer automatiquement
      - name: Check secret exists
        run: |
          if [ -n "$DATABASE_URL" ]; then
            echo "✅ DATABASE_URL is set"
          else
            echo "❌ DATABASE_URL is missing"
            exit 1
          fi
```

### Production

```typescript
// Configuration de production

// ✅ Variables injectées par la plateforme (Vercel, Railway)
// ✅ Secrets stockés dans un vault (AWS Secrets Manager, HashiCorp Vault)
// ✅ Rotation automatique configurée
// ✅ Monitoring des accès aux secrets
// ✅ Principe du moindre privilège (least privilege)

// Exemple: Accès différencié
const stripeKey = isAdmin
  ? await getSecret('stripe/admin_key')     // Plus de permissions
  : await getSecret('stripe/readonly_key'); // Permissions limitées
```

---

## Outils et Services

### Comparatif des Solutions

| Solution | Prix | Rotation Auto | Audit | Complexité |
|----------|------|---------------|-------|------------|
| **Variables Vercel** | Gratuit | ❌ | ⚠️ | ⭐ |
| **dotenv-vault** | Gratuit/Payant | ❌ | ✅ | ⭐⭐ |
| **AWS Secrets Manager** | ~$0.40/secret/mois | ✅ | ✅ | ⭐⭐⭐ |
| **HashiCorp Vault** | Gratuit/Entreprise | ✅ | ✅ | ⭐⭐⭐⭐ |
| **1Password Secrets** | $19.95/mois | ❌ | ✅ | ⭐⭐ |
| **Doppler** | Gratuit/Payant | ❌ | ✅ | ⭐⭐ |

### Recommandations par Taille

```
🏠 Projet Personnel / MVP :
   → Variables Vercel + .env.local
   → Coût: Gratuit

🏢 Startup / PME :
   → Doppler ou dotenv-vault
   → + GitHub Secret Scanning
   → Coût: 0-50€/mois

🏛️ Entreprise :
   → AWS Secrets Manager ou HashiCorp Vault
   → + Rotation automatique
   → + Audit complet
   → Coût: 100€+/mois
```

---

## Checklist de Sécurité

### Avant chaque commit

- [ ] Pas de secrets en dur dans le code
- [ ] .env ajouté au .gitignore
- [ ] git-secrets ou équivalent configuré
- [ ] Variables d'environnement validées avec Zod

### Configuration du projet

- [ ] .env.example présent et à jour
- [ ] .gitignore inclut tous les fichiers sensibles
- [ ] Validation des env vars au démarrage
- [ ] Secrets séparés par environnement

### Production

- [ ] Secrets stockés dans un vault/plateforme sécurisée
- [ ] Politique de rotation définie
- [ ] Monitoring des accès aux secrets
- [ ] Principe du moindre privilège appliqué
- [ ] Plan de réponse en cas de fuite

### CI/CD

- [ ] Secrets configurés dans GitHub/GitLab Secrets
- [ ] Aucun secret dans les logs de build
- [ ] Push protection activée
- [ ] Secret scanning activé

### Réponse aux Incidents

En cas de fuite de secret :

1. **Révoquer immédiatement** le secret compromis
2. **Générer** un nouveau secret
3. **Déployer** avec le nouveau secret
4. **Auditer** les accès/utilisations du secret
5. **Notifier** si des données ont été compromises
6. **Documenter** l'incident et améliorer les processus

---

**Ressources** :
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)

---

**Dernière mise à jour** : 2024
