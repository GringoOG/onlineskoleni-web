import { and, eq, isNull } from "drizzle-orm";
import { courses, db, userCourses } from "@/db";

/** Bezpečný interní redirect po přihlášení (ochrana proti open redirect). */
export function sanitizeLmsRedirect(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/lms";
  }
  return path;
}

/** Nastaví theory_started_at u enrollmentu, pokud ještě není vyplněné. */
export async function markTheoryStartedForUserCourse(
  userId: string,
  courseId: string
): Promise<void> {
  await db
    .update(userCourses)
    .set({ theoryStartedAt: new Date() })
    .where(
      and(
        eq(userCourses.userId, userId),
        eq(userCourses.courseId, courseId),
        isNull(userCourses.theoryStartedAt)
      )
    );
}

/** Při návštěvě stránky kurzu označí zahájení teorie podle slug (jen existující enrollment). */
export async function markTheoryStartedForCourseSlug(
  userId: string,
  courseSlug: string
): Promise<void> {
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1);

  if (!course) {
    return;
  }

  await markTheoryStartedForUserCourse(userId, course.id);
}
