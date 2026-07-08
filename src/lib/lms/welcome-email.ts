import { site } from "@/lib/content";
import { getLmsLoginUrl } from "@/lib/email/app-url";
import { escapeHtml } from "@/lib/email/escape-html";
import { formatCzechEmailGreeting, type CzechSalutation } from "@/lib/email/czech-greeting";
import { sendEmail, type SendEmailResult } from "@/lib/email/resend";
import type { EnrollmentResult } from "@/lib/lms/enroll-from-order";

interface WelcomeEmailInput {
  orderNumber: string;
  companyName: string;
  enrollments: EnrollmentResult[];
  /** Jméno příjemce z aktuální objednávky (má přednost před údajem v DB). */
  recipientName?: string;
  recipientSalutation?: CzechSalutation;
  /** Manuální aktivace provozovatelem (faktura / hotově). */
  manualActivation?: boolean;
  paymentMethodLabel?: string;
}

function uniqueCourseLines(enrollments: EnrollmentResult[]): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const enrollment of enrollments) {
    if (seen.has(enrollment.courseSlug)) {
      continue;
    }
    seen.add(enrollment.courseSlug);
    const seats =
      enrollment.seatsPurchased > 1
        ? ` (zakoupeno ${enrollment.seatsPurchased} míst)`
        : "";
    lines.push(`${enrollment.courseName}${seats}`);
  }

  return lines;
}

function buildWelcomeEmailContent(input: WelcomeEmailInput) {
  const first = input.enrollments[0];
  if (!first) {
    return null;
  }

  const loginUrl = getLmsLoginUrl();
  const courseLines = uniqueCourseLines(input.enrollments);

  const activationLine = input.manualActivation
    ? `Váš přístup ke školení byl aktivován (${input.paymentMethodLabel ?? "mimo online platbu"}).`
    : "Vaše platba byla přijata a kurzy jsou připraveny v online systému školení.";

  const recipientName = (input.recipientName ?? first.studentName).trim();
  const greeting = formatCzechEmailGreeting(recipientName, input.recipientSalutation);

  const hasPassword = Boolean(first.temporaryPassword);
  const credentialsIntro = hasPassword
    ? "Přihlašovací údaje do systému školení:"
    : "Přihlášení do systému školení:";

  const passwordText = hasPassword
    ? first.temporaryPassword!
    : "použijte heslo, které jste již obdrželi dříve.";

  const textCourseLines = courseLines.map((line) => `  • ${line}`);

  const text = [
    greeting,
    "",
    `děkujeme za objednávku ${input.orderNumber} (${input.companyName}).`,
    activationLine,
    "",
    "Přiřazené kurzy:",
    ...textCourseLines,
    "",
    credentialsIntro,
    `  E-mail: ${first.studentEmail}`,
    `  Heslo: ${passwordText}`,
    ...(hasPassword ? ["", "Po prvním přihlášení si heslo doporučujeme změnit (funkce brzy)."] : []),
    "",
    "Po přihlášení uvidíte kurzy v přehledu „Moje školení“.",
    "",
    `Přihlášení: ${loginUrl}`,
    "",
    "Tip: Pokud odkaz v e-mailu nefunguje (např. v aplikaci Seznam), otevřete tuto adresu v prohlížeči Chrome nebo Safari.",
    "",
    "S pozdravem",
    site.name,
  ].join("\n");

  const htmlCourseItems = courseLines
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  const passwordHtml = hasPassword
    ? `<p style="margin:0 0 6px;"><strong>Heslo:</strong> <code style="font-size:15px;">${escapeHtml(first.temporaryPassword!)}</code></p>`
    : `<p style="margin:0 0 6px;"><strong>Heslo:</strong> použijte heslo, které jste již obdrželi dříve.</p>`;

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Přístup ke školení</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
                děkujeme za objednávku <strong>${escapeHtml(input.orderNumber)}</strong>
                (${escapeHtml(input.companyName)}).
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(activationLine)}</p>
              <p style="margin:0 0 8px;font-size:15px;font-weight:bold;">Přiřazené kurzy:</p>
              <ul style="margin:0 0 20px 20px;padding:0;font-size:15px;line-height:1.6;">
                ${htmlCourseItems}
              </ul>
              <div style="margin:0 0 20px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                <p style="margin:0 0 10px;font-size:15px;font-weight:bold;">${escapeHtml(credentialsIntro)}</p>
                <p style="margin:0 0 6px;"><strong>E-mail:</strong> ${escapeHtml(first.studentEmail)}</p>
                ${passwordHtml}
              </div>
              ${
                hasPassword
                  ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#64748b;">Po prvním přihlášení si heslo doporučujeme změnit (funkce brzy).</p>`
                  : ""
              }
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
                Po přihlášení uvidíte kurzy v přehledu „Moje školení“.
              </p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;border-radius:8px;">
                  Přihlásit se do systému školení
                </a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;word-break:break-all;">
                Nebo otevřete odkaz: <a href="${escapeHtml(loginUrl)}" style="color:#1d4ed8;">${escapeHtml(loginUrl)}</a>
              </p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
                Pokud odkaz v e-mailu nefunguje (např. v aplikaci Seznam), zkopírujte adresu výše a otevřete ji v prohlížeči Chrome nebo Safari.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:14px;line-height:1.5;color:#64748b;">
                S pozdravem<br />
                <strong style="color:#1e293b;">${escapeHtml(site.name)}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    first,
    text,
    html,
    subject: `Přístup ke školení – objednávka ${input.orderNumber}`,
  };
}

/** Uvítací e-mail studentovi po aktivaci kurzu. */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<SendEmailResult> {
  const content = buildWelcomeEmailContent(input);
  if (!content) {
    return { sent: false, skipped: true, error: "no_enrollments" };
  }

  console.info("[Welcome email]\n" + content.text);

  return sendEmail({
    to: content.first.studentEmail,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}
