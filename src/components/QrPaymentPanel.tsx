"use client";

import { useEffect, useState } from "react";

interface QrPaymentPanelProps {
  orderNumber: string;
}

interface QrPaymentData {
  amountFormatted: string;
  accountLabel: string;
  accountHolder: string;
  iban: string;
  variableSymbol: string;
  message: string;
  qrDataUrl: string;
}

export function QrPaymentPanel({ orderNumber }: QrPaymentPanelProps) {
  const [data, setData] = useState<QrPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/qr`);
        const json = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? "QR platbu se nepodařilo načíst.");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Chyba spojení při načítání QR platby.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted">Načítám QR platbu…</p>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Platba bankovním převodem (QR)</h2>
      <p className="mt-2 text-sm text-muted">
        Naskenujte QR kód v mobilním bankovnictví nebo zadejte údaje ručně. Po připsání platby
        vám zašleme přihlašovací údaje.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.qrDataUrl}
          alt={`QR platba ${data.amountFormatted}`}
          width={280}
          height={280}
          className="rounded-xl border border-border bg-white p-2"
        />

        <dl className="grid w-full gap-3 text-sm sm:flex-1">
          <div>
            <dt className="text-muted">Příjemce</dt>
            <dd className="font-medium text-foreground">{data.accountHolder}</dd>
          </div>
          <div>
            <dt className="text-muted">Účet</dt>
            <dd className="font-mono font-medium text-foreground">{data.accountLabel}</dd>
          </div>
          <div>
            <dt className="text-muted">IBAN</dt>
            <dd className="font-mono text-foreground">{data.iban}</dd>
          </div>
          <div>
            <dt className="text-muted">Částka</dt>
            <dd className="text-lg font-bold text-brand-dark">{data.amountFormatted}</dd>
          </div>
          <div>
            <dt className="text-muted">Variabilní symbol</dt>
            <dd className="font-mono font-medium text-foreground">{data.variableSymbol}</dd>
          </div>
          <div>
            <dt className="text-muted">Zpráva pro příjemce</dt>
            <dd className="text-foreground">{data.message}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
