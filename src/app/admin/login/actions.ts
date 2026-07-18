"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateAdminUser,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/auth";
import { getDefaultAdminRedirect } from "@/lib/admin/roles";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export type AdminLoginState = {
  ok: boolean;
  message: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const ip = getClientIp(await headers());
  const rate = checkRateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Příliš mnoho pokusů o přihlášení. Zkuste to znovu za ${rate.retryAfterSec} s.`,
    };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const session = await authenticateAdminUser(username, password);
  if (!session) {
    return { ok: false, message: "Neplatné přihlašovací údaje." };
  }

  await setAdminSession(session);
  redirect(getDefaultAdminRedirect(session.role));
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

/** Odhlášení bez redirectu – pro tlačítko v hlavičce webu. */
export async function logoutAdminSession(): Promise<void> {
  await clearAdminSession();
}
