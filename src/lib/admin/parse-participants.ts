export interface ParsedParticipant {
  name: string;
  email: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseLine(line: string): ParsedParticipant | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const name = trimmed.slice(0, commaIndex).trim();
  const email = trimmed.slice(commaIndex + 1).trim().toLowerCase();

  if (!name || !EMAIL_REGEX.test(email)) {
    return null;
  }

  return { name, email };
}

/** Parsuje textarea „Jméno Příjmení, email@…“ – jeden zaměstnanec na řádek. */
export function parseParticipants(raw: string): {
  participants: ParsedParticipant[];
  errors: string[];
} {
  const lines = raw.split(/\r?\n/);
  const participants: ParsedParticipant[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }

    const parsed = parseLine(line);
    if (!parsed) {
      errors.push(`Řádek ${index + 1}: očekáván formát „Jméno Příjmení, email@domena.cz“.`);
      return;
    }

    if (seenEmails.has(parsed.email)) {
      errors.push(`Řádek ${index + 1}: e-mail ${parsed.email} je uveden vícekrát.`);
      return;
    }

    seenEmails.add(parsed.email);
    participants.push(parsed);
  });

  return { participants, errors };
}
