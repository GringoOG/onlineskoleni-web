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

type ParticipantDraft = {
  id: string;
  name: string;
  email: string;
  salutation: "" | "pan" | "pani";
  courseSlugs: string[];
};

interface SuccessState {
  orderNumber: string;
  seatsPurchased: number;
  courseCount: number;
  appliedDiscountPercent: number;
  enrolledStudents: number;
  emailsSent: number;
  emailFailures?: { email: string; error: string }[];
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

function createParticipantId() {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyParticipant(courseSlugs: string[] = []): ParticipantDraft {
  return {
    id: createParticipantId(),
    name: "",
    email: "",
    salutation: "",
    courseSlugs,
  };
}

export function ManualOrderForm() {
  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactSalutation, setContactSalutation] = useState<"" | "pan" | "pani">("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("INVOICE");
  const [discountMode, setDiscountMode] = useState<DiscountMode>("auto");
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    emptyParticipant(["bozp-zamestnanec"]),
  ]);
  const [bulkPaste, setBulkPaste] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const seatCount = participants.length;

  const assignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const participant of participants) {
      for (const slug of participant.courseSlugs) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    return counts;
  }, [participants]);

  const lines = useMemo(
    () =>
      [...assignmentCounts.entries()]
        .filter(([, quantity]) => quantity > 0)
        .map(([courseSlug, quantity]) => ({ courseSlug, quantity })),
    [assignmentCounts]
  );

  const autoDiscount = getBulkDiscountPercent(seatCount);

  const cartResult = useMemo(() => {
    if (lines.length === 0) {
      return { error: "U účastníků vyberte alespoň jedno školení." } as const;
    }
    const override = discountMode === "auto" ? undefined : Number(discountMode);
    return computeCart(lines, { discountPercentOverride: override });
  }, [lines, discountMode]);

  const cart = cartResult && !("error" in cartResult) ? cartResult : null;
  const cartError = cartResult && "error" in cartResult ? cartResult.error : null;

  const effectiveDiscountPercent =
    discountMode === "auto"
      ? autoDiscount === "contact"
        ? null
        : autoDiscount
      : Number(discountMode);

  function updateParticipant(
    id: string,
    patch: Partial<Omit<ParticipantDraft, "id">>
  ) {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant
      )
    );
  }

  function toggleParticipantCourse(participantId: string, courseSlug: string) {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.id !== participantId) return participant;
        const has = participant.courseSlugs.includes(courseSlug);
        return {
          ...participant,
          courseSlugs: has
            ? participant.courseSlugs.filter((slug) => slug !== courseSlug)
            : [...participant.courseSlugs, courseSlug],
        };
      })
    );
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, emptyParticipant()]);
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => {
      if (prev.length <= 1) return [emptyParticipant()];
      return prev.filter((participant) => participant.id !== id);
    });
  }

  function fillFirstFromContact() {
    setParticipants((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [
        {
          ...first,
          name: contactName.trim() || first.name,
          email: contactEmail.trim() || first.email,
          salutation: contactSalutation || first.salutation,
        },
        ...rest,
      ];
    });
  }

  function importBulkPaste() {
    const parsed = parseParticipants(bulkPaste);
    if (parsed.errors.length > 0) {
      setError(parsed.errors.join(" "));
      return;
    }
    if (parsed.participants.length === 0) {
      setError("Vložte alespoň jeden řádek ve formátu Jméno Příjmení, email@firma.cz.");
      return;
    }

    setError("");
    setParticipants((prev) => {
      const existingEmails = new Set(
        prev
          .map((participant) => participant.email.trim().toLowerCase())
          .filter(Boolean)
      );
      const defaultCourses =
        prev[0]?.courseSlugs.length > 0 ? prev[0].courseSlugs : ["bozp-zamestnanec"];

      const imported = parsed.participants
        .filter((participant) => !existingEmails.has(participant.email))
        .map((participant) => ({
          id: createParticipantId(),
          name: participant.name,
          email: participant.email,
          salutation: (participant.salutation ?? "") as "" | "pan" | "pani",
          courseSlugs: [...defaultCourses],
        }));

      const replaceEmptyShell =
        prev.length === 1 && !prev[0].name.trim() && !prev[0].email.trim();

      return replaceEmptyShell ? imported : [...prev, ...imported];
    });
    setBulkPaste("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    for (let index = 0; index < participants.length; index += 1) {
      const participant = participants[index];
      if (!participant.name.trim()) {
        setError(`Účastník ${index + 1}: vyplňte jméno.`);
        return;
      }
      if (!participant.email.trim()) {
        setError(`Účastník ${index + 1}: vyplňte e-mail.`);
        return;
      }
      if (participant.courseSlugs.length === 0) {
        setError(`Účastník ${index + 1}: vyberte alespoň jedno školení.`);
        return;
      }
    }

    const emails = participants.map((participant) =>
      participant.email.trim().toLowerCase()
    );
    if (new Set(emails).size !== emails.length) {
      setError("Každá osoba potřebuje vlastní e-mail (duplicitní e-mail v seznamu).");
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
          contactSalutation: contactSalutation || undefined,
          contactEmail,
          phone: phone || undefined,
          paymentMethod,
          discountMode,
          participants: participants.map((participant) => ({
            name: participant.name,
            email: participant.email,
            salutation: participant.salutation || undefined,
            courseSlugs: participant.courseSlugs,
          })),
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
        emailFailures: data.emailFailures,
      });
      setParticipants([emptyParticipant(["bozp-zamestnanec"])]);
      setAdminNote("");
      setBulkPaste("");
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
              Typů školení v objednávce: <strong>{success.courseCount}</strong>
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
              {success.emailFailures && success.emailFailures.length > 0 ? (
                <span className="text-amber-800">
                  {" "}
                  (selhalo: {success.emailFailures.length})
                </span>
              ) : null}
            </li>
          </ul>
          {success.emailFailures && success.emailFailures.length > 0 ? (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950">
              <p className="font-semibold">Uvítací e-mail se nepodařilo odeslat</p>
              <p className="mt-1">
                Účet a kurzy byly vytvořeny, ale student nedostal přihlašovací údaje e-mailem.
                Zkontrolujte <code className="text-xs">RESEND_API_KEY</code> a ověřenou odesílací
                doménu na Vercelu.
              </p>
              <ul className="mt-2 list-inside list-disc">
                {success.emailFailures.map((failure) => (
                  <li key={failure.email}>
                    {failure.email}: {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
            <div className="mt-1 flex gap-2">
              <input
                id="contactName"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
              />
              <select
                id="contactSalutation"
                value={contactSalutation}
                onChange={(e) =>
                  setContactSalutation(e.target.value as "" | "pan" | "pani")
                }
                className="w-36 shrink-0 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                title="Oslovení v e-mailu"
              >
                <option value="">Auto (z příjmení)</option>
                <option value="pan">Pane</option>
                <option value="pani">Paní</option>
              </select>
            </div>
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
        <legend className="text-lg font-bold text-slate-900">
          Účastníci a přiřazení školení
        </legend>
        <p className="text-sm text-slate-600">
          U každého e-mailu zatrhněte školení, která má osoba absolvovat. Jedna osoba může mít více
          kurzů — každé školení se účtuje jen u přiřazených lidí.
        </p>

        {lines.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Počty míst dle přiřazení</p>
            <ul className="mt-2 space-y-1">
              {lines.map((line) => {
                const catalog = orderCatalog.find((item) => item.courseSlug === line.courseSlug);
                return (
                  <li key={line.courseSlug}>
                    {catalog?.name ?? line.courseSlug}:{" "}
                    <strong>{line.quantity}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fillFirstFromContact}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Doplnit 1. účastníka z kontaktu
          </button>
          <button
            type="button"
            onClick={addParticipant}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Přidat účastníka
          </button>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
          <label htmlFor="bulkPaste" className="block text-sm font-medium text-slate-700">
            Hromadně vložit jména a e-maily (volitelné)
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Formát: <code className="rounded bg-slate-100 px-1">Jméno Příjmení, email@firma.cz</code>
            . Po importu doplňte / upravte školení u každého řádku.
          </p>
          <textarea
            id="bulkPaste"
            value={bulkPaste}
            onChange={(e) => setBulkPaste(e.target.value)}
            rows={4}
            placeholder={
              "Jan Novák, jan.novak@firma.cz\nMarie Svobodová, marie@firma.cz"
            }
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
          <button
            type="button"
            onClick={importBulkPaste}
            className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Importovat do seznamu
          </button>
        </div>

        <ul className="space-y-4">
          {participants.map((participant, index) => (
            <li
              key={participant.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Účastník {index + 1}</p>
                {participants.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-sm font-medium text-slate-500 hover:text-red-700"
                  >
                    Odebrat
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`participant-name-${participant.id}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Jméno a příjmení *
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id={`participant-name-${participant.id}`}
                      value={participant.name}
                      onChange={(e) =>
                        updateParticipant(participant.id, { name: e.target.value })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                    />
                    <select
                      value={participant.salutation}
                      onChange={(e) =>
                        updateParticipant(participant.id, {
                          salutation: e.target.value as "" | "pan" | "pani",
                        })
                      }
                      className="w-36 shrink-0 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                      title="Oslovení v e-mailu"
                    >
                      <option value="">Auto</option>
                      <option value="pan">Pane</option>
                      <option value="pani">Paní</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`participant-email-${participant.id}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    E-mail pro přihlášení *
                  </label>
                  <input
                    id={`participant-email-${participant.id}`}
                    type="email"
                    value={participant.email}
                    onChange={(e) =>
                      updateParticipant(participant.id, { email: e.target.value })
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-700">
                  Přiřazená školení *
                </legend>
                <ul className="mt-2 space-y-2">
                  {orderCatalog.map((item) => {
                    const checked = participant.courseSlugs.includes(item.courseSlug);
                    return (
                      <li key={item.courseSlug}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                            checked
                              ? "border-brand bg-brand-tint/40"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={checked}
                            onChange={() =>
                              toggleParticipantCourse(participant.id, item.courseSlug)
                            }
                          />
                          <span>
                            <span className="font-medium text-slate-900">{item.name}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba
                              {item.bundleCourses?.length
                                ? ` · balíček ${item.bundleCourses.length} školení`
                                : ""}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            </li>
          ))}
        </ul>
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
            {lines.length} typ(ů) školení
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
        disabled={loading || !cart || lines.length === 0}
        className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Vytvářím objednávku a odesílám přístupy…" : "Vytvořit a aktivovat přístup"}
      </button>
    </form>
  );
}
