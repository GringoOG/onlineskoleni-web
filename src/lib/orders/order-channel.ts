export type OrderChannel = "gopay" | "qr" | "manual";

const MANUAL_METHODS = new Set(["INVOICE", "CASH"]);

export function getOrderChannel(order: {
  paymentMethod: string | null;
  payment: { gopayPaymentId: string | null; state: string } | null;
}): OrderChannel {
  if (
    (order.paymentMethod && MANUAL_METHODS.has(order.paymentMethod)) ||
    order.payment?.state === "MANUAL"
  ) {
    return "manual";
  }

  if (order.paymentMethod === "GOPAY" || order.payment?.gopayPaymentId) {
    return "gopay";
  }

  return "qr";
}

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  gopay: "GoPay",
  qr: "QR platba",
  manual: "Ručně zadané",
};
