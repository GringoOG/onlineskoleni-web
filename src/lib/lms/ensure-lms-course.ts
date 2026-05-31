import { eq } from "drizzle-orm";
import { courses, db } from "@/db";
import { getCourse } from "@/lib/content";

export interface LmsCourseRef {
  id: string;
  slug: string;
  title: string;
}

/** Zajistí záznam kurzu v LMS podle slug z objednávky / obsahu webu. */
export async function ensureLmsCourse(courseSlug: string): Promise<LmsCourseRef> {
  const courseMeta = getCourse(courseSlug);
  if (!courseMeta) {
    throw new Error(`Kurz „${courseSlug}“ nenalezen v obsahu webu.`);
  }

  const [existing] = await db
    .select({ id: courses.id, slug: courses.slug, title: courses.title })
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(courses)
    .values({
      slug: courseSlug,
      title: courseMeta.title,
      description: courseMeta.description,
    })
    .returning({ id: courses.id, slug: courses.slug, title: courses.title });

  return created;
}
