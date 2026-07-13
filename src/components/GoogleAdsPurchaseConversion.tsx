"use client";

import { useEffect, useRef } from "react";
import { trackPurchaseConversion } from "@/lib/track-purchase-conversion";

interface OrderForConversion {
  orderNumber: string;
  status: string;
  totalAmountHalere: number;
}

interface GoogleAdsPurchaseConversionProps {
  orderNumber: string;
}

async function fetchOrder(orderNumber: string): Promise<OrderForConversion | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) return null;
  return res.json();
}

/** Měří GA4 purchase + Google Ads konverzi „Nákup“ po zaplacení objednávky. */
export function GoogleAdsPurchaseConversion({
  orderNumber,
}: GoogleAdsPurchaseConversionProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let gtagRetryInterval: ReturnType<typeof setInterval> | undefined;
    let gtagRetryTimeout: ReturnType<typeof setTimeout> | undefined;

    async function tryTrackConversion() {
      if (cancelled || firedRef.current) return;

      const order = await fetchOrder(orderNumber);
      if (!order || order.status !== "PAID") return;

      const attemptFire = () => {
        if (trackPurchaseConversion(order)) {
          firedRef.current = true;
          if (pollInterval) clearInterval(pollInterval);
          if (gtagRetryInterval) clearInterval(gtagRetryInterval);
          if (gtagRetryTimeout) clearTimeout(gtagRetryTimeout);
        }
      };

      attemptFire();

      if (!firedRef.current) {
        gtagRetryInterval = setInterval(attemptFire, 200);
        gtagRetryTimeout = setTimeout(() => {
          if (gtagRetryInterval) clearInterval(gtagRetryInterval);
        }, 10000);
      }
    }

    void tryTrackConversion();

    pollInterval = setInterval(() => {
      void tryTrackConversion();
    }, 4000);

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      if (gtagRetryInterval) clearInterval(gtagRetryInterval);
      if (gtagRetryTimeout) clearTimeout(gtagRetryTimeout);
    };
  }, [orderNumber]);

  return null;
}
