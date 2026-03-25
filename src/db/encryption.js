import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;

function getEncryptionKey() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== KEY_BYTES) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
    return key;
  }
  // Development fallback — never use in production
  return Buffer.alloc(KEY_BYTES, 'dev-key-not-for-production-use!!');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a colon-delimited hex string: iv:authTag:ciphertext
 * Returns null if plaintext is null/undefined.
 */
export function encrypt(plaintext) {
  if (plaintext == null) return null;
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a ciphertext string produced by encrypt().
 * Returns null if ciphertext is null/undefined.
 */
export function decrypt(ciphertext) {
  if (ciphertext == null) return null;
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Invalid ciphertext format');
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data, undefined, 'utf8') + decipher.final('utf8');
}

/**
 * Hash an API key using SHA-256 for storage.
 * API keys are high-entropy random strings so SHA-256 is appropriate.
 */
export function hashApiKey(rawKey) {
  return createHash('sha256').update(rawKey).digest('hex');
}
