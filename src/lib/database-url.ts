/**
 * Jednotný PostgreSQL connection string pro Prisma (objednávky) i Drizzle (LMS).
 * Na Vercelu stačí nastavit DATABASE_URL; LMS_DATABASE_URL je volitelný alias.
 */
export function getPostgresDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.LMS_DATABASE_URL;

  if (!url?.startsWith("postgresql://") && !url?.startsWith("postgres://")) {
    throw new Error(
      "Chybí DATABASE_URL (PostgreSQL). Použijte stejný Supabase connection string jako dříve pro LMS_DATABASE_URL."
    );
  }

  return url;
}

export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? process.env.LMS_DATABASE_URL;
  return (
    !!url &&
    (url.startsWith("postgresql://") || url.startsWith("postgres://"))
  );
}
