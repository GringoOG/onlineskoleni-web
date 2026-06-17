import { probeCompletedImageDownload } from "./fetch-completed-image";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 6;

export async function pruneUnavailableCompletedImages(): Promise<{
  checked: number;
  kept: number;
  removed: number;
  removedFileNames: string[];
  refreshed: number;
}> {
  const completed = await prisma.generatedImage.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "asc" },
  });

  let kept = 0;
  let removed = 0;
  let refreshed = 0;
  const removedFileNames: string[] = [];

  for (let index = 0; index < completed.length; index += BATCH_SIZE) {
    const batch = completed.slice(index, index + BATCH_SIZE);
    await Promise.all(
      batch.map(async (image) => {
        const probe = await probeCompletedImageDownload(image);

        if (probe.downloadable) {
          kept += 1;
          if (probe.refreshedUrl && probe.refreshedUrl !== image.imageUrl) {
            await prisma.generatedImage.update({
              where: { id: image.id },
              data: { imageUrl: probe.refreshedUrl },
            });
            refreshed += 1;
          }
          return;
        }

        await prisma.generatedImage.update({
          where: { id: image.id },
          data: {
            status: "FAILED",
            imageUrl: null,
            errorMessage: probe.reason,
            processingStartedAt: null,
            replicatePredictionId: null,
          },
        });

        removed += 1;
        removedFileNames.push(image.fileName);
      })
    );
  }

  return {
    checked: completed.length,
    kept,
    removed,
    removedFileNames,
    refreshed,
  };
}
