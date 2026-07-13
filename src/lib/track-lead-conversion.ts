import {
  GOOGLE_ADS_LEAD_CONVERSION,
  GOOGLE_ADS_LEAD_STORAGE_PREFIX,
} from "@/lib/google-ads";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 generate_lead + volitelná Google Ads konverze po odeslání kontaktního formuláře. */
export function trackLeadConversion(trackId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storageKey = `${GOOGLE_ADS_LEAD_STORAGE_PREFIX}${trackId}`;
  if (sessionStorage.getItem(storageKey)) {
    return true;
  }

  if (typeof window.gtag !== "function") {
    return false;
  }

  window.gtag("event", "generate_lead", {
    currency: "CZK",
    form_name: "contact",
  });

  if (GOOGLE_ADS_LEAD_CONVERSION) {
    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_LEAD_CONVERSION,
    });
  }

  sessionStorage.setItem(storageKey, "1");
  return true;
}
