"use client";

import { useMemo } from "react";
import type { Goal, DailyLog } from "@/lib/types";
import { isGoalActiveOn, addDays } from "@/lib/dates";
import { useLang } from "@/lib/i18n";

interface ContributionGraphProps {
  goals: Goal[];
  logs: DailyLog[];
  days?: number;
  filterGoalId?: string | null;
  filterCategory?: string | null;
  onDayClick?: (date: string) => void;
}

interface DayData {
  date: string;
  total: number;
  done: number;
  completedGoals: string[];
}

export function ContributionGraph({
  goals,
  logs,
  days = 30,
  filterGoalId = null,
  filterCategory = null,
  onDayClick,
}: ContributionGraphProps) {
  const { lang } = useLang();
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const data = useMemo(() => {
    const logsByDay = new Map<string, DailyLog[]>();
    for (const log of logs) {
      const arr = logsByDay.get(log.log_date) ?? [];
      arr.push(log);
      logsByDay.set(log.log_date, arr);
    }

    const filtered = goals.filter((g) => {
      if (g.archived) return false;
      if (filterGoalId && g.id !== filterGoalId) return false;
      if (filterCategory && g.category !== filterCategory) return false;
      return true;
    });

    const result: DayData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(todayKey, -i);
      const activeGoals = filtered.filter(
        (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
      );
      const dayLogs = logsByDay.get(date) ?? [];
      const completedGoals = dayLogs
        .filter((l) => l.completed)
        .map((l) => l.goal_id)
        .filter((id) => activeGoals.some((g) => g.id === id));

      result.push({
        date,
        total: activeGoals.length,
        done: completedGoals.length,
        completedGoals,
      });
    }
    return result;
  }, [goals, logs, days, todayKey, filterGoalId, filterCategory]);

  // Stats
  const stats = useMemo(() => {
    const daysWithGoals = data.filter((d) => d.total > 0);
    const daysCompleted = daysWithGoals.filter((d) => d.done >= d.total);
    const totalGoals = daysWithGoals.reduce((a, d) => a + d.total, 0);
    const totalCompleted = daysWithGoals.reduce((a, d) => a + Math.min(d.done, d.total), 0);

    // Best month
    const monthMap = new Map<string, { active: number; done: number }>();
    for (const d of data) {
      if (d.total === 0) continue;
      const month = d.date.slice(0, 7);
      const stat = monthMap.get(month) ?? { active: 0, done: 0 };
      stat.active += d.total;
      stat.done += Math.min(d.done, d.total);
      monthMap.set(month, stat);
    }
    let bestMonth = "";
    let bestMonthRate = 0;
    for (const [month, stat] of monthMap) {
      const rate = stat.active > 0 ? stat.done / stat.active : 0;
      if (rate > bestMonthRate) {
        bestMonthRate = rate;
        bestMonth = month;
      }
    }

    return {
      daysWithGoals: daysWithGoals.length,
      daysCompleted: daysCompleted.length,
      completionRate: totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0,
      bestMonth,
    };
  }, [data]);

  const avgCompletion = data.filter((d) => d.total > 0).length > 0
    ? Math.round(
        (data.filter((d) => d.total > 0 && d.done >= d.total).length /
          data.filter((d) => d.total > 0).length) *
          100,
      )
    : 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Stats — left column */}
      <div className="flex shrink-0 flex-col gap-1.5 sm:w-36">
        <div className="rounded-lg bg-zinc-50 p-2 text-center dark:bg-zinc-900">
          <p className="text-[10px] text-zinc-500">{lang === "es" ? "Días activos" : "Active days"}</p>
          <p className="text-sm font-bold">{stats.daysWithGoals}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 text-center dark:bg-zinc-900">
          <p className="text-[10px] text-zinc-500">{lang === "es" ? "Completados" : "Completed"}</p>
          <p className="text-sm font-bold">{stats.daysCompleted}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 text-center dark:bg-zinc-900">
          <p className="text-[10px] text-zinc-500">{lang === "es" ? "Promedio" : "Average"}</p>
          <p className="text-sm font-bold">{avgCompletion}%</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 text-center dark:bg-zinc-900">
          <p className="text-[10px] text-zinc-500">{lang === "es" ? "Mejor mes" : "Best month"}</p>
          <p className="text-sm font-bold">{stats.bestMonth || "—"}</p>
        </div>
      </div>

      {/* Graph — right column */}
      <div className="grid flex-1 grid-cols-7 gap-px">
        {data.map((d) => {
          const pct = d.total === 0 ? -1 : d.done / d.total;
          const bg =
            pct < 0
              ? "bg-zinc-100 dark:bg-zinc-900"
              : pct >= 1
                ? "bg-green-500"
                : pct >= 0.5
                  ? "bg-green-300 dark:bg-green-800"
                  : pct > 0
                    ? "bg-green-100 dark:bg-green-950"
                    : "bg-zinc-200 dark:bg-zinc-800";
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onDayClick?.(d.date)}
              title={`${d.date}: ${d.done}/${d.total}`}
              className={`aspect-square rounded-sm ${bg} transition-transform hover:scale-110 ${
                onDayClick ? "cursor-pointer" : "cursor-default"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
