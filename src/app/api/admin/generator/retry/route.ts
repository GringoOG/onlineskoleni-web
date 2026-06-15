import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { triggerImageQueueProcessing } from "@/lib/admin/image-generator/process-queue";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Vrátí chybné položky zpět do fronty. */
export async function POST() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const result = await prisma.generatedImage.updateMany({
      where: { status: "FAILED" },
      data: { status: "PENDING", errorMessage: null, processingStartedAt: null, replicatePredictionId: null },
    });

    if (result.count > 0) {
      triggerImageQueueProcessing();
    }

    return NextResponse.json({ ok: true, retried: result.count });
  } catch (error) {
    console.error("[admin/generator/retry]", error);
    return NextResponse.json({ error: "Nepodařilo se znovu zařadit chybné položky." }, { status: 500 });
  }
}
