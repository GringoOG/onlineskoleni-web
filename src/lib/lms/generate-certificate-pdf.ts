import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/lib/content";
import { getCertificatePublicUrl } from "@/lib/lms/certificate-config";
import {
  getCertificateInstructions,
  getCertificateLogoImagePath,
  getCertificateStampImagePath,
  getCertificateSuccessText,
  getCertificateTemplate,
  getCertificateTrainer,
  getCertificateTrainerCredential,
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

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 34;
const MARGIN_RIGHT = 27;

/** Logo v hlavičce (plamínek ve štítu). */
const LOGO_BOX = {
  top: 36,
  height: 48,
  width: 44,
};

/** Razítko vpravo dole — celé razítko vč. loga, cca 46 × 23 mm. */
const STAMP_BOX = {
  bottom: 760,
  width: 130,
  height: 65,
};

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

function baselineFromTop(top: number, fontSize: number): number {
  return PAGE_HEIGHT - top - fontSize * 0.85;
}

function drawLeftText(
  page: PDFPage,
  text: string,
  top: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
): void {
  page.drawText(text, {
    x: MARGIN_LEFT,
    y: baselineFromTop(top, size),
    size,
    font,
    color,
  });
}

function drawRightText(
  page: PDFPage,
  text: string,
  top: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
): void {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: PAGE_WIDTH - MARGIN_RIGHT - textWidth,
    y: baselineFromTop(top, size),
    size,
    font,
    color,
  });
}

function drawCenterText(
  page: PDFPage,
  text: string,
  top: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
): void {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (PAGE_WIDTH - textWidth) / 2,
    y: baselineFromTop(top, size),
    size,
    font,
    color,
  });
}

function drawLeftWrapped(
  page: PDFPage,
  text: string,
  top: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = wrapText(text, font, size, maxWidth);
  let currentTop = top;

  for (const line of lines) {
    drawLeftText(page, line, currentTop, font, size, color);
    currentTop += lineHeight;
  }

  return currentTop;
}

async function embedImageFromPath(
  pdfDoc: PDFDocument,
  relativePath: string
) {
  const bytes = await readFile(path.join(process.cwd(), relativePath));
  return relativePath.endsWith(".jpg") || relativePath.endsWith(".jpeg")
    ? pdfDoc.embedJpg(bytes)
    : pdfDoc.embedPng(bytes);
}

export async function generateCertificatePdf(
  data: CertificatePdfData
): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const template = getCertificateTemplate(data.courseSlug);
  const instructions = getCertificateInstructions();
  const companyLabel = data.companyName?.trim() || "neuvedeno";
  const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT - 210;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontRegular = await pdfDoc.embedFont(fonts.regular);
  const fontBold = await pdfDoc.embedFont(fonts.bold);

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const logoPath = getCertificateLogoImagePath();
  if (logoPath) {
    try {
      const logoImage = await embedImageFromPath(pdfDoc, logoPath);
      const logoX = PAGE_WIDTH - MARGIN_RIGHT - LOGO_BOX.width;
      page.drawImage(logoImage, {
        x: logoX,
        y: PAGE_HEIGHT - LOGO_BOX.top - LOGO_BOX.height,
        width: LOGO_BOX.width,
        height: LOGO_BOX.height,
      });
    } catch {
      // Logo není povinné — certifikát se vygeneruje i bez něj.
    }
  }

  drawLeftText(page, template.trainingTitle, 40, fontBold, 14, TEXT_DARK);
  drawRightText(page, site.company, 92, fontBold, 14, TEXT_DARK);
  drawRightText(
    page,
    `${site.address.street}, ${site.address.city}, ${site.address.zip}`,
    112,
    fontRegular,
    11,
    TEXT_MUTED
  );
  drawRightText(page, `IČO: ${site.ico}`, 124, fontRegular, 11, TEXT_MUTED);

  drawCenterText(page, "CERTIFIKÁT", 182, fontBold, 39, BRAND_DARK);

  let top = drawLeftWrapped(
    page,
    template.legalBasis,
    251,
    fontRegular,
    11,
    TEXT_MUTED,
    contentWidth + 210,
    12
  );

  top = Math.max(top, 275);
  drawLeftText(page, "Pan/paní", top, fontRegular, 11, TEXT_MUTED);

  drawCenterText(page, data.studentName, 303, fontBold, 27, TEXT_DARK);
  drawCenterText(
    page,
    "Toto školení je platné pro firmu",
    360,
    fontRegular,
    11,
    TEXT_DARK
  );
  drawCenterText(page, companyLabel, 399, fontBold, 27, TEXT_DARK);

  const validityYears = Math.max(
    1,
    Math.round(
      (data.expiresAt.getTime() - data.issuedAt.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    )
  );
  drawLeftText(
    page,
    getCertificateValidityLabel(validityYears),
    457,
    fontRegular,
    11,
    TEXT_DARK
  );

  top = drawLeftWrapped(
    page,
    getCertificateSuccessText(),
    482,
    fontRegular,
    11,
    TEXT_MUTED,
    contentWidth + 210,
    12
  );

  top = Math.max(top, 562);
  drawLeftText(page, instructions.title, 550, fontBold, 11, TEXT_DARK);

  top = 563;
  for (const item of instructions.items) {
    top = drawLeftWrapped(
      page,
      item,
      top,
      fontRegular,
      11,
      TEXT_MUTED,
      contentWidth + 210,
      12
    );
    top += 2;
  }

  drawLeftText(
    page,
    "Jmenovaný absolvoval/a školení dne:",
    636,
    fontRegular,
    11,
    TEXT_DARK
  );
  drawLeftText(
    page,
    formatCzechDate(data.issuedAt),
    661,
    fontRegular,
    11,
    TEXT_DARK
  );

  const trainerCredential = getCertificateTrainerCredential(data.courseSlug);
  if (trainerCredential) {
    drawLeftText(
      page,
      `Školitel: ${getCertificateTrainer()}, číslo osvědčení.`,
      729,
      fontRegular,
      11,
      TEXT_DARK
    );
    drawLeftText(page, trainerCredential, 741, fontRegular, 11, TEXT_DARK);
  } else {
    drawLeftText(
      page,
      `Školitel: ${getCertificateTrainer()}.`,
      729,
      fontRegular,
      11,
      TEXT_DARK
    );
  }

  const stampPath = getCertificateStampImagePath();
  if (stampPath) {
    try {
      const stampImage = await embedImageFromPath(pdfDoc, stampPath);
      const stampX = PAGE_WIDTH - MARGIN_RIGHT - STAMP_BOX.width;
      page.drawImage(stampImage, {
        x: stampX,
        y: PAGE_HEIGHT - STAMP_BOX.bottom,
        width: STAMP_BOX.width,
        height: STAMP_BOX.height,
      });
    } catch {
      // Razítko není povinné — certifikát se vygeneruje i bez něj.
    }
  }

  drawLeftText(
    page,
    getCertificatePublicUrl(data.certificateCode),
    818,
    fontRegular,
    8,
    TEXT_MUTED
  );
  drawLeftText(
    page,
    `Evidenční kód: ${data.certificateCode}`,
    806,
    fontRegular,
    8,
    TEXT_MUTED
  );

  return pdfDoc.save();
}
