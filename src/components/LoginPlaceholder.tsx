"use client";

import Link from "next/link";
import { pages } from "@/lib/content";
import { LmsLoginForm } from "@/components/lms/LmsLoginForm";

interface LoginPlaceholderProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPlaceholder({ open, onClose }: LoginPlaceholderProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="login-title" className="text-xl font-bold text-slate-900">
            Přihlášení
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Zavřít"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          <strong>Student:</strong> e-mail a heslo z uvítacího e-mailu, nebo demo{" "}
          <strong>{pages.demoTest.username}</strong> / <strong>{pages.demoTest.password}</strong>.
          <br />
          <strong>TechnikPO (admin):</strong> uživatel <strong>admin</strong> a heslo z nastavení
          administrace.
        </p>

        <div className="mt-4">
          <LmsLoginForm
            compact
            redirectTo="/lms"
            onSuccess={onClose}
          />
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Nebo přejděte přímo na{" "}
          <Link
            href="/lms/login"
            className="font-semibold text-brand-dark hover:underline"
            onClick={onClose}
          >
            stránku přihlášení
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
