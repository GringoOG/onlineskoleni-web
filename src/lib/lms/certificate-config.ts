import type { CatalogAudience } from "@/lib/order-catalog";

/** Výchozí platnost certifikátu (kurzy bez zvláštního nastavení). */
export const CERTIFICATE_VALIDITY_YEARS = 1;

/**
 * Platnost certifikátu v letech.
 * PO: řadový zaměstnanec 2 roky, vedoucí 3 roky (ze zákona jen u požární ochrany).
 */
export function getCertificateValidityYears(
  courseSlug: string,
  audience?: CatalogAudience | null
): number {
  if (courseSlug === "pozarni") {
    if (audience === "vedouci") return 3;
    if (audience === "zamestnanec") return 2;
    // Legacy zápis bez audience – konzervativně 2 roky (zaměstnanec).
    return 2;
  }
  return CERTIFICATE_VALIDITY_YEARS;
}

export function formatCertificateValidityLabel(years: number): string {
  if (years === 1) return "Platnost certifikátu 1 rok.";
  if (years >= 2 && years <= 4) return `Platnost certifikátu ${years} roky.`;
  return `Platnost certifikátu ${years} let.`;
}

export function getCertificateDownloadPath(certificateId: string): string {
  return `/api/lms/certificates/${certificateId}/download`;
}

export function getCertificatePublicUrl(certificateCode: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://www.onlineskoleni.eu";
  return `${base}/certifikat/${certificateCode}`;
}
