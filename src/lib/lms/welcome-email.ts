import { site } from "@/lib/content";
import type { EnrollmentResult } from "@/lib/lms/enroll-from-order";
import { getLmsEntryUrl } from "@/lib/lms/course-paths";

interface WelcomeEmailInput {
  orderNumber: string;
  companyName: string;
  enrollments: EnrollmentResult[];
}

/** Uvítací e-mail kontaktní osobě po zaplacení objednávky a enrollmentu do LMS. */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const first = input.enrollments[0];
  if (!first) {
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://onlineskoleni-web.vercel.app";
  const courseLines = input.enrollments.map((e) => {
    const link = getLmsEntryUrl(e.courseSlug);
    const seats =
      e.seatsPurchased > 1
        ? ` (zakoupeno ${e.seatsPurchased} míst – kontaktní osoba má přístup hned, další zaměstnance doplníte později)`
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

  const text = [
    `Dobrý den, ${first.studentName},`,
    "",
    `děkujeme za objednávku ${input.orderNumber} (${input.companyName}).`,
    "Vaše platba byla přijata a kurzy jsou připraveny v online systému školení.",
    "",
    "Přiřazené kurzy:",
    ...courseLines,
    credentialsBlock,
    "",
    `Úvodní stránka: ${appUrl}`,
    "",
    "S pozdravem",
    site.name,
  ].join("\n");

  console.info("[Welcome email]\n" + text);

  if (!resendKey) {
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to: [first.studentEmail],
        subject: `Přístup ke školení – objednávka ${input.orderNumber}`,
        text,
      }),
    });
  } catch (error) {
    console.error("[Welcome email failed]", error);
  }
}
