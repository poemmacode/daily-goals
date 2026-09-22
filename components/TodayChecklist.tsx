"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Goal, DailyLog } from "@/lib/types";
import { toLocalDateKey, isGoalActiveOn } from "@/lib/dates";
import { useLang } from "@/lib/i18n";

export function TodayChecklist() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { t } = useLang();
  const todayKey = toLocalDateKey();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const [{ data: goalsData }, { data: logsData }] = await Promise.all([
        supabase.from("goals").select("*").order("created_at"),
        supabase.from("goal_daily_logs").select("*").eq("log_date", todayKey),
      ]);
      if (!cancelled) {
        setGoals((goalsData as Goal[] | null) ?? []);
        setLogs((logsData as DailyLog[] | null) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [todayKey]);

  const activeGoals = goals.filter(
    (g) => !g.archived && isGoalActiveOn(g, todayKey) && g.created_at.slice(0, 10) <= todayKey,
  );
  const logsMap = new Map(logs.map((l) => [l.goal_id, l]));
  const doneCount = activeGoals.filter((g) => logsMap.get(g.id)?.completed).length;

  async function toggleGoal(goal: Goal) {
    const existing = logsMap.get(goal.id);
    const completed = !existing?.completed;
    setSaving(goal.id);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("goal_daily_logs").upsert(
      {
        goal_id: goal.id,
        user_id: user.id,
        log_date: todayKey,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        time_spent_seconds: existing?.time_spent_seconds ?? 0,
      },
      { onConflict: "goal_id,log_date" },
    );

    setLogs((prev) => {
      const next = prev.filter((l) => l.goal_id !== goal.id);
      if (completed || existing) {
        next.push({
          id: existing?.id ?? "",
          goal_id: goal.id,
          user_id: user.id,
          log_date: todayKey,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          time_spent_seconds: existing?.time_spent_seconds ?? 0,
        } as DailyLog);
      }
      return next;
    });
    setSaving(null);
  }

  if (loading) {
    return <p className="mt-8 text-center text-zinc-500">{t.today.loading}</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.nav.today}</h1>
        <span className="text-sm text-zinc-500">
          {t.today.completedOf(doneCount, activeGoals.length)}
        </span>
      </div>

      {activeGoals.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-zinc-500">{t.today.empty}</p>
          <Link href="/goals" className="mt-2 inline-block font-semibold text-indigo-600">
            {t.today.createFirst}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {activeGoals.map((goal) => {
            const log = logsMap.get(goal.id);
            const completed = log?.completed ?? false;
            const minutes = Math.round((log?.time_spent_seconds ?? 0) / 60);
            return (
              <li
                key={goal.id}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                  completed
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal)}
                  disabled={saving === goal.id}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                    completed
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-zinc-300 hover:border-indigo-400 dark:border-zinc-600"
                  }`}
                  aria-label={completed ? t.today.uncheck : t.today.check}
                >
                  {completed && "✓"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-1 rounded-full" style={{ backgroundColor: goal.color }} />
                    <p className={`truncate font-medium ${completed ? "text-zinc-400 line-through" : ""}`}>
                      {goal.title}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {goal.allocated_minutes} {t.today.min}
                    {minutes > 0 && (
                      <span className="text-zinc-400">{t.today.recorded(minutes)}</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/focus/${goal.id}`}
                  className="shrink-0 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                  {t.today.focus}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
