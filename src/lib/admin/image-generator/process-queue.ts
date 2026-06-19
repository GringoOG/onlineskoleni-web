import { prisma } from "@/lib/prisma";
import { getFluxPredictionState, startFluxPrediction } from "./replicate-flux";
import type { GeneratedImageStatus } from "./types";

const STALE_BLOCKING_PROCESSING_MS = 90 * 1000;
const STALE_PREDICTION_MS = 12 * 60 * 1000;
const POLL_INTERVAL_MS = 4000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function recoverStaleBlockingProcessingItems(): Promise<number> {
  const staleBefore = new Date(Date.now() - STALE_BLOCKING_PROCESSING_MS);

  const result = await prisma.generatedImage.updateMany({
    where: {
      status: "PROCESSING",
      replicatePredictionId: null,
      OR: [
        { processingStartedAt: { lt: staleBefore } },
        {
          processingStartedAt: null,
          createdAt: { lt: staleBefore },
        },
      ],
    },
    data: {
      status: "PENDING",
      processingStartedAt: null,
      errorMessage: null,
    },
  });

  if (result.count > 0) {
    console.warn(`[image-generator] Znovu zařazeno ${result.count} zaseknutých položek bez predikce.`);
  }

  return result.count;
}

/** Uvolní frontu zaseknutou na dlouho běžící Replicate predikci. */
async function recoverStalePredictionItems(): Promise<number> {
  const staleBefore = new Date(Date.now() - STALE_PREDICTION_MS);

  const staleItems = await prisma.generatedImage.findMany({
    where: {
      status: "PROCESSING",
      replicatePredictionId: { not: null },
      OR: [
        { processingStartedAt: { lt: staleBefore } },
        {
          processingStartedAt: null,
          createdAt: { lt: staleBefore },
        },
      ],
    },
    select: {
      id: true,
      fileName: true,
      replicatePredictionId: true,
    },
  });

  let recovered = 0;

  for (const item of staleItems) {
    if (!item.replicatePredictionId) {
      continue;
    }

    try {
      const state = await getFluxPredictionState(item.replicatePredictionId);

      if (state.status === "succeeded") {
        await prisma.generatedImage.update({
          where: { id: item.id },
          data: {
            status: "COMPLETED",
            imageUrl: state.imageUrl,
            processingStartedAt: null,
            errorMessage: null,
          },
        });
        recovered += 1;
        continue;
      }

      if (state.status === "failed") {
        await prisma.generatedImage.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            errorMessage: state.error,
            processingStartedAt: null,
            replicatePredictionId: null,
          },
        });
        recovered += 1;
        continue;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Replicate nedostupné.";
      console.warn(`[image-generator] Stale poll ${item.fileName}:`, message);
    }

    await prisma.generatedImage.update({
      where: { id: item.id },
      data: {
        status: "PENDING",
        replicatePredictionId: null,
        processingStartedAt: null,
        errorMessage: null,
      },
    });
    recovered += 1;
    console.warn(`[image-generator] Znovu zařazeno ${item.fileName} po vypršení čekání na Replicate.`);
  }

  return recovered;
}

/** Ruční uvolnění fronty – okamžitě zkontroluje všechny PROCESSING položky. */
export async function forceRecoverStuckQueueItems(): Promise<{
  recoveredWithoutPrediction: number;
  recoveredStalePrediction: number;
}> {
  const recoveredWithoutPrediction = await recoverStaleBlockingProcessingItems();
  const forceRequeueBefore = new Date(Date.now() - 2 * 60 * 1000);

  const stuckWithPrediction = await prisma.generatedImage.findMany({
    where: {
      status: "PROCESSING",
      replicatePredictionId: { not: null },
    },
    select: {
      id: true,
      fileName: true,
      replicatePredictionId: true,
      processingStartedAt: true,
      createdAt: true,
    },
    orderBy: { processingStartedAt: "asc" },
  });

  let recoveredStalePrediction = 0;

  for (const item of stuckWithPrediction) {
    if (!item.replicatePredictionId) {
      continue;
    }

    const startedAt = item.processingStartedAt ?? item.createdAt;
    const canForceRequeue = startedAt < forceRequeueBefore;

    try {
      const state = await getFluxPredictionState(item.replicatePredictionId);

      if (state.status === "succeeded") {
        await prisma.generatedImage.update({
          where: { id: item.id },
          data: {
            status: "COMPLETED",
            imageUrl: state.imageUrl,
            processingStartedAt: null,
            errorMessage: null,
          },
        });
        recoveredStalePrediction += 1;
        continue;
      }

      if (state.status === "failed") {
        await prisma.generatedImage.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            errorMessage: state.error,
            processingStartedAt: null,
            replicatePredictionId: null,
          },
        });
        recoveredStalePrediction += 1;
        continue;
      }

      if (!canForceRequeue) {
        continue;
      }
    } catch (error) {
      console.warn(`[image-generator] Force unstick ${item.fileName}:`, error);
      if (!canForceRequeue) {
        continue;
      }
    }

    await prisma.generatedImage.update({
      where: { id: item.id },
      data: {
        status: "PENDING",
        replicatePredictionId: null,
        processingStartedAt: null,
        errorMessage: null,
      },
    });
    recoveredStalePrediction += 1;
  }

  return {
    recoveredWithoutPrediction,
    recoveredStalePrediction,
  };
}

export async function recoverStuckQueueItems(): Promise<{
  recoveredWithoutPrediction: number;
  recoveredStalePrediction: number;
}> {
  const recoveredWithoutPrediction = await recoverStaleBlockingProcessingItems();
  const recoveredStalePrediction = await recoverStalePredictionItems();

  return { recoveredWithoutPrediction, recoveredStalePrediction };
}

async function countPending(): Promise<number> {
  return prisma.generatedImage.count({ where: { status: "PENDING" } });
}

async function pollProcessingItem(item: {
  id: string;
  fileName: string;
  replicatePredictionId: string;
}): Promise<{
  processed: boolean;
  remaining: number;
  waiting?: boolean;
  fileName?: string;
  status?: GeneratedImageStatus;
}> {
  const state = await getFluxPredictionState(item.replicatePredictionId);

  if (state.status === "running") {
    const remaining = await countPending();
    return {
      processed: false,
      remaining,
      waiting: true,
      fileName: item.fileName,
      status: "PROCESSING",
    };
  }

  if (state.status === "succeeded") {
    await prisma.generatedImage.update({
      where: { id: item.id },
      data: {
        status: "COMPLETED",
        imageUrl: state.imageUrl,
        processingStartedAt: null,
        errorMessage: null,
      },
    });

    const remaining = await countPending();
    return {
      processed: true,
      remaining,
      fileName: item.fileName,
      status: "COMPLETED",
    };
  }

  await prisma.generatedImage.update({
    where: { id: item.id },
    data: {
      status: "FAILED",
      errorMessage: state.error,
      processingStartedAt: null,
      replicatePredictionId: null,
    },
  });

  const remaining = await countPending();
  return {
    processed: true,
    remaining,
    fileName: item.fileName,
    status: "FAILED",
  };
}

async function startNextPendingItem(): Promise<{
  processed: boolean;
  remaining: number;
  waiting?: boolean;
  fileName?: string;
  status?: GeneratedImageStatus;
} | null> {
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
      data: {
        status: "PROCESSING",
        processingStartedAt: new Date(),
        replicatePredictionId: null,
        errorMessage: null,
      },
    });
  });

  if (!next) {
    return null;
  }

  try {
    const predictionId = await startFluxPrediction(next.prompt);

    await prisma.generatedImage.update({
      where: { id: next.id },
      data: { replicatePredictionId: predictionId },
    });

    const remaining = await countPending();
    return {
      processed: false,
      remaining,
      waiting: true,
      fileName: next.fileName,
      status: "PROCESSING",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznámá chyba generování.";
    console.error(`[image-generator] ${next.fileName}`, error);

    await prisma.generatedImage.update({
      where: { id: next.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        processingStartedAt: null,
        replicatePredictionId: null,
      },
    });

    const remaining = await countPending();
    return {
      processed: true,
      remaining,
      fileName: next.fileName,
      status: "FAILED",
    };
  }
}

export async function processNextGeneratedImage(): Promise<{
  processed: boolean;
  remaining: number;
  waiting?: boolean;
  fileName?: string;
  status?: GeneratedImageStatus;
}> {
  await recoverStuckQueueItems();

  const activePrediction = await prisma.generatedImage.findFirst({
    where: {
      status: "PROCESSING",
      replicatePredictionId: { not: null },
    },
    orderBy: { processingStartedAt: "asc" },
  });

  if (activePrediction?.replicatePredictionId) {
    return pollProcessingItem({
      id: activePrediction.id,
      fileName: activePrediction.fileName,
      replicatePredictionId: activePrediction.replicatePredictionId,
    });
  }

  const legacyProcessing = await prisma.generatedImage.count({
    where: {
      status: "PROCESSING",
      replicatePredictionId: null,
    },
  });

  if (legacyProcessing > 0) {
    const remaining = await countPending();
    return { processed: false, remaining, waiting: true };
  }

  const started = await startNextPendingItem();
  if (started) {
    return started;
  }

  return { processed: false, remaining: 0 };
}

export async function runImageQueueWorker(): Promise<{
  processedCount: number;
  remaining: number;
  waiting?: boolean;
}> {
  const result = await processNextGeneratedImage();

  const shouldContinue = result.waiting || result.remaining > 0;
  if (shouldContinue) {
    await triggerImageQueueProcessing();
  }

  return {
    processedCount: result.processed ? 1 : 0,
    remaining: result.remaining,
    waiting: result.waiting,
  };
}

/** Zpracuje frontu v jednom cron běhu (poll + start dalších položek). */
export async function runImageQueueBatch(maxSteps = 15): Promise<{
  steps: number;
  completed: number;
  failed: number;
  remaining: number;
  waiting: boolean;
}> {
  let completed = 0;
  let failed = 0;
  let steps = 0;
  let lastRemaining = 0;
  let lastWaiting = false;

  for (steps = 1; steps <= maxSteps; steps++) {
    const result = await processNextGeneratedImage();
    lastRemaining = result.remaining;
    lastWaiting = Boolean(result.waiting);

    if (result.status === "COMPLETED") {
      completed += 1;
    } else if (result.status === "FAILED") {
      failed += 1;
    }

    if (result.remaining === 0 && !result.waiting) {
      break;
    }

    if (result.waiting && result.status === "PROCESSING") {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }
  }

  if (lastRemaining > 0 || lastWaiting) {
    await triggerImageQueueProcessing();
  }

  return {
    steps,
    completed,
    failed,
    remaining: lastRemaining,
    waiting: lastWaiting,
  };
}
