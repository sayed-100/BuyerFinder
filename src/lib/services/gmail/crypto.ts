import crypto from "crypto";

// Fallback salt for key derivation
const DEFAULT_SALT = "buyerfinder_gmail_oauth_session_salt_2026";

/**
 * Derives a consistent 32-byte key from available environment secrets
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.GMAIL_SESSION_SECRET ||
    process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
    "buyerfinder-default-local-dev-secret-key-32b";

  return crypto.scryptSync(secret, DEFAULT_SALT, 32);
}

/**
 * Encrypts an object into a tamper-proof AES-256-GCM string
 */
export function encryptSessionData(data: Record<string, unknown>): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const jsonStr = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(jsonStr, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (in base64url)
  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

/**
 * Decrypts and verifies an AES-256-GCM sealed string
 */
export function decryptSessionData<T = Record<string, unknown>>(tokenStr: string): T | null {
  try {
    const parts = tokenStr.split(":");
    if (parts.length !== 3) return null;

    const [ivRaw, authTagRaw, encryptedRaw] = parts;
    const iv = Buffer.from(ivRaw, "base64url");
    const authTag = Buffer.from(authTagRaw, "base64url");
    const encrypted = Buffer.from(encryptedRaw, "base64url");

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  } catch (err) {
    // If decryption fails or token is tampered, safely return null
    return null;
  }
}
