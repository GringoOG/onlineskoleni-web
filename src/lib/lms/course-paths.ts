/** Veřejná cesta do LMS pro daný kurz (test / detail). */
export function getLmsEntryPath(courseSlug: string): string {
  if (courseSlug === "bozp") {
    return "/lms/bozp/test";
  }
  return `/skoleni/${courseSlug}`;
}

export function getLmsEntryUrl(courseSlug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${base}${getLmsEntryPath(courseSlug)}`;
}
