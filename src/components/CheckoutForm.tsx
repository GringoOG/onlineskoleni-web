"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  computeCart,
  formatPriceFromHalere,
  orderCatalog,
} from "@/lib/order-catalog";
import { qrPayment } from "@/lib/content";
import { CeskoPlatiKartouBadge } from "@/components/CeskoPlatiKartouBadge";
import { validateOrderParticipants } from "@/lib/order-participants";

type ParticipantDraft = {
  id: string;
  name: string;
  email: string;
  courseSlugs: string[];
};

function createParticipantId() {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyParticipant(): ParticipantDraft {
  return {
    id: createParticipantId(),
    name: "",
    email: "",
    courseSlugs: [],
  };
}

function adjustParticipants(
  prev: ParticipantDraft[],
  totalSeats: number,
  allowedSlugs: Set<string>
): ParticipantDraft[] {
  let next = prev.map((participant) => ({
    ...participant,
    courseSlugs: participant.courseSlugs.filter((slug) => allowedSlugs.has(slug)),
  }));

  if (totalSeats <= 0) {
    return next.length > 0 ? next : [emptyParticipant()];
  }

  if (next.length < totalSeats) {
    next = [
      ...next,
      ...Array.from({ length: totalSeats - next.length }, () => emptyParticipant()),
    ];
  } else if (next.length > totalSeats) {
    const removable = [...next]
      .map((participant, index) => ({ participant, index }))
      .filter(
        ({ participant }) =>
          !participant.name.trim() &&
          !participant.email.trim() &&
          participant.courseSlugs.length === 0
      )
      .map(({ index }) => index)
      .reverse();

    const removeCount = Math.min(next.length - totalSeats, removable.length);
    if (removeCount > 0) {
      const removeIndexes = new Set(removable.slice(0, removeCount));
      next = next.filter((_, index) => !removeIndexes.has(index));
    }
  }

  return next;
}

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("kurz");

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const selectedSlug =
      preselected === "pozarni"
        ? "pozarni-zamestnanec"
        : preselected === "bozp"
          ? "bozp-zamestnanec"
          : preselected;
    for (const item of orderCatalog) {
      initial[item.courseSlug] = selectedSlug === item.courseSlug ? 1 : 0;
    }
    return initial;
  });

  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    emptyParticipant(),
  ]);
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

  const totalSeats = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const assignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of lines) {
      counts.set(line.courseSlug, 0);
    }
    for (const participant of participants) {
      for (const slug of participant.courseSlugs) {
        if (counts.has(slug)) {
          counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
      }
    }
    return counts;
  }, [lines, participants]);

  function setQty(slug: string, qty: number) {
    const nextQty = Math.max(0, Math.min(99, qty));
    const nextQuantities = { ...quantities, [slug]: nextQty };
    const nextTotalSeats = orderCatalog.reduce(
      (sum, item) => sum + (nextQuantities[item.courseSlug] ?? 0),
      0
    );
    const allowedSlugs = new Set(
      orderCatalog
        .filter((item) => (nextQuantities[item.courseSlug] ?? 0) > 0)
        .map((item) => item.courseSlug)
    );

    setQuantities(nextQuantities);
    setParticipants((prev) => adjustParticipants(prev, nextTotalSeats, allowedSlugs));
  }

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

  function toggleCourse(participantId: string, courseSlug: string) {
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
    if (participants.length >= Math.max(totalSeats, 1)) return;
    setParticipants((prev) => [...prev, emptyParticipant()]);
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => {
      if (prev.length <= 1) {
        return [emptyParticipant()];
      }
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
          email: email.trim() || first.email,
        },
        ...rest,
      ];
    });
  }

  function activeParticipants() {
    return participants.filter(
      (participant) =>
        participant.name.trim() ||
        participant.email.trim() ||
        participant.courseSlugs.length > 0
    );
  }

  function buildPayload() {
    const participantsPayload = activeParticipants().map((participant) => ({
      name: participant.name,
      email: participant.email,
      courseSlugs: participant.courseSlugs,
    }));

    return {
      companyName,
      ico: ico || undefined,
      contactName,
      email,
      phone: phone || undefined,
      lines,
      participants: participantsPayload,
    };
  }

  function clientValidateParticipants(): string | null {
    const result = validateOrderParticipants(
      activeParticipants().map((participant) => ({
        name: participant.name,
        email: participant.email,
        courseSlugs: participant.courseSlugs,
      })),
      lines
    );
    return result.ok ? null : result.error;
  }

  async function handleBankTransfer(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = clientValidateParticipants();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoadingBank(true);

    try {
      const res = await fetch("/api/orders/create-bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
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

    const validationError = clientValidateParticipants();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/gopay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
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
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">BOZP a požární ochrana:</span> zvlášť objednejte školení
          pro řadové zaměstnance (149 Kč) a pro vedoucí (350 Kč). U vedoucího je test na{" "}
          <span className="font-semibold">20 otázek</span> a po absolvování může vedoucí následně
          školit své zaměstnance. U BOZP i PO má zaměstnanec certifikát na 2 roky a vedoucí na
          3 roky.
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
                  {item.audience === "vedouci" ? (
                    <span className="mt-1 block text-xs text-brand-dark">
                      Test 20 otázek · certifikát 3 roky · po absolvování může školit své
                      zaměstnance
                    </span>
                  ) : null}
                  {item.audience === "zamestnanec" ? (
                    <span className="mt-1 block text-xs text-slate-400">
                      Certifikát platný 2 roky
                    </span>
                  ) : null}
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
              Fakturační e-mail *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Pro potvrzení platby. Přihlášení ke školení nastavíte níže u účastníků.
            </p>
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

      {cart && totalSeats > 0 ? (
        <fieldset className="space-y-4">
          <legend className="text-lg font-bold text-slate-900">
            Účastníci a přiřazení školení
          </legend>
          <p className="text-sm text-slate-600">
            Ke každému e-mailu vznikne samostatný přístup do školení. U účastníka zatrhněte školení,
            která má absolvovat. Jedna osoba může mít více školení — počet zatržení u každého kurzu
            musí přesně odpovídat počtu míst výše.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Zbývá přiřadit</p>
            <ul className="mt-2 space-y-1">
              {cart.items.map((item) => {
                const assigned = assignmentCounts.get(item.courseSlug) ?? 0;
                const remaining = item.quantity - assigned;
                return (
                  <li key={item.courseSlug}>
                    {item.name}:{" "}
                    <span
                      className={
                        remaining === 0
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-amber-800"
                      }
                    >
                      {assigned} / {item.quantity}
                      {remaining === 0
                        ? " (hotovo)"
                        : remaining > 0
                          ? ` (zbývá ${remaining})`
                          : ` (přebývá ${Math.abs(remaining)})`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fillFirstFromContact}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Doplnit 1. účastníka z kontaktních údajů
            </button>
            <button
              type="button"
              onClick={addParticipant}
              disabled={participants.length >= totalSeats}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Přidat účastníka
            </button>
          </div>

          <ul className="space-y-4">
            {participants.map((participant, index) => (
              <li
                key={participant.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Účastník {index + 1}
                  </p>
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
                  <div>
                    <label
                      htmlFor={`participant-name-${participant.id}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Jméno a příjmení *
                    </label>
                    <input
                      id={`participant-name-${participant.id}`}
                      value={participant.name}
                      onChange={(e) =>
                        updateParticipant(participant.id, { name: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      autoComplete="name"
                    />
                  </div>
                  <div>
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
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="text-sm font-medium text-slate-700">
                    Přiřazená školení *
                  </legend>
                  <ul className="mt-2 space-y-2">
                    {cart.items.map((item) => {
                      const checked = participant.courseSlugs.includes(item.courseSlug);
                      const assigned = assignmentCounts.get(item.courseSlug) ?? 0;
                      const wouldExceed = !checked && assigned >= item.quantity;
                      return (
                        <li key={item.courseSlug}>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                              checked
                                ? "border-brand bg-brand-tint/40"
                                : "border-slate-200 hover:bg-slate-50"
                            } ${wouldExceed ? "opacity-50" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={checked}
                              disabled={wouldExceed}
                              onChange={() =>
                                toggleCourse(participant.id, item.courseSlug)
                              }
                            />
                            <span>
                              <span className="font-medium text-slate-900">{item.name}</span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {item.quantity} míst v objednávce
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
      ) : null}

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

      <CeskoPlatiKartouBadge variant="light" className="mt-4" />

      <p className="text-xs text-slate-500">
        Odesláním objednávky souhlasíte s{" "}
        <Link href="/obchodni-podminky" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-dark underline">
          obchodními podmínkami
        </Link>{" "}
        a se zpracováním údajů dle{" "}
        <Link href="/ochrana-udaju" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-dark underline">
          ochrany osobních údajů
        </Link>
        .
      </p>

      <p className="text-xs text-slate-500">
        GoPay: karty a online bankovní převody. QR platba: převod na účet{" "}
        <strong>{qrPayment.accountLabel}</strong> ({qrPayment.accountHolder}) – po připsání platby
        vám zašleme přihlašovací údaje pro školení.
      </p>
    </form>
  );
}
