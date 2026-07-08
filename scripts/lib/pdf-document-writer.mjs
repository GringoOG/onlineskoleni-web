import { rgb } from "pdf-lib";

export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
export const MARGIN = 48;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export const COLOR = {
  title: rgb(0.08, 0.12, 0.2),
  heading: rgb(0.12, 0.28, 0.55),
  subheading: rgb(0.2, 0.35, 0.48),
  body: rgb(0.15, 0.15, 0.18),
  muted: rgb(0.4, 0.42, 0.46),
  accent: rgb(0.82, 0.37, 0.17),
  correct: rgb(0.1, 0.45, 0.28),
  line: rgb(0.82, 0.86, 0.92),
};

export function wrapText(text, font, size, maxWidth) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
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
  return lines.length ? lines : [""];
}

export class PdfWriter {
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
    const size = 10.5;
    const lines = wrapText(text, this.fontRegular, size, CONTENT_WIDTH);
    this.drawTextBlock(lines, { font: this.fontRegular, size, color: COLOR.muted });
    this.y -= 8;
  }

  sectionHeading(text, meta) {
    this.y -= 14;
    const size = 16;
    this.ensureSpace(size * 2.5);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLOR.heading,
    });
    this.y -= size * 1.3;
    if (meta) {
      const metaSize = 10;
      this.page.drawText(meta, {
        x: MARGIN,
        y: this.y - metaSize,
        size: metaSize,
        font: this.fontRegular,
        color: COLOR.muted,
      });
      this.y -= metaSize * 1.5;
    }
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y },
      color: COLOR.line,
      thickness: 0.75,
    });
    this.y -= 14;
  }

  subsetHeading(text) {
    this.y -= 8;
    const size = 12;
    this.ensureSpace(size * 1.8);
    this.page.drawText(text, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLOR.subheading,
    });
    this.y -= size * 1.35;
  }

  lessonBlock(index, heading, paragraphs) {
    const headingSize = 11.5;
    const bodySize = 10.5;
    this.ensureSpace(headingSize * 2);
    this.page.drawText(`${index}. ${heading}`, {
      x: MARGIN,
      y: this.y - headingSize,
      size: headingSize,
      font: this.fontBold,
      color: COLOR.body,
    });
    this.y -= headingSize * 1.45;

    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, this.fontRegular, bodySize, CONTENT_WIDTH);
      this.drawTextBlock(lines, {
        font: this.fontRegular,
        size: bodySize,
        color: COLOR.body,
        indent: 8,
      });
      this.y -= 4;
    }
    this.y -= 4;
  }

  questionBlock(index, question) {
    const labelSize = 10;
    const textSize = 11;
    const answerSize = 10;
    const correctIndex = question.correctIndex;

    this.ensureSpace(labelSize * 2);
    this.page.drawText(`${index}.`, {
      x: MARGIN,
      y: this.y - labelSize,
      size: labelSize,
      font: this.fontBold,
      color: COLOR.accent,
    });
    this.y -= labelSize * 1.5;

    const qLines = wrapText(question.text, this.fontBold, textSize, CONTENT_WIDTH);
    this.drawTextBlock(qLines, { font: this.fontBold, size: textSize, color: COLOR.body });

    question.options.forEach((option, optionIndex) => {
      const letter = String.fromCharCode(97 + optionIndex);
      const prefix = optionIndex === correctIndex ? `${letter}) ✓ ` : `${letter})   `;
      const lines = wrapText(`${prefix}${option}`, this.fontRegular, answerSize, CONTENT_WIDTH - 12);
      this.drawTextBlock(lines, {
        font: optionIndex === correctIndex ? this.fontBold : this.fontRegular,
        size: answerSize,
        color: optionIndex === correctIndex ? COLOR.correct : COLOR.body,
        indent: 10,
        lineHeight: answerSize * 1.35,
      });
    });

    this.y -= 6;
  }
}
