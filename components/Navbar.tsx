"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LangToggle, useLang } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { t } = useLang();
  const LINKS = [
    { href: "/", label: t.nav.today },
    { href: "/goals", label: t.nav.goals },
    { href: "/insights", label: t.nav.insights },
    { href: "/settings", label: t.nav.settings },
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

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
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
        <Link href="/" className="font-bold tracking-tight" onClick={() => setOpen(false)}>
          🎯 Daily Goals®
        </Link>
        <div className="flex items-center gap-2">
          {/* Desktop */}
          {loggedIn && (
            <nav className="hidden items-center gap-1 md:flex">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                  {l.label}
                </Link>
              ))}
              {PUBLIC_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                  {l.label}
                </Link>
              ))}
              <button
                onClick={signOut}
                className="ml-2 rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                {t.nav.signOut}
              </button>
            </nav>
          )}
          {!loggedIn && (
            <nav className="hidden items-center gap-1 md:flex">
              {PUBLIC_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
          <LangToggle />
          {/* Mobile burger */}
          {loggedIn && (
            <button
              className="rounded-lg px-3 py-1.5 text-xl md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
            >
              {open ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>
      {/* Mobile panel */}
      {loggedIn && open && (
        <nav className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`${linkCls(l.href)} block py-2.5`}
            >
              {l.label}
            </Link>
          ))}
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`${linkCls(l.href)} block py-2.5`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <button
              onClick={signOut}
              className="rounded-lg px-3 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {t.nav.signOut}
            </button>
            <LangToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
