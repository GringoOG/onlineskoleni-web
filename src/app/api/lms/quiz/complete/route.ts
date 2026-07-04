import { NextResponse } from "next/server";
import { completeQuizTest } from "@/lib/lms/complete-quiz";
import { getLmsSession } from "@/lib/lms/session";

export async function POST(request: Request) {
  const session = await getLmsSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Nejste přihlášeni." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      courseId?: string;
      correctAnswers?: number;
      totalQuestions?: number;
      minCorrectAnswers?: number;
    };

    const result = await completeQuizTest({
      userId: session.userId,
      courseId: body.courseId ?? "",
      correctAnswers: Number(body.correctAnswers),
      totalQuestions: Number(body.totalQuestions),
      minCorrectAnswers: Number(body.minCorrectAnswers),
      issueCertificate: true,
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
