import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { processManualOrder } from "@/lib/admin/process-manual-order";
import { getCatalogItem } from "@/lib/order-catalog";
import type { ManualPaymentMethod } from "@/lib/orders";

function parsePaymentMethod(value: unknown): ManualPaymentMethod | null {
  if (value === "INVOICE" || value === "CASH") {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Nejste přihlášeni do administrace." }, { status: 401 });
    }

    const body = await request.json();
    const companyName = String(body.companyName ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const contactEmail = String(body.contactEmail ?? body.email ?? "").trim();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const ico = body.ico ? String(body.ico).trim() : undefined;
    const courseSlug = String(body.courseSlug ?? "").trim();
    const participantsRaw = String(body.participantsRaw ?? body.participants ?? "");
    const adminNote = body.adminNote ? String(body.adminNote).trim() : undefined;
    const paymentMethod = parsePaymentMethod(body.paymentMethod);

    if (!companyName || !contactName || !contactEmail || !courseSlug || !paymentMethod) {
      return NextResponse.json(
        {
          error:
            "Vyplňte firmu, kontakt, e-mail, kurz a způsob platby (INVOICE nebo CASH).",
        },
        { status: 400 }
      );
    }

    if (!getCatalogItem(courseSlug)) {
      return NextResponse.json({ error: "Neplatný kurz." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json({ error: "Neplatný e-mail kontaktní osoby." }, { status: 400 });
    }

    const result = await processManualOrder({
      companyName,
      contactName,
      contactEmail,
      phone,
      ico,
      courseSlug,
      paymentMethod,
      participantsRaw,
      adminNote,
    });

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      seatsPurchased: result.seatsPurchased,
      enrolledStudents: result.enrolledStudents,
      emailsSent: result.emailsSent,
    });
  } catch (error) {
    console.error("[admin/objednavky/nova]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se vytvořit manuální objednávku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
