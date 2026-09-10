"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, Goal } from "@/lib/types";
import { addDays, isGoalActiveOn, toLocalDateKey } from "@/lib/dates";

interface DayStat {
  date: string;
  total: number;
  done: number;
}

interface GoalStat {
  goal: Goal;
  elapsed: number;
  done: number;
  plannedMinutes: number;
  actualMinutes: number;
}

const HISTORY_DAYS = 30;

export default function InsightsPage() {
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<DayStat[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const today = toLocalDateKey();
      const start = addDays(today, -(HISTORY_DAYS - 1));

      const [{ data: goals }, { data: logs }] = await Promise.all([
        supabase.from("goals").select("*"),
        supabase.from("goal_daily_logs").select("*").gte("log_date", start).lte("log_date", today),
      ]);
      const allGoals = (goals as Goal[] | null) ?? [];
      const allLogs = (logs as DailyLog[] | null) ?? [];
      const logsByDay = new Map<string, DailyLog[]>();
      for (const l of allLogs) {
        const arr = logsByDay.get(l.log_date) ?? [];
        arr.push(l);
        logsByDay.set(l.log_date, arr);
      }

      // Historial por día: vigentes vs completados.
      const days: DayStat[] = [];
      for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
        const date = addDays(today, -i);
        const vigentes = allGoals.filter((g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date);
        const done = (logsByDay.get(date) ?? []).filter((l) => l.completed).length;
        days.push({ date, total: vigentes.length, done: Math.min(done, vigentes.length) });
      }

      // Racha: días consecutivos al 100% terminando hoy (o ayer si hoy va incompleto).
      let s = 0;
      const ordered = [...days].reverse();
      if (ordered[0].total > 0 && ordered[0].done < ordered[0].total) ordered.shift();
      for (const d of ordered) {
        if (d.total === 0) continue;
        if (d.done >= d.total) s++;
        else break;
      }

      // Stats por objetivo.
      const stats: GoalStat[] = allGoals
        .filter((g) => !g.archived)
        .map((goal) => {
          const goalLogs = allLogs.filter((l) => l.goal_id === goal.id);
          let elapsed = 0;
          for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
            const date = addDays(today, -i);
            if (isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date) elapsed++;
          }
          return {
            goal,
            elapsed,
            done: goalLogs.filter((l) => l.completed).length,
            plannedMinutes: elapsed * goal.allocated_minutes,
            actualMinutes: Math.round(goalLogs.reduce((a, l) => a + l.time_spent_seconds, 0) / 60),
          };
        });

      setHistory(days);
      setStreak(s);
      setGoalStats(stats);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Insights</h1>

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">Calculando…</p>
      ) : (
        <>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-white">
            <p className="text-sm opacity-90">Racha actual</p>
            <p className="text-4xl font-bold">🔥 {streak} {streak === 1 ? "día" : "días"}</p>
            <p className="text-xs opacity-80">Días consecutivos al 100%</p>
          </div>

          <h2 className="mt-8 font-semibold">Últimos {HISTORY_DAYS} días</h2>
          <div className="mt-3 grid grid-cols-10 gap-1.5">
            {history.map((d) => {
              const pct = d.total === 0 ? -1 : d.done / d.total;
              const bg =
                pct < 0 ? "bg-zinc-100 dark:bg-zinc-900"
                : pct >= 1 ? "bg-green-500"
                : pct >= 0.5 ? "bg-green-300 dark:bg-green-800"
                : pct > 0 ? "bg-green-100 dark:bg-green-950"
                : "bg-zinc-200 dark:bg-zinc-800";
              return <div key={d.date} title={`${d.date}: ${d.done}/${d.total}`} className={`aspect-square rounded ${bg}`} />;
            })}
          </div>

          <h2 className="mt-8 font-semibold">Por objetivo</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {goalStats.map((s) => {
              const rate = s.elapsed === 0 ? 0 : Math.round((s.done / s.elapsed) * 100);
              return (
                <li key={s.goal.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: s.goal.color }} />
                    <p className="flex-1 font-semibold">{s.goal.title}</p>
                    <span className="text-sm font-bold">{rate}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, rate)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {s.done}/{s.elapsed} días · {s.actualMinutes} de {s.plannedMinutes} min
                  </p>
                </li>
              );
            })}
          </ul>
          {goalStats.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">
              Aún no hay objetivos. <Link href="/goals" className="font-semibold text-indigo-600">Crea uno →</Link>
            </p>
          )}
        </>
      )}
    </main>
  );
}
