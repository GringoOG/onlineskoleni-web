export type CzechSalutation = "pan" | "pani";

/** Odvodí pane/paní z příjmení (typicky -ová = paní). */
export function inferCzechSalutation(fullName: string): CzechSalutation {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const surname = parts[parts.length - 1] ?? "";
  const lower = surname.toLowerCase();

  if (lower.endsWith("ová") || lower.endsWith("ova")) {
    return "pani";
  }

  return "pan";
}

function extractSurname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? fullName.trim();
}

/** Oslovení do e-mailu, např. „Dobrý den, pane Novák,“ / „Dobrý den, paní Nováková,“ */
export function formatCzechEmailGreeting(
  fullName: string,
  salutation?: CzechSalutation
): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return "Dobrý den,";
  }

  const title = salutation ?? inferCzechSalutation(trimmed);
  const surname = extractSurname(trimmed);

  if (title === "pani") {
    return `Dobrý den, paní ${surname},`;
  }

  return `Dobrý den, pane ${surname},`;
}
