import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: Date;
  expiresAt: Date;
}

const BRAND_DARK = rgb(208 / 255, 95 / 255, 43 / 255);
const BRAND_LIGHT = rgb(255 / 255, 179 / 255, 71 / 255);
const TEXT_MUTED = rgb(0.35, 0.35, 0.35);
const TEXT_DARK = rgb(0.12, 0.12, 0.12);

const FONT_DIR = path.join(
  process.cwd(),
  "node_modules/dejavu-fonts-ttf/ttf"
);
const LOGO_PATH = path.join(process.cwd(), "public/images/logo.png");

let fontCache: { regular: Uint8Array; bold: Uint8Array } | null = null;
let logoCache: Uint8Array | null = null;

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

async function loadLogo() {
  if (!logoCache) {
    logoCache = await readFile(LOGO_PATH);
  }
  return logoCache;
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
) {
  const pageWidth = page.getWidth();
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (pageWidth - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
}

function formatCzechDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateCertificatePdf(
  data: CertificatePdfData
): Promise<Uint8Array> {
  const [fonts, logoBytes] = await Promise.all([loadFonts(), loadLogo()]);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontRegular = await pdfDoc.embedFont(fonts.regular);
  const fontBold = await pdfDoc.embedFont(fonts.bold);
  const logo = await pdfDoc.embedPng(logoBytes);

  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();
  const margin = 36;

  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: BRAND_DARK,
    borderWidth: 2,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: margin + 8,
    y: margin + 8,
    width: width - margin * 2 - 16,
    height: height - margin * 2 - 16,
    borderColor: BRAND_LIGHT,
    borderWidth: 1,
  });

  const logoScale = 0.45;
  const logoWidth = logo.width * logoScale;
  const logoHeight = logo.height * logoScale;
  page.drawImage(logo, {
    x: (width - logoWidth) / 2,
    y: height - margin - 40 - logoHeight,
    width: logoWidth,
    height: logoHeight,
  });

  drawCenteredText(page, "CERTIFIKÁT", height - 170, fontBold, 28, BRAND_DARK);
  drawCenteredText(
    page,
    "o absolvování online školení",
    height - 200,
    fontRegular,
    14,
    TEXT_MUTED
  );

  drawCenteredText(
    page,
    data.courseTitle,
    height - 240,
    fontBold,
    18,
    TEXT_DARK
  );

  drawCenteredText(
    page,
    "Tímto se potvrzuje, že",
    height - 285,
    fontRegular,
    13,
    TEXT_MUTED
  );

  drawCenteredText(
    page,
    data.studentName,
    height - 330,
    fontBold,
    26,
    TEXT_DARK
  );

  drawCenteredText(
    page,
    "úspěšně absolvoval/a závěrečný test a splnil/a požadavky školení.",
    height - 365,
    fontRegular,
    12,
    TEXT_MUTED
  );

  const issuedLabel = `Datum vydání: ${formatCzechDate(data.issuedAt)}`;
  const validLabel = `Platnost do: ${formatCzechDate(data.expiresAt)}`;
  const codeLabel = `Evidenční kód: ${data.certificateCode}`;

  drawCenteredText(page, issuedLabel, 120, fontRegular, 11, TEXT_DARK);
  drawCenteredText(page, validLabel, 100, fontRegular, 11, TEXT_MUTED);
  drawCenteredText(page, codeLabel, 78, fontBold, 12, BRAND_DARK);

  drawCenteredText(
    page,
    "OnlineŠkolení · onlineskoleni.eu",
    52,
    fontRegular,
    9,
    TEXT_MUTED
  );

  return pdfDoc.save();
}
