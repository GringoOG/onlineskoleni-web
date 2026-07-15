import { site } from "@/lib/content";
import { formatCzechEmailGreeting } from "@/lib/email/czech-greeting";
import { sendEmail, type SendEmailResult } from "@/lib/email/resend";
import { formatCzechDate } from "@/lib/lms/format-czech-date";

export interface CertificateExpiryReminderEmailInput {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseSlug: string;
  certificateCode: string;
  expiresAt: Date;
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://onlineskoleni-web.vercel.app"
  );
}

/** E-mail s připomenutím obnovy certifikátu před / po uplynutí platnosti. */
export async function sendCertificateExpiryReminderEmail(
  input: CertificateExpiryReminderEmailInput
): Promise<SendEmailResult> {
  const appUrl = getAppUrl();
  const expiryLabel = formatCzechDate(input.expiresAt);
  const orderSlug =
    input.courseSlug === "pozarni"
      ? "pozarni-zamestnanec"
      : input.courseSlug === "bozp"
        ? "bozp-zamestnanec"
        : input.courseSlug;
  const orderUrl = `${appUrl}/objednavka?kurz=${encodeURIComponent(orderSlug)}`;
  const lmsUrl = `${appUrl}/lms`;

  const greeting = formatCzechEmailGreeting(input.studentName);

  const text = [
    greeting,
    "",
    `platnost vašeho certifikátu ze školení „${input.courseTitle}“ končí dne ${expiryLabel}.`,
    `Evidenční kód certifikátu: ${input.certificateCode}`,
    "",
    "Zákonná povinnost školení zaměstnanců platí i nadále – doporučujeme certifikát včas obnovit.",
    "",
    "Obnovení školení:",
    `  • Objednávka kurzu: ${orderUrl}`,
    `  • Přihlášení do systému: ${lmsUrl}`,
    "",
    "Po zaplacení a absolvování testu vám bude vystaven nový certifikát.",
    "",
    "Máte-li dotazy, napište nám na " + site.email + ".",
    "",
    "S pozdravem",
    site.name,
  ].join("\n");

  console.info("[Certificate expiry reminder]\n" + text);

  return sendEmail({
    to: input.studentEmail,
    subject: `Platnost certifikátu končí ${expiryLabel} – ${input.courseTitle}`,
    text,
  });
}
