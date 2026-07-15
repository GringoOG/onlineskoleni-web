import type { CatalogAudience } from "@/lib/order-catalog";

/** Výchozí platnost certifikátu (kurzy bez zvláštního nastavení). */
export const CERTIFICATE_VALIDITY_YEARS = 1;

/**
 * Platnost certifikátu v letech.
 *
 * PO (vyhláška č. 246/2001 Sb. § 23):
 *   – řadový zaměstnanec nejméně 1× za 2 roky
 *   – vedoucí zaměstnanec nejméně 1× za 3 roky
 *
 * BOZP (zákoník práce § 103): zákon přesnou lhůtu neurčuje; běžná praxe
 * a doporučení SUIP/odborných zdrojů je stejně 2 / 3 roky podle role.
 */
export function getCertificateValidityYears(
  courseSlug: string,
  audience?: CatalogAudience | null
): number {
  if (courseSlug === "pozarni" || courseSlug === "bozp") {
    if (audience === "vedouci") return 3;
    // Zaměstnanec i legacy zápis bez audience → 2 roky.
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
