import {
  GOOGLE_ADS_LEAD_CONVERSION,
  GOOGLE_ADS_LEAD_STORAGE_PREFIX,
} from "@/lib/google-ads";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === "undefined") {
    return null;
  }

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag === "function") {
    return window.gtag;
  }

  // Stejná fronta jako gtag.js – eventy se odešlou, až se skript dočte.
  const gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;
  return gtag;
}

/** GA4 generate_lead + Google Ads konverze po odeslání kontaktního formuláře. */
export function trackLeadConversion(trackId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storageKey = `${GOOGLE_ADS_LEAD_STORAGE_PREFIX}${trackId}`;
  if (sessionStorage.getItem(storageKey)) {
    return true;
  }

  const gtag = ensureGtag();
  if (!gtag) {
    return false;
  }

  gtag("event", "generate_lead", {
    currency: "CZK",
    form_name: "contact",
  });

  if (GOOGLE_ADS_LEAD_CONVERSION) {
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_LEAD_CONVERSION,
    });
  }

  sessionStorage.setItem(storageKey, "1");
  return true;
}
