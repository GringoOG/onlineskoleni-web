import type { Metadata } from "next";
import Link from "next/link";
import { CourseQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import {
  getOfficialQuizConfig,
  getOfficialTestSize,
  getQuizQuestionsPublic,
  prepareOfficialQuizQuestions,
} from "@/lib/lms/quiz-data";
import { getDemoTestPath } from "@/lib/lms/course-paths";
import { requireOfficialTestAccess } from "@/lib/lms/official-test-access";

const COURSE_SLUG = "gdpr" as const;

export const metadata: Metadata = {
  title: "Závěrečný test GDPR",
  description: "Oficiální závěrečný test GDPR s certifikátem.",
};

export default async function GdprOfficialTestPage() {
  const config = getOfficialQuizConfig(COURSE_SLUG);
  const { totalQuestions, minCorrectAnswers } = getOfficialTestSize(COURSE_SLUG);
  const shuffledQuestions = prepareOfficialQuizQuestions(COURSE_SLUG);
  const session = await requireOfficialTestAccess(COURSE_SLUG, '/lms/gdpr/zaverecny');


  let userName = "Student";
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (user) userName = user.name;

  return (
    <>
      <PageHero
        title={config.title}
        subtitle={`${config.subtitle} · ${totalQuestions} otázek · úspěch od ${minCorrectAnswers} správných (80 %) · platnost certifikátu 1 rok`}
      >
        <Link
          href="/lms"
          className="inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
        <Link
          href={getDemoTestPath(COURSE_SLUG)!}
          className="block text-sm text-white/70 hover:text-white"
        >
          Demo test (10 otázek) →
        </Link>
      </PageHero>

      <Section>
        <CourseQuiz
          courseSlug={COURSE_SLUG}
          questions={getQuizQuestionsPublic(shuffledQuestions)}
          userName={userName}
          totalQuestions={totalQuestions}
          minCorrectAnswers={minCorrectAnswers}
          variant="oficialni"
        />
      </Section>
    </>
  );
}
