#!/usr/bin/env node
/**
 * Generuje JSON s AI prompty pro každou otázku v učebních textech (205 unikátních ID).
 * Usage: node scripts/generate-question-image-prompts.mjs
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectQuestionPrompts } from "./lib/question-image-prompt.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "content/theory/ai-image-prompts.json");

async function main() {
  const data = await collectQuestionPrompts();
  await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(`JSON uloženo: ${OUTPUT}`);
  console.log(`Celkem otázek: ${data.totalQuestions}`);
  for (const course of data.courses) {
    console.log(`  ${course.id}: ${course.questionCount}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
