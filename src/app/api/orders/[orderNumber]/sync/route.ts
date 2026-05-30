import { NextResponse } from "next/server";
import { syncOrderPaymentFromGoPay } from "@/lib/sync-gopay-order";
import { getOrderByNumber } from "@/lib/orders";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { orderNumber } = await params;

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
