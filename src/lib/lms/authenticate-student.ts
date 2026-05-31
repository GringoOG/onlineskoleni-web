import { and, eq } from "drizzle-orm";
import { courses, db, userCourses, users } from "@/db";
import { verifyPassword } from "@/lib/lms/password";

export interface AuthenticatedStudent {
  userId: string;
  courseId: string;
  email: string;
  name: string;
}

/** Přihlášení studenta e-mailem a heslem (účet z objednávky). */
export async function authenticateStudentByEmail(
  email: string,
  password: string
): Promise<AuthenticatedStudent | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user?.passwordHash) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const enrollments = await db
    .select({
      courseId: userCourses.courseId,
      slug: courses.slug,
      isCompleted: userCourses.isCompleted,
    })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(eq(userCourses.userId, user.id));

  if (enrollments.length === 0) {
    return null;
  }

  const preferred =
    enrollments.find((e) => e.slug === "bozp" && !e.isCompleted) ??
    enrollments.find((e) => e.slug === "bozp") ??
    enrollments.find((e) => !e.isCompleted) ??
    enrollments[0];

  return {
    userId: user.id,
    courseId: preferred.courseId,
    email: user.email,
    name: user.name,
  };
}
