import { and, eq } from "drizzle-orm";
import { courses, db, userCourses, users } from "@/db";
import { getCourse, getCourseSlugs } from "@/lib/content";
import { DEMO_USER_EMAIL } from "@/lib/lms/demo-user";

const DEMO_NAME = "Demo testik";

export interface DemoEnrollment {
  userId: string;
  courseId: string;
}

/** Zajistí demo uživatele, všechny kurzy a přiřazení ke každému z nich. */
export async function ensureDemoEnrollment(): Promise<DemoEnrollment> {
  let [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_USER_EMAIL))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: DEMO_USER_EMAIL,
        name: DEMO_NAME,
        companyName: "Demo firma",
      })
      .returning({ id: users.id });
  }

  let primaryCourseId: string | null = null;

  for (const slug of getCourseSlugs()) {
    const courseMeta = getCourse(slug);
    if (!courseMeta) {
      continue;
    }

    let [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);

    if (!course) {
      [course] = await db
        .insert(courses)
        .values({
          slug,
          title: courseMeta.title,
          description: courseMeta.description,
        })
        .returning({ id: courses.id });
    }

    if (!primaryCourseId) {
      primaryCourseId = course.id;
    }

    const [enrollment] = await db
      .select({ id: userCourses.id })
      .from(userCourses)
      .where(
        and(eq(userCourses.userId, user.id), eq(userCourses.courseId, course.id))
      )
      .limit(1);

    if (!enrollment) {
      await db.insert(userCourses).values({
        userId: user.id,
        courseId: course.id,
        isCompleted: false,
      });
    }
  }

  if (!primaryCourseId) {
    throw new Error("Nepodařilo se přiřadit demo kurzy.");
  }

  return { userId: user.id, courseId: primaryCourseId };
}
