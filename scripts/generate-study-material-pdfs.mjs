#!/usr/bin/env node
/**
 * PDF studijní materiály po kategoriích – učební texty + všechny otázky se správnými odpověďmi.
 * Usage: node scripts/generate-study-material-pdfs.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import { PdfWriter } from "./lib/pdf-document-writer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const QUIZ_DIR = path.join(ROOT, "content/quizzes");
const DATA_PATH = path.join(ROOT, "public/hrbek-learning/data.json");
const OUTPUT_DIR = path.join(ROOT, "content/study-materials");
const FONT_DIR = path.join(ROOT, "node_modules/dejavu-fonts-ttf/ttf");

const QUIZ_FILES_BY_SLUG = {
  bozp: [
    "bozp-demo.json",
    "bozp-oficialni-zamestnanec.json",
    "bozp-oficialni-vedouci.json",
  ],
  pozarni: [
    "pozarni-demo.json",
    "pozarni-oficialni-zamestnanec.json",
    "pozarni-oficialni-vedouci.json",
  ],
  ridici: ["ridici-demo.json", "ridici-oficialni.json"],
  bremena: ["bremena-demo.json", "bremena-oficialni.json"],
  gdpr: ["gdpr-demo.json", "gdpr-oficialni.json"],
  ergonomie: ["ergonomie-demo.json", "ergonomie-oficialni.json"],
};

async function loadQuiz(fileName) {
  return JSON.parse(await readFile(path.join(QUIZ_DIR, fileName), "utf8"));
}

function collectQuestions(category) {
  const byId = new Map();

  const addQuestion = (question) => {
    if (!question?.id || !Array.isArray(question.options)) {
      return;
    }
    if (!byId.has(question.id)) {
      byId.set(question.id, question);
    }
  };

  for (const slide of category.slides ?? []) {
    for (const question of slide.checkQuestions ?? []) {
      addQuestion(question);
    }
  }

  for (const question of category.finalTest?.pool ?? []) {
    addQuestion(question);
  }

  return byId;
}

async function buildCategoryPdf(category, fonts) {
  const { regularBytes, boldBytes } = fonts;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontRegular = await pdfDoc.embedFont(regularBytes);
  const fontBold = await pdfDoc.embedFont(boldBytes);
  const writer = new PdfWriter(pdfDoc, fontRegular, fontBold);

  const generated = new Date().toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const questionsById = collectQuestions(category);

  for (const fileName of QUIZ_FILES_BY_SLUG[category.slug] ?? []) {
    const quiz = await loadQuiz(fileName);
    for (const question of quiz.questions) {
      if (!questionsById.has(question.id)) {
        questionsById.set(question.id, question);
      }
    }
  }

  const questions = [...questionsById.values()];

  writer.title(`${category.shortTitle} – ${category.title}`);
  writer.subtitle(
    `Studijní materiál pro online školení. Učební texty z microlearningu a kompletní přehled otázek se správnými odpověďmi (✓). Vygenerováno ${generated}.`
  );

  writer.sectionHeading(
    "Učební texty",
    `${category.slides.length} lekcí · doplněk ke studijním kartám v microlearningu`
  );

  category.slides.forEach((slide, index) => {
    writer.lessonBlock(index + 1, slide.heading, slide.paragraphs ?? []);
  });

  writer.sectionHeading(
    "Otázky a správné odpovědi",
    `Celkem ${questions.length} otázek · správná odpověď je označena ✓`
  );

  questions.forEach((question, index) => {
    writer.questionBlock(index + 1, question);
  });

  return pdfDoc.save();
}

async function main() {
  const [regularBytes, boldBytes, dataRaw] = await Promise.all([
    readFile(path.join(FONT_DIR, "DejaVuSans.ttf")),
    readFile(path.join(FONT_DIR, "DejaVuSans-Bold.ttf")),
    readFile(DATA_PATH, "utf8"),
  ]);

  const data = JSON.parse(dataRaw);
  await mkdir(OUTPUT_DIR, { recursive: true });

  const fonts = { regularBytes, boldBytes };

  for (const category of data.categories) {
    const pdfBytes = await buildCategoryPdf(category, fonts);
    const outputPath = path.join(OUTPUT_DIR, `studijni-material-${category.slug}.pdf`);
    await writeFile(outputPath, pdfBytes);
    console.log(`✓ ${category.shortTitle}: ${outputPath}`);
  }

  console.log(`\nHotovo – ${data.categories.length} PDF v ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
