"use client";

import { useMemo, useState } from "react";
import {
  computeCart,
  formatPriceFromHalere,
  orderCatalog,
} from "@/lib/order-catalog";
import { parseParticipants } from "@/lib/admin/parse-participants";

type PaymentMethod = "INVOICE" | "CASH";

interface SuccessState {
  orderNumber: string;
  seatsPurchased: number;
  enrolledStudents: number;
  emailsSent: number;
}

export function ManualOrderForm() {
  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseSlug, setCourseSlug] = useState(orderCatalog[0]?.courseSlug ?? "bozp");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("INVOICE");
  const [participantsRaw, setParticipantsRaw] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const parsedParticipants = useMemo(
    () => parseParticipants(participantsRaw),
    [participantsRaw]
  );

  const seatCount =
    parsedParticipants.participants.length > 0 ? parsedParticipants.participants.length : 1;

  const cart = useMemo(() => {
    const result = computeCart([{ courseSlug, quantity: seatCount }]);
    return "error" in result ? null : result;
  }, [courseSlug, seatCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (parsedParticipants.errors.length > 0) {
      setError(parsedParticipants.errors.join(" "));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/objednavky/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          ico: ico || undefined,
          contactName,
          contactEmail,
          phone: phone || undefined,
          courseSlug,
          paymentMethod,
          participantsRaw,
          adminNote: adminNote || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Objednávku se nepodařilo vytvořit.");
        return;
      }

      setSuccess({
        orderNumber: data.orderNumber,
        seatsPurchased: data.seatsPurchased,
        enrolledStudents: data.enrolledStudents,
        emailsSent: data.emailsSent,
      });
      setParticipantsRaw("");
      setAdminNote("");
    } catch {
      setError("Chyba spojení. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-semibold">Objednávka byla aktivována</p>
          <ul className="mt-2 space-y-1">
            <li>
              Číslo objednávky: <strong>{success.orderNumber}</strong>
            </li>
            <li>
              Počet míst: <strong>{success.seatsPurchased}</strong>
            </li>
            <li>
              Založeno účtů: <strong>{success.enrolledStudents}</strong>
            </li>
            <li>
              Odesláno e-mailů: <strong>{success.emailsSent}</strong>
            </li>
          </ul>
        </div>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Fakturační údaje</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
              Firma *
            </label>
            <input
              id="companyName"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-slate-700">
              Jméno kontaktu *
            </label>
            <input
              id="contactName"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700">
              E-mail kontaktu *
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Kurz a platba</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="courseSlug" className="block text-sm font-medium text-slate-700">
              Kurz *
            </label>
            <select
              id="courseSlug"
              required
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            >
              {orderCatalog.map((item) => (
                <option key={item.courseSlug} value={item.courseSlug}>
                  {item.name} — {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba bez DPH
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Způsob platby *</span>
            <div className="mt-2 flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="INVOICE"
                  checked={paymentMethod === "INVOICE"}
                  onChange={() => setPaymentMethod("INVOICE")}
                  className="text-brand-dark focus:ring-brand"
                />
                Faktura
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={() => setPaymentMethod("CASH")}
                  className="text-brand-dark focus:ring-brand"
                />
                Hotově
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Zaměstnanci (hromadné zadání)</legend>
        <p className="text-sm text-slate-600">
          Každý řádek = jedno místo. Formát:{" "}
          <code className="rounded bg-slate-100 px-1">Jméno Příjmení, email@firma.cz</code>.
          Pokud necháte prázdné, vytvoří se účet pouze pro kontaktní osobu.
        </p>
        <textarea
          id="participantsRaw"
          value={participantsRaw}
          onChange={(e) => setParticipantsRaw(e.target.value)}
          rows={8}
          placeholder={
            "Jan Novák, jan.novak@firma.cz\nMarie Svobodová, marie@firma.cz\nPetr Dvořák, petr@firma.cz"
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Počet míst (seatsPurchased): <strong>{seatCount}</strong>
          </p>
          {parsedParticipants.errors.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700">
              {parsedParticipants.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : parsedParticipants.participants.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {parsedParticipants.participants.map((participant) => (
                <li key={participant.email}>
                  {participant.name} — {participant.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-slate-500">Použije se kontaktní osoba ({contactName || "—"}).</p>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold text-slate-900">Interní poznámka</legend>
        <textarea
          id="adminNote"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={3}
          placeholder="Např. číslo faktury, způsob doručení, poznámka pro TechnikPO…"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </fieldset>

      {cart ? (
        <div className="rounded-xl bg-brand-tint px-4 py-3 text-sm text-brand-darker">
          <p className="font-semibold">
            Celkem bez DPH: {formatPriceFromHalere(cart.totalAmountHalere)} ({seatCount}× místo)
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
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !cart || parsedParticipants.errors.length > 0}
        className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Vytvářím objednávku a odesílám přístupy…" : "Vytvořit a aktivovat přístup"}
      </button>
    </form>
  );
}
