import Replicate from "replicate";

const FLUX_MODEL = process.env.REPLICATE_FLUX_MODEL?.trim() || "black-forest-labs/flux-dev";

export type FluxPredictionState =
  | { status: "running" }
  | { status: "succeeded"; imageUrl: string }
  | { status: "failed"; error: string };

function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN není nastaveno v prostředí.");
  }

  return new Replicate({ auth: token });
}

function getFluxInput(prompt: string) {
  return {
    prompt,
    aspect_ratio: "4:3",
    output_format: "png",
    num_outputs: 1,
    go_fast: true,
    num_inference_steps: 20,
  };
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value === "string" && value.startsWith("http")) {
    return value;
  }

  if (value instanceof URL) {
    return value.href;
  }

  if (value && typeof value === "object" && "href" in value) {
    const href = (value as { href: unknown }).href;
    if (typeof href === "string" && href.startsWith("http")) {
      return href;
    }
  }

  return null;
}

function extractImageUrl(output: unknown): string {
  const direct = normalizeImageUrl(output);
  if (direct) {
    return direct;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
  }

  if (output && typeof output === "object") {
    const record = output as Record<string, unknown>;

    if (typeof record.url === "function") {
      const url = normalizeImageUrl((record.url as () => unknown)());
      if (url) return url;
    }

    if (typeof record.href === "function") {
      const url = normalizeImageUrl((record.href as () => unknown)());
      if (url) return url;
    }

    const asString =
      typeof record.toString === "function" ? record.toString.call(record) : null;
    const fromString = normalizeImageUrl(asString);
    if (fromString) {
      return fromString;
    }
  }

  throw new Error("Replicate nevrátilo platnou URL obrázku.");
}

function formatPredictionError(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error) {
    return JSON.stringify(error);
  }

  return "Replicate prediction selhalo.";
}

/** Spustí generování na Replicate bez čekání na výsledek. */
export async function startFluxPrediction(prompt: string): Promise<string> {
  const replicate = getReplicateClient();

  const prediction = await replicate.predictions.create({
    model: FLUX_MODEL,
    input: getFluxInput(prompt),
    wait: false,
  });

  if (!prediction.id) {
    throw new Error("Replicate nevrátilo ID predikce.");
  }

  return prediction.id;
}

/** Zjistí stav běžící nebo dokončené predikce. */
export async function getFluxPredictionState(predictionId: string): Promise<FluxPredictionState> {
  const replicate = getReplicateClient();
  const prediction = await replicate.predictions.get(predictionId);

  if (prediction.status === "succeeded") {
    return {
      status: "succeeded",
      imageUrl: extractImageUrl(prediction.output),
    };
  }

  if (prediction.status === "failed" || prediction.status === "canceled" || prediction.status === "aborted") {
    return {
      status: "failed",
      error: formatPredictionError(prediction.error),
    };
  }

  return { status: "running" };
}
