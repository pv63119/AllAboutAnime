import crypto from 'crypto';

/**
 * Generate a secure random reset token
 * @returns {string} 32-byte hex string
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a reset token for database storage
 * @param token - Plain text token
 * @returns {string} SHA256 hash of the token
 */
export function hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Check if a reset token has expired
 * @param expiresAt - Expiration timestamp
 * @returns {boolean} True if expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}

/**
 * Get expiration time for reset token (15 minutes from now)
 * @returns {Date} Expiration timestamp
 */
export function getTokenExpiration(): Date {
    return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}
