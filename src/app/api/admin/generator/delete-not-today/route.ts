import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function todayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start };
}

/** Smaže vše kromě záznamů vytvořených dnes (serverový čas). */
export async function POST() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const { start } = todayBounds();

    const kept = await prisma.generatedImage.count({
      where: { createdAt: { gte: start } },
    });

    const result = await prisma.generatedImage.deleteMany({
      where: { createdAt: { lt: start } },
    });

    return NextResponse.json({
      ok: true,
      deleted: result.count,
      kept,
      date: start.toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error("[admin/generator/delete-not-today]", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat starší záznamy." },
      { status: 500 }
    );
  }
}
