import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Stránka nenalezena</h1>
      <p className="mt-4 text-slate-600">Požadovaná stránka neexistuje.</p>
      <Link
        href="/"
        className="btn-primary-lg mt-8 inline-flex"
      >
        Zpět na úvod
      </Link>
    </div>
  );
}
