import { site } from "@/lib/content";
import { sendEmail } from "@/lib/email/resend";

interface OrderNotifyBase {
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalAmountHalere: number;
  items: { name: string; quantity: number }[];
}

interface PaidOrderNotify extends OrderNotifyBase {}

interface QrOrderCreatedNotify extends OrderNotifyBase {
  ico?: string | null;
  participants?: { name: string; email: string; courseNames: string[] }[];
}

function notifyRecipient(): string {
  return process.env.ORDER_NOTIFY_EMAIL?.trim() ?? site.email;
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

  await sendEmail({
    to: notifyRecipient(),
    subject: `Zaplacená objednávka ${order.orderNumber} – ${order.companyName}`,
    text: lines,
    replyTo: order.email,
  });
}

/**
 * Upozornění provozovateli na novou QR objednávku (čeká na převod).
 * Přístupy se ještě neodesílají — až po označení Zaplaceno v adminu.
 */
export async function notifyQrOrderCreated(
  order: QrOrderCreatedNotify
): Promise<void> {
  const participantLines =
    order.participants && order.participants.length > 0
      ? [
          "",
          "Účastníci (přístupy po ověření platby):",
          ...order.participants.map(
            (participant) =>
              `  - ${participant.name} <${participant.email}> — ${participant.courseNames.join(", ")}`
          ),
        ]
      : [];

  const lines = [
    `Nová objednávka QR převodem (čeká na platbu): ${order.orderNumber}`,
    `Firma: ${order.companyName}`,
    order.ico ? `IČO: ${order.ico}` : null,
    `Kontakt: ${order.contactName}`,
    `E-mail: ${order.email}`,
    order.phone ? `Telefon: ${order.phone}` : null,
    `Částka: ${(order.totalAmountHalere / 100).toFixed(0)} Kč`,
    "Položky:",
    ...order.items.map((i) => `  - ${i.name} × ${i.quantity}`),
    ...participantLines,
    "",
    "Po připsání platby označte objednávku v administraci jako Zaplaceno — tím se odešlou přístupy účastníkům.",
  ]
    .filter(Boolean)
    .join("\n");

  console.info("[QR order created]\n" + lines);

  await sendEmail({
    to: notifyRecipient(),
    subject: `Nová QR objednávka ${order.orderNumber} – ${order.companyName}`,
    text: lines,
    replyTo: order.email,
  });
}
