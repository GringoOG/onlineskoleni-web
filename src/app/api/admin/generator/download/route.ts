import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Nejste přihlášeni do administrace." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Chybí parametr id." }, { status: 400 });
    }

    const image = await prisma.generatedImage.findUnique({ where: { id } });

    if (!image || image.status !== "COMPLETED" || !image.imageUrl) {
      return NextResponse.json({ error: "Obrázek není k dispozici ke stažení." }, { status: 404 });
    }

    const upstream = await fetch(image.imageUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Nepodařilo se načíst obrázek z Replicate." }, { status: 502 });
    }

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        "Content-Disposition": `attachment; filename="${image.fileName}.png"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[admin/generator/download]", error);
    return NextResponse.json({ error: "Stažení se nezdařilo." }, { status: 500 });
  }
}
