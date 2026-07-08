"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutDemoUser } from "@/app/lms/actions";

interface LmsLogoutButtonProps {
  redirectTo?: string;
  className?: string;
  onLoggedOut?: () => void;
}

export function LmsLogoutButton({
  redirectTo = "/lms/login",
  className = "rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-brand-tint disabled:opacity-60",
  onLoggedOut,
}: LmsLogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutDemoUser();
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
