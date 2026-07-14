import {
  GOOGLE_ADS_CONVERSION_STORAGE_PREFIX,
  GOOGLE_ADS_PURCHASE_CONVERSION,
} from "@/lib/google-ads";
import type { OrderChannel } from "@/lib/orders/order-channel";

declare global {
  interface Window {
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

/** GA4 purchase + Google Ads konverze po zaplacení objednávky. */
export function trackPurchaseConversion(order: PurchaseOrderForConversion): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storageKey = `${GOOGLE_ADS_CONVERSION_STORAGE_PREFIX}${order.orderNumber}`;
  if (sessionStorage.getItem(storageKey)) {
    return true;
  }

  if (typeof window.gtag !== "function") {
    return false;
  }

  const value = order.totalAmountHalere / 100;

  window.gtag("event", "purchase", {
    transaction_id: order.orderNumber,
    value,
    currency: "CZK",
  });

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_PURCHASE_CONVERSION,
    value,
    currency: "CZK",
    transaction_id: order.orderNumber,
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
