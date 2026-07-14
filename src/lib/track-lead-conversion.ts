import {
  GA4_MEASUREMENT_ID,
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

  // Stejná fronta jako oficiální snippet gtag.js (Arguments, ne Array).
  const gtag = function gtag(this: void) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
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

  // Explicitní send_to na GA4 – při duálním AW+GA4 configu jinak event
  // občas nedorazí do Realtime (page_view z config ano, custom event ne).
  if (GA4_MEASUREMENT_ID) {
    gtag("event", "generate_lead", {
      send_to: GA4_MEASUREMENT_ID,
      currency: "CZK",
      form_name: "contact",
    });
  } else {
    gtag("event", "generate_lead", {
      currency: "CZK",
      form_name: "contact",
    });
  }

  if (GOOGLE_ADS_LEAD_CONVERSION) {
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_LEAD_CONVERSION,
    });
  }

  sessionStorage.setItem(storageKey, "1");
  return true;
}
