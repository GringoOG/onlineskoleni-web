"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceFromHalere } from "@/lib/order-catalog";
import { QrPaymentPanel } from "@/components/QrPaymentPanel";

interface OrderStatusProps {
  orderNumber: string;
  showQrPayment?: boolean;
}

interface OrderData {
  orderNumber: string;
  status: string;
  companyName: string;
  totalAmountHalere: number;
  items: { name: string; quantity: number }[];
  paymentState: string | null;
  paymentMethod: "gopay" | "qr" | "manual";
}

async function fetchOrder(orderNumber: string): Promise<OrderData | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) return null;
  return res.json();
}

export function OrderStatus({ orderNumber, showQrPayment = false }: OrderStatusProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!showQrPayment) {
      await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/sync`, {
        method: "POST",
      }).catch(() => {});
    }
    const data = await fetchOrder(orderNumber);
    setOrder(data);
    setLoading(false);
  }, [orderNumber, showQrPayment]);

  useEffect(() => {
    refresh();
    if (showQrPayment) return;
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh, showQrPayment]);

  if (loading) {
    return (
      <p className="text-muted">
        {showQrPayment ? "Načítáme objednávku…" : "Ověřujeme stav platby u GoPay…"}
      </p>
    );
  }

  if (!order) {
    return (
      <p className="text-red-700">
        Objednávku <strong>{orderNumber}</strong> se nepodařilo najít.
      </p>
    );
  }

  const paid = order.status === "PAID";
  const failed = order.status === "FAILED";
  const isBankTransfer = showQrPayment || order.paymentMethod === "qr";

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl px-4 py-3 text-sm ${
          paid
            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
            : failed
              ? "border border-red-200 bg-red-50 text-red-900"
              : "border border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {paid ? (
          <>
            <p className="font-semibold">Platba přijata – děkujeme</p>
            <p className="mt-1">
              Objednávka je zaznamenána. Na e-mail objednatele vám brzy zašleme přihlašovací údaje
              pro zaměstnance. Mezitím můžete poslat seznam jmen na{" "}
              <a href="mailto:info@onlineskoleni.eu" className="font-medium underline">
                info@onlineskoleni.eu
              </a>
              .
            </p>
          </>
        ) : failed ? (
          <>
            <p className="font-semibold">Platba nebyla dokončena</p>
            <p className="mt-1">
              Objednávku můžete zkusit znovu nebo nás kontaktujte s číslem{" "}
              <strong>{order.orderNumber}</strong>.
            </p>
          </>
        ) : isBankTransfer ? (
          <>
            <p className="font-semibold">Objednávka vytvořena – čekáme na platbu</p>
            <p className="mt-1">
              Uhraďte prosím částku bankovním převodem (QR kód níže). Po připsání platby vás
              budeme kontaktovat s přihlašovacími údaji.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">Čekáme na potvrzení platby</p>
            <p className="mt-1">
              Po dokončení platby u GoPay se stránka automaticky aktualizuje (obvykle do několika
              sekund). Stav: <strong>{order.status}</strong>
              {order.paymentState ? ` / ${order.paymentState}` : ""}
            </p>
          </>
        )}
      </div>

      {!paid && isBankTransfer && <QrPaymentPanel orderNumber={orderNumber} />}

      <dl className="grid gap-2 text-sm text-muted">
        <div>
          <dt className="text-muted/80">Číslo objednávky</dt>
          <dd className="font-mono font-medium text-foreground">{order.orderNumber}</dd>
        </div>
        <div>
          <dt className="text-muted/80">Firma</dt>
          <dd className="text-foreground">{order.companyName}</dd>
        </div>
        <div>
          <dt className="text-muted/80">Částka</dt>
          <dd className="text-foreground">{formatPriceFromHalere(order.totalAmountHalere)}</dd>
        </div>
        <div>
          <dt className="text-muted/80">Položky</dt>
          <dd>
            <ul className="mt-1 list-inside list-disc text-foreground">
              {order.items.map((item) => (
                <li key={item.name}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-4">
        {!paid && (
          <Link href="/objednavka" className="btn-primary">
            Zkusit objednávku znovu
          </Link>
        )}
        <Link href="/kontakt" className="link-brand text-sm">
          Potřebujete pomoc? Kontaktujte nás →
        </Link>
      </div>
    </div>
  );
}
