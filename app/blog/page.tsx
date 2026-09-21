"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { SEOContentPage } from "@/lib/seo/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<SEOContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("seo_content")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts((data as SEOContentPage[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-zinc-500">Goal setting tips, productivity strategies, and habit science.</p>

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-zinc-500">Check back soon for goal-setting insights.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              {post.featured_image && (
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt ?? post.title}
                  width={800}
                  height={400}
                  className="mb-3 w-full rounded-xl object-cover"
                />
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {post.category && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{post.category}</span>}
                {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="mt-2 text-xl font-bold hover:text-indigo-600">{post.title}</h2>
              </Link>
              {post.excerpt && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
