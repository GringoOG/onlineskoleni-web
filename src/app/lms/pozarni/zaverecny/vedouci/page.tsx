import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getOfficialQuizConfig, getQuizQuestionsPublic } from "@/lib/lms/quiz-data";
import { shuffleQuizQuestions } from "@/lib/lms/shuffle-quiz-questions";
import { getLmsSession } from "@/lib/lms/session";

const COURSE_SLUG = "pozarni" as const;

export const metadata: Metadata = {
  title: "Závěrečný test PO – vedoucí",
  description: "Oficiální závěrečný test požární ochrany pro vedoucí zaměstnance.",
};

export default async function PozarniOfficialSupervisorTestPage() {
  const config = getOfficialQuizConfig(COURSE_SLUG, "vedouci");
  const shuffledQuestions = shuffleQuizQuestions(config.questions);
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fpozarni%2Fzaverecny%2Fvedouci");
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
          href="/lms/pozarni/zaverecny"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Výběr typu testu
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
          audience="vedouci"
        />
      </Section>
    </>
  );
}
