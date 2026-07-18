import { NextResponse } from "next/server";
import { syncOrderPaymentFromGoPay } from "@/lib/sync-gopay-order";
import { getOrderByNumber } from "@/lib/orders";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { orderNumber } = await params;
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`order-sync:${ip}`, { limit: 30, windowMs: 5 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Příliš mnoho požadavků." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    await syncOrderPaymentFromGoPay(orderNumber);
    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentState: order.payment?.state ?? null,
    });
  } catch (err) {
    console.error("[Order sync]", err);
    return NextResponse.json({ error: "Synchronizace selhala" }, { status: 500 });
  }
}
