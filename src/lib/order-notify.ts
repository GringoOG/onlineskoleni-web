import { site } from "@/lib/content";

interface PaidOrderNotify {
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalAmountHalere: number;
  items: { name: string; quantity: number }[];
}

/** Upozornění provozovatele na zaplacenou objednávku (log + volitelný e-mail přes Resend). */
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
    "→ Připravte přihlašovací údaje pro zaměstnance a zašlete objednateli.",
  ]
    .filter(Boolean)
    .join("\n");

  console.info("[Order paid]\n" + lines);

  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.ORDER_NOTIFY_EMAIL ?? site.email;

  if (!resendKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to: [notifyTo],
        subject: `Zaplacená objednávka ${order.orderNumber} – ${order.companyName}`,
        text: lines,
      }),
    });
  } catch (err) {
    console.error("[Order notify email failed]", err);
  }
}
