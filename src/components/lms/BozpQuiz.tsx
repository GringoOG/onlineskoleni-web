"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { submitDemoQuiz, submitOfficialQuiz } from "@/app/lms/actions";
import { getOfficialTestHubPath } from "@/lib/lms/course-paths";
import type { LmsQuizCourseSlug, QuizAudience } from "@/lib/lms/quiz-data";

interface PublicQuestion {
  id: string;
  text: string;
  options: string[];
}

interface CourseQuizProps {
  courseSlug: LmsQuizCourseSlug;
  questions: PublicQuestion[];
  userName: string;
  totalQuestions: number;
  minCorrectAnswers: number;
  variant: "demo" | "oficialni";
  audience?: QuizAudience;
}

type QuizPhase = "active" | "submitting" | "done";

export function CourseQuiz({
  courseSlug,
  questions,
  userName,
  totalQuestions,
  minCorrectAnswers,
  variant,
  audience,
}: CourseQuizProps) {
  const officialHubPath = getOfficialTestHubPath(courseSlug) ?? "/lms";

  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null)
  );
  const [phase, setPhase] = useState<QuizPhase>("active");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof submitDemoQuiz>> | null
  >(null);
  const [officialResult, setOfficialResult] = useState<
    Awaited<ReturnType<typeof submitOfficialQuiz>> | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (phase !== "active") return;
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function handleSubmit() {
    if (!allAnswered) {
      setError(`Vyplňte prosím všech ${totalQuestions} otázek.`);
      return;
    }

    setError(null);
    setPhase("submitting");

    startTransition(async () => {
      if (variant === "demo") {
        const indices = answers as number[];
        const response = await submitDemoQuiz(courseSlug, indices);
        setResult(response);
      } else {
        const submission = questions.map((question, index) => ({
          questionId: question.id,
          selectedIndex: answers[index] as number,
        }));
        const response = await submitOfficialQuiz(
          courseSlug,
          submission,
          audience
        );
        setOfficialResult(response);
      }
      setPhase("done");
    });
  }

  function resetQuiz() {
    setAnswers(new Array(questions.length).fill(null));
    setPhase("active");
    setResult(null);
    setOfficialResult(null);
    setError(null);
  }

  if (phase === "done" && variant === "demo" && result) {
    if (!result.ok) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-900">Chyba</h2>
          <p className="mt-2 text-red-800">{result.message}</p>
          <button type="button" onClick={resetQuiz} className="btn-primary mt-4">
            Zkusit znovu
          </button>
        </div>
      );
    }

    if (result.passed) {
      return (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Demo test splněn
          </p>
          <h2 className="mt-2 text-2xl font-bold text-green-900">
            Výborně, formát testu jste zvládli
          </h2>
          <p className="mt-3 text-green-800">
            {userName}, dosáhli jste {result.scorePercent}&nbsp;% ({result.correctAnswers}/
            {result.totalQuestions} správně). Toto byla pouze ukázka – certifikát vydává až
            oficiální závěrečný test.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={officialHubPath} className="btn-primary">
              Přejít na oficiální test
            </Link>
            <Link
              href="/lms"
              className="rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-100"
            >
              Moje školení
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-amber-900">Demo test nebyl úspěšný</h2>
        <p className="mt-3 text-amber-900">{result.message}</p>
        <button type="button" onClick={resetQuiz} className="btn-primary mt-6">
          Opakovat demo test
        </button>
      </div>
    );
  }

  if (phase === "done" && variant === "oficialni" && officialResult) {
    if (!officialResult.ok) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-900">Chyba</h2>
          <p className="mt-2 text-red-800">{officialResult.message}</p>
          <button type="button" onClick={resetQuiz} className="btn-primary mt-4">
            Zkusit znovu
          </button>
        </div>
      );
    }

    if (officialResult.passed) {
      return (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Gratulujeme
          </p>
          <h2 className="mt-2 text-2xl font-bold text-green-900">
            Oficiální test jste úspěšně splnili
          </h2>
          <p className="mt-3 text-green-800">
            {userName}, dosáhli jste {officialResult.scorePercent}&nbsp;% (
            {officialResult.totalQuestions} otázek, minimum {minCorrectAnswers} správných).
            Výsledek byl uložen do systému.
          </p>
          <p className="mt-2 text-sm text-green-800">
            Evidenční kód certifikátu:{" "}
            <strong className="font-mono">{officialResult.certificateCode}</strong>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={officialResult.downloadUrl} className="btn-primary" download>
              Stáhnout certifikát (PDF)
            </a>
            <Link
              href="/lms"
              className="rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-100"
            >
              Moje školení
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-amber-900">Test nebyl úspěšný</h2>
        <p className="mt-3 text-amber-900">{officialResult.message}</p>
        <button type="button" onClick={resetQuiz} className="btn-primary mt-6">
          Opakovat test
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-brand-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Přihlášen: <strong className="text-foreground">{userName}</strong>
          {variant === "oficialni" && audience && (
            <>
              {" "}
              ·{" "}
              <strong className="text-foreground">
                {audience === "zamestnanec" ? "Zaměstnanec" : "Vedoucí zaměstnanec"}
              </strong>
            </>
          )}
        </p>
        <p className="text-sm font-medium text-foreground">
          Vyplněno {answeredCount}/{questions.length} · úspěch od {minCorrectAnswers}/
          {totalQuestions}
          {variant === "oficialni" && (
            <span className="text-muted"> · otázky v náhodném pořadí</span>
          )}
        </p>
      </div>

      <ol className="space-y-6">
        {questions.map((question, questionIndex) => (
          <li
            key={question.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
          >
            <p className="text-sm font-semibold text-brand-dark">
              Otázka {questionIndex + 1}
            </p>
            <p className="mt-2 text-base font-medium text-foreground">{question.text}</p>
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Možnosti odpovědi</legend>
              {question.options.map((option, optionIndex) => {
                const checked = answers[questionIndex] === optionIndex;
                return (
                  <label
                    key={optionIndex}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      checked
                        ? "border-brand bg-brand-tint"
                        : "border-border hover:border-brand/40 hover:bg-brand-tint/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={checked}
                      onChange={() => selectAnswer(questionIndex, optionIndex)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-dark"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                );
              })}
            </fieldset>
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isPending || phase === "submitting"}
          className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending || phase === "submitting" ? "Odesílám výsledky…" : "Odevzdat test"}
        </button>
      </div>
    </div>
  );
}

/** @deprecated Use CourseQuiz */
export const BozpQuiz = CourseQuiz;
