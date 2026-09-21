"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, Goal, GoalMiss } from "@/lib/types";
import { toLocalDateKey } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { generateInsights, getGoalInsights, type BehavioralInsights } from "@/lib/analytics/insights";
import { GoalHealthBadge } from "@/components/GoalHealthBadge";
import { ContributionGraph } from "@/components/ContributionGraph";

const HISTORY_DAYS = 90;

export default function InsightsPage() {
  const [insights, setInsights] = useState<BehavioralInsights | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLang();
  const todayKey = toLocalDateKey();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: goalsData }, { data: logsData }, { data: missesData }] = await Promise.all([
        supabase.from("goals").select("*"),
        supabase.from("goal_daily_logs").select("*"),
        supabase.from("goal_misses").select("*"),
      ]);

      const allGoals = (goalsData as Goal[] | null) ?? [];
      const allLogs = (logsData as DailyLog[] | null) ?? [];
      const allMisses = (missesData as GoalMiss[] | null) ?? [];

      const result = generateInsights({
        goals: allGoals,
        logs: allLogs,
        misses: allMisses,
        todayKey,
        lookbackDays: HISTORY_DAYS,
      });

      setGoals(allGoals);
      setLogs(allLogs);
      setInsights(result);
      setLoading(false);
    })();
  }, [todayKey]);

  const activeGoals = goals.filter((g) => !g.archived);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.insights.title}</h1>
        <Link
          href="/weekly-review"
          className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {lang === "es" ? "📅 Resumen Semanal" : "📅 Weekly Review"}
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">{t.insights.calculating}</p>
      ) : insights ? (
        <>
          {/* Streak + Completion rate */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-white">
              <p className="text-sm opacity-90">{t.insights.streak}</p>
              <p className="text-4xl font-bold">🔥 {insights.streak} {insights.streak === 1 ? t.insights.day : t.insights.days}</p>
              <p className="text-xs opacity-80">{lang === "es" ? "mejor racha: " : "longest: "}{insights.longestStreak}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
              <p className="text-sm opacity-90">{lang === "es" ? "Tasa completado" : "Completion rate"}</p>
              <p className="text-4xl font-bold">{insights.completionRate}%</p>
              <p className="text-xs opacity-80">
                {insights.trend === "improving" ? "↑ " : insights.trend === "declining" ? "↓ " : "→ "}
                {insights.trend === "improving" ? (lang === "es" ? "Mejorando" : "Improving") :
                 insights.trend === "declining" ? (lang === "es" ? "Bajando" : "Declining") :
                 (lang === "es" ? "Estable" : "Stable")}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800">
              <p className="text-xs text-zinc-500">{lang === "es" ? "Adherencia" : "Adherence"}</p>
              <p className="text-xl font-bold">{insights.scheduleAdherence}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800">
              <p className="text-xs text-zinc-500">{lang === "es" ? "Fallos" : "Misses"}</p>
              <p className="text-xl font-bold">{insights.recentMisses}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800">
              <p className="text-xs text-zinc-500">{lang === "es" ? "Min/Sesión" : "Min/Session"}</p>
              <p className="text-xl font-bold">{insights.averageSessionMinutes}</p>
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="mt-6">
            <h2 className="font-semibold">{t.insights.lastDays(HISTORY_DAYS)}</h2>
            <div className="mt-3">
              <ContributionGraph
                goals={goals}
                logs={logs}
                days={HISTORY_DAYS}
              />
            </div>
          </div>

          {/* Best days */}
          {insights.bestDays.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold">{lang === "es" ? "Mejores días" : "Best days"}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.bestDays.slice(0, 3).map((d) => {
                  const dayNames = lang === "es"
                    ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
                    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  return (
                    <span key={d.day} className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      {dayNames[d.day]} {d.rate}%
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Common failure reasons */}
          {insights.commonFailureReasons.length > 0 && (
            <div className="mt-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="font-semibold">{lang === "es" ? "Razones de fallo" : "Miss reasons"}</h2>
              <div className="mt-2 space-y-1">
                {insights.commonFailureReasons.map((r) => (
                  <div key={r.reason} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{r.reason.replace(/_/g, " ")}</span>
                    <span className="font-medium text-zinc-500">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-goal stats with health */}
          <h2 className="mt-6 font-semibold">{t.insights.perGoal}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {activeGoals.map((goal) => {
              const goalInsight = getGoalInsights(goal, logs, todayKey);
              return (
                <li key={goal.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: goal.color }} />
                    <p className="flex-1 font-semibold">{goal.title}</p>
                    <GoalHealthBadge health={goalInsight.health} />
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, goalInsight.completionRate)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {goalInsight.completionRate}% · 🔥 {goalInsight.streak.current} {lang === "es" ? "días" : "days"}
                  </p>
                </li>
              );
            })}
          </ul>
          {activeGoals.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">
              {t.insights.noGoals} <Link href="/goals" className="font-semibold text-indigo-600">{t.insights.createOne}</Link>
            </p>
          )}
        </>
      ) : null}
    </main>
  );
}
