-- Připomínka obnovy certifikátu (LMS / Drizzle)
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS expiry_reminder_sent_at TIMESTAMP;
