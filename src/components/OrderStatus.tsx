"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceFromHalere } from "@/lib/order-catalog";

interface OrderStatusProps {
  orderNumber: string;
}

interface OrderData {
  orderNumber: string;
  status: string;
  companyName: string;
  totalAmountHalere: number;
  items: { name: string; quantity: number }[];
  paymentState: string | null;
}

async function fetchOrder(orderNumber: string): Promise<OrderData | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) return null;
  return res.json();
}

export function OrderStatus({ orderNumber }: OrderStatusProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/sync`, {
      method: "POST",
    }).catch(() => {});
    const data = await fetchOrder(orderNumber);
    setOrder(data);
    setLoading(false);
  }, [orderNumber]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return <p className="text-muted">Ověřujeme stav platby u GoPay…</p>;
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
