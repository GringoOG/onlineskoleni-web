import type { CartLineInput } from "@/lib/order-catalog";

export interface OrderParticipantInput {
  name: string;
  email: string;
  courseSlugs: string[];
}

export interface OrderParticipantsPayload {
  participants: OrderParticipantInput[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeParticipantEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Validuje přiřazení účastníků vůči položkám košíku. */
export function validateOrderParticipants(
  participants: unknown,
  lines: CartLineInput[]
): { ok: true; participants: OrderParticipantInput[] } | { ok: false; error: string } {
  if (!Array.isArray(participants) || participants.length === 0) {
    return {
      ok: false,
      error: "Vyplňte alespoň jednoho účastníka a přiřaďte mu školení.",
    };
  }

  const allowedSlugs = new Set(
    lines.filter((line) => line.quantity > 0).map((line) => line.courseSlug)
  );
  if (allowedSlugs.size === 0) {
    return { ok: false, error: "Vyberte alespoň jeden kurz." };
  }

  const normalized: OrderParticipantInput[] = [];
  const seenEmails = new Set<string>();

  for (let index = 0; index < participants.length; index += 1) {
    const row = participants[index];
    if (!row || typeof row !== "object") {
      return { ok: false, error: `Účastník ${index + 1}: neplatná data.` };
    }

    const name = String((row as { name?: unknown }).name ?? "").trim();
    const email = normalizeParticipantEmail(
      String((row as { email?: unknown }).email ?? "")
    );
    const rawSlugs = (row as { courseSlugs?: unknown }).courseSlugs;
    const courseSlugs = Array.isArray(rawSlugs)
      ? [...new Set(rawSlugs.map((slug) => String(slug)))]
      : [];

    if (!name) {
      return { ok: false, error: `Účastník ${index + 1}: vyplňte jméno.` };
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return { ok: false, error: `Účastník ${index + 1}: neplatný e-mail.` };
    }
    if (seenEmails.has(email)) {
      return {
        ok: false,
        error: `E-mail ${email} je uveden u více účastníků. Každá osoba potřebuje vlastní e-mail.`,
      };
    }
    if (courseSlugs.length === 0) {
      return {
        ok: false,
        error: `Účastník ${index + 1} (${email}): vyberte alespoň jedno školení.`,
      };
    }

    for (const slug of courseSlugs) {
      if (!allowedSlugs.has(slug)) {
        return {
          ok: false,
          error: `Účastník ${email}: školení „${slug}“ není v objednávce.`,
        };
      }
    }

    seenEmails.add(email);
    normalized.push({ name, email, courseSlugs });
  }

  const assignedCounts = new Map<string, number>();
  for (const slug of allowedSlugs) {
    assignedCounts.set(slug, 0);
  }
  for (const participant of normalized) {
    for (const slug of participant.courseSlugs) {
      assignedCounts.set(slug, (assignedCounts.get(slug) ?? 0) + 1);
    }
  }

  for (const line of lines) {
    if (line.quantity <= 0) continue;
    const assigned = assignedCounts.get(line.courseSlug) ?? 0;
    if (assigned !== line.quantity) {
      return {
        ok: false,
        error: `Školení musí být přiřazeno přesně ${line.quantity}× (nyní ${assigned}×). U každého e-mailu zatrhněte příslušná školení.`,
      };
    }
  }

  return { ok: true, participants: normalized };
}

export function parseParticipantsJson(
  value: unknown
): OrderParticipantInput[] | null {
  if (!value || typeof value !== "object") return null;
  const participants = (value as { participants?: unknown }).participants;
  if (!Array.isArray(participants) || participants.length === 0) return null;

  const result: OrderParticipantInput[] = [];
  for (const row of participants) {
    if (!row || typeof row !== "object") continue;
    const name = String((row as { name?: unknown }).name ?? "").trim();
    const email = normalizeParticipantEmail(
      String((row as { email?: unknown }).email ?? "")
    );
    const rawSlugs = (row as { courseSlugs?: unknown }).courseSlugs;
    const courseSlugs = Array.isArray(rawSlugs)
      ? [...new Set(rawSlugs.map((slug) => String(slug)))]
      : [];
    if (!name || !email || courseSlugs.length === 0) continue;
    result.push({ name, email, courseSlugs });
  }

  return result.length > 0 ? result : null;
}
