"use client";

import Link from "next/link";

const resources = [
  {
    title: "SMART Goals Framework",
    description: "Make goals Specific, Measurable, Achievable, Relevant, and Time-bound.",
    category: "Goal Setting",
    href: "/blog/smart-goals",
  },
  {
    title: "Habit Stacking Guide",
    description: "Chain new habits to existing routines for automatic consistency.",
    category: "Habits",
    href: "/blog/habit-stacking",
  },
  {
    title: "Weekly Review Template",
    description: "A structured template to reflect on progress and plan ahead.",
    category: "Productivity",
    href: "/blog/weekly-review",
  },
  {
    title: "Goal Health Scoring",
    description: "How to calculate a deterministic health score for your goals.",
    category: "Goal Tracking",
    href: "/blog/goal-health",
  },
];

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold">Resources</h1>
      <p className="mt-2 text-zinc-500">Free guides and templates for goal achievement.</p>

      <div className="mt-6 space-y-4">
        {resources.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            className="block rounded-2xl border border-zinc-200 p-5 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
          >
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {r.category}
            </span>
            <h2 className="mt-2 font-bold">{r.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{r.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-400">
        More resources coming soon.
      </p>
    </main>
  );
}
