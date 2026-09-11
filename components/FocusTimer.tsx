"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { formatSeconds } from "@/lib/dates";
import { playAlarm } from "@/lib/alarm";

interface Props {
  totalSeconds: number;
  onFinish: (elapsedSeconds: number) => void;
  onTickPersist?: (elapsedSeconds: number) => void;
}

type Phase = "idle" | "running" | "paused" | "done";

/**
 * Countdown exacto basado en timestamps: calcula el restante como
 * targetTime - Date.now(), así no deriva en segundo plano.
 */
export function FocusTimer({ totalSeconds, onFinish, onTickPersist }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(totalSeconds);
  const targetRef = useRef<number>(0);
  const pausedRemainingRef = useRef(totalSeconds);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        if (!finishedRef.current) {
          finishedRef.current = true;
          setPhase("done");
          playAlarm();
          onFinish(totalSeconds);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, totalSeconds, onFinish]);

  function start() {
    finishedRef.current = false;
    pausedRemainingRef.current = totalSeconds;
    setRemaining(totalSeconds);
    targetRef.current = Date.now() + totalSeconds * 1000;
    setPhase("running");
  }

  function pause() {
    pausedRemainingRef.current = remaining;
    setPhase("paused");
    onTickPersist?.(totalSeconds - remaining);
  }

  function resume() {
    targetRef.current = Date.now() + pausedRemainingRef.current * 1000;
    setPhase("running");
  }

  function reset() {
    if (phase === "running" || phase === "paused") {
      onTickPersist?.(totalSeconds - remaining);
    }
    pausedRemainingRef.current = totalSeconds;
    setRemaining(totalSeconds);
    setPhase("idle");
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
            aria-label="Iniciar focus"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl text-white shadow-lg hover:bg-indigo-500"
          >
            ▶
          </button>
        )}
        {phase === "running" && (
          <button onClick={pause} className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white hover:bg-amber-400">
            Pausar
          </button>
        )}
        {phase === "paused" && (
          <button onClick={resume} className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-500">
            Continuar
          </button>
        )}
        {(phase === "running" || phase === "paused") && (
          <button onClick={reset} className="rounded-xl border border-zinc-300 px-8 py-3 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
            Reiniciar
          </button>
        )}
        {phase === "done" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl font-bold text-green-600">¡Sesión completada! 🎉</p>
            <button onClick={start} className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-500">
              Repetir
            </button>
          </div>
        )}
      </div>
      {phase === "idle" && (
        <p className="-mt-3 text-sm text-zinc-500">Pulsa ▶ para iniciar — el tiempo no corre hasta entonces</p>
      )}
    </div>
  );
}
