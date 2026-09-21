"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function AdminDashboard() {
  const { lang } = useLang();

  return (
    <div>
      <h2 className="text-xl font-bold">{lang === "es" ? "Panel de Administración" : "Admin Dashboard"}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content"
          className="rounded-2xl border border-zinc-200 p-5 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
        >
          <p className="text-2xl">📝</p>
          <p className="mt-2 font-semibold">{lang === "es" ? "Contenido SEO" : "SEO Content"}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {lang === "es" ? "Crear y gestionar páginas de contenido" : "Create and manage content pages"}
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-2xl border border-zinc-200 p-5 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
        >
          <p className="text-2xl">🏷️</p>
          <p className="mt-2 font-semibold">{lang === "es" ? "Categorías" : "Categories"}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {lang === "es" ? "Gestionar categorías de contenido" : "Manage content categories"}
          </p>
        </Link>
      </div>
    </div>
  );
}
