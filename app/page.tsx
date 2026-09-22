"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { TodayChecklist } from "@/components/TodayChecklist";

export default function HomePage() {
  const { lang } = useLang();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
  }, []);

  // Loading state
  if (loggedIn === null) {
    return <main className="mx-auto max-w-2xl px-4 py-6"><p className="mt-8 text-center text-zinc-500">{lang === "es" ? "Cargando..." : "Loading..."}</p></main>;
  }

  // Logged in → Today checklist
  if (loggedIn) {
    return <TodayChecklist />;
  }

  // Not logged in → Landing page
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Daily Goals®",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            description:
              "Data-driven habit tracker and productivity system. Track goals, analyze failure patterns, build streaks, and use AI coaching to achieve your goals.",
            url: "https://dailygoals.app",
            image: "https://dailygoals.app/thumbnail-json-strucuted-data-goal-tracker.jpg",
            screenshot: "https://dailygoals.app/product-01-goal-tracker.jpg",
            featureList:
              "Goal tracking, Focus timer, Streak tracking, Goal health scoring, Failure analysis, Weekly review, AI coaching, Habit templates, Contribution heatmap",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Person",
              name: "Emma Estrada",
            },
          }),
        }}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent">
          <div className="mx-auto max-w-2xl px-4 pb-12 pt-16 text-center md:pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
              {lang === "es"
                ? "Finalmente, un tracker que entiende por qué fallas un día."
                : "Finally, a goal tracker that understands why you miss a day."}
            </h1>
            <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400">
              {lang === "es"
                ? "Deja de adivinar por qué tus hábitos no funcionan. Daily Goals® usa análisis basado en datos y tus patrones de fallo para ayudarte a construir sistemas que realmente funcionan — no solo rachas que se rompen."
                : "Stop guessing why your habits aren't sticking. Daily Goals® uses data-driven analytics and your own failure patterns to help you build systems that actually work—not just streaks that break."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/login"
                className="inline-block rounded-xl bg-indigo-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
              >
                {lang === "es" ? "Empieza a Rastrear Gratis" : "Start Tracking for Free"}
              </Link>
              <p className="text-sm text-zinc-400">
                {lang === "es"
                  ? "Sin instalación requerida. Web-based y privado."
                  : "No install required. Web-based & private."}
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-3xl px-4 pb-16">
            <Image
              src="/hero-section-goal-tracker.jpg"
              alt="Daily Goals® — data-driven habit tracker dashboard"
              width={1200}
              height={630}
              className="w-full rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="mx-auto max-w-2xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold">
            {lang === "es" ? "La Diferencia Basada en Datos" : "The Data-Driven Difference"}
          </h2>

          <div className="mt-12 space-y-12">
            {/* 1 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <span className="text-3xl">📊</span>
                <h3 className="mt-2 text-xl font-bold">
                  {lang === "es"
                    ? "Más Allá de las Rachas \"Gamificadas\""
                    : 'Move Beyond "Gamified" Streaks'}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {lang === "es"
                    ? "La mayoría de apps tratan fallar un día como un fracaso. Nosotros lo tratamos como datos. Nuestro algoritmo de puntuación de salud analiza consistencia, tendencias y tasa de completado para darte una vista honesta de tu progreso."
                    : "Most apps treat missing a day as a failure. We treat it as data. Our deterministic health scoring algorithm looks at consistency, trends, and completion rate to give you an honest view of your progress."}
                </p>
              </div>
              <Image
                src="/product-01-goal-tracker.jpg"
                alt="Goal health scoring dashboard"
                width={400}
                height={250}
                className="rounded-xl object-cover"
              />
            </div>

            {/* 2 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Image
                src="/product-02-goal-tracker.jpg"
                alt="Failure reason tracking"
                width={400}
                height={250}
                className="rounded-xl object-cover md:order-1"
              />
              <div className="flex-1 md:order-2">
                <span className="text-3xl">🔍</span>
                <h3 className="mt-2 text-xl font-bold">
                  {lang === "es"
                    ? "Convierte el \"Por Qué\" en \"Cómo\""
                    : 'Turn "Why" into "How"'}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {lang === "es"
                    ? "Cuando fallas un objetivo, usa nuestro selector de razones integrado. ¿Es tiempo? ¿Cansancio? ¿Olvido? Nuestro Dashboard de Insights identifica tus bloqueadores de productividad únicos para que puedas cambiar tu estrategia."
                    : "When you miss a goal, use our integrated reason-picker. Is it time? Fatigue? Forgetfulness? Our Insights Dashboard identifies your unique productivity blockers so you can pivot your strategy."}
                </p>
              </div>
            </div>

            {/* 3 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <span className="text-3xl">🤖</span>
                <h3 className="mt-2 text-xl font-bold">
                  {lang === "es" ? "Tu Entrenador de IA (BYOK)" : "Your AI Goal Coach (BYOK)"}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {lang === "es"
                    ? "Usa tu propia clave de OpenAI y desbloquea un entrenador de IA dedicado que analiza tu historial para darte consejos personalizados. Sin suscripciones, sin costos ocultos — solo inteligencia pura a tu servicio."
                    : "Bring your own OpenAI key and unlock a dedicated AI coach that analyzes your history to provide personalized advice. No subscription locks, no hidden costs—just pure intelligence at your service."}
                </p>
              </div>
              <Image
                src="/product-03-goal-tracker.jpg"
                alt="AI Goal Coach interface"
                width={400}
                height={250}
                className="rounded-xl object-cover"
              />
            </div>

            {/* 4 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Image
                src="/product-04-goal-tracker.jpg"
                alt="Focus timer and templates"
                width={400}
                height={250}
                className="rounded-xl object-cover md:order-1"
              />
              <div className="flex-1 md:order-2">
                <span className="text-3xl">⚡</span>
                <h3 className="mt-2 text-xl font-bold">
                  {lang === "es"
                    ? "Todo lo que Necesitas, Nada que No"
                    : "Everything You Need, Nothing You Don't"}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {lang === "es"
                    ? "Diseñado para la velocidad. Desde timers de enfoque hasta resúmenes de revisión semanal y plantillas de hábitos, Daily Goals® es una herramienta de nivel profesional diseñada para personas que toman su crecimiento en serio."
                    : "Built for speed. From focus timers to weekly review summaries and habit templates, Daily Goals® is a professional-grade tool designed for people who take their growth seriously."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust Section */}
        <section className="border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                lang === "es" ? "Puntuación de salud determinista" : "Deterministic goal health scoring",
                lang === "es" ? "Mapa de calor estilo GitHub" : "GitHub-style contribution heatmap",
                lang === "es"
                  ? "Hecho con Next.js, Supabase y Tailwind CSS para un rendimiento ultrarrápido"
                  : "Built with Next.js, Supabase, and Tailwind CSS for lightning-fast performance",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">
            {lang === "es"
              ? "¿Listo para dejar de adivinar y empezar a mejorar?"
              : "Ready to stop guessing and start improving?"}
          </h2>
          <p className="mt-3 text-zinc-500">
            {lang === "es"
              ? "Únete a los que ya construyen hábitos más inteligentes con datos reales."
              : "Join those already building smarter habits with real data."}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
          >
            {lang === "es" ? "Empieza Gratis Hoy" : "Start Free Today"}
          </Link>
        </section>
      </main>
    </>
  );
}
