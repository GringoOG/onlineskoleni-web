"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { pages } from "@/lib/content";
import { loginDemoUser } from "@/app/lms/actions";

interface LmsLoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function LmsLoginForm({
  redirectTo = "/lms/bozp/test",
  onSuccess,
  compact = false,
}: LmsLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(pages.demoTest.username);
  const [password, setPassword] = useState(pages.demoTest.password);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginDemoUser(username, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      onSuccess?.();
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <label htmlFor="lms-username" className="block text-sm font-medium text-foreground">
          Uživatelské jméno nebo e-mail
        </label>
        <input
          id="lms-username"
          name="username"
          type="text"
          autoComplete="username email"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="lms-password" className="block text-sm font-medium text-foreground">
          Heslo
        </label>
        <input
          id="lms-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:ring-2"
        />
      </div>

      {!compact && (
        <p className="text-sm text-muted">
          Demo účet: <strong>{pages.demoTest.username}</strong> /{" "}
          <strong>{pages.demoTest.password}</strong>
          <br />
          Po objednávce použijte e-mail a heslo z uvítacího e-mailu.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Přihlašuji…" : "Vstoupit do testu"}
      </button>
    </form>
  );
}
