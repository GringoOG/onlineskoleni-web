import { and, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { courses, db, userCourses, users } from "@/db";
import { isDemoUserEmail } from "@/lib/lms/demo-user";
import { getLmsSession } from "@/lib/lms/session";

/** Placené přiřazení kurzu = zápis s číslem objednávky (ne veřejné demo). */
export async function hasPaidCourseEnrollment(
  userId: string,
  courseSlug: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: userCourses.id })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(
      and(
        eq(userCourses.userId, userId),
        eq(courses.slug, courseSlug),
        isNotNull(userCourses.orderNumber)
      )
    )
    .limit(1);

  return Boolean(row);
}

export async function getSessionUserEmail(userId: string): Promise<string | null> {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.email ?? null;
}

/**
 * Ostrý závěrečný test jen pro zaplacený LMS účet (ne demo testik).
 * Veřejné demo smí jen demo testy.
 */
export async function canTakeOfficialTest(
  userId: string,
  courseSlug: string
): Promise<boolean> {
  const email = await getSessionUserEmail(userId);
  if (!email || isDemoUserEmail(email)) {
    return false;
  }
  return hasPaidCourseEnrollment(userId, courseSlug);
}

/** Stránky /zaverecny – demo a neplacené uživatele přesměruje pryč. */
export async function requireOfficialTestAccess(
  courseSlug: string,
  loginRedirectPath?: string
) {
  const session = await getLmsSession();
  const loginPath =
    loginRedirectPath ?? `/lms/${courseSlug}/zaverecny`;

  if (!session) {
    redirect(`/lms/login?redirect=${encodeURIComponent(loginPath)}`);
  }

  const allowed = await canTakeOfficialTest(session.userId, courseSlug);
  if (!allowed) {
    redirect("/lms?official=denied");
  }

  return session;
}
