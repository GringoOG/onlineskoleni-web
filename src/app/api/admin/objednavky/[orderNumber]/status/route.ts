import { NextResponse } from "next/server";
import { requireOrdersApiAccess } from "@/lib/admin/api-access";
import {
  setAdminOrderPaymentStatus,
  type AdminPaymentStatus,
} from "@/lib/orders/admin-orders";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

function parsePaymentStatus(value: unknown): AdminPaymentStatus | null {
  if (value === "PAID" || value === "PENDING") {
    return value;
  }
  return null;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const denied = await requireOrdersApiAccess();
  if (denied) return denied;

  const { orderNumber } = await params;

  try {
    const body = await request.json();
    const paymentStatus = parsePaymentStatus(body.paymentStatus);
    if (!paymentStatus) {
      return NextResponse.json(
        { error: "Neplatný stav. Použijte PAID nebo PENDING." },
        { status: 400 }
      );
    }

    const result = await setAdminOrderPaymentStatus(orderNumber, paymentStatus);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/objednavky PATCH]", error);
    return NextResponse.json({ error: "Nepodařilo se změnit stav objednávky." }, { status: 500 });
  }
}
