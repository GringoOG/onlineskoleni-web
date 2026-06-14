import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { parsePromptLines } from "@/lib/admin/image-generator/parse-prompt-lines";
import { triggerImageQueueProcessing } from "@/lib/admin/image-generator/process-queue";
import type { GeneratedImageRecord } from "@/lib/admin/image-generator/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeImage(image: {
  id: string;
  fileName: string;
  prompt: string;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
}): GeneratedImageRecord {
  return {
    id: image.id,
    fileName: image.fileName,
    prompt: image.prompt,
    imageUrl: image.imageUrl,
    status: image.status as GeneratedImageRecord["status"],
    createdAt: image.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const images = await prisma.generatedImage.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({
      images: images.map(serializeImage),
    });
  } catch (error) {
    console.error("[admin/generator GET]", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst seznam generovaných obrázků." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const body = await request.json();
    const rawInput = String(body.rawInput ?? body.promptsText ?? "").trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: "Vložte prompty ve formátu KÓD_OTÁZKY | PROMPT." },
        { status: 400 }
      );
    }

    const parsed = parsePromptLines(rawInput);
    if (parsed.errors.length > 0) {
      return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });
    }

    const created = await prisma.$transaction(
      parsed.lines.map((line) =>
        prisma.generatedImage.create({
          data: {
            fileName: line.fileName,
            prompt: line.prompt,
            status: "PENDING",
          },
        })
      )
    );

    triggerImageQueueProcessing();

    return NextResponse.json({
      ok: true,
      queued: created.length,
      images: created.map(serializeImage),
    });
  } catch (error) {
    console.error("[admin/generator POST]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se zařadit prompty do fronty.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
