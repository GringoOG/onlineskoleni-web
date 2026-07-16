import type { AdminOrderListItem } from "@/lib/orders/admin-orders";
import { ORDER_CHANNEL_LABELS, type OrderChannel } from "@/lib/orders/order-channel";
import { formatPriceFromHalere } from "@/lib/order-catalog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderCardProps {
  order: AdminOrderListItem;
  busy: boolean;
  onSetStatus: (orderNumber: string, paymentStatus: "PAID" | "PENDING") => void;
}

function OrderCard({ order, busy, onSetStatus }: OrderCardProps) {
  const paid = order.paymentStatus === "PAID";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{order.orderNumber}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{order.companyName}</p>
          <p className="text-sm text-slate-600">{order.contactName}</p>
          <p className="text-xs text-slate-500">{order.email}</p>
          {order.participantCount != null ? (
            <p className="mt-1 text-xs text-slate-500">
              LMS účastníci: {order.participantCount}
            </p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
            paid
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {paid ? "Zaplaceno" : "Nezaplaceno"}
        </span>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-slate-600">
        <div className="flex justify-between gap-2">
          <dt>Částka</dt>
          <dd className="font-medium text-slate-800">
            {formatPriceFromHalere(order.totalAmountHalere)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Vytvořeno</dt>
          <dd>{formatDateTime(order.createdAt)}</dd>
        </div>
        {order.paidStatusChangedAt ? (
          <div className="flex justify-between gap-2">
            <dt>Stav změněn</dt>
            <dd>{formatDateTime(order.paidStatusChangedAt)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {!paid ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetStatus(order.orderNumber, "PAID")}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Označit zaplaceno
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetStatus(order.orderNumber, "PENDING")}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Označit nezaplaceno
          </button>
        )}
      </div>
    </article>
  );
}

interface OrdersByChannelColumnsProps {
  orders: AdminOrderListItem[];
  busyOrderNumber: string | null;
  onSetStatus: (orderNumber: string, paymentStatus: "PAID" | "PENDING") => void;
}

const CHANNELS: OrderChannel[] = ["gopay", "qr", "manual"];

export function OrdersByChannelColumns({
  orders,
  busyOrderNumber,
  onSetStatus,
}: OrdersByChannelColumnsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {CHANNELS.map((channel) => {
        const channelOrders = orders.filter((order) => order.channel === channel);
        return (
          <section key={channel} className="min-w-0">
            <header className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {ORDER_CHANNEL_LABELS[channel]}
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {channelOrders.length}
              </span>
            </header>
            {channelOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Žádné objednávky v této kategorii.
              </p>
            ) : (
              <ul className="space-y-3">
                {channelOrders.map((order) => (
                  <li key={order.orderNumber}>
                    <OrderCard
                      order={order}
                      busy={busyOrderNumber === order.orderNumber}
                      onSetStatus={onSetStatus}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
