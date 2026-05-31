import { site } from "@/lib/content";
import { sendEmail } from "@/lib/email/resend";

interface PaidOrderNotify {
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalAmountHalere: number;
  items: { name: string; quantity: number }[];
}

/** Upozornění provozovateli na zaplacenou objednávku (log + e-mail přes Resend). */
export async function notifyOrderPaid(order: PaidOrderNotify): Promise<void> {
  const lines = [
    `Nová zaplacená objednávka: ${order.orderNumber}`,
    `Firma: ${order.companyName}`,
    `Kontakt: ${order.contactName}`,
    `E-mail: ${order.email}`,
    order.phone ? `Telefon: ${order.phone}` : null,
    `Částka: ${(order.totalAmountHalere / 100).toFixed(0)} Kč`,
    "Položky:",
    ...order.items.map((i) => `  - ${i.name} × ${i.quantity}`),
    "",
    "Student byl automaticky zapsán do LMS a obdržel uvítací e-mail s přihlašovacími údaji.",
  ]
    .filter(Boolean)
    .join("\n");

  console.info("[Order paid]\n" + lines);

  const notifyTo = process.env.ORDER_NOTIFY_EMAIL?.trim() ?? site.email;

  await sendEmail({
    to: notifyTo,
    subject: `Zaplacená objednávka ${order.orderNumber} – ${order.companyName}`,
    text: lines,
    replyTo: order.email,
  });
}
