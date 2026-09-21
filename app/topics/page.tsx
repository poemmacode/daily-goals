"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { SEOContentPage } from "@/lib/seo/types";

interface TopicGroup {
  category: string;
  count: number;
  posts: SEOContentPage[];
}

export default function TopicsPage() {
  const [groups, setGroups] = useState<TopicGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("seo_content")
        .select("*")
        .eq("status", "published")
        .not("category", "is", null)
        .order("published_at", { ascending: false });

      const posts = (data as SEOContentPage[] | null) ?? [];
      const grouped = new Map<string, SEOContentPage[]>();
      for (const p of posts) {
        const cat = p.category ?? "Uncategorized";
        const arr = grouped.get(cat) ?? [];
        arr.push(p);
        grouped.set(cat, arr);
      }
      const result: TopicGroup[] = Array.from(grouped.entries())
        .map(([category, catPosts]) => ({ category, count: catPosts.length, posts: catPosts }))
        .sort((a, b) => b.count - a.count);
      setGroups(result);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold">Topics</h1>
      <p className="mt-2 text-zinc-500">Browse articles by topic.</p>

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">Loading...</p>
      ) : groups.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="font-medium">No topics yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <section key={g.category}>
              <h2 className="text-lg font-bold">{g.category} <span className="text-sm font-normal text-zinc-500">({g.count})</span></h2>
              <ul className="mt-2 space-y-2">
                {g.posts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/blog/${p.slug}`} className="text-sm font-medium hover:text-indigo-600">
                      {p.title}
                    </Link>
                    {p.published_at && (
                      <span className="ml-2 text-xs text-zinc-400">{new Date(p.published_at).toLocaleDateString()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
