import { getGoPayClient, isGoPayConfigured } from "@/lib/gopay";
import { getOrderByNumber, markOrderFailed, markOrderPaid } from "@/lib/orders";
import { notifyOrderPaid } from "@/lib/order-notify";

/** Ověří stav platby u GoPay a aktualizuje objednávku (důležité po return_url, webhook na localhost často nepřijde). */
export async function syncOrderPaymentFromGoPay(orderNumber: string) {
  if (!isGoPayConfigured()) {
    return { synced: false, reason: "gopay_not_configured" as const };
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order?.payment?.gopayPaymentId) {
    return { synced: false, reason: "no_payment" as const };
  }

  if (order.status === "PAID") {
    return { synced: true, status: "PAID" as const, alreadyPaid: true };
  }

  const client = getGoPayClient();
  const payment = await client.getPayment(order.payment.gopayPaymentId);
  const state = payment.state ?? "UNKNOWN";

  if (state === "PAID" || state === "AUTHORIZED") {
    await markOrderPaid(order.id, order.payment.gopayPaymentId, state);
    await notifyOrderPaid({
      orderNumber: order.orderNumber,
      companyName: order.companyName,
      contactName: order.contactName,
      email: order.email,
      phone: order.phone,
      totalAmountHalere: order.totalAmountHalere,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
    });
    return { synced: true, status: "PAID" as const };
  }

  if (state === "CANCELED" || state === "TIMEOUTED") {
    await markOrderFailed(order.id, order.payment.gopayPaymentId, state);
    return { synced: true, status: "FAILED" as const };
  }

  return { synced: true, status: order.status, paymentState: state };
}
