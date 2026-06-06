import { NextResponse } from "next/server";
import { completeQuizTest } from "@/lib/lms/complete-quiz";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      courseId?: string;
      correctAnswers?: number;
      totalQuestions?: number;
      minCorrectAnswers?: number;
    };

    const result = await completeQuizTest({
      userId: body.userId ?? "",
      courseId: body.courseId ?? "",
      correctAnswers: Number(body.correctAnswers),
      totalQuestions: Number(body.totalQuestions),
      minCorrectAnswers: Number(body.minCorrectAnswers),
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    if (!result.passed) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/lms/quiz/complete]", error);
    return NextResponse.json(
      { ok: false, message: "Interní chyba serveru." },
      { status: 500 }
    );
  }
}
