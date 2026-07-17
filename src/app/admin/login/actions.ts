"use server";

import { redirect } from "next/navigation";
import {
  authenticateAdminUser,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/auth";
import { getDefaultAdminRedirect } from "@/lib/admin/roles";

export type AdminLoginState = {
  ok: boolean;
  message: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
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
