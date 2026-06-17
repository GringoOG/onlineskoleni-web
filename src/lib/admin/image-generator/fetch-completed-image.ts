import { getFluxPredictionState } from "./replicate-flux";
import { prisma } from "@/lib/prisma";

export class ImageDownloadError extends Error {
  constructor(
    message: string,
    readonly fileName: string
  ) {
    super(message);
    this.name = "ImageDownloadError";
  }
}

async function fetchFromUrl(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return response.arrayBuffer();
  } catch {
    return null;
  }
}

type CompletedImageRef = {
  id: string;
  fileName: string;
  imageUrl: string | null;
  replicatePredictionId: string | null;
};

function unavailableReason(image: CompletedImageRef): string {
  return image.replicatePredictionId
    ? "Obrázek už není na Replicate k dispozici – vygenerujte znovu."
    : "Odkaz na obrázek vypršel – vygenerujte znovu.";
}

/** Ověří, zda jde hotový obrázek stáhnout (včetně obnovy URL z Replicate). */
export async function probeCompletedImageDownload(
  image: CompletedImageRef
): Promise<{ downloadable: true; refreshedUrl?: string } | { downloadable: false; reason: string }> {
  if (image.imageUrl) {
    const cached = await fetchFromUrl(image.imageUrl);
    if (cached) {
      return { downloadable: true };
    }
  }

  if (image.replicatePredictionId) {
    try {
      const state = await getFluxPredictionState(image.replicatePredictionId);
      if (state.status === "succeeded") {
        const refreshed = await fetchFromUrl(state.imageUrl);
        if (refreshed) {
          return { downloadable: true, refreshedUrl: state.imageUrl };
        }
      }
    } catch {
      // fall through to unavailable
    }
  }

  return { downloadable: false, reason: unavailableReason(image) };
}

/** Stáhne hotový obrázek; při expirované URL zkusí obnovit z Replicate predikce. */
export async function fetchCompletedImageBuffer(image: CompletedImageRef): Promise<ArrayBuffer> {
  const probe = await probeCompletedImageDownload(image);
  if (!probe.downloadable) {
    throw new ImageDownloadError(probe.reason, image.fileName);
  }

  if (probe.refreshedUrl) {
    await prisma.generatedImage.update({
      where: { id: image.id },
      data: { imageUrl: probe.refreshedUrl },
    });
    const buffer = await fetchFromUrl(probe.refreshedUrl);
    if (buffer) {
      return buffer;
    }
  }

  if (image.imageUrl) {
    const cached = await fetchFromUrl(image.imageUrl);
    if (cached) {
      return cached;
    }
  }

  throw new ImageDownloadError(unavailableReason(image), image.fileName);
}
