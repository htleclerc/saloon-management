/**
 * Utilitaires de Chiffrement
 *
 * Ce module fournit des fonctions de chiffrement sécurisées pour protéger
 * les données sensibles (IBAN, données personnelles, etc.)
 *
 * Algorithme : AES-256-GCM (Galois/Counter Mode)
 * - Chiffrement authentifié (confidentialité + intégrité)
 * - Recommandé par NIST et OWASP
 *
 * @example
 * ```typescript
 * import { encrypt, decrypt, hashData } from '@/lib/crypto/encryption';
 *
 * // Chiffrer un IBAN
 * const encryptedIBAN = encrypt('FR7612345678901234567890189');
 *
 * // Déchiffrer
 * const iban = decrypt(encryptedIBAN);
 *
 * // Hasher pour comparaison (sans possibilité de déchiffrer)
 * const hash = hashData('FR7612345678901234567890189');
 * ```
 */

import crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;          // 128 bits
const AUTH_TAG_LENGTH = 16;    // 128 bits
const SALT_LENGTH = 32;        // 256 bits
const KEY_LENGTH = 32;         // 256 bits
const PBKDF2_ITERATIONS = 100000;

// ============================================================================
// GESTION DE LA CLÉ
// ============================================================================

/**
 * Récupérer la clé de chiffrement depuis les variables d'environnement
 *
 * La clé doit être une chaîne hexadécimale de 64 caractères (32 bytes)
 * Générer avec : openssl rand -hex 32
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32'
    );
  }

  if (key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be 64 hex characters (32 bytes). ' +
      'Generate with: openssl rand -hex 32'
    );
  }

  // Valider que c'est bien de l'hexadécimal
  if (!/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error('ENCRYPTION_KEY must be a valid hexadecimal string');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Dériver une clé unique à partir de la clé maître et d'un salt
 *
 * Utilise PBKDF2 pour renforcer la sécurité
 */
function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

// ============================================================================
// CHIFFREMENT / DÉCHIFFREMENT
// ============================================================================

/**
 * Chiffrer une chaîne de caractères
 *
 * @param plaintext - Texte à chiffrer
 * @returns Texte chiffré au format: version:salt:iv:authTag:ciphertext (base64)
 *
 * @example
 * ```typescript
 * const encrypted = encrypt('Données sensibles');
 * // Résultat: "v1:abc123...:def456...:ghi789...:jkl012..."
 * ```
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }

  const masterKey = getEncryptionKey();

  // Générer IV et salt aléatoires
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Dériver une clé unique pour ce chiffrement
  const derivedKey = deriveKey(masterKey, salt);

  // Créer le cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  // Chiffrer
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  // Récupérer le tag d'authentification
  const authTag = cipher.getAuthTag();

  // Assembler le résultat
  // Format: version:salt:iv:authTag:ciphertext
  return [
    'v1', // Version du format (pour migrations futures)
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext,
  ].join(':');
}

/**
 * Déchiffrer une chaîne de caractères
 *
 * @param encryptedData - Texte chiffré (format: version:salt:iv:authTag:ciphertext)
 * @returns Texte déchiffré
 *
 * @throws Error si le format est invalide ou la clé incorrecte
 *
 * @example
 * ```typescript
 * const plaintext = decrypt(encryptedData);
 * ```
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty string');
  }

  const parts = encryptedData.split(':');

  // Vérifier le format
  if (parts.length !== 5) {
    throw new Error('Invalid encrypted data format');
  }

  const [version, saltB64, ivB64, authTagB64, ciphertext] = parts;

  // Vérifier la version
  if (version !== 'v1') {
    throw new Error(`Unsupported encryption version: ${version}`);
  }

  // Décoder les composants
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  // Récupérer et dériver la clé
  const masterKey = getEncryptionKey();
  const derivedKey = deriveKey(masterKey, salt);

  // Créer le decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);

  // Déchiffrer
  try {
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  } catch (error) {
    // Ne pas exposer les détails de l'erreur (sécurité)
    throw new Error('Decryption failed: invalid data or key');
  }
}

// ============================================================================
// HACHAGE
// ============================================================================

/**
 * Hasher une donnée de manière irréversible
 *
 * Utilise HMAC-SHA256 avec la clé de chiffrement
 * Utile pour :
 * - Détecter les doublons sans déchiffrer
 * - Indexer des données chiffrées
 * - Vérifier l'intégrité
 *
 * @param data - Donnée à hasher
 * @returns Hash hexadécimal de 64 caractères
 *
 * @example
 * ```typescript
 * const ibanHash = hashData('FR7612345678901234567890189');
 * // Stocker le hash pour détecter les doublons
 * ```
 */
export function hashData(data: string): string {
  const key = getEncryptionKey();
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Vérifier si une donnée correspond à un hash
 *
 * @param data - Donnée à vérifier
 * @param hash - Hash attendu
 * @returns true si la donnée correspond au hash
 */
export function verifyHash(data: string, hash: string): boolean {
  const computedHash = hashData(data);
  // Comparaison en temps constant pour éviter les timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

// ============================================================================
// GÉNÉRATION DE CLÉS ET TOKENS
// ============================================================================

/**
 * Générer une clé de chiffrement
 *
 * À utiliser pour créer ENCRYPTION_KEY
 *
 * @returns Clé hexadécimale de 64 caractères
 *
 * @example
 * ```typescript
 * const key = generateEncryptionKey();
 * console.log(`ENCRYPTION_KEY=${key}`);
 * ```
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Générer un token aléatoire sécurisé
 *
 * @param length - Longueur en bytes (défaut: 32)
 * @returns Token en base64url
 *
 * @example
 * ```typescript
 * const token = generateSecureToken(32);
 * // Utiliser comme token de réinitialisation de mot de passe, etc.
 * ```
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Générer un ID unique sécurisé
 *
 * Alternative à UUID avec plus d'entropie
 *
 * @returns ID de 22 caractères (base64url)
 */
export function generateSecureId(): string {
  return crypto.randomBytes(16).toString('base64url');
}

// ============================================================================
// UTILITAIRES DE MASQUAGE
// ============================================================================

/**
 * Masquer une donnée sensible pour l'affichage
 *
 * @param data - Donnée à masquer
 * @param visibleStart - Nombre de caractères visibles au début
 * @param visibleEnd - Nombre de caractères visibles à la fin
 * @param maskChar - Caractère de masquage
 *
 * @example
 * ```typescript
 * maskData('4532015012345678', 0, 4);  // '**** **** **** 5678'
 * maskData('john@example.com', 2, 4);  // 'jo***@***.com'
 * maskData('FR7612345678901234567890189', 4, 4); // 'FR76 **** **** 0189'
 * ```
 */
export function maskData(
  data: string,
  visibleStart = 0,
  visibleEnd = 4,
  maskChar = '*'
): string {
  if (!data || data.length <= visibleStart + visibleEnd) {
    return data;
  }

  const start = data.slice(0, visibleStart);
  const end = data.slice(-visibleEnd);
  const maskLength = data.length - visibleStart - visibleEnd;
  const mask = maskChar.repeat(maskLength);

  return start + mask + end;
}

/**
 * Masquer un email pour l'affichage
 *
 * @example
 * ```typescript
 * maskEmail('john.doe@example.com'); // 'jo***@example.com'
 * ```
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return maskData(email, 2, 0);

  const maskedLocal = local.length > 2
    ? local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 5))
    : local;

  return `${maskedLocal}@${domain}`;
}

/**
 * Masquer un numéro de téléphone
 *
 * @example
 * ```typescript
 * maskPhone('+33612345678'); // '+33 ** ** ** 78'
 * ```
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length < 6) return phone;

  const countryCode = cleaned.startsWith('+') ? cleaned.slice(0, 3) : '';
  const last2 = cleaned.slice(-2);

  return `${countryCode} ** ** ** ${last2}`;
}

/**
 * Masquer un IBAN pour l'affichage
 *
 * @example
 * ```typescript
 * maskIBAN('FR7612345678901234567890189'); // 'FR76 **** **** 0189'
 * ```
 */
export function maskIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 8) return iban;

  const country = cleaned.slice(0, 4);
  const last4 = cleaned.slice(-4);

  return `${country} **** **** ${last4}`;
}

/**
 * Masquer un numéro de carte
 *
 * @example
 * ```typescript
 * maskCardNumber('4532015012345678'); // '**** **** **** 5678'
 * ```
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cardNumber;

  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Vérifier si une chaîne est chiffrée (format v1)
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;
  const parts = data.split(':');
  return parts.length === 5 && parts[0] === 'v1';
}

/**
 * Tester la validité de la clé de chiffrement
 *
 * @returns true si la clé est valide et fonctionnelle
 */
export function testEncryptionKey(): boolean {
  try {
    const testData = 'test-encryption-key';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    return decrypted === testData;
  } catch {
    return false;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface EncryptedField {
  encrypted: string;
  hash: string;
  maskedDisplay: string;
}

/**
 * Créer un objet avec données chiffrées, hash et affichage masqué
 *
 * @example
 * ```typescript
 * const ibanField = createEncryptedField(
 *   'FR7612345678901234567890189',
 *   (iban) => maskIBAN(iban)
 * );
 *
 * // Stocker en base :
 * // - ibanField.encrypted
 * // - ibanField.hash (pour index/doublons)
 *
 * // Afficher :
 * // - ibanField.maskedDisplay
 * ```
 */
export function createEncryptedField(
  data: string,
  maskFn: (data: string) => string
): EncryptedField {
  return {
    encrypted: encrypt(data),
    hash: hashData(data),
    maskedDisplay: maskFn(data),
  };
}

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

export default {
  encrypt,
  decrypt,
  hashData,
  verifyHash,
  generateEncryptionKey,
  generateSecureToken,
  generateSecureId,
  maskData,
  maskEmail,
  maskPhone,
  maskIBAN,
  maskCardNumber,
  isEncrypted,
  testEncryptionKey,
  createEncryptedField,
};
