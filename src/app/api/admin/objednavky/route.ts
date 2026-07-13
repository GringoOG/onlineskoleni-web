import { NextResponse } from "next/server";
import { requireOrdersApiAccess } from "@/lib/admin/api-access";
import { listAdminOrders } from "@/lib/orders/admin-orders";

export async function GET(request: Request) {
  const denied = await requireOrdersApiAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const date = searchParams.get("date") ?? undefined;

  try {
    const orders = await listAdminOrders({ query, date });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[admin/objednavky GET]", error);
    return NextResponse.json({ error: "Nepodařilo se načíst objednávky." }, { status: 500 });
  }
}
