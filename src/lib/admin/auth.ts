import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";
const SESSION_VERSION = "admin-session-v1";

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.CRON_SECRET ??
    process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD není nastaveno v prostředí.");
  }
  return secret;
}

export function createAdminSessionToken(): string {
  return createHmac("sha256", getSessionSecret())
    .update(SESSION_VERSION)
    .digest("hex");
}

export function verifyAdminPassword(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPassword) {
    return false;
  }
  return username.trim() === expectedUser && password === expectedPassword;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return false;
  }

  const expected = createAdminSessionToken();
  if (token.length !== expected.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("UNAUTHORIZED");
  }
}
