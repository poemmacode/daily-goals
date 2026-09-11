"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";
import { toLocalDateKey } from "@/lib/dates";
import { FocusTimer } from "@/components/FocusTimer";

export default function FocusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

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
        setSavedMsg("Sesión guardada y objetivo completado ✅ — volviendo a tu día…");
        setTimeout(() => router.push("/"), 3000);
      } else {
        setSavedMsg(
          `+${Math.round(elapsedSeconds / 60)} min registrados en hoy`,
        );
      }
    },
    [id, router],
  );

  if (loading) return <p className="mt-16 text-center text-zinc-500">Cargando…</p>;
  if (!goal)
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>Objetivo no encontrado.</p>
        <Link href="/" className="font-semibold text-indigo-600">Volver a hoy</Link>
      </main>
    );

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-8">
      <button onClick={() => router.push("/")} className="self-start text-sm text-zinc-500 hover:underline">
        ← Volver a hoy
      </button>
      <span className="mt-4 h-2 w-24 rounded-full" style={{ backgroundColor: goal.color }} />
      <h1 className="mt-2 text-center text-2xl font-bold">{goal.title}</h1>
      <p className="text-sm text-zinc-500">Sesión de {goal.allocated_minutes} minutos</p>

      <div className="mt-8">
        <FocusTimer
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
