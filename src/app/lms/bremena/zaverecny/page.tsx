import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getOfficialQuizConfig, getQuizQuestionsPublic } from "@/lib/lms/quiz-data";
import { getDemoTestPath } from "@/lib/lms/course-paths";
import { shuffleQuizQuestions } from "@/lib/lms/shuffle-quiz-questions";
import { getLmsSession } from "@/lib/lms/session";

const COURSE_SLUG = "bremena" as const;

export const metadata: Metadata = {
  title: "Závěrečný test manipulace s břemeny",
  description: "Oficiální závěrečný test pro manipulaci s břemeny s certifikátem.",
};

export default async function BremenaOfficialTestPage() {
  const config = getOfficialQuizConfig(COURSE_SLUG);
  const shuffledQuestions = shuffleQuizQuestions(config.questions);
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fbremena%2Fzaverecny");
  }

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
        subtitle={`${config.subtitle} · ${config.totalQuestions} otázek · úspěch od ${config.minCorrectAnswers} správných (80 %) · otázky v náhodném pořadí`}
      >
        <Link
          href="/lms"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
        <Link
          href={getDemoTestPath(COURSE_SLUG)!}
          className="mt-2 block text-sm text-white/70 hover:text-white"
        >
          Demo test (10 otázek) →
        </Link>
      </PageHero>

      <Section>
        <CourseQuiz
          courseSlug={COURSE_SLUG}
          questions={getQuizQuestionsPublic(shuffledQuestions)}
          userName={userName}
          totalQuestions={config.totalQuestions}
          minCorrectAnswers={config.minCorrectAnswers}
          variant="oficialni"
        />
      </Section>
    </>
  );
}
