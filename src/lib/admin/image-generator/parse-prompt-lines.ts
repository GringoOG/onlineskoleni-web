import type { ParsedPromptLine } from "./types";

const MAX_LINES = 200;
const FILE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export interface ParsePromptLinesResult {
  lines: ParsedPromptLine[];
  errors: string[];
}

export function parsePromptLines(rawInput: string): ParsePromptLinesResult {
  const errors: string[] = [];
  const lines: ParsedPromptLine[] = [];
  const seenFileNames = new Set<string>();

  const rows = rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { lines, errors: ["Vložte alespoň jeden řádek ve formátu KÓD | PROMPT."] };
  }

  if (rows.length > MAX_LINES) {
    return {
      lines,
      errors: [`Maximum je ${MAX_LINES} promptů na jedno spuštění.`],
    };
  }

  rows.forEach((row, index) => {
    const lineNumber = index + 1;
    const separatorIndex = row.indexOf("|");

    if (separatorIndex === -1) {
      errors.push(`Řádek ${lineNumber}: chybí oddělovač „|“.`);
      return;
    }

    const fileName = row.slice(0, separatorIndex).trim();
    const prompt = row.slice(separatorIndex + 1).trim();

    if (!fileName) {
      errors.push(`Řádek ${lineNumber}: chybí kód otázky před „|“.`);
      return;
    }

    if (!FILE_NAME_PATTERN.test(fileName)) {
      errors.push(
        `Řádek ${lineNumber}: kód „${fileName}“ obsahuje nepovolené znaky (povoleno: písmena, čísla, . _ -).`
      );
      return;
    }

    if (!prompt) {
      errors.push(`Řádek ${lineNumber}: chybí text promptu za „|“.`);
      return;
    }

    if (seenFileNames.has(fileName)) {
      errors.push(`Řádek ${lineNumber}: kód „${fileName}“ je v dávce duplicitní.`);
      return;
    }

    seenFileNames.add(fileName);
    lines.push({ fileName, prompt });
  });

  return { lines, errors };
}
