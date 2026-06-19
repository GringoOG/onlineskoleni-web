import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import {
  forceRecoverStuckQueueItems,
  runImageQueueWorker,
} from "@/lib/admin/image-generator/process-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Uvolní zaseknutou frontu a znovu spustí zpracování. */
export async function POST() {
  const denied = await requireGeneratorApiAccess();
  if (denied) {
    return denied;
  }

  try {
    const recovered = await forceRecoverStuckQueueItems();
    const worker = await runImageQueueWorker();

    return NextResponse.json({
      ok: true,
      recovered,
      remaining: worker.remaining,
      waiting: worker.waiting,
    });
  } catch (error) {
    console.error("[admin/generator/unstick]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se uvolnit frontu generování.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
