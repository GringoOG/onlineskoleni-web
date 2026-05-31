import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { generateTemporaryPassword } from "@/lib/lms/generate-credentials";
import { hashPassword } from "@/lib/lms/password";

export interface StudentRecord {
  id: string;
  email: string;
  name: string;
  isNew: boolean;
  /** Pouze u nově vytvořeného účtu – pro uvítací e-mail. */
  temporaryPassword?: string;
}

export async function findOrCreateStudent(input: {
  email: string;
  name: string;
  companyName: string;
}): Promise<StudentRecord> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const companyName = input.companyName.trim();

  const [existing] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      isNew: false,
    };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);

  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      companyName,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  return {
    id: created.id,
    email: created.email,
    name: created.name,
    isNew: true,
    temporaryPassword,
  };
}
