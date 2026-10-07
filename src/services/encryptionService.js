import crypto from 'crypto';
import config from '../config.js';

// Derive 32-byte key from config.encryptionKey
const KEY = crypto.createHash('sha256').update(String(config.encryptionKey)).digest();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const PREFIX = 'enc:v1:';

/**
 * Encrypts a sensitive plaintext string using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptMedicalData(plainText) {
  if (plainText === null || plainText === undefined || plainText === '') {
    return plainText;
  }

  // Avoid double-encrypting
  if (typeof plainText === 'string' && plainText.startsWith(PREFIX)) {
    return plainText;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(String(plainText), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[EncryptionService] Encryption failed:', err);
    return plainText; // Fail-safe fallback
  }
}

/**
 * Decrypts an AES-256-GCM encrypted medical string.
 * If the string was not encrypted, returns it as-is.
 */
export function decryptMedicalData(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.startsWith(PREFIX)) {
    return encryptedText;
  }

  try {
    const parts = encryptedText.slice(PREFIX.length).split(':');
    if (parts.length !== 3) {
      return encryptedText;
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('[EncryptionService] Decryption failed:', err);
    return encryptedText; // Return original if corrupted or key mismatch
  }
}
