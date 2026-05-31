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
    return Response.json(
      {
        ok: false,
        error: "Nepodařilo se připojit k LMS databázi.",
      },
      { status: 503 }
    );
  }
}
