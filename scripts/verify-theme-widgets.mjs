#!/usr/bin/env node
/**
 * Ověří, že každý svg_placeholder v data.json má PNG ilustraci nebo je v seznamu známě chybějících.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { QUESTION_IMAGE_IDS } from "../public/hrbek-learning/question-images.js";

const KNOWN_MISSING_IDS = new Set([
  "demo1",
  "demo2",
  "demo3",
  "demo4",
  "demo5",
  "demo6",
  "demo7",
  "demo8",
  "demo9",
  "demo10",
  "demo-r1",
  "demo-r2",
  "demo-r3",
  "demo-r4",
  "demo-r5",
  "demo-r6",
  "demo-r7",
  "demo-r8",
  "demo-r9",
  "demo-r10",
  "demo-b1",
  "demo-b2",
  "demo-b3",
  "demo-b4",
  "demo-b5",
  "demo-b6",
  "demo-b7",
  "demo-b8",
  "demo-b9",
  "demo-b10",
]);

const data = JSON.parse(
  await readFile(path.join(process.cwd(), "public/hrbek-learning/data.json"), "utf8")
);

let missingUnexpected = 0;
let emptyExpected = 0;
let withImage = 0;

for (const category of data.categories) {
  for (const slide of category.slides) {
    const questionId = slide.svg_placeholder.split(":").slice(1).join(":");
    if (QUESTION_IMAGE_IDS.has(questionId)) {
      withImage += 1;
    } else if (KNOWN_MISSING_IDS.has(questionId)) {
      emptyExpected += 1;
    } else {
      console.error("Chybí PNG ilustrace:", slide.svg_placeholder);
      missingUnexpected += 1;
    }
  }
}

if (missingUnexpected > 0) {
  console.error(`Neočekávaně chybí ${missingUnexpected} ilustrací`);
  process.exit(1);
}

console.log(
  `OK: ${withImage} lekcí s PNG, ${emptyExpected} záměrně prázdných, manifest ${QUESTION_IMAGE_IDS.size} souborů`
);
