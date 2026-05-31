-- Bezpečné přidání sloupce theory_started_at do produkční Supabase databáze.
-- Spusťte v Supabase Dashboard → SQL Editor → New query → Run.
--
-- Idempotentní: pokud sloupec už existuje, příkaz nic nezmění.

ALTER TABLE user_courses
  ADD COLUMN IF NOT EXISTS theory_started_at TIMESTAMPTZ;

-- Volitelná kontrola po spuštění:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'user_courses'
--   AND column_name = 'theory_started_at';
