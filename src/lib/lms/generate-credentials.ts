import { randomBytes } from "node:crypto";

/** Vygeneruje dočasné heslo pro nového studenta (12 znaků, bez nejednoznačných znaků). */
export function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
