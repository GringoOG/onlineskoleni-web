import Script from "next/script";
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/google-ads";

/** Globální Google tag (gtag.js) – GA4 + Google Ads. */
export function GoogleTag() {
  const primaryId = GA4_MEASUREMENT_ID || GOOGLE_ADS_ID;
  if (!primaryId) {
    return null;
  }

  const configLines = [
    GA4_MEASUREMENT_ID ? `gtag('config', '${GA4_MEASUREMENT_ID}');` : null,
    GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : null,
  ]
    .filter(Boolean)
    .join("\n          ");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines}
        `}
      </Script>
    </>
  );
}
