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
  fileName?: string;
  status?: GeneratedImageStatus;
}> {
  const next = await prisma.generatedImage.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  if (!next) {
    const remaining = await prisma.generatedImage.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    });
    return { processed: false, remaining };
  }

  await prisma.generatedImage.update({
    where: { id: next.id },
    data: { status: "PROCESSING" },
  });

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
    console.error(`[image-generator] ${next.fileName}`, error);

    await prisma.generatedImage.update({
      where: { id: next.id },
      data: { status: "FAILED" },
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
}> {
  const result = await processNextGeneratedImage();

  if (result.remaining > 0) {
    await triggerImageQueueProcessing();
  }

  return {
    processedCount: result.processed ? 1 : 0,
    remaining: result.remaining,
  };
}
