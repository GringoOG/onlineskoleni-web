import {
  GOOGLE_ADS_CONVERSION_STORAGE_PREFIX,
  GOOGLE_ADS_PURCHASE_CONVERSION,
} from "@/lib/google-ads";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface PurchaseOrderForConversion {
  orderNumber: string;
  totalAmountHalere: number;
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
