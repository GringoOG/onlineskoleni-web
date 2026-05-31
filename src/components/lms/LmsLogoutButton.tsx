"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutDemoUser } from "@/app/lms/actions";

export function LmsLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutDemoUser();
      router.push("/lms/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-brand-tint disabled:opacity-60"
    >
      {isPending ? "Odhlašuji…" : "Odhlásit se"}
    </button>
  );
}
