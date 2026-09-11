"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, Goal, GoalWithLog } from "@/lib/types";
import { formatDateKey, formatMinutes, isGoalActiveOn, toLocalDateKey } from "@/lib/dates";
import { isSessionExpired, readFocusSession, type FocusSession } from "@/lib/focus-session";
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
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

  // Rastrear sesión de focus en curso (misma u otra pestaña) para bloquear ese goal.
  useEffect(() => {
    const sync = () => {
      const s = readFocusSession();
      setActiveSession(s && !isSessionExpired(s) ? s : null);
    };
    sync();
    const id = setInterval(sync, 1000);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function toggle(item: GoalWithLog) {
    // Goal con cronómetro en curso: no se puede marcar manual.
    if (activeSession?.goalId === item.id) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const completed = !(item.log?.completed ?? false);
    const payload = {
      goal_id: item.id,
      user_id: user.id,
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
    if (error) {
      fetchToday(todayKey).then(setItems); // revertir ante error
      setSaveError(`No se pudo guardar: ${error.message}`);
    } else {
      setSaveError(null);
    }
  }

  const done = items.filter((i) => i.log?.completed).length;
  const percent = items.length === 0 ? 0 : (done / items.length) * 100;
  const totalMinutes = items.reduce((a, i) => a + i.allocated_minutes, 0);
  const remainingMinutes = items.reduce((a, i) => {
    if (i.log?.completed) return a;
    const spent = Math.round((i.log?.time_spent_seconds ?? 0) / 60);
    return a + Math.max(0, i.allocated_minutes - spent);
  }, 0);

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

      {saveError && (
        <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
          {saveError}
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 p-4 text-center dark:bg-blue-950/40">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Tiempo total estimado
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
              {formatMinutes(totalMinutes)}
            </p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 text-center dark:bg-orange-950/40">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
              Tiempo restante
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-orange-500 dark:text-orange-400">
              {formatMinutes(remainingMinutes)}
            </p>
          </div>
        </div>
      )}

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
            const inProgress = activeSession?.goalId === item.id;
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
                  disabled={inProgress}
                  aria-label={checked ? "Desmarcar" : "Completar"}
                  title={inProgress ? "Cronómetro en curso: termina la sesión para completar" : undefined}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-lg disabled:cursor-not-allowed disabled:opacity-40 ${
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
                {inProgress ? (
                  <Link
                    href={`/focus/${item.id}`}
                    aria-label="Ver cronómetro en curso"
                    title="Ver cronómetro en curso"
                    className="shrink-0 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                  >
                    👁️ In progress
                  </Link>
                ) : (
                  <Link
                    href={`/focus/${item.id}`}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    ▶ Focus
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
