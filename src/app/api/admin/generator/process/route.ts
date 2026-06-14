import { NextResponse } from "next/server";
import { isAuthorizedGeneratorJob } from "@/lib/admin/api-access";
import { runImageQueueWorker } from "@/lib/admin/image-generator/process-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Zpracuje další obrázek ve frontě a případně spustí další běh na pozadí. */
export async function POST(request: Request) {
  try {
    if (!(await isAuthorizedGeneratorJob(request))) {
      return NextResponse.json({ error: "Nejste autorizováni." }, { status: 401 });
    }

    const result = await runImageQueueWorker();

    return NextResponse.json({
      ok: true,
      processedCount: result.processedCount,
      remaining: result.remaining,
    });
  } catch (error) {
    console.error("[admin/generator/process]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se zpracovat frontu generování.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
