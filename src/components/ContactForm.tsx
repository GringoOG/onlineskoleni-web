"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm, type ContactFormState } from "@/app/kontakt/actions";
import { courses } from "@/lib/content";
import { trackLeadConversion } from "@/lib/track-lead-conversion";

const initialState: ContactFormState = { ok: false, message: "" };

function scheduleLeadTracking(trackId: string) {
  const attempt = () => trackLeadConversion(trackId);
  attempt();
  queueMicrotask(attempt);
  window.setTimeout(attempt, 0);
  window.setTimeout(attempt, 300);
  window.setTimeout(attempt, 1000);
}

export function ContactForm() {
  const trackedIdRef = useRef<string | undefined>(undefined);

  const [state, formAction, pending] = useActionState(
    async (prev: ContactFormState, formData: FormData) => {
      const result = await submitContactForm(prev, formData);
      if (result.ok && result.trackId && trackedIdRef.current !== result.trackId) {
        scheduleLeadTracking(result.trackId);
        trackedIdRef.current = result.trackId;
      }
      return result;
    },
    initialState
  );

  useEffect(() => {
    if (!state.ok || !state.trackId || trackedIdRef.current === state.trackId) {
      return;
    }

    scheduleLeadTracking(state.trackId);
    trackedIdRef.current = state.trackId;
  }, [state.ok, state.trackId]);

  useEffect(() => {
    if (!state.ok || !state.message) return;
    const el = document.getElementById("contact-form-status");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state.ok, state.message]);

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
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {courses.map((course) => (
            <label
              key={course.slug}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                name="trainingTypes"
                value={course.slug}
                className="mt-1 shrink-0 rounded border-slate-300 text-brand-dark focus:ring-brand"
              />
              <span className="break-words">
                {course.shortTitle} – {course.title}
              </span>
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
          id="contact-form-status"
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
