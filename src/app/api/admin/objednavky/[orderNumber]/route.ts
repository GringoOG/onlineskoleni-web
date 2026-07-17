import { NextResponse } from "next/server";
import { requireOrdersApiAccess } from "@/lib/admin/api-access";
import { deleteAdminOrder } from "@/lib/orders/admin-orders";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const denied = await requireOrdersApiAccess();
  if (denied) return denied;

  const { orderNumber } = await params;

  try {
    const result = await deleteAdminOrder(orderNumber);
    if (!result.ok) {
      const status =
        result.error.includes("GoPay") || result.error.includes("nelze smazat")
          ? 400
          : 404;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/objednavky DELETE]", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat objednávku." },
      { status: 500 }
    );
  }
}
