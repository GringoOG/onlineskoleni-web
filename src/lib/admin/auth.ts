import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminPasswordHash } from "@/lib/admin/password";
import {
  canAccessGenerator,
  canAccessOrders,
  getDefaultAdminRedirect,
  isAdminRole,
  type AdminRole,
  type AdminSessionPayload,
} from "@/lib/admin/roles";

const ADMIN_COOKIE = "admin_session";
const SESSION_VERSION = "admin-session-v2";

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.CRON_SECRET ??
    process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD nebo ADMIN_SESSION_SECRET není nastaveno.");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function encodeSession(session: AdminSessionPayload): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function decodeSession(raw: string): AdminSessionPayload | null {
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = signPayload(payload);
  if (signature.length !== expected.length) {
    return null;
  }

  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
      username?: string;
      role?: string;
    };

    if (!parsed.userId || !parsed.username || !parsed.role || !isAdminRole(parsed.role)) {
      return null;
    }

    return {
      userId: parsed.userId,
      username: parsed.username,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

function verifyLegacyEnvAdminPassword(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPassword) {
    return false;
  }
  return username.trim() === expectedUser && password === expectedPassword;
}

/** @deprecated Použijte authenticateAdminUser. */
export function verifyAdminPassword(username: string, password: string): boolean {
  return verifyLegacyEnvAdminPassword(username, password);
}

export async function authenticateAdminUser(
  username: string,
  password: string
): Promise<AdminSessionPayload | null> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password) {
    return null;
  }

  const dbUser = await prisma.adminUser.findUnique({
    where: { username: normalizedUsername },
  });

  if (dbUser && (await verifyAdminPasswordHash(password, dbUser.passwordHash))) {
    if (!isAdminRole(dbUser.role)) {
      return null;
    }

    return {
      userId: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
    };
  }

  if (verifyLegacyEnvAdminPassword(normalizedUsername, password)) {
    return {
      userId: "legacy-env-admin",
      username: normalizedUsername,
      role: "ADMIN",
    };
  }

  return null;
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  return decodeSession(raw);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function setAdminSession(session: AdminSessionPayload): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encodeSession(session), {
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

export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdminPageAccess(
  check: (role: AdminRole) => boolean
): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (!check(session.role)) {
    redirect("/admin?access=denied");
  }

  return session;
}

export async function requireOrdersAccess(): Promise<AdminSessionPayload> {
  return requireAdminPageAccess(canAccessOrders);
}

export async function requireGeneratorAccess(): Promise<AdminSessionPayload> {
  return requireAdminPageAccess(canAccessGenerator);
}
