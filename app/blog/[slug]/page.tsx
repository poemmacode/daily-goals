import { createClient } from "@/lib/supabase/server";
import type { SEOContentPage } from "@/lib/seo/types";
import { generateArticleJsonLd } from "@/lib/seo/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data } = await supabase
    .from("seo_content")
    .select("title, meta_title, meta_description, featured_image, canonical_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return {};

  const title = data.meta_title ?? data.title;
  const description = data.meta_description ?? "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.featured_image ? [data.featured_image] : [],
    },
    robots: { index: true, follow: true },
    alternates: data.canonical_url ? { canonical: data.canonical_url } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data } = await supabase
    .from("seo_content")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) notFound();

  const page = data as SEOContentPage;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dailygoals.app";
  const jsonLd = generateArticleJsonLd(page, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <nav className="mb-4 text-sm text-zinc-500">
          <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
          <span className="mx-1">/</span>
          <span>{page.title}</span>
        </nav>

        {page.featured_image && (
          <Image
            src={page.featured_image}
            alt={page.featured_image_alt ?? page.title}
            width={1200}
            height={630}
            className="mb-6 w-full rounded-2xl object-cover"
            priority
          />
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {page.category && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{page.category}</span>}
          {page.author && <span>by {page.author}</span>}
          {page.published_at && <span>{new Date(page.published_at).toLocaleDateString()}</span>}
        </div>

        <h1 className="mt-3 text-3xl font-bold">{page.title}</h1>

        {page.excerpt && (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{page.excerpt}</p>
        )}

        <article className="prose prose-zinc mt-6 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-indigo-600">
          {page.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, "<br />") }} />
          ) : (
            <p className="text-zinc-500">Content coming soon.</p>
          )}
        </article>
      </main>
    </>
  );
}
