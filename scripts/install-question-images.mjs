#!/usr/bin/env node
/**
 * Zkopíruje vygenerované ilustrace (soubory ID-uuid.png) do public/hrbek-learning.
 * Výstup: public/hrbek-learning/images/questions/{id}.png
 *         public/hrbek-learning/question-images.js
 */
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(
  process.env.HOME ?? "",
  ".cursor/projects/Users-mircekspace-muj-projekt-onlineskoleni-web/assets"
);
const OUT_DIR = path.join(ROOT, "public/hrbek-learning/images/questions");
const MANIFEST_PATH = path.join(ROOT, "public/hrbek-learning/question-images.js");

const UUID_SUFFIX = /^(.+)-[a-f0-9-]{36}\.png$/i;

function extractQuestionId(fileName) {
  const match = fileName.match(UUID_SUFFIX);
  if (!match) return null;
  const id = match[1];
  if (id.startsWith("Sni") || id.includes("___") || id === "image" || id === "demo" || id === "off") {
    return null;
  }
  return id;
}

async function main() {
  const sourceDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;
  const entries = await readdir(sourceDir);
  const pngFiles = entries.filter((name) => name.toLowerCase().endsWith(".png"));

  await mkdir(OUT_DIR, { recursive: true });

  const installed = new Map();
  const existing = await readdir(OUT_DIR).catch(() => []);
  for (const fileName of existing) {
    if (fileName.endsWith(".png")) {
      installed.set(fileName.replace(/\.png$/i, ""), fileName);
    }
  }

  for (const fileName of pngFiles) {
    const questionId = extractQuestionId(fileName);
    if (!questionId || installed.has(questionId)) continue;

    const sourcePath = path.join(sourceDir, fileName);
    const targetPath = path.join(OUT_DIR, `${questionId}.png`);
    await cp(sourcePath, targetPath);
    installed.set(questionId, fileName);
  }

  const ids = [...installed.keys()].sort((a, b) => a.localeCompare(b, "cs"));

  const manifest = `/** Automaticky generováno – node scripts/install-question-images.mjs */
export const QUESTION_IMAGE_IDS = new Set(${JSON.stringify(ids, null, 2)});
`;

  await writeFile(MANIFEST_PATH, manifest, "utf8");

  const prompts = JSON.parse(
    await readFile(path.join(ROOT, "content/theory/ai-image-prompts.json"), "utf8")
  );
  const expected = new Set();
  for (const course of prompts.courses) {
    for (const question of course.questions) {
      expected.add(question.id);
    }
  }

  const missing = [...expected].filter((id) => !installed.has(id)).sort((a, b) => a.localeCompare(b, "cs"));

  console.log(`Nainstalováno ${installed.size} obrázků do ${path.relative(ROOT, OUT_DIR)}`);
  if (missing.length > 0) {
    console.log(`Chybí ${missing.length} otázek (zůstanou bez obrázku):`);
    for (const id of missing) {
      console.log(`  - ${id}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
