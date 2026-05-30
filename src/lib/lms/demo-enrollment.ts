import { and, eq } from "drizzle-orm";
import { courses, db, userCourses, users } from "@/db";
import { getCourse } from "@/lib/content";

const DEMO_EMAIL = "testik@demo.onlineskoleni.eu";
const DEMO_NAME = "Demo testik";
const BOZP_SLUG = "bozp";

export interface DemoEnrollment {
  userId: string;
  courseId: string;
}

/** Zajistí demo uživatele, kurz BOZP a přiřazení kurzu. */
export async function ensureDemoEnrollment(): Promise<DemoEnrollment> {
  const courseMeta = getCourse(BOZP_SLUG);
  if (!courseMeta) {
    throw new Error("Kurz BOZP nenalezen v obsahu webu.");
  }

  let [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        companyName: "Demo firma",
      })
      .returning({ id: users.id });
  }

  let [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, BOZP_SLUG))
    .limit(1);

  if (!course) {
    [course] = await db
      .insert(courses)
      .values({
        slug: BOZP_SLUG,
        title: courseMeta.title,
        description: courseMeta.description,
      })
      .returning({ id: courses.id });
  }

  const [enrollment] = await db
    .select({ id: userCourses.id, isCompleted: userCourses.isCompleted })
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

  return { userId: user.id, courseId: course.id };
}
