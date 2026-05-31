import { site } from "@/lib/content";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() ??
    `${site.name} <onboarding@resend.dev>`
  );
}

/** Odešle e-mail přes Resend API. Bez RESEND_API_KEY pouze zaloguje (dev). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[email] RESEND_API_KEY chybí – e-mail neodeslán: „${input.subject}“ → ${recipients.join(", ")}`
      );
    }
    return { sent: false, skipped: true, error: "resend_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFromAddress(),
        to: recipients,
        subject: input.subject,
        text: input.text,
        reply_to: input.replyTo,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      console.error("[email] Resend API chyba:", response.status, body);
      return {
        sent: false,
        error: body.message ?? `Resend HTTP ${response.status}`,
      };
    }

    console.info(
      `[email] Odesláno: „${input.subject}“ → ${recipients.join(", ")} (id: ${body.id ?? "?"})`
    );
    return { sent: true, id: body.id };
  } catch (error) {
    console.error("[email] Odeslání selhalo:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
