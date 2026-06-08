"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  computeCart,
  formatPriceFromHalere,
  orderCatalog,
} from "@/lib/order-catalog";
import { qrPayment } from "@/lib/content";

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("kurz");

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const item of orderCatalog) {
      initial[item.courseSlug] = preselected === item.courseSlug ? 1 : 0;
    }
    return initial;
  });

  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  const lines = useMemo(
    () =>
      orderCatalog
        .filter((item) => (quantities[item.courseSlug] ?? 0) > 0)
        .map((item) => ({
          courseSlug: item.courseSlug,
          quantity: quantities[item.courseSlug] ?? 0,
        })),
    [quantities]
  );

  const cart = useMemo(() => {
    if (lines.length === 0) return null;
    const result = computeCart(lines);
    return "error" in result ? null : result;
  }, [lines]);

  function setQty(slug: string, qty: number) {
    setQuantities((prev) => ({
      ...prev,
      [slug]: Math.max(0, Math.min(99, qty)),
    }));
  }

  async function handleBankTransfer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoadingBank(true);

    try {
      const res = await fetch("/api/orders/create-bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          ico: ico || undefined,
          contactName,
          email,
          phone: phone || undefined,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Objednávku se nepodařilo vytvořit.");
        return;
      }

      window.location.href = `/objednavka/dekujeme?order=${encodeURIComponent(data.orderNumber)}&method=qr`;
    } catch {
      setError("Chyba spojení. Zkuste to prosím znovu.");
    } finally {
      setLoadingBank(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/gopay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          ico: ico || undefined,
          contactName,
          email,
          phone: phone || undefined,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Platbu se nepodařilo vytvořit.");
        return;
      }

      if (data.gwUrl) {
        window.location.href = data.gwUrl;
        return;
      }

      setError("GoPay nevrátil odkaz na platbu.");
    } catch {
      setError("Chyba spojení. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset>
        <legend className="text-lg font-bold text-slate-900">Kurzy a počet zaměstnanců</legend>
        <p className="mt-1 text-sm text-slate-600">
          Zadejte počet osob pro každý kurz nebo balíček (0 = neobjednávat). Ceny jsou bez DPH.
          Při 10–49 osobách sleva 10 %, při 50–99 osobách sleva 15 %.
        </p>
        <ul className="mt-4 space-y-3">
          {orderCatalog.map((item) => (
            <li
              key={item.courseSlug}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba bez DPH
                  {item.bundleCourses?.length ? (
                    <span className="block text-xs text-slate-400">
                      Balíček: {item.bundleCourses.length} školení
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${item.courseSlug}`} className="sr-only">
                  Počet pro {item.name}
                </label>
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-slate-300 text-lg hover:bg-slate-50"
                  onClick={() => setQty(item.courseSlug, (quantities[item.courseSlug] ?? 0) - 1)}
                  aria-label="Méně"
                >
                  −
                </button>
                <input
                  id={`qty-${item.courseSlug}`}
                  type="number"
                  min={0}
                  max={99}
                  value={quantities[item.courseSlug] ?? 0}
                  onChange={(e) => setQty(item.courseSlug, parseInt(e.target.value, 10) || 0)}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm"
                />
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-slate-300 text-lg hover:bg-slate-50"
                  onClick={() => setQty(item.courseSlug, (quantities[item.courseSlug] ?? 0) + 1)}
                  aria-label="Více"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      </fieldset>

      {cart && (
        <div className="rounded-xl bg-brand-tint px-4 py-3 text-sm text-brand-darker">
          <p className="font-semibold">
            Celkem bez DPH: {formatPriceFromHalere(cart.totalAmountHalere)}
          </p>
          <ul className="mt-2 space-y-1 text-brand-dark">
            {cart.items.map((item) => (
              <li key={item.courseSlug}>
                {item.name} × {item.quantity} — {formatPriceFromHalere(item.lineTotalHalere)}
                {item.discountPercent > 0 ? ` (sleva ${item.discountPercent} %)` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Fakturační údaje</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
              Název firmy *
            </label>
            <input
              id="companyName"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ico" className="block text-sm font-medium text-slate-700">
              IČO
            </label>
            <input
              id="ico"
              value={ico}
              onChange={(e) => setIco(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-slate-700">
              Kontaktní osoba *
            </label>
            <input
              id="contactName"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={loading || loadingBank || !cart}
          className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Přesměrování na GoPay…" : "Zaplatit přes GoPay"}
        </button>
        <button
          type="button"
          disabled={loading || loadingBank || !cart}
          onClick={handleBankTransfer}
          className="w-full rounded-lg border border-brand px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-tint disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loadingBank ? "Vytvářím objednávku…" : "Zaplatit QR převodem"}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        GoPay: karty a online bankovní převody. QR platba: převod na účet{" "}
        <strong>{qrPayment.accountLabel}</strong> ({qrPayment.accountHolder}) – po připsání platby
        vám zašleme přihlašovací údaje pro školení.
      </p>
    </form>
  );
}
