"use client";

import { useMemo, useState } from "react";
import {
  computeCart,
  formatPriceFromHalere,
  getBulkDiscountPercent,
  orderCatalog,
} from "@/lib/order-catalog";
import { parseParticipants, type ParsedParticipant } from "@/lib/admin/parse-participants";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";

type PaymentMethod = "INVOICE" | "CASH";
type DiscountMode = "auto" | "0" | "10" | "15";
type CourseMode = "same" | "different";

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

function toDraft(
  participant: ParsedParticipant,
  courseSlugs: string[],
  existingId?: string
): ParticipantDraft {
  return {
    id: existingId ?? createParticipantId(),
    name: participant.name,
    email: participant.email,
    salutation: (participant.salutation ?? "") as "" | "pan" | "pani",
    courseSlugs: [...courseSlugs],
  };
}

function CourseChecklist({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (courseSlug: string) => void;
}) {
  return (
    <ul className="mt-2 space-y-2">
      {orderCatalog.map((item) => {
        const checked = selected.includes(item.courseSlug);
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
                onChange={() => onToggle(item.courseSlug)}
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
  );
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
  const [bulkPaste, setBulkPaste] = useState("");
  const [sharedCourseSlugs, setSharedCourseSlugs] = useState<string[]>(["bozp-zamestnanec"]);
  const [courseMode, setCourseMode] = useState<CourseMode | null>(null);
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

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

  const seatCount = activeParticipants.length;

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

  const totalSeatsForDiscount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const autoDiscount = getBulkDiscountPercent(Math.max(totalSeatsForDiscount, 1));

  const cartResult = useMemo(() => {
    if (lines.length === 0) {
      return { error: "Vyberte alespoň jedno školení pro účastníky." } as const;
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
    setSharedCourseSlugs((prev) =>
      prev.includes(courseSlug)
        ? prev.filter((slug) => slug !== courseSlug)
        : [...prev, courseSlug]
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

  function fillBulkFromContact() {
    const name = contactName.trim();
    const email = contactEmail.trim();
    if (!name || !email) {
      setError("Nejdřív vyplňte jméno kontaktu a e-mail pro potvrzení výše.");
      return;
    }
    const prefix =
      contactSalutation === "pan"
        ? "pan "
        : contactSalutation === "pani"
          ? "paní "
          : "";
    const line = `${prefix}${name}, ${email}`;
    const next = bulkPaste.trim() ? `${bulkPaste.trim()}\n${line}` : line;
    handleBulkPasteChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (parsedBulk.errors.length > 0) {
      setError(parsedBulk.errors.join(" "));
      return;
    }

    if (personCount === 0) {
      setError("Vložte alespoň jednoho účastníka (Jméno Příjmení, email@firma.cz).");
      return;
    }

    if (needsCourseModeChoice && !courseMode) {
      setError(
        "Vyberte, zda mají všechny osoby stejné školení, nebo různé školení."
      );
      return;
    }

    const toSubmit = activeParticipants;
    for (let index = 0; index < toSubmit.length; index += 1) {
      const participant = toSubmit[index];
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
          participants: toSubmit.map((participant) => ({
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
      setBulkPaste("");
      setCourseMode(null);
      setParticipants([]);
      setSharedCourseSlugs(["bozp-zamestnanec"]);
      setAdminNote("");
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
              Jméno a příjmení *
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
              E-mail pro potvrzení objednávky *
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-slate-500">
              Sem přijde jen děkovný / potvrzovací e-mail. Přihlášení ke školení nastavíte níže u
              účastníků (může být i stejný e-mail).
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
              className={inputClassName}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">
          Účastníci a přiřazení školení
        </legend>
        <p className="text-sm text-slate-600">
          Nejdřív vložte jména a e-maily. Po prvním řádku zvolíte školení. Od druhého řádku
          zvolíte, zda mají všichni stejná školení, nebo každému zvlášť.
        </p>

        <div className="rounded-xl border-2 border-orange-500 bg-orange-50/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <label htmlFor="bulkPaste" className="block text-sm font-medium text-slate-800">
              Hromadně vložit jména a e-maily
            </label>
            <button
              type="button"
              onClick={fillBulkFromContact}
              className="rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-orange-50"
            >
              Doplnit řádek z kontaktu
            </button>
          </div>
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
                      Vytvoří se účastníci s vyplněnými jmény a školení u každého zvlášť.
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
                  <CourseChecklist
                    selected={participant.courseSlugs}
                    onToggle={(courseSlug) =>
                      toggleParticipantCourse(participant.id, courseSlug)
                    }
                  />
                </fieldset>
              </li>
            ))}
          </ul>
        ) : null}

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

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Sleva dle ceníku</legend>
        <BulkDiscountBanner variant="compact" />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Účastníků: <strong>{seatCount || "—"}</strong>
            {" · "}
            míst ve školeních: <strong>{totalSeatsForDiscount || "—"}</strong>
            {discountMode === "auto" && autoDiscount === "contact" ? (
              <span className="ml-2 text-amber-700">
                (100+ míst – individuální nabídka, zvolte slevu ručně)
              </span>
            ) : (
              <span className="ml-2">
                → sleva na celou objednávku:{" "}
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

      {cartError && personCount > 0 && effectiveCourseMode ? (
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
          loading ||
          !cart ||
          lines.length === 0 ||
          parsedBulk.errors.length > 0 ||
          (needsCourseModeChoice && !courseMode)
        }
        className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Vytvářím objednávku a odesílám přístupy…" : "Vytvořit a aktivovat přístup"}
      </button>
    </form>
  );
}
