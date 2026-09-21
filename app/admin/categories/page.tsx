"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { SEO_CATEGORIES } from "@/lib/seo/types";

export default function AdminCategoriesPage() {
  const { lang } = useLang();
  const [newCat, setNewCat] = useState("");
  const [cats, setCats] = useState<string[]>([...SEO_CATEGORIES]);

  function addCategory() {
    const trimmed = newCat.trim();
    if (trimmed && !cats.includes(trimmed)) {
      setCats([...cats, trimmed]);
      setNewCat("");
    }
  }

  function removeCategory(cat: string) {
    setCats(cats.filter((c) => c !== cat));
  }

  return (
    <div>
      <h2 className="text-xl font-bold">{lang === "es" ? "Categorías" : "Categories"}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {lang === "es" ? "Gestionar categorías de contenido" : "Manage content categories"}
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder={lang === "es" ? "Nueva categoría..." : "New category..."}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          onClick={addCategory}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          +
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {cats.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span>{cat}</span>
            <button
              onClick={() => removeCategory(cat)}
              className="text-xs text-zinc-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        {lang === "es"
          ? "Estas categorías se usan en el editor de contenido SEO. Para persistir, se guardarían en la base de datos."
          : "These categories are used in the SEO content editor. To persist, they would be saved to the database."}
      </p>
    </div>
  );
}
