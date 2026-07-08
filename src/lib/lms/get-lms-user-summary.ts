import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getLmsSession } from "@/lib/lms/session";

export interface LmsUserSummary {
  name: string;
  email: string;
}

/** Krátký přehled přihlášeného studenta pro hlavičku webu. */
export async function getLmsUserSummary(): Promise<LmsUserSummary | null> {
  const session = await getLmsSession();
  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return user;
}
