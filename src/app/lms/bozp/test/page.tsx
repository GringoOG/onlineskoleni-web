import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BozpQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getBozpQuestionsPublic, getBozpQuiz } from "@/lib/lms/quiz-data";
import {
  QUIZ_MIN_CORRECT_ANSWERS,
  QUIZ_TOTAL_QUESTIONS,
} from "@/lib/lms/quiz-config";
import { getLmsSession } from "@/lib/lms/session";

export const metadata: Metadata = {
  title: "Test BOZP",
  description:
    "Vyzkoušejte závěrečný test z bezpečnosti a ochrany zdraví při práci. Demo verze zdarma.",
};

export default async function BozpTestPage() {
  const quiz = getBozpQuiz();
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fbozp%2Ftest");
  }

  let userName = "Demo student";
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (user) userName = user.name;

  return (
    <>
      <PageHero
        title={quiz.title}
        subtitle={`${quiz.subtitle} · ${QUIZ_TOTAL_QUESTIONS} otázek · úspěch od ${QUIZ_MIN_CORRECT_ANSWERS} správných (80 %)`}
      >
        <Link
          href="/lms"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
        <Link
          href="/skoleni/bozp"
          className="mt-2 block text-sm text-white/70 hover:text-white"
        >
          Kurz BOZP
        </Link>
      </PageHero>

      <Section>
        <BozpQuiz questions={getBozpQuestionsPublic()} userName={userName} />
      </Section>
    </>
  );
}
