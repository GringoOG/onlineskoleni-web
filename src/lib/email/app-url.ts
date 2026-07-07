/** Veřejná URL webu pro odkazy v e-mailech a certifikátech. */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://onlineskoleni-web.vercel.app"
  );
}

export function getLmsLoginUrl(): string {
  return `${getAppUrl()}/lms/login`;
}
