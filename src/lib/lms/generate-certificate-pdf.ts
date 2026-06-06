import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/lib/content";
import { getCertificatePublicUrl } from "@/lib/lms/certificate-config";
import {
  getCertificateInstructions,
  getCertificateSuccessText,
  getCertificateTemplate,
  getCertificateTrainer,
  getCertificateValidityLabel,
} from "@/lib/lms/certificate-template";

export interface CertificatePdfData {
  studentName: string;
  companyName: string | null;
  courseSlug: string;
  certificateCode: string;
  issuedAt: Date;
  expiresAt: Date;
}

const TEXT_MUTED = rgb(0.35, 0.35, 0.35);
const TEXT_DARK = rgb(0.1, 0.1, 0.1);
const BRAND_DARK = rgb(208 / 255, 95 / 255, 43 / 255);

const FONT_DIR = path.join(
  process.cwd(),
  "node_modules/dejavu-fonts-ttf/ttf"
);

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

function formatCzechDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
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

function drawCenteredLines(
  page: PDFPage,
  lines: string[],
  startY: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  lineHeight: number
): number {
  let y = startY;
  const pageWidth = page.getWidth();

  for (const line of lines) {
    const textWidth = font.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: (pageWidth - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
    y -= lineHeight;
  }

  return y;
}

export async function generateCertificatePdf(
  data: CertificatePdfData
): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const template = getCertificateTemplate(data.courseSlug);
  const instructions = getCertificateInstructions();
  const companyLabel = data.companyName?.trim() || "neuvedeno";

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontRegular = await pdfDoc.embedFont(fonts.regular);
  const fontBold = await pdfDoc.embedFont(fonts.bold);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 48;
  const contentWidth = width - margin * 2;

  let y = height - margin;

  y = drawCenteredLines(
    page,
    [site.company, `${site.address.street}, ${site.address.city}, ${site.address.zip}`, `IČO: ${site.ico}`],
    y,
    fontRegular,
    10,
    TEXT_MUTED,
    14
  );

  y -= 10;
  y = drawCenteredLines(
    page,
    [template.trainingTitle],
    y,
    fontBold,
    14,
    TEXT_DARK,
    18
  );

  y -= 6;
  y = drawCenteredLines(page, ["CERTIFIKÁT"], y, fontBold, 22, BRAND_DARK, 26);

  y -= 4;
  y = drawCenteredLines(
    page,
    wrapText(template.legalBasis, fontRegular, 10, contentWidth),
    y,
    fontRegular,
    10,
    TEXT_MUTED,
    13
  );

  y -= 12;
  y = drawCenteredLines(page, ["Pan/paní"], y, fontRegular, 11, TEXT_MUTED, 14);

  y -= 2;
  y = drawCenteredLines(page, [data.studentName], y, fontBold, 20, TEXT_DARK, 24);

  y -= 10;
  y = drawCenteredLines(
    page,
    ["Toto školení je platné pro firmu", companyLabel],
    y,
    fontRegular,
    11,
    TEXT_DARK,
    15
  );

  y -= 8;
  y = drawCenteredLines(
    page,
    [getCertificateValidityLabel()],
    y,
    fontRegular,
    11,
    TEXT_DARK,
    14
  );

  y -= 10;
  y = drawCenteredLines(
    page,
    wrapText(getCertificateSuccessText(), fontRegular, 10, contentWidth),
    y,
    fontRegular,
    10,
    TEXT_MUTED,
    13
  );

  y -= 14;
  page.drawText(instructions.title, {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: TEXT_DARK,
  });
  y -= 16;

  for (const item of instructions.items) {
    const lines = wrapText(item, fontRegular, 9, contentWidth - 12);
    for (const line of lines) {
      page.drawText(`• ${line}`, {
        x: margin + 4,
        y,
        size: 9,
        font: fontRegular,
        color: TEXT_MUTED,
      });
      y -= 12;
    }
    y -= 4;
  }

  y -= 6;
  y = drawCenteredLines(
    page,
    ["Jmenovaný absolvoval/a školení dne:", formatCzechDate(data.issuedAt)],
    y,
    fontRegular,
    11,
    TEXT_DARK,
    15
  );

  y -= 12;
  y = drawCenteredLines(
    page,
    [`Školitel: ${getCertificateTrainer()}`],
    y,
    fontRegular,
    11,
    TEXT_DARK,
    14
  );

  const footerY = margin + 28;
  drawCenteredLines(
    page,
    [
      `Evidenční kód: ${data.certificateCode}`,
      getCertificatePublicUrl(data.certificateCode),
      `${site.name} · onlineskoleni.eu`,
    ],
    footerY + 28,
    fontRegular,
    9,
    TEXT_MUTED,
    12
  );

  return pdfDoc.save();
}
