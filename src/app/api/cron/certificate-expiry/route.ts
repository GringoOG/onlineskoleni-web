import { verifyCronRequest } from "@/lib/cron/verify-cron-request";
import { processCertificateExpiryReminders } from "@/lib/lms/process-certificate-expiry-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Denní kontrola certifikátů s končící platností a odeslání připomínky obnovy. */
export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processCertificateExpiryReminders();
    console.info("[cron/certificate-expiry]", result);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/certificate-expiry]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se zpracovat připomínky.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
