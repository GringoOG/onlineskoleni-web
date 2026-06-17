import { NextResponse } from "next/server";
import { requireGeneratorApiAccess } from "@/lib/admin/api-access";
import { pruneUnavailableCompletedImages } from "@/lib/admin/image-generator/prune-unavailable-images";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Odstraní z hotových položek obrázky, které už nejdou stáhnout. */
export async function POST() {
  try {
    const authError = await requireGeneratorApiAccess();
    if (authError) return authError;

    const result = await pruneUnavailableCompletedImages();

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[admin/generator/prune-unavailable]", error);
    return NextResponse.json(
      { error: "Nepodařilo se zkontrolovat dostupnost obrázků." },
      { status: 500 }
    );
  }
}
