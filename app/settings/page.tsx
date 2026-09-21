"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { getDevTier, setDevTier } from "@/lib/entitlements/access";
import type { Tier } from "@/lib/entitlements/features";
import { Feature, FEATURE_DESCRIPTIONS } from "@/lib/entitlements/features";

export default function SettingsPage() {
  const { lang } = useLang();
  const [tier, setTierState] = useState<Tier>(() => getDevTier());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("ai_openai_key") ?? "";
  });
  const [keySaved, setKeySaved] = useState(false);
  const [keySaving, setKeySaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? "" } : null);
      setLoading(false);
    });
  }, []);

  function handleTierChange(newTier: Tier) {
    setTierState(newTier);
    setDevTier(newTier);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-center text-zinc-500">{lang === "es" ? "Cargando..." : "Loading..."}</p>
      </main>
    );
  }

  const freeFeatures = [
    Feature.GOAL_CRUD,
    Feature.MILESTONES,
    Feature.TASKS,
    Feature.FOCUS_TIMER,
    Feature.CONTRIBUTION_GRAPH,
    Feature.STREAKS,
    Feature.BASIC_HEALTH,
    Feature.FAILURE_TRACKING,
    Feature.BASIC_INSIGHTS,
    Feature.WEEKLY_REVIEW_BASIC,
    Feature.GOAL_TEMPLATES,
  ];

  const proFeatures = [
    Feature.ADVANCED_ANALYTICS,
    Feature.ADAPTIVE_SCHEDULING,
    Feature.WEEKLY_REVIEW_PRO,
    Feature.GOAL_EXPERIMENTS,
    Feature.DATA_EXPORT,
    Feature.AI_GOAL_COACH,
    Feature.AI_WEEKLY_REVIEW,
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">{lang === "es" ? "Configuración" : "Settings"}</h1>

      {/* Profile */}
      <section className="mt-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="font-semibold">{lang === "es" ? "Perfil" : "Profile"}</h2>
        <p className="mt-1 text-sm text-zinc-500">{user?.email}</p>
      </section>

      {/* Subscription */}
      <section className="mt-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{lang === "es" ? "Suscripción" : "Subscription"}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tier === "pro"
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}>
            {tier === "pro" ? "PRO" : "FREE"}
          </span>
        </div>

        {/* Dev tier toggle */}
        <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {lang === "es" ? "Modo desarrollo" : "Development Mode"}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleTierChange("free")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tier === "free"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => handleTierChange("pro")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tier === "pro"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              Pro
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {lang === "es"
              ? "Alterna para probar funciones de Pro sin pago real."
              : "Toggle to test Pro features without real payment."}
          </p>
        </div>
      </section>

      {/* AI Settings */}
      <section className="mt-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="font-semibold">AI {lang === "es" ? "Configuración" : "Settings"}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {lang === "es"
            ? "Configura tu propia clave API de OpenAI para funciones de IA."
            : "Set up your own OpenAI API key for AI features."}
        </p>
        <div className="mt-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">
            {lang === "es"
              ? "Tu clave se usa para hacer solicitudes de IA. Los cargos se facturan directamente a tu cuenta de OpenAI."
              : "Your key is used to make AI requests. Fees are billed directly to your OpenAI account."}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setKeySaved(false);
              }}
              placeholder="sk-..."
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              onClick={() => {
                setKeySaving(true);
                if (apiKey.startsWith("sk-")) {
                  localStorage.setItem("ai_openai_key", apiKey);
                  setKeySaved(true);
                } else {
                  setKeySaved(false);
                }
                setKeySaving(false);
              }}
              disabled={keySaving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {lang === "es" ? "Guardar" : "Save"}
            </button>
          </div>
          {keySaved && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              {lang === "es" ? "Clave guardada ✓" : "Key saved ✓"}
            </p>
          )}
          {apiKey && !apiKey.startsWith("sk-") && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {lang === "es" ? "La clave debe empezar con sk-" : "Key must start with sk-"}
            </p>
          )}
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mt-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="font-semibold">{lang === "es" ? "Funciones" : "Features"}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-zinc-500">FREE</h3>
            <ul className="mt-2 space-y-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  {FEATURE_DESCRIPTIONS[f].title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">PRO</h3>
            <ul className="mt-2 space-y-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className={tier === "pro" ? "text-green-500" : "text-zinc-400"}>
                    {tier === "pro" ? "✓" : "🔒"}
                  </span>
                  <span className={tier === "pro" ? "" : "text-zinc-500"}>
                    {FEATURE_DESCRIPTIONS[f].title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
