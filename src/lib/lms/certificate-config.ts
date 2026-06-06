/** Platnost certifikátu v letech. */
export const CERTIFICATE_VALIDITY_YEARS = 1;

export function getCertificateDownloadPath(certificateId: string): string {
  return `/api/lms/certificates/${certificateId}/download`;
}

export function getCertificatePublicUrl(certificateCode: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://www.onlineskoleni.eu";
  return `${base}/certifikat/${certificateCode}`;
}
