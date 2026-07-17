"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  computeCart,
  formatPriceFromHalere,
  MAX_COURSE_QUANTITY,
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

function emptyParticipant(courseSlugs: string[] = []): ParticipantDraft {
  return {
    id: createParticipantId(),
    name: "",
    email: "",
    courseSlugs: [...courseSlugs],
  };
}

function resizeParticipants(
  prev: ParticipantDraft[],
  count: number,
  defaultCourseSlugs: string[]
): ParticipantDraft[] {
  if (count <= 0) return [];

  if (prev.length === count) return prev;

  if (prev.length < count) {
    return [
      ...prev,
      ...Array.from({ length: count - prev.length }, () =>
        emptyParticipant(defaultCourseSlugs)
      ),
    ];
  }

  return prev.slice(0, count);
}

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("kurz");

  const preselectedSlug =
    preselected === "pozarni"
      ? "pozarni-zamestnanec"
      : preselected === "bozp"
        ? "bozp-zamestnanec"
        : preselected && orderCatalog.some((item) => item.courseSlug === preselected)
          ? preselected
          : null;

  const [studentCount, setStudentCount] = useState(() => (preselectedSlug ? 1 : 1));
  const [participants, setParticipants] = useState<ParticipantDraft[]>(() => [
    emptyParticipant(preselectedSlug ? [preselectedSlug] : []),
  ]);

  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

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

  const cart = useMemo(() => {
    if (lines.length === 0) return null;
    const result = computeCart(lines);
    return "error" in result ? null : result;
  }, [lines]);

  function handleStudentCountChange(raw: number) {
    const next = Math.max(
      0,
      Math.min(MAX_COURSE_QUANTITY, Number.isFinite(raw) ? raw : 0)
    );
    setStudentCount(next);
    setParticipants((prev) =>
      resizeParticipants(prev, next, preselectedSlug ? [preselectedSlug] : [])
    );
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
        if (!has) {
          const currentCount = prev.reduce(
            (sum, row) => sum + (row.courseSlugs.includes(courseSlug) ? 1 : 0),
            0
          );
          if (currentCount >= MAX_COURSE_QUANTITY) {
            return participant;
          }
        }
        return {
          ...participant,
          courseSlugs: has
            ? participant.courseSlugs.filter((slug) => slug !== courseSlug)
            : [...participant.courseSlugs, courseSlug],
        };
      })
    );
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

  function buildPayload() {
    return {
      companyName,
      ico: ico || undefined,
      contactName,
      email,
      phone: phone || undefined,
      lines,
      participants: participants.map((participant) => ({
        name: participant.name,
        email: participant.email,
        courseSlugs: participant.courseSlugs,
      })),
    };
  }

  function clientValidateParticipants(): string | null {
    if (studentCount < 1) {
      return "Zadejte počet studentů (alespoň 1).";
    }
    if (studentCount > MAX_COURSE_QUANTITY) {
      return `Maximální počet studentů je ${MAX_COURSE_QUANTITY}.`;
    }
    if (participants.length !== studentCount) {
      return "Počet kartiček účastníků neodpovídá počtu studentů.";
    }
    for (const [slug, quantity] of assignmentCounts) {
      if (quantity > MAX_COURSE_QUANTITY) {
        const name =
          orderCatalog.find((item) => item.courseSlug === slug)?.name ?? slug;
        return `U kurzu „${name}“ je maximum ${MAX_COURSE_QUANTITY} osob.`;
      }
    }
    const result = validateOrderParticipants(
      participants.map((participant) => ({
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
        <legend className="sr-only">Kurzy a počet studentů</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Kurzy a počet zaměstnanců
          </h2>
          <div className="flex items-center gap-3">
            <label
              htmlFor="studentCount"
              className="text-sm font-semibold text-slate-800"
            >
              Počet studentů
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-slate-300 text-lg hover:bg-slate-50"
                onClick={() => handleStudentCountChange(studentCount - 1)}
                aria-label="Méně studentů"
              >
                −
              </button>
              <input
                id="studentCount"
                type="number"
                min={0}
                max={MAX_COURSE_QUANTITY}
                value={studentCount}
                onChange={(e) =>
                  handleStudentCountChange(parseInt(e.target.value, 10) || 0)
                }
                className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm font-semibold"
              />
              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-slate-300 text-lg hover:bg-slate-50"
                onClick={() => handleStudentCountChange(studentCount + 1)}
                aria-label="Více studentů"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Nejdřív zvolte počet studentů (max. {MAX_COURSE_QUANTITY}). Pod přehledem kurzů se
          zobrazí kartičky účastníků — u každého vyplníte jméno, e-mail a zatrhnete školení. U
          jednoho kurzu jde vybrat nejvýše {MAX_COURSE_QUANTITY} osob. Ceny jsou bez DPH. Při
          10–49 osobách sleva 10 %, při 50–99 osobách sleva 15 %.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">BOZP a požární ochrana:</span> u každého účastníka
          vyberte správnou variantu —{" "}
          <span className="font-semibold">zaměstnanec (149 Kč)</span> nebo{" "}
          <span className="font-semibold">vedoucí (350 Kč)</span>. Obě varianty můžete mít v jedné
          objednávce. U vedoucího je test na <span className="font-semibold">20 otázek</span> a po
          absolvování může školit své zaměstnance. Certifikát: zaměstnanec 2 roky, vedoucí 3 roky.
        </p>

        <ul className="mt-4 space-y-3">
          {orderCatalog.map((item) => {
            const assigned = assignmentCounts.get(item.courseSlug) ?? 0;
            return (
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
                <p className="text-sm font-semibold text-slate-700">
                  Vybráno: {assigned} / {MAX_COURSE_QUANTITY}
                </p>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {studentCount > 0 ? (
        <fieldset className="space-y-4">
          <legend className="text-lg font-bold text-slate-900">Účastníci školení</legend>
          <p className="text-sm text-slate-600">
            Podle počtu studentů ({studentCount}) se zobrazují kartičky. Ke každému e-mailu vznikne
            samostatný přístup — zatrhněte školení, která má osoba absolvovat.
          </p>

          <button
            type="button"
            onClick={fillFirstFromContact}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Doplnit 1. účastníka z fakturačních údajů
          </button>

          <ul className="space-y-4">
            {participants.map((participant, index) => (
              <li
                key={participant.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Účastník {index + 1}
                </p>

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
                    {orderCatalog.map((item) => {
                      const checked = participant.courseSlugs.includes(item.courseSlug);
                      const assigned = assignmentCounts.get(item.courseSlug) ?? 0;
                      const wouldExceed = !checked && assigned >= MAX_COURSE_QUANTITY;
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
                                {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba · max.{" "}
                                {MAX_COURSE_QUANTITY}
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
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          Nastavte počet studentů výše — pak se zde zobrazí kartičky Účastník 1, 2, …
        </p>
      )}

      {cart ? (
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
      ) : null}

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
              Pro potvrzení platby. Přihlášení ke školení nastavíte u účastníků výše.
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

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={loading || loadingBank || !cart || studentCount < 1}
          className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Přesměrování na GoPay…" : "Zaplatit přes GoPay"}
        </button>
        <button
          type="button"
          disabled={loading || loadingBank || !cart || studentCount < 1}
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
