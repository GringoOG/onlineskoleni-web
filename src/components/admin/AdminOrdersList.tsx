"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOrderListItem } from "@/lib/orders/admin-orders";
import { OrdersByChannelColumns } from "@/components/admin/OrderListCards";

export function AdminOrdersList() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyOrderNumber, setBusyOrderNumber] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (date.trim()) params.set("date", date.trim());
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/admin/objednavky${suffix}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `Chyba ${res.status}: Nepodařilo se načíst objednávky.`);
      }
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst objednávky.");
    } finally {
      setLoading(false);
    }
  }, [query, date]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  async function handleSetStatus(orderNumber: string, paymentStatus: "PAID" | "PENDING") {
    setBusyOrderNumber(orderNumber);
    setStatusMessage("");
    try {
      const res = await fetch(
        `/api/admin/objednavky/${encodeURIComponent(orderNumber)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Změna stavu se nezdařila.");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.orderNumber === orderNumber
            ? {
                ...order,
                status: paymentStatus,
                paymentStatus,
                paidStatusChangedAt: data.order?.paidStatusChangedAt ?? order.paidStatusChangedAt,
              }
            : order
        )
      );

      setStatusMessage(
        paymentStatus === "PAID"
          ? `Objednávka ${orderNumber} označena jako zaplacená.`
          : `Objednávka ${orderNumber} označena jako nezaplacená.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Změna stavu se nezdařila.");
    } finally {
      setBusyOrderNumber(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="order-search" className="block text-sm font-medium text-slate-700">
              Vyhledávání
            </label>
            <input
              id="order-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Číslo objednávky, firma, jméno, e-mail…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <div>
            <label htmlFor="order-date" className="block text-sm font-medium text-slate-700">
              Datum objednávky
            </label>
            <input
              id="order-date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="2026-07-13 nebo 13.7.2026"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Zobrazuje se max. 500 nejnovějších objednávek. Po označení jako zaplaceno se spustí
          založení účtů a odeslání uvítacího e-mailu (pokud ještě neproběhlo).
        </p>
      </div>

      {statusMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-slate-600">Načítám objednávky…</p>
      ) : (
        <OrdersByChannelColumns
          orders={orders}
          busyOrderNumber={busyOrderNumber}
          onSetStatus={handleSetStatus}
        />
      )}
    </div>
  );
}
