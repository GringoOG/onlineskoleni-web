"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/kontakt/actions";
import { courses } from "@/lib/content";

const initialState: ContactFormState = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Jméno a příjmení *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700">
            Firma
          </label>
          <input
            id="company"
            name="company"
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Typ školení</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {courses.map((course) => (
            <label
              key={course.slug}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                name="trainingTypes"
                value={course.slug}
                className="rounded border-slate-300 text-brand-dark focus:ring-brand"
              />
              {course.shortTitle} – {course.title}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700">
          Zpráva *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Uveďte prosím jména zaměstnanců a druh školení…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 rounded border-slate-300 text-brand-dark focus:ring-brand"
        />
        <span>
          Souhlasím se zpracováním osobních údajů dle{" "}
          <a href="/ochrana-udaju" className="link-brand underline">
            zásad ochrany údajů
          </a>
          . *
        </span>
      </label>

      {state.message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary-lg w-full disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Odesílám…" : "Odeslat zprávu"}
      </button>
    </form>
  );
}
