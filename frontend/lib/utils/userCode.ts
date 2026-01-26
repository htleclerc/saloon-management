/**
 * User Code Generator - Fixed 12 Characters
 * 
 * Format: RRNNNPPPCCCX (12 chars total)
 * - RR: Role (2 chars)
 * - NNN: Last name (3 chars)
 * - PPP: First name (3 chars)
 * - CCC: Sequence (3 digits)
 * - X: Check digit (1 digit)
 * 
 * Example: SADUPSOP0014
 * - SA = SuperAdmin
 * - DUP = Dupont
 * - SOP = Sophie
 * - 001 = Sequence
 * - 4 = Check digit
 */

export type UserRole = 'SuperAdmin' | 'Manager' | 'Worker' | 'Client' | 'System';

export interface UserCodeData {
    firstName: string;
    lastName: string;
    role: UserRole;
    email?: string;
}

/**
 * Role prefixes (2 chars) - ALWAYS 2 characters
 */
const ROLE_PREFIXES: Record<UserRole, string> = {
    'SuperAdmin': 'SA',
    'Manager': 'MG',
    'Worker': 'WK',
    'Client': 'CL',
    'System': 'SY'
};

/**
 * Calculate check digit using Luhn-like algorithm
 */
function calculateCheckDigit(code: string): number {
    let sum = 0;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];

        // Convert to number
        let value: number;
        if (char >= '0' && char <= '9') {
            value = parseInt(char);
        } else {
            // A=1, B=2, ..., Z=26
            value = char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        }

        // Alternate weight 1 and 2
        if (i % 2 === 1) {
            value *= 2;
            if (value > 9) {
                value -= 9;
            }
        }

        sum += value;
    }

    // Return check digit (0-9)
    return (10 - (sum % 10)) % 10;
}

/**
 * Clean and pad name part to exactly 3 characters
 */
function cleanNamePart(name: string, length: number = 3): string {
    // Remove non-alphabetic characters
    const cleaned = name.replace(/[^A-Za-z]/g, '');

    // Take first N characters and convert to uppercase
    const trimmed = cleaned.substring(0, length).toUpperCase();

    // Pad with 'X' if too short
    return trimmed.padEnd(length, 'X');
}

/**
 * Generate user code with fixed 12-char format
 * 
 * @param data User information
 * @param sequence Sequence number (1-999), default 1
 * @returns 12-character user code with check digit
 */
export function generateUserCode(data: UserCodeData, sequence: number = 1): string {
    const { firstName, lastName, role } = data;

    // Validate sequence
    if (sequence < 1 || sequence > 999) {
        throw new Error('Sequence must be between 1 and 999');
    }

    // Role prefix (2 chars)
    const rolePrefix = ROLE_PREFIXES[role] || 'US';

    // Last name (3 chars)
    const lastPart = cleanNamePart(lastName, 3);

    // First name (3 chars)
    const firstPart = cleanNamePart(firstName, 3);

    // Sequence (3 digits)
    const seqPart = sequence.toString().padStart(3, '0');

    // Build base code (11 chars)
    const baseCode = `${rolePrefix}${lastPart}${firstPart}${seqPart}`;

    // Calculate check digit
    const checkDigit = calculateCheckDigit(baseCode);

    // Final code (12 chars)
    return `${baseCode}${checkDigit}`;
}

/**
 * Validate user code format and check digit
 */
export function validateUserCode(code: string): boolean {
    // Must be exactly 12 characters
    if (code.length !== 12) {
        return false;
    }

    // Extract parts
    const baseCode = code.substring(0, 11);
    const checkDigit = parseInt(code.substring(11, 12));

    // Calculate expected check digit
    const expectedCheck = calculateCheckDigit(baseCode);

    // Validate
    return checkDigit === expectedCheck;
}

/**
 * Parse user code to extract information
 */
export function parseUserCode(code: string): {
    role: string;
    lastName: string;
    firstName: string;
    sequence: number;
    checkDigit: number;
    isValid: boolean;
} | null {
    if (code.length !== 12) {
        return null;
    }

    const rolePrefix = code.substring(0, 2);
    const lastName = code.substring(2, 5);
    const firstName = code.substring(5, 8);
    const sequence = parseInt(code.substring(8, 11));
    const checkDigit = parseInt(code.substring(11, 12));

    // Find role from prefix
    const role = Object.entries(ROLE_PREFIXES).find(([_, prefix]) => prefix === rolePrefix)?.[0] || 'Unknown';

    // Validate
    const isValid = validateUserCode(code);

    return {
        role,
        lastName,
        firstName,
        sequence,
        checkDigit,
        isValid
    };
}

/**
 * Generate multiple codes for testing uniqueness
 */
export function generateUniqueCode(
    data: UserCodeData,
    existingCodes: string[] = []
): string {
    for (let seq = 1; seq <= 999; seq++) {
        const code = generateUserCode(data, seq);

        if (!existingCodes.includes(code)) {
            return code;
        }
    }

    throw new Error(`Unable to generate unique code for ${data.firstName} ${data.lastName}`);
}

/**
 * Special system user code
 */
export const SYSTEM_USER_CODE = 'SYUSESYS0017'; // System User SYstem 001 + check digit 7

/**
 * Get current user code from context
 * In demo mode, returns SYSTEM
 */
export function getCurrentUserCode(): string {
    // TODO: Get from auth context when implemented
    return SYSTEM_USER_CODE;
}

/**
 * Format user code for display (with dashes)
 * Example: SADUPSOP0014 → SA-DUP-SOP-001-4
 */
export function formatUserCode(code: string): string {
    if (code.length !== 12) {
        return code;
    }

    return `${code.substring(0, 2)}-${code.substring(2, 5)}-${code.substring(5, 8)}-${code.substring(8, 11)}-${code.substring(11, 12)}`;
}

/**
 * Example usage:
 * 
 * // Generate code
 * const code = generateUserCode({
 *   firstName: 'Sophie',
 *   lastName: 'Dupont',
 *   role: 'SuperAdmin'
 * }, 1);
 * // Returns: SADUPSOP0014
 * 
 * // Validate code
 * const isValid = validateUserCode('SADUPSOP0014');
 * // Returns: true
 * 
 * // Parse code
 * const info = parseUserCode('SADUPSOP0014');
 * // Returns: {
 * //   role: 'SuperAdmin',
 * //   lastName: 'DUP',
 * //   firstName: 'SOP',
 * //   sequence: 1,
 * //   checkDigit: 4,
 * //   isValid: true
 * // }
 * 
 * // Format for display
 * const formatted = formatUserCode('SADUPSOP0014');
 * // Returns: SA-DUP-SOP-001-4
 */
