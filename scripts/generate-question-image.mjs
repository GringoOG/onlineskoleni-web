#!/usr/bin/env node
/**
 * Vygeneruje jednu ilustraci otázky přes Replicate.
 * Usage: node scripts/generate-question-image.mjs <courseSlug> <questionId>
 */
import "dotenv/config";
import Replicate from "replicate";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { setHrbekTheoryChapters, buildSlideCopy } from "./hrbek-slide-content.mjs";
import { buildPromptForQuestion } from "./lib/question-image-prompt.mjs";
import { resolveQuestionImageId } from "./lib/question-image-id.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/hrbek-learning/images/questions");
const MANIFEST = path.join(ROOT, "public/hrbek-learning/question-images.js");
const FLUX_MODEL = process.env.REPLICATE_FLUX_MODEL?.trim() || "black-forest-labs/flux-dev";

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

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

async function main() {
  const [courseSlug, questionId] = process.argv.slice(2);
  if (!courseSlug || !questionId) {
    console.error("Usage: node scripts/generate-question-image.mjs <courseSlug> <questionId>");
    process.exit(1);
  }

  const { readdirSync } = await import("node:fs");
  const quizDir = path.join(ROOT, "content/quizzes");
  let question = null;
  for (const file of readdirSync(quizDir).filter((f) => f.endsWith(".json"))) {
    const quiz = JSON.parse(readFileSync(path.join(quizDir, file), "utf8"));
    if (quiz.courseSlug !== courseSlug) continue;
    const found = quiz.questions?.find((q) => q.id === questionId);
    if (found) {
      question = found;
      break;
    }
  }
  if (!question) {
    throw new Error(`Question ${courseSlug}:${questionId} not found`);
  }

  const theory = JSON.parse(readFileSync(path.join(ROOT, "content/theory/hrbek.json"), "utf8"));
  setHrbekTheoryChapters(theory.chapters);
  const copy = buildSlideCopy(courseSlug, question);

  const ctx = {
    id: questionId,
    course: courseSlug,
    heading: copy.heading,
    theoryText: copy.paragraphs.join(" "),
    questionText: question.text,
    correctAnswer: question.options[question.correctIndex] ?? "",
    combined: normalize(
      [copy.heading, copy.paragraphs.join(" "), question.text, question.options[question.correctIndex]].join(" ")
    ),
  };

  const imageId = resolveQuestionImageId(courseSlug, questionId);
  const prompt = buildPromptForQuestion(ctx);
  console.log(`Image ID: ${imageId}`);
  console.log(`Prompt: ${prompt.slice(0, 220)}…`);

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
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

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, `${imageId}.png`), buf);
  console.log(`Saved ${imageId}.png (${buf.length} bytes)`);

  const manifestSrc = readFileSync(MANIFEST, "utf8");
  const match = manifestSrc.match(/export const QUESTION_IMAGE_IDS = new Set\(([\s\S]*?)\);/);
  if (!match) throw new Error("Cannot parse manifest");
  const allIds = new Set(JSON.parse(match[1]));
  allIds.add(imageId);
  const sorted = [...allIds].sort((a, b) => a.localeCompare(b, "cs"));
  writeFileSync(
    MANIFEST,
    `/** Automaticky generováno – node scripts/install-question-images.mjs */\nexport const QUESTION_IMAGE_IDS = new Set(${JSON.stringify(sorted, null, 2)});\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
