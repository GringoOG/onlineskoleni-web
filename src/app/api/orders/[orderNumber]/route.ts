import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    companyName: order.companyName,
    totalAmountHalere: order.totalAmountHalere,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
    })),
    paymentState: order.payment?.state ?? null,
  });
}
