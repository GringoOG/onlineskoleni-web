import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  lmsClient: ReturnType<typeof postgres> | undefined;
  lmsDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function getLmsDb() {
  if (globalForDb.lmsDb) {
    return globalForDb.lmsDb;
  }

  const url = process.env.LMS_DATABASE_URL;
  if (!url?.startsWith("postgresql://") && !url?.startsWith("postgres://")) {
    throw new Error(
      "LMS vyžaduje LMS_DATABASE_URL s PostgreSQL connection stringem (Supabase nebo Neon)."
    );
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.lmsClient = client;
    globalForDb.lmsDb = db;
  }

  return db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getLmsDb(), prop, receiver);
  },
});

export * from "./schema";
