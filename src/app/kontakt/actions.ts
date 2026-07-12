"use server";

export interface ContactFormState {
  ok: boolean;
  message: string;
  /** Unikátní ID pro jednorázové měření konverze na klientovi. */
  trackId?: string;
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
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

  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const trainingTypes = formData.getAll("trainingTypes").map(String);

  // Log for development; replace with Resend/Nodemailer when API key is configured
  console.info("[Contact form]", {
    name,
    company,
    email,
    phone,
    trainingTypes,
    message,
  });

  return {
    ok: true,
    message:
      "Děkujeme za zprávu. Ozveme se vám co nejdříve na uvedený e-mail. Pro urgentní dotazy volejte +420 720 028 655.",
    trackId: crypto.randomUUID(),
  };
}
