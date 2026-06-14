"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/app/admin/login/actions";

const initialState: AdminLoginState = { ok: false, message: "" };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
          Uživatelské jméno
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          defaultValue="admin"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Heslo
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>

      {state.message && !state.ok ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Přihlašuji…" : "Přihlásit se"}
      </button>
    </form>
  );
}
