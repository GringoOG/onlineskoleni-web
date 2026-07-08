import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { courses, db, userCourses } from "@/db";
import { getLmsSession } from "@/lib/lms/session";

/** Vrátí slugy kurzů přiřazených přihlášenému studentovi (pro odemčení microlearningu). */
export async function GET() {
  const session = await getLmsSession();
  if (!session) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const enrollments = await db
    .select({ slug: courses.slug })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(eq(userCourses.userId, session.userId));

  return NextResponse.json({
    enrolledSlugs: enrollments.map((row) => row.slug),
    sessionId: `LMS-${session.userId.slice(0, 8).toUpperCase()}`,
  });
}
