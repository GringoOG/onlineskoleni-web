import { NextResponse } from "next/server";
import { getGoPayClient, isGoPayConfigured } from "@/lib/gopay";
import {
  getOrderByGoPayId,
  markOrderFailed,
  markOrderPaid,
} from "@/lib/orders";
import {
  processPaidOrder,
  toPaidOrderForEnrollment,
} from "@/lib/lms/process-paid-order";

/** GoPay posílá notifikaci jako HTTP GET s parametrem `id` (payment id). */
export async function GET(request: Request) {
  if (!isGoPayConfigured()) {
    return NextResponse.json({ error: "GoPay not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("id");

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
  }

  try {
    const client = getGoPayClient();
    const payment = await client.getPayment(paymentId);
    const state = payment.state ?? "UNKNOWN";

    const existing = await getOrderByGoPayId(paymentId);
    if (!existing?.order) {
      console.warn("[GoPay webhook] Unknown payment id:", paymentId);
      return NextResponse.json({ received: true });
    }

    const order = existing.order;

    if (order.status === "PAID") {
      try {
        await processPaidOrder(toPaidOrderForEnrollment(order));
      } catch (enrollError) {
        console.error("[GoPay webhook] LMS enrollment (retry):", enrollError);
      }
      return NextResponse.json({ received: true, status: "already_paid" });
    }

    if (state === "PAID" || state === "AUTHORIZED") {
      await markOrderPaid(order.id, paymentId, state);

      const paidOrder = await getOrderByGoPayId(paymentId);
      if (paidOrder?.order) {
        try {
          await processPaidOrder(toPaidOrderForEnrollment(paidOrder.order));
        } catch (enrollError) {
          console.error("[GoPay webhook] LMS enrollment failed:", enrollError);
        }
      }
    } else if (state === "CANCELED" || state === "TIMEOUTED") {
      await markOrderFailed(order.id, paymentId, state);
    } else {
      const { prisma } = await import("@/lib/prisma");
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { state },
      });
    }

    return NextResponse.json({ received: true, state });
  } catch (err) {
    console.error("[GoPay webhook]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
