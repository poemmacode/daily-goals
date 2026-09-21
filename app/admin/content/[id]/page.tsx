"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { SEOContentPage } from "@/lib/seo/types";
import {
  generateSlug,
  calculateSEOHealth,
  SEO_CATEGORIES,
} from "@/lib/seo/types";
import { useLang } from "@/lib/i18n";

const EMPTY_PAGE: SEOContentPage = {
  id: "",
  title: "",
  slug: "",
  excerpt: null,
  content: null,
  status: "draft",
  meta_title: null,
  meta_description: null,
  canonical_url: null,
  featured_image: null,
  featured_image_alt: null,
  category: null,
  focus_keyword: null,
  secondary_keywords: null,
  author: null,
  indexable: true,
  follow_links: true,
  published_at: null,
  created_at: "",
  updated_at: "",
};

export default function ContentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { lang } = useLang();
  const id = params.id as string;
  const isNew = id === "new";

  const [page, setPage] = useState<SEOContentPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("seo_content")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError || !data) {
        setError("Failed to load content");
        setLoading(false);
        return;
      }
      setPage(data as SEOContentPage);
      setSlugManual(Boolean(data.slug));
      setLoading(false);
    })();
  }, [id, isNew]);

  function update<K extends keyof SEOContentPage>(key: K, value: SEOContentPage[K]) {
    setPage((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugManual) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
    setSaved(false);
  }

  async function handleSave(publish = false) {
    if (!page.title.trim()) {
      setError(lang === "es" ? "El título es requerido" : "Title is required");
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const now = new Date().toISOString();

    const row = {
      title: page.title.trim(),
      slug: page.slug || generateSlug(page.title),
      excerpt: page.excerpt || null,
      content: page.content || null,
      status: publish ? "published" : page.status,
      meta_title: page.meta_title || null,
      meta_description: page.meta_description || null,
      canonical_url: page.canonical_url || null,
      featured_image: page.featured_image || null,
      featured_image_alt: page.featured_image_alt || null,
      category: page.category || null,
      focus_keyword: page.focus_keyword || null,
      secondary_keywords: page.secondary_keywords?.length ? page.secondary_keywords : null,
      author: page.author || null,
      indexable: page.indexable,
      follow_links: page.follow_links,
      created_at: now,
      published_at: publish && page.status !== "published" ? now : page.published_at,
      updated_at: now,
    };

    if (isNew) {
      const { data, error: insertError } = await supabase
        .from("seo_content")
        .insert(row)
        .select("id")
        .single();
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      router.replace(`/admin/content/${data!.id}`);
    } else {
      const { error: updateError } = await supabase
        .from("seo_content")
        .update(row)
        .eq("id", id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSaved(true);
  }

  const health = calculateSEOHealth(page);
  const previewUrl = page.slug ? `/blog/${page.slug}` : "#";

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-center text-zinc-500">{lang === "es" ? "Cargando..." : "Loading..."}</p>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← {lang === "es" ? "Volver" : "Back"}
          </Link>
          <h2 className="text-xl font-bold">
            {isNew ? (lang === "es" ? "Nuevo Contenido" : "New Content") : (lang === "es" ? "Editar" : "Edit")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              {lang === "es" ? "Vista previa" : "Preview"} →
            </a>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-50"
          >
            {lang === "es" ? "Guardar borrador" : "Save draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {lang === "es" ? "Publicar" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {saved && (
        <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          {lang === "es" ? "Guardado ✓" : "Saved ✓"}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className="block text-sm font-medium">{lang === "es" ? "Título" : "Title"}</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">URL / Slug</label>
            <div className="mt-1 flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700">
              <span className="pl-3 text-sm text-zinc-500">/blog/</span>
              <input
                type="text"
                value={page.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  update("slug", e.target.value);
                }}
                className="w-full border-0 bg-transparent px-0 py-2 pr-3 text-sm focus:outline-none dark:bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">{lang === "es" ? "Extracto" : "Excerpt"}</label>
            <textarea
              value={page.excerpt ?? ""}
              onChange={(e) => update("excerpt", e.target.value || null)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">{lang === "es" ? "Contenido" : "Content"} (Markdown)</label>
            <textarea
              value={page.content ?? ""}
              onChange={(e) => update("content", e.target.value || null)}
              rows={15}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="# Heading&#10;&#10;Your content here..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SEO Health */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{lang === "es" ? "Salud SEO" : "SEO Health"}</h3>
              <span
                className={`text-lg font-bold ${
                  health.score >= 80 ? "text-green-600" : health.score >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {health.score}%
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {health.checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  <span className={check.passed ? "text-green-600" : "text-red-500"}>
                    {check.passed ? "✓" : "✗"}
                  </span>
                  <span className="flex-1">{check.label}</span>
                  {check.message && <span className="text-zinc-500">{check.message}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Meta SEO */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">{lang === "es" ? "Meta SEO" : "Meta SEO"}</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium">Meta Title</label>
                <input
                  type="text"
                  value={page.meta_title ?? ""}
                  onChange={(e) => update("meta_title", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder={page.title}
                />
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {(page.meta_title ?? "").length}/60
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium">Meta Description</label>
                <textarea
                  value={page.meta_description ?? ""}
                  onChange={(e) => update("meta_description", e.target.value || null)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {(page.meta_description ?? "").length}/160
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium">Focus Keyword</label>
                <input
                  type="text"
                  value={page.focus_keyword ?? ""}
                  onChange={(e) => update("focus_keyword", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">{lang === "es" ? "URL Canónica" : "Canonical URL"}</label>
                <input
                  type="text"
                  value={page.canonical_url ?? ""}
                  onChange={(e) => update("canonical_url", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Featured image */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">{lang === "es" ? "Imagen" : "Featured Image"}</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium">URL</label>
                <input
                  type="text"
                  value={page.featured_image ?? ""}
                  onChange={(e) => update("featured_image", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Alt text</label>
                <input
                  type="text"
                  value={page.featured_image_alt ?? ""}
                  onChange={(e) => update("featured_image_alt", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Category + Author */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">{lang === "es" ? "Detalles" : "Details"}</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium">{lang === "es" ? "Categoría" : "Category"}</label>
                <select
                  value={page.category ?? ""}
                  onChange={(e) => update("category", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">—</option>
                  {SEO_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium">{lang === "es" ? "Autor" : "Author"}</label>
                <input
                  type="text"
                  value={page.author ?? ""}
                  onChange={(e) => update("author", e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={page.indexable}
                    onChange={(e) => update("indexable", e.target.checked)}
                    className="rounded"
                  />
                  Index
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={page.follow_links}
                    onChange={(e) => update("follow_links", e.target.checked)}
                    className="rounded"
                  />
                  Follow
                </label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">{lang === "es" ? "Estado" : "Status"}</h3>
            <select
              value={page.status}
              onChange={(e) => update("status", e.target.value as SEOContentPage["status"])}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
