import { randomBytes } from "node:crypto";

/** Unikátní kód certifikátu, např. BOZP-2026-A1B2C3D4. */
export function createCertificateCode(prefix: string = "BOZP"): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${year}-${suffix}`;
}
