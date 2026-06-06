import { NextResponse } from "next/server";
import { formatPriceFromHalere } from "@/lib/order-catalog";
import { getOrderByNumber } from "@/lib/orders";
import { buildQrPaymentDetails } from "@/lib/payment/generate-qr-payment";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ error: "Objednávka je již uhrazena." }, { status: 400 });
  }

  const qr = await buildQrPaymentDetails({
    orderNumber: order.orderNumber,
    amountHalere: order.totalAmountHalere,
    companyName: order.companyName,
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    amountHalere: order.totalAmountHalere,
    amountFormatted: formatPriceFromHalere(order.totalAmountHalere),
    accountLabel: qr.config.accountLabel,
    accountHolder: qr.config.accountHolder,
    iban: qr.config.iban,
    variableSymbol: qr.variableSymbol,
    message: qr.message,
    spayd: qr.spayd,
    qrDataUrl: qr.qrDataUrl,
  });
}
