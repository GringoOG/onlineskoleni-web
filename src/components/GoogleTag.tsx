import Script from "next/script";
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/google-ads";

/** Globální Google tag (gtag.js) – Google Ads + GA4. */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID && !GA4_MEASUREMENT_ID) {
    return null;
  }

  // Preferuj Ads ID – konverzní tagy v Ads jsou spolehlivější při načtení AW scriptu.
  // GA4 se konfiguruje druhým gtag('config', ...).
  const scriptId = GOOGLE_ADS_ID || GA4_MEASUREMENT_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${scriptId}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA4_MEASUREMENT_ID ? `gtag('config', '${GA4_MEASUREMENT_ID}');` : ""}
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
        `}
      </Script>
    </>
  );
}
