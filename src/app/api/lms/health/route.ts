import { db, users } from "@/db";

/** Ověření připojení LMS databáze (Supabase/Neon). */
export async function GET() {
  const hasUrl =
    !!process.env.DATABASE_URL ||
    !!process.env.LMS_DATABASE_URL;

  if (!hasUrl) {
    return Response.json(
      {
        ok: false,
        error: "DATABASE_URL (PostgreSQL) není nastavená.",
      },
      { status: 503 }
    );
  }

  try {
    await db.select({ id: users.id }).from(users).limit(1);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[GET /api/lms/health]", error);
    const message =
      error instanceof Error ? error.message : "Nepodařilo se připojit k LMS databázi.";
    const poolExhausted = message.includes("max clients");
    return Response.json(
      {
        ok: false,
        error: poolExhausted
          ? "Databáze má dočasně vyčerpaný limit připojení. Zkuste za 1–2 minuty znovu, nebo na Vercelu použijte Supabase Transaction pooler (port 6543)."
          : "Nepodařilo se připojit k LMS databázi.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }
}
