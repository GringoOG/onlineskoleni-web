"use server";

import { pages } from "@/lib/content";
import { ensureDemoEnrollment } from "@/lib/lms/demo-enrollment";
import {
  completeQuizTest,
  type CompleteQuizInput,
  type CompleteQuizResult,
} from "@/lib/lms/complete-quiz";
import { scoreBozpAnswers } from "@/lib/lms/quiz-data";
import {
  QUIZ_MIN_CORRECT_ANSWERS,
  QUIZ_TOTAL_QUESTIONS,
} from "@/lib/lms/quiz-config";
import { getLmsSession, setLmsSession, clearLmsSession } from "@/lib/lms/session";

export type SubmitQuizResult = CompleteQuizResult;

export type LoginDemoResult =
  | { ok: true }
  | { ok: false; message: string };

export type SubmitBozpQuizResult = CompleteQuizResult;

/** Demo přihlášení – ověří údaje z content/pages.json a vytvoří session. */
export async function loginDemoUser(
  username: string,
  password: string
): Promise<LoginDemoResult> {
  const expectedUser = pages.demoTest.username;
  const expectedPass = pages.demoTest.password;

  if (username.trim() !== expectedUser || password !== expectedPass) {
    return {
      ok: false,
      message: "Neplatné přihlašovací údaje. Použijte demo účet uvedený na webu.",
    };
  }

  try {
    const enrollment = await ensureDemoEnrollment();
    await setLmsSession(enrollment);
    return { ok: true };
  } catch (error) {
    console.error("[loginDemoUser]", error);
    return {
      ok: false,
      message: "Nepodařilo se připojit k systému školení. Zkuste to prosím později.",
    };
  }
}

export async function logoutDemoUser(): Promise<void> {
  await clearLmsSession();
}

/** Odeslání BOZP testu – skóre se počítá na serveru z odpovědí. */
export async function submitBozpQuiz(
  selectedIndices: number[]
): Promise<SubmitBozpQuizResult> {
  const session = await getLmsSession();
  if (!session) {
    return { ok: false, message: "Nejste přihlášeni. Přihlaste se demo účtem." };
  }

  if (selectedIndices.length !== QUIZ_TOTAL_QUESTIONS) {
    return {
      ok: false,
      message: `Vyplňte prosím všech ${QUIZ_TOTAL_QUESTIONS} otázek.`,
    };
  }

  if (selectedIndices.some((index) => !Number.isInteger(index) || index < 0)) {
    return { ok: false, message: "Neplatný formát odpovědí." };
  }

  let correctAnswers: number;
  try {
    correctAnswers = scoreBozpAnswers(selectedIndices);
  } catch {
    return { ok: false, message: "Neplatný formát odpovědí." };
  }

  try {
    return await completeQuizTest({
      userId: session.userId,
      courseId: session.courseId,
      correctAnswers,
    });
  } catch (error) {
    console.error("[submitBozpQuiz]", error);
    return {
      ok: false,
      message: "Nepodařilo se uložit výsledek testu. Zkuste to prosím znovu.",
    };
  }
}

/** Volá se po dokončení testu v LMS. Při ≥ 8/10 správných zapíše pokus a označí kurz jako dokončený. */
export async function submitQuizResult(
  input: CompleteQuizInput
): Promise<SubmitQuizResult> {
  try {
    return await completeQuizTest(input);
  } catch (error) {
    console.error("[submitQuizResult]", error);
    return {
      ok: false,
      message: "Nepodařilo se uložit výsledek testu. Zkuste to prosím znovu.",
    };
  }
}

export async function getQuizPassInfo() {
  return {
    totalQuestions: QUIZ_TOTAL_QUESTIONS,
    minCorrect: QUIZ_MIN_CORRECT_ANSWERS,
  };
}
