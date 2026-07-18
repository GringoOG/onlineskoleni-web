"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export interface ContactFormState {
  ok: boolean;
  message: string;
  /** Unikátní ID pro jednorázové měření konverze na klientovi. */
  trackId?: string;
}

const MIN_FILL_MS = 2_500;
const MAX_MESSAGE_LEN = 5_000;
const MAX_FIELD_LEN = 300;

/** Falešný úspěch bez trackId – boti si myslí, že prošli, Ads konverze se nespustí. */
function silentOk(): ContactFormState {
  return {
    ok: true,
    message:
      "Děkujeme za zprávu. Ozveme se vám co nejdříve na uvedený e-mail. Pro urgentní dotazy volejte +420 720 028 655.",
  };
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  const rate = checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Příliš mnoho odeslání. Zkuste to znovu za ${rate.retryAfterSec} s.`,
    };
  }

  // Honeypot – běžní uživatelé pole nevyplní (je skryté).
  const website = String(formData.get("website") ?? "").trim();
  if (website) {
    console.info("[Contact form] honeypot triggered", { ip });
    return silentOk();
  }

  const loadedAtRaw = String(formData.get("formLoadedAt") ?? "");
  const loadedAt = Number(loadedAtRaw);
  if (!Number.isFinite(loadedAt) || Date.now() - loadedAt < MIN_FILL_MS) {
    console.info("[Contact form] time-trap triggered", { ip });
    return silentOk();
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent");

  if (!name || !email || !message) {
    return {
      ok: false,
      message: "Vyplňte prosím všechna povinná pole.",
    };
  }

  if (
    name.length > MAX_FIELD_LEN ||
    email.length > MAX_FIELD_LEN ||
    message.length > MAX_MESSAGE_LEN
  ) {
    return {
      ok: false,
      message: "Některé pole je příliš dlouhé. Zkraťte prosím text.",
    };
  }

  if (!consent) {
    return {
      ok: false,
      message: "Pro odeslání je nutný souhlas se zpracováním údajů.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      ok: false,
      message: "Zadejte platnou e-mailovou adresu.",
    };
  }

  const company = String(formData.get("company") ?? "").trim().slice(0, MAX_FIELD_LEN);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, MAX_FIELD_LEN);
  const trainingTypes = formData.getAll("trainingTypes").map(String).slice(0, 20);

  // Log for development; replace with Resend/Nodemailer when API key is configured
  console.info("[Contact form]", {
    name,
    company,
    email,
    phone,
    trainingTypes,
    message,
    ip,
  });

  return {
    ok: true,
    message:
      "Děkujeme za zprávu. Ozveme se vám co nejdříve na uvedený e-mail. Pro urgentní dotazy volejte +420 720 028 655.",
    trackId: crypto.randomUUID(),
  };
}
