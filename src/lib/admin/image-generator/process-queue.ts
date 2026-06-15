import { prisma } from "@/lib/prisma";
import { generateFluxImage } from "./replicate-flux";
import type { GeneratedImageStatus } from "./types";

function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
}

function getInternalJobSecret(): string | null {
  return (
    process.env.CRON_SECRET?.trim() ??
    process.env.ADMIN_SESSION_SECRET?.trim() ??
    process.env.ADMIN_PASSWORD?.trim() ??
    process.env.ADMIN_IMAGE_PASSWORD?.trim() ??
    process.env.ADMIN_ORDERS_PASSWORD?.trim() ??
    null
  );
}

export async function triggerImageQueueProcessing(): Promise<void> {
  const secret = getInternalJobSecret();
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (secret) {
    headers.Authorization = `Bearer ${secret}`;
  }

  fetch(`${getAppBaseUrl()}/api/admin/generator/process`, {
    method: "POST",
    headers,
    body: JSON.stringify({ source: "queue-trigger" }),
  }).catch((error) => {
    console.error("[image-generator] Nepodařilo se spustit pokračování fronty:", error);
  });
}

export async function processNextGeneratedImage(): Promise<{
  processed: boolean;
  remaining: number;
  waiting?: boolean;
  fileName?: string;
  status?: GeneratedImageStatus;
}> {
  const processingCount = await prisma.generatedImage.count({
    where: { status: "PROCESSING" },
  });

  if (processingCount > 0) {
    const remaining = await prisma.generatedImage.count({
      where: { status: "PENDING" },
    });
    return { processed: false, remaining, waiting: true };
  }

  const next = await prisma.$transaction(async (tx) => {
    const item = await tx.generatedImage.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    if (!item) {
      return null;
    }

    return tx.generatedImage.update({
      where: { id: item.id },
      data: { status: "PROCESSING" },
    });
  });

  if (!next) {
    return { processed: false, remaining: 0 };
  }

  try {
    const imageUrl = await generateFluxImage(next.prompt);

    await prisma.generatedImage.update({
      where: { id: next.id },
      data: {
        status: "COMPLETED",
        imageUrl,
      },
    });

    const remaining = await prisma.generatedImage.count({
      where: { status: "PENDING" },
    });

    return {
      processed: true,
      remaining,
      fileName: next.fileName,
      status: "COMPLETED",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznámá chyba generování.";
    console.error(`[image-generator] ${next.fileName}`, error);

    await prisma.generatedImage.update({
      where: { id: next.id },
      data: { status: "FAILED", errorMessage: message },
    });

    const remaining = await prisma.generatedImage.count({
      where: { status: "PENDING" },
    });

    return {
      processed: true,
      remaining,
      fileName: next.fileName,
      status: "FAILED",
    };
  }
}

export async function runImageQueueWorker(): Promise<{
  processedCount: number;
  remaining: number;
  waiting?: boolean;
}> {
  const result = await processNextGeneratedImage();

  if (result.remaining > 0 && result.processed) {
    await triggerImageQueueProcessing();
  }

  return {
    processedCount: result.processed ? 1 : 0,
    remaining: result.remaining,
    waiting: result.waiting,
  };
}
