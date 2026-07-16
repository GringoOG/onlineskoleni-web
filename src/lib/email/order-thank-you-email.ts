import { site } from "@/lib/content";
import { escapeHtml } from "@/lib/email/escape-html";
import { formatCzechEmailGreeting, type CzechSalutation } from "@/lib/email/czech-greeting";
import { sendEmail, type SendEmailResult } from "@/lib/email/resend";

export interface ThankYouParticipantLine {
  name: string;
  email: string;
  courseNames: string[];
}

interface OrderThankYouEmailInput {
  orderNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactSalutation?: CzechSalutation;
  paymentMethodLabel?: string;
  participants: ThankYouParticipantLine[];
  items: { name: string; quantity: number }[];
}

/** Děkovný e-mail kontaktní osobě (bez přihlašovacích údajů LMS). */
export async function sendOrderThankYouEmail(
  input: OrderThankYouEmailInput
): Promise<SendEmailResult> {
  const greeting = formatCzechEmailGreeting(
    input.contactName.trim(),
    input.contactSalutation
  );

  const paymentLine = input.paymentMethodLabel
    ? `Objednávka byla aktivována (${input.paymentMethodLabel}).`
    : "Děkujeme za objednávku online školení.";

  const itemLines = input.items.map((item) => `  • ${item.name} × ${item.quantity}`);
  const participantLines = input.participants.map((participant) => {
    const courses = participant.courseNames.join(", ");
    return `  • ${participant.name} <${participant.email}> — ${courses}`;
  });

  const text = [
    greeting,
    "",
    `děkujeme za objednávku ${input.orderNumber} (${input.companyName}).`,
    paymentLine,
    "",
    "Přehled školení:",
    ...itemLines,
    "",
    "Přístupy ke školení jsme odeslali na e-maily účastníků:",
    ...participantLines,
    "",
    "Tento e-mail slouží jako potvrzení objednávky. Přihlašovací údaje dostává každý účastník na svůj e-mail.",
    "",
    "S pozdravem",
    site.name,
  ].join("\n");

  const htmlItems = input.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} × ${item.quantity}</li>`
    )
    .join("");

  const htmlParticipants = input.participants
    .map(
      (participant) =>
        `<li><strong>${escapeHtml(participant.name)}</strong> (${escapeHtml(participant.email)}) — ${escapeHtml(participant.courseNames.join(", "))}</li>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Potvrzení objednávky</title>
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
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(paymentLine)}</p>
              <p style="margin:0 0 8px;font-size:15px;font-weight:bold;">Přehled školení:</p>
              <ul style="margin:0 0 20px 20px;padding:0;font-size:15px;line-height:1.6;">${htmlItems}</ul>
              <p style="margin:0 0 8px;font-size:15px;font-weight:bold;">Přístupy odeslané účastníkům:</p>
              <ul style="margin:0 0 20px 20px;padding:0;font-size:15px;line-height:1.6;">${htmlParticipants}</ul>
              <p style="margin:0;font-size:14px;line-height:1.5;color:#64748b;">
                Tento e-mail slouží jako potvrzení objednávky. Přihlašovací údaje dostává každý účastník na svůj e-mail.
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

  console.info("[Order thank-you email]\n" + text);

  return sendEmail({
    to: input.contactEmail,
    subject: `Potvrzení objednávky ${input.orderNumber} – ${site.name}`,
    text,
    html,
  });
}
