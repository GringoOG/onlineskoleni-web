import { and, desc, eq } from "drizzle-orm";
import {
  certificates,
  courses,
  db,
  quizAttempts,
  userCourses,
  users,
} from "@/db";
import { getCourse } from "@/lib/content";
import type { CourseColor } from "@/types/content";
import { getCertificateDownloadPath } from "@/lib/lms/certificate-config";
import { getLmsEntryPath } from "@/lib/lms/course-paths";
import { getHrbekLearningPath } from "@/lib/lms/hrbek-learning-paths";
import {
  type CourseProgressStatus,
  resolveCourseProgress,
} from "@/lib/lms/progress";

export interface DashboardCourse {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  description: string | null;
  shortTitle: string;
  color: CourseColor;
  progress: CourseProgressStatus;
  theoryStartedAt: Date | null;
  completedAt: Date | null;
  purchasedAt: Date;
  seatsPurchased: number | null;
  audience: "zamestnanec" | "vedouci" | null;
  testPath: string | null;
  theoryPath: string;
  certificate: {
    id: string;
    code: string;
    downloadUrl: string;
    issuedAt: Date;
    expiresAt: Date;
  } | null;
  latestAttempt: {
    score: number;
    totalQuestions: number;
    isPassed: boolean;
    createdAt: Date;
  } | null;
}

export interface StudentDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
  };
  courses: DashboardCourse[];
}

function getCourseMeta(slug: string) {
  const meta = getCourse(slug);
  return {
    shortTitle: meta?.shortTitle ?? slug.toUpperCase(),
    color: meta?.color ?? ("blue" as const),
    description: meta?.description ?? null,
  };
}

function getTheoryPath(slug: string): string {
  return getHrbekLearningPath(slug);
}

function getTestPath(
  slug: string,
  audience?: string | null
): string | null {
  const path = getLmsEntryPath(
    slug,
    audience === "zamestnanec" || audience === "vedouci" ? audience : null
  );
  return path.startsWith("/lms/") ? path : null;
}

export async function getStudentDashboard(
  userId: string
): Promise<StudentDashboardData | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      companyName: users.companyName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const enrollments = await db
    .select({
      enrollmentId: userCourses.id,
      courseId: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      isCompleted: userCourses.isCompleted,
      theoryStartedAt: userCourses.theoryStartedAt,
      completedAt: userCourses.completedAt,
      purchasedAt: userCourses.purchasedAt,
      seatsPurchased: userCourses.seatsPurchased,
      audience: userCourses.audience,
    })
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(eq(userCourses.userId, userId))
    .orderBy(desc(userCourses.purchasedAt));

  const coursesData: DashboardCourse[] = [];

  for (const enrollment of enrollments) {
    const [latestAttempt] = await db
      .select({
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        isPassed: quizAttempts.isPassed,
        createdAt: quizAttempts.createdAt,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.courseId, enrollment.courseId)
        )
      )
      .orderBy(desc(quizAttempts.createdAt))
      .limit(1);

    const attemptCount = await db
      .select({ id: quizAttempts.id })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.courseId, enrollment.courseId)
        )
      );

    const [cert] = await db
      .select({
        id: certificates.id,
        code: certificates.certificateCode,
        issuedAt: certificates.issuedAt,
        expiresAt: certificates.expiresAt,
      })
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.courseId, enrollment.courseId)
        )
      )
      .limit(1);

    const meta = getCourseMeta(enrollment.slug);

    const progress = resolveCourseProgress({
      isCompleted: enrollment.isCompleted,
      theoryStartedAt: enrollment.theoryStartedAt,
      hasQuizAttempt: attemptCount.length > 0,
      hasPassedAttempt: !!latestAttempt?.isPassed || enrollment.isCompleted,
    });

    coursesData.push({
      enrollmentId: enrollment.enrollmentId,
      courseId: enrollment.courseId,
      slug: enrollment.slug,
      title: enrollment.title,
      description: enrollment.description ?? meta.description,
      shortTitle: meta.shortTitle,
      color: meta.color,
      progress,
      theoryStartedAt: enrollment.theoryStartedAt,
      completedAt: enrollment.completedAt,
      purchasedAt: enrollment.purchasedAt,
      seatsPurchased: enrollment.seatsPurchased,
      audience:
        enrollment.audience === "zamestnanec" || enrollment.audience === "vedouci"
          ? enrollment.audience
          : null,
      testPath: getTestPath(enrollment.slug, enrollment.audience),
      theoryPath: getTheoryPath(enrollment.slug),
      certificate: cert
        ? {
            id: cert.id,
            code: cert.code,
            downloadUrl: getCertificateDownloadPath(cert.id),
            issuedAt: cert.issuedAt,
            expiresAt: cert.expiresAt,
          }
        : null,
      latestAttempt: latestAttempt ?? null,
    });
  }

  return { user, courses: coursesData };
}
