import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getPostgresDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  lmsClient: ReturnType<typeof postgres> | undefined;
  lmsDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function getLmsDb() {
  if (globalForDb.lmsDb) {
    return globalForDb.lmsDb;
  }

  const url = getPostgresDatabaseUrl();
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
