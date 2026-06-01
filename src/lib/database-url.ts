/**
 * Jednotný PostgreSQL connection string pro Prisma (objednávky) i Drizzle (LMS).
 * Na Vercelu stačí nastavit DATABASE_URL; LMS_DATABASE_URL je volitelný alias.
 *
 * Pro serverless (Vercel) používejte Supabase **Transaction pooler** (port 6543),
 * ne Session pooler (5432) – jinak rychle narazíte na limit připojení.
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

/** Connection string pro Drizzle – na Supabase pooleru preferuje transaction mode (6543). */
export function getDrizzleDatabaseUrl(): string {
  return preferSupabaseTransactionPooler(getPostgresDatabaseUrl());
}

/** Prisma na serverless – stejná normalizace jako u Drizzle. */
export function getPrismaDatabaseUrl(): string {
  return preferSupabaseTransactionPooler(getPostgresDatabaseUrl());
}

function preferSupabaseTransactionPooler(url: string): string {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("pooler.supabase.com") &&
      (parsed.port === "5432" || parsed.port === "")
    ) {
      parsed.port = "6543";
    }

    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? process.env.LMS_DATABASE_URL;
  return (
    !!url &&
    (url.startsWith("postgresql://") || url.startsWith("postgres://"))
  );
}
