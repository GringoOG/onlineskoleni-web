import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { courses, db, userCourses, users } from "@/db";
import { isDemoUserEmail } from "@/lib/lms/demo-user";
import { getLmsSession } from "@/lib/lms/session";
import {
  getStudyMaterialFileName,
  getStudyMaterialFilePath,
} from "@/lib/lms/study-material";
import { getCourseSlugs } from "@/lib/content";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function userHasCourseAccess(userId: string, email: string, slug: string): Promise<boolean> {
  if (isDemoUserEmail(email)) {
    return getCourseSlugs().includes(slug);
  }

  const [enrollment] = await db
    .select({ id: userCourses.id })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(and(eq(userCourses.userId, userId), eq(courses.slug, slug)))
    .limit(1);

  return Boolean(enrollment);
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  if (!getCourseSlugs().includes(slug)) {
    return NextResponse.json({ error: "Neznámý kurz." }, { status: 404 });
  }

  const session = await getLmsSession();
  if (!session) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Uživatel nenalezen." }, { status: 404 });
  }

  const hasAccess = await userHasCourseAccess(session.userId, user.email, slug);
  if (!hasAccess) {
    return NextResponse.json({ error: "K tomuto kurzu nemáte přístup." }, { status: 403 });
  }

  try {
    const pdfBytes = await readFile(getStudyMaterialFilePath(slug));
    const fileName = getStudyMaterialFileName(slug);

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Studijní materiál zatím není k dispozici. Kontaktujte provozovatele." },
      { status: 503 }
    );
  }
}
