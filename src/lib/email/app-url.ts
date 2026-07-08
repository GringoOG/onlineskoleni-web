/** Veřejná URL webu pro odkazy v e-mailech a certifikátech. */
export function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://onlineskoleni-web.vercel.app";

  // V e-mailech vždy používejte kanonickou doménu s www – Seznam.cz má problémy s přesměrováním bez www.
  if (raw === "https://onlineskoleni.eu" || raw === "http://onlineskoleni.eu") {
    return "https://www.onlineskoleni.eu";
  }

  return raw;
}

export function getLmsLoginUrl(): string {
  return `${getAppUrl()}/lms/login`;
}
