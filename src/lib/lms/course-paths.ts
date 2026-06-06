/** Veřejná cesta do LMS pro daný kurz (oficiální závěrečný test). */
export function getLmsEntryPath(courseSlug: string): string {
  if (courseSlug === "bozp") {
    return "/lms/bozp/zaverecny";
  }
  if (courseSlug === "pozarni") {
    return "/lms/pozarni/zaverecny";
  }
  if (courseSlug === "ridici") {
    return "/lms/ridici/zaverecny";
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
  return null;
}

export function getLmsEntryUrl(courseSlug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${base}${getLmsEntryPath(courseSlug)}`;
}
