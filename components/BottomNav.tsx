"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";

function CalendarCheckIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="9 15.5 11 17.5 15.5 12.5" />
    </svg>
  );
}

function TargetIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function PieIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor" stroke="none" opacity={0.85} />
    </svg>
  );
}

const TABS = [
  { href: "/", key: "today" as const, Icon: CalendarCheckIcon },
  { href: "/goals", key: "goals" as const, Icon: TargetIcon },
  { href: "/insights", key: "insights" as const, Icon: PieIcon },
];

/** Barra inferior estilo app móvil. Solo visible en mobile y con sesión. */
export function BottomNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!loggedIn) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="grid grid-cols-3">
        {TABS.map(({ href, key, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <Icon active={active} />
              {t.bottom[key]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
