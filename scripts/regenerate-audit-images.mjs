#!/usr/bin/env node
/**
 * Přegeneruje ilustrace z content/theory/images-to-regenerate.csv
 * Usage: node scripts/regenerate-audit-images.mjs [--skip id1,id2] [--only id1,id2]
 */
import "dotenv/config";
import Replicate from "replicate";
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "content/theory/images-to-regenerate.csv");
const PROMPTS_PATH = path.join(ROOT, "content/theory/ai-image-prompts.json");
const OUT_DIR = path.join(ROOT, "public/hrbek-learning/images/questions");
const MANIFEST = path.join(ROOT, "public/hrbek-learning/question-images.js");
const LOG_PATH = path.join(ROOT, "content/theory/regenerate-audit-log.txt");
const FLUX_MODEL = process.env.REPLICATE_FLUX_MODEL?.trim() || "black-forest-labs/flux-dev";

const args = process.argv.slice(2);
const skipArg = args.find((a) => a.startsWith("--skip="));
const onlyArg = args.find((a) => a.startsWith("--only="));
const skipIds = new Set(
  (skipArg?.slice("--skip=".length) ?? "demo7,demo8,demo9,q24,q34")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
const onlyIds = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean))
  : null;

function parseCsvIds(csv) {
  const lines = csv.trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const match = line.match(/^"[^"]*","([^"]+)"/);
    if (!match) throw new Error(`Cannot parse CSV line: ${line.slice(0, 80)}`);
    return match[1];
  });
}

function extractUrl(output) {
  if (typeof output === "string" && output.startsWith("http")) return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractUrl(item);
      if (url) return url;
    }
  }
  if (output && typeof output === "object") {
    if (typeof output.url === "function") {
      const u = output.url();
      if (typeof u === "string") return u;
      if (u?.href) return u.href;
    }
    if (typeof output.href === "string") return output.href;
  }
  throw new Error(`No URL in output: ${JSON.stringify(output).slice(0, 200)}`);
}

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  console.log(msg);
  appendFileSync(LOG_PATH, `${msg}\n`);
}

async function generateOne(replicate, id, prompt) {
  const output = await replicate.run(FLUX_MODEL, {
    input: {
      prompt,
      aspect_ratio: "4:3",
      output_format: "png",
      num_outputs: 1,
      go_fast: false,
      num_inference_steps: 28,
    },
  });
  const url = extractUrl(output);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`Suspiciously small file (${buf.length} bytes)`);
  writeFileSync(path.join(OUT_DIR, `${id}.png`), buf);
  return buf.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(LOG_PATH, `--- regenerate audit ${new Date().toISOString()} ---\n`);

  const csvIds = parseCsvIds(readFileSync(CSV_PATH, "utf8"));
  let ids = csvIds.filter((id) => !skipIds.has(id));
  if (onlyIds) ids = ids.filter((id) => onlyIds.has(id));

  const data = JSON.parse(readFileSync(PROMPTS_PATH, "utf8"));
  const promptById = new Map();
  for (const course of data.courses) {
    for (const q of course.questions) promptById.set(q.id, q.prompt);
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const ok = [];
  const failed = [];

  log(`Starting ${ids.length} images (skip: ${[...skipIds].join(", ")})`);

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const prompt = promptById.get(id);
    if (!prompt) {
      log(`SKIP ${id}: no prompt in JSON`);
      failed.push({ id, error: "missing prompt" });
      continue;
    }
    if (prompt.includes("undefined")) {
      log(`WARN ${id}: prompt still contains 'undefined'`);
    }

    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        log(`[${i + 1}/${ids.length}] ${id} attempt ${attempt}...`);
        const bytes = await generateOne(replicate, id, prompt);
        log(`OK ${id} (${bytes} bytes)`);
        ok.push(id);
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        log(`FAIL ${id} attempt ${attempt}: ${lastError}`);
        if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (lastError) failed.push({ id, error: lastError });
  }

  const manifestSrc = readFileSync(MANIFEST, "utf8");
  const match = manifestSrc.match(/export const QUESTION_IMAGE_IDS = new Set\(([\s\S]*?)\);/);
  if (!match) throw new Error("Cannot parse manifest");
  const allIds = new Set(JSON.parse(match[1].replace(/'/g, '"')));
  for (const id of ok) allIds.add(id);
  const sorted = [...allIds].sort((a, b) => a.localeCompare(b, "cs"));
  writeFileSync(
    MANIFEST,
    `/** Automaticky generováno – node scripts/install-question-images.mjs */\nexport const QUESTION_IMAGE_IDS = new Set(${JSON.stringify(sorted, null, 2)});\n`
  );

  log(`Done. OK=${ok.length} FAIL=${failed.length}`);
  if (failed.length) {
    for (const f of failed) log(`  failed: ${f.id} – ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
