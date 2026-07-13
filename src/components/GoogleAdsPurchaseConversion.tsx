"use client";

import { useEffect, useRef } from "react";
import type { OrderChannel } from "@/lib/orders/order-channel";
import {
  schedulePurchaseConversionTracking,
  tracksPurchaseOnThankYouPage,
} from "@/lib/track-purchase-conversion";

interface OrderForConversion {
  orderNumber: string;
  status: string;
  totalAmountHalere: number;
  paymentMethod: OrderChannel;
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
    let stopTracking: (() => void) | undefined;

    async function tryTrackConversion() {
      if (cancelled || firedRef.current) return;

      const order = await fetchOrder(orderNumber);
      if (!order || order.status !== "PAID") return;
      if (!tracksPurchaseOnThankYouPage(order.paymentMethod)) return;

      stopTracking?.();
      stopTracking = schedulePurchaseConversionTracking(order);
      firedRef.current = true;
      if (pollInterval) clearInterval(pollInterval);
    }

    void tryTrackConversion();

    pollInterval = setInterval(() => {
      void tryTrackConversion();
    }, 4000);

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      stopTracking?.();
    };
  }, [orderNumber]);

  return null;
}
