import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Smaže všechny položky se stavem FAILED. */
export async function POST() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const result = await prisma.generatedImage.deleteMany({
      where: { status: "FAILED" },
    });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (error) {
    console.error("[admin/generator/delete-failed]", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat chybné položky." },
      { status: 500 }
    );
  }
}
