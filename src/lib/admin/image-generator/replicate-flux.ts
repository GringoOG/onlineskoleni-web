import Replicate from "replicate";

const FLUX_MODEL = "black-forest-labs/flux-dev";

function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN není nastaveno v prostředí.");
  }

  return new Replicate({ auth: token });
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

export async function generateFluxImage(prompt: string): Promise<string> {
  const replicate = getReplicateClient();

  const output = await replicate.run(FLUX_MODEL, {
    input: {
      prompt,
      aspect_ratio: "4:3",
      output_format: "png",
      num_outputs: 1,
      go_fast: true,
      num_inference_steps: 28,
    },
  });

  return extractImageUrl(output);
}
