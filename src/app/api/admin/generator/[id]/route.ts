import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DELETABLE_STATUSES = new Set(["FAILED", "PENDING"]);

/** Smaže jednu položku (jen FAILED nebo PENDING). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const { id } = await context.params;
    const item = await prisma.generatedImage.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Položka nebyla nalezena." }, { status: 404 });
    }

    if (item.status === "PROCESSING") {
      return NextResponse.json(
        { error: "Právě probíhající generování nelze smazat." },
        { status: 400 }
      );
    }

    if (!DELETABLE_STATUSES.has(item.status)) {
      return NextResponse.json(
        { error: "Hotové obrázky lze pouze stáhnout, ne smazat." },
        { status: 400 }
      );
    }

    await prisma.generatedImage.delete({ where: { id } });

    return NextResponse.json({ ok: true, fileName: item.fileName });
  } catch (error) {
    console.error("[admin/generator DELETE]", error);
    return NextResponse.json({ error: "Nepodařilo se smazat položku." }, { status: 500 });
  }
}
