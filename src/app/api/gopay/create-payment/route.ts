import { NextResponse } from "next/server";
import { Currency, getAppBaseUrl, getGoPayClient, isGoPayConfigured } from "@/lib/gopay";
import { createPendingOrder } from "@/lib/orders";
import type { CartLineInput } from "@/lib/order-catalog";

export async function POST(request: Request) {
  try {
    if (!isGoPayConfigured()) {
      return NextResponse.json(
        {
          error:
            "GoPay není nakonfigurován. Doplňte GOPAY_GOID, GOPAY_CLIENT_ID, GOPAY_CLIENT_SECRET a GOPAY_GATEWAY_URL v souboru .env.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const companyName = String(body.companyName ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const ico = body.ico ? String(body.ico).trim() : undefined;
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const lines = body.lines as CartLineInput[] | undefined;

    if (!companyName || !contactName || !email || !lines?.length) {
      return NextResponse.json(
        { error: "Vyplňte firmu, kontakt, e-mail a vyberte alespoň jeden kurz." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Neplatný e-mail." }, { status: 400 });
    }

    const { order, cart } = await createPendingOrder({
      companyName,
      contactName,
      email,
      ico,
      phone,
      lines,
    });

    const baseUrl = getAppBaseUrl();
    const client = getGoPayClient();

    const [firstName, ...rest] = contactName.split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    const gopayPayment = await client.createPayment({
      amount: cart.totalAmountHalere,
      currency: Currency.CZK,
      order_number: order.orderNumber,
      order_description: `Online školení – ${order.companyName}`,
      lang: "CS",
      payer: {
        contact: {
          first_name: firstName,
          last_name: lastName,
          email: order.email,
          phone_number: order.phone ?? undefined,
        },
      },
      callback: {
        return_url: `${baseUrl}/objednavka/dekujeme?order=${order.orderNumber}`,
        notification_url: `${baseUrl}/api/gopay/webhook`,
      },
      items: cart.items.map((item) => ({
        name: item.name,
        amount: item.lineTotalHalere,
        count: item.quantity,
        vat_rate: item.vatRate,
        type: "ITEM",
      })),
    });

    if (!gopayPayment.id || !gopayPayment.gw_url) {
      return NextResponse.json(
        { error: "GoPay nevrátil platební bránu. Zkontrolujte credentials." },
        { status: 502 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: "GOPAY" },
    });
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        gopayPaymentId: String(gopayPayment.id),
        state: gopayPayment.state ?? "CREATED",
        gwUrl: gopayPayment.gw_url,
      },
    });

    return NextResponse.json({
      gwUrl: gopayPayment.gw_url,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("[GoPay create-payment]", err);
    const message = err instanceof Error ? err.message : "Nepodařilo se vytvořit platbu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
