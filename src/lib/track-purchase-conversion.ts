import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_STORAGE_PREFIX,
  GOOGLE_ADS_PURCHASE_CONVERSION,
} from "@/lib/google-ads";
import { sendGoogleAdsConversionPixel } from "@/lib/google-ads-conversion-pixel";
import type { OrderChannel } from "@/lib/orders/order-channel";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface PurchaseOrderForConversion {
  orderNumber: string;
  totalAmountHalere: number;
}

/** Děkovná stránka – jen GoPay (student se vrací z platební brány). */
export function tracksPurchaseOnThankYouPage(channel: OrderChannel): boolean {
  return channel === "gopay";
}

/**
 * Admin při označení Zaplaceno – ruční objednávky a QR převody
 * (u QR student často zavře děkovnou stránku dřív, než admin potvrdí platbu).
 */
export function tracksPurchaseOnAdminPaid(channel: OrderChannel): boolean {
  return channel === "manual" || channel === "qr";
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

function sendGa4PurchaseBeacon(order: PurchaseOrderForConversion, value: number) {
  if (!GA4_MEASUREMENT_ID || typeof navigator === "undefined") {
    return;
  }
  const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  const cid = match?.[1] ?? `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
  const query = new URLSearchParams({
    v: "2",
    tid: GA4_MEASUREMENT_ID,
    cid,
    en: "purchase",
    cu: "CZK",
    _z: String(Date.now()),
  });
  query.set("epn.value", String(value));
  query.set("ep.transaction_id", order.orderNumber);

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

/** GA4 purchase + Google Ads konverze po zaplacení objednávky. */
export function trackPurchaseConversion(order: PurchaseOrderForConversion): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storageKey = `${GOOGLE_ADS_CONVERSION_STORAGE_PREFIX}${order.orderNumber}`;
  if (sessionStorage.getItem(storageKey)) {
    return true;
  }

  const gtag = ensureGtag();
  const value = order.totalAmountHalere / 100;

  if (gtag) {
    if (GA4_MEASUREMENT_ID) {
      gtag("event", "purchase", {
        send_to: GA4_MEASUREMENT_ID,
        transaction_id: order.orderNumber,
        value,
        currency: "CZK",
      });
    } else {
      gtag("event", "purchase", {
        transaction_id: order.orderNumber,
        value,
        currency: "CZK",
      });
    }

    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_PURCHASE_CONVERSION,
      value,
      currency: "CZK",
      transaction_id: order.orderNumber,
    });
  }

  sendGa4PurchaseBeacon(order, value);
  sendGoogleAdsConversionPixel({
    sendTo: GOOGLE_ADS_PURCHASE_CONVERSION,
    value,
    currency: "CZK",
    transactionId: order.orderNumber,
  });

  sessionStorage.setItem(storageKey, "1");
  return true;
}

/** Opakovaně zkusí odeslat konverzi, dokud není k dispozici gtag. Vrací cleanup. */
export function schedulePurchaseConversionTracking(
  order: PurchaseOrderForConversion
): () => void {
  let gtagRetryInterval: ReturnType<typeof setInterval> | undefined;
  let gtagRetryTimeout: ReturnType<typeof setTimeout> | undefined;
  let tracked = false;

  const attemptTrack = () => {
    if (tracked) return;
    if (trackPurchaseConversion(order)) {
      tracked = true;
      if (gtagRetryInterval) clearInterval(gtagRetryInterval);
      if (gtagRetryTimeout) clearTimeout(gtagRetryTimeout);
    }
  };

  attemptTrack();

  if (!tracked) {
    gtagRetryInterval = setInterval(attemptTrack, 200);
    gtagRetryTimeout = setTimeout(() => {
      if (gtagRetryInterval) clearInterval(gtagRetryInterval);
    }, 10000);
  }

  return () => {
    if (gtagRetryInterval) clearInterval(gtagRetryInterval);
    if (gtagRetryTimeout) clearTimeout(gtagRetryTimeout);
  };
}
