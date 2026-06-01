import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDrizzleDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  lmsClient: ReturnType<typeof postgres> | undefined;
  lmsDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function getLmsDb() {
  if (globalForDb.lmsDb && globalForDb.lmsClient) {
    return globalForDb.lmsDb;
  }

  const url = getDrizzleDatabaseUrl();
  const client = postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  const db = drizzle(client, { schema });

  globalForDb.lmsClient = client;
  globalForDb.lmsDb = db;

  return db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getLmsDb(), prop, receiver);
  },
});

export * from "./schema";
