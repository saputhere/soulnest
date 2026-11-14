import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** Returns "scrypt$<salt>$<hash>". Each password gets its own random salt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/** Compares in constant time, so the check doesn't leak how much of the password matched. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltBase64, hashBase64] = stored.split("$");
  if (scheme !== "scrypt" || !saltBase64 || !hashBase64) return false;

  const expected = Buffer.from(hashBase64, "base64");
  const actual = await scrypt(password, Buffer.from(saltBase64, "base64"), expected.length);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}