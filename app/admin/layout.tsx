"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setAuthorized(false);
        return;
      }
      // Check if user is admin via profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();
      setAuthorized((profile as Profile | null)?.is_admin === true);
    });
  }, []);

  if (authorized === null) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-center text-zinc-500">{lang === "es" ? "Cargando..." : "Loading..."}</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">{lang === "es" ? "Acceso no autorizado" : "Unauthorized"}</p>
        <Link href="/login" className="mt-2 font-semibold text-indigo-600">
          {lang === "es" ? "Iniciar sesión" : "Sign in"}
        </Link>
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: lang === "es" ? "Dashboard" : "Dashboard" },
    { href: "/admin/content", label: lang === "es" ? "Contenido" : "Content" },
    { href: "/admin/categories", label: lang === "es" ? "Categorías" : "Categories" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-lg font-bold">🔧 Admin</h1>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                pathname === item.href
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
