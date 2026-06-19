import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Smaže celý seznam generátoru (kromí právě běžících). */
export async function POST() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const processingCount = await prisma.generatedImage.count({
      where: { status: "PROCESSING" },
    });

    if (processingCount > 0) {
      return NextResponse.json(
        {
          error: `Nelze smazat celý seznam – ${processingCount} obrázek právě generuje. Počkejte na dokončení.`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.generatedImage.deleteMany({});

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (error) {
    console.error("[admin/generator/delete-all]", error);
    return NextResponse.json({ error: "Nepodařilo se smazat seznam." }, { status: 500 });
  }
}
