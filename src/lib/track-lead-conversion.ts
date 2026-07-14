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

  const gtag = function gtag(this: void) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
  window.gtag = gtag;
  return gtag;
}

function readGaClientId(): string {
  const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  if (match?.[1]) {
    return match[1];
  }
  return `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
}

/** Záložní odeslání přímo na GA4 collect (obejde problémy gtag / AdBlock partial). */
function sendGa4CollectBeacon(eventName: string, params: Record<string, string>) {
  if (!GA4_MEASUREMENT_ID || typeof navigator === "undefined") {
    return;
  }

  const query = new URLSearchParams({
    v: "2",
    tid: GA4_MEASUREMENT_ID,
    cid: readGaClientId(),
    en: eventName,
    _z: String(Date.now()),
  });

  for (const [key, value] of Object.entries(params)) {
    query.set(`ep.${key}`, value);
  }

  const url = `https://www.google-analytics.com/g/collect?${query.toString()}`;
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      void fetch(url, { mode: "no-cors", keepalive: true });
    }
  } catch {
    // ignore
  }
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
  if (gtag && GA4_MEASUREMENT_ID) {
    gtag("event", "generate_lead", {
      send_to: GA4_MEASUREMENT_ID,
      currency: "CZK",
      form_name: "contact",
      lead_id: trackId,
    });
  }

  // Vždy i přímý beacon – Realtime ho typicky zachytí i když gtag event „zmizí“.
  sendGa4CollectBeacon("generate_lead", {
    form_name: "contact",
    currency: "CZK",
    lead_id: trackId,
  });

  if (gtag && GOOGLE_ADS_LEAD_CONVERSION) {
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_LEAD_CONVERSION,
    });
  }

  sessionStorage.setItem(storageKey, "1");
  return true;
}
