import { NextResponse } from "next/server";
import { isGoPayConfigured } from "@/lib/gopay";

/**
 * Veřejná kontrola, zda je GoPay na tomto prostředí nastavený.
 * Nevrací žádná tajemství – jen ano/ne a typ brány (sandbox/produkce).
 */
export async function GET() {
  const gatewayUrl = process.env.GOPAY_GATEWAY_URL ?? "";
  const sandbox = gatewayUrl.includes("sandbox");
  const production = gatewayUrl.includes("gateway.gopay.com");

  return NextResponse.json({
    configured: isGoPayConfigured(),
    environment: sandbox ? "sandbox" : production ? "production" : gatewayUrl ? "other" : "unset",
    notificationUrlHint: "/api/gopay/webhook",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });
}
