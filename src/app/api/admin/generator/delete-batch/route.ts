import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DELETABLE_STATUSES = ["FAILED", "PENDING", "COMPLETED"] as const;

/** Smaže označené položky (kromě právě běžících). */
export async function POST(request: Request) {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const body = await request.json();
    const ids = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id).trim()).filter(Boolean)
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Nejsou vybrány žádné položky ke smazání." }, { status: 400 });
    }

    const processing = await prisma.generatedImage.count({
      where: { id: { in: ids }, status: "PROCESSING" },
    });

    if (processing > 0) {
      return NextResponse.json(
        { error: "Mezi označenými je položka, která právě generuje – nelze smazat." },
        { status: 400 }
      );
    }

    const result = await prisma.generatedImage.deleteMany({
      where: {
        id: { in: ids },
        status: { in: [...DELETABLE_STATUSES] },
      },
    });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (error) {
    console.error("[admin/generator/delete-batch]", error);
    return NextResponse.json({ error: "Nepodařilo se smazat označené položky." }, { status: 500 });
  }
}
