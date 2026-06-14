import { NextResponse } from "next/server";
import { requireOrdersApiAccess } from "@/lib/admin/api-access";
import {
  processManualOrder,
  type DiscountMode,
} from "@/lib/admin/process-manual-order";
import { getCatalogItem } from "@/lib/order-catalog";
import type { ManualPaymentMethod } from "@/lib/orders";

function parsePaymentMethod(value: unknown): ManualPaymentMethod | null {
  if (value === "INVOICE" || value === "CASH") {
    return value;
  }
  return null;
}

function parseDiscountMode(value: unknown): DiscountMode {
  if (value === "0" || value === "10" || value === "15" || value === "auto") {
    return value;
  }
  return "auto";
}

function parseCourseSlugs(body: Record<string, unknown>): string[] {
  if (Array.isArray(body.courseSlugs)) {
    return body.courseSlugs.map((slug) => String(slug).trim()).filter(Boolean);
  }
  const single = String(body.courseSlug ?? "").trim();
  return single ? [single] : [];
}

export async function POST(request: Request) {
  try {
    const authError = await requireOrdersApiAccess();
    if (authError) return authError;

    const body = await request.json();
    const companyName = String(body.companyName ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const contactEmail = String(body.contactEmail ?? body.email ?? "").trim();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const ico = body.ico ? String(body.ico).trim() : undefined;
    const courseSlugs = parseCourseSlugs(body);
    const participantsRaw = String(body.participantsRaw ?? body.participants ?? "");
    const adminNote = body.adminNote ? String(body.adminNote).trim() : undefined;
    const paymentMethod = parsePaymentMethod(body.paymentMethod);
    const discountMode = parseDiscountMode(body.discountMode);

    if (!companyName || !contactName || !contactEmail || courseSlugs.length === 0 || !paymentMethod) {
      return NextResponse.json(
        {
          error:
            "Vyplňte firmu, kontakt, e-mail, alespoň jeden kurz a způsob platby.",
        },
        { status: 400 }
      );
    }

    for (const slug of courseSlugs) {
      if (!getCatalogItem(slug)) {
        return NextResponse.json({ error: `Neplatný kurz: ${slug}` }, { status: 400 });
      }
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
      courseSlugs,
      paymentMethod,
      participantsRaw,
      adminNote,
      discountMode,
    });

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      seatsPurchased: result.seatsPurchased,
      courseCount: result.courseCount,
      appliedDiscountPercent: result.appliedDiscountPercent,
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
