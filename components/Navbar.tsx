"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LangToggle, useLang } from "@/lib/i18n";

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const { t } = useLang();

  const LINKS = [
    { href: "/", label: t.nav.today },
    { href: "/goals", label: t.nav.goals },
    { href: "/insights", label: t.nav.insights },
  ];
  const PUBLIC_LINKS = [
    { href: "/blog", label: t.nav.blog },
    { href: "/about", label: t.nav.about },
  ];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // Close menus on route change via ref check
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setUserMenuOpen(false);
      setMobileOpen(false);
    }
  }, [pathname]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/login");
    router.refresh();
  }

  const linkCls = (href: string) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${
      pathname === href
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
    }`;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold tracking-tight" onClick={() => setMobileOpen(false)}>
          🎯 Daily Goals®
        </Link>
        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {(loggedIn ? [...LINKS, ...PUBLIC_LINKS] : PUBLIC_LINKS).map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                {l.label}
              </Link>
            ))}
            {!loggedIn && (
              <Link href="/login" className={linkCls("/login")}>
                {t.nav.login}
              </Link>
            )}
          </nav>

          <LangToggle />

          {/* User icon dropdown (logged in) */}
          {loggedIn && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <UserIcon />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span>⚙️</span> {t.nav.settings}
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span>🚪</span> {t.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile burger */}
          {loggedIn && (
            <button
              className="rounded-lg px-3 py-1.5 text-xl md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      {loggedIn && mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`${linkCls(l.href)} block py-2.5`}
            >
              {l.label}
            </Link>
          ))}
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`${linkCls(l.href)} block py-2.5`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              ⚙️ {t.nav.settings}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={signOut}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                🚪 {t.nav.signOut}
              </button>
              <LangToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
