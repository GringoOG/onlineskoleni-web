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

function parseContactSalutation(value: unknown): "pan" | "pani" | undefined {
  if (value === "pan" || value === "pani") {
    return value;
  }
  return undefined;
}

function parseParticipants(body: Record<string, unknown>):
  | Array<{
      name: string;
      email: string;
      salutation?: "pan" | "pani";
      courseSlugs?: string[];
    }>
  | undefined {
  if (!Array.isArray(body.participants)) {
    return undefined;
  }

  return body.participants.map((row) => {
    const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    const salutation: "pan" | "pani" | undefined =
      item.salutation === "pan" || item.salutation === "pani"
        ? item.salutation
        : undefined;
    const courseSlugs = Array.isArray(item.courseSlugs)
      ? item.courseSlugs.map((slug) => String(slug).trim()).filter(Boolean)
      : undefined;

    return {
      name: String(item.name ?? ""),
      email: String(item.email ?? ""),
      salutation,
      courseSlugs,
    };
  });
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
    const participants = parseParticipants(body);
    const participantsRaw = String(body.participantsRaw ?? body.participantsText ?? "");
    const adminNote = body.adminNote ? String(body.adminNote).trim() : undefined;
    const paymentMethod = parsePaymentMethod(body.paymentMethod);
    const discountMode = parseDiscountMode(body.discountMode);
    const contactSalutation = parseContactSalutation(body.contactSalutation);

    const hasParticipants = Array.isArray(participants) && participants.length > 0;
    if (!companyName || !contactName || !contactEmail || !paymentMethod) {
      return NextResponse.json(
        {
          error: "Vyplňte firmu, kontakt, e-mail pro potvrzení a způsob platby.",
        },
        { status: 400 }
      );
    }

    if (!hasParticipants && !String(body.participantsRaw ?? "").trim()) {
      return NextResponse.json(
        {
          error:
            "Vyplňte alespoň jednoho účastníka (jméno, e-mail pro přihlášení a školení).",
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
      contactSalutation,
      phone,
      ico,
      courseSlugs: courseSlugs.length > 0 ? courseSlugs : undefined,
      paymentMethod,
      participants,
      participantsRaw: hasParticipants ? undefined : participantsRaw,
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
      emailFailures: result.emailFailures,
    });
  } catch (error) {
    console.error("[admin/objednavky/nova]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se vytvořit manuální objednávku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
