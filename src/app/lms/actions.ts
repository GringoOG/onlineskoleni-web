"use server";

import { markTheoryStartedForUserCourse } from "@/lib/lms/mark-theory-started";
import { pages } from "@/lib/content";
import { authenticateStudentByEmail } from "@/lib/lms/authenticate-student";
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

/** Přihlášení – demo účet (testik) nebo e-mail + heslo z objednávky. */
export async function loginDemoUser(
  username: string,
  password: string
): Promise<LoginDemoResult> {
  const expectedUser = pages.demoTest.username;
  const expectedPass = pages.demoTest.password;

  if (username.trim() === expectedUser && password === expectedPass) {
    try {
      const enrollment = await ensureDemoEnrollment();
      await setLmsSession(enrollment);
      return { ok: true };
    } catch (error) {
      console.error("[loginDemoUser demo]", error);
      return {
        ok: false,
        message: "Nepodařilo se připojit k systému školení. Zkuste to prosím později.",
      };
    }
  }

  try {
    const student = await authenticateStudentByEmail(username, password);
    if (!student) {
      return {
        ok: false,
        message:
          "Neplatné přihlašovací údaje. Použijte e-mail a heslo z uvítacího e-mailu po objednávce, nebo demo účet uvedený na webu.",
      };
    }

    await setLmsSession({
      userId: student.userId,
      courseId: student.courseId,
    });
    return { ok: true };
  } catch (error) {
    console.error("[loginDemoUser student]", error);
    return {
      ok: false,
      message: "Nepodařilo se připojit k systému školení. Zkuste to prosím později.",
    };
  }
}

export async function logoutDemoUser(): Promise<void> {
  await clearLmsSession();
}

/** Označí zahájení studia teorie u kurzu (pro progress ve dashboardu). */
export async function markTheoryStarted(
  courseId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getLmsSession();
  if (!session) {
    return { ok: false, message: "Nejste přihlášeni." };
  }

  try {
    await markTheoryStartedForUserCourse(session.userId, courseId);
    return { ok: true };
  } catch (error) {
    console.error("[markTheoryStarted]", error);
    return { ok: false, message: "Nepodařilo se uložit průběh studia." };
  }
}

/** Odeslání BOZP testu – skóre se počítá na serveru z odpovědí. */
export async function submitBozpQuiz(
  selectedIndices: number[]
): Promise<SubmitBozpQuizResult> {
  const session = await getLmsSession();
  if (!session) {
    return { ok: false, message: "Nejste přihlášeni. Přihlaste se prosím." };
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
