"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, Goal, GoalMiss } from "@/lib/types";
import { toLocalDateKey } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { generateInsights } from "@/lib/analytics/insights";
import { generateWeeklyReview, type WeeklyReview } from "@/lib/analytics/weekly-review";

export default function WeeklyReviewPage() {
  const { lang, t } = useLang();
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const todayKey = toLocalDateKey();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: goals }, { data: logs }, { data: misses }] = await Promise.all([
        supabase.from("goals").select("*"),
        supabase.from("goal_daily_logs").select("*"),
        supabase.from("goal_misses").select("*"),
      ]);

      const allGoals = (goals as Goal[] | null) ?? [];
      const allLogs = (logs as DailyLog[] | null) ?? [];
      const allMisses = (misses as GoalMiss[] | null) ?? [];

      const insights = generateInsights({
        goals: allGoals,
        logs: allLogs,
        misses: allMisses,
        todayKey,
      });

      const weeklyReview = generateWeeklyReview({
        goals: allGoals,
        logs: allLogs,
        misses: allMisses,
        todayKey,
        insights,
      });

      setReview(weeklyReview);
      setLoading(false);
    })();
  }, [todayKey]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-center text-zinc-500">{t.insights.calculating}</p>
      </main>
    );
  }

  if (!review) return null;

  const changePrefix = review.changeFromLastWeek > 0 ? "+" : "";
  const changeColor =
    review.changeFromLastWeek > 0
      ? "text-green-600 dark:text-green-400"
      : review.changeFromLastWeek < 0
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-500";

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">
        {lang === "es" ? "Resumen Semanal" : "Weekly Review"}
      </h1>
      <p className="text-sm text-zinc-500">
        {review.weekStart} → {review.weekEnd}
      </p>

      {/* Main stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white">
          <p className="text-sm opacity-90">
            {lang === "es" ? "Tasa de completado" : "Completion rate"}
          </p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-4xl font-bold">{review.completionPercentage}%</p>
            <p className={`text-sm font-medium ${changeColor}`}>
              {changePrefix}{review.changeFromLastWeek}%
            </p>
          </div>
          <p className="mt-1 text-xs opacity-75">
            {lang === "es" ? "vs semana anterior" : "vs last week"}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
          <p className="text-sm opacity-90">{t.insights.streak}</p>
          <p className="mt-2 text-4xl font-bold">🔥 {review.streak}</p>
          <p className="mt-1 text-xs opacity-75">
            {lang === "es" ? "días consecutivos" : "consecutive days"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase text-zinc-500">
            {lang === "es" ? "Objetivos completados" : "Goals completed"}
          </p>
          <p className="mt-1 text-2xl font-bold">{review.goalsCompleted}</p>
          <p className="text-xs text-zinc-500">
            {lang === "es" ? "de" : "of"} {review.totalGoals}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase text-zinc-500">
            {lang === "es" ? "Tiempo registrado" : "Time logged"}
          </p>
          <p className="mt-1 text-2xl font-bold">{review.totalMinutesLogged} min</p>
        </div>
      </div>

      {/* Best day */}
      {review.bestDay && (
        <div className="mt-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase text-zinc-500">
            {lang === "es" ? "Mejor día" : "Best day"}
          </p>
          <p className="mt-1 text-lg font-semibold">{review.bestDay}</p>
        </div>
      )}

      {/* Best goal */}
      {review.bestGoal && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <p className="text-xs font-medium uppercase text-green-600 dark:text-green-400">
            {lang === "es" ? "Mejor objetivo" : "Best goal"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-3 w-1.5 rounded-full" style={{ backgroundColor: review.bestGoal.goal.color }} />
            <p className="font-semibold">{review.bestGoal.goal.title}</p>
            <span className="ml-auto text-sm font-bold text-green-600 dark:text-green-400">
              {review.bestGoal.completionRate}%
            </span>
          </div>
        </div>
      )}

      {/* Goals needing attention */}
      {review.goalsNeedingAttention.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-xs font-medium uppercase text-amber-600 dark:text-amber-400">
            {lang === "es" ? "Necesitan atención" : "Needs attention"}
          </p>
          <ul className="mt-2 space-y-2">
            {review.goalsNeedingAttention.map((g) => (
              <li key={g.goal.id} className="flex items-center gap-2">
                <span className="h-3 w-1.5 rounded-full" style={{ backgroundColor: g.goal.color }} />
                <p className="flex-1 text-sm font-medium">{g.goal.title}</p>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {g.completionRate}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common failure reason */}
      {review.commonFailureReason && (
        <div className="mt-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase text-zinc-500">
            {lang === "es" ? "Razón más común de fallo" : "Most common miss reason"}
          </p>
          <p className="mt-1 text-sm font-medium capitalize">
            {review.commonFailureReason.replace(/_/g, " ")}
          </p>
        </div>
      )}

      {/* Advanced (Pro) section */}
      {review.advanced && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-300">
            {lang === "es" ? "Análisis Avanzado" : "Advanced Analysis"}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {lang === "es" ? "Mejor día" : "Top performing day"}
              </p>
              <p className="font-semibold">{review.advanced.topPerformingDay}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {lang === "es" ? "Promedio por sesión" : "Avg session"}
              </p>
              <p className="font-semibold">{review.advanced.averageSessionMinutes} min</p>
            </div>
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {lang === "es" ? "Adherencia" : "Schedule adherence"}
              </p>
              <p className="font-semibold">{review.advanced.scheduleAdherence}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {lang === "es" ? "Volver a Hoy" : "Back to Today"}
        </Link>
        <Link
          href="/insights"
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700"
        >
          {t.nav.insights}
        </Link>
      </div>
    </main>
  );
}
