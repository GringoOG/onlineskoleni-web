import { verifyCronRequest } from "@/lib/cron/verify-cron-request";
import { runImageQueueBatch } from "@/lib/admin/image-generator/process-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Každou minutu zkontroluje frontu generátoru ilustrací (poll Replicate + start další položky). */
export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runImageQueueBatch();
    console.info("[cron/generator-queue]", result);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/generator-queue]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se zpracovat frontu generátoru.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
