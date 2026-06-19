import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { fetchCompletedImageBuffer, ImageDownloadError } from "@/lib/admin/image-generator/fetch-completed-image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Náhled hotového obrázku v admin tabulce (obnoví expirovanou Replicate URL). */
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
      return new NextResponse(null, { status: 404 });
    }

    if (!image.imageUrl && !image.replicatePredictionId) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await fetchCompletedImageBuffer(image);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof ImageDownloadError) {
      return new NextResponse(null, { status: 404 });
    }
    console.error("[admin/generator/preview]", error);
    return new NextResponse(null, { status: 500 });
  }
}
