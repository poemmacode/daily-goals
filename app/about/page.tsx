"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useLang();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-3xl font-bold">{t.about.title}</h1>
      <p className="mt-2 text-zinc-500">{t.about.subtitle}</p>

      {/* What is it */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">{t.about.whatItIs}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t.about.whatItIsText}</p>
      </section>

      {/* Features */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">{t.about.features}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: "🎯", title: t.about.f1Title, text: t.about.f1Text },
            { icon: "⏱️", title: t.about.f2Title, text: t.about.f2Text },
            { icon: "🔥", title: t.about.f3Title, text: t.about.f3Text },
            { icon: "💊", title: t.about.f4Title, text: t.about.f4Text },
            { icon: "📊", title: t.about.f5Title, text: t.about.f5Text },
            { icon: "📅", title: t.about.f6Title, text: t.about.f6Text },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">{t.about.howItWorks}</h2>
        <ol className="mt-4 space-y-3">
          {[t.about.step1, t.about.step2, t.about.step3, t.about.step4].map(
            (step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {i + 1}
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">{step}</p>
              </li>
            )
          )}
        </ol>
      </section>

      {/* Templates */}
      <section className="mt-8 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-xl font-bold">{t.about.templates}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t.about.templatesText}
        </p>
      </section>

      {/* Freemium */}
      <section className="mt-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-xl font-bold">{t.about.freemium}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t.about.freemiumText}
        </p>
      </section>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/goals"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          {t.about.cta} →
        </Link>
      </div>
    </main>
  );
}
