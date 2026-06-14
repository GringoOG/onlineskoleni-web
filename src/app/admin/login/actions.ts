"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/auth";

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

  if (!verifyAdminPassword(username, password)) {
    return { ok: false, message: "Neplatné přihlašovací údaje." };
  }

  await setAdminSession();
  redirect("/admin/objednavky/nova");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
