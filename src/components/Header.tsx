"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LoginPlaceholder } from "./LoginPlaceholder";

const navItems = [
  { href: "/#o-nas", label: "O\u00A0nás" },
  { href: "/skoleni", label: "Školení" },
  { href: "/sluzby", label: "Služby" },
  { href: "/cenik", label: "Ceník" },
  { href: "/objednavka", label: "Objednat" },
  { href: "/lms", label: "Moje\u00A0školení" },
  { href: "/hrbek-learning/?demo=1", label: "Microlearning" },
  { href: "/lms/bozp/test", label: "Zkusit\u00A0test" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href ||
    (href.startsWith("/skoleni") && pathname.startsWith("/skoleni"));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-surface-dark/95 text-white backdrop-blur supports-[backdrop-filter]:bg-surface-dark/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="shrink-0">
            <Logo />
          </div>

          <nav
            className="hidden min-[1320px]:flex shrink-0 flex-nowrap items-center gap-0.5"
            aria-label="Hlavní navigace"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-white/10 ${
                  isActive(item.href) ? "text-brand-light" : "text-white/85"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="hidden min-[1320px]:inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Přihlásit&nbsp;se
            </button>
            <Link
              href="/kontakt"
              className="btn-primary hidden min-[1320px]:inline-flex shrink-0 whitespace-nowrap"
            >
              Kontaktovat
            </Link>
            <button
              type="button"
              className="inline-flex min-[1320px]:hidden rounded-lg p-2 text-white hover:bg-white/10"
              aria-expanded={mobileOpen}
              aria-label="Menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-black/50 min-[1320px]:hidden"
            aria-label="Zavřít menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-surface-darker px-4 py-4 shadow-xl min-[1320px]:hidden"
            aria-label="Mobilní navigace"
          >
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label.replace(/\u00A0/g, " ")}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10"
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginOpen(true);
                  }}
                >
                  Přihlásit se
                </button>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="btn-primary block text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Kontaktovat
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}

      <LoginPlaceholder open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
