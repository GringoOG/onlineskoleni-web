#!/usr/bin/env node
/**
 * Ověří, že každý svg_placeholder v data.json má mapování na tema-* widget.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PLACEHOLDER_TO_THEME, THEME_WIDGETS } from "../public/hrbek-learning/theme-widgets.js";

const data = JSON.parse(
  await readFile(path.join(process.cwd(), "public/hrbek-learning/data.json"), "utf8")
);

const placeholders = new Set();
for (const category of data.categories) {
  for (const slide of category.slides) {
    placeholders.add(slide.svg_placeholder);
  }
}

let missing = 0;
for (const key of placeholders) {
  if (!PLACEHOLDER_TO_THEME[key]) {
    console.error("Chybí mapování:", key);
    missing += 1;
  }
}

const themeIds = Object.keys(THEME_WIDGETS);
if (themeIds.length !== 47) {
  console.error(`Očekáváno 47 témat, nalezeno ${themeIds.length}`);
  process.exit(1);
}

if (missing) {
  console.error(`Chybí ${missing} mapování`);
  process.exit(1);
}

console.log(`OK: ${placeholders.size} lekcí → ${themeIds.length} widgetů`);
