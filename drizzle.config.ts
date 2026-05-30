import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.LMS_DATABASE_URL;

if (!url) {
  throw new Error(
    "Chybí LMS_DATABASE_URL v .env – vložte connection string z Supabase nebo Neon (PostgreSQL)."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
