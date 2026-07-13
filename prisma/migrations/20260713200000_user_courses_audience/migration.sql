-- LMS (Drizzle) sloupec pro typ školení z objednávky (zaměstnanec / vedoucí)
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "audience" TEXT;
