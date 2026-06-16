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

/** Stáhne hotový obrázek; při expirované URL zkusí obnovit z Replicate predikce. */
export async function fetchCompletedImageBuffer(image: {
  id: string;
  fileName: string;
  imageUrl: string | null;
  replicatePredictionId: string | null;
}): Promise<ArrayBuffer> {
  if (image.imageUrl) {
    const cached = await fetchFromUrl(image.imageUrl);
    if (cached) {
      return cached;
    }
  }

  if (image.replicatePredictionId) {
    const state = await getFluxPredictionState(image.replicatePredictionId);
    if (state.status === "succeeded") {
      const refreshed = await fetchFromUrl(state.imageUrl);
      if (refreshed) {
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { imageUrl: state.imageUrl },
        });
        return refreshed;
      }
    }
  }

  throw new ImageDownloadError(
    image.replicatePredictionId
      ? "Obrázek už není na Replicate k dispozici – vygenerujte znovu."
      : "Odkaz na obrázek vypršel a není uložené ID predikce – vygenerujte znovu.",
    image.fileName
  );
}
