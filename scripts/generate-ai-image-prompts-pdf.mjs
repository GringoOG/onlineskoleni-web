#!/usr/bin/env node
/**
 * Generuje PDF s AI prompty pro ilustrace microlearningu.
 * Usage: node scripts/generate-ai-image-prompts-pdf.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INPUT = path.join(ROOT, "content/theory/ai-image-prompts.json");
const OUTPUT = path.join(ROOT, "content/theory/ai-image-prompts.pdf");
const FONT_DIR = path.join(ROOT, "node_modules/dejavu-fonts-ttf/ttf");

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLOR = {
  title: rgb(0.08, 0.12, 0.2),
  heading: rgb(0.12, 0.28, 0.55),
  body: rgb(0.15, 0.15, 0.18),
  muted: rgb(0.4, 0.42, 0.46),
  accent: rgb(0.82, 0.37, 0.17),
  promptBg: rgb(0.95, 0.96, 0.98),
  promptBorder: rgb(0.82, 0.86, 0.92),
};

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class PdfWriter {
  /** @param {import('pdf-lib').PDFDocument} pdfDoc */
  /** @param {import('pdf-lib').PDFFont} fontRegular */
  /** @param {import('pdf-lib').PDFFont} fontBold */
  constructor(pdfDoc, fontRegular, fontBold) {
    this.pdfDoc = pdfDoc;
    this.fontRegular = fontRegular;
    this.fontBold = fontBold;
    this.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  ensureSpace(height) {
    if (this.y - height < MARGIN) {
      this.page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  drawLine(x1, y1, x2, y2, color = COLOR.promptBorder, thickness = 0.5) {
    this.page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
  }

  drawTextBlock(lines, { font, size, color, lineHeight = size * 1.35, indent = 0 }) {
    const blockHeight = lines.length * lineHeight;
    this.ensureSpace(blockHeight);
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= lineHeight;
    }
  }

  title(text) {
    const size = 22;
    this.ensureSpace(size * 2);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLOR.title,
    });
    this.y -= size * 1.6;
  }

  subtitle(text) {
    const size = 11;
    const lines = wrapText(text, this.fontRegular, size, CONTENT_WIDTH);
    this.drawTextBlock(lines, { font: this.fontRegular, size, color: COLOR.muted });
    this.y -= 8;
  }

  sectionHeading(text) {
    this.y -= 10;
    const size = 14;
    this.ensureSpace(size * 2);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLOR.heading,
    });
    this.y -= size * 1.4;
    this.drawLine(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    this.y -= 12;
  }

  themeHeading(id, titleCs, titleEn) {
    const size = 11;
    this.y -= 6;
    this.ensureSpace(size * 3);
    this.page.drawText(`${id}  ${titleCs}`, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLOR.accent,
    });
    this.y -= size * 1.3;
    this.page.drawText(titleEn, {
      x: MARGIN,
      y: this.y - size,
      size: size - 1,
      font: this.fontRegular,
      color: COLOR.muted,
    });
    this.y -= size * 1.2;
  }

  meta(label, value) {
    const size = 9;
    const text = `${label}: ${value}`;
    const lines = wrapText(text, this.fontRegular, size, CONTENT_WIDTH);
    this.drawTextBlock(lines, { font: this.fontRegular, size, color: COLOR.muted });
    this.y -= 4;
  }

  promptBox(text) {
    const size = 8.5;
    const padding = 10;
    const lines = wrapText(text, this.fontRegular, size, CONTENT_WIDTH - padding * 2);
    const boxHeight = lines.length * (size * 1.35) + padding * 2;
    this.ensureSpace(boxHeight + 8);

    const boxTop = this.y;
    const boxBottom = this.y - boxHeight;

    this.page.drawRectangle({
      x: MARGIN,
      y: boxBottom,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: COLOR.promptBg,
      borderColor: COLOR.promptBorder,
      borderWidth: 0.75,
    });

    let textY = boxTop - padding - size;
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN + padding,
        y: textY,
        size,
        font: this.fontRegular,
        color: COLOR.body,
      });
      textY -= size * 1.35;
    }

    this.y = boxBottom - 14;
  }

  bulletList(items) {
    const size = 10;
    for (const item of items) {
      const lines = wrapText(item, this.fontRegular, size, CONTENT_WIDTH - 14);
      this.ensureSpace(lines.length * size * 1.35 + 4);
      this.page.drawText("•", {
        x: MARGIN,
        y: this.y - size,
        size,
        font: this.fontBold,
        color: COLOR.accent,
      });
      let textY = this.y - size;
      for (const line of lines) {
        this.page.drawText(line, {
          x: MARGIN + 14,
          y: textY,
          size,
          font: this.fontRegular,
          color: COLOR.body,
        });
        textY -= size * 1.35;
      }
      this.y = textY - 4;
    }
    this.y -= 6;
  }
}

async function main() {
  const data = JSON.parse(await readFile(INPUT, "utf8"));
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(FONT_DIR, "DejaVuSans.ttf")),
    readFile(path.join(FONT_DIR, "DejaVuSans-Bold.ttf")),
  ]);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontRegular = await pdfDoc.embedFont(regularBytes);
  const fontBold = await pdfDoc.embedFont(boldBytes);

  const writer = new PdfWriter(pdfDoc, fontRegular, fontBold);

  writer.title(data.title);
  writer.subtitle(data.subtitle);
  writer.subtitle(`Vygenerováno: ${new Date().toLocaleDateString("cs-CZ")}`);

  writer.sectionHeading("Společný styl (suffix každého promptu)");
  writer.promptBox(data.styleSuffix);

  writer.sectionHeading("Tipy pro generování");
  writer.bulletList(data.tips);

  let themeCount = 0;
  for (const course of data.courses) {
    writer.sectionHeading(`${course.title} (${course.lessonCount} lekcí, ${course.themes.length} témat)`);

    for (const theme of course.themes) {
      themeCount += 1;
      writer.themeHeading(theme.id, theme.titleCs, theme.titleEn);
      writer.meta("Lekce", theme.lessons);
      writer.meta("Prompt", "");
      writer.promptBox(theme.prompt);
    }
  }

  writer.sectionHeading("Shrnutí");
  writer.subtitle(`${data.courses.length} kurzů · ${themeCount} vizuálních témat · 131 lekcí celkem`);

  const pdfBytes = await pdfDoc.save();
  await writeFile(OUTPUT, pdfBytes);

  console.log(`PDF uloženo: ${OUTPUT}`);
  console.log(`Počet témat: ${themeCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
