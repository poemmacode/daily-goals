"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { SEOContentPage } from "@/lib/seo/types";
import { calculateSEOHealth } from "@/lib/seo/types";
import { useLang } from "@/lib/i18n";

export default function AdminContentPage() {
  const { lang } = useLang();
  const [pages, setPages] = useState<SEOContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("seo_content")
        .select("*")
        .order("updated_at", { ascending: false });
      setPages((data as SEOContentPage[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = pages.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColors = {
    draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    published: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    archived: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{lang === "es" ? "Contenido" : "Content"}</h2>
        <Link
          href="/admin/content/new"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + {lang === "es" ? "Nuevo" : "New"}
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["all", "draft", "published", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                filter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {s === "all" ? (lang === "es" ? "Todos" : "All") : s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "es" ? "Buscar..." : "Search..."}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {/* Content list */}
      {loading ? (
        <p className="mt-8 text-center text-zinc-500">{lang === "es" ? "Cargando..." : "Loading..."}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="font-medium">{lang === "es" ? "No hay contenido" : "No content yet"}</p>
          <Link href="/admin/content/new" className="mt-2 inline-block font-semibold text-indigo-600">
            {lang === "es" ? "Crear tu primera página" : "Create your first page"} →
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">{lang === "es" ? "Título" : "Title"}</th>
                <th className="px-4 py-3 font-medium">{lang === "es" ? "Estado" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{lang === "es" ? "SEO" : "SEO"}</th>
                <th className="px-4 py-3 font-medium">{lang === "es" ? "Categoría" : "Category"}</th>
                <th className="px-4 py-3 font-medium">{lang === "es" ? "Actualizado" : "Updated"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((page) => {
                const health = calculateSEOHealth(page);
                return (
                  <tr key={page.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/content/${page.id}`} className="font-medium hover:text-indigo-600">
                        {page.title}
                      </Link>
                      {page.slug && (
                        <p className="text-xs text-zinc-500">/{page.slug}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[page.status]}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${
                              health.score >= 80 ? "bg-green-500" : health.score >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${health.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500">{health.score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{page.category ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
