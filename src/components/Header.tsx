"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LoginPlaceholder } from "./LoginPlaceholder";
import { LmsLogoutButton } from "@/components/lms/LmsLogoutButton";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import type { LmsUserSummary } from "@/lib/lms/get-lms-user-summary";
import type { AdminRole } from "@/lib/admin/roles";

const navItems = [
  { href: "/o-nas", label: "O\u00A0nás" },
  { href: "/skoleni", label: "Školení" },
  { href: "/sluzby", label: "Služby" },
  { href: "/cenik", label: "Ceník" },
  { href: "/objednavka", label: "Objednat" },
  { href: "/lms", label: "Moje\u00A0školení" },
  { href: "/lms/bozp/test", label: "Zkusit\u00A0test" },
  { href: "/kontakt", label: "Kontakt" },
];

export interface HeaderAdminUser {
  username: string;
  role: AdminRole;
  homeHref: string;
}

interface HeaderProps {
  lmsUser: LmsUserSummary | null;
  adminUser?: HeaderAdminUser | null;
}

export function Header({ lmsUser, adminUser = null }: HeaderProps) {
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

  const showAdmin = Boolean(adminUser);
  const showStudent = Boolean(lmsUser) && !showAdmin;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-surface-dark/95 pt-[env(safe-area-inset-top)] text-white backdrop-blur supports-[backdrop-filter]:bg-surface-dark/90">
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
            {showAdmin && adminUser ? (
              <>
                <div className="hidden min-[1320px]:flex min-w-0 flex-col items-end text-right">
                  <span className="text-xs text-white/60">Přihlášen admin</span>
                  <span
                    className="max-w-[180px] truncate text-sm font-medium text-white"
                    title={adminUser.username}
                  >
                    {adminUser.username}
                  </span>
                </div>
                <Link
                  href={adminUser.homeHref}
                  className="inline-flex max-w-[9.5rem] min-w-0 items-center truncate rounded-lg bg-brand px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark min-[1320px]:hidden sm:max-w-[12rem] sm:px-3 sm:text-sm"
                  title="Administrace"
                >
                  Administrace
                </Link>
                <Link
                  href={adminUser.homeHref}
                  className="hidden min-[1320px]:inline-flex shrink-0 items-center whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Administrace
                </Link>
                <AdminLogoutButton
                  redirectTo="/admin/login"
                  className="hidden min-[1320px]:inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                />
              </>
            ) : showStudent && lmsUser ? (
              <>
                <div className="hidden min-[1320px]:flex min-w-0 flex-col items-end text-right">
                  <span className="text-xs text-white/60">Přihlášen</span>
                  <span
                    className="max-w-[180px] truncate text-sm font-medium text-white"
                    title={`${lmsUser.name} (${lmsUser.email})`}
                  >
                    {lmsUser.name}
                  </span>
                </div>
                <Link
                  href="/lms"
                  className="inline-flex max-w-[7.5rem] min-w-0 items-center truncate rounded-lg bg-brand px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark min-[1320px]:hidden sm:max-w-[10rem] sm:px-3 sm:text-sm"
                  title={`Moje školení – ${lmsUser.name}`}
                >
                  Moje&nbsp;školení
                </Link>
                <Link
                  href="/lms"
                  className="hidden min-[1320px]:inline-flex shrink-0 items-center whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Moje&nbsp;školení
                </Link>
                <LmsLogoutButton
                  redirectTo={pathname.startsWith("/lms") ? "/lms/login" : "/"}
                  className="hidden min-[1320px]:inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                />
              </>
            ) : (
              <>
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
              </>
            )}
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
            className="fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 bg-black/50 min-[1320px]:hidden"
            aria-label="Zavřít menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t border-white/10 bg-surface-darker px-4 py-4 shadow-xl min-[1320px]:hidden"
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
              {showAdmin && adminUser ? (
                <>
                  <li className="border-t border-white/10 pt-3">
                    <p className="px-3 text-xs text-white/60">Přihlášen admin</p>
                    <p className="px-3 text-sm font-medium text-white">{adminUser.username}</p>
                  </li>
                  <li>
                    <Link
                      href={adminUser.homeHref}
                      className="btn-primary block text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Administrace
                    </Link>
                  </li>
                  <li>
                    <AdminLogoutButton
                      redirectTo="/admin/login"
                      className="w-full rounded-md border border-white/20 px-3 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10 disabled:opacity-60"
                      onLoggedOut={() => setMobileOpen(false)}
                    />
                  </li>
                </>
              ) : showStudent && lmsUser ? (
                <>
                  <li className="border-t border-white/10 pt-3">
                    <p className="px-3 text-xs text-white/60">Přihlášen</p>
                    <p className="px-3 text-sm font-medium text-white">{lmsUser.name}</p>
                    <p className="px-3 text-xs text-white/70">{lmsUser.email}</p>
                  </li>
                  <li>
                    <Link
                      href="/lms"
                      className="btn-primary block text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Moje školení
                    </Link>
                  </li>
                  <li>
                    <LmsLogoutButton
                      redirectTo={pathname.startsWith("/lms") ? "/lms/login" : "/"}
                      className="w-full rounded-md border border-white/20 px-3 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10 disabled:opacity-60"
                      onLoggedOut={() => setMobileOpen(false)}
                    />
                  </li>
                </>
              ) : (
                <>
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
                </>
              )}
            </ul>
          </nav>
        </>
      )}

      <LoginPlaceholder open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
