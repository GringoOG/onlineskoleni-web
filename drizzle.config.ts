import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL ?? process.env.LMS_DATABASE_URL;

if (!url) {
  throw new Error(
    "Chybí DATABASE_URL v .env – vložte Supabase PostgreSQL connection string."
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
