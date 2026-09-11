"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { formatSeconds } from "@/lib/dates";
import { playAlarm } from "@/lib/alarm";
import {
  clearFocusSession,
  isSessionExpired,
  readFocusSession,
  sessionRemaining,
  writeFocusSession,
} from "@/lib/focus-session";
import { useLang } from "@/lib/i18n";

interface Props {
  goalId: string;
  totalSeconds: number;
  onFinish: (elapsedSeconds: number) => void;
  onTickPersist?: (elapsedSeconds: number) => void;
}

type Phase = "idle" | "running" | "paused" | "done" | "expired";

interface Restored {
  phase: Phase;
  remaining: number;
  targetTs: number;
  pausedRemaining: number;
}

/** Sesión previa de este goal (tras cerrar la pestaña). null si no hay. */
function getRestored(goalId: string, totalSeconds: number): Restored | null {
  const s = readFocusSession();
  if (!s || s.goalId !== goalId || s.totalSeconds !== totalSeconds) return null;
  if (isSessionExpired(s)) return { phase: "expired", remaining: 0, targetTs: 0, pausedRemaining: 0 };
  if (s.phase === "paused") {
    const r = sessionRemaining(s);
    return { phase: "paused", remaining: r, targetTs: 0, pausedRemaining: r };
  }
  return { phase: "running", remaining: sessionRemaining(s), targetTs: s.targetTs, pausedRemaining: s.totalSeconds };
}

/**
 * Countdown exacto basado en timestamps: calcula el restante como
 * targetTime - Date.now(), así no deriva en segundo plano.
 * La sesión se persiste en localStorage para sobrevivir cierres de pestaña.
 */
export function FocusTimer({ goalId, totalSeconds, onFinish, onTickPersist }: Props) {
  const { t } = useLang();
  // Restaurar sesión previa de este goal (p. ej. tras cerrar la pestaña).
  const [restored] = useState<Restored | null>(() => getRestored(goalId, totalSeconds));
  const [phase, setPhase] = useState<Phase>(restored?.phase ?? "idle");
  const [remaining, setRemaining] = useState(restored?.remaining ?? totalSeconds);
  const targetRef = useRef<number>(restored?.targetTs ?? 0);
  const pausedRemainingRef = useRef(restored?.pausedRemaining ?? totalSeconds);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        finish();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, totalSeconds]);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearFocusSession();
    setPhase("done");
    playAlarm();
    onFinish(totalSeconds);
  }

  function persistSession(phase: "running" | "paused", targetTs: number, pausedRemaining: number) {
    writeFocusSession({ goalId, totalSeconds, targetTs, phase, pausedRemaining });
  }

  function start() {
    // Anti doble-start: si otra pestaña ya inició este goal, adoptar esa sesión.
    const existing = readFocusSession();
    if (existing && existing.goalId === goalId && !isSessionExpired(existing)) {
      if (existing.phase === "paused") {
        const r = sessionRemaining(existing);
        pausedRemainingRef.current = r;
        setRemaining(r);
        setPhase("paused");
      } else {
        targetRef.current = existing.targetTs;
        setRemaining(sessionRemaining(existing));
        setPhase("running");
      }
      return;
    }
    finishedRef.current = false;
    pausedRemainingRef.current = totalSeconds;
    setRemaining(totalSeconds);
    targetRef.current = Date.now() + totalSeconds * 1000;
    persistSession("running", targetRef.current, totalSeconds);
    setPhase("running");
  }

  function pause() {
    pausedRemainingRef.current = remaining;
    persistSession("paused", Date.now(), remaining);
    setPhase("paused");
    onTickPersist?.(totalSeconds - remaining);
  }

  function resume() {
    targetRef.current = Date.now() + pausedRemainingRef.current * 1000;
    persistSession("running", targetRef.current, pausedRemainingRef.current);
    setPhase("running");
  }

  function reset() {
    if (phase === "running" || phase === "paused") {
      onTickPersist?.(totalSeconds - remaining);
    }
    clearFocusSession();
    pausedRemainingRef.current = totalSeconds;
    setRemaining(totalSeconds);
    setPhase("idle");
  }

  /** Sesión vencida fuera de la app: completa con gesto (la alarma necesita interacción). */
  function completeExpired() {
    finish();
  }

  const percent = totalSeconds === 0 ? 0 : (remaining / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <ProgressRing
        percent={100 - percent}
        size={240}
        stroke={16}
        label={formatSeconds(remaining)}
      />
      <div className="flex gap-3">
        {phase === "idle" && (
          <button
            onClick={start}
            aria-label={t.timer.start}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl text-white shadow-lg hover:bg-indigo-500"
          >
            ▶
          </button>
        )}
        {phase === "running" && (
          <button onClick={pause} className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white hover:bg-amber-400">
            {t.timer.pause}
          </button>
        )}
        {phase === "paused" && (
          <button onClick={resume} className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-500">
            {t.timer.resume}
          </button>
        )}
        {(phase === "running" || phase === "paused") && (
          <button onClick={reset} className="rounded-xl border border-zinc-300 px-8 py-3 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
            {t.timer.reset}
          </button>
        )}
        {phase === "expired" && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-semibold text-amber-600">{t.timer.expired}</p>
            <button onClick={completeExpired} className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-500">
              {t.timer.markDone}
            </button>
          </div>
        )}
        {phase === "done" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl font-bold text-green-600">{t.timer.done}</p>
            <button onClick={start} className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-500">
              {t.timer.repeat}
            </button>
          </div>
        )}
      </div>
      {phase === "idle" && (
        <p className="-mt-3 text-sm text-zinc-500">{t.timer.startHint}</p>
      )}
      {phase === "paused" && (
        <p className="-mt-3 text-sm text-zinc-500">{t.timer.pausedHint}</p>
      )}
    </div>
  );
}
