import { and, eq } from "drizzle-orm";
import { db, quizAttempts, userCourses } from "@/db";
import {
  QUIZ_MIN_CORRECT_ANSWERS,
  QUIZ_PASS_THRESHOLD_PERCENT,
  QUIZ_TOTAL_QUESTIONS,
} from "@/lib/lms/quiz-config";

export {
  QUIZ_MIN_CORRECT_ANSWERS,
  QUIZ_PASS_THRESHOLD_PERCENT,
  QUIZ_TOTAL_QUESTIONS,
} from "@/lib/lms/quiz-config";

export interface CompleteQuizInput {
  userId: string;
  courseId: string;
  correctAnswers: number;
}

export type CompleteQuizResult =
  | {
      ok: true;
      passed: true;
      scorePercent: number;
      totalQuestions: number;
      attemptId: string;
    }
  | {
      ok: true;
      passed: false;
      scorePercent: number;
      totalQuestions: number;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateInput(input: CompleteQuizInput): string | null {
  if (!UUID_REGEX.test(input.userId)) {
    return "Neplatné userId.";
  }
  if (!UUID_REGEX.test(input.courseId)) {
    return "Neplatné courseId.";
  }
  if (!Number.isInteger(input.correctAnswers) || input.correctAnswers < 0) {
    return "Počet správných odpovědí musí být nezáporné celé číslo.";
  }
  if (input.correctAnswers > QUIZ_TOTAL_QUESTIONS) {
    return `Počet správných odpovědí nemůže být větší než ${QUIZ_TOTAL_QUESTIONS}.`;
  }
  return null;
}

export async function completeQuizTest(
  input: CompleteQuizInput
): Promise<CompleteQuizResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { userId, courseId, correctAnswers } = input;
  const totalQuestions = QUIZ_TOTAL_QUESTIONS;
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = correctAnswers >= QUIZ_MIN_CORRECT_ANSWERS;

  const [enrollment] = await db
    .select({ id: userCourses.id })
    .from(userCourses)
    .where(and(eq(userCourses.userId, userId), eq(userCourses.courseId, courseId)))
    .limit(1);

  if (!enrollment) {
    return {
      ok: false,
      message: "Uživatel nemá tento kurz přiřazený.",
    };
  }

  if (!isPassed) {
    return {
      ok: true,
      passed: false,
      scorePercent,
      totalQuestions,
      message: `Test nebyl úspěšný (${correctAnswers}/${totalQuestions}, ${scorePercent} %). Pro splnění je potřeba alespoň ${QUIZ_MIN_CORRECT_ANSWERS} správných odpovědí.`,
    };
  }

  const result = await db.transaction(async (tx) => {
    const [attempt] = await tx
      .insert(quizAttempts)
      .values({
        userId,
        courseId,
        score: correctAnswers,
        totalQuestions,
        isPassed: true,
      })
      .returning({ id: quizAttempts.id });

    await tx
      .update(userCourses)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(
        and(eq(userCourses.userId, userId), eq(userCourses.courseId, courseId))
      );

    return attempt;
  });

  return {
    ok: true,
    passed: true,
    scorePercent,
    totalQuestions,
    attemptId: result.id,
  };
}
