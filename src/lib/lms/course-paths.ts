import { getAppUrl } from "@/lib/email/app-url";
import type { CatalogAudience } from "@/lib/order-catalog";

/** Veřejná cesta do LMS pro daný kurz (oficiální závěrečný test). */
export function getLmsEntryPath(
  courseSlug: string,
  audience?: CatalogAudience | null
): string {
  if (courseSlug === "bozp") {
    return "/lms/bozp/zaverecny";
  }
  if (courseSlug === "pozarni") {
    if (audience === "zamestnanec") {
      return "/lms/pozarni/zaverecny/zamestnanec";
    }
    if (audience === "vedouci") {
      return "/lms/pozarni/zaverecny/vedouci";
    }
    return "/lms/pozarni/zaverecny";
  }
  if (courseSlug === "ridici") {
    return "/lms/ridici/zaverecny";
  }
  if (courseSlug === "bremena") {
    return "/lms/bremena/zaverecny";
  }
  if (courseSlug === "gdpr") {
    return "/lms/gdpr/zaverecny";
  }
  if (courseSlug === "ergonomie") {
    return "/lms/ergonomie/zaverecny";
  }
  return `/skoleni/${courseSlug}`;
}

export function getDemoTestPath(courseSlug: string): string | null {
  if (courseSlug === "bozp") {
    return "/lms/bozp/test";
  }
  if (courseSlug === "pozarni") {
    return "/lms/pozarni/test";
  }
  if (courseSlug === "ridici") {
    return "/lms/ridici/test";
  }
  if (courseSlug === "bremena") {
    return "/lms/bremena/test";
  }
  if (courseSlug === "gdpr") {
    return "/lms/gdpr/test";
  }
  if (courseSlug === "ergonomie") {
    return "/lms/ergonomie/test";
  }
  return null;
}

/** @deprecated Use getDemoTestPath("bozp") */
export function getBozpDemoTestPath(): string {
  return getDemoTestPath("bozp")!;
}

export function getOfficialTestHubPath(courseSlug: string): string | null {
  if (courseSlug === "bozp") {
    return "/lms/bozp/zaverecny";
  }
  if (courseSlug === "pozarni") {
    return "/lms/pozarni/zaverecny";
  }
  if (courseSlug === "ridici") {
    return "/lms/ridici/zaverecny";
  }
  if (courseSlug === "bremena") {
    return "/lms/bremena/zaverecny";
  }
  if (courseSlug === "gdpr") {
    return "/lms/gdpr/zaverecny";
  }
  if (courseSlug === "ergonomie") {
    return "/lms/ergonomie/zaverecny";
  }
  return null;
}

export function getLmsEntryUrl(
  courseSlug: string,
  audience?: CatalogAudience | null
): string {
  return `${getAppUrl()}${getLmsEntryPath(courseSlug, audience)}`;
}
