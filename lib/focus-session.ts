/** Sesión de focus persistida en localStorage.
 *  Permite restaurar el cronómetro tras cerrar la pestaña: todo se calcula
 *  contra `targetTs`, así el restante ya descuenta el tiempo fuera.
 */

import { toLocalDateKey } from "./dates";

const KEY = "dg:focus-session";

export interface FocusSession {
  goalId: string;
  totalSeconds: number;
  /** Epoch ms en que termina (fase running) o terminó la base de pausa. */
  targetTs: number;
  phase: "running" | "paused";
  /** Restante en segundos al pausar (solo fase paused). */
  pausedRemaining: number;
  /** Día local YYYY-MM-DD en que se creó. Sesiones de otro día se ignoran. */
  logDate: string;
  updatedAt: number;
}

export function readFocusSession(): FocusSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as FocusSession;
    if (!s.goalId || !s.totalSeconds) return null;
    // Sesión de otro día (p. ej. pausa abandonada): no bloquea el día actual.
    if (!s.logDate || s.logDate !== toLocalDateKey()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function writeFocusSession(s: Omit<FocusSession, "updatedAt" | "logDate">): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...s, logDate: toLocalDateKey(), updatedAt: Date.now() }),
    );
  } catch {
    // Almacenamiento no disponible: la sesión vive solo en memoria.
  }
}

export function clearFocusSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}

/** ¿La sesión venció? Solo aplica a fase running con target en el pasado. */
export function isSessionExpired(s: FocusSession, now: number = Date.now()): boolean {
  return s.phase === "running" && s.targetTs <= now;
}

/** Restante en segundos para una sesión (0 si expiró). */
export function sessionRemaining(s: FocusSession, now: number = Date.now()): number {
  if (s.phase === "paused") return Math.max(0, Math.round(s.pausedRemaining));
  return Math.max(0, Math.round((s.targetTs - now) / 1000));
}
