import { cookies } from "next/headers";

const USER_COOKIE = "lms_user_id";
const COURSE_COOKIE = "lms_course_id";

export interface LmsSession {
  userId: string;
  courseId: string;
}

export async function getLmsSession(): Promise<LmsSession | null> {
  const jar = await cookies();
  const userId = jar.get(USER_COOKIE)?.value;
  const courseId = jar.get(COURSE_COOKIE)?.value;

  if (!userId || !courseId) {
    return null;
  }

  return { userId, courseId };
}

export async function setLmsSession(session: LmsSession): Promise<void> {
  const jar = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };

  jar.set(USER_COOKIE, session.userId, options);
  jar.set(COURSE_COOKIE, session.courseId, options);
}

export async function clearLmsSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
  jar.delete(COURSE_COOKIE);
}
