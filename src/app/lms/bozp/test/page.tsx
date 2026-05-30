import type { Metadata } from "next";
import Link from "next/link";
import { BozpQuiz } from "@/components/lms/BozpQuiz";
import { LmsLoginForm } from "@/components/lms/LmsLoginForm";
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

  let userName = "Demo student";
  if (session) {
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (user) userName = user.name;
  }

  return (
    <>
      <PageHero
        title={quiz.title}
        subtitle={`${quiz.subtitle} · ${QUIZ_TOTAL_QUESTIONS} otázek · úspěch od ${QUIZ_MIN_CORRECT_ANSWERS} správných (80 %)`}
      >
        <Link
          href="/skoleni/bozp"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Kurz BOZP
        </Link>
      </PageHero>

      <Section>
        {!session ? (
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Přihlášení do testu</h2>
              <p className="mt-2 text-sm text-muted">
                Pro spuštění demo testu BOZP se přihlaste demo účtem. Po úspěšném testu se
                výsledek uloží do systému a můžete si stáhnout PDF certifikát.
              </p>
              <div className="mt-6">
                <LmsLoginForm redirectTo="/lms/bozp/test" />
              </div>
            </div>
          </div>
        ) : (
          <BozpQuiz questions={getBozpQuestionsPublic()} userName={userName} />
        )}
      </Section>
    </>
  );
}
