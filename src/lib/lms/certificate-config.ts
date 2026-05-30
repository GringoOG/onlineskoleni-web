/** Platnost certifikátu BOZP v letech (zákonná perioda školení). */
export const CERTIFICATE_VALIDITY_YEARS = 1;

export const CERTIFICATE_CODE_PREFIX = "BOZP";

export function getCertificateDownloadPath(certificateId: string): string {
  return `/api/lms/certificates/${certificateId}/download`;
}
