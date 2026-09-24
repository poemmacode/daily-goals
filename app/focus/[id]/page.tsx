"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";
import { toLocalDateKey } from "@/lib/dates";
import { linkify } from "@/lib/linkify";
import { useLang } from "@/lib/i18n";
import { isSessionExpired, readFocusSession, type FocusSession } from "@/lib/focus-session";
import { FocusTimer } from "@/components/FocusTimer";

export default function FocusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const { t } = useLang();
  // ¿Hay una sesión en curso de OTRO goal? Avisar para no correr dos timers.
  const [otherSession] = useState<FocusSession | null>(() => {
    const s = readFocusSession();
    return s && s.goalId !== id && !isSessionExpired(s) ? s : null;
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("goals").select("*").eq("id", id).single();
      setGoal((data as Goal | null) ?? null);
      setLoading(false);
    })();
  }, [id]);

  /** Acumula segundos reales en el log del día. Si finished=true marca completado. */
  const persist = useCallback(
    async (elapsedSeconds: number, finished: boolean) => {
      if (elapsedSeconds <= 0 && !finished) return;
      const supabase = createClient();
      const todayKey = toLocalDateKey();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: existing } = await supabase
        .from("goal_daily_logs")
        .select("id,time_spent_seconds")
        .eq("goal_id", id)
        .eq("log_date", todayKey)
        .maybeSingle();

      const prev = (existing?.time_spent_seconds as number | undefined) ?? 0;
      const payload = {
        goal_id: id,
        user_id: user.id,
        log_date: todayKey,
        time_spent_seconds: prev + elapsedSeconds,
        ...(finished
          ? { completed: true, completed_at: new Date().toISOString() }
          : {}),
      };
      await supabase.from("goal_daily_logs").upsert(payload, { onConflict: "goal_id,log_date" });
      if (finished) {
        // Completado automático: sin confirmación manual, regresa al día.
        setSavedMsg(t.focus.savedDone);
        setTimeout(() => router.push("/today"), 3000);
      } else {
        setSavedMsg(t.focus.savedTime(Math.round(elapsedSeconds / 60)));
      }
    },
    [id, router, t],
  );

  if (loading) return <p className="mt-16 text-center text-zinc-500">{t.focus.loading}</p>;
  if (!goal)
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>{t.focus.notFound}</p>
        <Link href="/today" className="font-semibold text-indigo-600">{t.focus.backToday}</Link>
      </main>
    );

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-8">
      <button onClick={() => router.push("/today")} className="self-start text-sm text-zinc-500 hover:underline">
        {t.focus.back}
      </button>
      <span className="mt-4 h-2 w-24 rounded-full" style={{ backgroundColor: goal.color }} />
      <h1 className="mt-2 text-center text-2xl font-bold">{goal.title}</h1>
      <p className="text-sm text-zinc-500">{t.focus.sessionOf(goal.allocated_minutes)}</p>

      {otherSession && (
        <p className="mt-4 rounded-xl bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {t.focus.otherSession}{" "}
          <Link href={`/focus/${otherSession.goalId}`} className="font-semibold underline">
            {t.focus.backToIt}
          </Link>
        </p>
      )}

      {goal.notes && (
        <details className="mt-4 w-full rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800" open>
          <summary className="cursor-pointer font-semibold">{t.focus.resources}</summary>
          <p className="mt-2 whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
            {linkify(goal.notes)}
          </p>
        </details>
      )}

      <div className="mt-8">
        <FocusTimer
          goalId={goal.id}
          totalSeconds={goal.allocated_minutes * 60}
          onFinish={(elapsed) => void persist(elapsed, true)}
          onTickPersist={(elapsed) => void persist(elapsed, false)}
        />
      </div>

      {savedMsg && (
        <p className="mt-6 rounded-xl bg-green-100 px-4 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          {savedMsg}
        </p>
      )}
    </main>
  );
}
