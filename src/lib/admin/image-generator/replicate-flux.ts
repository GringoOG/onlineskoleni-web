import Replicate from "replicate";

const FLUX_MODEL = "black-forest-labs/flux-dev";

function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN není nastaveno v prostředí.");
  }

  return new Replicate({ auth: token });
}

function extractImageUrl(output: unknown): string {
  if (typeof output === "string" && output.startsWith("http")) {
    return output;
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
      const url = (record.url as () => unknown)();
      if (typeof url === "string" && url.startsWith("http")) {
        return url;
      }
    }
    if (typeof record.url === "string" && record.url.startsWith("http")) {
      return record.url;
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
    },
  });

  return extractImageUrl(output);
}
