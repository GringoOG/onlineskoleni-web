"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAdminSession } from "@/app/admin/login/actions";

interface AdminLogoutButtonProps {
  redirectTo?: string;
  className?: string;
  onLoggedOut?: () => void;
}

export function AdminLogoutButton({
  redirectTo = "/admin/login",
  className = "rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-brand-tint disabled:opacity-60",
  onLoggedOut,
}: AdminLogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAdminSession();
      onLoggedOut?.();
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Odhlašuji…" : "Odhlásit se"}
    </button>
  );
}
