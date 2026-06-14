"use client";

import { useMemo, useState } from "react";
import {
  computeCart,
  formatPriceFromHalere,
  getBulkDiscountPercent,
  orderCatalog,
} from "@/lib/order-catalog";
import { parseParticipants } from "@/lib/admin/parse-participants";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";

type PaymentMethod = "INVOICE" | "CASH";
type DiscountMode = "auto" | "0" | "10" | "15";

interface SuccessState {
  orderNumber: string;
  seatsPurchased: number;
  courseCount: number;
  appliedDiscountPercent: number;
  enrolledStudents: number;
  emailsSent: number;
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

export function ManualOrderForm() {
  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>(() => ({
    bozp: true,
  }));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("INVOICE");
  const [discountMode, setDiscountMode] = useState<DiscountMode>("auto");
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

  const selectedSlugs = useMemo(
    () => orderCatalog.filter((item) => selectedCourses[item.courseSlug]).map((item) => item.courseSlug),
    [selectedCourses]
  );

  const autoDiscount = getBulkDiscountPercent(seatCount);

  const cartResult = useMemo(() => {
    if (selectedSlugs.length === 0) {
      return { error: "Vyberte alespoň jeden kurz." } as const;
    }
    const lines = selectedSlugs.map((courseSlug) => ({ courseSlug, quantity: seatCount }));
    const override = discountMode === "auto" ? undefined : Number(discountMode);
    return computeCart(lines, { discountPercentOverride: override });
  }, [selectedSlugs, seatCount, discountMode]);

  const cart = cartResult && !("error" in cartResult) ? cartResult : null;
  const cartError = cartResult && "error" in cartResult ? cartResult.error : null;

  const effectiveDiscountPercent =
    discountMode === "auto"
      ? autoDiscount === "contact"
        ? null
        : autoDiscount
      : Number(discountMode);

  function toggleCourse(slug: string) {
    setSelectedCourses((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (selectedSlugs.length === 0) {
      setError("Vyberte alespoň jeden kurz.");
      return;
    }

    if (parsedParticipants.errors.length > 0) {
      setError(parsedParticipants.errors.join(" "));
      return;
    }

    if (cartError) {
      setError(cartError);
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
          courseSlugs: selectedSlugs,
          paymentMethod,
          discountMode,
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
        courseCount: data.courseCount,
        appliedDiscountPercent: data.appliedDiscountPercent,
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
              Kurzů na osobu: <strong>{success.courseCount}</strong>
            </li>
            <li>
              Počet osob: <strong>{success.seatsPurchased}</strong>
            </li>
            <li>
              Sleva: <strong>{success.appliedDiscountPercent} %</strong>
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
              className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Kurzy pro každého studenta</legend>
        <p className="text-sm text-slate-600">
          Zaškrtněte všechny kurzy, které má každý zaměstnanec absolvovat. Balíček se v systému
          automaticky rozloží na jednotlivá školení.
        </p>
        <ul className="space-y-3">
          {orderCatalog.map((item) => (
            <li
              key={item.courseSlug}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(selectedCourses[item.courseSlug])}
                  onChange={() => toggleCourse(item.courseSlug)}
                  className="mt-1 shrink-0 rounded border-slate-300 text-brand-dark focus:ring-brand"
                />
                <span>
                  <span className="block font-medium text-slate-900">{item.name}</span>
                  <span className="block text-sm text-slate-500">
                    {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba bez DPH
                    {item.bundleCourses?.length ? (
                      <span className="block text-xs text-slate-400">
                        Balíček: {item.bundleCourses.length} školení
                      </span>
                    ) : null}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Sleva dle ceníku</legend>
        <BulkDiscountBanner variant="compact" />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Počet osob: <strong>{seatCount}</strong>
            {discountMode === "auto" && autoDiscount === "contact" ? (
              <span className="ml-2 text-amber-700">
                (100+ osob – individuální nabídka, zvolte slevu ručně)
              </span>
            ) : (
              <span className="ml-2">
                → automatická sleva:{" "}
                <strong>{effectiveDiscountPercent ?? 0} %</strong>
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="block text-sm font-medium text-slate-700">Nastavení slevy</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {(
              [
                ["auto", "Automaticky dle počtu osob"],
                ["0", "Bez slevy (0 %)"],
                ["10", "10 % (10–49 osob)"],
                ["15", "15 % (50–99 osob)"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="discountMode"
                  value={value}
                  checked={discountMode === value}
                  onChange={() => setDiscountMode(value)}
                  className="text-brand-dark focus:ring-brand"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Platba</legend>
        <div className="flex flex-wrap gap-3">
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Zaměstnanci (hromadné zadání)</legend>
        <p className="text-sm text-slate-600">
          Každý řádek = jedna osoba = jedno místo (pro výpočet slevy). Formát:{" "}
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
          {parsedParticipants.errors.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-red-700">
              {parsedParticipants.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : parsedParticipants.participants.length > 0 ? (
            <ul className="space-y-1">
              {parsedParticipants.participants.map((participant) => (
                <li key={participant.email}>
                  {participant.name} — {participant.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Použije se kontaktní osoba ({contactName || "—"}).</p>
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
            Celkem bez DPH: {formatPriceFromHalere(cart.totalAmountHalere)} · {seatCount} osob ·{" "}
            {selectedSlugs.length} kurz(ů) na osobu
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

      {cartError ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {cartError}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          loading || !cart || parsedParticipants.errors.length > 0 || selectedSlugs.length === 0
        }
        className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Vytvářím objednávku a odesílám přístupy…" : "Vytvořit a aktivovat přístup"}
      </button>
    </form>
  );
}
