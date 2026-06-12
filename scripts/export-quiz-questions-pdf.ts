import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizFile {
  courseSlug: string;
  variant: string;
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
}

const QUIZ_DIR = path.join(process.cwd(), "content/quizzes");
const OUTPUT_PATH = path.join(process.cwd(), "otazky-prehled.pdf");

const FONT_DIR = path.join(
  process.cwd(),
  "node_modules/dejavu-fonts-ttf/ttf"
);

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 48;
const MARGIN_RIGHT = 48;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const COLOR_TITLE = rgb(0.82, 0.37, 0.17);
const COLOR_SECTION = rgb(0.15, 0.15, 0.15);
const COLOR_TEXT = rgb(0.2, 0.2, 0.2);
const COLOR_MUTED = rgb(0.45, 0.45, 0.45);
const COLOR_CORRECT = rgb(0.1, 0.45, 0.2);

const SECTION_ORDER: { file: string; label: string }[] = [
  { file: "bozp-demo.json", label: "BOZP — demo test" },
  { file: "bozp-oficialni-zamestnanec.json", label: "BOZP — závěrečný test (zaměstnanec)" },
  { file: "bozp-oficialni-vedouci.json", label: "BOZP — závěrečný test (vedoucí)" },
  { file: "pozarni-demo.json", label: "Požární ochrana — demo test" },
  { file: "pozarni-oficialni-zamestnanec.json", label: "Požární ochrana — závěrečný test (zaměstnanec)" },
  { file: "pozarni-oficialni-vedouci.json", label: "Požární ochrana — závěrečný test (vedoucí)" },
  { file: "ridici-demo.json", label: "Referenti řidičů — demo test" },
  { file: "ridici-oficialni.json", label: "Referenti řidičů — závěrečný test" },
  { file: "bremena-demo.json", label: "Manipulace s břemeny — demo test" },
  { file: "bremena-oficialni.json", label: "Manipulace s břemeny — závěrečný test" },
  { file: "gdpr-demo.json", label: "GDPR — demo test" },
  { file: "gdpr-oficialni.json", label: "GDPR — závěrečný test" },
  { file: "ergonomie-demo.json", label: "Ergonomie práce — demo test" },
  { file: "ergonomie-oficialni.json", label: "Ergonomie práce — závěrečný test" },
];

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

let fontCache: { regular: Uint8Array; bold: Uint8Array } | null = null;

async function loadFonts() {
  if (!fontCache) {
    const [regular, bold] = await Promise.all([
      readFile(path.join(FONT_DIR, "DejaVuSans.ttf")),
      readFile(path.join(FONT_DIR, "DejaVuSans-Bold.ttf")),
    ]);
    fontCache = { regular, bold };
  }
  return fontCache;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

class PdfWriter {
  private doc: PDFDocument;
  private page: PDFPage;
  private regular: PDFFont;
  private bold: PDFFont;
  private cursorY = MARGIN_TOP;

  constructor(doc: PDFDocument, page: PDFPage, regular: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.page = page;
    this.regular = regular;
    this.bold = bold;
  }

  private ensureSpace(height: number) {
    if (this.cursorY + height > PAGE_HEIGHT - MARGIN_BOTTOM) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.cursorY = MARGIN_TOP;
    }
  }

  private drawLines(
    lines: string[],
    font: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
    indent = 0,
    lineHeight = 1.35
  ) {
    const step = size * lineHeight;
    for (const line of lines) {
      this.ensureSpace(step);
      this.page.drawText(line, {
        x: MARGIN_LEFT + indent,
        y: PAGE_HEIGHT - this.cursorY - size,
        size,
        font,
        color,
      });
      this.cursorY += step;
    }
  }

  drawTitle(text: string) {
    this.ensureSpace(80);
    const lines = wrapText(text, this.bold, 22, CONTENT_WIDTH);
    this.drawLines(lines, this.bold, 22, COLOR_TITLE, 0, 1.25);
    this.cursorY += 8;
  }

  drawSubtitle(text: string) {
    this.ensureSpace(24);
    this.drawLines([text], this.regular, 11, COLOR_MUTED);
    this.cursorY += 12;
  }

  drawSectionHeading(text: string, questionCount: number) {
    this.ensureSpace(48);
    this.cursorY += 10;
    const lines = wrapText(text, this.bold, 14, CONTENT_WIDTH);
    this.drawLines(lines, this.bold, 14, COLOR_SECTION);
    this.drawLines(
      [`Počet otázek v zásobníku: ${questionCount}`],
      this.regular,
      10,
      COLOR_MUTED
    );
    this.cursorY += 6;
  }

  drawQuestion(index: number, question: QuizQuestion) {
    const questionPrefix = `${index}. `;
    const prefixWidth = this.bold.widthOfTextAtSize(questionPrefix, 11);
    const questionLines = wrapText(
      question.text,
      this.bold,
      11,
      CONTENT_WIDTH - prefixWidth
    );

    this.ensureSpace(20);
    this.page.drawText(questionPrefix, {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - this.cursorY - 11,
      size: 11,
      font: this.bold,
      color: COLOR_TEXT,
    });

    for (let i = 0; i < questionLines.length; i++) {
      const line = questionLines[i];
      if (i === 0) {
        this.page.drawText(line, {
          x: MARGIN_LEFT + prefixWidth,
          y: PAGE_HEIGHT - this.cursorY - 11,
          size: 11,
          font: this.bold,
          color: COLOR_TEXT,
        });
        this.cursorY += 11 * 1.35;
      } else {
        this.drawLines([line], this.bold, 11, COLOR_TEXT, prefixWidth);
      }
    }

    for (let optionIndex = 0; optionIndex < question.options.length; optionIndex++) {
      const label = OPTION_LABELS[optionIndex] ?? String(optionIndex + 1);
      const isCorrect = optionIndex === question.correctIndex;
      const prefix = `${label}) `;
      const optionText = question.options[optionIndex];
      const optionPrefixWidth = this.regular.widthOfTextAtSize(prefix, 10);
      const optionLines = wrapText(
        optionText,
        this.regular,
        10,
        CONTENT_WIDTH - 16 - optionPrefixWidth
      );
      const font = isCorrect ? this.bold : this.regular;
      const color = isCorrect ? COLOR_CORRECT : COLOR_TEXT;

      for (let i = 0; i < optionLines.length; i++) {
        this.ensureSpace(14);
        if (i === 0) {
          this.page.drawText(prefix, {
            x: MARGIN_LEFT + 16,
            y: PAGE_HEIGHT - this.cursorY - 10,
            size: 10,
            font,
            color,
          });
          this.page.drawText(optionLines[i], {
            x: MARGIN_LEFT + 16 + optionPrefixWidth,
            y: PAGE_HEIGHT - this.cursorY - 10,
            size: 10,
            font,
            color,
          });
        } else {
          this.page.drawText(optionLines[i], {
            x: MARGIN_LEFT + 16 + optionPrefixWidth,
            y: PAGE_HEIGHT - this.cursorY - 10,
            size: 10,
            font,
            color,
          });
        }
        this.cursorY += 10 * 1.35;
      }
    }

    this.cursorY += 8;
  }
}

async function loadQuiz(fileName: string): Promise<QuizFile> {
  const raw = await readFile(path.join(QUIZ_DIR, fileName), "utf8");
  return JSON.parse(raw) as QuizFile;
}

async function main() {
  const files = await readdir(QUIZ_DIR);
  const missing = SECTION_ORDER.filter(({ file }) => !files.includes(file));
  if (missing.length > 0) {
    throw new Error(`Chybí soubory kvízů: ${missing.map((item) => item.file).join(", ")}`);
  }

  const quizzes = await Promise.all(
    SECTION_ORDER.map(async ({ file, label }) => ({
      label,
      quiz: await loadQuiz(file),
    }))
  );

  const totalQuestions = quizzes.reduce(
    (sum, item) => sum + item.quiz.questions.length,
    0
  );

  const fonts = await loadFonts();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(fonts.regular);
  const bold = await doc.embedFont(fonts.bold);

  const firstPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const writer = new PdfWriter(doc, firstPage, regular, bold);

  writer.drawTitle("Přehled otázek — OnlineŠkolení.cz");
  writer.drawSubtitle(
    `Vygenerováno ${new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date())}`
  );
  writer.drawSubtitle(
    `Celkem ${quizzes.length} zásobníků, ${totalQuestions} otázek včetně demo i oficiálních testů.`
  );
  writer.drawSubtitle(
    "Správné odpovědi jsou označeny tučně zeleně. Otázky jsou uloženy v souborech content/quizzes/*.json."
  );

  for (const { label, quiz } of quizzes) {
    writer.drawSectionHeading(`${label} — ${quiz.title}`, quiz.questions.length);
    quiz.questions.forEach((question, index) => {
      writer.drawQuestion(index + 1, question);
    });
  }

  const pdfBytes = await doc.save();
  await writeFile(OUTPUT_PATH, pdfBytes);
  console.log(`PDF uloženo: ${OUTPUT_PATH}`);
  console.log(`Zásobníků: ${quizzes.length}, otázek: ${totalQuestions}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
