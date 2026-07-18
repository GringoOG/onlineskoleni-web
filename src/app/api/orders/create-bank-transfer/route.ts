import { NextResponse } from "next/server";
import { createPendingOrder } from "@/lib/orders";
import type { CartLineInput } from "@/lib/order-catalog";
import { validateOrderParticipants } from "@/lib/order-participants";
import { notifyQrOrderCreated } from "@/lib/order-notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const MAX_BODY_BYTES = 100_000;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`order-bank:${ip}`, { limit: 8, windowMs: 15 * 60 * 1000 });
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Příliš mnoho požadavků. Zkuste to znovu za ${rate.retryAfterSec} s.` },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Požadavek je příliš velký." }, { status: 413 });
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

    const participantsResult = validateOrderParticipants(body.participants, lines);
    if (!participantsResult.ok) {
      return NextResponse.json({ error: participantsResult.error }, { status: 400 });
    }

    const { order } = await createPendingOrder({
      companyName,
      contactName,
      email,
      ico,
      phone,
      lines,
      participants: participantsResult.participants,
    });

    const { prisma } = await import("@/lib/prisma");
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: "BANK_TRANSFER" },
    });
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { state: "AWAITING_TRANSFER" },
    });

    const courseNameBySlug = new Map(
      order.items.map((item) => [item.courseSlug, item.name] as const)
    );

    try {
      await notifyQrOrderCreated({
        orderNumber: order.orderNumber,
        companyName: order.companyName,
        contactName: order.contactName,
        email: order.email,
        phone: order.phone,
        ico: order.ico,
        totalAmountHalere: order.totalAmountHalere,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
        participants: participantsResult.participants.map((participant) => ({
          name: participant.name,
          email: participant.email,
          courseNames: participant.courseSlugs.map(
            (slug) => courseNameBySlug.get(slug) ?? slug
          ),
        })),
      });
    } catch (notifyError) {
      console.error("[create-bank-transfer] notifyQrOrderCreated:", notifyError);
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      paymentMethod: "bank_transfer",
    });
  } catch (err) {
    console.error("[create-bank-transfer]", err);
    const message = err instanceof Error ? err.message : "Nepodařilo se vytvořit objednávku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
