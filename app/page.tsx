"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, Goal, GoalWithLog } from "@/lib/types";
import { formatDateKey, isGoalActiveOn, toLocalDateKey } from "@/lib/dates";
import { ProgressRing } from "@/components/ProgressRing";

async function fetchToday(todayKey: string): Promise<GoalWithLog[]> {
  const supabase = createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("archived", false)
    .order("created_at");
  const { data: logs } = await supabase
    .from("goal_daily_logs")
    .select("*")
    .eq("log_date", todayKey);

  const logByGoal = new Map((logs as DailyLog[] | null ?? []).map((l) => [l.goal_id, l]));
  const vigentes = ((goals as Goal[] | null) ?? []).filter((g) => isGoalActiveOn(g, todayKey));
  return vigentes.map((g) => ({ ...g, log: logByGoal.get(g.id) ?? null }));
}

export default function TodayPage() {
  const [items, setItems] = useState<GoalWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const todayKey = toLocalDateKey();

  useEffect(() => {
    let ignore = false;
    fetchToday(todayKey).then((data) => {
      if (ignore) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, [todayKey]);

  async function toggle(item: GoalWithLog) {
    const supabase = createClient();
    const completed = !(item.log?.completed ?? false);
    const payload = {
      goal_id: item.id,
      log_date: todayKey,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };
    // Actualización optimista.
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, log: { ...(i.log as DailyLog), ...payload, time_spent_seconds: i.log?.time_spent_seconds ?? 0 } as DailyLog }
          : i,
      ),
    );
    const { error } = await supabase
      .from("goal_daily_logs")
      .upsert(payload, { onConflict: "goal_id,log_date" });
    if (error) fetchToday(todayKey).then(setItems); // revertir ante error
  }

  const done = items.filter((i) => i.log?.completed).length;
  const percent = items.length === 0 ? 0 : (done / items.length) * 100;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">{formatDateKey(todayKey)}</h1>
          <p className="text-sm text-zinc-500">
            {done} de {items.length} objetivos completados
          </p>
        </div>
        <ProgressRing percent={percent} />
      </div>

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="font-medium">No hay objetivos vigentes hoy.</p>
          <Link href="/goals" className="mt-2 inline-block font-semibold text-indigo-600">
            Crear tu primer objetivo →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) => {
            const checked = item.log?.completed ?? false;
            return (
              <li
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border p-4 ${
                  checked
                    ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <button
                  onClick={() => void toggle(item)}
                  aria-label={checked ? "Desmarcar" : "Completar"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                    checked
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {checked && "✓"}
                </button>
                <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${checked ? "line-through text-zinc-400" : ""}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.allocated_minutes} min · {item.category}
                    {(item.log?.time_spent_seconds ?? 0) > 0 &&
                      ` · ${Math.round((item.log?.time_spent_seconds ?? 0) / 60)} min registrados`}
                  </p>
                </div>
                <Link
                  href={`/focus/${item.id}`}
                  className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  ▶ Focus
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
