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
import { parseParticipants, type ParsedParticipant } from "@/lib/admin/parse-participants";
import { qrPayment } from "@/lib/content";
import { CeskoPlatiKartouBadge } from "@/components/CeskoPlatiKartouBadge";
import { validateOrderParticipants } from "@/lib/order-participants";

type CourseMode = "same" | "different";

type ParticipantDraft = {
  id: string;
  name: string;
  email: string;
  courseSlugs: string[];
};

function createParticipantId() {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function toDraft(
  participant: ParsedParticipant,
  courseSlugs: string[],
  existingId?: string
): ParticipantDraft {
  return {
    id: existingId ?? createParticipantId(),
    name: participant.name,
    email: participant.email,
    courseSlugs: [...courseSlugs],
  };
}

function CourseChecklist({
  selected,
  onToggle,
  assignmentCounts,
}: {
  selected: string[];
  onToggle: (courseSlug: string) => void;
  assignmentCounts: Map<string, number>;
}) {
  return (
    <ul className="mt-2 space-y-2">
      {orderCatalog.map((item) => {
        const checked = selected.includes(item.courseSlug);
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
                onChange={() => onToggle(item.courseSlug)}
              />
              <span>
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {formatPriceFromHalere(item.pricePerPersonHalere)} / osoba
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
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

  const [bulkPaste, setBulkPaste] = useState("");
  const [sharedCourseSlugs, setSharedCourseSlugs] = useState<string[]>(() =>
    preselectedSlug ? [preselectedSlug] : []
  );
  const [courseMode, setCourseMode] = useState<CourseMode | null>(null);
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  const parsedBulk = useMemo(() => parseParticipants(bulkPaste), [bulkPaste]);
  const parsedPeople = parsedBulk.participants;
  const personCount = parsedPeople.length;
  const needsCourseModeChoice = personCount >= 2;
  const effectiveCourseMode: CourseMode | null =
    personCount === 0 ? null : personCount === 1 ? "same" : courseMode;

  const activeParticipants = useMemo(() => {
    if (personCount === 0 || !effectiveCourseMode) return [];
    if (effectiveCourseMode === "same") {
      return parsedPeople.map((person) => toDraft(person, sharedCourseSlugs));
    }
    return participants;
  }, [
    personCount,
    effectiveCourseMode,
    parsedPeople,
    sharedCourseSlugs,
    participants,
  ]);

  const assignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const participant of activeParticipants) {
      for (const slug of participant.courseSlugs) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    return counts;
  }, [activeParticipants]);

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

  function rebuildDifferentParticipants(
    people: ParsedParticipant[],
    previous: ParticipantDraft[],
    fallbackCourses: string[]
  ) {
    const byEmail = new Map(
      previous.map((participant) => [participant.email.toLowerCase(), participant])
    );
    return people.map((person) => {
      const existing = byEmail.get(person.email.toLowerCase());
      return toDraft(
        person,
        existing?.courseSlugs.length ? existing.courseSlugs : fallbackCourses,
        existing?.id
      );
    });
  }

  function handleBulkPasteChange(value: string) {
    setBulkPaste(value);
    setError("");
    const parsed = parseParticipants(value);
    const people = parsed.participants;

    if (people.length <= 1) {
      setCourseMode(null);
      setParticipants([]);
      return;
    }

    if (courseMode === "different") {
      setParticipants((prev) =>
        rebuildDifferentParticipants(people, prev, sharedCourseSlugs)
      );
    }
  }

  function selectCourseMode(mode: CourseMode) {
    setCourseMode(mode);
    setError("");
    if (mode === "different") {
      setParticipants(
        rebuildDifferentParticipants(parsedPeople, participants, sharedCourseSlugs)
      );
    } else {
      setParticipants([]);
    }
  }

  function toggleSharedCourse(courseSlug: string) {
    setSharedCourseSlugs((prev) => {
      const has = prev.includes(courseSlug);
      if (!has && personCount > MAX_COURSE_QUANTITY) {
        return prev;
      }
      return has
        ? prev.filter((slug) => slug !== courseSlug)
        : [...prev, courseSlug];
    });
  }

  function toggleParticipantCourse(participantId: string, courseSlug: string) {
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

  function fillBulkFromContact() {
    const name = contactName.trim();
    const contactEmail = email.trim();
    if (!name || !contactEmail) {
      setError("Nejdřív vyplňte kontaktní osobu a fakturační e-mail níže.");
      return;
    }
    const line = `${name}, ${contactEmail}`;
    const next = bulkPaste.trim() ? `${bulkPaste.trim()}\n${line}` : line;
    handleBulkPasteChange(next);
  }

  function buildPayload() {
    return {
      companyName,
      ico: ico || undefined,
      contactName,
      email,
      phone: phone || undefined,
      lines,
      participants: activeParticipants.map((participant) => ({
        name: participant.name,
        email: participant.email,
        courseSlugs: participant.courseSlugs,
      })),
    };
  }

  function clientValidateParticipants(): string | null {
    if (parsedBulk.errors.length > 0) {
      return parsedBulk.errors.join(" ");
    }
    if (personCount === 0) {
      return "Vložte alespoň jednoho účastníka (Jméno Příjmení, email@firma.cz).";
    }
    if (personCount > MAX_COURSE_QUANTITY) {
      return `Maximální počet účastníků je ${MAX_COURSE_QUANTITY}.`;
    }
    if (needsCourseModeChoice && !courseMode) {
      return "Vyberte, zda mají všechny osoby stejné školení, nebo různé školení.";
    }
    for (const [slug, quantity] of assignmentCounts) {
      if (quantity > MAX_COURSE_QUANTITY) {
        const name =
          orderCatalog.find((item) => item.courseSlug === slug)?.name ?? slug;
        return `U kurzu „${name}“ je maximum ${MAX_COURSE_QUANTITY} osob.`;
      }
    }
    const result = validateOrderParticipants(
      activeParticipants.map((participant) => ({
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

  const showSharedCourses =
    personCount >= 1 &&
    (effectiveCourseMode === "same" || personCount === 1);
  const showDifferentParticipants =
    personCount >= 2 && effectiveCourseMode === "different";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Účastníci a školení</legend>
        <p className="text-sm text-slate-600">
          Nejdřív vložte jména a e-maily. Po prvním řádku zvolíte školení. Od druhého řádku
          zvolíte, zda mají všichni stejná školení, nebo každému zvlášť.
        </p>

        <div className="rounded-xl border-2 border-orange-500 bg-orange-50/40 p-4">
          <label htmlFor="bulkPaste" className="block text-sm font-medium text-slate-800">
            Hromadně vložit jména a e-maily
          </label>
          <p className="mt-1 text-xs text-slate-600">
            Formát:{" "}
            <code className="rounded bg-white px-1">Jméno Příjmení, email@firma.cz</code>
            {" "}(volitelně prefix <code className="rounded bg-white px-1">pan</code> /{" "}
            <code className="rounded bg-white px-1">paní</code>). Jeden účastník na řádek.
          </p>
          <textarea
            id="bulkPaste"
            value={bulkPaste}
            onChange={(e) => handleBulkPasteChange(e.target.value)}
            rows={5}
            placeholder={
              "Jan Novák, jan.novak@firma.cz\nMarie Svobodová, marie@firma.cz"
            }
            className="mt-2 w-full rounded-lg border border-orange-300 bg-white px-3 py-2 font-mono text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          />

          {parsedBulk.errors.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
              {parsedBulk.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {personCount > 0 ? (
            <p className="mt-3 text-sm font-medium text-slate-800">
              Rozpoznáno osob: {personCount}
            </p>
          ) : null}

          {needsCourseModeChoice ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-800">
                Mají všechny osoby stejné školení?
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 bg-white px-3 py-3 text-sm ${
                    courseMode === "same"
                      ? "border-orange-500"
                      : "border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="courseMode"
                    className="mt-0.5"
                    checked={courseMode === "same"}
                    onChange={() => selectCourseMode("same")}
                  />
                  <span>
                    <span className="font-semibold text-slate-900">
                      Všechny osoby MAJÍ stejné školení
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Zobrazí se jeden společný seznam školení pro všechny.
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 bg-white px-3 py-3 text-sm ${
                    courseMode === "different"
                      ? "border-orange-500"
                      : "border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="courseMode"
                    className="mt-0.5"
                    checked={courseMode === "different"}
                    onChange={() => selectCourseMode("different")}
                  />
                  <span>
                    <span className="font-semibold text-slate-900">
                      Všechny osoby NEMAJÍ stejné školení
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Vytvoří se kartičky účastníků s vyplněnými jmény a školení u každého zvlášť.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {showSharedCourses ? (
            <div className="mt-4 rounded-lg border border-orange-200 bg-white p-3">
              <p className="text-sm font-medium text-slate-800">
                {personCount === 1
                  ? "Školení pro tohoto účastníka *"
                  : "Společná školení pro všechny osoby *"}
              </p>
              <CourseChecklist
                selected={sharedCourseSlugs}
                onToggle={toggleSharedCourse}
                assignmentCounts={assignmentCounts}
              />
            </div>
          ) : null}
        </div>

        {showDifferentParticipants ? (
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
                        setParticipants((prev) =>
                          prev.map((row) =>
                            row.id === participant.id
                              ? { ...row, name: e.target.value }
                              : row
                          )
                        )
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
                        setParticipants((prev) =>
                          prev.map((row) =>
                            row.id === participant.id
                              ? { ...row, email: e.target.value }
                              : row
                          )
                        )
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
                  <CourseChecklist
                    selected={participant.courseSlugs}
                    onToggle={(courseSlug) =>
                      toggleParticipantCourse(participant.id, courseSlug)
                    }
                    assignmentCounts={assignmentCounts}
                  />
                </fieldset>
              </li>
            ))}
          </ul>
        ) : null}

        {personCount === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Vložte jména a e-maily výše — pak se zde (nebo ve společném seznamu) přiřadí školení.
          </p>
        ) : null}
      </fieldset>

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
          disabled={loading || loadingBank || !cart || personCount < 1}
          className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Přesměrování na GoPay…" : "Zaplatit přes GoPay"}
        </button>
        <button
          type="button"
          disabled={loading || loadingBank || !cart || personCount < 1}
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
