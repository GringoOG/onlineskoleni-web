import { site } from "@/lib/content";
import { sendEmail, type SendEmailResult } from "@/lib/email/resend";
import type { EnrollmentResult } from "@/lib/lms/enroll-from-order";
import { getLmsEntryUrl } from "@/lib/lms/course-paths";

interface WelcomeEmailInput {
  orderNumber: string;
  companyName: string;
  enrollments: EnrollmentResult[];
  /** Manuální aktivace provozovatelem (faktura / hotově). */
  manualActivation?: boolean;
  paymentMethodLabel?: string;
}

/** Uvítací e-mail studentovi po aktivaci kurzu. */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<SendEmailResult> {
  const first = input.enrollments[0];
  if (!first) {
    return { sent: false, skipped: true, error: "no_enrollments" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://onlineskoleni-web.vercel.app";

  const courseLines = input.enrollments.map((e) => {
    const link = getLmsEntryUrl(e.courseSlug);
    const seats =
      e.seatsPurchased > 1
        ? ` (zakoupeno ${e.seatsPurchased} míst)`
        : "";
    return `  • ${e.courseName}${seats}\n    Odkaz: ${link}`;
  });

  const credentialsBlock = first.temporaryPassword
    ? [
        "",
        "Přihlašovací údaje do systému školení:",
        `  E-mail: ${first.studentEmail}`,
        `  Heslo: ${first.temporaryPassword}`,
        "",
        "Po prvním přihlášení si heslo doporučujeme změnit (funkce brzy).",
      ].join("\n")
    : [
        "",
        "Přihlášení do systému školení:",
        `  E-mail: ${first.studentEmail}`,
        "  Heslo: použijte heslo, které jste již obdrželi dříve.",
      ].join("\n");

  const activationLine = input.manualActivation
    ? `Váš přístup ke školení byl aktivován (${input.paymentMethodLabel ?? "mimo online platbu"}).`
    : `Vaše platba byla přijata a kurzy jsou připraveny v online systému školení.`;

  const text = [
    `Dobrý den, ${first.studentName},`,
    "",
    input.manualActivation
      ? `děkujeme za objednávku ${input.orderNumber} (${input.companyName}).`
      : `děkujeme za objednávku ${input.orderNumber} (${input.companyName}).`,
    activationLine,
    "",
    "Přiřazené kurzy:",
    ...courseLines,
    credentialsBlock,
    "",
    `Přihlášení: ${appUrl}/lms/login`,
    "",
    "S pozdravem",
    site.name,
  ].join("\n");

  console.info("[Welcome email]\n" + text);

  return sendEmail({
    to: first.studentEmail,
    subject: input.manualActivation
      ? `Přístup ke školení – objednávka ${input.orderNumber}`
      : `Přístup ke školení – objednávka ${input.orderNumber}`,
    text,
  });
}
