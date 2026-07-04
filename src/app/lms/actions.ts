"use server";

import { markTheoryStartedForUserCourse } from "@/lib/lms/mark-theory-started";
import { pages } from "@/lib/content";
import { authenticateStudentByEmail } from "@/lib/lms/authenticate-student";
import { ensureDemoEnrollment } from "@/lib/lms/demo-enrollment";
import { ensureLmsCourse } from "@/lib/lms/ensure-lms-course";
import {
  completeQuizTest,
  type CompleteQuizInput,
  type CompleteQuizResult,
} from "@/lib/lms/complete-quiz";
import {
  getDemoQuizConfig,
  getOfficialTestSize,
  scoreDemoAnswers,
  scoreOfficialAnswers,
  type LmsQuizCourseSlug,
  type QuizAnswerSubmission,
  type QuizAudience,
} from "@/lib/lms/quiz-data";
import { QUIZ_PASS_THRESHOLD_PERCENT } from "@/lib/lms/quiz-config";
import { getLmsSession, setLmsSession, clearLmsSession } from "@/lib/lms/session";
import { setAdminSession, authenticateAdminUser, clearAdminSession } from "@/lib/admin/auth";
import { getDefaultAdminRedirect } from "@/lib/admin/roles";

export type SubmitQuizResult = CompleteQuizResult;

export type LoginDemoResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; message: string };

export type SubmitBozpQuizResult = CompleteQuizResult;

/** Přihlášení – admin TechnikPO, demo účet (testik) nebo e-mail + heslo z objednávky. */
export async function loginDemoUser(
  username: string,
  password: string
): Promise<LoginDemoResult> {
  const adminSession = await authenticateAdminUser(username, password);
  if (adminSession) {
    try {
      await clearLmsSession();
      await setAdminSession(adminSession);
      return { ok: true, redirectTo: getDefaultAdminRedirect(adminSession.role) };
    } catch (error) {
      console.error("[loginDemoUser admin]", error);
      return {
        ok: false,
        message:
          "Administrace není nakonfigurována (chybí ADMIN_PASSWORD) nebo došlo k chybě serveru.",
      };
    }
  }

  const expectedUser = pages.demoTest.username;
  const expectedPass = pages.demoTest.password;

  if (username.trim() === expectedUser && password === expectedPass) {
    try {
      const enrollment = await ensureDemoEnrollment();
      await clearAdminSession();
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
    await clearAdminSession();
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

export type SubmitDemoQuizResult =
  | {
      ok: true;
      passed: true;
      scorePercent: number;
      totalQuestions: number;
      correctAnswers: number;
    }
  | {
      ok: true;
      passed: false;
      scorePercent: number;
      totalQuestions: number;
      message: string;
    }
  | { ok: false; message: string };

function validateAnswerIndices(
  selectedIndices: number[],
  expectedCount: number
): string | null {
  if (selectedIndices.length !== expectedCount) {
    return `Vyplňte prosím všech ${expectedCount} otázek.`;
  }
  if (selectedIndices.some((index) => !Number.isInteger(index) || index < 0)) {
    return "Neplatný formát odpovědí.";
  }
  return null;
}

/** Demo test – bez certifikátu, pouze ukázka formátu. */
export async function submitDemoQuiz(
  courseSlug: LmsQuizCourseSlug,
  selectedIndices: number[]
): Promise<SubmitDemoQuizResult> {
  const session = await getLmsSession();
  if (!session) {
    return { ok: false, message: "Nejste přihlášeni. Přihlaste se prosím." };
  }

  const config = getDemoQuizConfig(courseSlug);
  const validationError = validateAnswerIndices(
    selectedIndices,
    config.totalQuestions
  );
  if (validationError) {
    return { ok: false, message: validationError };
  }

  let correctAnswers: number;
  try {
    correctAnswers = scoreDemoAnswers(courseSlug, selectedIndices);
  } catch {
    return { ok: false, message: "Neplatný formát odpovědí." };
  }

  const { totalQuestions, minCorrectAnswers } = config;
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = correctAnswers >= minCorrectAnswers;

  if (!passed) {
    return {
      ok: true,
      passed: false,
      scorePercent,
      totalQuestions,
      message: `Demo test nebyl úspěšný (${correctAnswers}/${totalQuestions}, ${scorePercent} %). Pro splnění je potřeba alespoň ${minCorrectAnswers} správných odpovědí.`,
    };
  }

  return {
    ok: true,
    passed: true,
    scorePercent,
    totalQuestions,
    correctAnswers,
  };
}

function validateOfficialAnswers(
  answers: QuizAnswerSubmission[],
  expectedCount: number
): string | null {
  if (answers.length !== expectedCount) {
    return `Vyplňte prosím všech ${expectedCount} otázek.`;
  }
  if (
    answers.some(
      (answer) =>
        !answer.questionId ||
        !Number.isInteger(answer.selectedIndex) ||
        answer.selectedIndex < 0
    )
  ) {
    return "Neplatný formát odpovědí.";
  }
  return null;
}

/** Oficiální závěrečný test – zaměstnanec / vedoucí nebo jednotný test (řidiči). */
export async function submitOfficialQuiz(
  courseSlug: LmsQuizCourseSlug,
  answers: QuizAnswerSubmission[],
  audience?: QuizAudience
): Promise<SubmitBozpQuizResult> {
  const session = await getLmsSession();
  if (!session) {
    return { ok: false, message: "Nejste přihlášeni. Přihlaste se prosím." };
  }

  const { totalQuestions, minCorrectAnswers } = getOfficialTestSize(
    courseSlug,
    audience
  );
  const validationError = validateOfficialAnswers(answers, totalQuestions);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  let correctAnswers: number;
  try {
    correctAnswers = scoreOfficialAnswers(courseSlug, answers, audience);
  } catch {
    return { ok: false, message: "Neplatný formát odpovědí." };
  }

  try {
    const course = await ensureLmsCourse(courseSlug);
    return await completeQuizTest({
      userId: session.userId,
      courseId: course.id,
      correctAnswers,
      totalQuestions,
      minCorrectAnswers,
      issueCertificate: true,
    });
  } catch (error) {
    console.error("[submitOfficialQuiz]", error);
    return {
      ok: false,
      message: "Nepodařilo se uložit výsledek testu. Zkuste to prosím znovu.",
    };
  }
}

/** Demo test BOZP – bez certifikátu, pouze ukázka formátu. */
export async function submitBozpDemoQuiz(
  selectedIndices: number[]
): Promise<SubmitDemoQuizResult> {
  return submitDemoQuiz("bozp", selectedIndices);
}

/** Demo test PO – bez certifikátu, pouze ukázka formátu. */
export async function submitPozarniDemoQuiz(
  selectedIndices: number[]
): Promise<SubmitDemoQuizResult> {
  return submitDemoQuiz("pozarni", selectedIndices);
}

/** Oficiální závěrečný test BOZP – zaměstnanec nebo vedoucí. */
export async function submitBozpOfficialQuiz(
  audience: QuizAudience,
  answers: QuizAnswerSubmission[]
): Promise<SubmitBozpQuizResult> {
  return submitOfficialQuiz("bozp", answers, audience);
}

/** Oficiální závěrečný test PO – zaměstnanec nebo vedoucí. */
export async function submitPozarniOfficialQuiz(
  audience: QuizAudience,
  answers: QuizAnswerSubmission[]
): Promise<SubmitBozpQuizResult> {
  return submitOfficialQuiz("pozarni", answers, audience);
}

/** Oficiální závěrečný test referentů řidičů. */
export async function submitRidiciOfficialQuiz(
  answers: QuizAnswerSubmission[]
): Promise<SubmitBozpQuizResult> {
  return submitOfficialQuiz("ridici", answers);
}

/** @deprecated Použijte submitBozpDemoQuiz nebo submitBozpOfficialQuiz. */
export async function submitBozpQuiz(
  selectedIndices: number[]
): Promise<SubmitDemoQuizResult> {
  return submitBozpDemoQuiz(selectedIndices);
}

/** @deprecated Použijte submitOfficialQuiz – certifikát pouze u oficiálního závěrečného testu. */
export async function submitQuizResult(
  input: CompleteQuizInput
): Promise<SubmitQuizResult> {
  try {
    return await completeQuizTest({
      ...input,
      issueCertificate: true,
    });
  } catch (error) {
    console.error("[submitQuizResult]", error);
    return {
      ok: false,
      message: "Nepodařilo se uložit výsledek testu. Zkuste to prosím znovu.",
    };
  }
}

export async function getQuizPassInfo(courseSlug: LmsQuizCourseSlug = "bozp") {
  const demo = getDemoQuizConfig(courseSlug);
  return {
    totalQuestions: demo.totalQuestions,
    minCorrect: demo.minCorrectAnswers,
    passThresholdPercent: QUIZ_PASS_THRESHOLD_PERCENT,
  };
}
