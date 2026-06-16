import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { fetchCompletedImageBuffer, ImageDownloadError } from "@/lib/admin/image-generator/fetch-completed-image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Chybí parametr id." }, { status: 400 });
    }

    const image = await prisma.generatedImage.findUnique({ where: { id } });

    if (!image || image.status !== "COMPLETED") {
      return NextResponse.json({ error: "Obrázek není k dispozici ke stažení." }, { status: 404 });
    }

    if (!image.imageUrl && !image.replicatePredictionId) {
      return NextResponse.json({ error: "Obrázek není k dispozici ke stažení." }, { status: 404 });
    }

    const buffer = await fetchCompletedImageBuffer(image);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${image.fileName}.png"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof ImageDownloadError) {
      return NextResponse.json({ error: error.message, fileName: error.fileName }, { status: 502 });
    }
    console.error("[admin/generator/download]", error);
    return NextResponse.json({ error: "Stažení se nezdařilo." }, { status: 500 });
  }
}
